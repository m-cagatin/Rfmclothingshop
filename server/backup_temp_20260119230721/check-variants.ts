import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVariants() {
  try {
    console.log('=== CHECKING DIFFERENTIATION TYPES ===\n');
    
    // Check pattern products (Stripes, Geo, Logo)
    const patternProducts = await prisma.customizable_products.findMany({
      where: {
        name: {
          contains: 'Stripes'
        }
      },
      take: 3,
      select: {
        id: true,
        name: true,
        differentiation_type: true,
        color_name: true,
        color_hex: true,
        variant_name: true,
        variant_image_url: true,
      }
    });
    
    console.log('Pattern Products (Stripes):');
    console.log(JSON.stringify(patternProducts, null, 2));
    
    // Check solid color products
    const colorProducts = await prisma.customizable_products.findMany({
      where: {
        name: {
          contains: 'White'
        }
      },
      take: 3,
      select: {
        id: true,
        name: true,
        differentiation_type: true,
        color_name: true,
        color_hex: true,
        variant_name: true,
      }
    });
    
    console.log('\nSolid Color Products (White):');
    console.log(JSON.stringify(colorProducts, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariants();
