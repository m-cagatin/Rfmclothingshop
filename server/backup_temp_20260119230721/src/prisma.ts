import { PrismaClient } from '@prisma/client';

// Single Prisma instance for the server
export const prisma = new PrismaClient();
