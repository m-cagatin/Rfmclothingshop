import { useState } from 'react';
import { Button } from './ui/button';
import { X, ShoppingCart, Download, Save } from 'lucide-react';
import { toast } from 'sonner';
import { exportCanvasToDataURL } from '../utils/canvasExport';
import { Canvas } from 'fabric';

// Type definitions
interface Variant {
  id: string;
  productId: string;
  productName: string;
  variantName: string;
  size: string;
  printOption: 'none' | 'front' | 'back';
  image: string;
  retailPrice: number;
  totalPrice: number;
  category?: string;
  images?: Array<{
    id?: number;
    url: string;
    publicId: string;
    type: 'front' | 'back' | 'additional';
    displayOrder: number;
  }>;
}

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  frontCanvas: Canvas | null;
  backCanvas: Canvas | null;
  activeView: 'front' | 'back';
  variant: Variant | null;
  selectedSize: string;
  printAreaSize: string;
  onAddToCart: () => Promise<void>;
  onSaveToLibrary: () => Promise<void>;
  getMockupImageUrl: (view: 'front' | 'back') => string | null;
}

export function PreviewModal({
  isOpen,
  onClose,
  frontCanvas,
  backCanvas,
  activeView,
  variant,
  selectedSize,
  printAreaSize,
  onAddToCart,
  onSaveToLibrary,
  getMockupImageUrl
}: PreviewModalProps) {
  const [currentView, setCurrentView] = useState<'front' | 'back'>(activeView);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !variant) return null;

  // Generate preview image for current view
  const getPreviewImage = () => {
    const canvas = currentView === 'front' ? frontCanvas : backCanvas;
    if (!canvas) return null;

    try {
      return exportCanvasToDataURL(canvas, {
        format: 'png',
        quality: 1,
        multiplier: 2
      });
    } catch (error) {
      console.error('Failed to export preview:', error);
      return null;
    }
  };

  const handleDownload = () => {
    const previewImage = getPreviewImage();
    if (!previewImage) {
      toast.error('Failed to generate preview image');
      return;
    }

    try {
      const link = document.createElement('a');
      link.download = `${variant.productName}-${currentView}.png`;
      link.href = previewImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Design downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download design');
    }
  };

  const handleAddToCartClick = async () => {
    setIsProcessing(true);
    try {
      await onAddToCart();
      onClose();
    } catch (error) {
      console.error('Add to cart error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveClick = async () => {
    setIsProcessing(true);
    try {
      await onSaveToLibrary();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const previewImage = getPreviewImage();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-semibold">Preview Your Design</h2>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={isProcessing}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preview Section */}
            <div className="bg-gray-100 rounded-lg p-8 relative">
              <div className="aspect-square relative">
                {/* Mockup */}
                <img
                  src={getMockupImageUrl(currentView) || ''}
                  alt={`${variant.productName} ${currentView}`}
                  className="w-full h-full object-contain"
                />

                {/* Design Overlay */}
                {previewImage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img
                      src={previewImage}
                      alt="Design"
                      className="max-w-[60%] max-h-[60%] object-contain"
                      style={{
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                      }}
                    />
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant={currentView === 'front' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('front')}
                  disabled={isProcessing}
                >
                  Front View
                </Button>
                <Button
                  size="sm"
                  variant={currentView === 'back' ? 'default' : 'outline'}
                  onClick={() => setCurrentView('back')}
                  disabled={isProcessing}
                >
                  Back View
                </Button>
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-xl mb-4">{variant.productName}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variant:</span>
                    <span className="font-medium">{variant.variantName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">{selectedSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Print Area:</span>
                    <span className="font-medium">{printAreaSize}</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg mb-4">Price Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price:</span>
                    <span>PHP {variant.retailPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Customization:</span>
                    <span>PHP {(variant.totalPrice - variant.retailPrice).toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-2xl font-bold">PHP {variant.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                  onClick={handleAddToCartClick}
                  disabled={isProcessing}
                >
                  <ShoppingCart className="size-5 mr-2" />
                  Add to Cart
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleSaveClick}
                  disabled={isProcessing}
                >
                  <Save className="size-5 mr-2" />
                  Save to Library
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  size="lg"
                  onClick={handleDownload}
                  disabled={isProcessing}
                >
                  <Download className="size-5 mr-2" />
                  Download Design
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
      </div>
    </div>
  );
}
