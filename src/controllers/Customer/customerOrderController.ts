import { Request, Response } from "express";

import prisma from "../../prisma";

interface AuthRequest extends Request {
    customer?: any;
}

export const getCustomerOrders = async (req: AuthRequest, res: Response) => {
    try {
        const customerId = req.customer.customerId;
        console.log("Customer ID:", customerId);

        if (!customerId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const orders = await prisma.order.findMany({
            where: { customerId },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        return res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching customer orders:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};