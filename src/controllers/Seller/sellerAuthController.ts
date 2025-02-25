import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../../prisma";
import sendVerificationEmail from '../../utils/sendEmail';
import { otpTemplate } from '../../utils/Template/verifyEmail';

dotenv.config();

interface AuthRequest extends Request {
    seller?: any;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerSeller = async (req: Request, res: Response) => {
    try {
        const { email, password, otp, firstName, middleName = "", lastName = "" } = req.body;

        const existingSeller = await prisma.seller.findUnique({ where: { email } });
        if (existingSeller) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const otpDetails = await prisma.otp.findFirst({
            where: { otp },
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

        await prisma.otp.deleteMany({ where: { email } });


        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = await prisma.seller.create({
            data: { firstName, middleName, lastName, email, password: hashedPassword },
        });

        const profile = await prisma.sellerProfile.create({
            data: { sellerId: newSeller.id, },
        });

        return res.status(201).json({ message: "Seller registered successfully", seller: newSeller });
    } catch (error) {
        return res.status(500).json({ error: "Error registering Seller" });
    }
};

export const loginSeller = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const seller = await prisma.seller.findUnique({ where: { email } });
        if (!seller || !seller.password || typeof seller.password !== "string") {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, seller.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ sellerId: seller.id }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true });

        res.setHeader("Authorization", `Bearer ${token}`);

        res.json({ message: "Login successful", token, role: seller.role });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message,
        });
    }
};

export const createSellerOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;

        const existingSeller = await prisma.seller.findUnique({ where: { email } });
        if (existingSeller) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        const html = otpTemplate(otp);
        const subject = "OTP Verification Code at Wezire-Shop";
        const payload = { subject, html };

        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.otp.create({
            data: { otp, email, expiresAt }
        });

        await sendVerificationEmail(email, payload);

        return res.status(200).json({
            success: true,
            message: "OTP successfully sent to Seller!"
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

export const getSellerDetails = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { sellerId } = req.seller;
        const sellerDetails = await prisma.seller.findFirst({
            where: { id: sellerId }, select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                profile: true,
                OrderItem: true,
                products: true,
            }
        });
        if (!sellerDetails) {
            return res.status(500).json({
                success: false,
                message: "Something Went Wrong with Auth Token"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Seller Details Successfully Retrieved!",
            sellerDetails: sellerDetails
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching Seller Data!",
            error: e.message
        })
    }
}

export const logoutSeller = async (req: Request, res: Response): Promise<Response> => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Seller Successfully Logged Out!"
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

export const deleteSeller = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { sellerId } = req.seller;
        const seller = await prisma.seller.findUnique({
            where: { id: sellerId }
        });
        if (!seller) {
            return res.status(500).json({
                success: false,
                message: "Something Went Wrong with Auth Token"
            })
        }
        await prisma.seller.delete({
            where: { id: sellerId }
        });
        return res.status(200).json({
            success: true,
            message: "Seller Successfully Deleted!"
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error while Deleting Seller!",
            error: e.message
        })
    }
}
