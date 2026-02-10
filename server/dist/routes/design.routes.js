"use strict";
/**
 * Design Routes
 * API endpoints for saving and loading current designs (draft state)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const designService = __importStar(require("../services/design.service"));
const router = (0, express_1.Router)();
/**
 * POST /api/design/save
 * Save or update current design
 */
router.post('/save', async (req, res) => {
    try {
        const { userId, customizableProductId, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson, frontThumbnailUrl, backThumbnailUrl, } = req.body;
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
    }
    catch (error) {
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
router.get('/load/last-used', async (req, res) => {
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
    }
    catch (error) {
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
router.get('/load/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({
                error: 'Missing required query parameter: userId',
            });
        }
        const design = await designService.getCurrentDesignForProduct(userId, parseInt(productId));
        if (!design) {
            return res.status(404).json({
                error: 'No saved design found for this product',
            });
        }
        res.json({
            success: true,
            data: design,
        });
    }
    catch (error) {
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
router.delete('/:productId', async (req, res) => {
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
    }
    catch (error) {
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
router.get('/all', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error loading designs:', error);
        res.status(500).json({
            error: 'Failed to load designs',
            details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
exports.default = router;
