const express = require('express');
const Razorpay = require('razorpay');  // Import Razorpay
const router = express.Router();
const verifyRazorpaySignature = require('../../utils/razorpay').verifyRazorpaySignature;
const prisma = require('../../prisma');

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

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) return res.status(400).json({ message: "Invalid signature" });

    try {
        const orderTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const order = await prisma.order.create({
            data: {
                customerId,
                orderTotal,
                deliveryAddress,
                orderStatus: "CONFIRMED",
                orderItems: {
                    create: cartItems.map(item => ({
                        productId: item.id,
                        sellerId: item.sellerId,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: item.quantity * item.price
                    }))
                },
                orderPayments: {
                    create: {
                        transactionId: razorpayPaymentId,
                        paymentMethod: "Razorpay",
                        paymentStatus: "Success",
                        amount: orderTotal
                    }
                },
                Transaction: {
                    create: {
                        transactionId: razorpayPaymentId,
                        paymentMethod: "Razorpay",
                        paymentStatus: "Success",
                        amount: orderTotal,
                        customerId
                    }
                }
            },
            include: { orderItems: true }
        });

        res.status(200).json({ message: "Order placed successfully", order });
    } catch (err: any) {
        res.status(500).json({ message: "Error saving order", error: err.message });
    }
});


export default router;
