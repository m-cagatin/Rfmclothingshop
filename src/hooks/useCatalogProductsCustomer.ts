import { useState, useEffect } from 'react';

const API_BASE = import.meta.env['VITE_API_URL'] || 'http://localhost:4000';

export interface CatalogProductCustomer {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  category: string;
  description?: string;
  gender: string;
  sizes?: string[];
  material?: string;
  isNew: boolean;
}

export function useCatalogProductsCustomer(gender?: string) {
  const [products, setProducts] = useState<CatalogProductCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [gender]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      // Filter by gender if specified, and only show Active products
      let filtered = data.filter((p: any) => p.status === 'Active');
      if (gender) {
        filtered = filtered.filter((p: any) => p.gender === gender);
      }
      
      // Transform to customer format
      const transformed: CatalogProductCustomer[] = filtered.map((p: any) => {
        const frontImage = p.product_images?.find((img: any) => img.display_order === 1);
        const allImages = p.product_images
          ?.sort((a: any, b: any) => a.display_order - b.display_order)
          .map((img: any) => img.image_url) || [];
        
        // Product is "new" if created within last 30 days
        const isNew = p.created_at 
          ? (new Date().getTime() - new Date(p.created_at).getTime()) < 30 * 24 * 60 * 60 * 1000
          : false;

        return {
          id: String(p.product_id),
          name: p.product_name,
          price: parseFloat(p.base_price),
          image: frontImage?.image_url || allImages[0] || '',
          images: allImages,
          category: p.category,
          description: p.description,
          gender: p.gender,
          sizes: p.sizes || [],
          material: p.material,
          isNew
        };
      });

      setProducts(transformed);
    } catch (err: any) {
      console.error('Error fetching catalog products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}
