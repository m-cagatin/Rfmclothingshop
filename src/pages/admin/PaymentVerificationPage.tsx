import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Check, X, CreditCard, ShieldCheck, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { Badge } from '../../components/ui/badge';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface PaymentVerification {
  id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  orderSummary: {
    items: string;
    total: number;
  };
  paymentMethod: string;
  paymentType: 'partial' | 'full';
  amountPaid: number;
  remainingBalance: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  receiptUrl: string | null;
  referenceNumber: string | null;
  submittedAt: Date | string;
}

export function PaymentVerificationPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/payments?status=pending`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load payments');
      }

      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId: string) => {
    if (!user) {
      toast.error('You must be logged in to approve payments');
      return;
    }

    setIsProcessing(paymentId);
    try {
      const response = await fetch(`${API_BASE}/api/payments/${paymentId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ verifiedBy: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve payment');
      }

      toast.success('Payment approved', {
        description: 'The order has been approved and will proceed to production.',
      });

      // Reload payments
      await loadPayments();
    } catch (error: any) {
      console.error('Error approving payment:', error);
      toast.error(error.message || 'Failed to approve payment');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (paymentId: string) => {
    if (!user) {
      toast.error('You must be logged in to reject payments');
      return;
    }

    setIsProcessing(paymentId);
    try {
      const response = await fetch(`${API_BASE}/api/payments/${paymentId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ verifiedBy: user.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject payment');
      }

      toast.error('Payment rejected', {
        description: 'The customer will be notified about the rejection.',
      });

      // Reload payments
      await loadPayments();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast.error(error.message || 'Failed to reject payment');
    } finally {
      setIsProcessing(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingPayments = payments.filter(p => p.paymentStatus === 'pending');

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="size-8 animate-spin text-gray-400" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Payment Verification</h1>
          <p className="text-gray-600">Review and approve orders awaiting payment verification</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingPayments.map((payment) => (
            <Card key={payment.id} className="border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-medium">
                      {payment.orderId}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    Pending
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-2">{formatDate(payment.submittedAt)}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <p className="font-medium">{payment.customer.name}</p>
                  <p className="text-sm text-gray-600">{payment.customer.email}</p>
                  <p className="text-sm text-gray-600">{payment.customer.phone}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Order Summary</p>
                  <p className="text-sm">{payment.orderSummary.items}</p>
                  <p className="font-bold mt-1">Total: ₱{payment.orderSummary.total.toFixed(2)}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment Details</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="size-4 text-blue-600" />
                      <span className="text-sm font-medium capitalize">{payment.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Payment Type:</span>
                      <Badge variant={payment.paymentType === 'full' ? 'default' : 'secondary'}>
                        {payment.paymentType === 'full' ? 'Full Payment' : 'Partial Payment'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold">₱{payment.amountPaid.toFixed(2)}</span>
                    </div>
                    {payment.paymentType === 'partial' && payment.remainingBalance > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-semibold text-orange-600">₱{payment.remainingBalance.toFixed(2)}</span>
                      </div>
                    )}
                    {payment.referenceNumber && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Reference:</span>
                        <span className="font-mono text-xs">{payment.referenceNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full mb-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                    size="sm"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setIsReceiptOpen(true);
                    }}
                  >
                    <Eye className="size-4 mr-1" />
                    View Receipt
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleApprove(payment.id)}
                      disabled={isProcessing === payment.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      {isProcessing === payment.id ? (
                        <Loader2 className="size-4 mr-1 animate-spin" />
                      ) : (
                        <Check className="size-4 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(payment.id)}
                      disabled={isProcessing === payment.id}
                      variant="destructive"
                      size="sm"
                    >
                      {isProcessing === payment.id ? (
                        <Loader2 className="size-4 mr-1 animate-spin" />
                      ) : (
                        <X className="size-4 mr-1" />
                      )}
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {pendingPayments.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheck className="size-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending payment verifications at the moment.</p>
          </div>
        )}
      </div>

      {/* Receipt View Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Receipt - {selectedPayment?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customer:</span>
                  <span className="font-medium">{selectedPayment.customer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Type:</span>
                  <Badge variant={selectedPayment.paymentType === 'full' ? 'default' : 'secondary'}>
                    {selectedPayment.paymentType === 'full' ? 'Full Payment' : 'Partial Payment'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount Paid:</span>
                  <span className="font-semibold">₱{selectedPayment.amountPaid.toFixed(2)}</span>
                </div>
                {selectedPayment.paymentType === 'partial' && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Remaining Balance:</span>
                    <span className="font-semibold text-orange-600">₱{selectedPayment.remainingBalance.toFixed(2)}</span>
                  </div>
                )}
                {selectedPayment.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reference Number:</span>
                    <span className="font-mono text-sm">{selectedPayment.referenceNumber}</span>
                  </div>
                )}
              </div>
              {selectedPayment.receiptUrl ? (
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={selectedPayment.receiptUrl}
                    alt="Payment Receipt"
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="border rounded-lg p-8 text-center text-gray-500">
                  No receipt image available
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
