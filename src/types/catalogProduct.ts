export interface CatalogProduct {
  id: string;
  category: string;
  name: string;
  type: string;
  sizes: string[];
  fitType?: string;
  fitDescription?: string;
  description?: string;
  images: ProductImage[];
  fabricComposition?: string;
  fabricWeight?: string;
  texture?: string;
  baseCost: number;
  retailPrice: number;
  sizePricing?: Record<string, number>;
  frontPrintCost?: number;
  backPrintCost?: number;
  sizeAvailability?: Record<string, boolean>;
  differentiationType?: 'none' | 'color' | 'variant';
  color?: SingleColor;
  variant?: VariantSample;
  printMethod?: string;
  printAreas: string[];
  designRequirements?: string;
  turnaroundTime?: string;
  minOrderQuantity?: number;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id?: number;
  url: string;
  publicId: string;
  type: 'front' | 'back' | 'additional';
  displayOrder: number;
}

export interface ProductImageFile {
  file: File;
  preview: string;
  type: 'front' | 'back' | 'additional';
  displayOrder: number;
  folder: string;
  customPublicId?: string;
}

export interface SingleColor {
  name: string;
  hexCode: string;
}

export interface VariantSample {
  name: string;
  image: string;
  publicId: string;
}

export type ProductStatus = 'active' | 'inactive' | 'archived' | 'all';
