import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { CheckCircle2, Package, Truck, Home } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

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
  paymentMethod?: string;
  paymentType?: 'partial' | 'full';
  paymentAmount?: number;
  remainingBalance?: number;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  shippingDetails?: {
    trackingNumber: string | null;
    carrier: string | null;
    shippedDate: string | null;
    estimatedDelivery: string | null;
  };
}

export function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Always try to fetch from API first - don't use localStorage fallback
      if (orderId) {
        const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const apiOrder = await response.json();
          console.log('API Order response:', apiOrder); // Debug log
          
          // Handle both payment (singular) and payments (array) formats
          const payment = apiOrder.payment || (apiOrder.payments && apiOrder.payments.length > 0 ? apiOrder.payments[0] : null);
          
          // Convert API order format to local format
          const convertedOrder: Order = {
            id: apiOrder.id,
            date: apiOrder.orderDate || new Date().toISOString(),
            items: apiOrder.items?.map((item: any) => ({
              id: item.id,
              name: item.name,
              price: item.unitPrice,
              quantity: item.quantity,
              image: '', // API doesn't have image
            })) || [],
            subtotal: apiOrder.total,
            shipping: 0,
            tax: 0,
            total: apiOrder.total,
            status: apiOrder.status || 'payment_pending',
            paymentMethod: payment?.method || 'gcash',
            paymentType: payment?.status === 'paid' ? 'full' : 'partial',
            paymentAmount: payment?.amountPaid || 0,
            remainingBalance: apiOrder.balanceRemaining || 0,
            paymentStatus: payment?.status || 'pending',
            shippingDetails: apiOrder.shipping || null,
          };
          setOrder(convertedOrder);
          setError(null);
          setLoading(false);
        } else if (response.status === 404) {
          // Order not found in database - show error (don't use localStorage fallback)
          // This ensures deleted orders are not shown from cached local data
          setOrder(null);
          setError('Order not found. This order may have been deleted or does not exist.');
          setLoading(false);
          
          // Also clean up localStorage to remove the deleted order
          try {
            const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const filteredOrders = storedOrders.filter((o: any) => o.id !== orderId);
            localStorage.setItem('orders', JSON.stringify(filteredOrders));
          } catch (e) {
            // Ignore localStorage errors
          }
        } else {
          // Other error
          const errorData = await response.json().catch(() => ({ error: 'Failed to load order' }));
          setOrder(null);
          setError(errorData.error || 'Failed to load order');
        }
      } else {
        setOrder(null);
        setError('Invalid order ID');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      setOrder(null);
      setError('Failed to load order. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      setLoading(false);
      setError('Invalid order ID');
    }
  }, [orderId, loadOrder]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-red-100 mb-4">
          <Package className="size-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-2">{error || 'We couldn\'t find this order'}</p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-6">Order ID: {orderId}</p>
        )}
        <div className="flex gap-4 justify-center">
          <Button onClick={() => navigate('/')}>Go to Home</Button>
          <Button variant="outline" onClick={() => navigate('/track-order')}>
            Track Another Order
          </Button>
        </div>
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
        <h1 className="mb-2">
          {order.status === 'payment_pending' ? 'Order Placed!' : 'Order Confirmed!'}
        </h1>
        <p className="text-gray-600">
          {order.status === 'payment_pending' && order.paymentMethod === 'gcash'
            ? 'Your order has been placed. Payment is pending admin approval.'
            : 'Thank you for your purchase. Your order has been received and is being processed.'}
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

        {/* Order Status Timeline - Shipment Tracking */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3>Order Status</h3>
            <Badge className="bg-blue-100 text-blue-900 hover:bg-blue-100">
              {order.status === 'payment_pending' || (order.paymentStatus === 'pending') ? 'Order Placed' : 
               order.status === 'pending' ? 'Processing' :
               ['designing', 'ripping', 'heatpress', 'assembly', 'qa', 'packing', 'done'].includes(order.status) ? 
                 (order.status === 'done' ? 'To Ship' : 'In Production') :
               order.status === 'shipping' ? 'Shipping' :
               order.status === 'delivered' ? 'Delivered' :
               'Order Placed'}
            </Badge>
          </div>
          
          {/* Shipment Timeline */}
          <div className="flex items-center gap-4">
            {/* Order Placed - Always complete */}
            <div className="flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="size-5 text-green-600" />
              </div>
              <p className="text-xs text-center">Order<br />Placed</p>
            </div>
            <div className={`flex-1 h-0.5 ${
              ['pending', 'designing', 'ripping', 'heatpress', 'assembly', 'qa', 'packing', 'done', 'shipping', 'delivered'].includes(order.status)
                ? 'bg-green-300' 
                : 'bg-gray-200'
            }`}></div>
            
            {/* Processing - Complete when in production or beyond */}
            <div className="flex flex-col items-center gap-2">
              <div className={`size-10 rounded-full flex items-center justify-center ${
                ['pending', 'designing', 'ripping', 'heatpress', 'assembly', 'qa', 'packing', 'done', 'shipping', 'delivered'].includes(order.status)
                  ? 'bg-green-100' 
                  : 'bg-gray-100'
              }`}>
                {['pending', 'designing', 'ripping', 'heatpress', 'assembly', 'qa', 'packing', 'done', 'shipping', 'delivered'].includes(order.status) ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <Package className="size-5 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-center">Processing</p>
            </div>
            <div className={`flex-1 h-0.5 ${
              ['done', 'shipping', 'delivered'].includes(order.status)
                ? 'bg-green-300' 
                : 'bg-gray-200'
            }`}></div>
            
            {/* To Ship - Complete when done or beyond */}
            <div className="flex flex-col items-center gap-2">
              <div className={`size-10 rounded-full flex items-center justify-center ${
                ['done', 'shipping', 'delivered'].includes(order.status)
                  ? 'bg-green-100' 
                  : 'bg-gray-100'
              }`}>
                {['done', 'shipping', 'delivered'].includes(order.status) ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <Package className="size-5 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-center">To Ship</p>
            </div>
            <div className={`flex-1 h-0.5 ${
              ['shipping', 'delivered'].includes(order.status)
                ? 'bg-green-300' 
                : 'bg-gray-200'
            }`}></div>
            
            {/* Shipping - Complete when shipping or delivered */}
            <div className="flex flex-col items-center gap-2">
              <div className={`size-10 rounded-full flex items-center justify-center ${
                ['shipping', 'delivered'].includes(order.status)
                  ? 'bg-green-100' 
                  : 'bg-gray-100'
              }`}>
                {['shipping', 'delivered'].includes(order.status) ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <Truck className="size-5 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-center">Shipping</p>
            </div>
            <div className={`flex-1 h-0.5 ${
              order.status === 'delivered' ? 'bg-green-300' : 'bg-gray-200'
            }`}></div>
            
            {/* Delivered - Complete only when delivered */}
            <div className="flex flex-col items-center gap-2">
              <div className={`size-10 rounded-full flex items-center justify-center ${
                order.status === 'delivered' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {order.status === 'delivered' ? (
                  <CheckCircle2 className="size-5 text-green-600" />
                ) : (
                  <Home className="size-5 text-gray-400" />
                )}
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
                  <p>₱{(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">₱{item.price} each</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Payment Information */}
        {order.paymentMethod && (
          <>
            <div className="mb-6">
              <h3 className="mb-4">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <Badge variant="secondary" className="capitalize">
                    {order.paymentMethod === 'gcash' ? 'GCash' : order.paymentMethod}
                  </Badge>
                </div>
                {order.paymentType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Type</span>
                    <Badge variant={order.paymentType === 'full' ? 'default' : 'secondary'}>
                      {order.paymentType === 'full' ? 'Full Payment' : 'Partial Payment'}
                    </Badge>
                  </div>
                )}
                {order.paymentAmount !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold">₱{order.paymentAmount.toFixed(2)}</span>
                  </div>
                )}
                {order.paymentType === 'partial' && order.remainingBalance !== undefined && order.remainingBalance > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining Balance</span>
                    <span className="font-semibold text-orange-600">₱{order.remainingBalance.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                  <span className="text-gray-600">Payment Status</span>
                  <Badge 
                    variant={order.paymentStatus === 'pending' ? 'secondary' : 'default'}
                    className={order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}
                  >
                    {order.paymentStatus === 'pending' ? 'Pending Approval' : 'Approved'}
                  </Badge>
                </div>
              </div>
            </div>
            <Separator className="my-6" />
          </>
        )}

        {/* Shipping Details - Only show when order is shipping or delivered */}
        {(order.status === 'shipping' || order.status === 'delivered') && order.shippingDetails && (
          <>
            <div className="mb-6" data-shipping-details>
              <h3 className="mb-4 flex items-center gap-2">
                <Truck className="size-5" />
                Shipping Details
              </h3>
              <div className="space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                {order.shippingDetails.trackingNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Tracking Number</span>
                    <span className="text-sm font-mono font-semibold text-blue-900">
                      {order.shippingDetails.trackingNumber}
                    </span>
                  </div>
                )}
                {order.shippingDetails.carrier && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Carrier</span>
                    <Badge variant="secondary" className="capitalize">
                      {order.shippingDetails.carrier}
                    </Badge>
                  </div>
                )}
                {order.shippingDetails.shippedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Shipped Date</span>
                    <span className="text-sm text-gray-900">
                      {new Date(order.shippingDetails.shippedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {order.shippingDetails.estimatedDelivery && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Estimated Delivery</span>
                    <span className="text-sm font-semibold text-green-700">
                      {new Date(order.shippingDetails.estimatedDelivery).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-6" />
          </>
        )}

        {/* Order Summary */}
        <div>
          <h3 className="mb-4">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₱{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{order.shipping === 0 ? 'FREE' : `₱${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span>₱{order.tax.toFixed(2)}</span>
            </div>
            
            <Separator className="my-2" />
            
            <div className="flex justify-between">
              <span>Total</span>
              <span>₱{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {(order.status === 'shipping' || order.status === 'delivered') ? (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              // Scroll to shipping details section
              const shippingSection = document.querySelector('[data-shipping-details]');
              if (shippingSection) {
                shippingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            <Truck className="size-4 mr-2" />
            Shipping Details
          </Button>
        ) : order.paymentStatus === 'paid' || order.status !== 'payment_pending' ? (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/order-tracking/${order.id}`)}
          >
            Track Order
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex-1"
            disabled
            title="Track order will be available after payment approval"
          >
            Track Order (Pending Approval)
          </Button>
        )}
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
