import { useState, useEffect } from 'react';
import { CatalogProduct, ProductStatus } from '../types/catalogProduct';

const API_BASE = import.meta.env['VITE_API_BASE_URL'] || 'http://localhost:4000';

// Generate sample data - 20 products total
function generateSampleProducts(): CatalogProduct[] {
  const now = new Date().toISOString();
  
  return [
    // UNISEX (5 products)
    {
      id: '1',
      category: 'T-Shirt - Round Neck',
      name: 'Classic White Cotton Tee',
      type: 'Unisex',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      fitType: 'Regular Fit',
      description: 'Premium cotton t-shirt for everyday wear',
      images: [{ url: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=White+Tee', publicId: 'sample_1', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Cotton',
      baseCost: 150,
      retailPrice: 299,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '2',
      category: 'T-Shirt - V-Neck',
      name: 'Black V-Neck Premium Tee',
      type: 'Unisex',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      fitType: 'Slim Fit',
      description: 'Stylish v-neck t-shirt',
      images: [{ url: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Black+VNeck', publicId: 'sample_2', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Cotton',
      baseCost: 170,
      retailPrice: 329,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '3',
      category: 'Jogging Pants',
      name: 'Sport Joggers Gray',
      type: 'Unisex',
      sizes: ['S', 'M', 'L', 'XL'],
      fitType: 'Tapered',
      description: 'Comfortable joggers for sports',
      images: [{ url: 'https://via.placeholder.com/400x400/808080/FFFFFF?text=Gray+Joggers', publicId: 'sample_3', type: 'front', displayOrder: 1 }],
      fabricComposition: '80% Cotton, 20% Polyester',
      baseCost: 300,
      retailPrice: 599,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '4',
      category: 'Shorts',
      name: 'Athletic Shorts Navy',
      type: 'Unisex',
      sizes: ['S', 'M', 'L', 'XL'],
      fitType: 'Regular Fit',
      description: 'Breathable athletic shorts',
      images: [{ url: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Navy+Shorts', publicId: 'sample_4', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Polyester',
      baseCost: 200,
      retailPrice: 399,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '5',
      category: 'Varsity Jacket',
      name: 'Classic Varsity Navy/White',
      type: 'Unisex',
      sizes: ['M', 'L', 'XL', '2XL'],
      fitType: 'Classic',
      description: 'Premium varsity jacket',
      images: [{ url: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Varsity', publicId: 'sample_5', type: 'front', displayOrder: 1 }],
      fabricComposition: '70% Wool, 30% Leather',
      baseCost: 800,
      retailPrice: 1499,
      status: 'active',
      printAreas: [],
      turnaroundTime: '7-10 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },

    // MEN (5 products)
    {
      id: '6',
      category: 'Polo Shirt',
      name: 'Premium Polo Navy',
      type: 'Men',
      sizes: ['M', 'L', 'XL', '2XL'],
      fitType: 'Slim Fit',
      description: 'Elegant polo for men',
      images: [{ url: 'https://via.placeholder.com/400x400/000080/FFFFFF?text=Polo', publicId: 'sample_6', type: 'front', displayOrder: 1 }],
      fabricComposition: '65% Cotton, 35% Polyester',
      baseCost: 250,
      retailPrice: 499,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '7',
      category: 'T-Shirt - Chinese Collar',
      name: 'Chinese Collar Black',
      type: 'Men',
      sizes: ['M', 'L', 'XL', '2XL'],
      fitType: 'Regular Fit',
      description: 'Modern chinese collar tee',
      images: [{ url: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Chinese', publicId: 'sample_7', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Cotton',
      baseCost: 200,
      retailPrice: 399,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '8',
      category: 'Sando (Jersey) - V-Neck',
      name: 'Basketball Jersey Red',
      type: 'Men',
      sizes: ['M', 'L', 'XL'],
      fitType: 'Athletic Fit',
      description: 'Breathable basketball jersey',
      images: [{ url: 'https://via.placeholder.com/400x400/FF0000/FFFFFF?text=Jersey', publicId: 'sample_8', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Polyester',
      baseCost: 200,
      retailPrice: 399,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '9',
      category: 'Warmers',
      name: 'Training Warmers Black',
      type: 'Men',
      sizes: ['M', 'L', 'XL', '2XL'],
      fitType: 'Regular Fit',
      description: 'Thermal warmers for training',
      images: [{ url: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Warmers', publicId: 'sample_9', type: 'front', displayOrder: 1 }],
      fabricComposition: '90% Polyester, 10% Spandex',
      baseCost: 350,
      retailPrice: 699,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '10',
      category: 'Sando (Jersey) - NBA Cut',
      name: 'NBA Style Jersey Blue',
      type: 'Men',
      sizes: ['M', 'L', 'XL'],
      fitType: 'Athletic Fit',
      description: 'Pro-style NBA cut jersey',
      images: [{ url: 'https://via.placeholder.com/400x400/0000FF/FFFFFF?text=NBA', publicId: 'sample_10', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Polyester',
      baseCost: 220,
      retailPrice: 429,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },

    // WOMEN (5 products)
    {
      id: '11',
      category: 'T-Shirt - Round Neck',
      name: 'Ladies Pink Cotton Tee',
      type: 'Women',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      fitType: 'Slim Fit',
      description: 'Soft cotton tee for women',
      images: [{ url: 'https://via.placeholder.com/400x400/FFC0CB/000000?text=Pink+Tee', publicId: 'sample_11', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Cotton',
      baseCost: 150,
      retailPrice: 299,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '12',
      category: 'T-Shirt - V-Neck',
      name: 'Ladies V-Neck Purple',
      type: 'Women',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      fitType: 'Slim Fit',
      description: 'Stylish v-neck for women',
      images: [{ url: 'https://via.placeholder.com/400x400/800080/FFFFFF?text=Purple', publicId: 'sample_12', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Cotton',
      baseCost: 170,
      retailPrice: 329,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '13',
      category: 'Polo Shirt',
      name: 'Ladies Polo White',
      type: 'Women',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      fitType: 'Slim Fit',
      description: 'Elegant polo for women',
      images: [{ url: 'https://via.placeholder.com/400x400/FFFFFF/000000?text=Polo', publicId: 'sample_13', type: 'front', displayOrder: 1 }],
      fabricComposition: '65% Cotton, 35% Polyester',
      baseCost: 250,
      retailPrice: 499,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '14',
      category: 'Jogging Pants',
      name: 'Ladies Joggers Black',
      type: 'Women',
      sizes: ['XS', 'S', 'M', 'L'],
      fitType: 'Tapered',
      description: 'Comfortable joggers',
      images: [{ url: 'https://via.placeholder.com/400x400/000000/FFFFFF?text=Joggers', publicId: 'sample_14', type: 'front', displayOrder: 1 }],
      fabricComposition: '80% Cotton, 20% Polyester',
      baseCost: 300,
      retailPrice: 599,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '15',
      category: 'Shorts',
      name: 'Athletic Shorts Pink',
      type: 'Women',
      sizes: ['XS', 'S', 'M', 'L'],
      fitType: 'Regular Fit',
      description: 'Breathable athletic shorts',
      images: [{ url: 'https://via.placeholder.com/400x400/FFC0CB/000000?text=Shorts', publicId: 'sample_15', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Polyester',
      baseCost: 200,
      retailPrice: 399,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },

    // KIDS (5 products)
    {
      id: '16',
      category: 'T-Shirt - Round Neck',
      name: 'Kids Yellow Cotton Tee',
      type: 'Kids',
      sizes: ['XS', 'S', 'M', 'L'],
      fitType: 'Regular Fit',
      description: 'Fun cotton tee for kids',
      images: [{ url: 'https://via.placeholder.com/400x400/FFD700/000000?text=Yellow', publicId: 'sample_16', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Cotton',
      baseCost: 130,
      retailPrice: 259,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '17',
      category: 'Shorts',
      name: 'Kids Blue Shorts',
      type: 'Kids',
      sizes: ['XS', 'S', 'M', 'L'],
      fitType: 'Regular Fit',
      description: 'Comfy shorts for kids',
      images: [{ url: 'https://via.placeholder.com/400x400/0000FF/FFFFFF?text=Shorts', publicId: 'sample_17', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Cotton',
      baseCost: 150,
      retailPrice: 299,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '18',
      category: 'Sando (Jersey) - Round Neck',
      name: 'Kids Jersey Green',
      type: 'Kids',
      sizes: ['XS', 'S', 'M'],
      fitType: 'Regular Fit',
      description: 'Sports jersey for kids',
      images: [{ url: 'https://via.placeholder.com/400x400/008000/FFFFFF?text=Jersey', publicId: 'sample_18', type: 'front', displayOrder: 1 }],
      fabricComposition: '100% Polyester',
      baseCost: 170,
      retailPrice: 329,
      status: 'active',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '19',
      category: 'Jogging Pants',
      name: 'Kids Joggers Gray',
      type: 'Kids',
      sizes: ['XS', 'S', 'M', 'L'],
      fitType: 'Tapered',
      description: 'Comfy joggers for kids',
      images: [{ url: 'https://via.placeholder.com/400x400/808080/FFFFFF?text=Joggers', publicId: 'sample_19', type: 'front', displayOrder: 1 }],
      fabricComposition: '80% Cotton, 20% Polyester',
      baseCost: 250,
      retailPrice: 499,
      status: 'inactive',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    },
    {
      id: '20',
      category: 'Polo Shirt',
      name: 'Kids Polo Red',
      type: 'Kids',
      sizes: ['XS', 'S', 'M', 'L'],
      fitType: 'Regular Fit',
      description: 'Smart polo for kids',
      images: [{ url: 'https://via.placeholder.com/400x400/FF0000/FFFFFF?text=Polo', publicId: 'sample_20', type: 'front', displayOrder: 1 }],
      fabricComposition: '65% Cotton, 35% Polyester',
      baseCost: 220,
      retailPrice: 429,
      status: 'inactive',
      printAreas: [],
      turnaroundTime: '3-5 business days',
      minOrderQuantity: 1,
      createdAt: now,
      updatedAt: now
    }
  ];
}

export function useCatalogProducts() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        // Map database structure to frontend structure
        const mapped = data.map((p: any) => ({
          id: String(p.product_id),
          category: p.category,
          name: p.product_name,
          type: p.gender || 'Unisex',
          sizes: p.sizes || [],
          fitType: p.fit_type,
          fitDescription: p.fit_description,
          description: p.description,
          images: p.product_images?.map((img: any, index: number) => ({
            id: img.image_id,
            url: img.image_url,
            publicId: img.cloudinary_public_id,
            type: img.display_order === 1 ? 'front' : img.display_order === 2 ? 'back' : 'additional',
            displayOrder: img.display_order
          })) || [],
          fabricComposition: p.material,
          fabricWeight: p.fabric_weight,
          texture: p.texture,
          baseCost: parseFloat(p.base_price) || 0,
          retailPrice: parseFloat(p.base_price) || 0,
          sizePricing: p.size_pricing,
          frontPrintCost: p.front_print_cost,
          backPrintCost: p.back_print_cost,
          sizeAvailability: p.size_availability,
          differentiationType: p.differentiation_type || 'none',
          color: p.color,
          variant: p.variant,
          printMethod: p.print_method,
          printAreas: p.customization_areas || [],
          designRequirements: p.design_requirements,
          turnaroundTime: p.production_days ? `${p.production_days} business days` : '3-5 business days',
          minOrderQuantity: p.min_order_quantity || 1,
          status: p.status?.toLowerCase() || 'inactive',
          createdAt: p.created_at,
          updatedAt: p.updated_at
        }));
        setProducts(mapped);
      } else {
        // Use sample data if API fails
        console.log('Using sample data - API not available');
      }
    } catch (error) {
      console.error('Error fetching catalog products:', error);
      // Keep using sample data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch real products from database
  }, []);

  const addProduct = async (product: Omit<CatalogProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(product)
      });
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = async (id: string, product: Partial<CatalogProduct>) => {
    try {
      console.log('Updating product:', id, product);
      const response = await fetch(`${API_BASE}/api/catalog-products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(product)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update failed:', response.status, errorText);
        throw new Error(`Update failed: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Update successful:', result);
      await fetchProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const activateProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Active' })
      });
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error activating product:', error);
    }
  };

  const deactivateProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Inactive' })
      });
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deactivating product:', error);
    }
  };

  const archiveProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'Archived' })
      });
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error archiving product:', error);
    }
  };

  const restoreProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/catalog-products/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'inactive' })
      });
      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error restoring product:', error);
    }
  };

  const getProductsByStatus = (status: ProductStatus) => {
    if (status === 'all') return products;
    return products.filter(p => p.status === status);
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
    getProductsByStatus
  };
}
