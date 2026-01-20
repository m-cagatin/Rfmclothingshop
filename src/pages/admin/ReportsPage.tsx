import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface Order {
  id: string;
  orderId: number;
  total: number;
  status: string;
  orderDate: string | null;
  customer: {
    email: string;
  };
}

interface CashflowEntry {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'in' | 'out';
}

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cashflow, setCashflow] = useState<CashflowEntry[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [uniqueCustomers, setUniqueCustomers] = useState(0);
  const [productsSold, setProductsSold] = useState(0);

  const loadReportsData = async () => {
    try {
      setLoading(true);

      // Load orders
      const ordersResponse = await fetch(`${API_BASE}/api/orders`, {
        credentials: 'include',
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else if (ordersResponse.status === 401) {
        toast.error('Unauthorized. Please log in again.');
        return;
      }

      // Load cashflow
      const cashflowResponse = await fetch(`${API_BASE}/api/cashflow`, {
        credentials: 'include',
      });

      if (cashflowResponse.ok) {
        const cashflowData = await cashflowResponse.json();
        setCashflow(Array.isArray(cashflowData) ? cashflowData : []);
      } else if (cashflowResponse.status === 401) {
        toast.error('Unauthorized. Please log in again.');
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportsData();
  }, []);

  // Calculate stats from data
  useEffect(() => {
    // Total revenue from cashflow income
    const revenue = cashflow
      .filter(entry => entry.type === 'in')
      .reduce((sum, entry) => sum + entry.amount, 0);
    setTotalRevenue(revenue);

    // Total orders
    setTotalOrders(orders.length);

    // Unique customers
    const uniqueEmails = new Set(orders.map(order => order.customer?.email).filter(Boolean));
    setUniqueCustomers(uniqueEmails.size);

    // Products sold (sum of all order items quantities)
    // For now, we'll use order count as approximation
    setProductsSold(orders.length);
  }, [orders, cashflow]);

  // Prepare sales data (last 6 months)
  const prepareSalesData = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0,
        orders: 0,
      });
    }

    // Add revenue from cashflow
    cashflow.forEach((entry) => {
      if (entry.type === 'in') {
        const entryDate = new Date(entry.date);
        const monthIndex = months.findIndex(
          (m) => {
            const monthDate = new Date(m.month + ' 1, ' + entryDate.getFullYear());
            return monthDate.getMonth() === entryDate.getMonth() && monthDate.getFullYear() === entryDate.getFullYear();
          }
        );
        if (monthIndex >= 0) {
          months[monthIndex].revenue += entry.amount;
        }
      }
    });

    // Add orders count
    orders.forEach((order) => {
      if (order.orderDate) {
        const orderDate = new Date(order.orderDate);
        const monthIndex = months.findIndex(
          (m) => {
            const monthDate = new Date(m.month + ' 1, ' + orderDate.getFullYear());
            return monthDate.getMonth() === orderDate.getMonth() && monthDate.getFullYear() === orderDate.getFullYear();
          }
        );
        if (monthIndex >= 0) {
          months[monthIndex].orders += 1;
        }
      }
    });

    return months;
  };

  const salesData = prepareSalesData();

  // Calculate product category data (simplified - would need order items data)
  const productCategoryData = [
    { name: 'Custom Orders', value: orders.length, color: '#3b82f6' },
  ];

  // Top products (simplified - would need order items data)
  const topProducts: Array<{ name: string; sold: number; revenue: number }> = [];

  const stats = [
    {
      title: 'Total Revenue',
      value: `₱${totalRevenue.toLocaleString()}`,
      change: '+0%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Total Orders',
      value: totalOrders.toString(),
      change: '+0%',
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'New Customers',
      value: uniqueCustomers.toString(),
      change: '+0%',
      trend: 'up' as const,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Products Sold',
      value: productsSold.toString(),
      change: '+0%',
      trend: 'up' as const,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-gray-600">Track your business performance and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadReportsData}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Calendar className="size-4 mr-2" />
              Last 6 Months
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="size-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                      <Icon className="size-6" />
                    </div>
                    <div className="flex items-center gap-1">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="size-4 text-green-600" />
                      ) : (
                        <TrendingDown className="size-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.length > 0 && salesData.some(d => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No revenue data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Orders Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {salesData.length > 0 && salesData.some(d => d.orders > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="orders" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No orders data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {productCategoryData.length > 0 && productCategoryData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No category data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between pb-4 border-b last:border-0">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sold} units sold</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">₱{product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No product sales data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
