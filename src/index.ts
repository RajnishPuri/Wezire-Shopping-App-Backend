import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";
import './utils/deleteExpiryOtp';
import cookieParser from 'cookie-parser'
import customerAuthRoutes from "./routes/customerRoutes/costomerAuthRoutes";
import sellerAuthRoutes from "./routes/sellerRoutes/sellerAuthRoutes";




dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());



//this is create by krishna 
import githubRoutes from "./auth/github";
import helloRoutes from "./auth/hello";

// Import GitHub OAuth and Hello routes
app.use("/", githubRoutes);
app.use("/hello", helloRoutes);
// Customers Routes
app.use("/api/customer/auth", customerAuthRoutes);

// Seller Routes
app.use("/api/seller/auth", sellerAuthRoutes);

app.get("/", (req, res) => {
    res.send("Shopping App Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    try {
        await prisma.$connect();
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
});