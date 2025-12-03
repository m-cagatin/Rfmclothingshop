import { useState, useEffect } from 'react';
import { CustomizableProduct } from '../types/customizableProduct';

const STORAGE_KEY = 'customizable_products';

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

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as any[];
        // Migrate older schema with colors[] to new single color + optional variant
        const migrated: CustomizableProduct[] = parsed.map((p: any) => {
          if (p && Array.isArray(p.colors)) {
            const first = p.colors[0];
            const { colors, ...rest } = p;
            return {
              ...rest,
              color: first ? { name: first.name, hexCode: first.hexCode } : undefined,
            } as CustomizableProduct;
          }
          return p as CustomizableProduct;
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
    setLoading(false);
  }, []);

  // Save to localStorage whenever products change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }
  }, [products, loading]);

  const addProduct = (product: Omit<CustomizableProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: CustomizableProduct = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<CustomizableProduct>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const activateProduct = (id: string) => {
    updateProduct(id, { status: 'active' });
  };

  const deactivateProduct = (id: string) => {
    updateProduct(id, { status: 'inactive' });
  };

  const archiveProduct = (id: string) => {
    updateProduct(id, { status: 'archived' });
  };

  const restoreProduct = (id: string) => {
    updateProduct(id, { status: 'inactive' });
  };

  const getProductsByStatus = (status: 'active' | 'inactive' | 'archived' | 'all') => {
    if (status === 'all') return products;
    return products.filter((p) => p.status === status);
  };

  return {
    products,
    loading,
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
