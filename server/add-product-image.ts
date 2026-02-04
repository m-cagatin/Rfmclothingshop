import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addProductImage() {
  try {
    console.log('🔄 Adding image to Varsity Jacket product...\n');
    
    // Find the product by ID from order_items
    const orderItem = await prisma.order_items.findFirst({
      where: {
        image_url: null,
      },
      include: {
        catalog_clothing: true,
      },
    });

    if (!orderItem) {
      console.log('❌ No order items without images found');
      return;
    }

    const product = orderItem.catalog_clothing;

    if (!product) {
      console.log('❌ Product not found');
      return;
    }

    console.log(`Found product: ${product.product_name} (ID: ${product.product_id})`);

    // Check if it already has images
    const existingImages = await prisma.product_images.findMany({
      where: { product_id: product.product_id },
    });

    if (existingImages.length > 0) {
      console.log(`✅ Product already has ${existingImages.length} image(s)`);
      existingImages.forEach(img => {
        console.log(`   - ${img.image_url}`);
      });
      return;
    }

    // Add image from homepage mock data
    const imageUrl = 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080';

    await prisma.product_images.create({
      data: {
        product_id: product.product_id,
        image_url: imageUrl,
        display_order: 1,
      },
    });

    console.log(`✅ Added image to product: ${imageUrl}`);

    // Update the order_item with the image
    await prisma.order_items.update({
      where: { item_id: orderItem.item_id },
      data: { image_url: imageUrl },
    });
    console.log(`✅ Updated order_item ${orderItem.item_id} with image`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductImage();

