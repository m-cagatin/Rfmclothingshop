import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEnum() {
  try {
    // Check the current enum values in the database
    const enumValues = await prisma.$queryRaw`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'orders' 
      AND COLUMN_NAME = 'status'
    `;
    
    console.log('Current enum values in database:');
    console.log(JSON.stringify(enumValues, null, 2));
    
    // Try to get all distinct status values from orders table
    const distinctStatuses = await prisma.$queryRaw`
      SELECT DISTINCT status FROM orders WHERE status IS NOT NULL
    `;
    
    console.log('\nDistinct status values currently in orders:');
    console.log(JSON.stringify(distinctStatuses, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEnum();

