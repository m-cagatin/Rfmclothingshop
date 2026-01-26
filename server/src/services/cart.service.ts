import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access';

function getUserId(req: Request): string | null {
  try {
    const token = req.cookies?.access;
    if (!token) return null;
    const decoded = jwt.verify(token, ACCESS_SECRET) as { sub: string };
    return decoded.sub;
  } catch {
    return null;
  }
}

export async function getCart(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const cartItems = await prisma.userCart.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ items: cartItems });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({ error: 'Failed to get cart' });
  }
}

export async function addToCart(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { productId, productName, price, image, category, quantity = 1, size, color, customizationData } = req.body;

    if (!productId || !productName || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await prisma.userCart.findFirst({
      where: { 
        userId, 
        productId,
        size: size || null,
        color: color || null
      },
    });

    if (existing) {
      const updated = await prisma.userCart.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + (quantity || 1) },
      });
      return res.json({ item: updated });
    }

    const item = await prisma.userCart.create({
      data: {
        userId,
        productId,
        productName,
        price: parseFloat(price),
        image: image || null,
        category: category || null,
        quantity: quantity || 1,
        size: size || null,
        color: color || null,
        customizationData: customizationData || null,
      },
    });

    return res.json({ item });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
}

export async function updateCartItem(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    const item = await prisma.userCart.findFirst({
      where: { id, userId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    const updated = await prisma.userCart.update({
      where: { id },
      data: { quantity },
    });

    return res.json({ item: updated });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(500).json({ error: 'Failed to update cart item' });
  }
}

export async function removeFromCart(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const item = await prisma.userCart.findFirst({
      where: { id, userId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    await prisma.userCart.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(500).json({ error: 'Failed to remove from cart' });
  }
}

export async function clearCart(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    await prisma.userCart.deleteMany({
      where: { userId },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(500).json({ error: 'Failed to clear cart' });
  }
}

