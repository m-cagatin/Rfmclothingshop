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
const cashflowService = __importStar(require("../services/cashflow.service"));
const router = (0, express_1.Router)();
/**
 * POST /api/cashflow/money-in
 * Add money in (income) to cashflow
 */
router.post('/money-in', async (req, res) => {
    try {
        const { description, amount, category, vendor, paymentMethod, date, referenceNumber } = req.body;
        if (!description || !amount) {
            return res.status(400).json({
                error: 'Description and amount are required'
            });
        }
        const result = await cashflowService.addMoneyIn({
            description,
            amount: parseFloat(amount),
            category,
            vendor,
            paymentMethod,
            date: date ? new Date(date) : undefined,
            referenceNumber,
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error adding money in:', error);
        res.status(500).json({ error: error.message || 'Failed to add money in' });
    }
});
/**
 * POST /api/cashflow/money-out
 * Add money out (expense) to cashflow
 */
router.post('/money-out', async (req, res) => {
    try {
        const { description, amount, category, vendor, paymentMethod, date, referenceNumber } = req.body;
        if (!description || !amount || !category) {
            return res.status(400).json({
                error: 'Description, amount, and category are required'
            });
        }
        const result = await cashflowService.addMoneyOut({
            description,
            amount: parseFloat(amount),
            category,
            vendor,
            paymentMethod,
            date: date ? new Date(date) : undefined,
            referenceNumber,
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error adding money out:', error);
        res.status(500).json({ error: error.message || 'Failed to add money out' });
    }
});
/**
 * GET /api/cashflow/report
 * Get cashflow report for a custom date range
 * Query params: startDate, endDate (ISO date strings)
 */
router.get('/report', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'startDate and endDate query parameters are required (ISO date strings)'
            });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ error: 'Invalid date format. Use ISO date strings.' });
        }
        const report = await cashflowService.getCashflowReport(start, end);
        res.json(report);
    }
    catch (error) {
        console.error('Error getting cashflow report:', error);
        res.status(500).json({ error: error.message || 'Failed to get cashflow report' });
    }
});
/**
 * GET /api/cashflow/report/daily
 * Get daily cashflow report
 * Query param: date (ISO date string, defaults to today)
 */
router.get('/report/daily', async (req, res) => {
    try {
        const dateParam = req.query.date;
        const date = dateParam ? new Date(dateParam) : new Date();
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Invalid date format. Use ISO date string.' });
        }
        const report = await cashflowService.getDailyReport(date);
        res.json(report);
    }
    catch (error) {
        console.error('Error getting daily report:', error);
        res.status(500).json({ error: error.message || 'Failed to get daily report' });
    }
});
/**
 * GET /api/cashflow/report/weekly
 * Get weekly cashflow report
 * Query param: date (ISO date string, defaults to today)
 */
router.get('/report/weekly', async (req, res) => {
    try {
        const dateParam = req.query.date;
        const date = dateParam ? new Date(dateParam) : new Date();
        if (isNaN(date.getTime())) {
            return res.status(400).json({ error: 'Invalid date format. Use ISO date string.' });
        }
        const report = await cashflowService.getWeeklyReport(date);
        res.json(report);
    }
    catch (error) {
        console.error('Error getting weekly report:', error);
        res.status(500).json({ error: error.message || 'Failed to get weekly report' });
    }
});
/**
 * GET /api/cashflow/report/monthly
 * Get monthly cashflow report
 * Query params: year, month (1-12)
 */
router.get('/report/monthly', async (req, res) => {
    try {
        const yearParam = req.query.year;
        const monthParam = req.query.month;
        const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
        const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;
        if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
            return res.status(400).json({ error: 'Invalid year or month. Month must be 1-12.' });
        }
        const report = await cashflowService.getMonthlyReport(year, month);
        res.json(report);
    }
    catch (error) {
        console.error('Error getting monthly report:', error);
        res.status(500).json({ error: error.message || 'Failed to get monthly report' });
    }
});
/**
 * GET /api/cashflow
 * Get all cashflow entries with optional filters
 * Query params: startDate, endDate, category, type (in/out)
 */
router.get('/', async (req, res) => {
    try {
        const filters = {};
        if (req.query.startDate) {
            filters.startDate = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
            filters.endDate = new Date(req.query.endDate);
        }
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.type) {
            const type = req.query.type;
            if (type === 'in' || type === 'out') {
                filters.type = type;
            }
        }
        const entries = await cashflowService.getAllCashflowEntries(filters);
        res.json(entries);
    }
    catch (error) {
        console.error('Error getting cashflow entries:', error);
        res.status(500).json({ error: error.message || 'Failed to get cashflow entries' });
    }
});
/**
 * GET /api/cashflow/:id
 * Get single cashflow entry by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }
        const entry = await cashflowService.getCashflowEntryById(entryId);
        if (!entry) {
            return res.status(404).json({ error: 'Cashflow entry not found' });
        }
        res.json(entry);
    }
    catch (error) {
        console.error('Error getting cashflow entry:', error);
        res.status(500).json({ error: error.message || 'Failed to get cashflow entry' });
    }
});
/**
 * PUT /api/cashflow/:id
 * Update a cashflow entry
 */
router.put('/:id', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }
        const { description, amount, category, vendor, paymentMethod, date, referenceNumber } = req.body;
        const updateData = {};
        if (description !== undefined)
            updateData.description = description;
        if (amount !== undefined)
            updateData.amount = parseFloat(amount);
        if (category !== undefined)
            updateData.category = category;
        if (vendor !== undefined)
            updateData.vendor = vendor;
        if (paymentMethod !== undefined)
            updateData.paymentMethod = paymentMethod;
        if (date !== undefined)
            updateData.date = new Date(date);
        if (referenceNumber !== undefined)
            updateData.referenceNumber = referenceNumber;
        const result = await cashflowService.updateCashflowEntry(entryId, updateData);
        res.json(result);
    }
    catch (error) {
        console.error('Error updating cashflow entry:', error);
        res.status(500).json({ error: error.message || 'Failed to update cashflow entry' });
    }
});
/**
 * DELETE /api/cashflow/:id
 * Delete a cashflow entry
 */
router.delete('/:id', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        if (isNaN(entryId)) {
            return res.status(400).json({ error: 'Invalid entry ID' });
        }
        const result = await cashflowService.deleteCashflowEntry(entryId);
        res.json(result);
    }
    catch (error) {
        console.error('Error deleting cashflow entry:', error);
        res.status(500).json({ error: error.message || 'Failed to delete cashflow entry' });
    }
});
/**
 * DELETE /api/cashflow/reset/all
 * Reset all cashflow entries and reports (admin only)
 */
router.delete('/reset/all', async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        try {
            const deletedCount = await prisma.expenses.deleteMany({});
            await prisma.$disconnect();
            res.json({
                success: true,
                message: 'Cashflow and reports reset successfully',
                deletedEntries: deletedCount.count,
                note: 'Reports are automatically generated from cashflow data, so they are now reset to zero values',
            });
        }
        catch (error) {
            await prisma.$disconnect();
            throw error;
        }
    }
    catch (error) {
        console.error('Error resetting cashflow:', error);
        res.status(500).json({ error: error.message || 'Failed to reset cashflow' });
    }
});
exports.default = router;
