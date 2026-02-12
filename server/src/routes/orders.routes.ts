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

/** Check if current user is admin */
async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  return user?.role === 'admin';
}

/**
 * GET /api/orders/my-orders
 * Get all orders for the currently logged-in user (by user_id).
 * Must come BEFORE /:orderRef to avoid route conflicts.
 */
router.get('/my-orders', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'You must be logged in to view your orders' });
    }

    const orders = await ordersService.getOrdersByUserId(userId);
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/my-orders/count
 * Get count of active (non-delivered, non-cancelled) orders for the logged-in user.
 * Used for the badge indicator in the header.
 */
router.get('/my-orders/count', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const count = await prisma.orders.count({
      where: {
        user_id: userId,
        status: {
          notIn: ['delivered', 'cancelled'],
        },
      },
    });

    res.json({ count });
  } catch (error: any) {
    console.error('Error fetching order count:', error);
    res.status(500).json({ error: 'Failed to fetch order count' });
  }
});

/**
 * GET /api/orders
 * Get all orders with optional filters (admin use).
 * When customerEmail is provided, only returns orders for that email (caller must match).
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    const userId = getCurrentUserId(req);

    if (req.query.status) {
      filters.status = req.query.status as string;
    }

    // If userId query param, filter by user_id
    if (req.query.userId) {
      if (!userId) {
        return res.status(401).json({ error: 'You must be logged in to view orders' });
      }
      // Users can only query their own orders, admins can query any
      const admin = await isAdmin(userId);
      if (!admin && req.query.userId !== userId) {
        return res.status(403).json({ error: 'You can only view your own orders' });
      }
      filters.userId = req.query.userId as string;
    }

    if (req.query.customerEmail) {
      const requestedEmail = (req.query.customerEmail as string).trim().toLowerCase();
      if (!userId) {
        return res.status(401).json({ error: 'You must be logged in to view orders' });
      }
      // Admins can query any email
      const admin = await isAdmin(userId);
      if (!admin) {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        const userEmail = user.email.trim().toLowerCase();
        if (requestedEmail !== userEmail) {
          return res.status(403).json({ error: 'You can only view your own orders' });
        }
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
 * POST /api/orders/check-email
 * Check if an email is already used by another user account.
 * Used during checkout to prevent email conflicts.
 */
router.post('/check-email', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userId = getCurrentUserId(req);

    // Check if email belongs to a different user account
    const existingUser = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail } },
      select: { id: true },
    });

    // If email belongs to another user (not the current logged-in user), it's taken
    if (existingUser && existingUser.id !== userId) {
      return res.json({ taken: true, message: 'This email is registered to another account' });
    }

    return res.json({ taken: false });
  } catch (error: any) {
    console.error('Error checking email:', error);
    res.status(500).json({ error: 'Failed to check email' });
  }
});

/**
 * GET /api/orders/:orderRef
 * Get single order by order_ref. Owner or admin can view.
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

    // Admin can view any order
    const admin = await isAdmin(userId);
    if (!admin) {
      // Check by user_id first (primary), then fallback to email match
      const rawOrder = await prisma.orders.findFirst({
        where: { order_ref: orderRef },
        select: { user_id: true, customer_email: true },
      });

      if (rawOrder?.user_id) {
        // Order has user_id - match by that
        if (rawOrder.user_id !== userId) {
          return res.status(403).json({ error: 'You can only view your own orders' });
        }
      } else {
        // Legacy order without user_id - fallback to email match
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }
        const orderEmail = (order.customer?.email || '').trim().toLowerCase();
        const userEmail = user.email.trim().toLowerCase();
        if (orderEmail !== userEmail) {
          return res.status(403).json({ error: 'You can only view your own orders' });
        }
      }
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

