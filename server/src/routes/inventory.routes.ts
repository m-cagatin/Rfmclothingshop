import { Router, Request, Response } from 'express';
import * as inventoryService from '../services/inventory.service';

const router = Router();

/**
 * GET /api/inventory
 * Get all inventory items
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const items = await inventoryService.getAllItems();
    res.json(items);
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
});

/**
 * GET /api/inventory/:id
 * Get single inventory item
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await inventoryService.getItemById(id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error: any) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

/**
 * POST /api/inventory
 * Create new inventory item
 */
router.post('/', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: error.message || 'Failed to create item' });
  }
});

/**
 * PUT /api/inventory/:id
 * Update inventory item
 */
router.put('/:id', async (req: Request, res: Response) => {
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
  } catch (error: any) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: error.message || 'Failed to update item' });
  }
});

/**
 * DELETE /api/inventory/:id
 * Delete inventory item
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await inventoryService.deleteItem(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: error.message || 'Failed to delete item' });
  }
});

export default router;

