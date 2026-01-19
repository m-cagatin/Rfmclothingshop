/**
 * ⚠️ DANGER: This script will DELETE ALL DATA from the database
 * 
 * This will reset everything to zero:
 * - All orders and order items
 * - All payments
 * - All customers
 * - All products (customizable and catalog)
 * - All cart items
 * - All favorites
 * - All expenses
 * - All refresh tokens
 * - All users (except you might want to keep admin users)
 * 
 * Run with: npx ts-node reset-database.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data from the database!');
  console.log('Starting database reset...\n');

  try {
    // Use raw SQL to disable foreign key checks temporarily
    // This allows us to delete in any order
    console.log('🔓 Disabling foreign key checks...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    
    // Delete all data (order doesn't matter now)
    console.log('🗑️  Deleting payments...');
    const deletedPayments = await prisma.payments.deleteMany({});
    console.log(`   ✅ Deleted ${deletedPayments.count} payments`);

    console.log('🗑️  Deleting expenses...');
    const deletedExpenses = await prisma.expenses.deleteMany({});
    console.log(`   ✅ Deleted ${deletedExpenses.count} expenses`);

    console.log('🗑️  Deleting order items...');
    const deletedOrderItems = await prisma.order_items.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrderItems.count} order items`);

    console.log('🗑️  Deleting orders...');
    const deletedOrders = await prisma.orders.deleteMany({});
    console.log(`   ✅ Deleted ${deletedOrders.count} orders`);

    // 5. Delete user-related data
    console.log('🗑️  Deleting cart items...');
    const deletedCart = await prisma.userCart.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCart.count} cart items`);

    console.log('🗑️  Deleting favorites...');
    const deletedFavorites = await prisma.userFavorite.deleteMany({});
    console.log(`   ✅ Deleted ${deletedFavorites.count} favorites`);

    console.log('🗑️  Deleting refresh tokens...');
    const deletedTokens = await prisma.refreshToken.deleteMany({});
    console.log(`   ✅ Deleted ${deletedTokens.count} refresh tokens`);

    // 6. Delete product images first (foreign key constraint)
    console.log('🗑️  Deleting product images...');
    const deletedImages = await prisma.customizable_product_images.deleteMany({});
    console.log(`   ✅ Deleted ${deletedImages.count} product images`);

    // 7. Delete products
    console.log('🗑️  Deleting customizable products...');
    const deletedCustomProducts = await prisma.customizable_products.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCustomProducts.count} customizable products`);

    console.log('🗑️  Deleting catalog products...');
    const deletedCatalog = await prisma.catalog_clothing.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCatalog.count} catalog products`);

    // 8. Delete customer accounts
    console.log('🗑️  Deleting customer accounts...');
    const deletedCustomers = await prisma.customer_accounts.deleteMany({});
    console.log(`   ✅ Deleted ${deletedCustomers.count} customer accounts`);

    // 9. Delete users (WARNING: This will delete ALL users including admins!)
    console.log('🗑️  Deleting users...');
    const deletedUsers = await prisma.users.deleteMany({});
    console.log(`   ✅ Deleted ${deletedUsers.count} users`);

    console.log('\n✨ Database reset complete! All data has been deleted.');
    console.log('📊 Summary:');
    console.log(`   - Orders: ${deletedOrders.count}`);
    console.log(`   - Order Items: ${deletedOrderItems.count}`);
    console.log(`   - Payments: ${deletedPayments.count}`);
    console.log(`   - Expenses: ${deletedExpenses.count}`);
    console.log(`   - Cart Items: ${deletedCart.count}`);
    console.log(`   - Favorites: ${deletedFavorites.count}`);
    console.log(`   - Refresh Tokens: ${deletedTokens.count}`);
    console.log(`   - Product Images: ${deletedImages.count}`);
    console.log(`   - Customizable Products: ${deletedCustomProducts.count}`);
    console.log(`   - Catalog Products: ${deletedCatalog.count}`);
    console.log(`   - Customer Accounts: ${deletedCustomers.count}`);
    console.log(`   - Users: ${deletedUsers.count}`);

    // Re-enable foreign key checks
    console.log('\n🔒 Re-enabling foreign key checks...');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('   ✅ Foreign key checks re-enabled');

  } catch (error: any) {
    console.error('❌ Error resetting database:', error);
    console.error('Error details:', error.message);
    
    // Try to re-enable foreign key checks even if there was an error
    try {
      await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (e) {
      // Ignore errors when re-enabling
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the reset
resetDatabase()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

