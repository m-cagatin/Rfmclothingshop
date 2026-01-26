/**
 * Custom Design Routes
 * Handles upload of custom design previews to Cloudinary
 */

import express, { Request, Response } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/custom-design/upload-preview
 * Upload design preview image to Cloudinary
 */
router.post('/upload-preview', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    
    if (!file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { userId, productId, view } = req.body;

    if (!userId || !productId || !view) {
      return res.status(400).json({ error: 'Missing required fields: userId, productId, view' });
    }

    // Upload to Cloudinary with custom folder structure
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `rfm_images/custom_designs/${userId}`,
        public_id: `design_${productId}_${view}_${Date.now()}`,
        resource_type: 'image',
        transformation: [
          { quality: 'auto:best' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ error: 'Failed to upload image' });
        }

        res.json({
          url: result?.secure_url,
          publicId: result?.public_id,
          width: result?.width,
          height: result?.height,
          format: result?.format,
        });
      }
    );

    // Stream the buffer to Cloudinary
    uploadStream.end(file.buffer);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
