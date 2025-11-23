import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { 
  ArrowLeft,
  ArrowRight,
  Info,
  X,
  MousePointer2,
  Square,
  Circle,
  Type,
  Image as ImageIcon,
  Layers,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Maximize,
  Upload,
  Grid3x3
} from 'lucide-react';

type ViewSide = 'front' | 'back';

interface ClothingProduct {
  id: string;
  name: string;
  color: string;
  sizes: string[];
  image: string;
  noPrint: boolean;
  frontPrint: boolean;
  backPrint: boolean;
}

interface LayerItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  image: string;
  variants: {
    view: ViewSide;
    design: string;
  }[];
}

export function CustomDesignPage() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('edit');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isClothingPanelOpen, setIsClothingPanelOpen] = useState(false);
  const [isProductionCostOpen, setIsProductionCostOpen] = useState(false);
  const [isPrintAreaOpen, setIsPrintAreaOpen] = useState(true);
  const [isRecommendedSizesOpen, setIsRecommendedSizesOpen] = useState(true);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [selectedView, setSelectedView] = useState<ViewSide>('front');
  const [layers, setLayers] = useState<LayerItem[]>([]);

  const handleAddToCustomize = (product: ClothingProduct) => {
    const newLayer: LayerItem = {
      id: `${product.id}-${Date.now()}`,
      productName: product.name,
      color: product.color,
      size: product.sizes[0] || 'M',
      image: product.image,
      variants: []
    };
    setLayers((prev) => [...prev, newLayer]);
    // Don't close the panel anymore
  };

  // Mock clothing products
  const clothingProducts: ClothingProduct[] = [
    { 
      id: '1', 
      name: 'Classic Black Varsity', 
      color: 'Black', 
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'], 
      image: 'https://images.unsplash.com/photo-1588011025378-15f4778d2558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwYmxhY2t8ZW58MXx8fHwxNzYzNjU1NjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true
    },
    { 
      id: '2', 
      name: 'White Premium Edition', 
      color: 'White', 
      sizes: ['S', 'M', 'L', 'XL'], 
      image: 'https://images.unsplash.com/photo-1760458955495-9712cc8f79c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwd2hpdGV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true
    },
    { 
      id: '3', 
      name: 'Navy Blue Classic', 
      color: 'Navy Blue', 
      sizes: ['M', 'L', 'XL', '2XL', '3XL'], 
      image: 'https://images.unsplash.com/photo-1639270601211-9265bafae0f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwbmF2eSUyMGJsdWV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: false
    },
    { 
      id: '4', 
      name: 'Gray Heather Varsity', 
      color: 'Gray', 
      sizes: ['XS', 'S', 'M', 'L', 'XL'], 
      image: 'https://images.unsplash.com/photo-1715408153725-186c6c77fb45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JheXxlbnwxfHx8fDE3NjM2NTU2NzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: false,
      frontPrint: true,
      backPrint: true
    },
    { 
      id: '5', 
      name: 'Forest Green Limited', 
      color: 'Green', 
      sizes: ['S', 'M', 'L', 'XL', '2XL'], 
      image: 'https://images.unsplash.com/photo-1727063165870-0a1bc4c75240?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwZ3JlZW58ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: false,
      backPrint: true
    },
    { 
      id: '6', 
      name: 'Red Sport Edition', 
      color: 'Red', 
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'], 
      image: 'https://images.unsplash.com/photo-1761439703714-b9dd3ef8af4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwcmVkfGVufDF8fHx8MTc2MzY1NTY3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      noPrint: true,
      frontPrint: true,
      backPrint: true
    },
  ];

  const leftTools = [
    { id: 'back', icon: ArrowLeft, label: 'Back' },
    { id: 'upload', icon: Upload, label: 'Upload Image' },
    { id: 'text', icon: Type, label: 'Add Text' },
    { id: 'library', icon: Layers, label: 'My Library' },
    { id: 'graphics', icon: ImageIcon, label: 'Graphics' },
    { id: 'templates', icon: FolderOpen, label: 'My Templates' },
    { id: 'patterns', icon: Grid3x3, label: 'Patterns/Textures' },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'back') {
      navigate('/');
    } else {
      setActiveTool(toolId);
    }
  };

  return (
    <div className="h-screen flex bg-gray-100 overflow-x-hidden">
      {/* Left Vertical Toolbar - Spans full height */}
      <div className="bg-white border-r w-20 flex flex-col items-center py-6 gap-4 z-10">
        {leftTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 transition-colors group ${
                activeTool === tool.id
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="size-5" />
              <span className={`text-[10px] text-center leading-tight ${
                activeTool === tool.id ? '' : 'text-gray-500'
              }`}>
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right side: Top bar, content, and bottom bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsPanelOpen(true)}>
              <Info className="size-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsClothingPanelOpen(true)}
              className={`${isClothingPanelOpen ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              My Clothing
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={'default'}
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/custom-design-preview')}
              className="hover:bg-gray-100 hover:text-gray-900"
            >
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('layers')}
              className={`relative ${activeTab === 'layers' ? 'bg-gray-800 text-white hover:bg-gray-700 hover:text-white' : 'hover:bg-gray-100 hover:text-gray-900'}`}
            >
              Layers
              {layers.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs size-5 rounded-full flex items-center justify-center">
                  {layers.length}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Product Information Panel - Absolute positioned overlay */}
          {isPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r w-[320px] overflow-y-auto z-20 shadow-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg">Product Information</h2>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => setIsPanelOpen(false)}>
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Product Name and Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-name" className="text-xs text-gray-600">
                        [Product Name]
                      </Label>
                      <Input
                        id="product-name"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product-category" className="text-xs text-gray-600">
                        [Product category]
                      </Label>
                      <Input
                        id="product-category"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>

                  {/* Product Image and Stock */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="border rounded-lg aspect-square flex items-center justify-center bg-gray-50">
                        <span className="text-xs text-gray-400">[Product Image]</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-sm">Product In-stock</span>
                    </div>
                  </div>

                  {/* Production Cost */}
                  <Collapsible open={isProductionCostOpen} onOpenChange={setIsProductionCostOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                        <span className="text-sm">Production Cost: PHP 0.00</span>
                        {isProductionCostOpen ? (
                          <ChevronUp className="size-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="size-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      {/* Add production cost details here if needed */}
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="border-t pt-6">
                    {/* Print Area Configuration */}
                    <Collapsible open={isPrintAreaOpen} onOpenChange={setIsPrintAreaOpen}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent mb-4">
                          <div className="flex items-center gap-2">
                            <Maximize className="size-4" />
                            <span className="text-sm">Print Area Configuration</span>
                          </div>
                          {isPrintAreaOpen ? (
                            <ChevronUp className="size-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="size-4 text-gray-500" />
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      <CollapsibleContent className="space-y-4">
                        {/* Current Size */}
                        <div className="bg-gray-50 border rounded-lg p-3 flex items-center justify-between">
                          <span className="text-xs text-gray-600">Current Size:</span>
                          <span className="text-xs">400 × 500 px</span>
                        </div>

                        {/* Recommended Sizes */}
                        <Collapsible open={isRecommendedSizesOpen} onOpenChange={setIsRecommendedSizesOpen}>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                              <span className="text-sm">Recommended Sizes</span>
                              {isRecommendedSizesOpen ? (
                                <ChevronUp className="size-4 text-gray-500" />
                              ) : (
                                <ChevronDown className="size-4 text-gray-500" />
                              )}
                            </Button>
                          </CollapsibleTrigger>

                          <CollapsibleContent className="pt-4">
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => setSelectedSize('small')}
                                className={`border rounded-lg p-3 text-left transition-all ${
                                  selectedSize === 'small'
                                    ? 'border-gray-800 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-sm mb-1">Small (12" × 16")</div>
                                <div className="text-xs text-gray-500">Chest print</div>
                              </button>

                              <button
                                onClick={() => setSelectedSize('medium')}
                                className={`border rounded-lg p-3 text-left transition-all ${
                                  selectedSize === 'medium'
                                    ? 'border-gray-800 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-sm mb-1">Medium (16" × 20")</div>
                                <div className="text-xs text-gray-500">Standard</div>
                              </button>

                              <button
                                onClick={() => setSelectedSize('large')}
                                className={`border rounded-lg p-3 text-left transition-all ${
                                  selectedSize === 'large'
                                    ? 'border-gray-800 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-sm mb-1">Large (18" × 24")</div>
                                <div className="text-xs text-gray-500">Full front</div>
                              </button>

                              <button
                                onClick={() => setSelectedSize('oversized')}
                                className={`border rounded-lg p-3 text-left transition-all ${
                                  selectedSize === 'oversized'
                                    ? 'border-gray-800 bg-gray-50'
                                    : 'border-gray-200 hover:border-gray-400'
                                }`}
                              >
                                <div className="text-sm mb-1">Oversized (20" × 28")</div>
                                <div className="text-xs text-gray-500">All-over</div>
                              </button>
                            </div>

                            <Button variant="ghost" className="w-full mt-3 text-sm" size="sm">
                              + Custom Size
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Clothing Variants Panel - LEFT SIDE */}
          {isClothingPanelOpen && (
            <div className="absolute left-0 top-0 bottom-0 bg-white border-r border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl">Varsity Jacket Variants</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setIsClothingPanelOpen(false)}>
                      <X className="size-5" />
                    </Button>
                  </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-5">
                  {/* Custom Scrollbar Styling */}
                  <style>{`
                    .variants-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .variants-scroll::-webkit-scrollbar-track {
                      background: #f1f1f1;
                      border-radius: 4px;
                    }
                    .variants-scroll::-webkit-scrollbar-thumb {
                      background: #888;
                      border-radius: 4px;
                    }
                    .variants-scroll::-webkit-scrollbar-thumb:hover {
                      background: #555;
                    }
                  `}</style>
                  
                  <div className="variants-scroll h-full overflow-y-auto space-y-4">
                    {/* Product Cards - Single Column */}
                    {clothingProducts.map((product) => {
                      // Color mapping for display
                      const colorMap: Record<string, string> = {
                        'Black': '#1a1a1a',
                        'White': '#ffffff',
                        'Navy Blue': '#1e3a8a',
                        'Gray': '#6b7280',
                        'Green': '#16a34a',
                        'Red': '#dc2626',
                      };
                      const bgColor = colorMap[product.color] || '#d9d9d9';

                      return (
                        <div
                          key={product.id}
                          className="w-full bg-white border-2 border-gray-200 rounded-xl hover:border-gray-400 hover:shadow-lg transition-all"
                        >
                          <div className="p-4 space-y-3">
                            {/* Top Section: Image and Details */}
                            <div className="flex gap-4">
                              {/* Product Image */}
                              <div className="w-32 h-32 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Product Details */}
                              <div className="flex-1 space-y-2.5">
                                {/* Name */}
                                <h3 className="text-base hover:text-gray-900 transition-colors">
                                  {product.name}
                                </h3>

                                {/* Sizes */}
                                <div className="space-y-1">
                                  <span className="text-xs text-gray-500">Sizes:</span>
                                  <div className="flex flex-wrap gap-1.5">
                                    {product.sizes.map((size) => (
                                      <span
                                        key={size}
                                        className="px-2 py-0.5 text-xs bg-gray-100 border border-gray-300 rounded"
                                      >
                                        {size}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Color - Below Image */}
                            <div className="flex items-center gap-3 pl-1">
                              <div 
                                className="size-12 rounded-md border-2 border-gray-300 shadow-sm flex-shrink-0"
                                style={{ backgroundColor: bgColor }}
                              />
                              <div className="flex flex-col">
                                <span className="text-xs text-gray-500">Color</span>
                                <span className="text-sm text-gray-800">{product.color}</span>
                              </div>
                            </div>

                            {/* Print Options with Pricing - All Required */}
                            <div className="space-y-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                <span className="text-xs text-gray-700">No Print</span>
                                <span className="text-xs">PHP 350.00</span>
                              </div>
                              <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                <span className="text-xs text-gray-700">Front Print</span>
                                <span className="text-xs">PHP 450.00</span>
                              </div>
                              <div className="flex items-center justify-between py-1.5 px-2 bg-gray-50 border border-gray-200 rounded">
                                <span className="text-xs text-gray-700">Back Print</span>
                                <span className="text-xs">PHP 500.00</span>
                              </div>
                            </div>

                            {/* Bottom Action Buttons */}
                            <div className="flex items-center justify-between gap-2 pt-2">
                              <Button 
                                size="sm"
                                className="bg-gray-800 hover:bg-gray-700 text-white text-xs h-8"
                                onClick={() => handleAddToCustomize(product)}
                              >
                                Add to Customize
                              </Button>
                              <button 
                                onClick={() => navigate(`/custom-product/${product.id}`)}
                                className="text-xs text-gray-600 hover:text-gray-900 hover:underline"
                              >
                                More details →
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Layers Panel - RIGHT SIDE */}
          {activeTab === 'layers' && (
            <div className="absolute right-0 top-0 bottom-0 bg-white border-l border-gray-300 w-[480px] overflow-hidden z-20 shadow-xl">
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Layers className="size-5 text-gray-700" />
                      <h2 className="text-xl">Layers</h2>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8 hover:bg-gray-200" onClick={() => setActiveTab('edit')}>
                      <X className="size-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="size-2 rounded-full bg-blue-500"></div>
                    <span className="text-gray-600">{layers.length} {layers.length === 1 ? 'item' : 'items'} added</span>
                  </div>
                </div>

                {/* Scrollable Layers Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {layers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <Layers className="size-16 text-gray-300 mb-4" />
                      <p className="text-sm text-gray-600 mb-2">No layers yet</p>
                      <p className="text-xs text-gray-500">
                        Click "Add to Customize" in My Clothing to add items here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {layers.map((layer, index) => (
                        <div key={layer.id} className="border border-gray-200 rounded-lg overflow-hidden">
                          {/* Layer Header */}
                          <div className="bg-gray-50 p-3 flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                              <img src={layer.image} alt={layer.productName} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm truncate">{layer.productName}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{layer.color}</span>
                                <span>•</span>
                                <span>Size {layer.size}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">#{index + 1}</div>
                          </div>

                          {/* Variants/Designs */}
                          <div className="p-3 space-y-2">
                            {layer.variants.length === 0 ? (
                              <p className="text-xs text-gray-500 italic">No designs added yet</p>
                            ) : (
                              layer.variants.map((variant, vIndex) => (
                                <div
                                  key={vIndex}
                                  className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded text-xs"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="size-2 rounded-full bg-blue-500"></div>
                                    <span className="capitalize">{variant.view}</span>
                                  </div>
                                  <span className="text-gray-600">{variant.design}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                {layers.length > 0 && (
                  <div className="p-4 border-t border-gray-200">
                    <Button variant="outline" size="sm" className="w-full">
                      Clear All Layers
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex flex-col items-center justify-center bg-[#f5f4f0]">
            {/* T-Shirt Mockup with Design Area */}
            <div className="relative flex items-center justify-center mb-8">
              {/* T-Shirt Outline/Mockup */}
              <div className="relative w-[500px] h-[600px] flex items-center justify-center">
                {/* Simple T-Shirt SVG Outline */}
                <svg
                  viewBox="0 0 500 600"
                  className="w-full h-full"
                  style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
                >
                  {selectedView === 'front' && (
                    <>
                      {/* Front T-Shirt */}
                      <path
                        d="M 125 50 Q 125 40, 135 35 L 165 20 Q 175 15, 185 15 L 210 15 Q 220 15, 225 25 L 250 80 L 275 25 Q 280 15, 290 15 L 315 15 Q 325 15, 335 20 L 365 35 Q 375 40, 375 50 L 375 100 L 400 120 L 400 580 L 100 580 L 100 120 L 125 100 Z"
                        fill="white"
                        stroke="#1a1a1a"
                        strokeWidth="2"
                      />
                      {/* Neck opening */}
                      <ellipse cx="250" cy="70" rx="50" ry="20" fill="#e0e0e0" stroke="#1a1a1a" strokeWidth="1.5" />
                      {/* Sleeves detail */}
                      <line x1="100" y1="120" x2="130" y2="140" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
                      <line x1="400" y1="120" x2="370" y2="140" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
                    </>
                  )}
                  {selectedView === 'back' && (
                    <>
                      {/* Back T-Shirt */}
                      <path
                        d="M 125 50 Q 125 40, 135 35 L 165 20 Q 175 15, 185 15 L 210 15 Q 220 15, 225 25 L 250 55 L 275 25 Q 280 15, 290 15 L 315 15 Q 325 15, 335 20 L 365 35 Q 375 40, 375 50 L 375 100 L 400 120 L 400 580 L 100 580 L 100 120 L 125 100 Z"
                        fill="white"
                        stroke="#1a1a1a"
                        strokeWidth="2"
                      />
                      {/* Neck opening - simpler for back */}
                      <path d="M 210 40 Q 250 50, 290 40" fill="#e0e0e0" stroke="#1a1a1a" strokeWidth="1.5" />
                      {/* Sleeves detail */}
                      <line x1="100" y1="120" x2="130" y2="140" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
                      <line x1="400" y1="120" x2="370" y2="140" stroke="#1a1a1a" strokeWidth="1" opacity="0.3" />
                    </>
                  )}
                </svg>

                {/* Design Area Overlay (Dashed Rectangle) */}
                {selectedView !== 'neck' && (
                  <div
                    className="absolute border-2 border-dashed border-gray-800 rounded pointer-events-none"
                    style={{
                      width: '260px',
                      height: '330px',
                      top: selectedView === 'front' ? '180px' : '150px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    <div className="absolute -top-6 left-0 text-xs text-gray-600">Design Area</div>
                  </div>
                )}
              </div>
            </div>

            {/* View Switcher Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedView('front')}
                className={`px-6 py-2.5 rounded-full transition-all ${
                  selectedView === 'front'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Front side
              </button>
              <button
                onClick={() => setSelectedView('back')}
                className={`px-6 py-2.5 rounded-full transition-all ${
                  selectedView === 'back'
                    ? 'bg-gray-800 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Back side
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="bg-white border-t px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-sm min-w-[50px] text-center">{zoom}%</span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
            >
              <ZoomIn className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8 ml-1"
            >
              <Maximize2 className="size-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm">
            Reset view
          </Button>

          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            Save Product
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CustomDesignPage;