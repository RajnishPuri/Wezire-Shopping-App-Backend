import express from "express";
import passport from "../../auth/google";
import { Request, Response, NextFunction } from "express";

const router = express.Router();
interface SessionData {
    role?: string; // Add role property
}
// Google Auth Routes
router.get(
    "/google",
    (req: Request, res: Response, next: NextFunction): any => {
        const role = (req.query.role as string)?.toUpperCase(); // Ensure lowercase
        console.log("Received role:", role);

        if (!role || (role !== "CUSTOMER" && role !== "SELLER")) {
            return res.status(400).json({ error: "Invalid role" });
        }

        // Attach role to session before authentication
        req.session = req.session || {}; // Ensure session exists
        (req.session as { role?: string }).role = role;


        next();
    },
    passport.authenticate("google", { scope: ["profile", "email"] })
);



// Google Auth Callback
router.get("/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    (req: Request, res: Response): any => {
        const role = (req.session as { role?: string })?.role;        // Retrieve stored role
        console.log("User role after Google auth:", role);

        if (!role) {
            return res.status(400).json({ error: "Role not found after authentication" });
        }

        // Redirect to the correct dashboard
        res.redirect(role === "CUSTOMER" ? "/customer-dashboard" : "/seller-dashboard");
    }
);


export default router;
