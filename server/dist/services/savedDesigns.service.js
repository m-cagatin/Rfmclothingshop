"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedDesignsService = void 0;
const prisma_1 = require("../prisma");
class SavedDesignsService {
    /**
     * Save design to permanent library
     * Creates new row each time (no upsert)
     */
    static async saveToLibrary(data) {
        const { userId, customizableProductId, designName, description, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson, frontThumbnailUrl, backThumbnailUrl, tags, 
        // Product info
        productCode, productName, category, variantName, colorName, colorHex, material, fitType, gender, frontMockupUrl, backMockupUrl, printMethod, 
        // Design metadata
        hasFrontDesign, hasBackDesign, frontObjectsCount, backObjectsCount, hasUploadedImages, hasText, 
        // Pricing
        basePrice, printCost, totalPrice } = data;
        // Create new saved design (always creates new row)
        const design = await prisma_1.prisma.user_saved_designs.create({
            data: {
                user_id: userId,
                customizable_product_id: customizableProductId,
                design_name: designName,
                description: description,
                selected_size: selectedSize,
                selected_print_option: selectedPrintOption,
                print_area_preset: printAreaPreset || 'Letter',
                front_canvas_json: frontCanvasJson,
                back_canvas_json: backCanvasJson,
                front_thumbnail_url: frontThumbnailUrl,
                back_thumbnail_url: backThumbnailUrl,
                // Product info
                product_code: productCode,
                product_name: productName,
                category: category,
                variant_name: variantName,
                color_name: colorName,
                color_hex: colorHex,
                material: material,
                fit_type: fitType,
                gender: gender,
                front_mockup_url: frontMockupUrl,
                back_mockup_url: backMockupUrl,
                print_method: printMethod,
                // Design metadata
                has_front_design: hasFrontDesign ?? false,
                has_back_design: hasBackDesign ?? false,
                front_objects_count: frontObjectsCount ?? 0,
                back_objects_count: backObjectsCount ?? 0,
                has_uploaded_images: hasUploadedImages ?? false,
                has_text: hasText ?? false,
                // Pricing
                base_price: basePrice,
                print_cost: printCost,
                total_price: totalPrice,
                is_template: false,
                is_favorite: false,
                times_used: 0,
                tags: tags || null,
                created_at: new Date(),
                updated_at: new Date()
            }
        });
        return {
            id: design.id,
            userId: design.user_id,
            customizableProductId: design.customizable_product_id,
            designName: design.design_name,
            selectedSize: design.selected_size,
            selectedPrintOption: design.selected_print_option,
            printAreaPreset: design.print_area_preset,
            frontCanvasJson: design.front_canvas_json,
            backCanvasJson: design.back_canvas_json,
            frontThumbnailUrl: design.front_thumbnail_url,
            backThumbnailUrl: design.back_thumbnail_url,
            isTemplate: design.is_template,
            tags: design.tags,
            createdAt: design.created_at,
            updatedAt: design.updated_at
        };
    }
    /**
     * Get all saved designs for a user with product information
     * Only returns user_saved_designs, NOT user_current_design
     */
    static async getAllSavedDesigns(userId) {
        const designs = await prisma_1.prisma.user_saved_designs.findMany({
            where: {
                user_id: userId
            },
            include: {
                customizable_products: {
                    select: {
                        id: true,
                        name: true,
                        category: true,
                        gender: true,
                        fit_type: true,
                        product_code: true,
                        retail_price: true,
                        front_print_cost: true,
                        back_print_cost: true,
                        color_name: true,
                        color_hex: true,
                        variant_name: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });
        return designs.map(design => ({
            id: design.id,
            userId: design.user_id,
            customizableProductId: design.customizable_product_id,
            designName: design.design_name,
            selectedSize: design.selected_size,
            selectedPrintOption: design.selected_print_option,
            printAreaPreset: design.print_area_preset,
            frontCanvasJson: design.front_canvas_json,
            backCanvasJson: design.back_canvas_json,
            frontThumbnailUrl: design.front_thumbnail_url,
            backThumbnailUrl: design.back_thumbnail_url,
            isTemplate: design.is_template,
            tags: design.tags,
            createdAt: design.created_at,
            updatedAt: design.updated_at,
            product: design.customizable_products
        }));
    }
    /**
     * Delete saved design by ID
     */
    static async deleteSavedDesign(designId, userId) {
        try {
            // Verify ownership before deleting
            const design = await prisma_1.prisma.user_saved_designs.findFirst({
                where: {
                    id: designId,
                    user_id: userId
                }
            });
            if (!design) {
                return false;
            }
            await prisma_1.prisma.user_saved_designs.delete({
                where: {
                    id: designId
                }
            });
            return true;
        }
        catch (error) {
            console.error('Delete saved design error:', error);
            return false;
        }
    }
    /**
     * Get single saved design by ID
     */
    static async getSavedDesignById(designId, userId) {
        const design = await prisma_1.prisma.user_saved_designs.findFirst({
            where: {
                id: designId,
                user_id: userId
            }
        });
        if (!design) {
            return null;
        }
        return {
            id: design.id,
            userId: design.user_id,
            customizableProductId: design.customizable_product_id,
            designName: design.design_name,
            selectedSize: design.selected_size,
            selectedPrintOption: design.selected_print_option,
            printAreaPreset: design.print_area_preset,
            frontCanvasJson: design.front_canvas_json,
            backCanvasJson: design.back_canvas_json,
            frontThumbnailUrl: design.front_thumbnail_url,
            backThumbnailUrl: design.back_thumbnail_url,
            isTemplate: design.is_template,
            tags: design.tags,
            createdAt: design.created_at,
            updatedAt: design.updated_at
        };
    }
    /**
     * Search and filter saved designs
     */
    static async searchDesigns(userId, filters) {
        const where = { user_id: userId };
        if (filters.category)
            where.category = filters.category;
        if (filters.size)
            where.selected_size = filters.size;
        if (filters.onlyFavorites)
            where.is_favorite = true;
        let designs;
        // Use fulltext search if search term provided
        if (filters.search && filters.search.trim()) {
            designs = await prisma_1.prisma.$queryRawUnsafe(`
        SELECT * FROM user_saved_designs
        WHERE user_id = ?
        ${filters.category ? 'AND category = ?' : ''}
        ${filters.size ? 'AND selected_size = ?' : ''}
        ${filters.onlyFavorites ? 'AND is_favorite = 1' : ''}
        AND MATCH(design_name, description) AGAINST(? IN NATURAL LANGUAGE MODE)
        ORDER BY created_at DESC
      `, userId, ...(filters.category ? [filters.category] : []), ...(filters.size ? [filters.size] : []), filters.search);
        }
        else {
            designs = await prisma_1.prisma.user_saved_designs.findMany({
                where,
                orderBy: { created_at: 'desc' }
            });
        }
        return designs;
    }
    /**
     * Toggle favorite status
     */
    static async toggleFavorite(designId, userId) {
        const design = await prisma_1.prisma.user_saved_designs.findFirst({
            where: { id: designId, user_id: userId }
        });
        if (!design) {
            throw new Error('Design not found');
        }
        return await prisma_1.prisma.user_saved_designs.update({
            where: { id: designId },
            data: { is_favorite: !design.is_favorite }
        });
    }
}
exports.SavedDesignsService = SavedDesignsService;
