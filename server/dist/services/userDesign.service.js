"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDesignService = void 0;
const prisma_1 = require("../prisma");
class UserDesignService {
    /**
     * Save or update user's current design for a specific product
     */
    static async saveDesign(data) {
        const { userId, customizableProductId, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson, frontThumbnailUrl, backThumbnailUrl } = data;
        // Use upsert to either create new or update existing design
        const design = await prisma_1.prisma.user_current_design.upsert({
            where: {
                user_id_customizable_product_id: {
                    user_id: userId,
                    customizable_product_id: customizableProductId
                }
            },
            update: {
                selected_size: selectedSize,
                selected_print_option: selectedPrintOption,
                print_area_preset: printAreaPreset || 'Letter',
                front_canvas_json: frontCanvasJson,
                back_canvas_json: backCanvasJson,
                front_thumbnail_url: frontThumbnailUrl,
                back_thumbnail_url: backThumbnailUrl,
                last_saved_at: new Date(),
                updated_at: new Date()
            },
            create: {
                user_id: userId,
                customizable_product_id: customizableProductId,
                selected_size: selectedSize,
                selected_print_option: selectedPrintOption,
                print_area_preset: printAreaPreset || 'Letter',
                front_canvas_json: frontCanvasJson,
                back_canvas_json: backCanvasJson,
                front_thumbnail_url: frontThumbnailUrl,
                back_thumbnail_url: backThumbnailUrl,
                last_saved_at: new Date(),
                created_at: new Date(),
                updated_at: new Date()
            }
        });
        return {
            id: design.id,
            userId: design.user_id,
            customizableProductId: design.customizable_product_id,
            selectedSize: design.selected_size,
            selectedPrintOption: design.selected_print_option,
            printAreaPreset: design.print_area_preset,
            frontCanvasJson: design.front_canvas_json,
            backCanvasJson: design.back_canvas_json,
            lastSavedAt: design.last_saved_at,
            createdAt: design.created_at,
            updatedAt: design.updated_at
        };
    }
    /**
     * Load user's current design for a specific product
     */
    static async loadDesign(userId, productId) {
        const design = await prisma_1.prisma.user_current_design.findUnique({
            where: {
                user_id_customizable_product_id: {
                    user_id: userId,
                    customizable_product_id: productId
                }
            }
        });
        if (!design) {
            return null;
        }
        return {
            id: design.id,
            userId: design.user_id,
            customizableProductId: design.customizable_product_id,
            selectedSize: design.selected_size,
            selectedPrintOption: design.selected_print_option,
            printAreaPreset: design.print_area_preset,
            frontCanvasJson: design.front_canvas_json,
            backCanvasJson: design.back_canvas_json,
            lastSavedAt: design.last_saved_at,
            createdAt: design.created_at,
            updatedAt: design.updated_at
        };
    }
    /**
     * Delete user's current design for a specific product
     */
    static async deleteDesign(userId, productId) {
        try {
            await prisma_1.prisma.user_current_design.delete({
                where: {
                    user_id_customizable_product_id: {
                        user_id: userId,
                        customizable_product_id: productId
                    }
                }
            });
            return true;
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get the most recently edited design for a user
     */
    static async getLastUsedDesign(userId) {
        const design = await prisma_1.prisma.user_current_design.findFirst({
            where: {
                user_id: userId
            },
            orderBy: {
                last_saved_at: 'desc'
            }
        });
        if (!design) {
            return null;
        }
        return {
            id: design.id,
            userId: design.user_id,
            customizableProductId: design.customizable_product_id,
            selectedSize: design.selected_size,
            selectedPrintOption: design.selected_print_option,
            printAreaPreset: design.print_area_preset,
            frontCanvasJson: design.front_canvas_json,
            backCanvasJson: design.back_canvas_json,
            lastSavedAt: design.last_saved_at,
            createdAt: design.created_at,
            updatedAt: design.updated_at
        };
    }
    /**
     * Get all saved designs for a user with product information
     */
    static async getAllUserDesigns(userId) {
        const designs = await prisma_1.prisma.user_current_design.findMany({
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
                        color_hex: true
                    }
                }
            },
            orderBy: {
                last_saved_at: 'desc'
            }
        });
        return designs.map(design => ({
            id: design.id,
            userId: design.user_id,
            customizableProductId: design.customizable_product_id,
            selectedSize: design.selected_size,
            selectedPrintOption: design.selected_print_option,
            printAreaPreset: design.print_area_preset,
            frontCanvasJson: design.front_canvas_json,
            backCanvasJson: design.back_canvas_json,
            frontThumbnailUrl: design.front_thumbnail_url,
            backThumbnailUrl: design.back_thumbnail_url,
            lastSavedAt: design.last_saved_at,
            createdAt: design.created_at,
            updatedAt: design.updated_at,
            product: design.customizable_products
        }));
    }
}
exports.UserDesignService = UserDesignService;
