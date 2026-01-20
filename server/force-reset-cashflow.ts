import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceResetCashflow() {
  try {
    console.log('🗑️  Force Resetting Cashflow and Reports...\n');
    
    // Check current count
    const beforeCount = await prisma.expenses.count();
    console.log(`📊 Current cashflow entries: ${beforeCount}`);
    
    // Clear all cashflow entries (expenses table)
    console.log('\n📊 Deleting all cashflow entries...');
    const deletedCashflow = await prisma.expenses.deleteMany({});
    console.log(`✅ Deleted ${deletedCashflow.count} cashflow entries\n`);
    
    // Verify deletion
    const afterCount = await prisma.expenses.count();
    console.log(`📊 Remaining cashflow entries: ${afterCount}`);
    
    if (afterCount === 0) {
      console.log('\n✨ Cashflow and Reports reset successfully!');
      console.log('💰 Starting fresh with ₱0.00 balance');
      console.log('\n📝 Connection Flow:');
      console.log('   1. Payment Verification → Updates Order Status');
      console.log('   2. Payment Approval → Automatically adds income to cashflow');
      console.log('   3. Reports → Generated from cashflow data');
    } else {
      console.log('\n⚠️  Warning: Some entries may still exist');
    }
    
  } catch (error: any) {
    console.error('❌ Error resetting cashflow:', error);
    console.error('Error details:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

forceResetCashflow();

