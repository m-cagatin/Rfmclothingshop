/**
 * Test what's actually being saved
 */

async function testWhatIsSaved() {
  try {
    const userId = '38463f2e6ff44e2e2a3371fe4f3c61ea';
    
    console.log('📡 Fetching last saved design...\n');
    
    const response = await fetch(`http://localhost:4000/api/design/load/last-used?userId=${userId}`);
    
    if (!response.ok) {
      console.error('❌ Failed:', response.status);
      return;
    }
    
    const result = await response.json();
    
    console.log('🔍 Last saved design data:\n');
    console.log('Product ID:', result.data.customizableProductId);
    console.log('Size:', result.data.selectedSize);
    console.log('Print Option:', result.data.selectedPrintOption);
    console.log('Last Saved:', new Date(result.data.lastSavedAt).toLocaleString());
    console.log('\n📦 Front Canvas:');
    
    if (result.data.frontCanvasJson) {
      const frontData = JSON.parse(result.data.frontCanvasJson);
      console.log('  - Objects:', frontData.objects?.length || 0);
      if (frontData.objects?.length > 0) {
        frontData.objects.forEach((obj: any, i: number) => {
          console.log(`  - Object ${i + 1}:`, obj.type, obj.text || obj.src?.substring(0, 50));
        });
      } else {
        console.log('  - EMPTY!');
      }
    }
    
    console.log('\n📦 Back Canvas:');
    if (result.data.backCanvasJson) {
      const backData = JSON.parse(result.data.backCanvasJson);
      console.log('  - Objects:', backData.objects?.length || 0);
      if (backData.objects?.length > 0) {
        backData.objects.forEach((obj: any, i: number) => {
          console.log(`  - Object ${i + 1}:`, obj.type, obj.text || obj.src?.substring(0, 50));
        });
      } else {
        console.log('  - EMPTY!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testWhatIsSaved();
