/**
 * Test if /api/customizable-products returns product 198
 */

async function testProductsAPI() {
  try {
    console.log('📡 Fetching products from API...\n');
    
    const response = await fetch('http://localhost:4000/api/customizable-products');
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, response.statusText);
      return;
    }
    
    const products = await response.json();
    
    console.log(`📦 Total products received: ${products.length}\n`);
    
    products.forEach((p: any) => {
      console.log(`ID: ${p.id} (${typeof p.id}), Name: ${p.name}, Category: ${p.category}`);
    });
    
    const product198 = products.find((p: any) => {
      if (typeof p.id === 'string') {
        return parseInt(p.id) === 198;
      }
      return p.id === 198;
    });
    
    if (product198) {
      console.log('\n✅ Product 198 FOUND in API response:');
      console.log(JSON.stringify(product198, null, 2));
    } else {
      console.log('\n❌ Product 198 NOT FOUND in API response');
      console.log('Available product IDs:', products.map((p: any) => p.id));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testProductsAPI();
