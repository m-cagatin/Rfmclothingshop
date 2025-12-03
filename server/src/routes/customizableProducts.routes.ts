import { Router } from 'express';
import * as customizableProductsService from '../services/customizableProducts.service';

const router = Router();

/**
 * GET /api/customizable-products
 * Get all customizable products
 */
router.get('/', async (req, res) => {
  try {
    const products = await customizableProductsService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

/**
 * GET /api/customizable-products/:id
 * Get a single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await customizableProductsService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

/**
 * POST /api/customizable-products
 * Create a new customizable product
 */
router.post('/', async (req, res) => {
  try {
    const productData = req.body;

    // Validate required fields
    if (!productData.name || !productData.category || !productData.retailPrice) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, category, retailPrice' 
      });
    }

    if (!productData.images || productData.images.length === 0) {
      return res.status(400).json({ 
        error: 'At least one product image is required' 
      });
    }

    const product = await customizableProductsService.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

/**
 * PUT /api/customizable-products/:id
 * Update an existing product
 */
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const productData = { ...req.body, id };
    const product = await customizableProductsService.updateProduct(productData);
    
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

/**
 * PATCH /api/customizable-products/:id/status
 * Update product status
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    if (!['active', 'inactive', 'archived'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be: active, inactive, or archived' 
      });
    }

    const product = await customizableProductsService.updateProductStatus(id, status);
    res.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

/**
 * DELETE /api/customizable-products/:id
 * Delete a product
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    await customizableProductsService.deleteProduct(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
