import { ProductCard } from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
import { FavoriteItem } from '../components/FavoritesDrawer';

interface WomenPageProps {
  onAddToCart: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: FavoriteItem[];
}

export function WomenPage({ onAddToCart, onToggleFavorite, favorites = [] }: WomenPageProps) {
  // Mock product data - women's collection
  const womenProducts = [
    {
      id: '11',
      name: 'Floral Summer Dress',
      price: 580,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGRyZXNzfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Dresses',
      isNew: true,
    },
    {
      id: '12',
      name: 'Oversized Blazer - Black',
      price: 720,
      image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGJsYXplcnxlbnwxfHx8fDE3NjI5MjQwNzV8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Blazers',
      isNew: true,
    },
    {
      id: '13',
      name: 'Casual Crop Top',
      price: 180,
      image: 'https://images.unsplash.com/photo-1564859228273-274232fdb516?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGNyb3AlMjB0b3B8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Tops',
      isNew: false,
    },
    {
      id: '14',
      name: 'High-Waisted Jeans',
      price: 480,
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGplYW5zfGVufDF8fHx8MTc2MjkyNDA3NXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jeans',
      isNew: false,
    },
    {
      id: '15',
      name: 'Knit Sweater - Cream',
      price: 420,
      image: 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMHN3ZWF0ZXJ8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Sweaters',
      isNew: false,
    },
    {
      id: '16',
      name: 'Leather Jacket - Brown',
      price: 890,
      image: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGxlYXRoZXIlMjBqYWNrZXR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Jackets',
      isNew: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="mb-6">
            <h1 className="mb-2">Women's Collection</h1>
            <p className="text-gray-600">
              Elegant and trendy pieces curated just for you.
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">{womenProducts.length} products</p>
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
          {womenProducts.map((product) => (
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