import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface CashflowEntry {
  id: number;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'in' | 'out';
  vendor?: string;
  paymentMethod?: string;
  referenceNumber?: string;
}

interface CashflowReport {
  period: string;
  startDate: string;
  endDate: string;
  totalMoneyIn: number;
  totalMoneyOut: number;
  netCashflow: number;
  transactions: CashflowEntry[];
}

export function CashFlowPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<CashflowReport | null>(null);
  const [transactions, setTransactions] = useState<CashflowEntry[]>([]);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Get current month report
  const loadCashflowData = async () => {
    try {
      setLoading(true);
      
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      // Load monthly report
      const reportResponse = await fetch(
        `${API_BASE}/api/cashflow/report?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        { credentials: 'include' }
      );

      if (reportResponse.ok) {
        const reportData = await reportResponse.json();
        setReport(reportData);
      } else if (reportResponse.status === 401) {
        toast.error('Unauthorized. Please log in again.');
        return;
      }

      // Load all transactions
      const transactionsResponse = await fetch(
        `${API_BASE}/api/cashflow`,
        { credentials: 'include' }
      );

      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData);
      } else if (transactionsResponse.status === 401) {
        toast.error('Unauthorized. Please log in again.');
      }
    } catch (error) {
      console.error('Error loading cashflow:', error);
      toast.error('Failed to load cashflow data');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      const response = await fetch(`${API_BASE}/api/cashflow/reset/all`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast.success('Cashflow and reports reset successfully');
        setShowResetDialog(false);
        await loadCashflowData();
      } else if (response.status === 401) {
        toast.error('Unauthorized. Please log in again.');
      } else {
        const error = await response.json().catch(() => ({ error: 'Failed to reset' }));
        toast.error(error.error || 'Failed to reset cashflow');
      }
    } catch (error) {
      console.error('Error resetting cashflow:', error);
      toast.error('Failed to reset cashflow');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    loadCashflowData();
  }, []);

  const totalIncome = report?.totalMoneyIn || 0;
  const totalExpenses = report?.totalMoneyOut || 0;
  const netProfit = report?.netCashflow || 0;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0.0';

  // Prepare chart data from transactions (last 6 months)
  const prepareChartData = () => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income: 0,
        expenses: 0,
        profit: 0,
      });
    }

    transactions.forEach((entry) => {
      const entryDate = new Date(entry.date);
      const monthIndex = months.findIndex(
        (m) => new Date(m.month + ' 1, ' + entryDate.getFullYear()).getMonth() === entryDate.getMonth()
      );
      
      if (monthIndex >= 0) {
        if (entry.type === 'in') {
          months[monthIndex].income += entry.amount;
        } else {
          months[monthIndex].expenses += entry.amount;
        }
        months[monthIndex].profit = months[monthIndex].income - months[monthIndex].expenses;
      }
    });

    return months;
  };

  const chartData = prepareChartData();
  const recentTransactions = transactions.slice(0, 10);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cashflow data...</p>
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
            <h1 className="text-3xl font-bold mb-2">Cash Flow</h1>
            <p className="text-gray-600">Monitor income, expenses, and profitability</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadCashflowData}>
              <RefreshCw className="size-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={() => setShowResetDialog(true)} className="text-red-600 hover:text-red-700">
              <Trash2 className="size-4 mr-2" />
              Reset Data
            </Button>
            <Button variant="outline">
              <Calendar className="size-4 mr-2" />
              This Month
            </Button>
          </div>
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
                <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                  <DollarSign className="size-6" />
                </div>
                {netProfit >= 0 ? (
                  <TrendingUp className="size-4 text-green-600" />
                ) : (
                  <TrendingDown className="size-4 text-red-600" />
                )}
              </div>
              <h3 className={`text-2xl font-bold mb-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{netProfit.toLocaleString()}
              </h3>
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
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
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
                  <LineChart data={chartData}>
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
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions yet</p>
                <p className="text-sm mt-2">Transactions will appear here when payments are approved</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          transaction.type === 'in'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'in' ? (
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
                          {transaction.referenceNumber && ` • Ref: ${transaction.referenceNumber}`}
                        </p>
                      </div>
                    </div>
                    <p
                      className={`font-bold ${
                        transaction.type === 'in' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'in' ? '+' : '-'}₱{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Cashflow & Reports</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all cashflow data and reports? This action cannot be undone.
              All income and expense entries will be deleted, and reports will show zero values.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={resetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {resetting ? 'Resetting...' : 'Reset All Data'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
