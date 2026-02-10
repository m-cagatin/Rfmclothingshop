"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userDesign_service_1 = require("../services/userDesign.service");
const router = express_1.default.Router();
/**
 * POST /api/design/save
 * Save or update current design
 */
router.post('/save', async (req, res) => {
    try {
        const { userId, customizableProductId, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson, frontThumbnailUrl, backThumbnailUrl } = req.body;
        // Validation
        if (!userId || !customizableProductId || !selectedSize || !selectedPrintOption) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, customizableProductId, selectedSize, selectedPrintOption'
            });
        }
        const savedDesign = await userDesign_service_1.UserDesignService.saveDesign({
            userId,
            customizableProductId,
            selectedSize,
            selectedPrintOption,
            printAreaPreset,
            frontCanvasJson,
            backCanvasJson,
            frontThumbnailUrl,
            backThumbnailUrl
        });
        return res.status(200).json({
            success: true,
            message: 'Design saved successfully',
            data: savedDesign
        });
    }
    catch (error) {
        console.error('Error saving design:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to save design',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/design/load/last-used
 * Get the most recently edited design to restore variant on page refresh
 */
router.get('/load/last-used', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: userId'
            });
        }
        const lastDesign = await userDesign_service_1.UserDesignService.getLastUsedDesign(userId);
        if (!lastDesign) {
            return res.status(404).json({
                success: false,
                message: 'No previous design found'
            });
        }
        return res.status(200).json({
            success: true,
            data: lastDesign
        });
    }
    catch (error) {
        console.error('Error loading last-used design:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load last-used design',
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
        const design = await userDesign_service_1.UserDesignService.loadDesign(userId, parseInt(productId));
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
    }
    catch (error) {
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
        const deleted = await userDesign_service_1.UserDesignService.deleteDesign(userId, parseInt(productId));
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
    }
    catch (error) {
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
        const designs = await userDesign_service_1.UserDesignService.getAllUserDesigns(userId);
        return res.status(200).json({
            success: true,
            message: 'Designs loaded successfully',
            data: designs
        });
    }
    catch (error) {
        console.error('Error loading designs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load designs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
