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
const catalogProductsService = __importStar(require("../services/catalogProducts.service"));
const router = (0, express_1.Router)();
// Get all catalog products
router.get('/', async (req, res) => {
    try {
        const products = await catalogProductsService.getAllProducts();
        res.json(products);
    }
    catch (error) {
        console.error('Error fetching catalog products:', error);
        res.status(500).json({ error: 'Failed to fetch catalog products' });
    }
});
// Get single catalog product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await catalogProductsService.getProductById(Number(req.params.id));
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }
    catch (error) {
        console.error('Error fetching catalog product:', error);
        res.status(500).json({ error: 'Failed to fetch catalog product' });
    }
});
// Create new catalog product
router.post('/', async (req, res) => {
    try {
        const product = await catalogProductsService.createProduct(req.body);
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Error creating catalog product:', error);
        res.status(500).json({ error: 'Failed to create catalog product' });
    }
});
// Update catalog product
router.put('/:id', async (req, res) => {
    try {
        console.log('Update request for product:', req.params.id);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        const product = await catalogProductsService.updateProduct(Number(req.params.id), req.body);
        res.json(product);
    }
    catch (error) {
        console.error('Error updating catalog product:', error);
        console.error('Error details:', error.message, error.stack);
        res.status(500).json({ error: 'Failed to update catalog product', details: error.message });
    }
});
// Update product status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const product = await catalogProductsService.updateProductStatus(Number(req.params.id), status);
        res.json(product);
    }
    catch (error) {
        console.error('Error updating product status:', error);
        res.status(500).json({ error: 'Failed to update product status' });
    }
});
// Delete catalog product
router.delete('/:id', async (req, res) => {
    try {
        await catalogProductsService.deleteProduct(Number(req.params.id));
        res.status(204).send();
    }
    catch (error) {
        console.error('Error deleting catalog product:', error);
        res.status(500).json({ error: 'Failed to delete catalog product' });
    }
});
exports.default = router;
