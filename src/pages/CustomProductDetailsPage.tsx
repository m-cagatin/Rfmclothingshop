import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, ShoppingCart, Heart, Share2, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';

interface CustomProductData {
  id: string;
  name: string;
  category: string;
  color: string;
  sizes: string[];
  image: string;
  description: string;
  material: string;
  weight: string;
  careInstructions: string[];
  pricing: {
    noPrint: number;
    frontPrint: number;
    backPrint: number;
  };
  features: string[];
  printAreas: string[];
  rating: number;
  reviews: number;
}

export function CustomProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrintOption, setSelectedPrintOption] = useState<'noPrint' | 'frontPrint' | 'backPrint'>('noPrint');
  const [quantity, setQuantity] = useState(1);
  const [isSpecsOpen, setIsSpecsOpen] = useState(true);
  const [isPrintInfoOpen, setIsPrintInfoOpen] = useState(true);
  const [isCareOpen, setIsCareOpen] = useState(false);

  // Mock data - in real app, fetch based on ID
  const productsData: Record<string, CustomProductData> = {
    '1': {
      id: '1',
      name: 'Classic Black Varsity',
      category: 'Varsity Jackets',
      color: 'Black',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1588011025378-15f4778d2558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwYmxhY2t8ZW58MXx8fHwxNzYzNjU1NjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Premium quality varsity jacket with classic design. Perfect for custom printing and personalization. Made with high-quality materials for long-lasting wear.',
      material: '80% Cotton, 20% Polyester fleece',
      weight: '450 GSM',
      careInstructions: [
        'Machine wash cold',
        'Do not bleach',
        'Tumble dry low',
        'Iron on low heat if needed',
        'Do not dry clean'
      ],
      pricing: {
        noPrint: 350,
        frontPrint: 450,
        backPrint: 500
      },
      features: [
        'Customizable print areas',
        'Ribbed collar and cuffs',
        'Snap button closure',
        'Side pockets',
        'Comfortable fit'
      ],
      printAreas: ['Front chest', 'Full back', 'Sleeves (optional)'],
      rating: 4.8,
      reviews: 142
    },
    '2': {
      id: '2',
      name: 'White Premium Edition',
      category: 'Varsity Jackets',
      color: 'White',
      sizes: ['S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1760458955495-9712cc8f79c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwd2hpdGV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Elegant white varsity jacket with premium finish. Ideal for vibrant custom designs. Stand out with this modern classic.',
      material: '85% Cotton, 15% Polyester blend',
      weight: '420 GSM',
      careInstructions: [
        'Machine wash cold with similar colors',
        'Use mild detergent',
        'Tumble dry low',
        'Iron inside out',
        'Avoid harsh chemicals'
      ],
      pricing: {
        noPrint: 380,
        frontPrint: 480,
        backPrint: 530
      },
      features: [
        'Premium white fabric',
        'Stain-resistant coating',
        'Button closure',
        'Elastic waistband',
        'Regular fit'
      ],
      printAreas: ['Front chest', 'Full back'],
      rating: 4.6,
      reviews: 98
    },
    '3': {
      id: '3',
      name: 'Navy Blue Classic',
      category: 'Varsity Jackets',
      color: 'Navy Blue',
      sizes: ['M', 'L', 'XL', '2XL', '3XL'],
      image: 'https://images.unsplash.com/photo-1639270601211-9265bafae0f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwbmF2eSUyMGJsdWV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Classic navy blue varsity jacket with timeless appeal. Perfect canvas for custom artwork and team logos.',
      material: '80% Cotton, 20% Polyester',
      weight: '460 GSM',
      careInstructions: [
        'Machine wash cold',
        'Do not bleach',
        'Tumble dry medium',
        'Iron on medium heat',
        'Can be dry cleaned'
      ],
      pricing: {
        noPrint: 360,
        frontPrint: 460,
        backPrint: 510
      },
      features: [
        'Classic navy color',
        'Durable construction',
        'Snap buttons',
        'Two front pockets',
        'Comfortable fit'
      ],
      printAreas: ['Front chest', 'Full back'],
      rating: 4.9,
      reviews: 215
    },
    '4': {
      id: '4',
      name: 'Gray Heather Varsity',
      category: 'Varsity Jackets',
      color: 'Gray',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      image: 'https://images.unsplash.com/photo-1715408153725-186c6c77fb45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JheXxlbnwxfHx8fDE3NjM2NTU2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Modern gray heather varsity jacket with contemporary style. Excellent for custom team designs and personal branding.',
      material: '75% Cotton, 25% Polyester fleece',
      weight: '440 GSM',
      careInstructions: [
        'Machine wash cold',
        'Use color-safe detergent',
        'Tumble dry low',
        'Do not iron prints',
        'Store in cool, dry place'
      ],
      pricing: {
        noPrint: 370,
        frontPrint: 470,
        backPrint: 520
      },
      features: [
        'Heather gray finish',
        'Soft interior lining',
        'Button closure',
        'Ribbed details',
        'Athletic fit'
      ],
      printAreas: ['Front chest', 'Full back'],
      rating: 4.7,
      reviews: 167
    },
    '5': {
      id: '5',
      name: 'Forest Green Limited',
      category: 'Varsity Jackets',
      color: 'Green',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      image: 'https://images.unsplash.com/photo-1727063165870-0a1bc4c75240?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JlZW58ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Limited edition forest green varsity jacket. Stand out with this unique color perfect for nature-inspired custom designs.',
      material: '80% Organic Cotton, 20% Recycled Polyester',
      weight: '455 GSM',
      careInstructions: [
        'Machine wash cold separately',
        'Eco-friendly detergent recommended',
        'Air dry preferred',
        'Low iron if needed',
        'Do not bleach'
      ],
      pricing: {
        noPrint: 390,
        frontPrint: 490,
        backPrint: 540
      },
      features: [
        'Limited edition color',
        'Eco-friendly materials',
        'Snap closure',
        'Dual pockets',
        'Sustainable production'
      ],
      printAreas: ['Front chest'],
      rating: 4.5,
      reviews: 89
    },
    '6': {
      id: '6',
      name: 'Red Sport Edition',
      category: 'Varsity Jackets',
      color: 'Red',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
      image: 'https://images.unsplash.com/photo-1761439703714-b9dd3ef8af4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwcmVkfGVufDF8fHx8MTc2MzY1NTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      description: 'Bold red sport edition varsity jacket. Perfect for teams and groups wanting to make a statement with custom designs.',
      material: '82% Cotton, 18% Polyester performance blend',
      weight: '470 GSM',
      careInstructions: [
        'Machine wash cold',
        'Color-safe detergent only',
        'Tumble dry low',
        'Iron on low heat',
        'Avoid direct sunlight when drying'
      ],
      pricing: {
        noPrint: 400,
        frontPrint: 500,
        backPrint: 550
      },
      features: [
        'Bold red color',
        'Performance fabric',
        'Snap buttons',
        'Reinforced stitching',
        'Athletic cut'
      ],
      printAreas: ['Front chest', 'Full back', 'Sleeves (optional)'],
      rating: 4.9,
      reviews: 203
    }
  };

  const product = id ? productsData[id] : productsData['1'];

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Button onClick={() => navigate('/custom-design')}>Back to Design</Button>
        </div>
      </div>
    );
  }

  const currentPrice = product.pricing[selectedPrintOption];

  const colorMap: Record<string, string> = {
    'Black': '#1a1a1a',
    'White': '#ffffff',
    'Navy Blue': '#1e3a8a',
    'Gray': '#6b7280',
    'Green': '#16a34a',
    'Red': '#dc2626',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/custom-design')} className="gap-2">
            <ArrowLeft className="size-4" />
            Back to Design Studio
          </Button>
          <div className="text-sm text-gray-600">Customizable Product Details</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Image */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg aspect-square">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail gallery placeholder */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <button
                  key={i}
                  className="w-20 h-20 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors overflow-hidden"
                >
                  <img 
                    src={product.image} 
                    alt={`View ${i}`}
                    className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="text-sm text-gray-500 mb-2">{product.category}</div>
              <h1 className="text-3xl mb-3">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-sm mb-3">Color: {product.color}</h3>
              <div className="flex items-center gap-3">
                <div
                  className="size-16 rounded-lg border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: colorMap[product.color] }}
                />
              </div>
            </div>

            {/* Print Options with Pricing */}
            <div>
              <h3 className="text-sm mb-3">Select Print Option</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedPrintOption('noPrint')}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 transition-all ${
                    selectedPrintOption === 'noPrint'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPrintOption === 'noPrint' ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedPrintOption === 'noPrint' && (
                        <div className="size-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <span>No Print</span>
                  </div>
                  <span className="font-medium">PHP {product.pricing.noPrint}.00</span>
                </button>

                <button
                  onClick={() => setSelectedPrintOption('frontPrint')}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 transition-all ${
                    selectedPrintOption === 'frontPrint'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPrintOption === 'frontPrint' ? 'border-green-500' : 'border-gray-300'
                    }`}>
                      {selectedPrintOption === 'frontPrint' && (
                        <div className="size-3 rounded-full bg-green-500" />
                      )}
                    </div>
                    <span>Front Print</span>
                  </div>
                  <span className="font-medium">PHP {product.pricing.frontPrint}.00</span>
                </button>

                <button
                  onClick={() => setSelectedPrintOption('backPrint')}
                  className={`w-full flex items-center justify-between py-3 px-4 rounded-lg border-2 transition-all ${
                    selectedPrintOption === 'backPrint'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPrintOption === 'backPrint' ? 'border-purple-500' : 'border-gray-300'
                    }`}>
                      {selectedPrintOption === 'backPrint' && (
                        <div className="size-3 rounded-full bg-purple-500" />
                      )}
                    </div>
                    <span>Back Print</span>
                  </div>
                  <span className="font-medium">PHP {product.pricing.backPrint}.00</span>
                </button>
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm mb-3">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg border-2 transition-all min-w-[60px] ${
                      selectedSize === size
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="size-10"
                >
                  -
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="size-10"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Price and Actions */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl">PHP {currentPrice * quantity}.00</span>
                {quantity > 1 && (
                  <span className="text-sm text-gray-500">
                    (PHP {currentPrice}.00 each)
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <Button 
                  className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => navigate('/custom-design')}
                >
                  <ShoppingCart className="size-4 mr-2" />
                  Add to Customize
                </Button>
                <Button variant="outline" size="icon" className="size-12">
                  <Heart className="size-5" />
                </Button>
                <Button variant="outline" size="icon" className="size-12">
                  <Share2 className="size-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Sections */}
        <div className="mt-12 max-w-4xl">
          <div className="bg-white rounded-2xl shadow-sm border divide-y">
            {/* Specifications */}
            <Collapsible open={isSpecsOpen} onOpenChange={setIsSpecsOpen}>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <h3 className="text-lg">Product Specifications</h3>
                {isSpecsOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Material</div>
                    <div>{product.material}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Weight</div>
                    <div>{product.weight}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Color</div>
                    <div>{product.color}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Available Sizes</div>
                    <div>{product.sizes.join(', ')}</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="text-sm text-gray-500 mb-2">Features</div>
                  <ul className="list-disc list-inside space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">{feature}</li>
                    ))}
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Print Information */}
            <Collapsible open={isPrintInfoOpen} onOpenChange={setIsPrintInfoOpen}>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <h3 className="text-lg">Customization & Print Information</h3>
                {isPrintInfoOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Available Print Areas</div>
                    <ul className="list-disc list-inside space-y-1">
                      {product.printAreas.map((area, index) => (
                        <li key={index} className="text-gray-700">{area}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500 mb-2">Pricing Options</div>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2 px-3 bg-blue-50 rounded">
                        <span>No Print (Base Price)</span>
                        <span>PHP {product.pricing.noPrint}.00</span>
                      </div>
                      <div className="flex justify-between py-2 px-3 bg-green-50 rounded">
                        <span>Front Print</span>
                        <span>PHP {product.pricing.frontPrint}.00</span>
                      </div>
                      <div className="flex justify-between py-2 px-3 bg-purple-50 rounded">
                        <span>Back Print</span>
                        <span>PHP {product.pricing.backPrint}.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Tip:</strong> Higher quality designs work best with resolutions of 300 DPI or higher. 
                      Our design studio will guide you through the customization process.
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Care Instructions */}
            <Collapsible open={isCareOpen} onOpenChange={setIsCareOpen}>
              <CollapsibleTrigger className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <h3 className="text-lg">Care Instructions</h3>
                {isCareOpen ? <ChevronUp className="size-5" /> : <ChevronDown className="size-5" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4">
                <ul className="list-disc list-inside space-y-2">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index} className="text-gray-700">{instruction}</li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomProductDetailsPage;
