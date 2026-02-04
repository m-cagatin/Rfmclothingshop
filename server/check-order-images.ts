import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOrderImages() {
  try {
    console.log('🔍 Checking order items and their images...\n');
    
    // Get a recent order with items
    const order = await prisma.orders.findFirst({
      include: {
        order_items: {
          include: {
            catalog_clothing: {
              include: {
                product_images: {
                  orderBy: {
                    display_order: 'asc',
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!order) {
      console.log('❌ No orders found');
      return;
    }

    console.log(`📦 Order: ${order.order_ref}`);
    console.log(`   Items: ${order.order_items.length}\n`);

    for (const item of order.order_items) {
      console.log(`\n📦 Product: ${item.product_name}`);
      console.log(`   Product ID: ${item.product_id}`);
      console.log(`   Catalog Clothing exists: ${!!item.catalog_clothing}`);
      
      if (item.catalog_clothing) {
        console.log(`   Product Images count: ${item.catalog_clothing.product_images?.length || 0}`);
        
        if (item.catalog_clothing.product_images && item.catalog_clothing.product_images.length > 0) {
          const image = item.catalog_clothing.product_images[0];
          console.log(`   ✅ Image URL: ${image.image_url}`);
          console.log(`   Image ID: ${image.image_id}`);
        } else {
          console.log(`   ⚠️  No images found for this product`);
          
          // Check if product has any images at all
          const allImages = await prisma.product_images.findMany({
            where: { product_id: item.product_id },
          });
          console.log(`   Total images in product_images table: ${allImages.length}`);
          if (allImages.length > 0) {
            console.log(`   Images found:`);
            allImages.forEach(img => {
              console.log(`     - ${img.image_url}`);
            });
          }
        }
      } else {
        console.log(`   ❌ Product not found in catalog_clothing table`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrderImages();

