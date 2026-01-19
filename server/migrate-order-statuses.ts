import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateOrderStatuses() {
  try {
    console.log('🔍 Checking for orders with old status values...\n');

    // Check for orders with 'cutting' status
    const cuttingOrders = await prisma.$queryRaw`
      SELECT order_id, order_ref, status FROM orders WHERE status = 'cutting'
    `;
    console.log('Orders with "cutting" status:', cuttingOrders);

    // Check for orders with 'qc' status
    const qcOrders = await prisma.$queryRaw`
      SELECT order_id, order_ref, status FROM orders WHERE status = 'qc'
    `;
    console.log('Orders with "qc" status:', qcOrders);

    // If there are orders with old statuses, ask user what to do
    const cuttingCount = Array.isArray(cuttingOrders) ? cuttingOrders.length : 0;
    const qcCount = Array.isArray(qcOrders) ? qcOrders.length : 0;

    if (cuttingCount === 0 && qcCount === 0) {
      console.log('\n✅ No orders with old status values found!');
      console.log('Safe to run: npx prisma db push --accept-data-loss\n');
      return;
    }

    console.log('\n⚠️  Found orders with old status values:');
    console.log(`   - ${cuttingCount} orders with "cutting" status`);
    console.log(`   - ${qcCount} orders with "qc" status`);
    console.log('\n📝 Migrating statuses...');
    console.log('   - "cutting" → "assembly" (skip cutting stage)');
    console.log('   - "qc" → "qa" (rename quality check)\n');

    // Migrate cutting -> assembly
    if (cuttingCount > 0) {
      await prisma.$executeRaw`UPDATE orders SET status = 'assembly' WHERE status = 'cutting'`;
      console.log(`✅ Migrated ${cuttingCount} orders from "cutting" to "assembly"`);
    }

    // Migrate qc -> qa
    if (qcCount > 0) {
      await prisma.$executeRaw`UPDATE orders SET status = 'qa' WHERE status = 'qc'`;
      console.log(`✅ Migrated ${qcCount} orders from "qc" to "qa"`);
    }

    console.log('\n✅ Migration complete!');
    console.log('Now run: npx prisma db push --accept-data-loss\n');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateOrderStatuses();

