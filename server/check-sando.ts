import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSandoProducts() {
  try {
    console.log('=== CHECKING SANDO NBA CUT PRODUCTS ===\n');
    
    const sandoProducts = await prisma.customizable_products.findMany({
      where: {
        name: {
          contains: 'Sando (Jersey) - NBA Cut'
        }
      },
      take: 3,
      select: {
        id: true,
        name: true,
        category: true,
        fit_type: true,
        fit_description: true,
        color_name: true,
        color_hex: true,
        variant_name: true,
        differentiation_type: true,
        retail_price: true,
        front_print_cost: true,
        back_print_cost: true,
        available_sizes: true,
      }
    });
    
    console.log(JSON.stringify(sandoProducts, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSandoProducts();
