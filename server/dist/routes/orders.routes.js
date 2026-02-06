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
const ordersService = __importStar(require("../services/orders.service"));
const router = (0, express_1.Router)();
/**
 * GET /api/orders
 * Get all orders with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.status) {
            filters.status = req.query.status;
        }
        if (req.query.customerEmail) {
            filters.customerEmail = req.query.customerEmail;
        }
        const orders = await ordersService.getAllOrders(filters);
        res.json(orders);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Failed to fetch orders',
            details: error.message || 'Unknown error'
        });
    }
});
/**
 * GET /api/orders/:orderRef
 * Get single order by order_ref (can be order_ref or order_id)
 */
router.get('/:orderRef', async (req, res) => {
    try {
        const { orderRef } = req.params;
        // Try to get by order_ref first
        let order = await ordersService.getOrderByRef(orderRef);
        // If not found, try to get by order_id (numeric)
        if (!order && !isNaN(Number(orderRef))) {
            const allOrders = await ordersService.getAllOrders();
            order = allOrders.find(o => o.orderId === Number(orderRef)) || null;
        }
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});
/**
 * PUT /api/orders/:orderId/status
 * Update order status
 */
router.put('/:orderId/status', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const { status } = req.body;
        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }
        if (!status || typeof status !== 'string') {
            return res.status(400).json({ error: 'Status is required' });
        }
        const result = await ordersService.updateOrderStatus(orderId, status);
        res.json(result);
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: error.message || 'Failed to update order status' });
    }
});
/**
 * PUT /api/orders/:orderId/shipping
 * Update shipping details
 */
router.put('/:orderId/shipping', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        const { trackingNumber, carrier, shippedDate, estimatedDelivery } = req.body;
        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }
        const result = await ordersService.updateShippingDetails(orderId, {
            trackingNumber,
            carrier,
            shippedDate: shippedDate ? new Date(shippedDate) : null,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error updating shipping details:', error);
        res.status(500).json({ error: error.message || 'Failed to update shipping details' });
    }
});
/**
 * PUT /api/orders/:orderId/delivered
 * Mark order as delivered
 */
router.put('/:orderId/delivered', async (req, res) => {
    try {
        const orderId = parseInt(req.params.orderId);
        if (isNaN(orderId)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }
        const result = await ordersService.updateOrderStatus(orderId, 'delivered');
        res.json(result);
    }
    catch (error) {
        console.error('Error marking order as delivered:', error);
        res.status(500).json({ error: error.message || 'Failed to mark order as delivered' });
    }
});
/**
 * DELETE /api/orders/clear-all
 * Clear all orders (for testing)
 */
router.delete('/clear-all', async (req, res) => {
    try {
        const result = await ordersService.clearAllOrders();
        res.json({
            success: true,
            message: 'All orders cleared successfully',
            ...result,
        });
    }
    catch (error) {
        console.error('Error clearing orders:', error);
        res.status(500).json({ error: error.message || 'Failed to clear orders' });
    }
});
exports.default = router;
