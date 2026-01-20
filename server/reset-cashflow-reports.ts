import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetCashflowAndReports() {
  try {
    console.log('🗑️  Resetting Cashflow and Reports...\n');
    
    // Clear all cashflow entries (expenses table)
    console.log('📊 Clearing cashflow entries...');
    const deletedCashflow = await prisma.expenses.deleteMany({});
    console.log(`✅ Deleted ${deletedCashflow.count} cashflow entries\n`);
    
    // Note: Reports are generated from cashflow data, so clearing cashflow resets reports
    console.log('📈 Reports are automatically generated from cashflow data');
    console.log('   All reports will now show zero values\n');
    
    console.log('✨ Cashflow and Reports reset successfully!');
    console.log('💰 Starting fresh with ₱0.00 balance');
    console.log('\n📝 Note: Payment verification → Orders → Cashflow → Reports are connected:');
    console.log('   1. When payment is approved → Order status updates');
    console.log('   2. Payment approval → Automatically adds income to cashflow');
    console.log('   3. Reports are generated from cashflow data');
    
  } catch (error) {
    console.error('❌ Error resetting cashflow and reports:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

resetCashflowAndReports();

