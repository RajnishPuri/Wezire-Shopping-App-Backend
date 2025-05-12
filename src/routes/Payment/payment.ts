import express from "express";
import Razorpay from "razorpay";  // Import Razorpay
const router = express.Router();
import { verifyRazorpaySignature } from "../../utils/razorpay"; // Import the signature verification function
import prisma from "../../prisma";

// Initialize Razorpay with your credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,  // Your Razorpay Key ID
    key_secret: process.env.RAZORPAY_SECRET // Your Razorpay Secret Key
});

type CartItem = {
    id: string;
    sellerId: string;
    price: number;
    quantity: number;
};

router.post("/create-order", async (req: any, res: any) => {
    const { amount } = req.body;

    // Razorpay order options
    const options = {
        amount: amount * 100, // Razorpay expects the amount in paise (1 INR = 100 paise)
        currency: "INR",
        receipt: `receipt_${Date.now()}`
    };

    try {
        // Create a new Razorpay order
        const order = await razorpay.orders.create(options);
        res.status(200).json({ orderId: order.id, amount: order.amount });
    } catch (err) {
        res.status(500).json({ message: "Error creating Razorpay order" });
    }
});

router.post("/verify-payment", async (req: any, res: any) => {
    console.log("Verifying payment...");
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        customerId,
        cartItems,
        deliveryAddress
    }: {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
        customerId: string;
        cartItems: CartItem[];
        deliveryAddress: string;
    } = req.body;

    console.log("razorpayOrderId:", razorpayOrderId);
    console.log("razorpayPaymentId:", razorpayPaymentId);
    console.log("razorpaySignature:", razorpaySignature);
    console.log("customerId:", customerId);
    console.log("cartItems:", cartItems);
    console.log("deliveryAddress:", deliveryAddress);

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) return res.status(400).json({ message: "Invalid signature" });

    try {
        console.log("Grouping cart items by seller...");
        const itemsBySeller = cartItems.reduce((acc: Record<string, CartItem[]>, item) => {
            if (!acc[item.sellerId]) acc[item.sellerId] = [];
            acc[item.sellerId].push(item);
            return acc;
        }, {});

        console.log("Grouped cart items by seller:", itemsBySeller);

        const createdOrders = [];

        for (const sellerId in itemsBySeller) {
            const sellerItems = itemsBySeller[sellerId];
            const orderTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            console.log(`Processing order for seller ${sellerId} with total ${orderTotal}`);
            // console.log("Creating order:", prisma.order);
            // Create order with orderItems and orderPayment only
            const order = await prisma.order.create({
                data: {
                    customerId,
                    deliveryAddress,
                    orderStatus: "CONFIRMED",
                    orderTotal,
                    orderItems: {
                        create: sellerItems.map(item => ({
                            productId: item.id,
                            sellerId: item.sellerId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            totalPrice: item.price * item.quantity
                        }))
                    },
                    orderPayments: {
                        create: {
                            transactionId: `${razorpayPaymentId}-${sellerId}`,
                            paymentMethod: "Razorpay",
                            paymentStatus: "Success",
                            amount: orderTotal
                        }
                    }
                },
                include: { orderItems: true }
            });

            // Create transaction
            await prisma.transaction.create({
                data: {
                    transactionId: `${razorpayPaymentId}-${sellerId}`,
                    paymentMethod: "Razorpay",
                    paymentStatus: "Success",
                    amount: orderTotal,
                    customerId,
                    orderId: order.id
                }
            });

            for (const item of sellerItems) {
                await prisma.product.update({
                    where: { id: item.id },
                    data: {
                        stock: {
                            decrement: item.quantity
                        }
                    }
                });
            }
            console.log(`Order ${order.id} created successfully`);


            createdOrders.push(order);
        }

        res.status(200).json({ message: "Orders placed successfully", orders: createdOrders });

    } catch (err: any) {
        console.error("Order saving failed:", err);
        res.status(500).json({ message: "Error saving orders", error: err.message });
    }
});


export default router;
