import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, ShoppingCart, Download, Share2, Edit3 } from 'lucide-react';

interface CustomizedItem {
  id: string;
  productName: string;
  color: string;
  size: string;
  image: string;
  frontDesign?: string;
  backDesign?: string;
  price: number;
}

export function CustomDesignPreviewPage() {
  const navigate = useNavigate();
  
  // Mock data - in real app, this would come from state management or API
  const [customizedItems] = useState<CustomizedItem[]>([
    {
      id: '1',
      productName: 'Classic Black Varsity',
      color: 'Black',
      size: 'L',
      image: 'https://images.unsplash.com/photo-1588011025378-15f4778d2558?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwYmxhY2t8ZW58MXx8fHwxNzYzNjU1NjcxfDA&ixlib=rb-4.1.0&q=80&w=1080',
      frontDesign: 'Custom Logo',
      price: 450
    },
    {
      id: '2',
      productName: 'White Premium Edition',
      color: 'White',
      size: 'M',
      image: 'https://images.unsplash.com/photo-1760458955495-9712cc8f79c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YXJzaXR5JTIwamFja2V0JTIwd2hpdGV8ZW58MXx8fHwxNzYzNjU1NjczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      frontDesign: 'Graphic Art',
      price: 480
    }
  ]);

  const totalPrice = customizedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/custom-design')}
            >
              <ArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="text-xl">Preview Your Designs</h1>
              <p className="text-sm text-gray-600">Review and finalize your customized items</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="size-4 mr-2" />
              Share
            </Button>
            <Button 
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 text-white"
              onClick={() => navigate('/custom-design')}
            >
              <Edit3 className="size-4 mr-2" />
              Back to Editor
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {customizedItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center size-20 rounded-full bg-gray-100 mb-4">
              <Edit3 className="size-10 text-gray-400" />
            </div>
            <h2 className="text-2xl mb-2">No customized items yet</h2>
            <p className="text-gray-600 mb-6">Start customizing your clothing in the editor</p>
            <Button onClick={() => navigate('/custom-design')}>
              Go to Editor
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Items List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customizedItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100">
                    <img 
                      src={item.image} 
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg mb-1">{item.productName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Color: {item.color}</span>
                        <span>•</span>
                        <span>Size: {item.size}</span>
                      </div>
                    </div>

                    {/* Customization Details */}
                    <div className="space-y-1.5 border-t pt-3">
                      {item.frontDesign && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Front Design:</span>
                          <span className="text-gray-900">{item.frontDesign}</span>
                        </div>
                      )}
                      {item.backDesign && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Back Design:</span>
                          <span className="text-gray-900">{item.backDesign}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-lg">PHP {item.price}.00</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate('/custom-design')}
                      >
                        <Edit3 className="size-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-xl border shadow-sm p-6">
              <div className="max-w-md ml-auto space-y-4">
                <h3 className="text-lg">Order Summary</h3>
                
                <div className="space-y-2">
                  {customizedItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.productName}</span>
                      <span>PHP {item.price}.00</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl">PHP {totalPrice}.00</span>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate('/custom-design')}
                  >
                    Continue Editing
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                    <ShoppingCart className="size-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                💡 <strong>Note:</strong> This is a preview of your customized items. You can continue editing or add them to your cart to proceed with the order.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomDesignPreviewPage;