import express from "express";
import { registerUser, loginUser, createOtp, getUserDetails, deleteUser, logoutUser } from "../controllers/authController";
import { authenticateUser } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/create-otp', createOtp as any);
router.post("/register", registerUser as any);
router.post("/login", loginUser as any);
router.get("/getUserDetails", authenticateUser as any, getUserDetails as any);
router.delete("/deleteUser", authenticateUser as any, deleteUser as any);
router.post("/logout", authenticateUser as any, logoutUser as any);

export default router;
