export interface SingleColor {
  name: string;
  hexCode?: string;
}

export interface VariantSample {
  name: string;
  image: string;
}

export interface CustomizableProduct {
  id: string;
  
  // 1. Basic Info
  category: string;
  name: string;
  type: string;
  sizes: string[];
  fitType: string;
  fitDescription: string;
  description: string;
  
  // 2. Images
  frontImage: string;
  backImage: string;
  additionalImages: string[];
  
  // 3. Material & Fabric
  fabricComposition: string;
  fabricWeight: string;
  texture: string;
  
  // 4. Pricing
  baseCost: number;
  retailPrice: number;
  /** Optional extra charges per size, e.g., { XL: 50 } */
  sizePricing?: Record<string, number>;
  /** Front print cost in pesos */
  frontPrintCost?: number;
  /** Back print cost in pesos */
  backPrintCost?: number;
  
  // 5. Colors & Variants
  /** Differentiation type: none, color, or variant */
  differentiationType?: 'none' | 'color' | 'variant';
  /** Single color name/hex */
  color?: SingleColor;
  /** Optional single variant sample (image + name) */
  variant?: VariantSample;
  /** Size availability status, e.g., { "M": true, "XL": false } */
  sizeAvailability?: Record<string, boolean>;
  
  // 6. Print & Customization
  printMethod: string;
  printAreas: string[];
  designRequirements: string;
  
  // 7. Business Details
  turnaroundTime: string;
  minOrderQuantity: number;
  
  // Meta
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type ProductStatus = 'active' | 'inactive' | 'archived' | 'all';
