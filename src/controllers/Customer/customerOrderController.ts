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

export const getOrderById = async (req: AuthRequest, res: Response) => {
    try {
        const orderId = req.params.orderId;
        const customerId = req.customer.customerId;
        console.log("Customer ID:", customerId);
        console.log("Order ID:", orderId);

        if (!customerId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                orderItems: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.customerId !== customerId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.status(200).json({ order });
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}