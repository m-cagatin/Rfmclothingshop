import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkOtherCategory() {
  try {
    console.log('🔍 Checking for products with category "Other"...\n');
    
    // Check customizable_products table
    const customizableProducts = await prisma.customizable_products.findMany({
      where: {
        category: 'Other'
      },
      select: {
        id: true,
        name: true,
        category: true,
        status: true,
      }
    });

    console.log(`📦 Customizable Products with "Other" category: ${customizableProducts.length}`);
    if (customizableProducts.length > 0) {
      console.log('\nProducts found:');
      customizableProducts.forEach(product => {
        console.log(`  - ID: ${product.id}, Name: ${product.name}, Status: ${product.status}`);
      });
    }

    // Check catalog_clothing table (legacy)
    const catalogProducts = await prisma.catalog_clothing.findMany({
      where: {
        category: 'Other'
      },
      select: {
        product_id: true,
        product_name: true,
        category: true,
        status: true,
      }
    });

    console.log(`\n📦 Catalog Clothing with "Other" category: ${catalogProducts.length}`);
    if (catalogProducts.length > 0) {
      console.log('\nProducts found:');
      catalogProducts.forEach(product => {
        console.log(`  - ID: ${product.product_id}, Name: ${product.product_name}, Status: ${product.status}`);
      });
    }

    if (customizableProducts.length === 0 && catalogProducts.length === 0) {
      console.log('\n✅ No products with "Other" category found in database!');
      console.log('   Safe to remove "Other" from the category list.');
    } else {
      console.log('\n⚠️  Found products with "Other" category.');
      console.log('   You may want to update these products before removing "Other".');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOtherCategory();
