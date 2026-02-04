import express from 'express';
import { SavedDesignsService } from '../services/savedDesigns.service';

const router = express.Router();

/**
 * POST /api/saved-designs/save
 * Save design to permanent library
 */
router.post('/save', async (req, res) => {
  try {
    const {
      userId,
      customizableProductId,
      designName,
      selectedSize,
      selectedPrintOption,
      printAreaPreset,
      frontCanvasJson,
      backCanvasJson,
      frontThumbnailUrl,
      backThumbnailUrl,
      tags
    } = req.body;

    // Validation
    if (!userId || !customizableProductId || !designName || !selectedSize || !selectedPrintOption) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, customizableProductId, designName, selectedSize, selectedPrintOption'
      });
    }

    const savedDesign = await SavedDesignsService.saveToLibrary({
      userId,
      customizableProductId,
      designName,
      selectedSize,
      selectedPrintOption,
      printAreaPreset,
      frontCanvasJson,
      backCanvasJson,
      frontThumbnailUrl,
      backThumbnailUrl,
      tags
    });

    return res.status(200).json({
      success: true,
      message: 'Design saved to library successfully',
      data: savedDesign
    });
  } catch (error) {
    console.error('Error saving design to library:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save design to library',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/saved-designs/all
 * Get all saved designs for the current user
 */
router.get('/all', async (req, res) => {
  try {
    const { userId } = req.query;

    // Validation
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: userId'
      });
    }

    const designs = await SavedDesignsService.getAllSavedDesigns(userId as string);

    return res.status(200).json({
      success: true,
      message: 'Saved designs loaded successfully',
      data: designs
    });
  } catch (error) {
    console.error('Error loading saved designs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load saved designs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/saved-designs/:id
 * Delete saved design from library
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Validation
    if (!userId || !id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, id'
      });
    }

    const deleted = await SavedDesignsService.deleteSavedDesign(parseInt(id), userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Saved design not found or you do not have permission to delete it'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Saved design deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting saved design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete saved design',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/saved-designs/:id
 * Get single saved design by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    // Validation
    if (!userId || !id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, id'
      });
    }

    const design = await SavedDesignsService.getSavedDesignById(parseInt(id), userId as string);

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'Saved design not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Saved design loaded successfully',
      data: design
    });
  } catch (error) {
    console.error('Error loading saved design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load saved design',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
