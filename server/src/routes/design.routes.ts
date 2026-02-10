/**
 * Design Routes
 * API endpoints for saving and loading current designs (draft state)
 */

import { Router, Request, Response } from 'express';
import * as designService from '../services/design.service';

const router = Router();

/**
 * POST /api/design/save
 * Save or update current design
 */
router.post('/save', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      customizableProductId,
      selectedSize,
      selectedPrintOption,
      printAreaPreset,
      frontCanvasJson,
      backCanvasJson,
      frontThumbnailUrl,
      backThumbnailUrl,
    } = req.body;

    // Validate required fields
    if (!userId || !customizableProductId) {
      return res.status(400).json({
        error: 'Missing required fields: userId, customizableProductId',
      });
    }

    const design = await designService.saveCurrentDesign({
      userId,
      customizableProductId: parseInt(customizableProductId),
      selectedSize: selectedSize || 'M',
      selectedPrintOption: selectedPrintOption || 'none',
      printAreaPreset: printAreaPreset || 'Letter',
      frontCanvasJson,
      backCanvasJson,
      frontThumbnailUrl,
      backThumbnailUrl,
    });

    res.json({
      success: true,
      data: design,
    });
  } catch (error) {
    console.error('Error saving design:', error);
    res.status(500).json({
      error: 'Failed to save design',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/design/load/last-used
 * Get the most recently used design for a user
 */
router.get('/load/last-used', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Missing required query parameter: userId',
      });
    }

    const design = await designService.getLastUsedDesign(userId);

    if (!design) {
      return res.status(404).json({
        error: 'No saved design found',
      });
    }

    res.json({
      success: true,
      data: design,
    });
  } catch (error) {
    console.error('Error loading last-used design:', error);
    res.status(500).json({
      error: 'Failed to load design',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/design/load/:productId
 * Get current design for a specific product
 */
router.get('/load/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Missing required query parameter: userId',
      });
    }

    const design = await designService.getCurrentDesignForProduct(
      userId,
      parseInt(productId)
    );

    if (!design) {
      return res.status(404).json({
        error: 'No saved design found for this product',
      });
    }

    res.json({
      success: true,
      data: design,
    });
  } catch (error) {
    console.error('Error loading design:', error);
    res.status(500).json({
      error: 'Failed to load design',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/design/:productId
 * Delete current design for a product
 */
router.delete('/:productId', async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Missing required query parameter: userId',
      });
    }

    await designService.deleteCurrentDesign(userId, parseInt(productId));

    res.json({
      success: true,
      message: 'Design deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting design:', error);
    res.status(500).json({
      error: 'Failed to delete design',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/design/all
 * Get all current designs for a user
 */
router.get('/all', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({
        error: 'Missing required query parameter: userId',
      });
    }

    const designs = await designService.getAllCurrentDesigns(userId);

    res.json({
      success: true,
      data: designs,
    });
  } catch (error) {
    console.error('Error loading designs:', error);
    res.status(500).json({
      error: 'Failed to load designs',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
