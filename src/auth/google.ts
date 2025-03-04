import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET as string;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            const { state: role } = req.query;
            const email = profile.emails?.[0]?.value;

            if (!role || !email) return done(null, false);

            try {
                let user;
                if (role === "CUSTOMER") {
                    user = await prisma.customer.findUnique({ where: { email } });
                    if (!user) {
                        user = await prisma.customer.create({
                            data: {
                                firstName: profile.name?.givenName || "",
                                lastName: profile.name?.familyName || "",
                                email,
                                password: "",
                            },
                        });
                        await prisma.customerProfile.create({
                            data: {
                                customerId: user.id,
                            },
                        });
                    }
                } else if (role === "SELLER") {
                    user = await prisma.seller.findUnique({ where: { email } });
                    if (!user) {
                        user = await prisma.seller.create({
                            data: {
                                firstName: profile.name?.givenName || "",
                                lastName: profile.name?.familyName || "",
                                email,
                                password: "",
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
                    role === "CUSTOMER"
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
