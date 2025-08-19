/**
 * Subscription Plans Management Dashboard
 * 
 * Admin interface for managing subscription plans, pricing, and PayU integration
 */

'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SubscriptionMetrics {
  totalRevenue: number;
  activeSubscriptions: number;
  monthlyRecurring: number;
  churnRate: number;
  averageRevenuePerUser: number;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  currency: string;
  isPopular: boolean;
  isActive: boolean;
  subscriberCount: number;
  features: string[];
  limits: {
    strategiesPerMonth: number | 'unlimited';
    aiGenerations: number | 'unlimited';
    aiChatAccess: boolean;
    scriptStorage: number | 'unlimited';
  };
}

interface PaymentTransaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'APPROVED' | 'DECLINED' | 'CANCELED';
  paymentMethod: string;
  planName: string;
  createdAt: string;
  payuTransactionId?: string;
}

export default function SubscriptionManagementPage() {
  const [metrics, setMetrics] = useState<SubscriptionMetrics | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'plans' | 'transactions'>('overview');

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Subscriptions', icon: 'CreditCard' },
  ];

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch metrics
      const metricsResponse = await fetch('/api/admin/subscriptions/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData.metrics);
      }

      // Fetch plans
      const plansResponse = await fetch('/api/admin/subscriptions/plans');
      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans);
      }

      // Fetch recent transactions
      const transactionsResponse = await fetch('/api/admin/subscriptions/transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        setTransactions(transactionsData.transactions);
      }

    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlan = async (planId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        toast.success(`Plan ${!isActive ? 'activated' : 'deactivated'} successfully`);
        fetchSubscriptionData();
      } else {
        toast.error('Failed to update plan status');
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'DECLINED': return 'bg-red-100 text-red-800';
      case 'CANCELED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <AdminLayout 
      title="Subscription Management" 
      breadcrumbs={breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSubscriptionData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'plans', label: 'Plans', icon: CreditCard },
              { id: 'transactions', label: 'Transactions', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.totalRevenue || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All-time revenue
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.activeSubscriptions || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.monthlyRecurring || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    MRR this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(metrics?.churnRate || 0).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monthly churn
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">ARPU</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(metrics?.averageRevenuePerUser || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average revenue per user
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card key={plan.id} className={`relative ${plan.isPopular ? 'ring-2 ring-blue-500' : ''}`}>
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{plan.displayName}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </div>
                      <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Pricing */}
                      <div>
                        <div className="text-3xl font-bold">
                          {formatCurrency(plan.monthlyPrice)}
                          <span className="text-sm font-normal text-gray-500">/month</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          or {formatCurrency(plan.annualPrice)}/year
                        </div>
                      </div>

                      {/* Subscriber Count */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Subscribers</span>
                        <span className="font-medium">{plan.subscriberCount}</span>
                      </div>

                      {/* Key Features */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Key Features:</div>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• {plan.limits.strategiesPerMonth === 'unlimited' ? 'Unlimited' : plan.limits.strategiesPerMonth} strategies/month</li>
                          <li>• {plan.limits.aiGenerations === 'unlimited' ? 'Unlimited' : plan.limits.aiGenerations} AI generations</li>
                          <li>• {plan.limits.aiChatAccess ? 'AI Chat Access' : 'No AI Chat'}</li>
                          <li>• {plan.limits.scriptStorage === 'unlimited' ? 'Unlimited' : plan.limits.scriptStorage} script storage</li>
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant={plan.isActive ? "destructive" : "default"}
                          onClick={() => handleTogglePlan(plan.id, plan.isActive)}
                        >
                          {plan.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>
                PayU payment transactions and subscription payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Transaction ID</th>
                      <th className="text-left p-4 font-medium">User</th>
                      <th className="text-left p-4 font-medium">Plan</th>
                      <th className="text-left p-4 font-medium">Amount</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Payment Method</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="text-center p-8">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                            Loading transactions...
                          </div>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center p-8 text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-mono text-sm">
                            {transaction.payuTransactionId || transaction.id.slice(0, 8)}
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{transaction.userName}</div>
                              <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline">{transaction.planName}</Badge>
                          </td>
                          <td className="p-4 font-mono">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </td>
                          <td className="p-4">
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="p-4">{transaction.paymentMethod || 'PayU'}</td>
                          <td className="p-4 text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}