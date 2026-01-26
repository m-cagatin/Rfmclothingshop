// Quick script to manually add UserCart columns
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrate() {
  try {
    console.log('Adding columns to UserCart table...');
    
    // Add columns one by one using raw SQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE UserCart 
      ADD COLUMN IF NOT EXISTS size VARCHAR(20) NULL,
      ADD COLUMN IF NOT EXISTS color VARCHAR(50) NULL,
      ADD COLUMN IF NOT EXISTS customizationData JSON NULL,
      ADD COLUMN IF NOT EXISTS customDesignId INT NULL
    `).catch(e => {
      // If MySQL doesn't support IF NOT EXISTS, try without it
      console.log('Trying alternative approach...');
      return prisma.$executeRawUnsafe(`
        ALTER TABLE UserCart 
        ADD COLUMN size VARCHAR(20) NULL,
        ADD COLUMN color VARCHAR(50) NULL,
        ADD COLUMN customizationData JSON NULL,
        ADD COLUMN customDesignId INT NULL
      `);
    });
    
    console.log('✅ Successfully added columns to UserCart!');
    
    // Verify
    const result = await prisma.$queryRawUnsafe(`DESCRIBE UserCart`);
    console.log('\nUserCart columns:');
    console.table(result);
    
  } catch (error) {
    if (error.message.includes('Duplicate column name')) {
      console.log('✅ Columns already exist - migration not needed!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
