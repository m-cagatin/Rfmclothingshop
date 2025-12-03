"use strict";
/**
 * Cloudinary Admin Service (Server-side)
 * Handles secure deletion of images from Cloudinary
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImage = deleteImage;
exports.deleteMultipleImages = deleteMultipleImages;
exports.deleteFolder = deleteFolder;
const cloudinary_1 = require("cloudinary");
// Configure Cloudinary (credentials from environment variables)
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Delete a single image from Cloudinary by public ID
 * @param publicId - The Cloudinary public ID of the image
 */
async function deleteImage(publicId) {
    try {
        await cloudinary_1.v2.uploader.destroy(publicId);
        console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
    }
    catch (error) {
        console.error(`❌ Failed to delete image from Cloudinary: ${publicId}`, error);
        throw error;
    }
}
/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs
 */
async function deleteMultipleImages(publicIds) {
    try {
        const deletePromises = publicIds.map(publicId => cloudinary_1.v2.uploader.destroy(publicId));
        await Promise.all(deletePromises);
        console.log(`✅ Deleted ${publicIds.length} images from Cloudinary`);
    }
    catch (error) {
        console.error('❌ Failed to delete images from Cloudinary', error);
        throw error;
    }
}
/**
 * Delete all images in a specific folder
 * @param folderPath - The folder path in Cloudinary (e.g., "rfm_images/Customizable Products/CP123456")
 */
async function deleteFolder(folderPath) {
    try {
        // Delete all resources in the folder
        await cloudinary_1.v2.api.delete_resources_by_prefix(folderPath);
        // Delete the folder itself
        await cloudinary_1.v2.api.delete_folder(folderPath);
        console.log(`✅ Deleted folder from Cloudinary: ${folderPath}`);
    }
    catch (error) {
        console.error(`❌ Failed to delete folder from Cloudinary: ${folderPath}`, error);
        // Don't throw - folder might not exist or be empty
    }
}
