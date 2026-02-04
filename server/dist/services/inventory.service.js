"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllItems = getAllItems;
exports.getItemById = getItemById;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const prisma = new client_1.PrismaClient();
function generateId() {
    return (0, crypto_1.randomBytes)(16).toString('hex');
}
/**
 * Get all inventory items
 */
async function getAllItems() {
    try {
        // Check if inventory table exists, if not return empty array for now
        // We'll need to add the Prisma schema later
        const items = await prisma.$queryRaw `
      SELECT * FROM inventory_items ORDER BY created_at DESC
    `.catch(() => []);
        return items.map(item => ({
            id: item.id || item.item_id,
            name: item.name || item.item_name,
            description: item.description,
            category: item.category,
            stock: Number(item.stock || item.current_stock || 0),
            unit: item.unit,
            minLevel: Number(item.min_level || item.minLevel || 0),
            costPerUnit: Number(item.cost_per_unit || item.costPerUnit || 0),
            status: item.stock <= item.min_level ? 'low_stock' : (item.status || 'active'),
            createdAt: item.created_at,
            updatedAt: item.updated_at,
        }));
    }
    catch (error) {
        console.error('Error fetching inventory items:', error);
        // Return mock data for now until database table is created
        return getMockItems();
    }
}
/**
 * Get item by ID
 */
async function getItemById(id) {
    try {
        const items = await getAllItems();
        return items.find(item => item.id === id) || null;
    }
    catch (error) {
        console.error('Error fetching item:', error);
        return null;
    }
}
/**
 * Create new inventory item
 */
async function createItem(data) {
    try {
        const id = generateId();
        const status = data.stock <= data.minLevel ? 'low_stock' : 'active';
        // Try to insert into database
        try {
            await prisma.$executeRawUnsafe(`
        INSERT INTO inventory_items (id, name, description, category, stock, unit, min_level, cost_per_unit, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, id, data.name, data.description || null, data.category, data.stock, data.unit, data.minLevel, data.costPerUnit, status);
        }
        catch (dbError) {
            // If table doesn't exist, return mock data
            console.warn('Inventory table not found, using mock data');
        }
        return {
            id,
            ...data,
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to create item');
    }
}
/**
 * Update inventory item
 */
async function updateItem(id, data) {
    try {
        const existingItem = await getItemById(id);
        if (!existingItem) {
            return null;
        }
        const updatedData = { ...existingItem, ...data };
        const status = updatedData.stock <= updatedData.minLevel ? 'low_stock' : (data.status || updatedData.status || 'active');
        updatedData.status = status;
        // Try to update in database
        try {
            await prisma.$executeRawUnsafe(`
        UPDATE inventory_items 
        SET name = ?, description = ?, category = ?, stock = ?, unit = ?, min_level = ?, cost_per_unit = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `, updatedData.name, updatedData.description || null, updatedData.category, updatedData.stock, updatedData.unit, updatedData.minLevel, updatedData.costPerUnit, status, id);
        }
        catch (dbError) {
            console.warn('Inventory table not found, using mock data');
        }
        return {
            ...updatedData,
            updatedAt: new Date().toISOString(),
        };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update item');
    }
}
/**
 * Delete inventory item
 */
async function deleteItem(id) {
    try {
        // Try to delete from database
        try {
            const result = await prisma.$executeRawUnsafe(`
        DELETE FROM inventory_items WHERE id = ?
      `, id);
            return true;
        }
        catch (dbError) {
            console.warn('Inventory table not found');
            return true; // Return true for mock data
        }
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete item');
    }
}
/**
 * Mock data for development (until database table is created)
 */
function getMockItems() {
    return [
        {
            id: '1',
            name: 'CUYI SUBLI INK - MAGENTA',
            description: 'Sublimation Ink from Cuyi Davao',
            category: 'Sublimation Ink',
            stock: 1,
            unit: 'bottle',
            minLevel: 1,
            costPerUnit: 650.00,
            status: 'low_stock',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '2',
            name: 'CUYI SUBLI INK - YELLOW',
            description: 'Subli Ink from Cuyi Davao',
            category: 'Sublimation Ink',
            stock: 1,
            unit: 'bottle',
            minLevel: 1,
            costPerUnit: 650.00,
            status: 'low_stock',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '3',
            name: 'POLYESTER FABRIC 180GSM JOPAL',
            description: 'JOPAL 180 GSM Shirts and Shorts',
            category: 'Fabric/Cloth',
            stock: 12.00,
            unit: 'kg',
            minLevel: 25,
            costPerUnit: 155.00,
            status: 'low_stock',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '4',
            name: 'CUYI SUBLI INK - CYAN',
            description: 'Subli Ink from Cuyi Davao',
            category: 'Sublimation Ink',
            stock: 0,
            unit: 'bottle',
            minLevel: 1,
            costPerUnit: 650.00,
            status: 'low_stock',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            id: '5',
            name: 'CUYI SUBLI INK - BLACK',
            description: 'Subli Ink from Cuyi Davao',
            category: 'Sublimation Ink',
            stock: 1,
            unit: 'bottle',
            minLevel: 1,
            costPerUnit: 650.00,
            status: 'low_stock',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ];
}
