"use strict";
/**
 * Custom Design Routes
 * Handles upload of custom design previews to Cloudinary
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const router = express_1.default.Router();
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Configure multer for memory storage
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
/**
 * POST /api/custom-design/upload-preview
 * Upload design preview image to Cloudinary
 */
router.post('/upload-preview', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'No image file provided' });
        }
        const { userId, productId, view } = req.body;
        if (!userId || !productId || !view) {
            return res.status(400).json({ error: 'Missing required fields: userId, productId, view' });
        }
        // Upload to Cloudinary with custom folder structure
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: `rfm_images/custom_designs/${userId}`,
            public_id: `design_${productId}_${view}_${Date.now()}`,
            resource_type: 'image',
            transformation: [
                { quality: 'auto:best' },
                { fetch_format: 'auto' }
            ]
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ error: 'Failed to upload image' });
            }
            res.json({
                url: result?.secure_url,
                publicId: result?.public_id,
                width: result?.width,
                height: result?.height,
                format: result?.format,
            });
        });
        // Stream the buffer to Cloudinary
        uploadStream.end(file.buffer);
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
