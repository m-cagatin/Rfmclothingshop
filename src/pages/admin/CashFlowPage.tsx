import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', income: 145000, expenses: 89000, profit: 56000 },
  { month: 'Feb', income: 162000, expenses: 95000, profit: 67000 },
  { month: 'Mar', income: 138000, expenses: 92000, profit: 46000 },
  { month: 'Apr', income: 181000, expenses: 102000, profit: 79000 },
  { month: 'May', income: 174000, expenses: 98000, profit: 76000 },
  { month: 'Jun', income: 197000, expenses: 105000, profit: 92000 },
];

const recentTransactions = [
  { id: '1', type: 'income', description: 'Order Payment - ORD-016', amount: 850, date: '2024-01-15' },
  { id: '2', type: 'income', description: 'Order Payment - ORD-034', amount: 650, date: '2024-01-15' },
  { id: '3', type: 'expense', description: 'Fabric Purchase', amount: 12500, date: '2024-01-14' },
  { id: '4', type: 'income', description: 'Order Payment - ORD-033', amount: 450, date: '2024-01-14' },
  { id: '5', type: 'expense', description: 'Shipping Costs', amount: 3200, date: '2024-01-13' },
  { id: '6', type: 'income', description: 'Order Payment - ORD-030', amount: 750, date: '2024-01-13' },
  { id: '7', type: 'expense', description: 'Equipment Maintenance', amount: 5500, date: '2024-01-12' },
  { id: '8', type: 'income', description: 'Order Payment - ORD-028', amount: 920, date: '2024-01-12' },
];

export function CashFlowPage() {
  const totalIncome = monthlyData[monthlyData.length - 1].income;
  const totalExpenses = monthlyData[monthlyData.length - 1].expenses;
  const netProfit = monthlyData[monthlyData.length - 1].profit;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cash Flow</h1>
            <p className="text-gray-600">Monitor income, expenses, and profitability</p>
          </div>
          <Button variant="outline">
            <Calendar className="size-4 mr-2" />
            This Month
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                  <ArrowUpCircle className="size-6" />
                </div>
                <TrendingUp className="size-4 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-1">₱{totalIncome.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Total Income</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-red-100 text-red-600 p-3 rounded-lg">
                  <ArrowDownCircle className="size-6" />
                </div>
                <TrendingDown className="size-4 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-1">₱{totalExpenses.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                  <DollarSign className="size-6" />
                </div>
                <TrendingUp className="size-4 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-1">₱{netProfit.toLocaleString()}</h3>
              <p className="text-sm text-gray-600">Net Profit</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                  <TrendingUp className="size-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{profitMargin}%</h3>
              <p className="text-sm text-gray-600">Profit Margin</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profit Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} name="Profit" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === 'income'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? (
                        <ArrowUpCircle className="size-5" />
                      ) : (
                        <ArrowDownCircle className="size-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
