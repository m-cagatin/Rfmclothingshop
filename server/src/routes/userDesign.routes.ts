import express from 'express';
import { UserDesignService } from '../services/userDesign.service';

const router = express.Router();

/**
 * POST /api/design/save
 * Save or update current design
 */
router.post('/save', async (req, res) => {
  try {
    const { userId, customizableProductId, selectedSize, selectedPrintOption, frontCanvasJson, backCanvasJson } = req.body;

    // Validation
    if (!userId || !customizableProductId || !selectedSize || !selectedPrintOption) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: userId, customizableProductId, selectedSize, selectedPrintOption'
      });
    }

    const savedDesign = await UserDesignService.saveDesign({
      userId,
      customizableProductId,
      selectedSize,
      selectedPrintOption,
      frontCanvasJson,
      backCanvasJson
    });

    return res.status(200).json({
      success: true,
      message: 'Design saved successfully',
      data: savedDesign
    });
  } catch (error) {
    console.error('Error saving design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save design',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/design/load/:productId
 * Load current design for a product
 */
router.get('/load/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.query;

    // Validation
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, productId'
      });
    }

    const design = await UserDesignService.loadDesign(userId as string, parseInt(productId));

    if (!design) {
      return res.status(404).json({
        success: false,
        message: 'No saved design found for this product'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Design loaded successfully',
      data: design
    });
  } catch (error) {
    console.error('Error loading design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load design',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/design/delete/:productId
 * Delete current design for a product
 */
router.delete('/delete/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.query;

    // Validation
    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: userId, productId'
      });
    }

    const deleted = await UserDesignService.deleteDesign(userId as string, parseInt(productId));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'No saved design found for this product'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Design deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete design',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/design/all
 * Get all designs for the current user
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

    const designs = await UserDesignService.getAllUserDesigns(userId as string);

    return res.status(200).json({
      success: true,
      message: 'Designs loaded successfully',
      data: designs
    });
  } catch (error) {
    console.error('Error loading designs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to load designs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
