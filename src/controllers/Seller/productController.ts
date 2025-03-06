import { Request, Response } from "express";
import prisma from "../../prisma";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import dotenv from "dotenv";
import { UploadedFile } from "express-fileupload";

dotenv.config();

interface AuthRequest extends Request {
    seller?: any;
}

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, price, stock, category, brand } = req.body;
        const { sellerId } = req.seller;
        const FOLDER_NAME = process.env.FOLDER_NAME || "products";

        const productImages = req.files?.productImages;

        console.log(name, description, price, stock, sellerId, productImages, FOLDER_NAME);

        if (!name || !price || !stock || !category || !brand) {
            return res.status(400).json({ message: "Name, Price, Category, Brand and Stock are required" });
        }

        let imageUrls: string[] = [];

        if (productImages) {
            if (Array.isArray(productImages)) {
                imageUrls = await Promise.all(
                    productImages.map((file: UploadedFile) =>
                        uploadImageToCloudinary(file, FOLDER_NAME)
                    )
                ).then((results) => results.map((res) => res.secure_url));
            } else {
                const uploadedImage = await uploadImageToCloudinary(
                    productImages as UploadedFile,
                    FOLDER_NAME
                );
                imageUrls.push(uploadedImage.secure_url);
            }
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                category,
                brand,
                images: imageUrls,
                sellerId,
            },
        });

        const seller = await prisma.seller.findUnique({
            where: {
                id: sellerId,
            },
            select: {
                products: true
            },
        });

        if (!seller) {
            return res.status(404).json({ message: "Seller not found" });
        }

        seller.products.push(product);

        return res.status(201).json({ message: "Product created successfully", product });

    } catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProductDetails = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.params;
        const { name, description, price, stock } = req.body;
        const { sellerId } = req.seller;
        const FOLDER_NAME = process.env.FOLDER_NAME || "products";

        const productImages = req.files?.productImages;

        if (!name || !price || !stock) {
            return res.status(400).json({ message: "Name, price, and stock are required" });
        }

        let imageUrls: string[] = [];

        if (productImages) {
            if (Array.isArray(productImages)) {
                imageUrls = await Promise.all(
                    productImages.map((file: UploadedFile) =>
                        uploadImageToCloudinary(file, FOLDER_NAME)
                    )
                ).then((results) => results.map((res) => res.secure_url));
            } else {
                const uploadedImage = await uploadImageToCloudinary(
                    productImages as UploadedFile,
                    FOLDER_NAME
                );
                imageUrls.push(uploadedImage.secure_url);
            }
        }

        const product = await prisma.product.update({
            where: {
                id: productId,
            },
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
                images: imageUrls,
            },
        });

        return res.status(200).json({ message: "Product updated successfully", product });

    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
    try {
        const { productId } = req.params;
        const { sellerId } = req.seller;
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.sellerId !== sellerId) {
            return res.status(403).json({ message: "You are not authorized to delete this product" });
        }

        await prisma.product.delete({
            where: {
                id: productId,
            },
        });

        return res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        var { name } = req.body;
        name = name.toUpperCase();


        const existingCategory = await prisma.category.findUnique({
            where: {
                name,
            },
        });

        if (existingCategory) {
            return res.status(400).json({ message: "Category already exists" });
        }

        const category = await prisma.category.create({
            data: {
                name
            },
        });

        return res.status(201).json({ message: "Category created successfully", category });

    }
    catch (error) {
        console.error("Error creating category:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createBrand = async (req: Request, res: Response) => {
    try {
        var { name } = req.body;
        name = name.toUpperCase();
        const existingBrand = await prisma.brand.findUnique({
            where: {
                name,
            },
        });
        if (existingBrand) {
            return res.status(400).json({ message: "Brand already exists" });
        }

        const brand = await prisma.brand.create({
            data: {
                name,
            },
        });
        return res.status(201).json({ message: "Brand created successfully", brand });
    }
    catch (error) {
        console.error("Error creating brand:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllCategory = async (req: Request, res: Response) => {
    try {
        const categories = await prisma.category.findMany();
        return res.status(200).json({ message: "Categories fetched successfully", categories });
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getAllBrand = async (req: Request, res: Response) => {
    try {
        const brands = await prisma.brand.findMany();
        return res.status(200).json({ message: "Brands fetched successfully", brands });
    }
    catch (error) {
        console.error("Error fetching brands:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
