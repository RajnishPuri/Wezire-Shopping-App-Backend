import express from "express";
import { registerCustomer, loginCustomer, logoutCustomer, getCustomerDetails, deleteCustomer, createCustomerOtp } from "../../controllers/Customer/customerAuthController";
import { authenticateCustomer } from '../../middlewares/userAuth.middleware';

const router = express.Router();

router.post('/create-otp', createCustomerOtp as any);
router.post("/register", registerCustomer as any);
router.post("/login", loginCustomer as any);
router.get("/getUserDetails", authenticateCustomer as any, getCustomerDetails as any);
router.delete("/deleteUser", authenticateCustomer as any, deleteCustomer as any);
router.post("/logout", authenticateCustomer as any, logoutCustomer as any);

export default router;
