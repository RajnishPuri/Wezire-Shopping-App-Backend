import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            callbackURL: process.env.GITHUB_CALLBACK_URL!,
            passReqToCallback: true,
        },
        async (
            req: Request,
            _accessToken: string,
            _refreshToken: string,
            profile: Profile,
            done: (error: any, user?: any) => void
        ) => {
            const { state: role } = req.query as { state?: string }; // Ensure query type
            const email = profile.emails?.[0]?.value;
            console.log("GitHub Profile:", profile);
            console.log("Role:", role);

            if (!role || !email) return done(null, false);

            try {
                let user;
                const firstName = profile.displayName || profile.username || "Unknown"; // ✅ Ensure a string value

                if (role.toUpperCase() === "CUSTOMER") {
                    console.log("Creating customer...");
                    user = await prisma.customer.findUnique({ where: { email } });

                    if (!user) {
                        user = await prisma.customer.create({
                            data: {
                                firstName,
                                lastName: "",
                                email,
                            },
                        });
                    }
                } else if (role.toUpperCase() === "SELLER") {
                    console.log("Creating seller...");
                    user = await prisma.seller.findUnique({ where: { email } });

                    if (!user) {
                        user = await prisma.seller.create({
                            data: {
                                firstName,
                                lastName: "",
                                email,
                            },
                        });
                    }
                } else {
                    return done(null, false);
                }

                const token = jwt.sign(
                    role.toUpperCase() === "CUSTOMER"
                        ? { customerId: user.id, role: "CUSTOMER" }
                        : { sellerId: user.id, role: "SELLER" },
                    JWT_SECRET,
                    { expiresIn: "1h" }
                );

                return done(null, { user, token });
            } catch (error) {
                return done(error, false);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user);
});

passport.deserializeUser((user: any, done) => {
    done(null, user);
});

export default passport;
