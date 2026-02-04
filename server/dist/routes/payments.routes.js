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
const paymentsService = __importStar(require("../services/payments.service"));
const router = (0, express_1.Router)();
/**
 * POST /api/payments
 * Submit a payment with reference number
 */
router.post('/', async (req, res) => {
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
            }
            catch (e) {
                return res.status(400).json({ error: 'Invalid customerInfo format' });
            }
        }
        if (typeof orderItems === 'string') {
            try {
                parsedOrderItems = JSON.parse(orderItems);
            }
            catch (e) {
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
    }
    catch (error) {
        console.error('Error submitting payment:', error);
        res.status(500).json({ error: error.message || 'Failed to submit payment' });
    }
});
/**
 * GET /api/payments
 * Get all payments with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const filters = {};
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
    }
    catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});
/**
 * GET /api/payments/:id
 * Get single payment by ID
 */
router.get('/:id', async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});
/**
 * PUT /api/payments/:id/approve
 * Approve a payment (admin only)
 */
router.put('/:id/approve', async (req, res) => {
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
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../prisma')));
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
            }
            catch (error) {
                console.error('Error creating admin user in Users table:', error);
                // If creation fails, try to find any admin user as fallback
                // Roles is a JSON field - try to find any user with Admin role
                const allUsers = await prisma.users.findMany({
                    select: { UserId: true, Roles: true },
                });
                const fallbackAdmin = allUsers.find((u) => {
                    if (!u.Roles)
                        return false;
                    const roles = typeof u.Roles === 'string' ? JSON.parse(u.Roles) : u.Roles;
                    return roles?.role === 'Admin' || roles === 'Admin';
                });
                if (fallbackAdmin) {
                    usersRecord = { UserId: fallbackAdmin.UserId };
                }
                else {
                    return res.status(500).json({ error: 'Failed to set up admin user. Please contact system administrator.' });
                }
            }
        }
        const verifiedBy = usersRecord.UserId;
        const result = await paymentsService.approvePayment(paymentId, verifiedBy);
        res.json(result);
    }
    catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ error: error.message || 'Failed to approve payment' });
    }
});
/**
 * PUT /api/payments/:id/reject
 * Reject a payment (admin only)
 */
router.put('/:id/reject', async (req, res) => {
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
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../prisma')));
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
            }
            catch (error) {
                console.error('Error creating admin user in Users table:', error);
                // If creation fails, try to find any admin user as fallback
                // Roles is a JSON field - try to find any user with Admin role
                const allUsers = await prisma.users.findMany({
                    select: { UserId: true, Roles: true },
                });
                const fallbackAdmin = allUsers.find((u) => {
                    if (!u.Roles)
                        return false;
                    const roles = typeof u.Roles === 'string' ? JSON.parse(u.Roles) : u.Roles;
                    return roles?.role === 'Admin' || roles === 'Admin';
                });
                if (fallbackAdmin) {
                    usersRecord = { UserId: fallbackAdmin.UserId };
                }
                else {
                    return res.status(500).json({ error: 'Failed to set up admin user. Please contact system administrator.' });
                }
            }
        }
        const verifiedBy = usersRecord.UserId;
        const result = await paymentsService.rejectPayment(paymentId, verifiedBy);
        res.json(result);
    }
    catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ error: error.message || 'Failed to reject payment' });
    }
});
exports.default = router;
