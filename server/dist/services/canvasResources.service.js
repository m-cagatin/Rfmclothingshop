"use strict";
/**
 * Canvas Resources Service
 * Handles CRUD operations for graphics and patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraphic = createGraphic;
exports.getAllGraphics = getAllGraphics;
exports.deleteGraphic = deleteGraphic;
exports.getGraphicById = getGraphicById;
exports.createPattern = createPattern;
exports.getAllPatterns = getAllPatterns;
exports.deletePattern = deletePattern;
exports.getPatternById = getPatternById;
const prisma_1 = require("../prisma");
// Graphics
async function createGraphic(data) {
    return await prisma_1.prisma.canvas_graphics.create({ data });
}
async function getAllGraphics(category) {
    const where = category ? { category } : {};
    return await prisma_1.prisma.canvas_graphics.findMany({
        where,
        orderBy: { created_at: 'desc' },
    });
}
async function deleteGraphic(id) {
    return await prisma_1.prisma.canvas_graphics.delete({ where: { id } });
}
async function getGraphicById(id) {
    return await prisma_1.prisma.canvas_graphics.findUnique({ where: { id } });
}
// Patterns
async function createPattern(data) {
    return await prisma_1.prisma.canvas_patterns.create({ data });
}
async function getAllPatterns() {
    return await prisma_1.prisma.canvas_patterns.findMany({
        orderBy: { created_at: 'desc' },
    });
}
async function deletePattern(id) {
    return await prisma_1.prisma.canvas_patterns.delete({ where: { id } });
}
async function getPatternById(id) {
    return await prisma_1.prisma.canvas_patterns.findUnique({ where: { id } });
}
