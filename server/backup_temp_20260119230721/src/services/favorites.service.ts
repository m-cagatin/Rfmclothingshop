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

export async function getFavorites(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ items: favorites });
  } catch (error) {
    console.error('Get favorites error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: 'Failed to get favorites',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function toggleFavorite(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { productId, productName, price, image, category } = req.body;

    if (!productId || !productName || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existing = await prisma.userFavorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      // Remove from favorites
      await prisma.userFavorite.delete({
        where: { userId_productId: { userId, productId } },
      });
      return res.json({ isFavorited: false });
    }

    // Add to favorites
    const favorite = await prisma.userFavorite.create({
      data: {
        userId,
        productId,
        productName,
        price: parseFloat(price),
        image: image || null,
        category: category || null,
      },
    });

    return res.json({ item: favorite, isFavorited: true });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: 'Failed to toggle favorite',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

export async function removeFavorite(req: Request, res: Response) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const favorite = await prisma.userFavorite.findFirst({
      where: { id, userId },
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    await prisma.userFavorite.delete({
      where: { id },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return res.status(500).json({ 
      error: 'Failed to remove favorite',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}

