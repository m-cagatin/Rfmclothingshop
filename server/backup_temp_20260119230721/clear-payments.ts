import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearPayments() {
  try {
    console.log('🔄 Clearing all payment records...');
    
    // Delete all payments
    const deletedPayments = await prisma.payments.deleteMany({});
    
    console.log(`✅ Deleted ${deletedPayments.count} payment records`);
    
    // Optionally reset order payment statuses
    console.log('🔄 Resetting order payment statuses...');
    const updatedOrders = await prisma.orders.updateMany({
      where: {
        payment_id: { not: null },
      },
      data: {
        payment_id: null,
        balance_remaining: null,
        status: 'payment_pending',
      },
    });
    
    console.log(`✅ Updated ${updatedOrders.count} orders`);
    console.log('✅ All payment data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing payments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearPayments();

