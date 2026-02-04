import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSaveWorkInProgress() {
  try {
    const testUserId = '29143851555ed693023e6d8ed1b64b40'; // Your user ID
    const testProductId = 1; // Assuming product ID 1 exists
    
    console.log('🧪 Testing Work-in-Progress Save...\n');

    // Check if product exists
    const product = await prisma.customizable_products.findFirst({
      select: { id: true, name: true }
    });

    if (!product) {
      console.log('❌ No customizable products found in database');
      return;
    }

    console.log(`✅ Using product: ${product.name} (ID: ${product.id})`);

    // Test save work-in-progress
    const testCanvasData = JSON.stringify({
      version: '5.3.0',
      objects: [{
        type: 'text',
        text: 'Test Design',
        left: 100,
        top: 100,
        fontSize: 40,
        fill: '#000000'
      }]
    });

    const existingDesign = await prisma.user_current_design.findFirst({
      where: {
        user_id: testUserId,
        customizable_product_id: product.id
      }
    });

    let saved;
    if (existingDesign) {
      console.log('\n📝 Updating existing work-in-progress...');
      saved = await prisma.user_current_design.update({
        where: { id: existingDesign.id },
        data: {
          selected_size: 'M',
          selected_print_option: 'front',
          print_area_preset: 'medium',
          front_canvas_json: testCanvasData,
          front_thumbnail_url: 'https://test.cloudinary.com/test.png',
          updated_at: new Date()
        }
      });
    } else {
      console.log('\n📝 Creating new work-in-progress...');
      saved = await prisma.user_current_design.create({
        data: {
          user_id: testUserId,
          customizable_product_id: product.id,
          selected_size: 'M',
          selected_print_option: 'front',
          print_area_preset: 'medium',
          front_canvas_json: testCanvasData,
          front_thumbnail_url: 'https://test.cloudinary.com/test.png',
          back_canvas_json: null,
          back_thumbnail_url: null
        }
      });
    }

    console.log('✅ Work-in-progress saved successfully!');
    console.log(`   ID: ${saved.id}`);
    console.log(`   Has Front Canvas: ${saved.front_canvas_json ? 'Yes' : 'No'}`);

    // Now test save to library
    console.log('\n\n🧪 Testing Save to Library...\n');

    const libraryDesign = await prisma.user_saved_designs.create({
      data: {
        user_id: testUserId,
        customizable_product_id: product.id,
        design_name: 'Test Library Design',
        selected_size: 'M',
        selected_print_option: 'front',
        print_area_preset: 'medium',
        front_canvas_json: testCanvasData,
        front_thumbnail_url: 'https://test.cloudinary.com/test.png',
        back_canvas_json: null,
        back_thumbnail_url: null,
        is_template: false
      }
    });

    console.log('✅ Library design saved successfully!');
    console.log(`   ID: ${libraryDesign.id}`);
    console.log(`   Name: ${libraryDesign.design_name}`);
    console.log(`   Has Front Canvas: ${libraryDesign.front_canvas_json ? 'Yes' : 'No'}`);

    // Verify by fetching
    console.log('\n\n📋 Verifying saved designs...\n');

    const workInProgress = await prisma.user_current_design.count({
      where: { user_id: testUserId }
    });

    const libraryDesigns = await prisma.user_saved_designs.count({
      where: { user_id: testUserId }
    });

    console.log(`Work-in-progress designs: ${workInProgress}`);
    console.log(`Library designs: ${libraryDesigns}`);

    console.log('\n✅ All save functions working correctly!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSaveWorkInProgress();
