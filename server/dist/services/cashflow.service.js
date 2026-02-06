"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMoneyIn = addMoneyIn;
exports.addMoneyOut = addMoneyOut;
exports.getCashflowReport = getCashflowReport;
exports.getDailyReport = getDailyReport;
exports.getWeeklyReport = getWeeklyReport;
exports.getMonthlyReport = getMonthlyReport;
exports.getAllCashflowEntries = getAllCashflowEntries;
exports.getCashflowEntryById = getCashflowEntryById;
exports.deleteCashflowEntry = deleteCashflowEntry;
exports.updateCashflowEntry = updateCashflowEntry;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Add money in (income) to cashflow
 */
async function addMoneyIn(data) {
    const { description, amount, category = 'income', vendor, paymentMethod, date, referenceNumber } = data;
    if (!description || !amount || amount <= 0) {
        throw new Error('Description and positive amount are required');
    }
    const createData = {
        date: date || new Date(),
        description,
        category,
        amount: Math.abs(amount), // Ensure positive
        vendor: vendor || null,
        paymentMethod: paymentMethod || null,
    };
    // Note: referenceNumber field doesn't exist in schema, so we skip it
    // The reference can be stored in the description if needed
    const cashflowEntry = await prisma.expenses.create({
        data: createData,
    });
    return {
        id: cashflowEntry.expenseId,
        date: cashflowEntry.date,
        description: cashflowEntry.description,
        category: cashflowEntry.category || 'income',
        amount: Number(cashflowEntry.amount),
        type: 'in',
        vendor: cashflowEntry.vendor || undefined,
        paymentMethod: cashflowEntry.paymentMethod || undefined,
        referenceNumber: cashflowEntry.referenceNumber || undefined,
    };
}
/**
 * Add money out (expense) to cashflow
 */
async function addMoneyOut(data) {
    const { description, amount, category, vendor, paymentMethod, date, referenceNumber } = data;
    if (!description || !amount || amount <= 0) {
        throw new Error('Description and positive amount are required');
    }
    if (!category) {
        throw new Error('Category is required for expenses');
    }
    // Ensure category is not 'income' for money out
    const expenseCategory = category === 'income' ? 'general' : category;
    const createData = {
        date: date || new Date(),
        description,
        category: expenseCategory,
        amount: -Math.abs(amount), // Negative for expenses
        vendor: vendor || null,
        paymentMethod: paymentMethod || null,
    };
    // Note: referenceNumber field doesn't exist in schema, so we skip it
    // The reference can be stored in the description if needed
    const cashflowEntry = await prisma.expenses.create({
        data: createData,
    });
    return {
        id: cashflowEntry.expenseId,
        date: cashflowEntry.date,
        description: cashflowEntry.description,
        category: cashflowEntry.category || 'general',
        amount: Math.abs(Number(cashflowEntry.amount)), // Return positive for display
        type: 'out',
        vendor: cashflowEntry.vendor || undefined,
        paymentMethod: cashflowEntry.paymentMethod || undefined,
        referenceNumber: cashflowEntry.referenceNumber || undefined,
    };
}
/**
 * Get cashflow report for a date range
 */
async function getCashflowReport(startDate, endDate) {
    const transactions = await prisma.expenses.findMany({
        where: {
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        orderBy: {
            date: 'desc',
        },
    });
    let totalMoneyIn = 0;
    let totalMoneyOut = 0;
    const formattedTransactions = transactions.map((entry) => {
        const amount = Number(entry.amount);
        const isIncome = amount > 0;
        if (isIncome) {
            totalMoneyIn += amount;
        }
        else {
            totalMoneyOut += Math.abs(amount);
        }
        return {
            id: entry.expenseId,
            date: entry.date,
            description: entry.description,
            category: entry.category || (isIncome ? 'income' : 'general'),
            amount: Math.abs(amount),
            type: (isIncome ? 'in' : 'out'),
            vendor: entry.vendor || undefined,
            paymentMethod: entry.paymentMethod || undefined,
            referenceNumber: entry.referenceNumber || undefined,
        };
    });
    const netCashflow = totalMoneyIn - totalMoneyOut;
    return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        startDate,
        endDate,
        totalMoneyIn,
        totalMoneyOut,
        netCashflow,
        transactions: formattedTransactions,
    };
}
/**
 * Get daily cashflow report
 */
async function getDailyReport(date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    return getCashflowReport(startDate, endDate);
}
/**
 * Get weekly cashflow report
 */
