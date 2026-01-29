import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
  const products = await prisma.catalog_clothing.findMany({
    include: { product_images: true }
  });
  
  console.log('Products with images:');
  products.forEach(p => {
    console.log(`  ${p.product_name}: ${p.product_images.length} images`);
  });
  
  await prisma.$disconnect();
}

checkImages();
