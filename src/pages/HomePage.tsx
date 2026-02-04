import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ProductCard';
import { useNavigate } from 'react-router-dom';
import { FavoriteItem } from '../components/FavoritesDrawer';
import { useCatalogProductsCustomer } from '../hooks/useCatalogProductsCustomer';

interface HomePageProps {
  onAddToCart: (productId: string) => void;
  onToggleFavorite?: (productId: string) => void;
  favorites?: FavoriteItem[];
}

export function HomePage({ onAddToCart, onToggleFavorite, favorites = [] }: HomePageProps) {
  const navigate = useNavigate();
  const { products: catalogProducts, loading: productsLoading } = useCatalogProductsCustomer();

  // Use real catalog products as featured (first 4) so product links work
  const featuredProducts = catalogProducts.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-20 md:py-32 md:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <Badge 
              className="mb-4 bg-white/10 text-white hover:bg-white/20 cursor-pointer"
              onClick={() => navigate('/new-arrivals')}
            >
              New Collection Available
            </Badge>
            <h1 className="mb-6">
              Choose & Design Your Own Clothing
            </h1>
            <p className="mb-8 text-lg text-gray-300">
              Express your unique style with our customizable clothing collection. 
              Premium quality, affordable prices, and endless possibilities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100"
                onClick={() => navigate('/custom-products')}
              >
                Customizable Clothing
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-10 size-72 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 size-96 rounded-full bg-purple-500/10 blur-3xl" />
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 py-20 md:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-2">Featured Products</h2>
            <p className="text-gray-600">Discover our latest collection</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/new-arrivals')}>
            View All
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsLoading ? (
            <p className="col-span-full text-center text-gray-500 py-8">Loading featured products...</p>
          ) : featuredProducts.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-8">
              No catalog products yet. Add products in the admin to see them here.
            </p>
          ) : (
            featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                isNew={product.isNew}
                onAddToCart={onAddToCart}
                onToggleFavorite={onToggleFavorite}
                isFavorited={favorites.some(fav => fav.id === product.id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Categories Section - Men, Women, Kids */}
      <section className="container mx-auto px-4 py-20 md:px-6">
        <div className="mb-8 text-center">
          <h2 className="mb-2">Shop by Category</h2>
          <p className="text-gray-600">Explore our curated collections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Men Category */}
          <div 
            onClick={() => navigate('/men')}
            className="group relative overflow-hidden rounded-lg cursor-pointer aspect-[3/4] bg-gray-100"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/flagged/photo-1552708068-ddef64d75aee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBmYXNoaW9uJTIwY2xvdGhpbmd8ZW58MXx8fHwxNzYyOTg2MjE1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Men's Collection"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="mb-2 text-white">Men</h3>
              <p className="text-sm text-white/80 mb-4">Stylish & Comfortable</p>
              <Button className="bg-white text-black hover:bg-white/90">
                Shop Now
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>

          {/* Women Category */}
          <div 
            onClick={() => navigate('/women')}
            className="group relative overflow-hidden rounded-lg cursor-pointer aspect-[3/4] bg-gray-100"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1708363390847-b4af54f45273?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGZhc2hpb24lMjBzdHlsZXxlbnwxfHx8fDE3NjI5OTEwNTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Women's Collection"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="mb-2 text-white">Women</h3>
              <p className="text-sm text-white/80 mb-4">Elegant & Trendy</p>
              <Button className="bg-white text-black hover:bg-white/90">
                Shop Now
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>

          {/* Kids Category */}
          <div 
            onClick={() => navigate('/kids')}
            className="group relative overflow-hidden rounded-lg cursor-pointer aspect-[3/4] bg-gray-100"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1695263747144-a52aa3739d62?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxraWRzJTIwY2hpbGRyZW4lMjBmYXNoaW9ufGVufDF8fHx8MTc2Mjk5MTA1Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Kids' Collection"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="mb-2 text-white">Kids</h3>
              <p className="text-sm text-white/80 mb-4">Fun & Playful</p>
              <Button className="bg-white text-black hover:bg-white/90">
                Shop Now
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Design CTA */}
      <section className="container mx-auto px-4 pb-20 md:px-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 md:p-12 text-white">
          <div className="relative z-10 max-w-2xl">
            <h2 className="mb-4 text-white">Design Your Own Clothing</h2>
            <p className="mb-6 text-lg text-white/90">
              Create custom designs with our easy-to-use design tool. 
              Choose your style, add graphics, and make it uniquely yours.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => navigate('/custom-products')}
            >
              Start Designing
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
          
          {/* Decorative Image */}
          <div className="absolute right-0 top-0 size-full opacity-20">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1636458939465-9209848a5688?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwbW9kZWwlMjB0c2hpcnR8ZW58MXx8fHwxNzYyOTI0MDc1fDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Design"
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Footer component will be rendered by App.tsx */}
    </div>
  );
}