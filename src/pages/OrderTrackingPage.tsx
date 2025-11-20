import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { CheckCircle2, Package, Truck, Home, Clock } from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: string;
}

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    // Sort by date (newest first)
    const sortedOrders = storedOrders.sort((a: Order, b: Order) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setOrders(sortedOrders);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Package className="size-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="size-5 text-orange-600" />;
      case 'delivered':
        return <Home className="size-5 text-green-600" />;
      default:
        return <Clock className="size-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-900';
      case 'shipped':
        return 'bg-orange-100 text-orange-900';
      case 'delivered':
        return 'bg-green-100 text-green-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="size-16 mx-auto mb-4 text-gray-400" />
        <h2 className="mb-4">No Orders Yet</h2>
        <p className="text-gray-600 mb-6">You haven't placed any orders yet</p>
        <Button onClick={() => navigate('/')}>Start Shopping</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 max-w-5xl">
      <h1 className="mb-8">Order Tracking</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const orderDate = new Date(order.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });

          return (
            <div key={order.id} className="bg-white border rounded-lg p-6">
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">Order {order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Placed on {orderDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl">₹{order.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Order Progress */}
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <CheckCircle2 className={`size-5 ${
                        order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-center">Order<br />Placed</p>
                  </div>
                  
                  <div className={`flex-1 h-0.5 ${
                    order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                  }`}></div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <Package className={`size-5 ${
                        order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-center">Processing</p>
                  </div>
                  
                  <div className={`flex-1 h-0.5 ${
                    order.status === 'shipped' || order.status === 'delivered'
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                  }`}></div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      order.status === 'shipped' || order.status === 'delivered'
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <Truck className={`size-5 ${
                        order.status === 'shipped' || order.status === 'delivered'
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-center">Shipped</p>
                  </div>
                  
                  <div className={`flex-1 h-0.5 ${
                    order.status === 'delivered'
                      ? 'bg-green-300'
                      : 'bg-gray-200'
                  }`}></div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className={`size-10 rounded-full flex items-center justify-center ${
                      order.status === 'delivered'
                        ? 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      <Home className={`size-5 ${
                        order.status === 'delivered'
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`} />
                    </div>
                    <p className="text-xs text-center">Delivered</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Order Items */}
              <div className="mb-6">
                <p className="text-sm mb-4">{order.items.length} item(s)</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="size-20 object-cover rounded border"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/order-confirmation/${order.id}`)}
                  className="flex-1"
                >
                  View Details
                </Button>
                {order.status === 'delivered' && (
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/')}
                  >
                    Buy Again
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Continue Shopping */}
      <div className="mt-8 text-center">
        <Button 
          size="lg"
          className="bg-black text-white hover:bg-black/90"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
}
