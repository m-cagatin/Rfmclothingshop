import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runDiagnostics() {
  console.log('='.repeat(80));
  console.log('🔍 CUSTOM DESIGN PAGE - DATABASE & API DIAGNOSTICS');
  console.log('='.repeat(80));
  
  try {
    // Test 1: Check database schema fields
    console.log('\n📋 TEST 1: Database Schema Fields');
    console.log('-'.repeat(80));
    
    const schemaInfo = await prisma.$queryRaw`
      DESCRIBE user_current_design;
    `;
    console.log('✅ user_current_design table structure:');
    console.table(schemaInfo);
    
    // Test 2: Check for existing designs
    console.log('\n📊 TEST 2: Existing Designs Count');
    console.log('-'.repeat(80));
    
    const draftCount = await prisma.user_current_design.count();
    const savedCount = await prisma.user_saved_designs.count();
    console.log(`✅ Drafts (user_current_design): ${draftCount}`);
    console.log(`✅ Saved (user_saved_designs): ${savedCount}`);
    
    // Test 3: Check users table
    console.log('\n👥 TEST 3: User Accounts');
    console.log('-'.repeat(80));
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true
      }
    });
    console.log(`✅ Total users: ${users.length}`);
    users.forEach(u => {
      console.log(`   - ${u.email} (ID: ${u.id.substring(0, 20)}..., GoogleID: ${u.googleId ? 'Yes' : 'No'})`);
    });
    
    // Test 4: Check customizable products
    console.log('\n🛍️  TEST 4: Customizable Products');
    console.log('-'.repeat(80));
    
    const products = await prisma.customizable_products.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        product_code: true
      },
      take: 10
    });
    console.log(`✅ Total products: ${products.length}`);
    products.forEach(p => {
      console.log(`   - [${p.product_code}] ${p.name} (${p.category})`);
    });
    
    // Test 5: Test data integrity
    console.log('\n🔧 TEST 5: Data Integrity Checks');
    console.log('-'.repeat(80));
    
    // Check designs count
    const totalDesigns = await prisma.user_current_design.count();
    console.log(`✅ Total designs: ${totalDesigns}`);
    
    // Test 6: Check for invalid print_area_preset values
    console.log('\n📐 TEST 6: Print Area Preset Values');
    console.log('-'.repeat(80));
    
    const invalidPresets = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT print_area_preset, COUNT(*) as count
      FROM user_current_design
      GROUP BY print_area_preset
    `;
    
    const validPresets = ['A4', 'Letter', 'Legal', 'Square', 'Custom'];
    console.log('Print area presets in database:');
    invalidPresets.forEach(row => {
      const isValid = validPresets.includes(row.print_area_preset);
      const status = isValid ? '✅' : '❌ INVALID';
      console.log(`   ${status} "${row.print_area_preset}" (${row.count} designs)`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DIAGNOSTICS COMPLETE');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('\n❌ DIAGNOSTIC ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runDiagnostics();
