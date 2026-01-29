import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProduct() {
  try {
    const product = await prisma.customizable_products.findUnique({
      where: { id: 196 }
    });

    if (!product) {
      console.log('Product 196 not found');
      return;
    }

    console.log('Product found:');
    console.log('ID:', product.id);
    console.log('Name:', product.name);
    console.log('Category:', product.category);
    console.log('Color Name:', product.color_name);
    console.log('Color Hex:', product.color_hex);
    console.log('Retail Price:', product.retail_price);
    console.log('Has variant_name?:', !!product.variant_name);
    console.log('Has base_product_name?:', !!product.base_product_name);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProduct();
