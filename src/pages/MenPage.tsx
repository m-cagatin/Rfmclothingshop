import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { FavoriteItem } from '../components/FavoritesDrawer';
import { useCatalogProductsCustomer } from '../hooks/useCatalogProductsCustomer';

interface MenPageProps {
  onAddToCart: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: FavoriteItem[];
}

export function MenPage({ onAddToCart, onToggleFavorite, favorites }: MenPageProps) {
  const { products, loading } = useCatalogProductsCustomer('Men');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

  const menProducts = [
    {
      id: '1',
      name: 'Classic White T-Shirt - Round Neck',
      price: 200,
      image: 'https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: true,
    },
    {
      id: '2',
      name: 'Varsity Jacket - Blue & White',
      price: 600,
      image: 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwc3RyZWV0fGVufDF8fHx8MTc2Mjk3Nzk3OXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: true,
    },
    {
      id: '3',
      name: 'Oversized Hoodie - Premium Cotton',
      price: 450,
      image: 'https://images.unsplash.com/photo-1688111421205-a0a85415b224?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwaG9vZGllfGVufDF8fHx8MTc2Mjk1MjY5MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Hoodies',
      isNew: false,
    },
    {
      id: '4',
      name: 'Denim Jacket - Classic Blue',
      price: 550,
      image: 'https://images.unsplash.com/photo-1657349038547-b18a07fb4329?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW5pbSUyMGphY2tldCUyMHN0eWxlfGVufDF8fHx8MTc2MjkzMjg2MXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: false,
    },
    {
      id: '9',
      name: 'Polo Shirt - Navy Blue',
      price: 280,
      image: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2xvJTIwc2hpcnQlMjBtZW58ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Shirts',
      isNew: false,
    },
    {
      id: '10',
      name: 'Cargo Pants - Black',
      price: 520,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJnbyUyMHBhbnRzfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Pants',
      isNew: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-6">
            <h1 className="mb-2">Men's Collection</h1>
            <p className="text-gray-600">
              Discover stylish and comfortable clothing for every occasion.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{products.length} products</p>
            <Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 size-4" />
              Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
