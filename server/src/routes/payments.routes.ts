import { Router, Request, Response } from 'express';
import * as paymentsService from '../services/payments.service';

const router = Router();

/**
 * POST /api/payments
 * Submit a payment with reference number
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { orderId, amount, paymentType, referenceNumber, total, customerInfo, orderItems } = req.body;

    if (!orderId || !amount || !paymentType || !referenceNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields: orderId, amount, paymentType, referenceNumber' 
      });
    }

    if (!referenceNumber || referenceNumber.trim() === '') {
      return res.status(400).json({ 
        error: 'GCash reference number is required' 
      });
    }

    // Parse JSON fields if they're strings
    let parsedCustomerInfo = customerInfo;
    let parsedOrderItems = orderItems;
    
    if (typeof customerInfo === 'string') {
      try {
        parsedCustomerInfo = JSON.parse(customerInfo);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid customerInfo format' });
      }
    }
    
    if (typeof orderItems === 'string') {
      try {
        parsedOrderItems = JSON.parse(orderItems);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid orderItems format' });
      }
    }

    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    if (paymentType !== 'partial' && paymentType !== 'full') {
      return res.status(400).json({ error: 'Invalid payment type. Must be "partial" or "full"' });
    }

    const result = await paymentsService.submitPayment({
      orderId,
      amount: paymentAmount,
      paymentType,
      referenceNumber: referenceNumber.trim(),
      total: total ? parseFloat(total) : undefined,
      customerInfo: parsedCustomerInfo,
      orderItems: parsedOrderItems,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Error submitting payment:', error);
    res.status(500).json({ error: error.message || 'Failed to submit payment' });
  }
});

/**
 * GET /api/payments
 * Get all payments with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: any = {};
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.paymentMethod) {
      filters.paymentMethod = req.query.paymentMethod;
    }
    
    if (req.query.paymentType) {
      filters.paymentType = req.query.paymentType;
    }

    const payments = await paymentsService.getPayments(filters);
    res.json(payments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

/**
 * GET /api/payments/:id
 * Get single payment by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    const payment = await paymentsService.getPaymentById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

/**
 * PUT /api/payments/:id/approve
 * Approve a payment (admin only)
 */
router.put('/:id/approve', async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    const verifiedByUserString = req.body.verifiedBy; // User.id (string UUID)
    
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    if (!verifiedByUserString) {
      return res.status(401).json({ error: 'Unauthorized - verifiedBy is required' });
    }

    // Get the User by id to verify they're an admin
    const { prisma } = await import('../prisma');
    const user = await prisma.user.findUnique({
      where: { id: verifiedByUserString },
      select: { email: true, role: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can approve payments' });
    }

    // Find or create the corresponding Users record by email
    let usersRecord = await prisma.users.findUnique({
      where: { Email: user.email },
      select: { UserId: true },
    });

    // If admin doesn't exist in Users table, create them
    if (!usersRecord) {
      try {
        // Get the highest UserId to create a new one
        const maxUser = await prisma.users.findFirst({
          orderBy: { UserId: 'desc' },
          select: { UserId: true },
        });
        
        const newUserId = maxUser ? maxUser.UserId + 1 : 1;
        
        usersRecord = await prisma.users.create({
          data: {
            UserId: newUserId,
            Email: user.email,
            FullName: user.name || 'Admin User',
            PasswordHash: '', // Empty since auth is handled by User table
            Roles: { role: 'Admin' }, // Roles is a JSON field
          },
          select: { UserId: true },
        });
      } catch (error: any) {
        console.error('Error creating admin user in Users table:', error);
        // If creation fails, try to find any admin user as fallback
        // Roles is a JSON field - try to find any user with Admin role
        const allUsers = await prisma.users.findMany({
          select: { UserId: true, Roles: true },
        });
        
        const fallbackAdmin = allUsers.find((u: any) => {
          if (!u.Roles) return false;
          const roles = typeof u.Roles === 'string' ? JSON.parse(u.Roles) : u.Roles;
          return roles?.role === 'Admin' || roles === 'Admin';
        });
        
        if (fallbackAdmin) {
          usersRecord = { UserId: fallbackAdmin.UserId };
        } else {
          return res.status(500).json({ error: 'Failed to set up admin user. Please contact system administrator.' });
        }
      }
    }

    const verifiedBy = usersRecord.UserId;

    const result = await paymentsService.approvePayment(paymentId, verifiedBy);
    res.json(result);
  } catch (error: any) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: error.message || 'Failed to approve payment' });
  }
});

/**
 * PUT /api/payments/:id/reject
 * Reject a payment (admin only)
 */
router.put('/:id/reject', async (req: Request, res: Response) => {
  try {
    const paymentId = parseInt(req.params.id);
    const verifiedByUserString = req.body.verifiedBy; // User.id (string UUID)
    
    if (isNaN(paymentId)) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }

    if (!verifiedByUserString) {
      return res.status(401).json({ error: 'Unauthorized - verifiedBy is required' });
    }

    // Get the User by id to verify they're an admin
    const { prisma } = await import('../prisma');
    const user = await prisma.user.findUnique({
      where: { id: verifiedByUserString },
      select: { email: true, role: true, name: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can reject payments' });
    }

    // Find or create the corresponding Users record by email
    let usersRecord = await prisma.users.findUnique({
      where: { Email: user.email },
      select: { UserId: true },
    });

    // If admin doesn't exist in Users table, create them
    if (!usersRecord) {
      try {
        // Get the highest UserId to create a new one
        const maxUser = await prisma.users.findFirst({
          orderBy: { UserId: 'desc' },
          select: { UserId: true },
        });
        
        const newUserId = maxUser ? maxUser.UserId + 1 : 1;
        
        usersRecord = await prisma.users.create({
          data: {
            UserId: newUserId,
            Email: user.email,
            FullName: user.name || 'Admin User',
            PasswordHash: '', // Empty since auth is handled by User table
            Roles: { role: 'Admin' }, // Roles is a JSON field
          },
          select: { UserId: true },
        });
      } catch (error: any) {
        console.error('Error creating admin user in Users table:', error);
        // If creation fails, try to find any admin user as fallback
        // Roles is a JSON field - try to find any user with Admin role
        const allUsers = await prisma.users.findMany({
          select: { UserId: true, Roles: true },
        });
        
        const fallbackAdmin = allUsers.find((u: any) => {
          if (!u.Roles) return false;
          const roles = typeof u.Roles === 'string' ? JSON.parse(u.Roles) : u.Roles;
          return roles?.role === 'Admin' || roles === 'Admin';
        });
        
        if (fallbackAdmin) {
          usersRecord = { UserId: fallbackAdmin.UserId };
        } else {
          return res.status(500).json({ error: 'Failed to set up admin user. Please contact system administrator.' });
        }
      }
    }

    const verifiedBy = usersRecord.UserId;

    const result = await paymentsService.rejectPayment(paymentId, verifiedBy);
    res.json(result);
  } catch (error: any) {
    console.error('Error rejecting payment:', error);
    res.status(500).json({ error: error.message || 'Failed to reject payment' });
  }
});

export default router;

