/**
 * Canvas Resources Routes
 * API endpoints for graphics and patterns
 */

import { Router, Request, Response } from 'express';
import {
  createGraphic,
  getAllGraphics,
  deleteGraphic,
  getGraphicById,
  createPattern,
  getAllPatterns,
  deletePattern,
  getPatternById,
} from '../services/canvasResources.service';
import { deleteImage } from '../services/cloudinary.service';

const router = Router();

// ==================== GRAPHICS ====================

/**
 * POST /api/canvas-resources/graphics
 * Create a new graphic
 */
router.post('/graphics', async (req: Request, res: Response) => {
  try {
    const graphic = await createGraphic(req.body);
    res.json(graphic);
  } catch (error: any) {
    console.error('Error creating graphic:', error);
    res.status(500).json({ error: 'Failed to create graphic', details: error.message });
  }
});

/**
 * GET /api/canvas-resources/graphics
 * Get all graphics (optional: filter by category)
 */
router.get('/graphics', async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const graphics = await getAllGraphics(category);
    res.json(graphics);
  } catch (error: any) {
    console.error('Error fetching graphics:', error);
    res.status(500).json({ error: 'Failed to fetch graphics', details: error.message });
  }
});

/**
 * DELETE /api/canvas-resources/graphics/:id
 * Delete a graphic (also deletes from Cloudinary)
 */
router.delete('/graphics/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get graphic to retrieve Cloudinary public_id
    const graphic = await getGraphicById(id);
    if (!graphic) {
      return res.status(404).json({ error: 'Graphic not found' });
    }

    // Delete from Cloudinary
    await deleteImage(graphic.cloudinary_public_id);

    // Delete from database
    await deleteGraphic(id);

    res.json({ success: true, message: 'Graphic deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting graphic:', error);
    res.status(500).json({ error: 'Failed to delete graphic', details: error.message });
  }
});

// ==================== PATTERNS ====================

/**
 * POST /api/canvas-resources/patterns
 * Create a new pattern
 */
router.post('/patterns', async (req: Request, res: Response) => {
  try {
    const pattern = await createPattern(req.body);
    res.json(pattern);
  } catch (error: any) {
    console.error('Error creating pattern:', error);
    res.status(500).json({ error: 'Failed to create pattern', details: error.message });
  }
});

/**
 * GET /api/canvas-resources/patterns
 * Get all patterns
 */
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const patterns = await getAllPatterns();
    res.json(patterns);
  } catch (error: any) {
    console.error('Error fetching patterns:', error);
    res.status(500).json({ error: 'Failed to fetch patterns', details: error.message });
  }
});

/**
 * DELETE /api/canvas-resources/patterns/:id
 * Delete a pattern (also deletes from Cloudinary)
 */
router.delete('/patterns/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    // Get pattern to retrieve Cloudinary public_id
    const pattern = await getPatternById(id);
    if (!pattern) {
      return res.status(404).json({ error: 'Pattern not found' });
    }

    // Delete from Cloudinary
    await deleteImage(pattern.cloudinary_public_id);

    // Delete from database
    await deletePattern(id);

    res.json({ success: true, message: 'Pattern deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting pattern:', error);
    res.status(500).json({ error: 'Failed to delete pattern', details: error.message });
  }
});

export default router;
