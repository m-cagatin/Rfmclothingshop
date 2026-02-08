"use strict";
/**
 * Design Service
 * Handles saving and loading of current designs (draft state)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveCurrentDesign = saveCurrentDesign;
exports.getLastUsedDesign = getLastUsedDesign;
exports.getCurrentDesignForProduct = getCurrentDesignForProduct;
exports.deleteCurrentDesign = deleteCurrentDesign;
exports.getAllCurrentDesigns = getAllCurrentDesigns;
const prisma_1 = require("../prisma");
/**
 * Transform database snake_case to camelCase for frontend
 */
function transformDesignToFrontend(dbDesign) {
    return {
        id: dbDesign.id,
        userId: dbDesign.user_id,
        customizableProductId: dbDesign.customizable_product_id,
        selectedSize: dbDesign.selected_size,
        selectedPrintOption: dbDesign.selected_print_option,
        printAreaPreset: dbDesign.print_area_preset,
        frontCanvasJson: dbDesign.front_canvas_json,
        backCanvasJson: dbDesign.back_canvas_json,
        frontThumbnailUrl: dbDesign.front_thumbnail_url,
        backThumbnailUrl: dbDesign.back_thumbnail_url,
        lastSavedAt: dbDesign.last_saved_at,
        createdAt: dbDesign.created_at,
        updatedAt: dbDesign.updated_at,
    };
}
/**
 * Save or update current design (upsert)
 * Uses unique constraint on (user_id, customizable_product_id)
 */
async function saveCurrentDesign(data) {
    const { userId, customizableProductId, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson, frontThumbnailUrl, backThumbnailUrl, } = data;
    const design = await prisma_1.prisma.user_current_design.upsert({
        where: {
            user_id_customizable_product_id: {
                user_id: userId,
                customizable_product_id: customizableProductId,
            },
        },
        update: {
            selected_size: selectedSize,
            selected_print_option: selectedPrintOption,
            print_area_preset: printAreaPreset,
            front_canvas_json: frontCanvasJson,
            back_canvas_json: backCanvasJson,
            front_thumbnail_url: frontThumbnailUrl,
            back_thumbnail_url: backThumbnailUrl,
            last_saved_at: new Date(),
            updated_at: new Date(),
        },
        create: {
            user_id: userId,
            customizable_product_id: customizableProductId,
            selected_size: selectedSize,
            selected_print_option: selectedPrintOption,
            print_area_preset: printAreaPreset,
            front_canvas_json: frontCanvasJson,
            back_canvas_json: backCanvasJson,
            front_thumbnail_url: frontThumbnailUrl,
            back_thumbnail_url: backThumbnailUrl,
            last_saved_at: new Date(),
        },
    });
    return transformDesignToFrontend(design);
}
/**
 * Get last used design for a user (most recently saved)
 */
async function getLastUsedDesign(userId) {
    const design = await prisma_1.prisma.user_current_design.findFirst({
        where: {
            user_id: userId,
        },
        orderBy: {
            last_saved_at: 'desc',
        },
    });
    if (!design)
        return null;
    return transformDesignToFrontend(design);
}
/**
 * Get current design for specific product
 */
async function getCurrentDesignForProduct(userId, productId) {
    const design = await prisma_1.prisma.user_current_design.findUnique({
        where: {
            user_id_customizable_product_id: {
                user_id: userId,
                customizable_product_id: productId,
            },
        },
    });
    if (!design)
        return null;
    return transformDesignToFrontend(design);
}
/**
 * Delete current design
 */
async function deleteCurrentDesign(userId, productId) {
    await prisma_1.prisma.user_current_design.delete({
        where: {
            user_id_customizable_product_id: {
                user_id: userId,
                customizable_product_id: productId,
            },
        },
    });
}
/**
 * Get all current designs for a user
 */
async function getAllCurrentDesigns(userId) {
    const designs = await prisma_1.prisma.user_current_design.findMany({
        where: {
            user_id: userId,
        },
        orderBy: {
            last_saved_at: 'desc',
        },
    });
    return designs.map(transformDesignToFrontend);
}
