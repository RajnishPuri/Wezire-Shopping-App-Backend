import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();

const router = express.Router();
router.use(cookieParser());

router.get("/auth", (_req, res) => {
    res.redirect(`https://github.com/login/oauth/authorize?client_id=${process.env.CLIENT_ID}`);
});

router.get("/auth/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("No authorization code provided!");

    try {
        // Exchange code for access token
        const { data } = await axios.post(
            "https://github.com/login/oauth/access_token",
            {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                code,
            },
            { headers: { Accept: "application/json" } }
        );

        const accessToken = data.access_token;
        if (!accessToken) return res.status(400).send("Failed to obtain access token!");

        // Fetch user data from GitHub
        const { data: user } = await axios.get("https://api.github.com/user", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        // Set user data in cookies for hello.ts
        res.cookie("username", user.login, { httpOnly: true });
        res.cookie("email", user.email || "No email", { httpOnly: true });

        // Redirect to hello.ts page after successful login
        res.redirect("/hello");
    } catch (error) {
        console.error("❌ OAuth Error:", error);
        res.status(500).send("Authentication failed!");
    }
});

export default router;
