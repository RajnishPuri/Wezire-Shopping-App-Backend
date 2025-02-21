import { Request, Response } from "express";


type AuthRequest = Request & { user?: any };


export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = req.user;
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
};