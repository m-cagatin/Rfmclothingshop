/**
 * Cloudinary Admin Service (Server-side)
 * Handles secure deletion of images from Cloudinary
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (credentials from environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Delete a single image from Cloudinary by public ID
 * @param publicId - The Cloudinary public ID of the image
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Deleted image from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`❌ Failed to delete image from Cloudinary: ${publicId}`, error);
    throw error;
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param publicIds - Array of Cloudinary public IDs
 */
export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  try {
    const deletePromises = publicIds.map(publicId => 
      cloudinary.uploader.destroy(publicId)
    );
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${publicIds.length} images from Cloudinary`);
  } catch (error) {
    console.error('❌ Failed to delete images from Cloudinary', error);
    throw error;
  }
}

/**
 * Delete all images in a specific folder
 * @param folderPath - The folder path in Cloudinary (e.g., "rfm_images/Customizable Products/CP123456")
 */
export async function deleteFolder(folderPath: string): Promise<void> {
  try {
    // Delete all resources in the folder
    await cloudinary.api.delete_resources_by_prefix(folderPath);
    // Delete the folder itself
    await cloudinary.api.delete_folder(folderPath);
    console.log(`✅ Deleted folder from Cloudinary: ${folderPath}`);
  } catch (error) {
    console.error(`❌ Failed to delete folder from Cloudinary: ${folderPath}`, error);
    // Don't throw - folder might not exist or be empty
  }
}
