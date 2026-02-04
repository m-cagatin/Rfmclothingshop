import cloudinary from 'cloudinary';
import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function deleteOrphanedImages() {
  console.log('🔍 Finding orphaned catalog product images in Cloudinary...\n');

  try {
    // Get all public IDs from database
    const dbImages = await prisma.product_images.findMany({
      select: { cloudinary_public_id: true }
    });
    const dbPublicIds = new Set(dbImages.map(img => img.cloudinary_public_id));
    console.log(`📊 Database has ${dbPublicIds.size} image records\n`);

    // Folders to check (full paths in Cloudinary)
    const folders = [
      'Catalog Products/Front View IMG',
      'Catalog Products/Back View IMG',
      'Catalog Products/Additional IMG'
    ];

    let totalDeleted = 0;

    for (const folder of folders) {
      console.log(`📂 Checking folder: ${folder}`);
      
      try {
        const result = await cloudinary.v2.api.resources({
          type: 'upload',
          prefix: folder,
          max_results: 500
        });

        const orphanedImages = result.resources.filter((resource: any) => {
          return !dbPublicIds.has(resource.public_id);
        });

        console.log(`   Found ${orphanedImages.length} orphaned images`);

        if (orphanedImages.length > 0) {
          console.log('   Deleting orphaned images:');
          for (const img of orphanedImages) {
            try {
              await cloudinary.v2.uploader.destroy(img.public_id);
              console.log(`   ✅ Deleted: ${img.public_id}`);
              totalDeleted++;
            } catch (err) {
              console.error(`   ❌ Failed to delete: ${img.public_id}`, err);
            }
          }
        }
      } catch (err) {
        console.error(`   ❌ Error checking folder ${folder}:`, err);
      }
      
      console.log('');
    }

    console.log(`\n✅ Cleanup complete! Deleted ${totalDeleted} orphaned images.`);
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteOrphanedImages();
