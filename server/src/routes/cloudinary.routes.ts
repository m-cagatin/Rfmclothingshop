/**
 * Cloudinary Routes
 * Handles image deletion operations
 */

import { Router, Request, Response } from 'express';
import { deleteImage } from '../services/cloudinary.service';

const router = Router();

/**
 * DELETE /api/cloudinary/delete
 * Delete a single image from Cloudinary
 */
router.post('/delete', async (req: Request, res: Response) => {
  try {
    const { publicId } = req.body;

    if (!publicId || typeof publicId !== 'string') {
      return res.status(400).json({ 
        error: 'Public ID is required and must be a string' 
      });
    }

    await deleteImage(publicId);

    res.json({ 
      success: true,
      message: 'Image deleted successfully',
      publicId 
    });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
});

export default router;
