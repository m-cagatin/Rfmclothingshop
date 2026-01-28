import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkGoogleUser() {
  try {
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
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log('');

    const currentDesigns = await prisma.user_current_design.findMany({
      where: { user_id: user.id }
    });

    console.log(`📝 Work-in-progress designs: ${currentDesigns.length}`);
    if (currentDesigns.length > 0) {
      currentDesigns.forEach((design, index) => {
        console.log(`   ${index + 1}. Product ID: ${design.customizable_product_id}`);
        console.log(`      Size: ${design.selected_size}`);
        console.log(`      Has Front: ${design.front_canvas_json ? 'Yes' : 'No'}`);
        console.log(`      Has Back: ${design.back_canvas_json ? 'Yes' : 'No'}`);
      });
    }
    console.log('');

    const savedDesigns = await prisma.user_saved_designs.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' }
    });

    console.log(`💾 Saved library designs: ${savedDesigns.length}`);
    if (savedDesigns.length > 0) {
      savedDesigns.forEach((design, index) => {
        console.log(`   ${index + 1}. "${design.design_name}"`);
        console.log(`      Product ID: ${design.customizable_product_id}`);
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
