import express, { Request, Response } from "express";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
    const username = req.cookies.username || "Guest";
    const email = req.cookies.email || "Not available";

    res.send(`
        <h1>Welcome, ${username}!</h1>
        <p>Email: ${email}</p>
    `);
});

export default router;
