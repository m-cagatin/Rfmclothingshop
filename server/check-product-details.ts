import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductDetails() {
  try {
    console.log('=== CHECKING PRODUCT DETAILS ===\n');
    const products = await prisma.customizable_products.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
        category: true,
        fit_type: true,
        fit_description: true,
        color_name: true,
        color_hex: true,
        retail_price: true,
        front_print_cost: true,
        back_print_cost: true,
      }
    });
    
    console.log(JSON.stringify(products, null, 2));
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total sampled: ${products.length}`);
    
    const hasCategory = products.filter(p => p.category).length;
    const hasFitType = products.filter(p => p.fit_type).length;
    const hasFitDesc = products.filter(p => p.fit_description).length;
    const hasColorName = products.filter(p => p.color_name).length;
    const hasColorHex = products.filter(p => p.color_hex).length;
    const hasRetailPrice = products.filter(p => p.retail_price).length;
    const hasFrontPrint = products.filter(p => p.front_print_cost).length;
    const hasBackPrint = products.filter(p => p.back_print_cost).length;
    
    console.log(`Category: ${hasCategory}/${products.length}`);
    console.log(`Fit Type: ${hasFitType}/${products.length}`);
    console.log(`Fit Description: ${hasFitDesc}/${products.length}`);
    console.log(`Color Name: ${hasColorName}/${products.length}`);
    console.log(`Color Hex: ${hasColorHex}/${products.length}`);
    console.log(`Retail Price: ${hasRetailPrice}/${products.length}`);
    console.log(`Front Print Cost: ${hasFrontPrint}/${products.length}`);
    console.log(`Back Print Cost: ${hasBackPrint}/${products.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductDetails();
