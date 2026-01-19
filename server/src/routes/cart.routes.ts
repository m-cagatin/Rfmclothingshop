import { Router } from 'express';
import * as Cart from '../services/cart.service';

const router = Router();

router.get('/', Cart.getCart);
router.post('/', Cart.addToCart);
router.put('/:id', Cart.updateCartItem);
router.delete('/:id', Cart.removeFromCart);
router.delete('/', Cart.clearCart);

export default router;

