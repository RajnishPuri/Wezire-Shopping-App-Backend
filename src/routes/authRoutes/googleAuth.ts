import express from "express";
import passport from "../../auth/google";
import { Request, Response, NextFunction } from "express";

const router = express.Router();

// Google Auth Routes
router.get(
    "/google",
    (req: Request, res: Response, next: NextFunction): any => {
        const role = req.query.role;
        if (!role || (role !== "customer" && role !== "seller")) {
            return res.status(400).json({ error: "Invalid role" });
        }
        next();
    },
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Auth Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        const { user, token } = req.user as any;
        res.json({ success: true, user, token });
    }
);

export default router;
