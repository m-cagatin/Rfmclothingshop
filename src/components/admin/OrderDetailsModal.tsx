import { X, Copy, CheckCircle2, MapPin, Mail, Phone, Package, Calendar, CreditCard, FileText, ZoomIn } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface OrderItem {
  id: string;
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image?: string | null;
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
    type?: string;
    amountPaid: number;
    amount?: number;
    remainingBalance?: number;
    referenceNumber: string | null;
    createdAt?: string | null;
    verifiedAt?: string | null;
    paidAt?: string | null;
  } | null;
  shipping?: {
    trackingNumber: string | null;
    carrier: string | null;
    shippedDate: string | null;
    estimatedDelivery: string | null;
  } | null;
}

interface OrderDetailsModalProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailsModal({ orderId, onClose }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE}/api/orders/${orderId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      payment_pending: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      designing: 'bg-cyan-100 text-cyan-800',
      ripping: 'bg-blue-100 text-blue-800',
      heatpress: 'bg-purple-100 text-purple-800',
      assembly: 'bg-red-100 text-red-800',
      qa: 'bg-orange-100 text-orange-800',
      packing: 'bg-green-100 text-green-800',
      done: 'bg-green-100 text-green-800',
      shipping: 'bg-purple-100 text-purple-800',
      delivered: 'bg-teal-100 text-teal-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Could not load order details for {orderId}</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const isPartialPayment = order.payment?.type === 'partial' || (order.balanceRemaining || 0) > 0;
  const isFullPayment = !isPartialPayment && order.payment?.status === 'paid';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Order Details</h2>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Order ID Section */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Order ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-lg">{order.id}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(order.id)}
                    className="h-6 w-6 p-0"
                  >
                    {copied ? <CheckCircle2 className="size-4 text-green-600" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-medium">{formatDate(order.orderDate)}</p>
              </div>
            </div>
          </section>

          {/* Delivery Information */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
              <MapPin className="size-5" />
              Delivery Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium">{order.customer.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Mail className="size-4" />
                    Email
                  </p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                    <Phone className="size-4" />
                    Phone
                  </p>
                  <p className="font-medium">{order.customer.phone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Address</p>
                <p className="font-medium">{order.customer.address || 'N/A'}</p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Product Details */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
              <Package className="size-5" />
              Product Details
            </h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">{order.items.length} item(s)</p>
              {order.items.map((item) => {
                // Debug: Log image URL if available
                if (item.image) {
                  console.log(`Product ${item.name} image URL:`, item.image);
                }
                
                return (
                  <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start gap-3">
                      {/* Product Image - Smaller, consistent size, clickable */}
                      {item.image ? (
                        <div 
                          className="relative flex-shrink-0 w-16 h-16 bg-white border border-gray-200 rounded-md overflow-hidden cursor-pointer hover:border-gray-400 transition-all group"
                          onClick={() => setSelectedImage(item.image || null)}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=No+Image';
                            }}
                          />
                          {/* Clickable indicator overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <ZoomIn className="size-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                          <Package className="size-5 text-gray-400" />
                          <span className="sr-only">No image available</span>
                        </div>
                      )}
                      {/* Product Details */}
                      <div className="flex-1 flex items-start justify-between min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium mb-1 text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">
                            Quantity: {item.quantity} × ₱{item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right ml-4 flex-shrink-0">
                          <p className="font-bold text-base">
                            ₱{item.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <Separator />

          {/* Payment Information */}
          <section>
            <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
              <CreditCard className="size-5" />
              Payment Information
            </h3>
            {order.payment ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                    <p className="font-medium">{order.payment.method || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                    <Badge className={getPaymentStatusColor(order.payment.status)}>
                      {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Type</p>
                    <Badge variant={isPartialPayment ? 'secondary' : 'default'}>
                      {isPartialPayment ? 'Partial Payment' : 'Full Payment'}
                    </Badge>
                  </div>
                  {order.payment.referenceNumber && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Reference Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{order.payment.referenceNumber}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(order.payment!.referenceNumber!)}
                          className="h-6 w-6 p-0"
                        >
                          {copied ? <CheckCircle2 className="size-4 text-green-600" /> : <Copy className="size-4" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Total:</span>
                    <span className="font-bold">₱{order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600">
                      ₱{order.payment.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  {isPartialPayment && (
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">Balance Remaining:</span>
                      <span className="font-bold text-orange-600">
                        ₱{order.balanceRemaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t">
                  {order.payment.createdAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <Calendar className="size-4" />
                        Payment Created
                      </p>
                      <p className="font-medium text-sm">{formatDateTime(order.payment.createdAt)}</p>
                    </div>
                  )}
                  {order.payment.verifiedAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        Payment Verified
                      </p>
                      <p className="font-medium text-sm">{formatDateTime(order.payment.verifiedAt)}</p>
                    </div>
                  )}
                  {order.payment.paidAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                        <CreditCard className="size-4" />
                        Payment Approved
                      </p>
                      <p className="font-medium text-sm">{formatDateTime(order.payment.paidAt)}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No payment information available</p>
              </div>
            )}
          </section>

          {/* Shipping Information */}
          {order.shipping && (order.shipping.trackingNumber || order.shipping.carrier) && (
            <>
              <Separator />
              <section>
                <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
                  <Package className="size-5" />
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.shipping.trackingNumber && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Tracking Number</p>
                      <p className="font-medium">{order.shipping.trackingNumber}</p>
                    </div>
                  )}
                  {order.shipping.carrier && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Carrier</p>
                      <p className="font-medium">{order.shipping.carrier}</p>
                    </div>
                  )}
                  {order.shipping.shippedDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Shipped Date</p>
                      <p className="font-medium">{formatDate(order.shipping.shippedDate)}</p>
                    </div>
                  )}
                  {order.shipping.estimatedDelivery && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Estimated Delivery</p>
                      <p className="font-medium">{formatDate(order.shipping.estimatedDelivery)}</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}

          {/* Notes */}
          {order.notes && (
            <>
              <Separator />
              <section>
                <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex items-center gap-2">
                  <FileText className="size-5" />
                  Notes
                </h3>
                <p className="text-gray-700">{order.notes}</p>
              </section>
            </>
          )}

          {/* Estimated Completion */}
          {order.estimatedCompletion && (
            <>
              <Separator />
              <section>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Estimated Completion</p>
                  <p className="font-medium">{formatDate(order.estimatedCompletion)}</p>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-8"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="size-6" />
            </Button>
            <img
              src={selectedImage}
              alt="Product image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

