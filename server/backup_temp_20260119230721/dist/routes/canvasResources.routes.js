"use strict";
/**
 * Canvas Resources Routes
 * API endpoints for graphics and patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const canvasResources_service_1 = require("../services/canvasResources.service");
const cloudinary_service_1 = require("../services/cloudinary.service");
const router = (0, express_1.Router)();
// ==================== GRAPHICS ====================
/**
 * POST /api/canvas-resources/graphics
 * Create a new graphic
 */
router.post('/graphics', async (req, res) => {
    try {
        const graphic = await (0, canvasResources_service_1.createGraphic)(req.body);
        res.json(graphic);
    }
    catch (error) {
        console.error('Error creating graphic:', error);
        res.status(500).json({ error: 'Failed to create graphic', details: error.message });
    }
});
/**
 * GET /api/canvas-resources/graphics
 * Get all graphics (optional: filter by category)
 */
router.get('/graphics', async (req, res) => {
    try {
        const category = req.query.category;
        const graphics = await (0, canvasResources_service_1.getAllGraphics)(category);
        res.json(graphics);
    }
    catch (error) {
        console.error('Error fetching graphics:', error);
        res.status(500).json({ error: 'Failed to fetch graphics', details: error.message });
    }
});
/**
 * DELETE /api/canvas-resources/graphics/:id
 * Delete a graphic (also deletes from Cloudinary)
 */
router.delete('/graphics/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Get graphic to retrieve Cloudinary public_id
        const graphic = await (0, canvasResources_service_1.getGraphicById)(id);
        if (!graphic) {
            return res.status(404).json({ error: 'Graphic not found' });
        }
        // Delete from Cloudinary
        await (0, cloudinary_service_1.deleteImage)(graphic.cloudinary_public_id);
        // Delete from database
        await (0, canvasResources_service_1.deleteGraphic)(id);
        res.json({ success: true, message: 'Graphic deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting graphic:', error);
        res.status(500).json({ error: 'Failed to delete graphic', details: error.message });
    }
});
// ==================== PATTERNS ====================
/**
 * POST /api/canvas-resources/patterns
 * Create a new pattern
 */
router.post('/patterns', async (req, res) => {
    try {
        const pattern = await (0, canvasResources_service_1.createPattern)(req.body);
        res.json(pattern);
    }
    catch (error) {
        console.error('Error creating pattern:', error);
        res.status(500).json({ error: 'Failed to create pattern', details: error.message });
    }
});
/**
 * GET /api/canvas-resources/patterns
 * Get all patterns
 */
router.get('/patterns', async (req, res) => {
    try {
        const patterns = await (0, canvasResources_service_1.getAllPatterns)();
        res.json(patterns);
    }
    catch (error) {
        console.error('Error fetching patterns:', error);
        res.status(500).json({ error: 'Failed to fetch patterns', details: error.message });
    }
});
/**
 * DELETE /api/canvas-resources/patterns/:id
 * Delete a pattern (also deletes from Cloudinary)
 */
router.delete('/patterns/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        // Get pattern to retrieve Cloudinary public_id
        const pattern = await (0, canvasResources_service_1.getPatternById)(id);
        if (!pattern) {
            return res.status(404).json({ error: 'Pattern not found' });
        }
        // Delete from Cloudinary
        await (0, cloudinary_service_1.deleteImage)(pattern.cloudinary_public_id);
        // Delete from database
        await (0, canvasResources_service_1.deletePattern)(id);
        res.json({ success: true, message: 'Pattern deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting pattern:', error);
        res.status(500).json({ error: 'Failed to delete pattern', details: error.message });
    }
});
exports.default = router;
