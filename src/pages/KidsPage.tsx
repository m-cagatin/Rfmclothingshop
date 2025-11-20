import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { FavoriteItem } from '../components/FavoritesDrawer';

interface KidsPageProps {
  onAddToCart: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: FavoriteItem[];
}

export function KidsPage({ onAddToCart, onToggleFavorite, favorites = [] }: KidsPageProps) {
  // Mock product data - kids' collection
  const kidsProducts = [
    {
      id: 'k1',
      name: 'Kids Classic T-Shirt',
      price: 150,
      image: 'https://images.unsplash.com/photo-1731267776886-90f90af75eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwdC1zaGlydCUyMHdoaXRlfGVufDF8fHx8MTc2Mjk5MDk5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'T-Shirts',
      isNew: true,
    },
    {
      id: 'k2',
      name: 'Kids Polo Shirt - Classic',
      price: 180,
      image: 'https://images.unsplash.com/photo-1659779193831-97ccb9fecfeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwcG9sbyUyMHNoaXJ0fGVufDF8fHx8MTc2MjkzMjQzOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Shirts',
      isNew: true,
    },
    {
      id: 'k3',
      name: 'Kids Casual Outfit',
      price: 280,
      image: 'https://images.unsplash.com/photo-1759313560190-d160c3567170?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwZmFzaGlvbiUyMGNhc3VhbHxlbnwxfHx8fDE3NjI5OTA5OTF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Casual',
      isNew: false,
    },
    {
      id: 'k4',
      name: 'Kids Stylish Wear',
      price: 320,
      image: 'https://images.unsplash.com/photo-1695262620869-fedab63bcc41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlsZHJlbiUyMGNsb3RoaW5nJTIwc3R5bGV8ZW58MXx8fHwxNzYyOTkwOTkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      category: 'Clothing',
      isNew: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-6">
            <h1 className="mb-2">Kids' Collection</h1>
            <p className="text-gray-600">
              Comfortable and stylish clothing for your little ones.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{kidsProducts.length} products</p>
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
          {kidsProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onAddToCart={onAddToCart}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favorites.some((fav) => fav.id === product.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}