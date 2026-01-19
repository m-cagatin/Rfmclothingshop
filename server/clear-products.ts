/**
 * Clear all customizable products from database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️  Clearing database...\n');

  try {
    // ⚠️ DANGEROUS: Uncomment only if you really want to delete ALL products!
    // Delete all product images first (foreign key constraint)
    // const deletedImages = await prisma.customizable_product_images.deleteMany({});
    // console.log(`✅ Deleted ${deletedImages.count} product images`);

    // Delete all products
    // const deletedProducts = await prisma.customizable_products.deleteMany({});
    // console.log(`✅ Deleted ${deletedProducts.count} products`);

    console.log('\n⚠️ Database clearing is currently DISABLED for safety.');
    console.log('Uncomment the deleteMany() lines if you really need to clear the database.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// ⚠️ DISABLED FOR SAFETY - Uncomment only when you need to clear database
// clearDatabase();
