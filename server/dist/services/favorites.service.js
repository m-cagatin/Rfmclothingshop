"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = getFavorites;
exports.toggleFavorite = toggleFavorite;
exports.removeFavorite = removeFavorite;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../prisma");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change-me-access';
function getUserId(req) {
    try {
        const token = req.cookies?.access;
        if (!token)
            return null;
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        return decoded.sub;
    }
    catch {
        return null;
    }
}
async function getFavorites(req, res) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const favorites = await prisma_1.prisma.userFavorite.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ items: favorites });
    }
    catch (error) {
        console.error('Get favorites error:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return res.status(500).json({
            error: 'Failed to get favorites',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
async function toggleFavorite(req, res) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { productId, productName, price, image, category } = req.body;
        if (!productId || !productName || price === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existing = await prisma_1.prisma.userFavorite.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing) {
            // Remove from favorites
            await prisma_1.prisma.userFavorite.delete({
                where: { userId_productId: { userId, productId } },
            });
            return res.json({ isFavorited: false });
        }
        // Add to favorites
        const favorite = await prisma_1.prisma.userFavorite.create({
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
    }
    catch (error) {
        console.error('Toggle favorite error:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return res.status(500).json({
            error: 'Failed to toggle favorite',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
async function removeFavorite(req, res) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { id } = req.params;
        const favorite = await prisma_1.prisma.userFavorite.findFirst({
            where: { id, userId },
        });
        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }
        await prisma_1.prisma.userFavorite.delete({
            where: { id },
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Remove favorite error:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        return res.status(500).json({
            error: 'Failed to remove favorite',
            details: error instanceof Error ? error.message : String(error)
        });
    }
}
