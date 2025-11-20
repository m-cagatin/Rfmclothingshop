import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, ChevronLeft, Package, Clock, Ruler, Shirt, Users, Weight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner@2.0.3';

interface ProductDetailsPageProps {
  onAddToCart: (id: string) => void;
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

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedImageView, setSelectedImageView] = useState<'front' | 'back' | 'detail'>('front');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Mock comprehensive product data
  const allProducts = [
    {
      id: '1',
      name: 'Classic Round Neck T-Shirt',
      category: 'T-Shirt - Round Neck',
      fitType: 'Regular Fit',
      gender: 'Unisex',
      fitDescription: 'True to size, relaxed fit for everyday comfort',
      material: '100% Combed Cotton',
      weight: '180g (±10g)',
      description: 'Our Classic Round Neck T-Shirt is the foundation of any wardrobe. Made from premium 100% combed cotton, this versatile piece offers superior softness and breathability. Perfect for custom printing, casual wear, or layering. The fabric is pre-shrunk to maintain its shape and size after washing.',
      variants: [
        {
          name: 'Classic White',
          images: {
            front: 'https://images.unsplash.com/photo-1636458939465-9209848a5688?w=800',
            back: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
            detail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
          },
          colors: [
            { name: 'White', hex: '#FFFFFF' },
            { name: 'Off-White', hex: '#F5F5F0' },
          ],
        },
        {
          name: 'Classic Black',
          images: {
            front: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
            back: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
            detail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
          },
          colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'Charcoal', hex: '#36454F' },
          ],
        },
        {
          name: 'Heather Gray',
          images: {
            front: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
            back: 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=800',
            detail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
          },
          colors: [
            { name: 'Heather Gray', hex: '#9CA3AF' },
            { name: 'Light Gray', hex: '#D1D5DB' },
          ],
        },
      ],
      sizes: {
        adult: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        kids: ['K6', 'K8', 'K10', 'K12', 'K14', 'K16', 'K19'],
      },
      pricing: [
        { printType: 'No Print', price: 200 },
        { printType: 'Front Print Only', price: 350 },
        { printType: 'Back Print Only', price: 350 },
        { printType: 'Front + Back Print', price: 480 },
        { printType: 'Sleeve Print (Additional)', price: 100 },
      ],
      printAreas: ['Front', 'Back', 'Left Sleeve', 'Right Sleeve'],
      minOrder: 10,
      maxOrder: 1000,
      turnaroundTime: '5-7 business days',
      xlSurcharge: 50, // per X for XL+
    },
    {
      id: '2',
      name: 'Premium Varsity Jacket',
      category: 'Jacket - Varsity Style',
      fitType: 'Classic Fit',
      gender: 'Unisex',
      fitDescription: 'Slightly oversized for layering, athletic cut',
      material: 'Wool Blend Body, Genuine Leather Sleeves',
      weight: '850g (±20g)',
      description: 'Channel timeless athletic style with our Premium Varsity Jacket. Featuring a luxurious wool blend body and genuine leather sleeves, this jacket combines heritage design with modern quality. Perfect for team uniforms, custom embroidery, or personal style statements.',
      variants: [
        {
          name: 'Royal Blue & White',
          images: {
            front: 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?w=800',
            back: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
            detail: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
          },
          colors: [
            { name: 'Royal Blue', hex: '#3B82F6' },
            { name: 'Navy Blue', hex: '#1E3A8A' },
          ],
        },
        {
          name: 'Black & Gold',
          images: {
            front: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
            back: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
            detail: 'https://images.unsplash.com/photo-1761245332312-fddc4f0b5bab?w=800',
          },
          colors: [
            { name: 'Black', hex: '#000000' },
            { name: 'Jet Black', hex: '#0A0A0A' },
          ],
        },
      ],
      sizes: {
        adult: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        kids: [],
      },
      pricing: [
        { printType: 'No Print', price: 600 },
        { printType: 'Chest Embroidery', price: 750 },
        { printType: 'Back Embroidery', price: 750 },
        { printType: 'Chest + Back Embroidery', price: 880 },
        { printType: 'Sleeve Patch (Additional)', price: 150 },
      ],
      printAreas: ['Chest', 'Back', 'Left Sleeve', 'Right Sleeve'],
      minOrder: 5,
      maxOrder: 500,
      turnaroundTime: '7-10 business days',
      xlSurcharge: 50,
    },
    {
      id: '3',
      name: 'Oversized Premium Hoodie',
      category: 'Hoodie - Oversized',
      fitType: 'Oversized Fit',
      gender: 'Unisex',
      fitDescription: 'Intentionally oversized, drop shoulder design',
      material: 'Premium Cotton Fleece (80% Cotton, 20% Polyester)',
      weight: '420g (±15g)',
      description: 'Experience ultimate comfort with our Oversized Premium Hoodie. Crafted from a premium cotton-polyester fleece blend, this hoodie offers warmth without weight. The oversized silhouette and drop shoulder design create a modern streetwear aesthetic perfect for custom prints and everyday wear.',
      variants: [
        {
          name: 'Sand Beige',
          images: {
            front: 'https://images.unsplash.com/photo-1688111421205-a0a85415b224?w=800',
            back: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
            detail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
          },
          colors: [
            { name: 'Sand Beige', hex: '#D4A574' },
            { name: 'Warm Taupe', hex: '#B8926A' },
          ],
        },
        {
          name: 'Midnight Black',
          images: {
            front: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
            back: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
            detail: 'https://images.unsplash.com/photo-1688111421205-a0a85415b224?w=800',
          },
          colors: [
            { name: 'Midnight Black', hex: '#000000' },
            { name: 'Dark Charcoal', hex: '#1F2937' },
          ],
        },
        {
          name: 'Stone Gray',
          images: {
            front: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
            back: 'https://images.unsplash.com/photo-1688111421205-a0a85415b224?w=800',
            detail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
          },
          colors: [
            { name: 'Stone Gray', hex: '#6B7280' },
            { name: 'Ash Gray', hex: '#9CA3AF' },
          ],
        },
      ],
      sizes: {
        adult: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        kids: [],
      },
      pricing: [
        { printType: 'No Print', price: 450 },
        { printType: 'Front Print Only', price: 600 },
        { printType: 'Back Print Only', price: 600 },
        { printType: 'Front + Back Print', price: 720 },
        { printType: 'Hood Print (Additional)', price: 120 },
      ],
      printAreas: ['Front', 'Back', 'Hood', 'Left Sleeve', 'Right Sleeve'],
      minOrder: 10,
      maxOrder: 800,
      turnaroundTime: '5-7 business days',
      xlSurcharge: 50,
    },
  ];

  const product = allProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="mb-4">Product not found</h2>
          <Button onClick={() => navigate('/')} className="transition-transform active:scale-95">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const currentVariant = product.variants[selectedVariant];
  const currentColor = currentVariant.colors[selectedColor];
  const currentImage = currentVariant.images[selectedImageView];
  const isFavorited = favorites.some(fav => fav.id === product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (quantity < product.minOrder) {
      toast.error(`Minimum order quantity is ${product.minOrder}`);
      return;
    }

    requireAuth(() => {
      for (let i = 0; i < quantity; i++) {
        onAddToCart(product.id);
      }
      toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`);
    });
  };

  const handleFavoriteClick = () => {
    requireAuth(() => {
      onToggleFavorite(product.id);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    });
  };

  const calculateSizePrice = (basePrice: number, size: string): number => {
    const xlCount = (size.match(/X/g) || []).length;
    if (xlCount >= 2) {
      return basePrice + (product.xlSurcharge * (xlCount - 1));
    }
    return basePrice;
  };

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
                alt={`${product.name} - ${currentVariant.name} - ${selectedImageView}`}
                className="size-full object-cover"
              />
            </div>

            {/* Image View Selector (Front, Back, Detail) */}
            <div className="grid grid-cols-3 gap-3">
              {(['front', 'back', 'detail'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => setSelectedImageView(view)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all active:scale-95 ${
                    selectedImageView === view
                      ? 'border-black shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <ImageWithFallback
                    src={currentVariant.images[view]}
                    alt={`${view} view`}
                    className="size-full object-cover"
                  />
                  <div className="sr-only">{view.charAt(0).toUpperCase() + view.slice(1)} View</div>
                </button>
              ))}
            </div>

            {/* Variant Selector */}
            <div>
              <p className="text-sm mb-3">Select Variant:</p>
              <div className="grid grid-cols-3 gap-3">
                {product.variants.map((variant, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedVariant(index);
                      setSelectedColor(0);
                    }}
                    className={`p-3 rounded-lg border-2 transition-all active:scale-95 text-sm ${
                      selectedVariant === index
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <p className="text-sm mb-3">
                Color: <span className="font-medium">{currentColor.name}</span>
              </p>
              <div className="flex gap-3">
                {currentVariant.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(index)}
                    className={`size-12 rounded-full border-2 transition-all active:scale-95 ${
                      selectedColor === index
                        ? 'border-black ring-2 ring-black ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: color.hex,
                      boxShadow: color.hex === '#FFFFFF' ? 'inset 0 0 0 1px rgba(0,0,0,0.1)' : undefined,
                    }}
                    title={color.name}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="mb-2">{product.name}</h1>
              <p className="text-gray-600">{currentVariant.name} - {currentColor.name}</p>
            </div>

            <Separator />

            {/* Key Product Info Icons */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Ruler className="size-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fit Type</p>
                  <p className="font-medium">{product.fitType}</p>
                </div>
              </div>

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

              <div className="flex items-start gap-3">
                <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Weight className="size-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Weight</p>
                  <p className="font-medium">{product.weight}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Fit Description */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm">
                <span className="font-medium">Fit: </span>
                {product.fitDescription}
              </p>
            </div>

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

              {/* Adult Sizes */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Adult Sizes</p>
                <div className="grid grid-cols-7 gap-2">
                  {product.sizes.adult.map((size) => {
                    const xlCount = (size.match(/X/g) || []).length;
                    const hasSurcharge = xlCount >= 2;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2.5 px-2 border-2 rounded-lg transition-all active:scale-95 text-sm relative ${
                          selectedSize === size
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {size}
                        {hasSurcharge && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded">
                            +₱{product.xlSurcharge * (xlCount - 1)}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {product.xlSurcharge > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    * XL and above: Add ₱{product.xlSurcharge} per X
                  </p>
                )}
              </div>

              {/* Kids Sizes */}
              {product.sizes.kids.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Kids Sizes</p>
                  <div className="grid grid-cols-7 gap-2">
                    {product.sizes.kids.map((size) => (
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
              )}
            </div>

            <Separator />

            {/* Quantity & Order Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Quantity</p>
                <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg w-full">
                  <button
                    onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors active:scale-95"
                    disabled={quantity <= product.minOrder}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || product.minOrder;
                      setQuantity(Math.min(Math.max(val, product.minOrder), product.maxOrder));
                    }}
                    className="flex-1 text-center font-medium outline-none"
                    min={product.minOrder}
                    max={product.maxOrder}
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.maxOrder, quantity + 1))}
                    className="px-4 py-3 hover:bg-gray-100 transition-colors active:scale-95"
                    disabled={quantity >= product.maxOrder}
                  >
                    +
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min: {product.minOrder} | Max: {product.maxOrder}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Min Order</p>
                    <p className="text-sm font-medium">{product.minOrder} pcs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Turnaround</p>
                    <p className="text-sm font-medium">{product.turnaroundTime}</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 bg-black text-white hover:bg-black/90 transition-transform active:scale-95"
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

            {/* Print Areas */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium mb-2">Available Print Areas:</p>
              <div className="flex flex-wrap gap-2">
                {product.printAreas.map((area) => (
                  <Badge key={area} variant="secondary" className="bg-white">
                    {area}
                  </Badge>
                ))}
              </div>
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
                value="pricing"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent px-6 py-3"
              >
                Pricing & Print Options
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

            <TabsContent value="pricing" className="mt-8">
              <div className="max-w-4xl">
                <h3 className="mb-6">Pricing per Print Type</h3>
                
                {/* Pricing Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-6 py-4 font-medium">Print Type</th>
                        <th className="text-right px-6 py-4 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.pricing.map((tier, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">{tier.printType}</td>
                          <td className="px-6 py-4 text-right font-medium">
                            ₱{tier.price.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Prices shown are base prices for standard sizes (XS-L). 
                    Additional charges apply for XL and above sizes.
                  </p>
                </div>
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
                      <p className="text-sm text-gray-500 mb-1">Fit Type</p>
                      <p className="font-medium">{product.fitType}</p>
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
                      <p className="text-sm text-gray-500 mb-1">Weight</p>
                      <p className="font-medium">{product.weight}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Available Sizes</p>
                      <p className="font-medium">
                        {product.sizes.adult.join(', ')}
                        {product.sizes.kids.length > 0 && `, ${product.sizes.kids.join(', ')}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Minimum Order</p>
                      <p className="font-medium">{product.minOrder} pieces</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Turnaround Time</p>
                      <p className="font-medium">{product.turnaroundTime}</p>
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
