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
        const { name, description, price, stock } = req.body;
        const { sellerId } = req.seller;
        const FOLDER_NAME = process.env.FOLDER_NAME || "products";

        const productImages = req.files?.productImages;

        console.log(name, description, price, stock, sellerId, productImages, FOLDER_NAME);

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

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock, 10),
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
