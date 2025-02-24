import express from "express";
import { registerSeller, loginSeller, logoutSeller, getSellerDetails, deleteSeller, createSellerOtp } from "../../controllers/Seller/sellerAuthController";
import { authenticateSeller } from '../../middlewares/sellerAuth.middleware';

const router = express.Router();

router.post('/create-otp', createSellerOtp as any);
router.post("/register", registerSeller as any);
router.post("/login", loginSeller as any);
router.get("/getUserDetails", authenticateSeller as any, getSellerDetails as any);
router.delete("/deleteUser", authenticateSeller as any, deleteSeller as any);
router.post("/logout", authenticateSeller as any, logoutSeller as any);

export default router;
