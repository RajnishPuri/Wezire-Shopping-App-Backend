import express from "express";
import passport from "../../auth/google";
import { Request, Response, NextFunction } from "express";

const router = express.Router();

router.get("/google", (req: Request, res: Response): any => {
    const role = (req.query.role as string)?.toUpperCase();

    if (!role || (role !== "CUSTOMER" && role !== "SELLER")) {
        return res.status(400).json({ error: "Invalid role" });
    }

    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=email%20profile&state=${role}`;

    res.redirect(authUrl);
});

router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "http://localhost:5173", session: false }),
    (req: Request, res: Response): any => {
        const user = req.user as { token: string; user: { role: string } };

        if (!user || !user.token || !user.user.role) {
            return res.status(400).json({ error: "Authentication failed" });
        }

        res.redirect(`http://localhost:5173/auth-success?token=${user.token}&role=${user.user.role.toLowerCase()}`);
    }
);


export default router;
