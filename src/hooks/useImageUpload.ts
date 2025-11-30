import { useState, useCallback } from 'react';

interface UseImageUploadReturn {
  uploadImage: (file: File, folder?: string) => Promise<{ url: string; width: number; height: number; publicId: string } | null>;
  validateImage: (file: File) => Promise<{ valid: boolean; warning?: string; error?: string }>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const CLOUDINARY_CLOUD_NAME = import.meta.env['VITE_CLOUDINARY_CLOUD_NAME'];
  const CLOUDINARY_UPLOAD_PRESET = import.meta.env['VITE_CLOUDINARY_UPLOAD_PRESET'];

  const validateImage = useCallback(async (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'File too large. Maximum size is 10MB.' };
    }

    // Check file type
    if (!file.type.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
      return { valid: false, error: 'Invalid file type. Please upload PNG, JPG, or SVG.' };
    }

    // Read image dimensions
    return new Promise<{ valid: boolean; warning?: string; error?: string }>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);

        const minDimension = Math.min(img.width, img.height);

        // Block if resolution is too low (minimum 2000px)
        if (minDimension < 2000) {
          resolve({
            valid: false,
            error: `Image resolution too low (${img.width}×${img.height}px). For print quality, images must have at least 2000px on the shortest side.`,
          });
        } else {
          resolve({ valid: true });
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ valid: false, error: 'Failed to load image. The file may be corrupted.' });
      };

      img.src = objectUrl;
    });
  }, []);

  const uploadImage = useCallback(
    async (file: File, folder: string = 'user_uploads'): Promise<{ url: string; width: number; height: number; publicId: string } | null> => {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Validate image first
        const validation = await validateImage(file);
        if (!validation.valid) {
          setError(validation.error || 'Invalid image');
          setIsUploading(false);
          return null;
        }

        // Get image dimensions first
        const img = new Image();
        const tempUrl = URL.createObjectURL(file);
        img.src = tempUrl;
        await img.decode();
        const { width, height } = img;
        URL.revokeObjectURL(tempUrl);

        // Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', `rfm_images/${folder}`);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        
        setUploadProgress(100);
        setIsUploading(false);

        return {
          url: data.secure_url,
          width,
          height,
          publicId: data.public_id,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to upload image';
        setError(errorMessage);
        setIsUploading(false);
        return null;
      }
    },
    [validateImage, CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET]
  );

  return {
    uploadImage,
    validateImage,
    isUploading,
    uploadProgress,
    error,
  };
}
