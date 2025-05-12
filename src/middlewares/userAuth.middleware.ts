import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

interface AuthRequest extends Request {
    customer?: any;
}

export const authenticateCustomer = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header("Authorization")?.split(" ")[1] || req.cookies.token;
    console.log("Token:", token);
    if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.customer = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
    }
};
