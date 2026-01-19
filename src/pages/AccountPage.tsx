import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Mail, Phone, Shield, CheckCircle, ArrowLeft, Package, Heart, ShoppingBag, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { Separator } from '../components/ui/separator';
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
}

const statusLabels: Record<string, { label: string; color: string }> = {
  payment_pending: { label: 'Payment Pending', color: 'bg-yellow-500' },
  pending: { label: 'Pending', color: 'bg-yellow-400' },
  designing: { label: 'Designing', color: 'bg-cyan-500' },
  ripping: { label: 'Ripping', color: 'bg-blue-500' },
  heatpress: { label: 'Heat Press', color: 'bg-purple-500' },
  assembly: { label: 'Assembly', color: 'bg-red-600' },
  qa: { label: 'QA', color: 'bg-orange-500' },
  packing: { label: 'Packing', color: 'bg-green-500' },
  done: { label: 'To Ship', color: 'bg-green-600' },
  shipping: { label: 'Shipping', color: 'bg-blue-700' },
  delivered: { label: 'Delivered', color: 'bg-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-600' },
};

export default function AccountPage() {
  const { user, isLoggedIn, isAdmin, isHydrating } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!isHydrating && (!isLoggedIn || !user)) {
      navigate('/');
    }
  }, [isHydrating, isLoggedIn, user, navigate]);

  useEffect(() => {
    // Wait for auth to hydrate before loading orders
    if (!isHydrating && isLoggedIn && user?.email) {
      loadOrders();
    } else if (!isHydrating) {
      // If not logged in after hydration, stop loading
      setLoadingOrders(false);
    }
  }, [user, isLoggedIn, isHydrating]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      
      if (!user?.email) {
        console.warn('No user email available');
        setOrders([]);
        return;
      }

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
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch orders from API:', response.status, errorData);
        
        // For logged-in users, don't fall back to localStorage
        // This prevents showing deleted orders
        setOrders([]);
        
        if (response.status !== 404) {
          toast.error('Failed to load orders. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return statusLabels[status] || { label: status, color: 'bg-gray-500' };
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isLoggedIn || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 size-4" />
          Back to Home
        </Button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-6">
              <Avatar className="size-24">
                <AvatarImage src={user.profilePicture} alt={user.name} />
                <AvatarFallback className="text-2xl bg-black text-white">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-3xl">{user.name}</CardTitle>
                  {user.googleId && (
                    <Badge variant="secondary" className="gap-1">
                      <img 
                        src="https://www.google.com/favicon.ico" 
                        alt="Google" 
                        className="size-3"
                      />
                      Google Account
                    </Badge>
                  )}
                  {isAdmin && (
                    <Badge variant="destructive" className="gap-1">
                      <Shield className="size-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-base">
                  Member since {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                <Mail className="size-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Email Address</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-base font-medium">{user.email}</p>
                  {user.emailVerified && (
                    <CheckCircle className="size-4 text-green-600" />
                  )}
                </div>
                {user.emailVerified && (
                  <p className="text-xs text-green-600 mt-1">Verified</p>
                )}
              </div>
            </div>

            {/* Phone */}
            {user.phone && (
              <div className="flex items-start gap-4">
                <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                  <Phone className="size-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-base font-medium mt-1">{user.phone}</p>
                </div>
              </div>
            )}

            {/* Account Type */}
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-gray-100 rounded-lg">
                <Shield className="size-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Account Type</p>
                <p className="text-base font-medium mt-1 capitalize">{user.role || 'Customer'}</p>
              </div>
            </div>

            {/* Google Account Info */}
            {user.googleId && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="size-4"
                  />
                  <span>This account is linked with Google Sign-In</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Favorites */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="size-5" />
              My Favorites
            </CardTitle>
            <CardDescription>Your saved favorite products</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                // Trigger favorites drawer - this would need to be connected to the Header component
                toast.info('Favorites feature coming soon');
              }}
            >
              View Favorites
              <ChevronRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>

        {/* My Orders */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="size-5" />
              My Orders
            </CardTitle>
            <CardDescription>View and track your order status</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : selectedOrder ? (
              <OrderDetailsView order={selectedOrder} onBack={() => setSelectedOrder(null)} />
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="size-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No orders yet</p>
                <Button onClick={() => navigate('/')} variant="outline">
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-semibold">Order #{order.orderId || order.id}</span>
                              <Badge className={statusInfo.color + ' text-white'}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="size-4" />
                                <span>
                                  {order.orderDate
                                    ? new Date(order.orderDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })
                                    : 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Package className="size-4" />
                                <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-bold text-lg">₱{order.total.toFixed(2)}</p>
                            {order.balanceRemaining > 0 && (
                              <p className="text-xs text-orange-600">
                                Balance: ₱{order.balanceRemaining.toFixed(2)}
                              </p>
                            )}
                            <ChevronRight className="size-5 text-gray-400 mt-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Panel Link */}
        {isAdmin && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-red-900">Admin Access</h3>
                  <p className="text-sm text-red-700">You have administrative privileges</p>
                </div>
                <Button
                  onClick={() => navigate('/admin/payment-verification')}
                  variant="destructive"
                >
                  <Shield className="mr-2 size-4" />
                  Go to Admin Panel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function OrderDetailsView({ order, onBack }: { order: Order; onBack: () => void }) {
  const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-gray-500' };
  const statusSteps = [
    { id: 'payment_pending', label: 'Payment Pending' },
    { id: 'pending', label: 'Pending' },
    { id: 'designing', label: 'Designing' },
    { id: 'ripping', label: 'Ripping' },
    { id: 'heatpress', label: 'Heat Press' },
    { id: 'assembly', label: 'Assembly' },
    { id: 'qa', label: 'Quality Assurance' },
    { id: 'packing', label: 'Packing' },
    { id: 'done', label: 'To Ship' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const currentStepIndex = statusSteps.findIndex((step) => step.id === order.status);
  const isStepCompleted = (stepIndex: number) => stepIndex < currentStepIndex;
  const isStepCurrent = (stepIndex: number) => stepIndex === currentStepIndex;

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 size-4" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order #{order.orderId || order.id}</CardTitle>
              <CardDescription className="mt-1">
                Placed on{' '}
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </CardDescription>
            </div>
            <Badge className={statusInfo.color + ' text-white text-base px-4 py-2'}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Status Timeline */}
          <div>
            <h3 className="font-semibold mb-4">Order Status</h3>
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const completed = isStepCompleted(index);
                const current = isStepCurrent(index);
                return (
                  <div key={step.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          completed
                            ? 'bg-green-500 text-white'
                            : current
                            ? statusInfo.color + ' text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="size-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            completed ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p
                        className={`font-medium ${
                          completed
                            ? 'text-green-600'
                            : current
                            ? 'text-blue-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </p>
                      {current && order.estimatedCompletion && (
                        <p className="text-sm text-gray-600 mt-1">
                          Estimated completion:{' '}
                          {new Date(order.estimatedCompletion).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ₱{item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">₱{item.subtotal.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₱{order.total.toFixed(2)}</span>
            </div>
            {order.balanceRemaining > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid</span>
                <span className="font-medium">₱{(order.total - order.balanceRemaining).toFixed(2)}</span>
              </div>
            )}
            {order.balanceRemaining > 0 && (
              <div className="flex justify-between text-orange-600">
                <span className="font-medium">Remaining Balance</span>
                <span className="font-bold">₱{order.balanceRemaining.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold">Total</span>
              <span className="font-bold">₱{order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order.customer.address && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="size-5" />
                  Shipping Address
                </h3>
                <p className="text-gray-600">{order.customer.address}</p>
              </div>
            </>
          )}

          {/* Payment Info */}
          {order.payment && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Payment Information</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{order.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge
                      className={
                        order.payment.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-yellow-500'
                      }
                    >
                      {order.payment.status}
                    </Badge>
                  </div>
                  {order.payment.referenceNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-medium">{order.payment.referenceNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Notes</h3>
                <p className="text-gray-600">{order.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
