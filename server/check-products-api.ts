/**
 * Check if Product 198 exists in the API response
 */

import { prisma } from './src/prisma';

async function checkProductsAPI() {
  console.log('🔍 Checking customizable products in database...\n');

  const products = await prisma.customizable_products.findMany({
    select: {
      id: true,
      name: true,
      category: true,
      status: true,
    },
    orderBy: {
      id: 'asc',
    },
  });

  console.log(`📦 Total products found: ${products.length}\n`);

  products.forEach((product: any) => {
    console.log(`ID: ${product.id}, Name: ${product.name}, Category: ${product.category}, Status: ${product.status}`);
  });

  // Check specifically for product 198
  const product198 = products.find((p: any) => p.id === 198);
  if (product198) {
    console.log('\n✅ Product 198 EXISTS:', product198);
  } else {
    console.log('\n❌ Product 198 NOT FOUND');
  }

  await prisma.$disconnect();
}

checkProductsAPI().catch(console.error);
