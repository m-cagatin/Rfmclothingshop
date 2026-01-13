"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.updateProductStatus = updateProductStatus;
const prisma_1 = require("../prisma");
const cloudinaryService = __importStar(require("./cloudinary.service"));
/**
 * Transform database product to frontend format
 */
function transformProductToFrontend(dbProduct) {
    // Helper to convert underscore to space for enums
    const formatEnumValue = (value) => {
        if (!value)
            return '';
        return value.replace(/_/g, ' ');
    };
    return {
        id: dbProduct.id.toString(),
        category: dbProduct.category,
        name: dbProduct.name,
        type: dbProduct.gender || 'Unisex',
        sizes: Array.isArray(dbProduct.available_sizes) ? dbProduct.available_sizes : [],
        fitType: formatEnumValue(dbProduct.fit_type) || 'Classic',
        fitDescription: dbProduct.fit_description || '',
        description: dbProduct.description || '',
        // Transform images array
        images: (dbProduct.customizable_product_images || []).map((img) => ({
            id: img.image_id,
            url: img.image_url,
            publicId: img.cloudinary_public_id || '',
            type: img.image_type,
            displayOrder: img.display_order
        })),
        fabricComposition: dbProduct.fabric_composition || '',
        fabricWeight: dbProduct.fabric_weight || '',
        texture: dbProduct.texture || '',
        baseCost: Number(dbProduct.base_cost) || 0,
        retailPrice: Number(dbProduct.retail_price) || 0,
        sizePricing: typeof dbProduct.size_pricing === 'object' ? dbProduct.size_pricing : {},
        frontPrintCost: Number(dbProduct.front_print_cost) || 0,
        backPrintCost: Number(dbProduct.back_print_cost) || 0,
        differentiationType: dbProduct.differentiation_type || 'none',
        color: dbProduct.color_name ? {
            name: dbProduct.color_name,
            hexCode: dbProduct.color_hex
        } : undefined,
        variant: dbProduct.variant_name ? {
            name: dbProduct.variant_name,
            image: dbProduct.variant_image_url || '',
            publicId: dbProduct.variant_image_public_id
        } : undefined,
        sizeAvailability: typeof dbProduct.size_availability === 'object' ? dbProduct.size_availability : {},
        printMethod: formatEnumValue(dbProduct.print_method) || 'DTG',
        printAreas: Array.isArray(dbProduct.print_areas) ? dbProduct.print_areas : [],
        designRequirements: dbProduct.design_requirements || '',
        turnaroundTime: dbProduct.turnaround_time || '',
        minOrderQuantity: dbProduct.minimum_order_qty || 1,
        status: dbProduct.status || 'active',
        createdAt: dbProduct.created_at?.toISOString() || new Date().toISOString(),
        updatedAt: dbProduct.updated_at?.toISOString() || new Date().toISOString(),
    };
}
/**
 * Get all customizable products with their images
 */
async function getAllProducts() {
    const products = await prisma_1.prisma.customizable_products.findMany({
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
    return products.map(transformProductToFrontend);
}
/**
 * Get a single product by ID
 */
async function getProductById(id) {
    const product = await prisma_1.prisma.customizable_products.findUnique({
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
    return product ? transformProductToFrontend(product) : null;
}
/**
 * Create a new customizable product with images
 */
async function createProduct(data) {
    const { images, ...productData } = data;
    // Generate product code
    const productCode = await generateProductCode();
    const product = await prisma_1.prisma.customizable_products.create({
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
    return transformProductToFrontend(product);
}
/**
 * Update an existing product
 */
async function updateProduct(data) {
    const { id, images, ...productData } = data;
    // If images are provided, delete old ones from database and Cloudinary
    if (images) {
        // Get existing images to delete from Cloudinary
        const existingProduct = await prisma_1.prisma.customizable_products.findUnique({
            where: { id },
            include: { customizable_product_images: true }
        });
        if (existingProduct?.customizable_product_images) {
            // Delete images from Cloudinary
            const publicIds = existingProduct.customizable_product_images
                .filter(img => img.cloudinary_public_id)
                .map(img => img.cloudinary_public_id);
            if (publicIds.length > 0) {
                try {
                    await cloudinaryService.deleteMultipleImages(publicIds);
                }
                catch (error) {
                    console.error('Failed to delete old images from Cloudinary:', error);
                    // Continue anyway - database cleanup is more important
                }
            }
        }
        // Delete from database
        await prisma_1.prisma.customizable_product_images.deleteMany({
            where: { product_id: id }
        });
    }
    const product = await prisma_1.prisma.customizable_products.update({
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
    return transformProductToFrontend(product);
}
/**
 * Delete a product and its images
 */
async function deleteProduct(id) {
    // Get product with images before deleting
    const product = await prisma_1.prisma.customizable_products.findUnique({
        where: { id },
        include: { customizable_product_images: true }
    });
    if (product) {
        // Delete images from Cloudinary
        const publicIds = product.customizable_product_images
            .filter(img => img.cloudinary_public_id)
            .map(img => img.cloudinary_public_id);
        // Also delete variant image if exists
        if (product.variant_image_public_id) {
            publicIds.push(product.variant_image_public_id);
        }
        if (publicIds.length > 0) {
            try {
                await cloudinaryService.deleteMultipleImages(publicIds);
            }
            catch (error) {
                console.error('Failed to delete images from Cloudinary:', error);
                // Continue anyway - database cleanup is more important
            }
        }
    }
    // Images will be deleted automatically due to CASCADE
    await prisma_1.prisma.customizable_products.delete({
        where: { id }
    });
}
/**
 * Update product status
 */
async function updateProductStatus(id, status) {
    const product = await prisma_1.prisma.customizable_products.update({
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
async function generateProductCode() {
    const prefix = 'CP'; // Customizable Product
    let code;
    let exists = true;
    while (exists) {
        const random = Math.floor(100000 + Math.random() * 900000); // 6-digit number
        code = `${prefix}${random}`;
        const existing = await prisma_1.prisma.customizable_products.findUnique({
            where: { product_code: code }
        });
        exists = !!existing;
    }
    return code;
}