async function getWeeklyReport(date) {
    // Get the start of the week (Sunday)
    const startDate = new Date(date);
    const day = startDate.getDay();
    const diff = startDate.getDate() - day;
    startDate.setDate(diff);
    startDate.setHours(0, 0, 0, 0);
    // Get the end of the week (Saturday)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    return getCashflowReport(startDate, endDate);
}
/**
 * Get monthly cashflow report
 */
async function getMonthlyReport(year, month) {
    // Month is 0-indexed in JavaScript Date
    const startDate = new Date(year, month - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(year, month, 0); // Last day of the month
    endDate.setHours(23, 59, 59, 999);
    return getCashflowReport(startDate, endDate);
}
/**
 * Get all cashflow entries with optional filters
 */
async function getAllCashflowEntries(filters) {
    const where = {};
    if (filters?.startDate || filters?.endDate) {
        where.date = {};
        if (filters.startDate) {
            where.date.gte = filters.startDate;
        }
        if (filters.endDate) {
            where.date.lte = filters.endDate;
        }
    }
    if (filters?.category) {
        where.category = filters.category;
    }
    if (filters?.type) {
        if (filters.type === 'in') {
            where.amount = { gt: 0 };
        }
        else {
            where.amount = { lt: 0 };
        }
    }
    const entries = await prisma.expenses.findMany({
        where,
        orderBy: {
            date: 'desc',
        },
    });
    return entries.map((entry) => {
        const amount = Number(entry.amount);
        return {
            id: entry.expenseId,
            date: entry.date,
            description: entry.description,
            category: entry.category || (amount > 0 ? 'income' : 'general'),
            amount: Math.abs(amount),
            type: (amount > 0 ? 'in' : 'out'),
            vendor: entry.vendor || undefined,
            paymentMethod: entry.paymentMethod || undefined,
            referenceNumber: entry.referenceNumber || undefined,
        };
    });
}
/**
 * Get single cashflow entry by ID
 */
async function getCashflowEntryById(entryId) {
    const entry = await prisma.expenses.findUnique({
        where: { expenseId: entryId },
    });
    if (!entry) {
        return null;
    }
    const amount = Number(entry.amount);
    return {
        id: entry.expenseId,
        date: entry.date,
        description: entry.description,
        category: entry.category || (amount > 0 ? 'income' : 'general'),
        amount: Math.abs(amount),
        type: (amount > 0 ? 'in' : 'out'),
        vendor: entry.vendor || undefined,
        paymentMethod: entry.paymentMethod || undefined,
        referenceNumber: entry.referenceNumber || undefined,
    };
}
/**
 * Delete a cashflow entry
 */
async function deleteCashflowEntry(entryId) {
    const entry = await prisma.expenses.findUnique({
        where: { expenseId: entryId },
    });
    if (!entry) {
        throw new Error('Cashflow entry not found');
    }
    await prisma.expenses.delete({
        where: { expenseId: entryId },
    });
    return {
        success: true,
        message: 'Cashflow entry deleted successfully',
    };
}
/**
 * Update a cashflow entry
 */
async function updateCashflowEntry(entryId, data) {
    const entry = await prisma.expenses.findUnique({
        where: { expenseId: entryId },
    });
    if (!entry) {
        throw new Error('Cashflow entry not found');
    }
    const updateData = {};
    if (data.description !== undefined)
        updateData.description = data.description;
    if (data.category !== undefined)
        updateData.category = data.category;
    if (data.vendor !== undefined)
        updateData.vendor = data.vendor;
    if (data.paymentMethod !== undefined)
        updateData.paymentMethod = data.paymentMethod;
    if (data.date !== undefined)
        updateData.date = data.date;
    // Note: referenceNumber field doesn't exist in schema, so we skip it
    // The reference can be stored in the description if needed
    if (data.amount !== undefined) {
        const currentAmount = Number(entry.amount);
        const isCurrentlyIncome = currentAmount > 0;
        // Preserve the sign based on current entry type
        if (isCurrentlyIncome) {
            updateData.amount = Math.abs(data.amount);
        }
        else {
            updateData.amount = -Math.abs(data.amount);
        }
    }
    const updated = await prisma.expenses.update({
        where: { expenseId: entryId },
        data: updateData,
    });
    const amount = Number(updated.amount);
    return {
        id: updated.expenseId,
        date: updated.date,
        description: updated.description,
        category: updated.category || (amount > 0 ? 'income' : 'general'),
        amount: Math.abs(amount),
        type: (amount > 0 ? 'in' : 'out'),
        vendor: updated.vendor || undefined,
        paymentMethod: updated.paymentMethod || undefined,
        referenceNumber: updated.referenceNumber || undefined,
    };
}
