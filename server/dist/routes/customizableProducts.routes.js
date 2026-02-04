"use strict";
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
const customizableProductsService = __importStar(require("../services/customizableProducts.service"));
const router = (0, express_1.Router)();
/**
 * GET /api/customizable-products
 * Get all customizable products
 */
router.get('/', async (req, res) => {
    try {
        const products = await customizableProductsService.getAllProducts();
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
/**
 * GET /api/customizable-products/:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const product = await customizableProductsService.getProductById(id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});
/**
 * POST /api/customizable-products
 * Create a new customizable product
 */
router.post('/', async (req, res) => {
    try {
        const productData = req.body;
        // Validate required fields
        if (!productData.name || !productData.category || !productData.retailPrice) {
            return res.status(400).json({
                error: 'Missing required fields: name, category, retailPrice'
            });
        }
        if (!productData.images || productData.images.length === 0) {
            return res.status(400).json({
                error: 'At least one product image is required'
            });
        }
        const product = await customizableProductsService.createProduct(productData);
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});
/**
 * PUT /api/customizable-products/:id
 * Update an existing product
 */
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const productData = { ...req.body, id };
        const product = await customizableProductsService.updateProduct(productData);
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});
/**
 * PATCH /api/customizable-products/:id/status
 * Update product status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { status } = req.body;
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        if (!['active', 'inactive', 'archived'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status. Must be: active, inactive, or archived'
            });
        }
        const product = await customizableProductsService.updateProductStatus(id, status);
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ error: 'Failed to update product status' });
    }
});
/**
 * DELETE /api/customizable-products
 * Clear all products
 * NOTE: This route must come before /:id to avoid route conflicts
 */
router.delete('/', async (req, res) => {
    try {
        const result = await customizableProductsService.clearAllProducts();
        res.json({ message: `Successfully deleted ${result.deletedCount} products`, deletedCount: result.deletedCount });
    }
    catch (error) {
        console.error('Error clearing all products:', error);
        res.status(500).json({ error: 'Failed to clear all products' });
    }
});
/**
 * DELETE /api/customizable-products/:id
 * Delete a product
 */
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        await customizableProductsService.deleteProduct(id);
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});
exports.default = router;
