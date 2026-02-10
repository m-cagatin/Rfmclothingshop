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
const inventoryService = __importStar(require("../services/inventory.service"));
const router = (0, express_1.Router)();
/**
 * GET /api/inventory
 * Get all inventory items
 */
router.get('/', async (req, res) => {
    try {
        const items = await inventoryService.getAllItems();
        res.json(items);
    }
    catch (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
});
/**
 * GET /api/inventory/:id
 * Get single inventory item
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const item = await inventoryService.getItemById(id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Error fetching item:', error);
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});
/**
 * POST /api/inventory
 * Create new inventory item
 */
router.post('/', async (req, res) => {
    try {
        const { name, description, category, stock, unit, minLevel, costPerUnit } = req.body;
        if (!name || !category || unit === undefined || minLevel === undefined || costPerUnit === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const item = await inventoryService.createItem({
            name,
            description,
            category,
            stock: stock || 0,
            unit,
            minLevel,
            costPerUnit,
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Error creating item:', error);
        res.status(500).json({ error: error.message || 'Failed to create item' });
    }
});
/**
 * PUT /api/inventory/:id
 * Update inventory item
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, stock, unit, minLevel, costPerUnit, status } = req.body;
        const item = await inventoryService.updateItem(id, {
            name,
            description,
            category,
            stock,
            unit,
            minLevel,
            costPerUnit,
            status,
        });
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    }
    catch (error) {
        console.error('Error updating item:', error);
        res.status(500).json({ error: error.message || 'Failed to update item' });
    }
});
/**
 * DELETE /api/inventory/:id
 * Delete inventory item
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await inventoryService.deleteItem(id);
        if (!deleted) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ success: true, message: 'Item deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting item:', error);
        res.status(500).json({ error: error.message || 'Failed to delete item' });
    }
});
exports.default = router;
