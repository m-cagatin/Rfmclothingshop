import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { CheckCircle2, Package, Truck, Home, Clock, Palette, Scissors, Zap, Wrench, Search, Box, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface OrderItem {
  id: string;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderId: number;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  items: OrderItem[];
  total: number;
  balanceRemaining: number;
  status: string;
  orderDate: string | null;
  estimatedCompletion: string | null;
  notes: string | null;
  payment: {
    id: number;
    method: string;
    status: string;
    amountPaid: number;
    referenceNumber: string | null;
  } | null;
  shipping?: {
    trackingNumber: string | null;
    carrier: string | null;
    shippedDate: string | null;
    estimatedDelivery: string | null;
  } | null;
  trackingEvents?: Array<{
    id: number;
    status: string;
    message: string;
    location: string | null;
    timestamp: string;
  }>;
}

export function OrderTrackingPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, isHydrating } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // If orderId is provided, try to fetch that specific order
      if (orderId) {
        try {
          const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
            credentials: 'include',
          });

          if (response.ok) {
            const order = await response.json();
            setOrders([order]);
            setLoading(false);
            return;
          } else if (response.status === 404) {
            // Order not found in database - it was deleted
            // Don't fall back to localStorage, show order not found
            console.log('Order not found in database:', orderId);
            setOrders([]);
            setLoading(false);
            
            // Clean up localStorage to remove the deleted order
            try {
              const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
              const filteredOrders = storedOrders.filter((o: any) => o.id !== orderId);
              localStorage.setItem('orders', JSON.stringify(filteredOrders));
            } catch (e) {
              // Ignore localStorage errors
            }
            
            return;
          }
        } catch (error) {
          console.error('Error fetching single order:', error);
          // Network error - don't fall back to localStorage for specific order lookups
          setOrders([]);
          setLoading(false);
          return;
        }
      }

      // Try to fetch from API if user is logged in
      if (user?.email) {
        // Normalize email to match database storage (lowercase and trimmed)
        const normalizedEmail = user.email.trim().toLowerCase();
        console.log('Loading orders for email:', normalizedEmail);
        
        const response = await fetch(`${API_BASE}/api/orders?customerEmail=${encodeURIComponent(normalizedEmail)}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Orders fetched from API:', data);
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
          return;
        } else {
          console.error('Failed to fetch orders:', response.status);
          // For logged-in users, if API fails, show empty instead of localStorage
          // This prevents showing deleted orders
          setOrders([]);
          setLoading(false);
          return;
        }
      }

      // Fallback to localStorage for guest orders
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Filter by email if user is logged in
      let filteredOrders = storedOrders;
      if (user?.email) {
        const normalizedEmail = user.email.trim().toLowerCase();
        filteredOrders = storedOrders.filter((order: any) => {
          const orderEmail = (order.customerInfo?.email || '').trim().toLowerCase();
          return orderEmail === normalizedEmail;
        });
      }
      
      // Convert localStorage format to API format
      const convertedOrders: Order[] = filteredOrders.map((order: any) => ({
        id: order.id,
        orderId: 0,
        customer: {
          name: order.customerInfo?.name || `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim(),
          email: order.customerInfo?.email || '',
          phone: order.customerInfo?.phone || '',
          address: order.customerInfo?.address || '',
        },
        items: order.items?.map((item: any, index: number) => ({
          id: item.id || index.toString(),
          productId: parseInt(item.id) || 0,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity,
        })) || [],
        total: order.total || 0,
        balanceRemaining: order.remainingBalance || 0,
        status: order.status || 'payment_pending',
        orderDate: order.date || new Date().toISOString(),
        estimatedCompletion: null,
        notes: null,
        payment: null,
        shipping: null,
      }));
      
      setOrders(convertedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      
      // Fallback to localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Filter by email if user is logged in
      let filteredOrders = storedOrders;
      if (user?.email) {
        const normalizedEmail = user.email.trim().toLowerCase();
        filteredOrders = storedOrders.filter((order: any) => {
          const orderEmail = (order.customerInfo?.email || '').trim().toLowerCase();
          return orderEmail === normalizedEmail;
        });
      }
      
      const convertedOrders: Order[] = filteredOrders.map((order: any) => ({
        id: order.id,
        orderId: 0,
        customer: {
          name: order.customerInfo?.name || `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim(),
          email: order.customerInfo?.email || '',
          phone: order.customerInfo?.phone || '',
          address: order.customerInfo?.address || '',
        },
        items: order.items?.map((item: any, index: number) => ({
          id: item.id || index.toString(),
          productId: parseInt(item.id) || 0,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.price * item.quantity,
        })) || [],
        total: order.total || 0,
        balanceRemaining: order.remainingBalance || 0,
        status: order.status || 'payment_pending',
        orderDate: order.date || new Date().toISOString(),
        estimatedCompletion: null,
        notes: null,
        payment: null,
        shipping: null,
      }));
      setOrders(convertedOrders);
    } finally {
      setLoading(false);
    }
  }, [orderId, user?.email]);

  useEffect(() => {
    // Wait for auth to hydrate before loading orders
    if (!isHydrating) {
      loadOrders();
    }
  }, [isHydrating, loadOrders]);

  // Filter orders by orderId if provided
  const displayOrders = orderId 
    ? orders.filter(order => order.id === orderId)
    : orders;

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'payment_pending': 'Payment Pending',
      'pending': 'Pending',
      'designing': 'Designing',
      'ripping': 'Ripping',
      'heatpress': 'Heat Press',
      'assembly': 'Assembly',
      'qa': 'QA',
      'packing': 'Packing',
      'done': 'To Ship',
      'shipping': 'Shipping',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'payment_pending':
        return <Clock className="size-5 text-yellow-600" />;
      case 'pending':
      case 'designing':
      case 'ripping':
      case 'heatpress':
      case 'assembly':
      case 'qa':
      case 'packing':
        return <Package className="size-5 text-blue-600" />;
      case 'done':
        return <Home className="size-5 text-green-600" />;
      case 'shipping':
        return <Truck className="size-5 text-indigo-600" />;
      case 'cancelled':
        return <Clock className="size-5 text-red-600" />;
      default:
        return <Clock className="size-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'payment_pending':
        return 'bg-yellow-100 text-yellow-900';
      case 'pending':
        return 'bg-yellow-100 text-yellow-900';
      case 'designing':
      case 'ripping':
      case 'heatpress':
        return 'bg-blue-100 text-blue-900';
      case 'assembly':
        return 'bg-red-100 text-red-900';
      case 'qa':
        return 'bg-orange-100 text-orange-900';
      case 'packing':
        return 'bg-green-100 text-green-900';
      case 'done':
        return 'bg-green-100 text-green-900';
      case 'shipping':
        return 'bg-blue-100 text-blue-900';
      case 'delivered':
        return 'bg-green-100 text-green-900';
      case 'cancelled':
        return 'bg-red-100 text-red-900';
      default:
        return 'bg-gray-100 text-gray-900';
    }
  };

  const getStatusProgress = (status: string) => {
    const statusOrder = ['payment_pending', 'pending', 'designing', 'ripping', 'heatpress', 'assembly', 'qa', 'packing', 'done', 'shipping', 'delivered'];
    const currentIndex = statusOrder.indexOf(status);
    return {
      currentStep: currentIndex >= 0 ? currentIndex : 0,
      totalSteps: statusOrder.length - 1,
      isComplete: status === 'delivered',
      isCancelled: status === 'cancelled',
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (displayOrders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="size-16 mx-auto mb-4 text-gray-400" />
        <h2 className="mb-4">{orderId ? 'Order Not Found' : 'No Orders Yet'}</h2>
        <p className="text-gray-600 mb-6">
          {orderId 
            ? "We couldn't find order " + orderId
            : "You haven't placed any orders yet"}
        </p>
        <div className="flex gap-3 justify-center">
          {orderId && (
            <Button variant="outline" onClick={() => navigate('/order-tracking')}>
              View All Orders
            </Button>
          )}
          <Button onClick={() => navigate('/')}>
            {orderId ? 'Go Home' : 'Start Shopping'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1>Order Tracking</h1>
        {orderId && (
          <Button variant="outline" onClick={() => navigate('/order-tracking')}>
            View All Orders
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {displayOrders.map((order) => {
          // Check if payment is approved - if not, show message
          const isPaymentPending = order.status === 'payment_pending' || order.payment?.status === 'pending';
          
          const orderDate = order.orderDate 
            ? new Date(order.orderDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : 'N/A';
          
          const progress = getStatusProgress(order.status);
          const statusSteps = [
            { label: 'Pending', status: 'pending', icon: Clock, color: 'yellow' },
            { label: 'Designing', status: 'designing', icon: Palette, color: 'cyan' },
            { label: 'Ripping', status: 'ripping', icon: Scissors, color: 'blue' },
            { label: 'Heat Press', status: 'heatpress', icon: Zap, color: 'purple' },
            { label: 'Assembly', status: 'assembly', icon: Wrench, color: 'red' },
            { label: 'QA', status: 'qa', icon: Search, color: 'orange' },
            { label: 'Packing', status: 'packing', icon: Box, color: 'green' },
            { label: 'To Ship', status: 'done', icon: Package, color: 'green' },
            { label: 'Shipping', status: 'shipping', icon: Truck, color: 'blue' },
            { label: 'Delivered', status: 'delivered', icon: Home, color: 'green' },
          ];

          return (
            <div key={order.id} className="bg-white border rounded-lg p-6">
              {/* Payment Pending Warning */}
              {isPaymentPending && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="size-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Payment Pending Approval</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Your order tracking will be available once your payment has been approved by our admin.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg">Order {order.id}</h3>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">Placed on {orderDate}</p>
                  {order.payment && (
                    <p className="text-xs text-gray-500 mt-1">
                      Payment: {order.payment.status === 'pending' ? 'Pending Approval' : 'Approved'} • Ref: {order.payment.referenceNumber || 'N/A'}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl">₱{order.total.toFixed(2)}</p>
                  {order.balanceRemaining > 0 && (
                    <p className="text-xs text-orange-600">Balance: ₱{order.balanceRemaining.toFixed(2)}</p>
                  )}
                </div>
              </div>

              {/* Order Progress Timeline - Horizontal Style */}
              {!progress.isCancelled && !isPaymentPending && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold">Production Progress</h4>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-4">
                    {statusSteps.map((step, index) => {
                      const statusOrder = ['payment_pending', 'pending', 'designing', 'ripping', 'heatpress', 'assembly', 'qa', 'packing', 'done', 'shipping', 'delivered'];
                      const currentIndex = statusOrder.indexOf(order.status);
                      const stepIndex = statusOrder.indexOf(step.status);
                      const isActive = currentIndex === stepIndex;
                      const isPast = currentIndex > stepIndex;
                      const StepIcon = step.icon;
                      
                      // Color mapping for each status
                      const colorMap: Record<string, { bg: string; icon: string; text: string; border: string }> = {
                        yellow: { bg: 'bg-yellow-100', icon: 'text-yellow-600', text: 'text-yellow-600', border: 'border-yellow-300' },
                        cyan: { bg: 'bg-cyan-100', icon: 'text-cyan-600', text: 'text-cyan-600', border: 'border-cyan-300' },
                        blue: { bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-600', border: 'border-blue-300' },
                        purple: { bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-600', border: 'border-purple-300' },
                        red: { bg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-600', border: 'border-red-300' },
                        orange: { bg: 'bg-orange-100', icon: 'text-orange-600', text: 'text-orange-600', border: 'border-orange-300' },
                        teal: { bg: 'bg-teal-100', icon: 'text-teal-600', text: 'text-teal-600', border: 'border-teal-300' },
                        green: { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-600', border: 'border-green-300' },
                      };
                      
                      const colors = colorMap[step.color] || colorMap.blue;
                      
                      return (
                        <div key={step.label} className="flex items-center flex-shrink-0">
                          <div className="flex flex-col items-center gap-2">
                            <div className={`size-12 rounded-full flex items-center justify-center border-2 transition-all ${
                              isPast 
                                ? `bg-green-100 border-green-300 ${colors.icon}` 
                                : isActive 
                                ? `${colors.bg} ${colors.border} ${colors.icon} shadow-lg scale-110` 
                                : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}>
                              {isPast ? (
                                <CheckCircle2 className="size-6 text-green-600" />
                              ) : isActive ? (
                                <StepIcon className={`size-6 ${colors.icon} animate-pulse`} />
                              ) : (
                                <StepIcon className="size-5 text-gray-400" />
                              )}
                            </div>
                            <p className={`text-xs text-center whitespace-nowrap font-medium ${
                              isActive ? `${colors.text} font-semibold` : isPast ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {step.label}
                            </p>
                          </div>
                          {index < statusSteps.length - 1 && (
                            <div className={`flex-1 h-1 mx-3 min-w-[50px] rounded-full transition-all ${
                              isPast ? 'bg-green-300' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <Separator className="my-6" />

              {/* Order Items */}
              <div className="mb-6">
                <p className="text-sm mb-4">{order.items.length} item(s)</p>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-sm">
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity} × ₱{item.unitPrice.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold">₱{item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Timeline - Shopee Style */}
              {order.trackingEvents && order.trackingEvents.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Truck className="size-5" />
                    Tracking History
                  </h4>
                  <div className="space-y-4">
                    {order.trackingEvents.map((event, index) => (
                      <div key={event.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`size-10 rounded-full flex items-center justify-center ${
                            index === 0 ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {index === 0 ? (
                              <Truck className="size-5 text-green-600" />
                            ) : (
                              <Package className="size-5 text-gray-400" />
                            )}
                          </div>
                          {index < order.trackingEvents!.length - 1 && (
                            <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className={`font-medium ${index === 0 ? 'text-green-700' : 'text-gray-900'}`}>
                                {event.message}
                              </p>
                              {event.location && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {event.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">
                                {new Date(event.timestamp).toLocaleString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Details Section */}
              {(order.status === 'shipping' || order.status === 'delivered') && order.shipping && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="size-5 text-indigo-600" />
                    <h4 className="font-semibold text-indigo-900">Shipping Information</h4>
                  </div>
                  {order.shipping.trackingNumber && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Tracking Number: </span>
                      <span className="text-sm font-mono font-semibold text-indigo-900">
                        {order.shipping.trackingNumber}
                      </span>
                    </div>
                  )}
                  {order.shipping.carrier && (
                    <div className="mb-2">
                      <span className="text-sm text-gray-600">Carrier: </span>
                      <span className="text-sm font-medium text-indigo-900">
                        {order.shipping.carrier}
                      </span>
                    </div>
                  )}
                  {order.shipping.shippedDate && (
                    <div className="text-xs text-gray-600">
                      Shipped: {new Date(order.shipping.shippedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/order-confirmation/${order.id}`)}
                  className="flex-1"
                >
                  View Details
                </Button>
                {(order.status === 'shipping' || order.status === 'delivered') && order.shipping && (
                  <Button 
                    variant="default"
                    className="flex-1 bg-blue-700 hover:bg-blue-800"
                    onClick={() => navigate(`/shipping-details/${order.id}`)}
                  >
                    <Truck className="size-4 mr-2" />
                    Shipping Details
                  </Button>
                )}
                {order.status === 'done' && (
                  <Button 
                    variant="secondary"
                    className="flex-1"
                    disabled
                  >
                    <Package className="size-4 mr-2" />
                    Ready to Ship
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
