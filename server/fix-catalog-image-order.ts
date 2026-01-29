import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixImageDisplayOrder() {
  console.log('🔧 Fixing catalog product image display orders...');

  try {
    // Get all product images for catalog products
    const images = await prisma.product_images.findMany({
      include: {
        catalog_clothing: true
      },
      orderBy: {
        product_id: 'asc'
      }
    });

    console.log(`📊 Found ${images.length} total images`);

    // Group images by product_id
    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.product_id]) {
        acc[img.product_id] = [];
      }
      acc[img.product_id].push(img);
      return acc;
    }, {} as Record<number, typeof images>);

    let updatedCount = 0;

    // Fix display_order for each product's images
    for (const [productId, productImages] of Object.entries(imagesByProduct)) {
      console.log(`\n📦 Product ${productId}: ${productImages.length} images`);
      
      // Sort by image_id to maintain original upload order
      const sortedImages = productImages.sort((a, b) => a.image_id - b.image_id);
      
      for (let i = 0; i < sortedImages.length; i++) {
        const img = sortedImages[i];
        const correctOrder = i + 1;
        
        if (img.display_order !== correctOrder) {
          console.log(`  ✏️  Image ${img.image_id}: ${img.display_order} → ${correctOrder}`);
          
          await prisma.product_images.update({
            where: { image_id: img.image_id },
            data: { display_order: correctOrder }
          });
          
          updatedCount++;
        } else {
          console.log(`  ✅ Image ${img.image_id}: ${img.display_order} (correct)`);
        }
      }
    }

    console.log(`\n✅ Fixed ${updatedCount} image display orders!`);
    
  } catch (error) {
    console.error('❌ Error fixing image orders:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixImageDisplayOrder();
