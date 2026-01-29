import { useState, useEffect } from 'react';

interface CatalogProduct {
  product_id: number;
  product_name: string;
  category: string;
  gender: string;
  base_price: number | string; // Database returns string (Decimal type)
  sizes: string[];
  material: string;
  stock_quantity: number;
  status: string;
  created_at: string;
  updated_at: string;
  product_images: Array<{
    image_id: number;
    image_url: string;
    display_order: number;
  }>;
}

interface TransformedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  backImage?: string;
  additionalImages: string[];
  category: string;
  gender: string;
  material: string;
  sizes: string[];
  stockQuantity: number;
  description: string;
}

export function useCatalogProduct(productId: string | undefined) {
  const [product, setProduct] = useState<TransformedProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE = import.meta.env['VITE_API_BASE'] || 'http://localhost:4000';
        const response = await fetch(`${API_BASE}/api/catalog-products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Product not found');
          }
          throw new Error('Failed to fetch product');
        }

        const data: CatalogProduct = await response.json();

        // Sort images by display_order
        const sortedImages = [...data.product_images].sort((a, b) => a.display_order - b.display_order);

        // Transform to match the component's expected format
        const transformed: TransformedProduct = {
          id: data.product_id.toString(),
          name: data.product_name,
          price: typeof data.base_price === 'string' ? parseFloat(data.base_price) : data.base_price,
          image: sortedImages[0]?.image_url || '',
          backImage: sortedImages[1]?.image_url,
          additionalImages: sortedImages.slice(2).map(img => img.image_url),
          category: data.category,
          gender: data.gender,
          material: data.material,
          sizes: data.sizes,
          stockQuantity: data.stock_quantity,
          description: `Premium ${data.category} made from ${data.material}. Available in multiple sizes for ${data.gender === 'Unisex' ? 'everyone' : data.gender.toLowerCase()}.`,
        };

        setProduct(transformed);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}
