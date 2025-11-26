import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Check, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

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
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

// Mock data
const mockPayments: PaymentVerification[] = [
  {
    id: '1',
    orderId: 'ORD-016',
    customer: {
      name: 'marc cagalio',
      email: 'marccagalio@gmail.com',
      phone: '09023542641',
    },
    orderSummary: {
      items: 'Varsity Jacket x1',
      total: 850.00,
    },
    paymentMethod: 'PayMongo',
    status: 'pending',
    submittedAt: '2024-01-15 10:30 AM',
  },
  {
    id: '2',
    orderId: 'ORD-034',
    customer: {
      name: 'marc cagalio',
      email: 'marccagalio@gmail.com',
      phone: '09023542641',
    },
    orderSummary: {
      items: 'Custom T-Shirt x2',
      total: 650.00,
    },
    paymentMethod: 'PayMongo',
    status: 'pending',
    submittedAt: '2024-01-15 11:00 AM',
  },
  {
    id: '3',
    orderId: 'ORD-033',
    customer: {
      name: 'Eunice Lea Barro',
      email: 'customer@customer.com',
      phone: '09391632133',
    },
    orderSummary: {
      items: 'Hoodie x1',
      total: 450.00,
    },
    paymentMethod: 'PayMongo',
    status: 'pending',
    submittedAt: '2024-01-15 09:45 AM',
  },
  {
    id: '4',
    orderId: 'ORD-030',
    customer: {
      name: 'Eunice Lea Barro',
      email: 'customer@customer.com',
      phone: '09391632133',
    },
    orderSummary: {
      items: 'T-Shirt x3',
      total: 750.00,
    },
    paymentMethod: 'PayMongo',
    status: 'pending',
    submittedAt: '2024-01-15 08:15 AM',
  },
];

export function PaymentVerificationPage() {
  const [payments, setPayments] = useState<PaymentVerification[]>(mockPayments);

  const handleApprove = (paymentId: string) => {
    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId ? { ...p, status: 'approved' as const } : p
      )
    );
    toast.success('Payment approved', {
      description: 'The order has been approved and will proceed to production.',
    });
  };

  const handleReject = (paymentId: string) => {
    setPayments(prev =>
      prev.map(p =>
        p.id === paymentId ? { ...p, status: 'rejected' as const } : p
      )
    );
    toast.error('Payment rejected', {
      description: 'The customer will be notified about the rejection.',
    });
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');

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
                  <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded text-sm font-medium">
                    Pending Verification
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{payment.submittedAt}</p>
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
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-blue-600" />
                    <span className="text-sm font-medium">{payment.paymentMethod}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    className="w-full mb-2 text-blue-600 border-blue-600 hover:bg-blue-50"
                    size="sm"
                  >
                    Review Details
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleApprove(payment.id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Check className="size-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(payment.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <X className="size-4 mr-1" />
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
    </AdminLayout>
  );
}
