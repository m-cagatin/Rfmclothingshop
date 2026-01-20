import { prisma } from '../prisma';

export interface SaveDesignData {
  userId: string;
  customizableProductId: number;
  selectedSize: string;
  selectedPrintOption: 'none' | 'front' | 'back';
  printAreaPreset?: string;
  frontCanvasJson: string | null;
  backCanvasJson: string | null;
}

export interface LoadDesignData {
  id: number;
  userId: string;
  customizableProductId: number;
  selectedSize: string;
  selectedPrintOption: string;
  printAreaPreset: string;
  frontCanvasJson: string | null;
  backCanvasJson: string | null;
  lastSavedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class UserDesignService {
  /**
   * Save or update user's current design for a specific product
   */
  static async saveDesign(data: SaveDesignData): Promise<LoadDesignData> {
    const { userId, customizableProductId, selectedSize, selectedPrintOption, printAreaPreset, frontCanvasJson, backCanvasJson } = data;

    // Use upsert to either create new or update existing design
    const design = await prisma.user_current_design.upsert({
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
  static async loadDesign(userId: string, productId: number): Promise<LoadDesignData | null> {
    const design = await prisma.user_current_design.findUnique({
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
  static async deleteDesign(userId: string, productId: number): Promise<boolean> {
    try {
      await prisma.user_current_design.delete({
        where: {
          user_id_customizable_product_id: {
            user_id: userId,
            customizable_product_id: productId
          }
        }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all saved designs for a user
   */
  static async getAllUserDesigns(userId: string): Promise<LoadDesignData[]> {
    const designs = await prisma.user_current_design.findMany({
      where: {
        user_id: userId
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
      lastSavedAt: design.last_saved_at,
      createdAt: design.created_at,
      updatedAt: design.updated_at
    }));
  }
}
