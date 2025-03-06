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

        const products = await prisma.product.findMany({
            skip,
            take: limit
        });

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

export const getFilterProduct = async (req: Request, res: Response) => {
    try {
        const { category, brand, price, inStock } = req.body;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (category) {
            where.category = { name: category };
        }
        if (brand) {
            where.brand = { name: brand };
        }
        if (price) {
            where.price = { gte: 0, lte: price };
        }
        if (inStock) {
            where.stock = { gt: 0 };
        }

        const filterProducts = await prisma.product.findMany({
            where,
            skip,
            take: limit,
        });

        const totalProducts = await prisma.product.count({ where });

        return res.status(200).json({
            filterProducts,
            totalProducts,
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};









