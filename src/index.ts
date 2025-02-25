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
//this is create by krishna 
import githubAuthRoutes from "./routes/authRoutes/github";

// Import GitHub OAuth and Hello routes


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use(
    session({
        secret: process.env.SESSION_SECRET as string, // Ensure you have this in .env
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false } // Set secure: true if using HTTPS
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

app.use("/auth", githubAuthRoutes);

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
