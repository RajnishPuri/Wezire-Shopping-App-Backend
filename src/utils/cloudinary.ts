import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { UploadedFile } from "express-fileupload";

export const uploadImageToCloudinary = async (
    file: UploadedFile,
    folder: string,
    height?: number,
    quality?: number
): Promise<UploadApiResponse> => {
    try {
        const options: Record<string, any> = { folder, resource_type: "auto" };

        if (height) {
            options.height = height;
        }

        if (quality) {
            options.quality = quality;
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return reject(error);
                }
                resolve(result as UploadApiResponse);
            });

            uploadStream.end(file.data); // ✅ Using buffer instead of `tempFilePath`
        });
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};
