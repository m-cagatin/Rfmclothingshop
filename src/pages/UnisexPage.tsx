import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { FavoriteItem } from '../components/FavoritesDrawer';
import { useCatalogProductsCustomer } from '../hooks/useCatalogProductsCustomer';

interface UnisexPageProps {
  onAddToCart: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: FavoriteItem[];
}

export function UnisexPage({ onAddToCart, onToggleFavorite, favorites = [] }: UnisexPageProps) {
  const { products, loading } = useCatalogProductsCustomer('Unisex');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading products...</p>
      </div>
    );
  }

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
              onToggleFavorite={onToggleFavorite}
              isFavorited={favorites.some(fav => fav.id === product.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
