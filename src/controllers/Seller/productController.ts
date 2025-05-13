import { Request, Response } from "express";
import prisma from "../../prisma";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import dotenv from "dotenv";
import { UploadedFile } from "express-fileupload";
import { Console } from "console";
import { Prisma } from "@prisma/client";

dotenv.config();

interface AuthRequest extends Request {
    seller?: any;
}

export const createProduct = async (req: AuthRequest, res: Response) => {
    try {
        var { name, description, price, stock, category, brand } = req.body;
        const { sellerId } = req.seller;
        const FOLDER_NAME = process.env.FOLDER_NAME || "products";

        const productImages = req.files?.productImages;

        if (!name || !price || !stock || !category || !brand) {
            return res.status(400).json({ message: "Name, Price, Category, Brand and Stock are required" });
        }

        category = category.toUpperCase();
        brand = brand.toUpperCase();

        var categoryId;
        var brandId;

        if (category) {
            try {
                const existingCategory = await prisma.category.findUnique({
                    where: {
                        name: category,
                    },
                });

                if (!existingCategory) {
                    const newCategory = await prisma.category.create({
                        data: {
                            name
                        },
                    });
                    categoryId = newCategory.id;
                }
                else {
                    categoryId = existingCategory.id;
                }

            }
            catch (error) {
                console.log(error);
            }
        }

        if (brand) {
            try {
                const existingBrand = await prisma.brand.findUnique({
                    where: {
                        name: brand,
                    },
                });
                if (!existingBrand) {
                    const newBrand = await prisma.brand.create({
                        data: {
                            name
                        },
                    });
                    brandId = newBrand.id;
                }
                else {
                    brandId = existingBrand.id;
                }
            }
            catch (error) {
                console.log(error);
            }
        }

        // console.log(name, description, price, stock, sellerId, productImages, FOLDER_NAME);


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
                categoryId,
                brandId,
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

export const getCategorySearch = async (req: Request, res: Response) => {
    try {
        var categoryName = req.query.categoryName as string;
        console.log(categoryName);
        categoryName = categoryName.toUpperCase();
        if (!categoryName) {
            return res.status(400).json({ message: "Category name is required" });
        }
        const categories = await prisma.category.findMany({
            where: {
                name: {
                    contains: categoryName,
                    mode: 'insensitive',
                },
            },
            take: 10,
        });

        if (!categories) {
            return res.status(404).json({ message: "Category not found" });
        }
        return res.status(200).json({ message: "Category fetched successfully", categories });
    }
    catch (error) {
        console.error("Error fetching category:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getBrandSearch = async (req: Request, res: Response) => {
    try {
        var brandName = req.query.brandName as string;
        console.log(brandName);
        brandName = brandName.toUpperCase();
        if (!brandName) {
            return res.status(400).json({ message: "Brand name is required" });
        }
        const brands = await prisma.brand.findMany({
            where: {
                name: {
                    contains: brandName,
                    mode: 'insensitive',
                },
            },
            take: 10,
        });
        console.log(brands);
        if (!brands) {
            return res.status(404).json({ message: "Brand not found" });
        }
        return res.status(200).json({ message: "Brand fetched successfully", brands });
    }
    catch (error) {
        console.error("Error fetching brand:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getMyProducts = async (req: AuthRequest, res: Response) => {
    try {
        const { sellerId } = req.seller;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const searchItemRaw = req.query.searchItem as string;
        const isFilteredRaw = req.query.isFiltered as string;

        const searchItem = searchItemRaw && searchItemRaw !== "undefined" ? searchItemRaw : undefined;
        const isFiltered = isFilteredRaw === "true";

        const where: any = {
            sellerId
        };



        if (isFiltered) {
            const { category, brand, price, inStock } = req.body;

            if (category) {
                where.category = { name: category };
            }

            if (brand) {
                where.brand = { name: brand };
            }

            if (price !== undefined && !isNaN(parseFloat(price))) {
                where.price = {
                    gte: 0,
                    lte: parseFloat(price)
                };
            }

            if (inStock === "false") {
                where.stock = { equals: 0 };
            }

            if (searchItem) {
                where.name = {
                    contains: searchItem,
                    mode: "insensitive"
                };
            }

            const filterProducts = await prisma.product.findMany({
                where,
                skip,
                take: limit
            });

            const totalProducts = await prisma.product.count({ where });

            return res.status(200).json({
                products: filterProducts,
                totalProducts
            });
        }

        // Handle search-only (not filtered)
        if (searchItem) {
            const searchWhere: Prisma.ProductWhereInput = {
                sellerId: req.seller.sellerId,
                name: {
                    contains: searchItem,
                    mode: Prisma.QueryMode.insensitive,
                },
            };

            const products = await prisma.product.findMany({
                where: searchWhere,
                skip,
                take: limit
            });

            const totalProducts = await prisma.product.count({
                where: searchWhere
            });


            return res.status(200).json({
                products,
                totalProducts
            });
        }

        // Default: fetch all without filters or search
        const products = await prisma.product.findMany({
            where: { sellerId },
            skip,
            take: limit
        });

        const totalProducts = await prisma.product.count({
            where: { sellerId }
        });

        console.log(products);

        return res.status(200).json({
            products,
            totalProducts
        });

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


