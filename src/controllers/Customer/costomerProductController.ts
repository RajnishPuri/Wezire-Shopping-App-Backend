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
        const searchItem = req.query.searchItem as string || undefined;
        const isFiltered = req.query.isFiltered as any || false;

        var isSearch = true;

        console.log("isFiltered:", isFiltered);



        if (searchItem == "undefined") {
            isSearch = false;
        }

        if (isFiltered == "true") {
            const { category, brand, price, inStock } = req.body;
            console.log("category:", category);
            console.log("brand:", brand);
            console.log("price:", price);
            console.log("inStock:", inStock);

            const where: any = {};

            if (category) {
                where.category = { name: category };
            }
            if (brand) {
                where.brand = { name: brand };
            }
            if (price) {
                where.price = { gte: 0, lte: parseFloat(price) }; // Ensure price is parsed as a float
            }
            if (inStock === "false") { // Adjust to check for out-of-stock items
                where.stock = { equals: 0 };
            }

            if (isSearch) {
                where.name = { contains: searchItem, mode: 'insensitive' };
            }

            console.log("Where conditions for filter:", where);

            const filterProducts = await prisma.product.findMany({
                where,
                skip,
                take: limit,
            });

            console.log("Filtered products:", filterProducts);
            const totalProducts = await prisma.product.count({ where });

            return res.status(200).json({
                products: filterProducts,
                totalProducts,
            });
        }

        if (isSearch) {
            console.log("hello");
            const products = await prisma.product.findMany({
                where: {
                    name: {
                        contains: searchItem,
                        mode: 'insensitive',
                    },
                },
                skip,
                take: limit,
            });

            const totalProducts = await prisma.product.count({
                where: {
                    name: {
                        contains: searchItem,
                        mode: 'insensitive',
                    },
                },
            });

            return res.status(200).json({
                products,
                totalProducts
            });
        }

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

// export const getFilterProduct = async (req: Request, res: Response) => {
//     try {
//         const { category, brand, price, inStock } = req.body;
//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 10;
//         const skip = (page - 1) * limit;

//         const where: any = {};

//         if (category) {
//             where.category = { name: category };
//         }
//         if (brand) {
//             where.brand = { name: brand };
//         }
//         if (price) {
//             where.price = { gte: 0, lte: price };
//         }
//         if (inStock) {
//             where.stock = { gt: 0 };
//         }

//         const filterProducts = await prisma.product.findMany({
//             where,
//             skip,
//             take: limit,
//         });

//         const totalProducts = await prisma.product.count({ where });

//         return res.status(200).json({
//             filterProducts,
//             totalProducts,
//         });
//     } catch (error) {
//         console.error("Error fetching products:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };


export const searchItemList = async (req: Request, res: Response) => {
    try {
        const searchItem = req.query.searchItem as string;
        console.log("searchItem:", searchItem);

        if (!searchItem) {
            return res.status(400).json({ message: "Missing searchItem query parameter" });
        }

        // Fetch more than 10 to ensure enough unique names can be found
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: searchItem,
                    mode: 'insensitive',
                },
            },
            select: {
                name: true,
            },
            take: 50, // fetch more to allow filtering unique
        });

        // Use Set to get distinct names
        const seen = new Set<string>();
        const uniqueSuggestions: string[] = [];

        for (const p of products) {
            if (!seen.has(p.name)) {
                seen.add(p.name);
                uniqueSuggestions.push(p.name);
            }
            if (uniqueSuggestions.length >= 10) break;
        }

        return res.status(200).json({ suggestions: uniqueSuggestions });
    } catch (error) {
        console.error("Error fetching product suggestions:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// export const searchProducts = async (req: Request, res: Response) => {
//     try {
//         const searchItem = req.query.searchItem as string;
//         const page = parseInt(req.query.page as string) || 1;
//         const limit = parseInt(req.query.limit as string) || 10;
//         const skip = (page - 1) * limit;

//         if (!searchItem) {
//             return res.status(400).json({ message: "Missing searchItem query parameter" });
//         }

//         const products = await prisma.product.findMany({
//             where: {
//                 name: {
//                     contains: searchItem,
//                     mode: 'insensitive',
//                 },
//             },
//             skip,
//             take: limit,
//         });

//         const totalProducts = await prisma.product.count({
//             where: {
//                 name: {
//                     contains: searchItem,
//                     mode: 'insensitive',
//                 },
//             },
//         });

//         return res.status(200).json({
//             products,
//             totalProducts,
//             currentPage: page,
//             totalPages: Math.ceil(totalProducts / limit),
//         });
//     } catch (error) {
//         console.error("Error searching products:", error);
//         return res.status(500).json({ message: "Internal server error" });
//     }
// };






