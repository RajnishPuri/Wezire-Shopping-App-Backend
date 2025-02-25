import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../../prisma";
import sendVerificationEmail from '../../utils/sendEmail';
import { otpTemplate } from '../../utils/Template/verifyEmail';

dotenv.config();

interface AuthRequest extends Request {
    customer?: any;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export const registerCustomer = async (req: Request, res: Response) => {
    try {
        const { email, password, otp, firstName, middleName = "", lastName = "" } = req.body;

        const existingCustomer = await prisma.customer.findUnique({ where: { email } });
        if (existingCustomer) {
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

        const newCustomer = await prisma.customer.create({
            data: { firstName, middleName, lastName, email, password: hashedPassword },
        });

        const profile = await prisma.customerProfile.create({
            data: { customerId: newCustomer.id },
        });

        return res.status(201).json({ message: "Customer registered successfully", customer: newCustomer });
    } catch (error) {
        return res.status(500).json({ error: "Error registering Customer" });
    }
};

export const loginCustomer = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const customer = await prisma.customer.findUnique({ where: { email } });

        if (!customer || !customer.password || typeof customer.password !== "string") {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, customer.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid email or password" });

        const token = jwt.sign({ customerId: customer.id }, JWT_SECRET, { expiresIn: "1h" });

        res.cookie("token", token, { httpOnly: true });

        res.setHeader("Authorization", `Bearer ${token}`);

        res.json({ message: "Login successful", token, role: customer.role });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error logging in",
            error: error.message,
        });
    }
};

export const createCustomerOtp = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email } = req.body;

        const existingCustomer = await prisma.customer.findUnique({ where: { email } });
        if (existingCustomer) {
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
            message: "OTP successfully sent to Customer!"
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

export const getCustomerDetails = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { customerId } = req.customer;
        const customerDetails = await prisma.customer.findFirst({
            where: { id: customerId }, select: {
                id: true,
                firstName: true,
                middleName: true,
                lastName: true,
                email: true,
                role: true,
                profile: true,
                transactions: true,
                orders: true,
            }
        });
        if (!customerDetails) {
            return res.status(500).json({
                success: false,
                message: "Something Went Wrong with Auth Token"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Customer Details Successfully Retrieved!",
            customerDetails: customerDetails
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error while fetching Customer Data!",
            error: e.message
        })
    }
}

export const logoutCustomer = async (req: Request, res: Response): Promise<Response> => {
    try {
        res.clearCookie("token");
        return res.status(200).json({
            success: true,
            message: "Customer Successfully Logged Out!"
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

export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { customerId } = req.customer;
        const customer = await prisma.customer.findUnique({
            where: { id: customerId }
        });
        if (!customer) {
            return res.status(500).json({
                success: false,
                message: "Something Went Wrong with Auth Token"
            })
        }
        await prisma.customer.delete({
            where: { id: customerId }
        });
        return res.status(200).json({
            success: true,
            message: "Customer Successfully Deleted!"
        })
    }
    catch (e: any) {
        return res.status(500).json({
            success: false,
            message: "Error while Deleting Customer!",
            error: e.message
        })
    }
}
