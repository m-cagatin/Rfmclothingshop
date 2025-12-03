/**
 * Test Script: Create Products via API
 * Sends POST requests to the API endpoint (not direct database writes)
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:4000/api/customizable-products';

// Mock image URLs (user will replace with real Cloudinary images later)
const MOCK_FRONT_IMAGE = 'https://via.placeholder.com/500x600/FFFFFF/000000?text=Front+View';
const MOCK_BACK_IMAGE = 'https://via.placeholder.com/500x600/FFFFFF/000000?text=Back+View';

const categories = [
  'T-Shirt - Chinese Collar',
  'T-Shirt - V-Neck',
  'T-Shirt - Round Neck',
  'Polo Shirt',
  'Sando (Jersey) - V-Neck',
  'Sando (Jersey) - Round Neck',
  'Sando (Jersey) - NBA Cut',
  'Varsity Jacket',
];

const colors = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Black', hex: '#000000' },
  { name: 'Navy Blue', hex: '#000080' },
];

const variants = [
  { name: 'Striped Pattern', suffix: 'Stripes' },
  { name: 'Geometric Pattern', suffix: 'Geo' },
  { name: 'Logo Print', suffix: 'Logo' },
];

// Helper: Transform enum values (spaces to underscores)
function transformEnum(value: string): string {
  return value.replace(/ /g, '_');
}

// Helper: Create product via API
async function createProduct(productData: any): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`❌ Failed: ${productData.name}`);
      console.error(`   Error: ${error}`);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Created: ${productData.name} (ID: ${result.id})`);
    return true;
  } catch (error: any) {
    console.error(`❌ Error creating ${productData.name}:`, error.message);
    return false;
  }
}

// Main function
async function createAllProducts() {
  console.log('🚀 Starting product creation via API...\n');
  console.log(`📡 API Endpoint: ${API_URL}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const category of categories) {
    console.log(`\n📦 Category: ${category}`);
    console.log('─'.repeat(60));

    // Create 3 color-based products
    for (const color of colors) {
      const productData = {
        name: `${category} - ${color.name}`,
        category: category,
        gender: 'Unisex',
        fitType: transformEnum('Classic'),
        description: `Premium ${category.toLowerCase()} in ${color.name.toLowerCase()} color. Perfect for custom printing and personalization.`,
        fabricComposition: '100% Cotton',
        fabricWeight: '180 g/m²',
        texture: 'Soft-washed',
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
        fitDescription: 'Regular fit with comfortable cut',
        sizePricing: {},
        colorName: color.name,
        colorHex: color.hex,
        printMethod: transformEnum('DTG'),
        printAreas: ['Front', 'Back'],
        designRequirements: 'PNG file with transparent background, 300 DPI minimum',
        baseCost: 150,
        retailPrice: 350,
        turnaroundTime: '5-7 business days for production',
        minimumOrderQty: 1,
        frontPrintCost: 100,
        backPrintCost: 100,
        sizeAvailability: {},
        differentiationType: 'color',
        status: 'active',
        images: [
          {
            url: MOCK_FRONT_IMAGE,
            publicId: `mock-front-${Date.now()}`,
            type: 'front',
            displayOrder: 1,
          },
          {
            url: MOCK_BACK_IMAGE,
            publicId: `mock-back-${Date.now()}`,
            type: 'back',
            displayOrder: 1,
          },
        ],
      };

      const success = await createProduct(productData);
      if (success) successCount++;
      else failCount++;

      // Small delay to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Create 3 variant-based products
    for (const variant of variants) {
      const productData = {
        name: `${category} - ${variant.suffix}`,
        category: category,
        gender: 'Unisex',
        fitType: transformEnum('Classic'),
        description: `${category} with pre-designed ${variant.name.toLowerCase()}. Ready-to-order custom apparel.`,
        fabricComposition: '100% Cotton',
        fabricWeight: '180 g/m²',
        texture: 'Soft-washed',
        availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
        fitDescription: 'Regular fit with comfortable cut',
        sizePricing: {},
        variantName: variant.name,
        variantImageUrl: MOCK_FRONT_IMAGE,
        variantImagePublicId: `mock-variant-${Date.now()}`,
        printMethod: transformEnum('DTG'),
        printAreas: ['Front', 'Back'],
        designRequirements: 'PNG file with transparent background, 300 DPI minimum',
        baseCost: 180,
        retailPrice: 400,
        turnaroundTime: '5-7 business days for production',
        minimumOrderQty: 1,
        frontPrintCost: 100,
        backPrintCost: 100,
        sizeAvailability: {},
        differentiationType: 'variant',
        status: 'active',
        images: [
          {
            url: MOCK_FRONT_IMAGE,
            publicId: `mock-front-${Date.now()}`,
            type: 'front',
            displayOrder: 1,
          },
          {
            url: MOCK_BACK_IMAGE,
            publicId: `mock-back-${Date.now()}`,
            type: 'back',
            displayOrder: 1,
          },
        ],
      };

      const success = await createProduct(productData);
      if (success) successCount++;
      else failCount++;

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(60));
  console.log(`✅ Successfully created: ${successCount} products`);
  console.log(`❌ Failed: ${failCount} products`);
  console.log(`📦 Total attempted: ${successCount + failCount} products`);
  console.log('\n💾 Check Prisma Studio at http://localhost:5555 to view database');
}

// Run the script
createAllProducts().catch(console.error);
