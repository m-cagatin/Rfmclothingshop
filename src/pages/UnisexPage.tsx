import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { FavoriteItem } from '../components/FavoritesDrawer';

interface UnisexPageProps {
  onAddToCart: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: FavoriteItem[];
}

export function UnisexPage({ onAddToCart, onToggleFavorite, favorites = [] }: UnisexPageProps) {
  // Mock product data - unisex collection
  const unisexProducts = [
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
      id: '5',
      name: 'Premium Black Hoodie',
      price: 480,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvb2RpZXxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Hoodies',
      isNew: false,
    },
    {
      id: '6',
      name: 'Graphic Print Tee',
      price: 250,
      image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwdGVlfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'T-Shirts',
      isNew: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-6">
            <h1 className="mb-2">Unisex Collection</h1>
            <p className="text-gray-600">
              Versatile styles for everyone. Classic designs that transcend gender boundaries.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{unisexProducts.length} products</p>
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
          {unisexProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favorites.some(fav => fav.id === product.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
