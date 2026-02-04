import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTable() {
  try {
    // Check if user_current_design table exists
    const tableCheck: any = await prisma.$queryRawUnsafe('DESCRIBE user_current_design');
    console.log('✅ user_current_design table EXISTS with structure:');
    console.log(JSON.stringify(tableCheck, null, 2));
    console.log('\n');

    // Check if there's any data
    const count = await prisma.user_current_design.count();
    console.log(`📊 Records in table: ${count}`);
    
    // Show all records if any
    if (count > 0) {
      const designs = await prisma.user_current_design.findMany({
        take: 5,
        select: {
          id: true,
          user_id: true,
          customizable_product_id: true,
          selected_size: true,
          last_saved_at: true,
        }
      });
      console.log('\n📝 Sample records:');
      console.log(JSON.stringify(designs, null, 2));
    }
  } catch (error: any) {
    console.log('❌ TABLE DOES NOT EXIST!');
    console.log('Error:', error.message);
    console.log('\nThis means the migration did not complete successfully.');
  } finally {
    await prisma.$disconnect();
  }
}

checkTable();
