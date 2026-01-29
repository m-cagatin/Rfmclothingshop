import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalogProducts = [
  // UNISEX (5 products)
  {
    product_name: 'Classic White Cotton Tee',
    category: 'T-Shirt - Round Neck',
    gender: 'Unisex',
    base_price: 299,
    description: 'Premium cotton t-shirt for everyday wear',
    status: 'Active',
    stock_quantity: 100,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    material: '100% Cotton',
  },
  {
    product_name: 'Black V-Neck Premium Tee',
    category: 'T-Shirt - V-Neck',
    gender: 'Unisex',
    base_price: 329,
    description: 'Stylish v-neck t-shirt',
    status: 'Active',
    stock_quantity: 100,
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    material: '100% Cotton',
  },
  {
    product_name: 'Sport Joggers Gray',
    category: 'Jogging Pants',
    gender: 'Unisex',
    base_price: 599,
    description: 'Comfortable joggers for sports',
    status: 'Active',
    stock_quantity: 80,
    sizes: ['S', 'M', 'L', 'XL'],
    material: '80% Cotton, 20% Polyester',
  },
  {
    product_name: 'Athletic Shorts Navy',
    category: 'Shorts',
    gender: 'Unisex',
    base_price: 399,
    description: 'Breathable athletic shorts',
    status: 'Active',
    stock_quantity: 90,
    sizes: ['S', 'M', 'L', 'XL'],
    material: '100% Polyester',
  },
  {
    product_name: 'Classic Varsity Navy/White',
    category: 'Varsity Jacket',
    gender: 'Unisex',
    base_price: 1499,
    description: 'Premium varsity jacket',
    status: 'Active',
    stock_quantity: 30,
    sizes: ['M', 'L', 'XL', '2XL'],
    material: '70% Wool, 30% Leather',
  },
  // MEN (5 products)
  {
    product_name: 'Premium Polo Navy',
    category: 'Polo Shirt',
    gender: 'Men',
    base_price: 499,
    description: 'Elegant polo for men',
    status: 'Active',
    stock_quantity: 75,
    sizes: ['M', 'L', 'XL', '2XL'],
    material: '65% Cotton, 35% Polyester',
  },
  {
    product_name: 'Chinese Collar Black',
    category: 'T-Shirt - Chinese Collar',
    gender: 'Men',
    base_price: 399,
    description: 'Modern chinese collar tee',
    status: 'Active',
    stock_quantity: 60,
    sizes: ['M', 'L', 'XL', '2XL'],
    material: '100% Cotton',
  },
  {
    product_name: 'Basketball Jersey Red',
    category: 'Sando (Jersey) - V-Neck',
    gender: 'Men',
    base_price: 399,
    description: 'Breathable basketball jersey',
    status: 'Active',
    stock_quantity: 85,
    sizes: ['M', 'L', 'XL'],
    material: '100% Polyester',
  },
  {
    product_name: 'Training Warmers Black',
    category: 'Warmers',
    gender: 'Men',
    base_price: 699,
    description: 'Thermal warmers for training',
    status: 'Active',
    stock_quantity: 50,
    sizes: ['M', 'L', 'XL', '2XL'],
    material: '90% Polyester, 10% Spandex',
  },
  {
    product_name: 'NBA Style Jersey Blue',
    category: 'Sando (Jersey) - NBA Cut',
    gender: 'Men',
    base_price: 429,
    description: 'Pro-style NBA cut jersey',
    status: 'Active',
    stock_quantity: 70,
    sizes: ['M', 'L', 'XL'],
    material: '100% Polyester',
  },
  // WOMEN (5 products)
  {
    product_name: 'Ladies Pink Cotton Tee',
    category: 'T-Shirt - Round Neck',
    gender: 'Women',
    base_price: 299,
    description: 'Soft cotton tee for women',
    status: 'Active',
    stock_quantity: 95,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: '100% Cotton',
  },
  {
    product_name: 'Ladies V-Neck Purple',
    category: 'T-Shirt - V-Neck',
    gender: 'Women',
    base_price: 329,
    description: 'Stylish v-neck for women',
    status: 'Active',
    stock_quantity: 90,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: '100% Cotton',
  },
  {
    product_name: 'Ladies Polo White',
    category: 'Polo Shirt',
    gender: 'Women',
    base_price: 499,
    description: 'Elegant polo for women',
    status: 'Active',
    stock_quantity: 80,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    material: '65% Cotton, 35% Polyester',
  },
  {
    product_name: 'Ladies Joggers Black',
    category: 'Jogging Pants',
    gender: 'Women',
    base_price: 599,
    description: 'Comfortable joggers',
    status: 'Active',
    stock_quantity: 75,
    sizes: ['XS', 'S', 'M', 'L'],
    material: '80% Cotton, 20% Polyester',
  },
  {
    product_name: 'Athletic Shorts Pink',
    category: 'Shorts',
    gender: 'Women',
    base_price: 399,
    description: 'Breathable athletic shorts',
    status: 'Active',
    stock_quantity: 85,
    sizes: ['XS', 'S', 'M', 'L'],
    material: '100% Polyester',
  },
  // KIDS (5 products)
  {
    product_name: 'Kids Yellow Cotton Tee',
    category: 'T-Shirt - Round Neck',
    gender: 'Kids',
    base_price: 259,
    description: 'Fun cotton tee for kids',
    status: 'Active',
    stock_quantity: 100,
    sizes: ['XS', 'S', 'M', 'L'],
    material: '100% Cotton',
  },
  {
    product_name: 'Kids Blue Shorts',
    category: 'Shorts',
    gender: 'Kids',
    base_price: 299,
    description: 'Comfy shorts for kids',
    status: 'Active',
    stock_quantity: 90,
    sizes: ['XS', 'S', 'M', 'L'],
    material: '100% Cotton',
  },
  {
    product_name: 'Kids Jersey Green',
    category: 'Sando (Jersey) - Round Neck',
    gender: 'Kids',
    base_price: 329,
    description: 'Sports jersey for kids',
    status: 'Active',
    stock_quantity: 80,
    sizes: ['XS', 'S', 'M'],
    material: '100% Polyester',
  },
  {
    product_name: 'Kids Joggers Gray',
    category: 'Jogging Pants',
    gender: 'Kids',
    base_price: 499,
    description: 'Comfy joggers for kids',
    status: 'Inactive',
    stock_quantity: 65,
    sizes: ['XS', 'S', 'M', 'L'],
    material: '80% Cotton, 20% Polyester',
  },
  {
    product_name: 'Kids Polo Red',
    category: 'Polo Shirt',
    gender: 'Kids',
    base_price: 429,
    description: 'Smart polo for kids',
    status: 'Inactive',
    stock_quantity: 70,
    sizes: ['XS', 'S', 'M', 'L'],
    material: '65% Cotton, 35% Polyester',
  },
];

async function seedCatalogProducts() {
  console.log('🌱 Seeding catalog products...');

  try {
    // Delete cart items and order items that reference catalog products first
    console.log('🗑️  Deleting related cart and order items...');
    await prisma.cart_items.deleteMany({});
    await prisma.order_items.deleteMany({});
    
    // Now delete product images
    console.log('🗑️  Deleting product images...');
    await prisma.product_images.deleteMany({});
    
    // Finally delete catalog products
    console.log('🗑️  Deleting catalog products...');
    await prisma.catalog_clothing.deleteMany({});
    console.log('✅ Cleared existing catalog products and related data');

    // Insert new products
    console.log('📦 Inserting 20 new products...');
    for (const product of catalogProducts) {
      await prisma.catalog_clothing.create({
        data: product as any,
      });
    }

    console.log(`✅ Successfully seeded ${catalogProducts.length} catalog products!`);
  } catch (error) {
    console.error('❌ Error seeding catalog products:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCatalogProducts();
