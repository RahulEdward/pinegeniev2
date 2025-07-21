'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import EnhancedMetricsCard from '@/components/admin/EnhancedMetricsCard';
import SystemStatusCard from '@/components/admin/SystemStatusCard';
import AdminDashboardTest from '@/components/admin/AdminDashboardTest';
import { Users, Bot, TrendingUp, Activity, DollarSign, Shield } from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  totalModels: number;
  totalConversations: number;
  activeModels: number;
}

export default function AdminPage() {
  const { adminUser, isLoading, isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 0,
    totalModels: 0,
    totalConversations: 0,
    activeModels: 0,
  });
  const [metricsLoading, setMetricsLoading] = useState(true);

  // Remove client-side redirect since middleware handles it
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/admin/login');
  //   }
  // }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMetrics();
    }
  }, [isAuthenticated]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/admin/metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !adminUser) {
    return null; // Will redirect in useEffect
  }

  return (
    <AdminRoute>
      <AdminLayout 
        title="Dashboard"
        adminUser={{
          name: adminUser.name,
          email: adminUser.email,
          isAdmin: adminUser.isAdmin,
        }}
      >
      <div className="space-y-8">
        {/* Session Test */}
        <AdminDashboardTest />

        {/* Demo Mode Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Demo Mode Active
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                PineGenie AI is running in demo mode with mock responses. Add your API keys to enable full functionality.
              </p>
              <div className="mt-3">
                <a
                  href="/admin/models"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500"
                >
                  Configure API Keys →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedMetricsCard
            title="Total Users"
            value={metricsLoading ? 0 : metrics.totalUsers}
            change={{
              value: 12,
              period: 'last month',
              trend: 'up'
            }}
            icon="Users"
            color="blue"
            loading={metricsLoading}
          />
          
          <EnhancedMetricsCard
            title="AI Models"
            value={metricsLoading ? 0 : metrics.totalModels}
            change={{
              value: 2,
              period: 'last week',
              trend: 'up'
            }}
            icon="Bot"
            color="green"
            loading={metricsLoading}
          />
          
          <EnhancedMetricsCard
            title="Conversations"
            value={metricsLoading ? 0 : metrics.totalConversations}
            change={{
              value: 25,
              period: 'last month',
              trend: 'up'
            }}
            icon="MessageSquare"
            color="purple"
            loading={metricsLoading}
          />
          
          <EnhancedMetricsCard
            title="Active Models"
            value={metricsLoading ? 0 : metrics.activeModels}
            icon="TrendingUp"
            color="yellow"
            loading={metricsLoading}
          />
        </div>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EnhancedMetricsCard
            title="Monthly Revenue"
            value={4250}
            change={{
              value: 8,
              period: 'vs last month',
              trend: 'up'
            }}
            icon="DollarSign"
            color="green"
            format="currency"
            loading={metricsLoading}
          />
          
          <EnhancedMetricsCard
            title="System Uptime"
            value="99.9"
            subtitle="Last 30 days"
            icon="Activity"
            color="teal"
            format="percentage"
            loading={metricsLoading}
          />
          
          <EnhancedMetricsCard
            title="Security Events"
            value={3}
            change={{
              value: -50,
              period: 'vs last week',
              trend: 'down'
            }}
            icon="Shield"
            color="red"
            loading={metricsLoading}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/models"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Bot className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Manage AI Models</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure OpenAI and Claude models
              </p>
            </a>
            
            <a
              href="/admin/users"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Users className="w-8 h-8 text-green-500 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">User Management</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View and manage user accounts
              </p>
            </a>
            
            <a
              href="/admin/analytics"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-purple-500 mb-2" />
              <h4 className="font-medium text-gray-900 dark:text-white">Analytics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View system performance metrics
              </p>
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  New user registered
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                2 minutes ago
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  AI model updated
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                1 hour ago
              </span>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-900 dark:text-white">
                  System backup completed
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                3 hours ago
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
    </AdminRoute>
  );
}