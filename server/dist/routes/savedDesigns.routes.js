"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const savedDesigns_service_1 = require("../services/savedDesigns.service");
const router = express_1.default.Router();
/**
 * POST /api/saved-designs/save
 * Save design to permanent library
 */
router.post('/save', async (req, res) => {
    try {
        const { userId, customizableProductId, designName, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson, frontThumbnailUrl, backThumbnailUrl, tags } = req.body;
        // Validation
        if (!userId || !customizableProductId || !designName || !selectedSize || !selectedPrintOption) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, customizableProductId, designName, selectedSize, selectedPrintOption'
            });
        }
        const savedDesign = await savedDesigns_service_1.SavedDesignsService.saveToLibrary({
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
    }
    catch (error) {
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
        const designs = await savedDesigns_service_1.SavedDesignsService.getAllSavedDesigns(userId);
        return res.status(200).json({
            success: true,
            message: 'Saved designs loaded successfully',
            data: designs
        });
    }
    catch (error) {
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
        const deleted = await savedDesigns_service_1.SavedDesignsService.deleteSavedDesign(parseInt(id), userId);
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
    }
    catch (error) {
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
        const design = await savedDesigns_service_1.SavedDesignsService.getSavedDesignById(parseInt(id), userId);
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
    }
    catch (error) {
        console.error('Error loading saved design:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to load saved design',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * GET /api/saved-designs/search
 * Search and filter saved designs
 */
router.get('/search', async (req, res) => {
    try {
        const { userId, category, size, search, onlyFavorites } = req.query;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameter: userId'
            });
        }
        const designs = await savedDesigns_service_1.SavedDesignsService.searchDesigns(userId, {
            category: category,
            size: size,
            search: search,
            onlyFavorites: onlyFavorites === 'true'
        });
        return res.status(200).json({
            success: true,
            message: 'Designs retrieved successfully',
            data: designs
        });
    }
    catch (error) {
        console.error('Error searching designs:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to search designs',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
/**
 * PATCH /api/saved-designs/:id/favorite
 * Toggle favorite status
 */
router.patch('/:id/favorite', async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
        if (!userId || !id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: userId, id'
            });
        }
        const design = await savedDesigns_service_1.SavedDesignsService.toggleFavorite(parseInt(id), userId);
        return res.status(200).json({
            success: true,
            message: 'Favorite status updated',
            data: design
        });
    }
    catch (error) {
        console.error('Error toggling favorite:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to toggle favorite',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.default = router;
