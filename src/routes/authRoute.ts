import express from "express";
import { registerUser, loginUser, createOtp } from "../controllers/authController";

const router = express.Router();

router.post('/create-otp', createOtp as any);
router.post("/register", registerUser as any);
router.post("/login", loginUser as any);

export default router;
