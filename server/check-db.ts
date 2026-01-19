import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== CUSTOMIZABLE PRODUCTS WITH PRICING ===');
    const products = await prisma.customizable_products.findMany({
      select: {
        id: true,
        name: true,
        base_cost: true,
        retail_price: true,
        front_print_cost: true,
        back_print_cost: true,
        size_pricing: true,
        status: true,
      }
    });
    console.log(`Total products: ${products.length}`);
    console.log(JSON.stringify(products, null, 2));

    console.log('\n=== CUSTOMIZABLE PRODUCT IMAGES ===');
    const images = await prisma.customizable_product_images.findMany({
      take: 10,
      select: {
        image_id: true,
        product_id: true,
        image_url: true,
        image_type: true,
        cloudinary_public_id: true,
      }
    });
    console.log(JSON.stringify(images, null, 2));

    console.log('\n=== PRODUCT COUNT ===');
    const count = await prisma.customizable_products.count();
    console.log(`Total products: ${count}`);

    const imageCount = await prisma.customizable_product_images.count();
    console.log(`Total images: ${imageCount}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function deleteAllProducts() {
  try {
    // ⚠️ DANGEROUS: Uncomment only if you really want to delete ALL products!
    // console.log('Deleting all product images...');
    // const imageResult = await prisma.customizable_product_images.deleteMany({});
    // console.log(`Deleted ${imageResult.count} image records`);
    
    // console.log('\nDeleting all products...');
    // const productResult = await prisma.customizable_products.deleteMany({});
    // console.log(`Deleted ${productResult.count} products`);
    
    // console.log('\n✅ All products deleted! Database is clean.');
    
    console.log('⚠️ Delete function is DISABLED for safety.');
    console.log('Uncomment the code inside deleteAllProducts() if you really need to delete.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// ⚠️ DISABLED - Uncomment only when you need to delete all products
// deleteAllProducts();
checkDatabase();
