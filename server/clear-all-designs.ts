import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllDesigns() {
  try {
    console.log('🗑️  Clearing all design data...\n');

    // Clear user_current_design (drafts)
    const deletedDrafts = await prisma.user_current_design.deleteMany({});
    console.log(`✅ Deleted ${deletedDrafts.count} draft designs from user_current_design`);

    // Clear user_saved_designs (library)
    const deletedSaved = await prisma.user_saved_designs.deleteMany({});
    console.log(`✅ Deleted ${deletedSaved.count} saved designs from user_saved_designs`);

    console.log('\n✅ All design data cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing designs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllDesigns();
