"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCart = getCart;
exports.addToCart = addToCart;
exports.updateCartItem = updateCartItem;
exports.removeFromCart = removeFromCart;
exports.clearCart = clearCart;
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
async function getCart(req, res) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const cartItems = await prisma_1.prisma.userCart.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ items: cartItems });
    }
    catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ error: 'Failed to get cart' });
    }
}
async function addToCart(req, res) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { productId, productName, price, image, category, quantity = 1, size, color, customizationData } = req.body;
        if (!productId || !productName || price === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existing = await prisma_1.prisma.userCart.findFirst({
            where: {
                userId,
                productId,
                size: size || null,
                color: color || null
            },
        });
        if (existing) {
            const updated = await prisma_1.prisma.userCart.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + (quantity || 1) },
            });
            return res.json({ item: updated });
        }
        const item = await prisma_1.prisma.userCart.create({
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
    }
    catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ error: 'Failed to add to cart' });
    }
}
async function updateCartItem(req, res) {
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
        const item = await prisma_1.prisma.userCart.findFirst({
            where: { id, userId },
        });
        if (!item) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        const updated = await prisma_1.prisma.userCart.update({
            where: { id },
            data: { quantity },
        });
        return res.json({ item: updated });
    }
    catch (error) {
        console.error('Update cart item error:', error);
        return res.status(500).json({ error: 'Failed to update cart item' });
    }
}
async function removeFromCart(req, res) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const { id } = req.params;
        const item = await prisma_1.prisma.userCart.findFirst({
            where: { id, userId },
        });
        if (!item) {
            return res.status(404).json({ error: 'Cart item not found' });
        }
        await prisma_1.prisma.userCart.delete({
            where: { id },
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).json({ error: 'Failed to remove from cart' });
    }
}
async function clearCart(req, res) {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        await prisma_1.prisma.userCart.deleteMany({
            where: { userId },
        });
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({ error: 'Failed to clear cart' });
    }
}
