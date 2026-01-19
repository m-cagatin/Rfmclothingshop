import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearCashflow() {
  try {
    console.log('🗑️  Clearing all cashflow entries (expenses table)...');
    
    const deletedCount = await prisma.expenses.deleteMany({});
    
    console.log(`✅ Deleted ${deletedCount.count} cashflow entries`);
    console.log('💰 Cashflow total income reset to ₱0.00');
  } catch (error) {
    console.error('❌ Error clearing cashflow:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearCashflow();

