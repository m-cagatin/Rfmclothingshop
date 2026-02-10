"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.updateProductStatus = updateProductStatus;
exports.deleteProduct = deleteProduct;
const prisma_1 = require("../prisma");
async function getAllProducts() {
    return await prisma_1.prisma.catalog_clothing.findMany({
        include: {
            product_images: {
                orderBy: {
                    display_order: 'asc'
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });
}
async function getProductById(id) {
    return await prisma_1.prisma.catalog_clothing.findUnique({
        where: { product_id: id },
        include: {
            product_images: {
                orderBy: {
                    display_order: 'asc'
                }
            }
        }
    });
}
async function createProduct(data) {
    const { images, name, type, baseCost, retailPrice, ...rest } = data;
    // Map frontend fields to database fields
    const mappedData = {
        product_name: name,
        gender: type,
        base_price: baseCost,
        ...rest
    };
    const product = await prisma_1.prisma.catalog_clothing.create({
        data: {
            ...mappedData,
            product_images: images ? {
                create: images.map((img, index) => ({
                    image_url: img.url,
                    cloudinary_public_id: img.publicId,
                    display_order: img.displayOrder || index + 1
                }))
            } : undefined
        },
        include: {
            product_images: {
                orderBy: {
                    display_order: 'asc'
                }
            }
        }
    });
    return product;
}
async function updateProduct(id, data) {
    const { images, ...productData } = data;
    console.log('=== UPDATE PRODUCT ===');
    console.log('Product ID:', id);
    console.log('Received images:', images);
    console.log('Product data:', productData);
    // Explicitly map frontend fields to database fields
    const mappedData = {};
    if (productData.name)
        mappedData.product_name = productData.name;
    if (productData.type)
        mappedData.gender = productData.type;
    if (productData.baseCost !== undefined)
        mappedData.base_price = productData.baseCost;
    if (productData.category)
        mappedData.category = productData.category;
    if (productData.description)
        mappedData.description = productData.description;
    if (productData.fabricComposition)
        mappedData.material = productData.fabricComposition;
    if (productData.sizes)
        mappedData.sizes = productData.sizes;
    if (productData.stock_quantity !== undefined)
        mappedData.stock_quantity = productData.stock_quantity;
    // Map status: frontend uses lowercase, database uses capitalized enum
    if (productData.status) {
        const statusMap = {
            'active': 'Active',
            'inactive': 'Inactive',
            'archived': 'Archived'
        };
        mappedData.status = statusMap[productData.status.toLowerCase()] || 'Active';
    }
    console.log('Mapped data for database:', mappedData);
    // Delete existing images if new images provided
    if (images && images.length > 0) {
        console.log(`Deleting ${await prisma_1.prisma.product_images.count({ where: { product_id: id } })} existing images`);
        await prisma_1.prisma.product_images.deleteMany({
            where: {
                product_id: id
            }
        });
        console.log('Existing images deleted');
    }
    console.log('Creating product with images:', images?.length || 0);
    const product = await prisma_1.prisma.catalog_clothing.update({
        where: { product_id: id },
        data: {
            ...mappedData,
            product_images: images && images.length > 0 ? {
                create: images.map((img, index) => {
                    const imageData = {
                        image_url: img.url,
                        cloudinary_public_id: img.publicId,
                        display_order: img.displayOrder || index + 1
                    };
                    console.log(`Creating image ${index + 1}:`, imageData);
                    return imageData;
                })
            } : undefined
        },
        include: {
            product_images: {
                orderBy: {
                    display_order: 'asc'
                }
            }
        }
    });
    console.log('Product updated successfully with', product.product_images.length, 'images');
    console.log('===');
    return product;
}
async function updateProductStatus(id, status) {
    return await prisma_1.prisma.catalog_clothing.update({
        where: { product_id: id },
        data: { status: status },
        include: {
            product_images: {
                orderBy: {
                    display_order: 'asc'
                }
            }
        }
    });
}
async function deleteProduct(id) {
    // Delete related images first
    await prisma_1.prisma.product_images.deleteMany({
        where: {
            product_id: id
        }
    });
    return await prisma_1.prisma.catalog_clothing.delete({
        where: { product_id: id }
    });
}
