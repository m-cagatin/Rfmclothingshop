/**
 * Test if load API returns canvas JSON
 */

async function testLoadAPI() {
  try {
    console.log('📡 Testing load API...\n');
    
    const userId = '38463f2e6ff44e2e2a3371fe4f3c61ea'; // Your user ID from database check
    
    const response = await fetch(`http://localhost:4000/api/design/load/last-used?userId=${userId}`);
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response:', text);
      return;
    }
    
    const result = await response.json();
    
    console.log('📦 API Result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 Key fields:');
    console.log('- customizableProductId:', result.data?.customizableProductId);
    console.log('- selectedSize:', result.data?.selectedSize);
    console.log('- selectedPrintOption:', result.data?.selectedPrintOption);
    console.log('- Has frontCanvasJson:', !!result.data?.frontCanvasJson);
    console.log('- Has backCanvasJson:', !!result.data?.backCanvasJson);
    
    if (result.data?.frontCanvasJson) {
      console.log('\n🎨 Front Canvas JSON length:', result.data.frontCanvasJson.length);
      const parsed = JSON.parse(result.data.frontCanvasJson);
      console.log('Front Canvas objects:', parsed.objects?.length || 0);
    }
    
    if (result.data?.backCanvasJson) {
      console.log('\n🎨 Back Canvas JSON length:', result.data.backCanvasJson.length);
      const parsed = JSON.parse(result.data.backCanvasJson);
      console.log('Back Canvas objects:', parsed.objects?.length || 0);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLoadAPI();
