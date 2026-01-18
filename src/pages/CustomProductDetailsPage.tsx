import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Palette, 
  AlertCircle,
  Home,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useProductById } from '../hooks/useProductById';
import { useCustomizableProducts } from '../hooks/useCustomizableProducts';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { SizeSelector } from '../components/product/SizeSelector';
import { PrintOptionSelector } from '../components/product/PrintOptionSelector';
import { QuantitySelector } from '../components/product/QuantitySelector';

export function CustomProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading, error } = useProductById(id || '');
  const { products: allProducts } = useCustomizableProducts();

  const [selectedSize, setSelectedSize] = useState('');
  const [printOption, setPrintOption] = useState<'none' | 'front' | 'back'>('none');
  const [quantity, setQuantity] = useState(1);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!product) return 0;
    
    let price = product.retailPrice;
    
    // Add size surcharge
    if (selectedSize && product.sizePricing) {
      const surcharge = product.sizePricing[selectedSize] || 0;
      price += surcharge;
    }
    
    // Add print cost
    if (printOption === 'front' && product.frontPrintCost) {
      price += product.frontPrintCost;
    } else if (printOption === 'back' && product.backPrintCost) {
      price += product.backPrintCost;
    }
    
    return price * quantity;
  }, [product, selectedSize, printOption, quantity]);

  // Get related products (same category, different product)
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="size-12 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="size-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || 'The product you are looking for does not exist or has been removed.'}
            </p>
            <Button onClick={() => navigate('/custom-products')} className="bg-gray-800 hover:bg-gray-900">
              Browse All Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleStartCustomizing = () => {
    navigate('/custom-design', {
      state: { 
        selectedProduct: product,
        selectedSize,
        printOption 
      }
    });
  };

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    alert('Add to cart functionality coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors">
              <Home className="size-4" />
            </button>
            <ChevronRight className="size-4" />
            <button onClick={() => navigate('/custom-products')} className="hover:text-gray-900 transition-colors">
              Custom Products
            </button>
            <ChevronRight className="size-4" />
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Left Column - Images */}
          <div>
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">{product.type}</Badge>
              </div>
              
              <h1 className="text-3xl mb-2">{product.name}</h1>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            )}

            {/* Fit Information */}
            {(product.fitType || product.fitDescription) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-1">
                  Fit: {product.fitType || 'Standard'}
                </h3>
                {product.fitDescription && (
                  <p className="text-sm text-blue-800">{product.fitDescription}</p>
                )}
              </div>
            )}

            {/* Color/Variant Display */}
            {product.differentiationType === 'color' && product.color && (
              <div>
                <h3 className="text-sm font-medium mb-3">Color: {product.color.name}</h3>
                <div className="flex items-center gap-3">
                  <div
                    className="size-16 rounded-lg border-2 border-gray-300 shadow-sm"
                    style={{ backgroundColor: product.color.hexCode || '#cccccc' }}
                    title={product.color.name}
                  />
                  <span className="text-sm text-gray-600">{product.color.name}</span>
                </div>
              </div>
            )}

            {product.differentiationType === 'variant' && product.variant && (
              <div>
                <h3 className="text-sm font-medium mb-2">Variant</h3>
                <Badge variant="outline" className="text-base px-4 py-2">
                  {product.variant.name}
                </Badge>
              </div>
            )}

            {/* Size Selection */}
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSizeSelect={setSelectedSize}
              sizeAvailability={product.sizeAvailability}
              sizePricing={product.sizePricing}
            />

            {/* Print Options */}
            <PrintOptionSelector
              basePrice={product.retailPrice}
              frontPrintCost={product.frontPrintCost || 0}
              backPrintCost={product.backPrintCost || 0}
              selectedOption={printOption}
              onOptionSelect={setPrintOption}
            />

            {/* Quantity */}
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              minQuantity={product.minOrderQuantity}
              maxQuantity={100}
            />

            {/* Price and Actions */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Price</div>
                  <div className="text-3xl font-medium">PHP {totalPrice.toFixed(2)}</div>
                  {quantity > 1 && (
                    <div className="text-sm text-gray-500 mt-1">
                      PHP {(totalPrice / quantity).toFixed(2)} each
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 h-12 bg-gray-800 hover:bg-gray-900"
                  onClick={handleStartCustomizing}
                  disabled={!selectedSize}
                >
                  <Palette className="size-4 mr-2" />
                  Start Customizing
                </Button>
                <Button 
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {!selectedSize && (
                <p className="text-sm text-amber-600 text-center">
                  Please select a size to continue
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.fabricComposition && (
                <div>
                  <div className="text-sm text-gray-500">Material</div>
                  <div className="font-medium">{product.fabricComposition}</div>
                </div>
              )}
              {product.fabricWeight && (
                <div>
                  <div className="text-sm text-gray-500">Fabric Weight</div>
                  <div className="font-medium">{product.fabricWeight}</div>
                </div>
              )}
              {product.texture && (
                <div>
                  <div className="text-sm text-gray-500">Texture</div>
                  <div className="font-medium">{product.texture}</div>
                </div>
              )}
              {product.sizes.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500">Available Sizes</div>
                  <div className="font-medium">{product.sizes.join(', ')}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customization Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customization Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.printMethod && (
                <div>
                  <div className="text-sm text-gray-500">Print Method</div>
                  <div className="font-medium">{product.printMethod}</div>
                </div>
              )}
              {product.printAreas && product.printAreas.length > 0 && (
                <div>
                  <div className="text-sm text-gray-500">Available Print Areas</div>
                  <ul className="list-disc list-inside space-y-1">
                    {product.printAreas.map((area, idx) => (
                      <li key={idx} className="text-sm">{area}</li>
                    ))}
                  </ul>
                </div>
              )}
              {product.designRequirements && (
                <div>
                  <div className="text-sm text-gray-500">Design Requirements</div>
                  <div className="text-sm">{product.designRequirements}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Production Info */}
          <Card>
            <CardHeader>
              <CardTitle>Production & Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.turnaroundTime && (
                <div>
                  <div className="text-sm text-gray-500">Turnaround Time</div>
                  <div className="font-medium">{product.turnaroundTime}</div>
                </div>
              )}
              {product.minOrderQuantity && (
                <div>
                  <div className="text-sm text-gray-500">Minimum Order Quantity</div>
                  <div className="font-medium">{product.minOrderQuantity} piece(s)</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-sm text-gray-600">Base Price</span>
                <span className="font-medium">PHP {product.retailPrice.toFixed(2)}</span>
              </div>
              {product.frontPrintCost != null && product.frontPrintCost > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Front Print</span>
                  <span className="font-medium">+ PHP {product.frontPrintCost.toFixed(2)}</span>
                </div>
              )}
              {product.backPrintCost != null && product.backPrintCost > 0 && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Back Print</span>
                  <span className="font-medium">+ PHP {product.backPrintCost.toFixed(2)}</span>
                </div>
              )}
              {product.sizePricing && Object.keys(product.sizePricing).length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Size Surcharges</div>
                  {Object.entries(product.sizePricing).map(([size, price]) => (
                    <div key={size} className="flex justify-between py-1 text-sm">
                      <span className="text-gray-600">{size}</span>
                      <span>+ PHP {price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card 
                  key={relatedProduct.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/custom-product/${relatedProduct.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gray-100 overflow-hidden rounded-t-lg">
                      {relatedProduct.images[0] && (
                        <img
                          src={relatedProduct.images[0].url}
                          alt={relatedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2">{relatedProduct.category}</Badge>
                      <h3 className="font-medium mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <p className="text-lg font-medium">PHP {relatedProduct.retailPrice.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomProductDetailsPage;
