import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronLeft, Package, Clock, Ruler, Shirt, Users, Weight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useCatalogProduct } from '../hooks/useCatalogProduct';

interface ProductDetailsPageProps {
  onAddToCart: (id: string, quantity?: number) => void;
  onToggleFavorite: (id: string) => void;
  favorites: Array<{ id: string }>;
}

interface ProductVariant {
  name: string;
  images: {
    front: string;
    back: string;
    detail: string;
  };
  colors: Array<{
    name: string;
    hex: string;
  }>;
}

interface PricingTier {
  printType: string;
  price: number;
}

export function ProductDetailsPage({ onAddToCart, onToggleFavorite, favorites }: ProductDetailsPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { requireAuth } = useAuth();

  const [selectedImageView, setSelectedImageView] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch product from API
  const { product, loading, error } = useCatalogProduct(id);

  // Handle loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Handle error or not found
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="mb-4">{error || 'Product not found'}</h2>
          <Button onClick={() => navigate('/')} className="transition-transform active:scale-95">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Build all available images for the gallery
  const allImages = [
    product.image,
    product.backImage,
    ...product.additionalImages
  ].filter(Boolean) as string[];
  
  const currentImage = allImages[selectedImageView] || product.image;
  const isFavorited = favorites.some(fav => fav.id === product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    if (product.stockQuantity > 0 && quantity > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    requireAuth(() => {
      onAddToCart(product.id, quantity);
      toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
    });
  };

  const handleFavoriteClick = () => {
    requireAuth(() => {
      onToggleFavorite(product.id);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    if (product.stockQuantity > 0 && quantity > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    requireAuth(() => {
      onAddToCart(product.id, quantity);
      toast.success('Proceeding to checkout...');
      setTimeout(() => navigate('/checkout'), 500);
    });
  };

  const displayPrice = product.price;

  return (
    <div className="min-h-screen bg-white">
      {/* Back Navigation */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="transition-transform active:scale-95 -ml-2"
          >
            <ChevronLeft className="size-4 mr-1" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT COLUMN: Images */}
          <div className="space-y-6">
            {/* Main Product Image */}
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              <ImageWithFallback
                src={currentImage}
                alt={product.name}
                className="size-full object-cover"
              />
            </div>

            {/* Image View Selector - only show if multiple images exist */}
            {allImages.length > 1 && (
              <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${Math.min(allImages.length, 4)}, minmax(0, 1fr))` }}>
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageView(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                      selectedImageView === idx
                        ? 'border-black shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ImageWithFallback
                      src={img}
                      alt={`View ${idx + 1}`}
                      className="size-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="mb-2">{product.name}</h1>
              <p className="text-gray-600">{product.gender}</p>
            </div>

            <Separator />

            {/* Key Product Info Icons */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Users className="size-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{product.gender}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Shirt className="size-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Material</p>
                  <p className="font-medium text-sm">{product.material}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stock Status */}
            {product.stockQuantity > 0 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700">
                  <span className="font-medium">In Stock: </span>
                  {product.stockQuantity} items available
                </p>
              </div>
            )}

            {/* Size Selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium">Select Size</p>
                {selectedSize && (
                  <span className="text-sm text-gray-600">
                    Selected: <span className="font-medium">{selectedSize}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 px-2 border-2 rounded-lg transition-all active:scale-95 text-sm ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Quantity */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Quantity</p>
              <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg w-32">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors active:scale-95"
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, val));
                  }}
                  className="flex-1 text-center font-medium outline-none"
                  min={1}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-3 hover:bg-gray-100 transition-colors active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            <Separator />

            {/* Price Display */}
            <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Price</p>
              <p className="text-3xl font-bold">₱{displayPrice.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">
                Total: ₱{(displayPrice * quantity).toFixed(2)}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                className="w-full h-12 bg-black text-white hover:bg-black/90 transition-transform active:scale-95"
              >
                <ShoppingCart className="size-4 mr-2" />
                Buy Now
              </Button>

              <Button
                onClick={handleAddToCart}
                variant="outline"
                className="w-full h-12 transition-transform active:scale-95"
              >
                <ShoppingCart className="size-4 mr-2" />
                Add to Cart
              </Button>

              <Button
                variant="outline"
                onClick={handleFavoriteClick}
                className="w-full h-12 transition-transform active:scale-95"
              >
                <Heart
                  className={`size-4 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
                />
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-6 py-3"
              >
                Specifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-8">
              <div className="max-w-3xl">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-8">
              <div className="max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <p className="font-medium">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Gender</p>
                      <p className="font-medium">{product.gender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Material</p>
                      <p className="font-medium">{product.material}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Available Sizes</p>
                      <p className="font-medium">{product.sizes.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Stock Quantity</p>
                      <p className="font-medium">{product.stockQuantity} {product.stockQuantity === 1 ? 'item' : 'items'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
