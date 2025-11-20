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

export function CustomDesignPage() {
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState('edit');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isProductionCostOpen, setIsProductionCostOpen] = useState(false);
  const [isPrintAreaOpen, setIsPrintAreaOpen] = useState(true);
  const [isRecommendedSizesOpen, setIsRecommendedSizesOpen] = useState(true);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');

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
            <Button variant="outline" size="sm">
              My Clothing
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('edit')}
              className={activeTab === 'edit' ? 'bg-gray-800 hover:bg-gray-700' : ''}
            >
              Edit
            </Button>
            <Button
              variant={activeTab === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('preview')}
            >
              Preview
            </Button>
            <Button
              variant={activeTab === 'properties' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('properties')}
            >
              Properties
            </Button>
            <Button variant="ghost" size="icon" className="size-8 ml-2">
              <X className="size-4" />
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
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-sm mb-1">Small (12" × 16")</div>
                                <div className="text-xs text-gray-500">Chest print</div>
                              </button>

                              <button
                                onClick={() => setSelectedSize('medium')}
                                className={`border rounded-lg p-3 text-left transition-all ${
                                  selectedSize === 'medium'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-sm mb-1">Medium (16" × 20")</div>
                                <div className="text-xs text-gray-500">Standard</div>
                              </button>

                              <button
                                onClick={() => setSelectedSize('large')}
                                className={`border rounded-lg p-3 text-left transition-all ${
                                  selectedSize === 'large'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className="text-sm mb-1">Large (18" × 24")</div>
                                <div className="text-xs text-gray-500">Full front</div>
                              </button>

                              <button
                                onClick={() => setSelectedSize('oversized')}
                                className={`border rounded-lg p-3 text-left transition-all ${
                                  selectedSize === 'oversized'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
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

          {/* Canvas Area */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <Card className="bg-white p-12 shadow-lg w-full max-w-2xl">
              <div className="space-y-2">
                <div className="text-sm text-blue-600 mb-4">Print Area</div>
                <div 
                  className="border-2 border-dashed border-blue-400 rounded bg-blue-50/30 mx-auto"
                  style={{
                    width: '400px',
                    height: '500px',
                  }}
                />
              </div>
            </Card>
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