import { Router } from 'express';
import * as catalogProductsService from '../services/catalogProducts.service';

const router = Router();

// Get all catalog products
router.get('/', async (req, res) => {
  try {
    const products = await catalogProductsService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching catalog products:', error);
    res.status(500).json({ error: 'Failed to fetch catalog products' });
  }
});

// Get single catalog product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await catalogProductsService.getProductById(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching catalog product:', error);
    res.status(500).json({ error: 'Failed to fetch catalog product' });
  }
});

// Create new catalog product
router.post('/', async (req, res) => {
  try {
    const product = await catalogProductsService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating catalog product:', error);
    res.status(500).json({ error: 'Failed to create catalog product' });
  }
});

// Update catalog product
router.put('/:id', async (req, res) => {
  try {
    console.log('Update request for product:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    const product = await catalogProductsService.updateProduct(Number(req.params.id), req.body);
    res.json(product);
  } catch (error: any) {
    console.error('Error updating catalog product:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update catalog product', details: error.message });
  }
});

// Update product status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const product = await catalogProductsService.updateProductStatus(Number(req.params.id), status);
    res.json(product);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ error: 'Failed to update product status' });
  }
});

// Delete catalog product
router.delete('/:id', async (req, res) => {
  try {
    await catalogProductsService.deleteProduct(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting catalog product:', error);
    res.status(500).json({ error: 'Failed to delete catalog product' });
  }
});

export default router;
