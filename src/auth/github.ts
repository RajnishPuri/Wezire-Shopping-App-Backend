import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request } from "express";
import axios from "axios";

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
            const { state: role } = req.query as { state?: string };
            let email = profile.emails?.[0]?.value || null;

            if (!role) return done(null, false);

            try {
                let user;
                let firstName = profile.displayName || (profile as any).login || "Unknown";
                if (!email) {
                    const githubEmails = await axios.get<{ email: string; primary: boolean; verified: boolean }[]>(
                        "https://api.github.com/user/emails",
                        {
                            headers: {
                                Authorization: `token ${_accessToken}`,
                            },
                        }
                    );

                    const primaryEmail = githubEmails.data.find(
                        (emailObj: { email: string; primary: boolean; verified: boolean }) =>
                            emailObj.primary && emailObj.verified
                    );

                    if (primaryEmail) {
                        email = primaryEmail.email;
                    }
                }

                if (!email) {
                    return done(null, false);
                }

                if (role.toUpperCase() === "CUSTOMER") {

                    user = await prisma.customer.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        user = await prisma.customer.create({
                            data: {
                                firstName,
                                lastName: "",
                                email,
                            },
                        });
                        await prisma.customerProfile.create({
                            data: {
                                customerId: user.id,
                            },
                        });
                    }
                } else if (role.toUpperCase() === "SELLER") {

                    user = await prisma.seller.findUnique({
                        where: { email },
                    });

                    if (!user) {
                        user = await prisma.seller.create({
                            data: {
                                firstName,
                                lastName: "",
                                email,
                            },
                        });
                        await prisma.sellerProfile.create({
                            data: {
                                sellerId: user.id,
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
                    { expiresIn: "7d" }
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
