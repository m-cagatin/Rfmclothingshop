import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';

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

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const foundOrder = orders.find((o: Order) => o.id === orderId);
    setOrder(foundOrder || null);
  }, [orderId]);

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-4">Order not found</h2>
        <p className="text-gray-600 mb-6">We couldn't find this order</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  const orderDate = new Date(order.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="size-8 text-green-600" />
        </div>
        <h1 className="mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
      </div>

      {/* Order Details Card */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="font-mono">{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Order Date</p>
            <p>{orderDate}</p>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Order Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Order Status</h3>
            <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-100">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <p className="text-xs text-center">Order<br />Placed</p>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="size-5 text-blue-600" />
              </div>
              <p className="text-xs text-center">Processing</p>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Truck className="size-5 text-gray-400" />
              </div>
              <p className="text-xs text-center">Shipped</p>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <div className="flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Home className="size-5 text-gray-400" />
              </div>
              <p className="text-xs text-center">Delivered</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Order Items */}
        <div>
          <h3 className="mb-4">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="size-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p>{item.name}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Order Summary */}
        <div>
          <h3 className="mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>₹{order.tax.toFixed(2)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => navigate('/order-tracking')}
        >
          Track Order
        </Button>
        <Button 
          className="flex-1 bg-black text-white hover:bg-black/90"
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </Button>
      </div>

      {/* Email Notification */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center text-sm text-blue-900">
        📧 A confirmation email has been sent to your email address
      </div>
    </div>
  );
}
