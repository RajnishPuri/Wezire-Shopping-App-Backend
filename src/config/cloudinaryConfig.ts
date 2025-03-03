import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

export const cloudinaryConnect = (): void => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME!,
            api_key: process.env.API_KEY_CLOUDINARY!,
            api_secret: process.env.API_SECRET_CLOUDINARY!,
        });
        console.log("Cloudinary connected successfully!");
    } catch (error) {
        console.error("Error connecting to Cloudinary:", error);
    }
};

export default cloudinary;
