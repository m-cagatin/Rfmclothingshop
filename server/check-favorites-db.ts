import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFavoritesDatabase() {
  try {
    console.log('=== Checking UserFavorite table ===');
    
    // Try to count records
    const count = await prisma.userFavorite.count();
    console.log(`✅ UserFavorite table exists. Total records: ${count}`);
    
    // Try to fetch a few records
    const favorites = await prisma.userFavorite.findMany({
      take: 5,
    });
    console.log(`✅ Successfully queried ${favorites.length} favorites`);
    
    // Check table structure by trying to create a test record (then delete it)
    console.log('\n=== Testing table structure ===');
    const testFavorite = await prisma.userFavorite.create({
      data: {
        userId: 'test-user-id',
        productId: 'test-product-id',
        productName: 'Test Product',
        price: 0,
      },
    });
    console.log('✅ Successfully created test favorite:', testFavorite.id);
    
    await prisma.userFavorite.delete({
      where: { id: testFavorite.id },
    });
    console.log('✅ Successfully deleted test favorite');
    
    console.log('\n✅ All checks passed! UserFavorite table is working correctly.');
  } catch (error) {
    console.error('❌ Error checking UserFavorite table:');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('does not exist') || error.message.includes('Unknown table')) {
        console.error('\n🔧 SOLUTION: The UserFavorite table does not exist in the database.');
        console.error('   Run database migrations: npx prisma migrate dev');
      } else if (error.message.includes('connect') || error.message.includes('connection')) {
        console.error('\n🔧 SOLUTION: Database connection issue.');
        console.error('   Check your DATABASE_URL in .env file');
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkFavoritesDatabase();

