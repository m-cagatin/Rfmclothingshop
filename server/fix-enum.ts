import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixEnum() {
  try {
    console.log('🔧 Fixing orders_status enum in database...\n');

    // Drop and recreate the enum with correct values
    // MySQL doesn't support ALTER ENUM directly, so we need to:
    // 1. Modify the column to VARCHAR temporarily
    // 2. Update any old values
    // 3. Change back to ENUM with new values
    
    console.log('Step 1: Converting status column to VARCHAR temporarily...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE orders 
      MODIFY COLUMN status VARCHAR(50)
    `);
    console.log('✅ Column converted to VARCHAR');

    console.log('\nStep 2: Updating any old status values...');
    // Update any old values that might exist
    await prisma.$executeRawUnsafe(`
      UPDATE orders 
      SET status = 'assembly' 
      WHERE status = 'cutting'
    `);
    
    await prisma.$executeRawUnsafe(`
      UPDATE orders 
      SET status = 'qa' 
      WHERE status = 'qc'
    `);
    console.log('✅ Old status values updated');

    console.log('\nStep 3: Converting back to ENUM with new values...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM(
        'payment_pending',
        'pending',
        'designing',
        'ripping',
        'heatpress',
        'assembly',
        'qa',
        'packing',
        'done',
        'shipping',
        'delivered',
        'cancelled'
      ) DEFAULT 'payment_pending'
    `);
    console.log('✅ Enum recreated with correct values');

    console.log('\n✅ Database enum fixed successfully!');
    console.log('Please restart your server to pick up the changes.\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnum();

