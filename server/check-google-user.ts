import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGoogleUser() {
  try {
    // Check the User table (singular) - used by Google OAuth
    const user = await prisma.user.findUnique({
      where: { email: 'm.cagatin.512024@umindanao.edu.ph' },
      select: { 
        id: true, 
        email: true, 
        name: true,
        googleId: true,
        role: true,
        emailVerified: true
      }
    });

    if (!user) {
      console.log('❌ User not found in User table');
      console.log('\nAll users in User table:');
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true }
      });
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.name})`));
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Google ID: ${user.googleId}`);
    console.log(`   Email Verified: ${user.emailVerified}`);
    console.log('');

    // Check work-in-progress designs
    const currentDesigns = await prisma.user_current_design.findMany({
      where: { user_id: user.id },
      include: {
        customizable_products: {
          select: { 
            name: true,
            category: true
          }
        }
      }
    });

    console.log(`📝 Work-in-progress designs: ${currentDesigns.length}`);
    if (currentDesigns.length > 0) {
      currentDesigns.forEach((design, index) => {
        console.log(`   ${index + 1}. ${design.customizable_products.name}`);
        console.log(`      Category: ${design.customizable_products.category}`);
        console.log(`      Size: ${design.selected_size}`);
        console.log(`      Print: ${design.selected_print_option}`);
        console.log(`      Has Front: ${design.front_canvas_json ? 'Yes' : 'No'}`);
        console.log(`      Has Back: ${design.back_canvas_json ? 'Yes' : 'No'}`);
      });
    }
    console.log('');

    // Check saved library designs
    const savedDesigns = await prisma.user_saved_designs.findMany({
      where: { user_id: user.id },
      include: {
        customizable_products: {
          select: { 
            name: true,
            category: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log(`💾 Saved library designs: ${savedDesigns.length}`);
    if (savedDesigns.length > 0) {
      savedDesigns.forEach((design, index) => {
        console.log(`   ${index + 1}. "${design.design_name}"`);
        console.log(`      Product: ${design.customizable_products.name}`);
        console.log(`      Category: ${design.customizable_products.category}`);
        console.log(`      Size: ${design.selected_size}`);
        console.log(`      Print: ${design.selected_print_option}`);
        console.log(`      Has Front: ${design.front_canvas_json ? 'Yes' : 'No'}`);
        console.log(`      Has Back: ${design.back_canvas_json ? 'Yes' : 'No'}`);
        console.log(`      Created: ${design.created_at.toLocaleString()}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkGoogleUser();
