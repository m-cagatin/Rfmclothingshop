import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Package, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function TrackOrderPage() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim()) {
      toast.error('Please enter an order ID');
      return;
    }

    setIsSearching(true);
    
    try {
      // Try to fetch order by order_ref from API
      const response = await fetch(`${API_BASE}/api/orders/${orderId.trim()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const order = await response.json();
        // Navigate to order tracking page with the order ID
        navigate(`/order-tracking/${order.id || orderId.trim()}`);
      } else {
        // Check localStorage as fallback
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = storedOrders.find((o: any) => o.id === orderId.trim());
        
        if (foundOrder) {
          navigate(`/order-tracking/${orderId.trim()}`);
        } else {
          toast.error('Order not found. Please check your order ID and try again.');
        }
      }
    } catch (error) {
      console.error('Error searching for order:', error);
      // Check localStorage as fallback
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const foundOrder = storedOrders.find((o: any) => o.id === orderId.trim());
      
      if (foundOrder) {
        navigate(`/order-tracking/${orderId.trim()}`);
      } else {
        toast.error('Order not found. Please check your order ID and try again.');
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 size-4" />
        Back to Home
      </Button>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 size-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Package className="size-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Track Your Order</CardTitle>
          <CardDescription>
            Enter your order ID to view the current status and tracking information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <div className="flex gap-2">
                <Input
                  id="orderId"
                  type="text"
                  placeholder="e.g., ORD-12345678"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button
                  type="submit"
                  disabled={isSearching}
                  className="bg-black text-white hover:bg-black/90"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Search className="size-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                You can find your order ID in your confirmation email or order confirmation page
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-sm font-semibold mb-3">Order Status Guide</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-cyan-500" />
                <span>Designing - Your design is being created</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-500" />
                <span>Ripping - Design is being prepared for printing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-purple-500" />
                <span>Heat Press - Design is being applied to the product</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-pink-500" />
                <span>Assembly - Product is being assembled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-orange-500" />
                <span>QA - Quality assurance check in progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-indigo-500" />
                <span>Packing - Order is being packed for shipment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span>Done - Order is complete and ready</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

