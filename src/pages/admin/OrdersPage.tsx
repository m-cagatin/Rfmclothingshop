import { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  Eye
} from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  total: number;
  status: 'pending' | 'designing' | 'paid' | 'sent-rider' | 'completed' | 'ready-pickup' | 'ready-ship' | 'cancelled';
  statusAction?: string;
}

const mockOrders: Order[] = [
  { id: 'ORD-015', customer: 'marc cagalio', email: 'marccagalio@gmail.com', phone: '09023542641', total: 840.00, status: 'pending', statusAction: 'Designing' },
  { id: 'ORD-012', customer: 'Eunice Lea Barro', email: 'customer@customer.com', phone: '09391632133', total: 750.00, status: 'pending', statusAction: 'Designing' },
  { id: 'ORD-002', customer: 'marc cagalio', email: 'marccagalio@gmail.com', phone: '09023542641', total: 350.00, status: 'designing', statusAction: 'Shipping' },
  { id: 'ORD-001', customer: 'Eunice Lea Barro', email: 'customer@customer.com', phone: '09391632133', total: 750.00, status: 'designing', statusAction: 'Cancelled' },
  { id: 'ORD-008', customer: 'marc cagalio', email: 'marccagalio@gmail.com', phone: '09023542641', total: 840.00, status: 'ready-ship' },
  { id: 'ORD-011', customer: 'marc cagalio', email: 'marccagalio@gmail.com', phone: '09023542641', total: 840.00, status: 'cancelled' },
  { id: 'ORD-007', customer: 'marc cagalio', email: 'marccagalio@gmail.com', phone: '09023542641', total: 840.00, status: 'cancelled' },
  { id: 'ORD-006', customer: 'marc cagalio', email: 'marccagalio@gmail.com', phone: '09023542641', total: 840.00, status: 'cancelled' },
  { id: 'ORD-005', customer: 'marc cagalio', email: 'marccagalio@gmail.com', phone: '09023542641', total: 840.00, status: 'cancelled' },
];

const statusColumns = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-500', count: 3 },
  { id: 'designing', label: 'Designing', color: 'bg-cyan-500', count: 2 },
  { id: 'paid', label: 'Paid', color: 'bg-blue-600', count: 0 },
  { id: 'sent-rider', label: 'sent to rider', color: 'bg-gray-500', count: 0 },
  { id: 'completed', label: 'completed', color: 'bg-black', count: 0 },
  { id: 'ready-pickup', label: 'ready for pickup', color: 'bg-green-600', count: 0 },
  { id: 'ready-ship', label: 'ready to ship', color: 'bg-teal-600', count: 1 },
  { id: 'cancelled', label: 'Cancelled', color: 'bg-red-600', count: 4 },
];

export function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orders</h1>
            <div className="flex items-center gap-2">
              <Package className="size-5 text-gray-600" />
              <h2 className="text-xl font-semibold">Production Board</h2>
            </div>
            <p className="text-gray-600 mt-1">Order Management</p>
          </div>
          <Button variant="outline" size="sm">
            <Eye className="size-4 mr-2" />
            All View
          </Button>
        </div>

        {/* Status Columns */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((column) => {
            const columnOrders = getOrdersByStatus(column.id);
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                <div className={`${column.color} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                  <span className="font-medium">{column.label}</span>
                  <span className="bg-white/30 px-2 py-1 rounded text-sm">{columnOrders.length}</span>
                </div>
                <div className="bg-white border border-t-0 rounded-b-lg min-h-[500px] p-3 space-y-3">
                  {columnOrders.length > 0 ? (
                    columnOrders.map((order) => (
                      <Card key={order.id} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{order.id}</span>
                            {order.statusAction && (
                              <select className="text-xs border rounded px-2 py-1">
                                <option>{order.statusAction}</option>
                              </select>
                            )}
                          </div>
                          <p className="text-sm font-medium mt-2">{order.customer}</p>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="size-3" />
                              <span>{order.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="size-3" />
                              <span>{order.phone}</span>
                            </div>
                            <div className="pt-2 border-t">
                              <p className="font-bold text-sm text-black">₱{order.total.toFixed(2)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-sm">No orders</p>
                    </div>
                  )}
                </div>
                {/* Pagination */}
                {columnOrders.length > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Button variant="ghost" size="icon" className="size-6">
                      <ChevronLeft className="size-4" />
                    </Button>
                    <div className="h-1 bg-gray-300 rounded-full w-24">
                      <div className="h-1 bg-gray-600 rounded-full" style={{ width: '50%' }} />
                    </div>
                    <Button variant="ghost" size="icon" className="size-6">
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}

// Import Package icon
function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16.5 9.4 7.55 4.24" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" x2="12" y1="22" y2="12" />
    </svg>
  );
}
