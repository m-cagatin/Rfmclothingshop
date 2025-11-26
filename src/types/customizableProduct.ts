export interface ColorVariant {
  id: string;
  name: string;
  hexCode?: string;
  variantImage?: string;
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
  
  // 5. Colors & Variants
  colors: ColorVariant[];
  
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
