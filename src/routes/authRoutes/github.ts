import express from "express";
import passport from "../../auth/github";
import { Request, Response } from "express";

const router = express.Router();

router.get("/github", (req: Request, res: Response): any => {
    const role = (req.query.role as string)?.toUpperCase();

    if (!role || (role !== "CUSTOMER" && role !== "SELLER")) {
        return res.status(400).json({ error: "Invalid role" });
    }

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_CALLBACK_URL}&scope=user:email&state=${role}`;

    res.redirect(authUrl);
});

router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "https://wezire-shopping-app-frontend.vercel.app/", session: false }),
    (req: Request, res: Response): any => {
        const user = req.user as { token: string; user: { role: string } };

        if (!user || !user.token || !user.user.role) {
            return res.status(400).json({ error: "Authentication failed" });
        }

        res.redirect(`https://wezire-shopping-app-frontend.vercel.app/auth-success?token=${user.token}&role=${user.user.role.toLowerCase()}`);
    }
);

export default router;
