import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateOrderImages() {
  try {
    console.log('🔄 Populating image_url for existing order_items...\n');
    
    // Get all order_items without image_url
    const orderItems = await prisma.order_items.findMany({
      where: {
        image_url: null,
      },
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
    });

    console.log(`Found ${orderItems.length} order items without images\n`);

    let updated = 0;
    let skipped = 0;

    for (const item of orderItems) {
      let imageUrl = null;
      
      // Try to get image from product_images
      if (item.catalog_clothing?.product_images && item.catalog_clothing.product_images.length > 0) {
        imageUrl = item.catalog_clothing.product_images[0].image_url;
      }

      if (imageUrl) {
        await prisma.order_items.update({
          where: { item_id: item.item_id },
          data: { image_url: imageUrl },
        });
        console.log(`✅ Updated order_item ${item.item_id} (${item.product_name}) with image`);
        updated++;
      } else {
        console.log(`⚠️  Skipped order_item ${item.item_id} (${item.product_name}) - no image found`);
        skipped++;
      }
    }

    console.log(`\n✅ Done! Updated: ${updated}, Skipped: ${skipped}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateOrderImages();

