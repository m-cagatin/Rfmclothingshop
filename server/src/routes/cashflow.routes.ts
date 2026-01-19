import { Router, Request, Response } from 'express';
import * as cashflowService from '../services/cashflow.service';

const router = Router();

/**
 * POST /api/cashflow/money-in
 * Add money in (income) to cashflow
 */
router.post('/money-in', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error adding money in:', error);
    res.status(500).json({ error: error.message || 'Failed to add money in' });
  }
});

/**
 * POST /api/cashflow/money-out
 * Add money out (expense) to cashflow
 */
router.post('/money-out', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error adding money out:', error);
    res.status(500).json({ error: error.message || 'Failed to add money out' });
  }
});

/**
 * GET /api/cashflow/report
 * Get cashflow report for a custom date range
 * Query params: startDate, endDate (ISO date strings)
 */
router.get('/report', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'startDate and endDate query parameters are required (ISO date strings)' 
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use ISO date strings.' });
    }

    const report = await cashflowService.getCashflowReport(start, end);
    res.json(report);
  } catch (error: any) {
    console.error('Error getting cashflow report:', error);
    res.status(500).json({ error: error.message || 'Failed to get cashflow report' });
  }
});

/**
 * GET /api/cashflow/report/daily
 * Get daily cashflow report
 * Query param: date (ISO date string, defaults to today)
 */
router.get('/report/daily', async (req: Request, res: Response) => {
  try {
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use ISO date string.' });
    }

    const report = await cashflowService.getDailyReport(date);
    res.json(report);
  } catch (error: any) {
    console.error('Error getting daily report:', error);
    res.status(500).json({ error: error.message || 'Failed to get daily report' });
  }
});

/**
 * GET /api/cashflow/report/weekly
 * Get weekly cashflow report
 * Query param: date (ISO date string, defaults to today)
 */
router.get('/report/weekly', async (req: Request, res: Response) => {
  try {
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();

    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: 'Invalid date format. Use ISO date string.' });
    }

    const report = await cashflowService.getWeeklyReport(date);
    res.json(report);
  } catch (error: any) {
    console.error('Error getting weekly report:', error);
    res.status(500).json({ error: error.message || 'Failed to get weekly report' });
  }
});

/**
 * GET /api/cashflow/report/monthly
 * Get monthly cashflow report
 * Query params: year, month (1-12)
 */
router.get('/report/monthly', async (req: Request, res: Response) => {
  try {
    const yearParam = req.query.year as string;
    const monthParam = req.query.month as string;

    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();
    const month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1;

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid year or month. Month must be 1-12.' });
    }

    const report = await cashflowService.getMonthlyReport(year, month);
    res.json(report);
  } catch (error: any) {
    console.error('Error getting monthly report:', error);
    res.status(500).json({ error: error.message || 'Failed to get monthly report' });
  }
});

/**
 * GET /api/cashflow
 * Get all cashflow entries with optional filters
 * Query params: startDate, endDate, category, type (in/out)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const filters: any = {};

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    if (req.query.category) {
      filters.category = req.query.category as string;
    }

    if (req.query.type) {
      const type = req.query.type as string;
      if (type === 'in' || type === 'out') {
        filters.type = type;
      }
    }

    const entries = await cashflowService.getAllCashflowEntries(filters);
    res.json(entries);
  } catch (error: any) {
    console.error('Error getting cashflow entries:', error);
    res.status(500).json({ error: error.message || 'Failed to get cashflow entries' });
  }
});

/**
 * GET /api/cashflow/:id
 * Get single cashflow entry by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error getting cashflow entry:', error);
    res.status(500).json({ error: error.message || 'Failed to get cashflow entry' });
  }
});

/**
 * PUT /api/cashflow/:id
 * Update a cashflow entry
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const entryId = parseInt(req.params.id);

    if (isNaN(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    const { description, amount, category, vendor, paymentMethod, date, referenceNumber } = req.body;

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (category !== undefined) updateData.category = category;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (date !== undefined) updateData.date = new Date(date);
    if (referenceNumber !== undefined) updateData.referenceNumber = referenceNumber;

    const result = await cashflowService.updateCashflowEntry(entryId, updateData);
    res.json(result);
  } catch (error: any) {
    console.error('Error updating cashflow entry:', error);
    res.status(500).json({ error: error.message || 'Failed to update cashflow entry' });
  }
});

/**
 * DELETE /api/cashflow/:id
 * Delete a cashflow entry
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const entryId = parseInt(req.params.id);

    if (isNaN(entryId)) {
      return res.status(400).json({ error: 'Invalid entry ID' });
    }

    const result = await cashflowService.deleteCashflowEntry(entryId);
    res.json(result);
  } catch (error: any) {
    console.error('Error deleting cashflow entry:', error);
    res.status(500).json({ error: error.message || 'Failed to delete cashflow entry' });
  }
});

/**
 * DELETE /api/cashflow/reset/all
 * Reset all cashflow entries and reports (admin only)
 */
router.delete('/reset/all', async (req: Request, res: Response) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
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
    } catch (error) {
      await prisma.$disconnect();
      throw error;
    }
  } catch (error: any) {
    console.error('Error resetting cashflow:', error);
    res.status(500).json({ error: error.message || 'Failed to reset cashflow' });
  }
});

export default router;

