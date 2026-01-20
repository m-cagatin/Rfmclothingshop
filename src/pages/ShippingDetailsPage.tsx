import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Truck, ArrowLeft, CheckCircle2, Package } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface ShippingDetails {
  trackingNumber: string;
  carrier: string;
  shippedDate: string;
  estimatedDelivery: string;
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
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  status: string;
  shipping?: ShippingDetails;
}

export function ShippingDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
    trackingNumber: '',
    carrier: '',
    shippedDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const carriers = [
    'J&T Express',
    'LBC Express',
    '2GO Express',
    'Lalamove',
    'Grab Express',
    'GoGo Express',
    'Flash Express',
    'Ninja Van',
    'XDE Logistics',
    'Entrego',
    'Other'
  ];

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load order');
      }

      const data = await response.json();
      setOrder(data);
      
      // If shipping details exist, populate the form
      if (data.shipping) {
        setShippingDetails({
          trackingNumber: data.shipping.trackingNumber || '',
          carrier: data.shipping.carrier || '',
          shippedDate: data.shipping.shippedDate 
            ? new Date(data.shipping.shippedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          estimatedDelivery: data.shipping.estimatedDelivery
            ? new Date(data.shipping.estimatedDelivery).toISOString().split('T')[0]
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        });
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      toast.error(error.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveShippingDetails = async () => {
    if (!orderId || !order) return;

    if (!shippingDetails.trackingNumber.trim()) {
      toast.error('Tracking number is required');
      return;
    }

    if (!shippingDetails.carrier.trim()) {
      toast.error('Carrier is required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/api/orders/${order.orderId}/shipping`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          trackingNumber: shippingDetails.trackingNumber.trim(),
          carrier: shippingDetails.carrier,
          shippedDate: shippingDetails.shippedDate,
          estimatedDelivery: shippingDetails.estimatedDelivery,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save shipping details');
      }

      // Update order status to shipping if not already
      if (order.status !== 'shipping') {
        await fetch(`${API_BASE}/api/orders/${order.orderId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: 'shipping' }),
        });
      }

      toast.success('Shipping details saved successfully');
      
      // Reload the order to get updated status (backend auto-sets status to shipping)
      await loadOrder();
      
      // Navigate back to orders page after a short delay
      setTimeout(() => {
        navigate('/admin/orders');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving shipping details:', error);
      toast.error(error.message || 'Failed to save shipping details');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsDelivered = async () => {
    if (!order) return;

    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/api/orders/${order.orderId}/delivered`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark order as delivered');
      }

      toast.success('Order marked as delivered!');
      
      // Reload the order to get updated status
      await loadOrder();
      
      // Navigate back to orders page after a short delay
      setTimeout(() => {
        navigate('/admin/orders');
      }, 1000);
    } catch (error: any) {
      console.error('Error marking order as delivered:', error);
      toast.error(error.message || 'Failed to mark order as delivered');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Package className="size-16 mx-auto mb-4 text-gray-400" />
            <h2 className="mb-4">Order Not Found</h2>
            <Button onClick={() => navigate('/admin/orders')}>
              Back to Orders
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/orders')}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Orders
          </Button>
          <div className="flex items-center gap-3">
            <Truck className="size-8 text-indigo-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Shipping Details</h1>
              <p className="text-gray-600">Order {order.id}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-gray-600">Customer</Label>
                <p className="font-medium">{order.customer.name}</p>
                <p className="text-sm text-gray-600">{order.customer.email}</p>
                <p className="text-sm text-gray-600">{order.customer.phone}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Shipping Address</Label>
                <p className="text-sm">{order.customer.address || 'No address provided'}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Total Amount</Label>
                <p className="text-xl font-bold">₱{order.total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details Form */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="trackingNumber">Tracking Number *</Label>
                <Input
                  id="trackingNumber"
                  value={shippingDetails.trackingNumber}
                  onChange={(e) => setShippingDetails({ ...shippingDetails, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="carrier">Carrier *</Label>
                <Select
                  value={shippingDetails.carrier}
                  onValueChange={(value) => setShippingDetails({ ...shippingDetails, carrier: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier} value={carrier}>
                        {carrier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="shippedDate">Shipped Date</Label>
                  <Input
                    id="shippedDate"
                    type="date"
                    value={shippingDetails.shippedDate}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, shippedDate: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedDelivery">Estimated Delivery</Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={shippingDetails.estimatedDelivery}
                    onChange={(e) => setShippingDetails({ ...shippingDetails, estimatedDelivery: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveShippingDetails}
                  disabled={saving || order.status === 'shipping' || order.status === 'delivered'}
                  className="flex-1"
                >
                  {saving ? 'Saving...' : (order.status === 'shipping' || order.status === 'delivered') ? 'Shipping Details Saved' : 'Save Shipping Details'}
                </Button>
                {order.status === 'shipping' && (
                  <Button
                    onClick={handleMarkAsDelivered}
                    disabled={saving}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving ? 'Processing...' : 'Mark as Delivered'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin/orders')}
                  disabled={saving}
                >
                  Back to Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}


