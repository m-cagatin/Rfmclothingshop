import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspectDesign() {
  try {
    const design = await prisma.user_current_design.findFirst({
      where: { user_id: '29143851555ed693023e6d8ed1b64b40' }
    });

    if (!design) {
      console.log('No design found');
      return;
    }

    console.log('Design ID:', design.id);
    console.log('Product ID:', design.customizable_product_id);
    console.log('Size:', design.selected_size);
    console.log('Print Option:', design.selected_print_option);
    console.log('Print Area:', design.print_area_preset);
    console.log('Last Saved:', design.last_saved_at);
    console.log('\nFront Canvas JSON:');
    if (design.front_canvas_json) {
      const canvas = JSON.parse(design.front_canvas_json);
      console.log('Objects count:', canvas.objects?.length || 0);
      if (canvas.objects && canvas.objects.length > 0) {
        canvas.objects.forEach((obj: any, i: number) => {
          console.log(`  ${i + 1}. Type: ${obj.type}, Text: ${obj.text || 'N/A'}`);
        });
      }
    } else {
      console.log('(null)');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDesign();
