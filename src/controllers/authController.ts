import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../prisma";
import sendVerificationEmail from '../utils/sendEmail';
import { otpTemplate } from '../utils/Template/verifyEmail';

dotenv.config();

interface AuthRequest extends Request {
    user?: any;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, otp } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const otpDetails = await prisma.otp.findFirst({
            where: { email, otp },
        });

        if (!otpDetails) {
            return res.status(404).json({
                success: false,
                message: "OTP is not valid!",
            });
        }

        if (otpDetails.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired. Please request a new one.",
            });
        }

        if (otpDetails.email !== email) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized with this OTP!",
            });
        }

        await prisma.otp.delete({ where: { email } });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { name, email, password: hashedPassword },
        });

        const profile = await prisma.profile.create({
            data: { userId: newUser.id },
        });

        return res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ error: "Error registering user" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log("hello");

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ error: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
        console.log(token);

        res.cookie("token", token, { httpOnly: true });

        res.setHeader("Authorization", `Bearer ${token}`);

        res.json({ message: "Login successful", token, user: user });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message,
        });
    }
};

export const createOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({ where: { email } });
        if (user) {
            return res.status(301).json({
                success: false,
                message: "You Cannot Create User who Already Signed Up!"
            })
        }

        const otp = Math.floor(Math.random() * 90000);
        const html = otpTemplate(otp);
        const subject = `Otp Verification Code at Wezire-Shop`

        const payload = {
            subject,
            html
        }

        const otpDetails = await prisma.otp.create({
            data: { otp, email }
        })

        await sendVerificationEmail(email, payload);

        return res.status(200).json({
            success: true,
            message: "OTP Successfully Sent to User!"
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Something Went Wrong",
            error: e.message
        })
    }
}

export const getUserDetails = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { userId } = req.user;
        const userDetails = await prisma.user.findFirst({
            where: { id: userId }, select: {
                id: true,
                name: true,
                email: true,
                role: true,
                profile: true,
                orders: true
            }
        });
        if (!userDetails) {
            return res.status(500).json({
                success: false,
                message: "Something Went Wrong with Auth Token"
            })
        }
        return res.status(200).json({
            success: true,
            message: "User Details Successfully Retrieved!",
            userDetail: userDetails
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching User Data!",
            error: e.message
        })
    }
}

export const logoutUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "User Successfully Logged Out!"
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error while Logging Out!",
            error: e.message
        })
    }
}

export const deleteUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { userId } = req.user;
        const user = await prisma.user.delete({
            where: { id: userId }
        });
        if (!user) {
            return res.status(500).json({
                success: false,
                message: "Something Went Wrong while Deleting User!"
            })
        }
        return res.status(200).json({
            success: true,
            message: "User Successfully Deleted!"
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error while Deleting User!",
            error: e.message
        })
    }
}
