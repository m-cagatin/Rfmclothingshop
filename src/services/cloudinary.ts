/**
 * Cloudinary Upload Service
 * Handles image uploads to different folders based on user type
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'];
const CLOUDINARY_UPLOAD_PRESET = import.meta.env['VITE_CLOUDINARY_UPLOAD_PRESET'];

export enum CloudinaryFolder {
  USER_UPLOADS = 'user_uploads',
  ADMIN_GRAPHICS = 'admin_graphics',
  ADMIN_PATTERNS = 'admin_patterns',
  ADMIN_TEMPLATES = 'admin_templates',
  ADMIN_SHAPES = 'admin_shapes',
  CUSTOMIZABLE_PRODUCTS_FRONT = 'Customizable Products/Front View IMG',
  CUSTOMIZABLE_PRODUCTS_BACK = 'Customizable Products/Back View IMG',
  CUSTOMIZABLE_PRODUCTS_ADDITIONAL = 'Customizable Products/Additional IMG',
  CUSTOMIZABLE_PRODUCTS_VARIANT = 'Customizable Products/Variant IMG',
}

interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Upload image to Cloudinary
 * @param file - File to upload
 * @param folder - Target folder (defaults to user_uploads)
 * @param onProgress - Optional progress callback
 * @param customPublicId - Optional custom public ID for the image (includes product code and type)
 */
export async function uploadToCloudinary(
  file: File,
  folder: CloudinaryFolder = CloudinaryFolder.USER_UPLOADS,
  onProgress?: (progress: number) => void,
  customPublicId?: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', `rfm_images/${folder}`);
  
  // If custom public ID is provided, use it (for product images with product code)
  if (customPublicId) {
    formData.append('public_id', customPublicId);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          width: data.width,
          height: data.height,
          format: data.format,
          size: data.bytes,
        });
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`);
    xhr.send(formData);
  });
}

/**
 * Delete image from Cloudinary (requires backend implementation)
 * Note: Deletion requires authentication and should be done server-side
 */
export function deleteFromCloudinary(publicId: string): Promise<void> {
  // TODO: Implement server-side deletion endpoint
  console.warn('Cloudinary deletion requires server-side implementation', publicId);
  return Promise.resolve();
}

/**
 * Generate Cloudinary transformation URL
 * @param publicId - Cloudinary public ID
 * @param transformations - Array of transformations
 */
export function getTransformedUrl(
  publicId: string,
  transformations: string[]
): string {
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const transformStr = transformations.join(',');
  return `${baseUrl}/${transformStr}/${publicId}`;
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 200): string {
  return getTransformedUrl(publicId, [`w_${size}`, `h_${size}`, 'c_fill', 'q_auto']);
}
