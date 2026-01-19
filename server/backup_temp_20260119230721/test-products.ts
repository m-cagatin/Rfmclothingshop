/**
 * Test Script: Create Sample Products
 * This script creates products for all categories to test the database connection
 */

const API_URL = 'http://localhost:4000/api/customizable-products';

interface ProductData {
  name: string;
  category: string;
  gender: string;
  fitType: string;
  description: string;
  fabricComposition: string;
  fabricWeight: string;
  texture: string;
  availableSizes: string[];
  fitDescription: string;
  sizePricing: Record<string, number>;
  colorName?: string;
  colorHex?: string;
  variantName?: string;
  variantImageUrl?: string;
  variantImagePublicId?: string;
  printMethod: string;
  printAreas: string[];
  designRequirements: string;
  baseCost: number;
  retailPrice: number;
  turnaroundTime: string;
  minimumOrderQty: number;
  frontPrintCost: number;
  backPrintCost: number;
  sizeAvailability: Record<string, boolean>;
  differentiationType: string;
  status: string;
  images: Array<{
    url: string;
    publicId: string;
    type: string;
    displayOrder: number;
  }>;
}

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
  { name: 'Striped Pattern', suffix: 'striped' },
  { name: 'Geometric Pattern', suffix: 'geometric' },
  { name: 'Logo Design', suffix: 'logo' },
];

async function createProduct(productData: ProductData): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
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
  } catch (error) {
    console.error(`❌ Failed: ${productData.name}`);
    console.error(`   Error: ${error}`);
    return false;
  }
}

function getBaseProduct(category: string, index: number): Partial<ProductData> {
  const isSando = category.includes('Sando');
  const isVarsity = category.includes('Varsity');
  const isPolo = category.includes('Polo');
  
  return {
    category,
    gender: 'Unisex',
    fitType: isPolo ? 'Slim_Fit' : 'Classic',
    fabricComposition: isSando ? '100% Polyester' : isVarsity ? '80% Cotton, 20% Polyester' : '100% Cotton',
    fabricWeight: isSando ? '150 g/m²' : isVarsity ? '300 g/m²' : '180 g/m²',
    texture: isSando ? 'Smooth jersey' : isVarsity ? 'Fleece-lined' : 'Soft-washed',
    availableSizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    fitDescription: isPolo ? 'Tailored slim fit for modern look' : 'Regular fit with comfortable cut',
    sizePricing: { 'XL': 50, '2XL': 100 },
    printMethod: isPolo ? 'Embroidery' : isSando ? 'DTG' : 'Screen_Print',
    printAreas: ['Front', 'Back'],
    designRequirements: 'Upload your design in high-resolution format (PNG, AI, or PSD). Ensure design dimensions match the selected print area.',
    baseCost: isSando ? 120 : isVarsity ? 400 : isPolo ? 200 : 150,
    retailPrice: isSando ? 280 : isVarsity ? 850 : isPolo ? 450 : 350,
    turnaroundTime: '5-7 business days for production. Rush orders available with additional fee.',
    minimumOrderQty: 1,
    frontPrintCost: 100,
    backPrintCost: 100,
    sizeAvailability: {
      'XS': true,
      'S': true,
      'M': true,
      'L': true,
      'XL': true,
      '2XL': true,
    },
    status: 'active',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
        publicId: `temp-front-${Date.now()}-${index}`,
        type: 'front',
        displayOrder: 1,
      },
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
        publicId: `temp-back-${Date.now()}-${index}`,
        type: 'back',
        displayOrder: 1,
      },
    ],
  };
}

async function main() {
  console.log('🚀 Starting product creation test...\n');
  console.log(`📦 Creating products for ${categories.length} categories`);
  console.log(`🎨 Each category: 3 colors + 3 variants = 6 products`);
  console.log(`📊 Total products to create: ${categories.length * 6}\n`);

  let successCount = 0;
  let failCount = 0;
  let productIndex = 0;

  for (const category of categories) {
    console.log(`\n📁 Category: ${category}`);
    console.log('─'.repeat(60));

    // Create 3 color-based products
    for (const color of colors) {
      productIndex++;
      const baseProduct = getBaseProduct(category, productIndex);
      const product: ProductData = {
        ...baseProduct,
        name: `${category} - ${color.name}`,
        description: `Premium ${category.toLowerCase()} in ${color.name.toLowerCase()} color. Perfect for custom printing and designs.`,
        differentiationType: 'color',
        colorName: color.name,
        colorHex: color.hex,
      } as ProductData;

      const success = await createProduct(product);
      if (success) successCount++;
      else failCount++;
    }

    // Create 3 variant-based products
    for (const variant of variants) {
      productIndex++;
      const baseProduct = getBaseProduct(category, productIndex);
      const product: ProductData = {
        ...baseProduct,
        name: `${category} - ${variant.name}`,
        description: `${category} featuring ${variant.name.toLowerCase()}. Pre-designed template ready for production.`,
        differentiationType: 'variant',
        variantName: variant.name,
        variantImageUrl: `https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=800`,
        variantImagePublicId: `temp-variant-${variant.suffix}-${Date.now()}-${productIndex}`,
      } as ProductData;

      const success = await createProduct(product);
      if (success) successCount++;
      else failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTS:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📦 Total: ${successCount + failCount}`);
  console.log('='.repeat(60));

  if (successCount > 0) {
    console.log('\n✨ Products created successfully!');
    console.log('🔍 Check Prisma Studio at http://localhost:5555 to view the data');
  }
}

main().catch(console.error);
