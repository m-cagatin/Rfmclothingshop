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
        const { userId, customizableProductId, designName, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson, frontThumbnailUrl, backThumbnailUrl, tags } = data;
        // Create new saved design (always creates new row)
        const design = await prisma_1.prisma.user_saved_designs.create({
            data: {
                user_id: userId,
                customizable_product_id: customizableProductId,
                design_name: designName,
                selected_size: selectedSize,
                selected_print_option: selectedPrintOption,
                print_area_preset: printAreaPreset || 'Letter',
                front_canvas_json: frontCanvasJson,
                back_canvas_json: backCanvasJson,
                front_thumbnail_url: frontThumbnailUrl,
                back_thumbnail_url: backThumbnailUrl,
                is_template: false,
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
}
exports.SavedDesignsService = SavedDesignsService;
