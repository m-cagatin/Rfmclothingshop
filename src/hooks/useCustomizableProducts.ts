import { useState, useEffect } from 'react';
import { CustomizableProduct } from '../types/customizableProduct';

const STORAGE_KEY = 'customizable_products';
const API_BASE_URL = import.meta.env['VITE_API_BASE'] || 'http://localhost:4000';

// Helper function to transform frontend enum values to backend format
function transformEnumValue(value: string | undefined): string | undefined {
  if (!value) return value;
  // Replace spaces with underscores for enum compatibility
  return value.replace(/ /g, '_');
}

// Mock initial data
const initialProducts: CustomizableProduct[] = [
  {
    id: '1',
    category: 'T-Shirt - Round Neck',
    name: 'Classic Round Neck Tee',
    type: 'Unisex',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    fitType: 'Classic',
    fitDescription: 'Regular fit with comfortable cut',
    description: 'Premium quality round neck t-shirt perfect for custom printing. Made from 100% cotton for superior comfort and durability.',
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', publicId: 'mock-front-1', type: 'front', displayOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500', publicId: 'mock-back-1', type: 'back', displayOrder: 1 },
    ],
    fabricComposition: '100% Cotton',
    fabricWeight: '180 g/m²',
    texture: 'Soft-washed',
    baseCost: 150,
    retailPrice: 350,
    color: { name: 'White', hexCode: '#FFFFFF' },
    printMethod: 'DTG (Direct to Garment)',
    printAreas: ['Front', 'Back'],
    designRequirements: 'PNG file with transparent background, 300 DPI minimum',
    turnaroundTime: '3-5 business days',
    minOrderQuantity: 1,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    category: 'Polo Shirt',
    name: 'Premium Polo Shirt',
    type: 'Men',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    fitType: 'Slim Fit',
    fitDescription: 'Tailored slim fit for modern look',
    description: 'High-quality polo shirt with collar, perfect for corporate branding and team uniforms.',
    images: [
      { url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500', publicId: 'mock-front-2', type: 'front', displayOrder: 0 },
      { url: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500', publicId: 'mock-back-2', type: 'back', displayOrder: 1 },
    ],
    fabricComposition: '65% Cotton, 35% Polyester',
    fabricWeight: '200 g/m²',
    texture: 'Pique knit',
    baseCost: 200,
    retailPrice: 450,
    color: { name: 'Gray', hexCode: '#6B7280' },
    printMethod: 'Embroidery',
    printAreas: ['Chest', 'Back'],
    designRequirements: 'Vector files (AI, EPS) preferred for embroidery',
    turnaroundTime: '5-7 business days',
    minOrderQuantity: 1,
    status: 'inactive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useCustomizableProducts() {
  const [products, setProducts] = useState<CustomizableProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/customizable-products`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
      // Fallback to localStorage if API fails
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any[];
        // Migrate older schema to new structure
        const migrated: CustomizableProduct[] = parsed.map((p: any) => {
          let migratedProduct = { ...p };
          
          // Migrate colors[] to single color
          if (p && Array.isArray(p.colors)) {
            const first = p.colors[0];
            const { colors, ...rest } = p;
            migratedProduct = {
              ...rest,
              color: first ? { name: first.name, hexCode: first.hexCode } : undefined,
            };
          }
          
          // Migrate frontImage/backImage to images array
          if (p.frontImage || p.backImage || p.additionalImages) {
            const images = [];
            if (p.frontImage) {
              images.push({
                url: p.frontImage,
                publicId: 'migrated-front',
                type: 'front',
                displayOrder: 0
              });
            }
            if (p.backImage) {
              images.push({
                url: p.backImage,
                publicId: 'migrated-back',
                type: 'back',
                displayOrder: 1
              });
            }
            if (Array.isArray(p.additionalImages)) {
              p.additionalImages.forEach((url: string, idx: number) => {
                images.push({
                  url,
                  publicId: `migrated-additional-${idx}`,
                  type: 'additional',
                  displayOrder: idx + 2
                });
              });
            }
            const { frontImage, backImage, additionalImages, ...rest } = migratedProduct;
            migratedProduct = { ...rest, images };
          }
          
          return migratedProduct as CustomizableProduct;
        });
        setProducts(migrated);
      } catch (error) {
        console.error('Failed to parse products:', error);
        setProducts(initialProducts);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
      }
    } else {
      setProducts(initialProducts);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts));
    }
  };

  // Load from API on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Save to localStorage whenever products change (fallback)
  useEffect(() => {
    if (!loading && products.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, loading]);

  const addProduct = async (product: Omit<CustomizableProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Transform frontend format to backend format
      const backendData = {
        name: product.name,
        category: product.category,
        gender: product.type, // Frontend 'type' → Backend 'gender'
        fitType: transformEnumValue(product.fitType), // Transform spaces to underscores
        description: product.description,
        fabricComposition: product.fabricComposition,
        fabricWeight: product.fabricWeight,
        texture: product.texture,
        availableSizes: product.sizes, // Frontend 'sizes' → Backend 'availableSizes'
        fitDescription: product.fitDescription,
        sizePricing: product.sizePricing,
        colorName: product.color?.name, // Frontend nested → Backend flat
        colorHex: product.color?.hexCode,
        variantName: product.variant?.name,
        variantImageUrl: product.variant?.image,
        variantImagePublicId: product.variant?.publicId,
        printMethod: transformEnumValue(product.printMethod), // Transform spaces to underscores
        printAreas: product.printAreas,
        designRequirements: product.designRequirements,
        baseCost: product.baseCost,
        retailPrice: product.retailPrice,
        turnaroundTime: product.turnaroundTime,
        minimumOrderQty: product.minOrderQuantity, // Frontend 'minOrderQuantity' → Backend 'minimumOrderQty'
        frontPrintCost: product.frontPrintCost,
        backPrintCost: product.backPrintCost,
        sizeAvailability: product.sizeAvailability,
        differentiationType: product.differentiationType,
        status: product.status,
        images: product.images,
      };

      const response = await fetch(`${API_BASE_URL}/api/customizable-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      if (!response.ok) throw new Error('Failed to create product');
      const newProduct = await response.json();
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      console.error('Error adding product:', err);
      // Fallback to localStorage
      const newProduct: CustomizableProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    }
  };

  const updateProduct = async (id: string, updates: Partial<CustomizableProduct>) => {
    try {
      // Transform frontend format to backend format
      const backendData: any = {
        id: parseInt(id),
      };
      
      if (updates.name !== undefined) backendData.name = updates.name;
      if (updates.category !== undefined) backendData.category = updates.category;
      if (updates.type !== undefined) backendData.gender = updates.type;
      if (updates.fitType !== undefined) backendData.fitType = transformEnumValue(updates.fitType);
      if (updates.description !== undefined) backendData.description = updates.description;
      if (updates.fabricComposition !== undefined) backendData.fabricComposition = updates.fabricComposition;
      if (updates.fabricWeight !== undefined) backendData.fabricWeight = updates.fabricWeight;
      if (updates.texture !== undefined) backendData.texture = updates.texture;
      if (updates.sizes !== undefined) backendData.availableSizes = updates.sizes;
      if (updates.fitDescription !== undefined) backendData.fitDescription = updates.fitDescription;
      if (updates.sizePricing !== undefined) backendData.sizePricing = updates.sizePricing;
      if (updates.color !== undefined) {
        backendData.colorName = updates.color.name;
        backendData.colorHex = updates.color.hexCode;
      }
      if (updates.variant !== undefined) {
        backendData.variantName = updates.variant.name;
        backendData.variantImageUrl = updates.variant.image;
        backendData.variantImagePublicId = updates.variant.publicId;
      }
      if (updates.printMethod !== undefined) backendData.printMethod = transformEnumValue(updates.printMethod);
      if (updates.printAreas !== undefined) backendData.printAreas = updates.printAreas;
      if (updates.designRequirements !== undefined) backendData.designRequirements = updates.designRequirements;
      if (updates.baseCost !== undefined) backendData.baseCost = updates.baseCost;
      if (updates.retailPrice !== undefined) backendData.retailPrice = updates.retailPrice;
      if (updates.turnaroundTime !== undefined) backendData.turnaroundTime = updates.turnaroundTime;
      if (updates.minOrderQuantity !== undefined) backendData.minimumOrderQty = updates.minOrderQuantity;
      if (updates.frontPrintCost !== undefined) backendData.frontPrintCost = updates.frontPrintCost;
      if (updates.backPrintCost !== undefined) backendData.backPrintCost = updates.backPrintCost;
      if (updates.sizeAvailability !== undefined) backendData.sizeAvailability = updates.sizeAvailability;
      if (updates.differentiationType !== undefined) backendData.differentiationType = updates.differentiationType;
      if (updates.status !== undefined) backendData.status = updates.status;
      if (updates.images !== undefined) backendData.images = updates.images;

      const response = await fetch(`${API_BASE_URL}/api/customizable-products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendData),
      });
      if (!response.ok) throw new Error('Failed to update product');
      const updated = await response.json();
      setProducts((prev) => prev.map((p) => p.id === id ? updated : p));
    } catch (err) {
      console.error('Error updating product:', err);
      // Fallback to localStorage
      setProducts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        )
      );
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customizable-products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      // Fallback to localStorage
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const activateProduct = async (id: string) => {
    await updateProduct(id, { status: 'active' });
  };

  const deactivateProduct = async (id: string) => {
    await updateProduct(id, { status: 'inactive' });
  };

  const archiveProduct = async (id: string) => {
    await updateProduct(id, { status: 'archived' });
  };

  const restoreProduct = async (id: string) => {
    await updateProduct(id, { status: 'inactive' });
  };

  const getProductsByStatus = (status: 'active' | 'inactive' | 'archived' | 'all') => {
    if (status === 'all') return products;
    return products.filter((p) => p.status === status);
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    activateProduct,
    deactivateProduct,
    archiveProduct,
    restoreProduct,
    getProductsByStatus,
  };
}
