import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const compressImage = async (fileBuffer) => {
    return sharp(fileBuffer)
        .resize(720)
        .jpeg({ quality: 70 })
        .toBuffer();
};

import path from "path";

const uploadImageToCloudinary = (fileBuffer, originalName) => {
    return new Promise((resolve, reject) => {
        const fileName = path.parse(originalName).name; // Extract filename without extension
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "events",
                public_id: fileName, // Use original filename
                format: "jpg", // Force format to jpg
                quality: "auto:low",
                overwrite: true, // Overwrite if the file exists
                resource_type: "image" // Ensure it's treated as an image
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};


const batchUploadImages = async (files) => {
    const BATCH_SIZE = 10;
    let uploadedUrls = [];

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
            batch.map(async (file) => {
                const compressedBuffer = await compressImage(file.buffer);
                return uploadImageToCloudinary(compressedBuffer, file.originalname);
            })
        );

        uploadedUrls.push(...results.map(r => r.status === "fulfilled" ? r.value : null));
    }
    return uploadedUrls.filter(Boolean);
};


// Middleware to Process Image Uploads
export const processImage = async (req, res, next) => {
    if (!req.files || !req.files["images"]) {
        return next();
    }

    try {
        req.processedImages = await batchUploadImages(req.files["images"]);
        next();
    } catch (error) {
        console.error("❌ Cloudinary Image Upload Error:", error.message);
        res.status(500).json({ error: "Failed to upload images to Cloudinary" });
    }
};

// Upload Video to Cloudinary
const uploadVideoToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "video", folder: "events" },
            (error, result) => {
                if (error) {
                    console.error("❌ Cloudinary Video Upload Error:", error);
                    reject(error);
                } else {
                    console.log("✅ Cloudinary Video Uploaded:", result.secure_url);
                    resolve(result.secure_url);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

// Middleware to Process Video Uploads
export const processVideo = async (req, res, next) => {
    if (!req.files || !req.files["videos"]) {
        return next();
    }

    try {
        req.processedVideos = await Promise.all(
            req.files["videos"].map(async (file) => uploadVideoToCloudinary(file.buffer))
        );
        next();
    } catch (error) {
        console.error("❌ Cloudinary Video Upload Error:", error.message);
        res.status(500).json({ error: "Failed to upload videos to Cloudinary" });
    }
};

export { upload };