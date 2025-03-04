import { Request, Response } from "express";

import prisma from "../../prisma";

interface AuthRequest extends Request {
    customer?: any;
}

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        // Fetch products with pagination
        const products = await prisma.product.findMany({
            skip,
            take: limit
        });

        // Get total product count
        const totalProducts = await prisma.product.count();

        return res.status(200).json({
            products,
            totalProducts
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};