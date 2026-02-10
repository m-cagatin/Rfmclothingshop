import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVariantPersistence() {
  try {
    console.log('🔍 Checking variant persistence in database...\n');

    // Check recent saved designs
    const recentDesigns = await prisma.user_current_design.findMany({
      take: 10,
      orderBy: { last_saved_at: 'desc' },
      select: {
        id: true,
        user_id: true,
        customizable_product_id: true,
        selected_size: true,
        selected_print_option: true,
        print_area_preset: true,
        last_saved_at: true,
        created_at: true,
        updated_at: true,
        front_canvas_json: true,
        back_canvas_json: true
      }
    });

    console.log(`📊 Found ${recentDesigns.length} saved designs:\n`);
    
    recentDesigns.forEach((design, index) => {
      console.log(`Design ${index + 1}:`);
      console.log(`  ID: ${design.id}`);
      console.log(`  User ID: ${design.user_id}`);
      console.log(`  Product ID: ${design.customizable_product_id}`);
      console.log(`  Size: ${design.selected_size}`);
      console.log(`  Print Option: ${design.selected_print_option}`);
      console.log(`  Print Area Preset: ${design.print_area_preset}`);
      console.log(`  Last Saved: ${design.last_saved_at}`);
      console.log(`  Created: ${design.created_at}`);
      console.log(`  Updated: ${design.updated_at}`);
      console.log(`  Has Front Canvas: ${design.front_canvas_json ? 'Yes' : 'No'}`);
      console.log(`  Has Back Canvas: ${design.back_canvas_json ? 'Yes' : 'No'}`);
      console.log('---');
    });

    // Check unique constraint
    console.log('\n🔍 Checking unique constraint (user_id, customizable_product_id)...\n');
    
    const duplicates = await prisma.$queryRaw`
      SELECT user_id, customizable_product_id, COUNT(*) as count
      FROM user_current_design
      GROUP BY user_id, customizable_product_id
      HAVING COUNT(*) > 1
    `;
    
    if (Array.isArray(duplicates) && duplicates.length > 0) {
      console.log('⚠️  Found duplicate entries (violating unique constraint):');
      console.log(duplicates);
    } else {
      console.log('✅ No duplicate entries found (unique constraint is working)');
    }

    // Check if table exists and schema
    console.log('\n🔍 Checking table schema...\n');
    
    const schema = await prisma.$queryRaw`
      DESCRIBE user_current_design
    `;
    
    console.log('Table schema:');
    console.log(schema);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariantPersistence();
