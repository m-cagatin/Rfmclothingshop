import fetch from 'node-fetch';

const API_BASE = 'http://localhost:4000';
const testUserId = '29143851555ed693023e6d8ed1b64b40';

async function testAPIs() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test 1: Save work-in-progress (old API)
    console.log('1️⃣ Testing POST /api/design/save (work-in-progress)...');
    const saveResponse = await fetch(`${API_BASE}/api/design/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        customizableProductId: 196,
        selectedSize: 'L',
        selectedPrintOption: 'front',
        printAreaPreset: 'medium',
        frontCanvasJson: JSON.stringify({ objects: [{ type: 'text', text: 'API Test' }] }),
        frontThumbnailUrl: 'https://test.com/thumb.png',
        backCanvasJson: null,
        backThumbnailUrl: null
      })
    });

    if (saveResponse.ok) {
      const result = await saveResponse.json();
      console.log('   ✅ Work-in-progress save successful');
      console.log('   Response:', result);
    } else {
      console.log('   ❌ Failed:', saveResponse.status, saveResponse.statusText);
      const error = await saveResponse.text();
      console.log('   Error:', error);
    }

    console.log('');

    // Test 2: Save to library (new API)
    console.log('2️⃣ Testing POST /api/saved-designs/save (library)...');
    const librarySaveResponse = await fetch(`${API_BASE}/api/saved-designs/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId,
        customizableProductId: 196,
        designName: 'API Test Design',
        selectedSize: 'L',
        selectedPrintOption: 'front',
        printAreaPreset: 'medium',
        frontCanvasJson: JSON.stringify({ objects: [{ type: 'text', text: 'Library Test' }] }),
        frontThumbnailUrl: 'https://test.com/thumb2.png',
        backCanvasJson: null,
        backThumbnailUrl: null
      })
    });

    if (librarySaveResponse.ok) {
      const result = await librarySaveResponse.json();
      console.log('   ✅ Library save successful');
      console.log('   Response:', result);
    } else {
      console.log('   ❌ Failed:', librarySaveResponse.status, librarySaveResponse.statusText);
      const error = await librarySaveResponse.text();
      console.log('   Error:', error);
    }

    console.log('');

    // Test 3: Get all saved designs
    console.log('3️⃣ Testing GET /api/saved-designs/all...');
    const getAllResponse = await fetch(`${API_BASE}/api/saved-designs/all?userId=${testUserId}`);

    if (getAllResponse.ok) {
      const designs = await getAllResponse.json();
      console.log('   ✅ Get all designs successful');
      console.log(`   Found ${designs.length} designs`);
      if (designs.length > 0) {
        designs.forEach((d: any, i: number) => {
          console.log(`      ${i + 1}. "${d.design_name}" (ID: ${d.id})`);
        });
      }
    } else {
      console.log('   ❌ Failed:', getAllResponse.status, getAllResponse.statusText);
    }

    console.log('\n✅ API endpoint tests complete!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testAPIs();
