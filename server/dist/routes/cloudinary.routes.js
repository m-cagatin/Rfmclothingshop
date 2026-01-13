"use strict";
/**
 * Cloudinary Routes
 * Handles image deletion operations
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cloudinary_service_1 = require("../services/cloudinary.service");
const router = (0, express_1.Router)();
/**
 * DELETE /api/cloudinary/delete
 * Delete a single image from Cloudinary
 */
router.post('/delete', async (req, res) => {
    try {
        const { publicId } = req.body;
        if (!publicId || typeof publicId !== 'string') {
            return res.status(400).json({
                error: 'Public ID is required and must be a string'
            });
        }
        await (0, cloudinary_service_1.deleteImage)(publicId);
        res.json({
            success: true,
            message: 'Image deleted successfully',
            publicId
        });
    }
    catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({
            error: 'Failed to delete image',
            details: error.message
        });
    }
});
exports.default = router;
