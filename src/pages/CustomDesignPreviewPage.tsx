import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, ShoppingCart, Download, Edit3, AlertCircle, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { downloadCanvas } from '../utils/canvasExport';
import { useAuth } from '../contexts/AuthContext';

interface DesignState {
  designData: string; // Canvas JSON
  variant: {
    id: string;
    productId: string;
    productName: string;
    variantName: string;
    size: string;
    image: string;
    retailPrice: number;
    totalPrice: number;
  };
  view: 'front' | 'back';
  printAreaSize: string;
  previewImage: string; // Base64 data URL
  timestamp: number;
}

export function CustomDesignPreviewPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useAuth();
  
  const [designState, setDesignState] = useState<DesignState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [designName, setDesignName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load design state from navigation
  useEffect(() => {
    const state = location.state as DesignState;
    
    if (!state || !state.designData || !state.variant) {
      toast.error('No design data found');
      navigate('/custom-design');
      return;
    }

    setDesignState(state);
    setIsLoading(false);
  }, [location.state, navigate]);

  // Handle download design
  const handleDownload = () => {
    if (!designState) return;
    
    try {
      // Create download link from preview image
      const link = document.createElement('a');
      link.download = `${designState.variant.productName}-design.png`;
      link.href = designState.previewImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Design downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download design');
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!designState) return;

    try {
      // Get existing cart from localStorage
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Create cart item
      const cartItem = {
        id: `custom-${Date.now()}`,
        type: 'custom',
        productId: designState.variant.productId,
        productName: designState.variant.productName,
        variantName: designState.variant.variantName,
        size: designState.variant.size,
        image: designState.variant.image,
        price: designState.variant.totalPrice,
        quantity: 1,
        customization: {
          designData: designState.designData,
          view: designState.view,
          printAreaSize: designState.printAreaSize,
          previewImage: designState.previewImage,
        },
        timestamp: designState.timestamp,
      };

      // Add to cart
      existingCart.push(cartItem);
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      toast.success('Added to cart');
      
      // Navigate to cart or home
      navigate('/');
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  };

  // Handle edit design
  const handleEdit = () => {
    navigate('/custom-design', {
      state: {
        returnFromPreview: true,
      },
    });
  };

  // Handle save to library
  const handleSaveToLibrary = async () => {
    if (!user) {
      toast.error('Please log in to save designs');
      return;
    }

    if (!designState) {
      toast.error('No design to save');
      return;
    }

    if (!designName.trim()) {
      toast.error('Please enter a design name');
      return;
    }

    setIsSaving(true);

    try {
      const API_BASE = import.meta.env['VITE_API_BASE'] || 'http://localhost:4000';
      
      const response = await fetch(`${API_BASE}/api/saved-designs/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.id,
          customizableProductId: parseInt(designState.variant.productId),
          designName: designName.trim(),
          selectedSize: designState.variant.size,
          selectedPrintOption: designState.view === 'front' ? 'front' : 'back',
          printAreaPreset: designState.printAreaSize,
          frontCanvasJson: designState.view === 'front' ? designState.designData : null,
          backCanvasJson: designState.view === 'back' ? designState.designData : null,
          frontThumbnailUrl: designState.view === 'front' ? designState.previewImage : null,
          backThumbnailUrl: designState.view === 'back' ? designState.previewImage : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save design');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Design saved to My Library!');
        setShowSaveModal(false);
        setDesignName('');
      } else {
        throw new Error(result.message || 'Failed to save design');
      }
    } catch (error) {
      console.error('Save to library error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save design to library');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!designState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="size-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl mb-2">No Design Data</h2>
          <p className="text-gray-600 mb-6">Please create a design first</p>
          <Button onClick={() => navigate('/custom-design')}>
            Go to Designer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleEdit}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl">Preview Your Design</h1>
              <p className="text-sm text-gray-600">Review before adding to cart</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="size-4 mr-2" />
              Download
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit3 className="size-4 mr-2" />
              Edit Design
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="bg-white rounded-xl border shadow-sm p-8">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {/* Product Mockup Image */}
              <img 
                src={designState.variant.image} 
                alt={designState.variant.productName}
                className="w-full h-full object-contain"
              />
              
              {/* Design Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <img 
                  src={designState.previewImage}
                  alt="Design"
                  className="max-w-[60%] max-h-[60%] object-contain"
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                  }}
                />
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {designState.view === 'front' ? 'Front' : 'Back'} View • {designState.printAreaSize} Print Area
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h2 className="text-2xl mb-4">{designState.variant.productName}</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Variant:</span>
                  <span className="font-medium">{designState.variant.variantName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">{designState.variant.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Print Side:</span>
                  <span className="font-medium capitalize">{designState.view}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Print Area:</span>
                  <span className="font-medium">{designState.printAreaSize}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <h3 className="text-lg mb-4">Price Summary</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price:</span>
                  <span>PHP {designState.variant.retailPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Customization:</span>
                  <span>PHP {(designState.variant.totalPrice - designState.variant.retailPrice).toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center">
                  <span className="text-lg font-medium">Total:</span>
                  <span className="text-2xl font-bold">PHP {designState.variant.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-3">
              <Button 
                className="w-full h-12 text-base bg-green-600 hover:bg-green-700"
                onClick={() => setShowSaveModal(true)}
              >
                <Save className="size-5 mr-2" />
                Save to My Library
              </Button>

              <Button 
                className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="size-5 mr-2" />
                Add to Cart
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12 text-base"
                onClick={handleEdit}
              >
                <Edit3 className="size-5 mr-2" />
                Continue Editing
              </Button>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Tip:</strong> Save your design to My Library before adding to cart. You can reuse saved designs anytime!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Library Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Save to My Library</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Design Name
                </label>
                <input
                  type="text"
                  value={designName}
                  onChange={(e) => setDesignName(e.target.value)}
                  placeholder="e.g., My Awesome T-Shirt"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSaving) {
                      handleSaveToLibrary();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Give your design a memorable name
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowSaveModal(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleSaveToLibrary}
                  disabled={isSaving || !designName.trim()}
                >
                  {isSaving ? (
                    <>
                      <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDesignPreviewPage;