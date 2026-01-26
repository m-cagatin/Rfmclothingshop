import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  Eye,
  Package,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Truck,
  Palette
} from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

const API_BASE = import.meta.env['VITE_API_BASE'] || 'http://localhost:4000';

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
    productId: number;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    size?: string;
    color?: string;
    customizationData?: {
      productId: number;
      frontDesignUrl?: string;
      backDesignUrl?: string;
      frontCanvasJson?: string;
      backCanvasJson?: string;
    };
  }>;
  total: number;
  balanceRemaining: number;
  status: string;
  orderDate: string | null;
  estimatedCompletion: string | null;
  notes: string | null;
  shipping?: {
    trackingNumber: string | null;
    carrier: string | null;
    shippedDate: string | null;
    estimatedDelivery: string | null;
  } | null;
  payment: {
    id: number;
    method: string;
    status: string;
    amountPaid: number;
    referenceNumber: string | null;
  } | null;
}

const productionColumns = [
  { id: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { id: 'designing', label: 'Designing', color: 'bg-cyan-500' },
  { id: 'ripping', label: 'Ripping', color: 'bg-blue-500' },
  { id: 'heatpress', label: 'Heat Press', color: 'bg-purple-500' },
  { id: 'assembly', label: 'Assembly', color: 'bg-red-600' },
  { id: 'qa', label: 'QA', color: 'bg-orange-500' },
  { id: 'packing', label: 'Packing', color: 'bg-green-500' },
  { id: 'done', label: 'Done', color: 'bg-green-600' },
];

const shippingColumns = [
  { id: 'done', label: 'To Ship', color: 'bg-green-600' },
  { id: 'shipping', label: 'Shipping', color: 'bg-purple-800' },
  { id: 'delivered', label: 'Delivered', color: 'bg-teal-800' },
];

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
}

function DroppableColumn({ id, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white border border-t-0 rounded-b-lg min-h-[500px] p-3 space-y-3 ${
        isOver ? 'bg-blue-50 border-blue-300' : ''
      }`}
    >
      {children}
    </div>
  );
}

interface SortableOrderCardProps {
  order: Order;
  onSetShipping?: (orderId: string) => void;
}

function SortableOrderCard({ order, onSetShipping }: SortableOrderCardProps) {
  const navigate = useNavigate();
  if (!order || !order.id) {
    return null;
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: order.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Filter listeners to only allow left mouse button (button 0)
  const filteredListeners = listeners ? {
    ...listeners,
    onPointerDown: (e: React.PointerEvent) => {
      // Only allow left mouse button (button 0) to trigger drag
      if (e.button !== 0) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Call original handler if it exists
      if (listeners['onPointerDown']) {
        listeners['onPointerDown'](e);
      }
    },
  } : undefined;

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border shadow-sm hover:shadow-md transition-shadow cursor-move" {...attributes} {...(filteredListeners || listeners)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <span className="font-bold">{order.id || 'N/A'}</span>
            {order.items?.some(item => item.customizationData) && (
              <Badge variant="secondary" className="text-xs">
                <Palette className="size-3 mr-1" />
                Custom
              </Badge>
            )}
          </div>
          <p className="text-sm font-medium mt-2">{order.customer?.name || 'Unknown'}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="size-3" />
              <span className="truncate">{order.customer?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-3" />
              <span>{order.customer?.phone || 'N/A'}</span>
            </div>
            <div className="pt-2 border-t">
              <p className="font-bold text-sm text-black">₱{(order.total || 0).toFixed(2)}</p>
              {(order.balanceRemaining || 0) > 0 && (
                <p className="text-xs text-orange-600">Balance: ₱{(order.balanceRemaining || 0).toFixed(2)}</p>
              )}
            </div>
            {onSetShipping && (
              <div className="pt-2 mt-2 border-t">
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetShipping(order.id);
                  }}
                >
                  <Truck className="size-3 mr-2" />
                  Set Shipping
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [activeBoard, setActiveBoard] = useState<'production' | 'shipping'>('production');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadOrders();
  }, []);

  // Check scroll position for scroll buttons
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScroll = () => {
      setShowLeftScroll(container.scrollLeft > 0);
      setShowRightScroll(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    };

    checkScroll();
    container.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [orders, loading]);

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -400, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 400, behavior: 'smooth' });
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/orders`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load orders');
      }

      const data = await response.json();
      // Ensure data is an array and has valid structure
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Invalid orders data format:', data);
        setOrders([]);
        toast.error('Invalid orders data received');
      }
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error(error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrdersByStatus = (status: string) => {
    if (!Array.isArray(orders)) return [];
    return orders.filter(order => order && order.status === status);
  };

  const handleClearAllOrders = async () => {
    setIsClearing(true);
    try {
      const response = await fetch(`${API_BASE}/api/orders/clear-all`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear orders');
      }

      const result = await response.json();
      toast.success(`Cleared ${result.ordersDeleted} orders successfully`);
      setShowClearConfirm(false);
      // Reload orders
      await loadOrders();
    } catch (error: any) {
      console.error('Error clearing orders:', error);
      toast.error(error.message || 'Failed to clear orders');
    } finally {
      setIsClearing(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active) return;

    const orderId = active.id as string;
    if (!orderId) return;

    // Check if dropped on a column (status) or another order
    let newStatus: string;
    
    // Get the appropriate columns based on active board
    const currentColumns = activeBoard === 'production' ? productionColumns : shippingColumns;
    
    // If dropped on a column, use the column id
    const column = currentColumns.find(c => c.id === over.id);
    if (column) {
      newStatus = column.id;
    } else {
      // If dropped on another order, use that order's status
      const targetOrder = orders.find(o => o && o.id === over.id);
      if (!targetOrder || !targetOrder.status) return;
      newStatus = targetOrder.status;
    }

    const order = orders.find(o => o && o.id === orderId);
    if (!order || !order.orderId || order.status === newStatus) return;

    // Save original orders for rollback
    const originalOrders = [...orders];

    // Optimistically update UI
    const updatedOrders = orders.map(o =>
      o && o.id === orderId ? { ...o, status: newStatus } : o
    );
    setOrders(updatedOrders);

    try {
      const response = await fetch(`${API_BASE}/api/orders/${order.orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update order status');
      }

      const currentColumns = activeBoard === 'production' ? productionColumns : shippingColumns;
      toast.success(`Order ${orderId} moved to ${currentColumns.find(c => c.id === newStatus)?.label || newStatus}`);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
      // Revert on error
      setOrders(originalOrders);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 w-full overflow-hidden flex flex-col h-full">
        <div className="mb-4 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Orders</h1>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setActiveBoard('production')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeBoard === 'production'
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package className="size-5" />
                <span className="text-lg">Production Board</span>
              </button>
              <button
                onClick={() => setActiveBoard('shipping')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeBoard === 'shipping'
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Truck className="size-5" />
                <span className="text-lg">Shipping Board</span>
              </button>
            </div>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Order Management</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-shrink-0"
              onClick={() => setShowClearConfirm(true)}
              disabled={isClearing || orders.length === 0}
            >
              <Trash2 className="size-4 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear All Orders'}
            </Button>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Eye className="size-4 mr-2" />
              All View
            </Button>
          </div>
        </div>

        {/* Clear All Confirmation Dialog */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Clear All Orders?</h3>
              <p className="text-gray-600 mb-4">
                This will permanently delete all orders, order items, and payments. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleClearAllOrders}
                  disabled={isClearing}
                >
                  {isClearing ? 'Clearing...' : 'Clear All'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading orders...</p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Status Columns - Horizontal Scroll Container */}
            <div className="relative w-full flex-1 min-h-0">
              {/* Scroll Buttons */}
              {showLeftScroll && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
                  aria-label="Scroll left"
                >
                  <ArrowLeft className="size-5 text-gray-700" />
                </button>
              )}
              {showRightScroll && (
                <button
                  onClick={scrollRight}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-white border border-gray-300 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-all hover:scale-110"
                  aria-label="Scroll right"
                >
                  <ArrowRight className="size-5 text-gray-700" />
                </button>
              )}

              {/* Scroll Container */}
              <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-x-auto overflow-y-auto pb-4 -mx-4 px-4 md:-mx-8 md:px-8 scroll-smooth"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6',
                  scrollBehavior: 'smooth',
                }}
              >
                <div className="flex gap-4 min-w-max">
                {(activeBoard === 'production' ? productionColumns : shippingColumns).map((column) => {
                  const columnOrders = getOrdersByStatus(column.id);
                  return (
                    <div key={column.id} className="flex-shrink-0 w-80">
                      <div className={`${column.color} text-white px-4 py-2 rounded-t-lg flex items-center justify-between`}>
                        <span className="font-medium whitespace-nowrap">{column.label}</span>
                        <span className="bg-white/30 px-2 py-1 rounded text-sm ml-2">{columnOrders.length}</span>
                      </div>
                      <DroppableColumn id={column.id}>
                        <SortableContext
                          items={columnOrders.map(o => o.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {columnOrders.length > 0 ? (
                            columnOrders.map((order) => (
                              <SortableOrderCard 
                                key={order.id} 
                                order={order}
                                onSetShipping={activeBoard === 'shipping' && column.id === 'done' ? () => navigate(`/shipping-details/${order.id}`) : undefined}
                              />
                            ))
                          ) : (
                            <div className="text-center py-12 text-gray-400">
                              <p className="text-sm">No orders</p>
                            </div>
                          )}
                        </SortableContext>
                      </DroppableColumn>
                    </div>
                  );
                })}
                </div>
              </div>

              {/* Scroll Indicator Dots */}
              <div className="flex justify-center gap-2 mt-4">
                {(activeBoard === 'production' ? productionColumns : shippingColumns).map((column, index) => {
                  const columnOrders = getOrdersByStatus(column.id);
                  return (
                    <div
                      key={column.id}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        columnOrders.length > 0
                          ? column.color
                          : 'bg-gray-200'
                      }`}
                      style={{ width: `${Math.max(8, Math.min(columnOrders.length * 2, 40))}px` }}
                      title={`${column.label}: ${columnOrders.length} orders`}
                    />
                  );
                })}
              </div>
            </div>
            <DragOverlay>
              {activeId ? (() => {
                const activeOrder = orders.find(o => o && o.id === activeId);
                if (!activeOrder) return null;
                return (
                  <Card className="border shadow-lg w-80">
                    <CardHeader className="pb-3">
                      <span className="font-bold">{activeOrder.id || 'N/A'}</span>
                      <p className="text-sm font-medium mt-2">{activeOrder.customer?.name || 'Unknown'}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <Mail className="size-3" />
                          <span>{activeOrder.customer?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-3" />
                          <span>{activeOrder.customer?.phone || 'N/A'}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="font-bold text-sm text-black">₱{activeOrder.total?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })() : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </AdminLayout>
  );
}

