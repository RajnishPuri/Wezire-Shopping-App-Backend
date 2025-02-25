import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";
import './utils/deleteExpiryOtp';
import cookieParser from "cookie-parser";
import customerAuthRoutes from "./routes/customerRoutes/costomerAuthRoutes";
import sellerAuthRoutes from "./routes/sellerRoutes/sellerAuthRoutes";
import googleAuthRoutes from "./routes/authRoutes/googleAuth"; // Import Google Auth Routes
import passport from "./auth/google";
import session from "express-session";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

// Customers Routes
app.use("/api/customer/auth", customerAuthRoutes);

// Seller Routes
app.use("/api/seller/auth", sellerAuthRoutes);

// Google Auth Routes
app.use("/auth", googleAuthRoutes);

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
