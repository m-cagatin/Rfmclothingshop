import { prisma } from '../prisma';
import * as cloudinaryService from './cloudinary.service';
import type {
  customizable_products,
  customizable_product_images,
  customizable_products_gender,
  customizable_products_fit_type,
  customizable_products_print_method,
  customizable_products_differentiation_type,
  customizable_products_status,
} from '@prisma/client';

export interface ProductImageInput {
  url: string;
  publicId: string;
  type: 'front' | 'back' | 'additional';
  displayOrder: number;
}

export interface CreateProductInput {
  name: string;
  category: string;
  gender?: customizable_products_gender;
  fitType?: customizable_products_fit_type;
  description?: string;
  fabricComposition?: string;
  fabricWeight?: string;
  texture?: string;
  availableSizes?: string[];
  fitDescription?: string;
  sizePricing?: Record<string, number>;
  colorName?: string;
  colorHex?: string;
  variantName?: string;
  variantImageUrl?: string;
  variantImagePublicId?: string;
  printMethod?: customizable_products_print_method;
  printAreas?: string[];
  designRequirements?: string;
  baseCost?: number;
  retailPrice: number;
  turnaroundTime?: string;
  minimumOrderQty?: number;
  frontPrintCost?: number;
  backPrintCost?: number;
  sizeAvailability?: Record<string, boolean>;
  differentiationType?: customizable_products_differentiation_type;
  status?: customizable_products_status;
  images: ProductImageInput[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id: number;
}

/**
 * Get all customizable products with their images
 */
export async function getAllProducts() {
  const products = await prisma.customizable_products.findMany({
    include: {
      customizable_product_images: {
        orderBy: [
          { image_type: 'asc' },
          { display_order: 'asc' }
        ]
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  return products;
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: number) {
  const product = await prisma.customizable_products.findUnique({
    where: { id },
    include: {
      customizable_product_images: {
        orderBy: [
          { image_type: 'asc' },
          { display_order: 'asc' }
        ]
      }
    }
  });

  return product;
}

/**
 * Create a new customizable product with images
 */
export async function createProduct(data: CreateProductInput) {
  const { images, ...productData } = data;

  // Generate product code
  const productCode = await generateProductCode();

  const product = await prisma.customizable_products.create({
    data: {
      product_code: productCode,
      name: productData.name,
      category: productData.category,
      gender: productData.gender || 'Unisex',
      fit_type: productData.fitType || 'Classic',
      description: productData.description,
      fabric_composition: productData.fabricComposition,
      fabric_weight: productData.fabricWeight,
      texture: productData.texture,
      available_sizes: productData.availableSizes || [],
      fit_description: productData.fitDescription,
      size_pricing: productData.sizePricing || {},
      color_name: productData.colorName,
      color_hex: productData.colorHex,
      variant_name: productData.variantName,
      variant_image_url: productData.variantImageUrl,
      variant_image_public_id: productData.variantImagePublicId,
      print_method: productData.printMethod || 'DTG',
      print_areas: productData.printAreas || [],
      design_requirements: productData.designRequirements,
      base_cost: productData.baseCost || 0,
      retail_price: productData.retailPrice,
      turnaround_time: productData.turnaroundTime,
      minimum_order_qty: productData.minimumOrderQty || 1,
      front_print_cost: productData.frontPrintCost || 0,
      back_print_cost: productData.backPrintCost || 0,
      size_availability: productData.sizeAvailability || {},
      differentiation_type: productData.differentiationType || 'none',
      status: productData.status || 'active',
      customizable_product_images: {
        create: images.map(img => ({
          image_url: img.url,
          cloudinary_public_id: img.publicId,
          image_type: img.type,
          display_order: img.displayOrder
        }))
      }
    },
    include: {
      customizable_product_images: true
    }
  });

  return product;
}

/**
 * Update an existing product
 */
export async function updateProduct(data: UpdateProductInput) {
  const { id, images, ...productData } = data;

  // If images are provided, delete old ones from database and Cloudinary
  if (images) {
    // Get existing images to delete from Cloudinary
    const existingProduct = await prisma.customizable_products.findUnique({
      where: { id },
      include: { customizable_product_images: true }
    });

    if (existingProduct?.customizable_product_images) {
      // Delete images from Cloudinary
      const publicIds = existingProduct.customizable_product_images
        .filter(img => img.cloudinary_public_id)
        .map(img => img.cloudinary_public_id!);
      
      if (publicIds.length > 0) {
        try {
          await cloudinaryService.deleteMultipleImages(publicIds);
        } catch (error) {
          console.error('Failed to delete old images from Cloudinary:', error);
          // Continue anyway - database cleanup is more important
        }
      }
    }

    // Delete from database
    await prisma.customizable_product_images.deleteMany({
      where: { product_id: id }
    });
  }

  const product = await prisma.customizable_products.update({
    where: { id },
    data: {
      name: productData.name,
      category: productData.category,
      gender: productData.gender,
      fit_type: productData.fitType,
      description: productData.description,
      fabric_composition: productData.fabricComposition,
      fabric_weight: productData.fabricWeight,
      texture: productData.texture,
      available_sizes: productData.availableSizes,
      fit_description: productData.fitDescription,
      size_pricing: productData.sizePricing,
      color_name: productData.colorName,
      color_hex: productData.colorHex,
      variant_name: productData.variantName,
      variant_image_url: productData.variantImageUrl,
      variant_image_public_id: productData.variantImagePublicId,
      print_method: productData.printMethod,
      print_areas: productData.printAreas,
      design_requirements: productData.designRequirements,
      base_cost: productData.baseCost,
      retail_price: productData.retailPrice,
      turnaround_time: productData.turnaroundTime,
      minimum_order_qty: productData.minimumOrderQty,
      front_print_cost: productData.frontPrintCost,
      back_print_cost: productData.backPrintCost,
      size_availability: productData.sizeAvailability,
      differentiation_type: productData.differentiationType,
      status: productData.status,
      updated_at: new Date(),
      ...(images && {
        customizable_product_images: {
          create: images.map(img => ({
            image_url: img.url,
            cloudinary_public_id: img.publicId,
            image_type: img.type,
            display_order: img.displayOrder
          }))
        }
      })
    },
    include: {
      customizable_product_images: true
    }
  });

  return product;
}

/**
 * Delete a product and its images
 */
export async function deleteProduct(id: number) {
  // Get product with images before deleting
  const product = await prisma.customizable_products.findUnique({
    where: { id },
    include: { customizable_product_images: true }
  });

  if (product) {
    // Delete images from Cloudinary
    const publicIds = product.customizable_product_images
      .filter(img => img.cloudinary_public_id)
      .map(img => img.cloudinary_public_id!);
    
    // Also delete variant image if exists
    if (product.variant_image_public_id) {
      publicIds.push(product.variant_image_public_id);
    }
    
    if (publicIds.length > 0) {
      try {
        await cloudinaryService.deleteMultipleImages(publicIds);
      } catch (error) {
        console.error('Failed to delete images from Cloudinary:', error);
        // Continue anyway - database cleanup is more important
      }
    }
  }

  // Images will be deleted automatically due to CASCADE
  await prisma.customizable_products.delete({
    where: { id }
  });
}

/**
 * Update product status
 */
export async function updateProductStatus(
  id: number, 
  status: customizable_products_status
) {
  const product = await prisma.customizable_products.update({
    where: { id },
    data: { 
      status,
      updated_at: new Date()
    }
  });

  return product;
}

/**
 * Generate unique product code
 */
async function generateProductCode(): Promise<string> {
  const prefix = 'CP'; // Customizable Product
  let code: string;
  let exists = true;

  while (exists) {
    const random = Math.floor(100000 + Math.random() * 900000); // 6-digit number
    code = `${prefix}${random}`;
    
    const existing = await prisma.customizable_products.findUnique({
      where: { product_code: code }
    });
    
    exists = !!existing;
  }

  return code!;
}
