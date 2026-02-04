import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import * as ordersService from '../services/orders.service';

const router = Router();
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access';

/** Get current user id from JWT cookie, or null if not authenticated */
function getCurrentUserId(req: Request): string | null {
  try {
    const token = req.cookies?.access;
    if (!token) return null;
    const decoded = jwt.verify(token, ACCESS_SECRET) as { sub: string };
    return decoded.sub;
  } catch {
    return null;
  }
}

/**
 * GET /api/orders
 * Get all orders with optional filters.
 * When customerEmail is provided, only returns orders for that email (caller must match).
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: any = {};

    if (req.query.status) {
      filters.status = req.query.status as string;
    }

    if (req.query.customerEmail) {
      const requestedEmail = (req.query.customerEmail as string).trim().toLowerCase();
      const userId = getCurrentUserId(req);
      if (!userId) {
        return res.status(401).json({ error: 'You must be logged in to view orders' });
      }
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }
      const userEmail = user.email.trim().toLowerCase();
      if (requestedEmail !== userEmail) {
        return res.status(403).json({ error: 'You can only view your own orders' });
      }
      filters.customerEmail = requestedEmail;
    }

    const orders = await ordersService.getAllOrders(filters);
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      error: 'Failed to fetch orders',
      details: error.message || 'Unknown error',
    });
  }
});

/**
 * GET /api/orders/:orderRef
 * Get single order by order_ref. Only the customer who placed the order can view it (must be logged in, email must match).
 */
router.get('/:orderRef', async (req: Request, res: Response) => {
  try {
    const { orderRef } = req.params;

    // Try to get by order_ref first
    let order = await ordersService.getOrderByRef(orderRef);

    // If not found, try to get by order_id (numeric)
    if (!order && !isNaN(Number(orderRef))) {
      const allOrders = await ordersService.getAllOrders();
      order = allOrders.find((o) => o.orderId === Number(orderRef)) || null;
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'You must be logged in to view this order' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const orderEmail = (order.customer?.email || '').trim().toLowerCase();
    const userEmail = user.email.trim().toLowerCase();
    if (orderEmail !== userEmail) {
      return res.status(403).json({ error: 'You can only view your own orders' });
    }

    res.json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * PUT /api/orders/:orderId/status
 * Update order status
 */
router.put('/:orderId/status', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
});

/**
 * PUT /api/orders/:orderId/shipping
 * Update shipping details
 */
router.put('/:orderId/shipping', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error updating shipping details:', error);
    res.status(500).json({ error: error.message || 'Failed to update shipping details' });
  }
});

/**
 * PUT /api/orders/:orderId/delivered
 * Mark order as delivered
 */
router.put('/:orderId/delivered', async (req: Request, res: Response) => {
  try {
    const orderId = parseInt(req.params.orderId);
    
    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    const result = await ordersService.updateOrderStatus(orderId, 'delivered');
    res.json(result);
  } catch (error: any) {
    console.error('Error marking order as delivered:', error);
    res.status(500).json({ error: error.message || 'Failed to mark order as delivered' });
  }
});

/**
 * DELETE /api/orders/clear-all
 * Clear all orders (for testing)
 */
router.delete('/clear-all', async (req: Request, res: Response) => {
  try {
    const result = await ordersService.clearAllOrders();
    res.json({
      success: true,
      message: 'All orders cleared successfully',
      ...result,
    });
  } catch (error: any) {
    console.error('Error clearing orders:', error);
    res.status(500).json({ error: error.message || 'Failed to clear orders' });
  }
});

export default router;

