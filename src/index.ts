import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";
import userRoutes from "./routes/authRoute";
import './utils/deleteExpiryOtp';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);

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
