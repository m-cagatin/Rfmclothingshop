/**
 * Canvas Resources Service
 * Handles CRUD operations for graphics and patterns
 */

import { prisma } from '../prisma';

// Graphics
export async function createGraphic(data: {
  name: string;
  cloudinary_url: string;
  thumbnail_url: string;
  cloudinary_public_id: string;
  file_size: number;
  width: number;
  height: number;
  format: string;
  category?: string;
  tags?: any;
}) {
  return await prisma.canvas_graphics.create({ data });
}

export async function getAllGraphics(category?: string) {
  const where = category ? { category } : {};
  return await prisma.canvas_graphics.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });
}

export async function deleteGraphic(id: number) {
  return await prisma.canvas_graphics.delete({ where: { id } });
}

export async function getGraphicById(id: number) {
  return await prisma.canvas_graphics.findUnique({ where: { id } });
}

// Patterns
export async function createPattern(data: {
  name: string;
  cloudinary_url: string;
  thumbnail_url: string;
  cloudinary_public_id: string;
  file_size: number;
  width: number;
  height: number;
  format: string;
  is_seamless?: boolean;
  tags?: any;
}) {
  return await prisma.canvas_patterns.create({ data });
}

export async function getAllPatterns() {
  return await prisma.canvas_patterns.findMany({
    orderBy: { created_at: 'desc' },
  });
}

export async function deletePattern(id: number) {
  return await prisma.canvas_patterns.delete({ where: { id } });
}

export async function getPatternById(id: number) {
  return await prisma.canvas_patterns.findUnique({ where: { id } });
}
