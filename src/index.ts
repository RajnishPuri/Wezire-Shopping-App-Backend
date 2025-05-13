import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";
import './utils/deleteExpiryOtp';
import cookieParser from "cookie-parser";
import customerAuthRoutes from "./routes/customerRoutes/costomerAuthRoutes";
import sellerAuthRoutes from "./routes/sellerRoutes/sellerAuthRoutes";
import googleAuthRoutes from "./routes/authRoutes/googleAuth";
import passport from "./auth/google";
import session from "express-session";
import githubAuthRoutes from "./routes/authRoutes/github";
import { cloudinaryConnect } from "./config/cloudinaryConfig";
import sellerProductRoutes from "./routes/sellerRoutes/sellerProductRoutes";
import fileUpload from "express-fileupload";
import CustomerProductRoutes from "./routes/customerRoutes/customerProductRoutes";
import paymentRoutes from './routes/Payment/payment';
import OrderRoutes from "./routes/customerRoutes/customerOrderRoutes";


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET as string,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    })
);

app.use(passport.initialize());
app.use(passport.session());
cloudinaryConnect();

// Auth Routes
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/seller/auth", sellerAuthRoutes);
app.use("/auth", googleAuthRoutes);
app.use("/auth", githubAuthRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/seller/product", sellerProductRoutes);
app.use("/api/product", CustomerProductRoutes);
app.use("/api/order", OrderRoutes);

app.get("/", (req, res) => {
    res.send("Shopping App Backend is Running 🚀");
});

app.get('/healthz', (req, res) => {
    res.status(200).send('OK');
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
