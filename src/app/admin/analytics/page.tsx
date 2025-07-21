'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import AdminRoute from '@/components/admin/AdminRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Download,
  Bot
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsers: number;
    totalConversations: number;
    totalMessages: number;
    activeUsers: number;
  };
  userRegistrations: Array<{
    date: string;
    count: number;
  }>;
  modelUsage: Array<{
    modelId: string;
    modelName: string;
    count: number;
  }>;
}

export default function AnalyticsPage() {
  const { adminUser } = useAdminAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?period=${period}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <AdminRoute>
      <AdminLayout
        title="Analytics Dashboard"
        adminUser={adminUser ? {
          name: adminUser.name,
          email: adminUser.email,
          isAdmin: adminUser.isAdmin,
        } : undefined}
        actions={
          <div className="flex items-center space-x-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={exportAnalytics}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData?.overview.totalUsers.toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-green-500 text-sm font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{analyticsData?.overview.newUsers} new
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      in {period === 'day' ? 'last 24h' : period === 'week' ? 'last 7d' : period === 'month' ? 'last 30d' : 'last year'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData?.overview.activeUsers.toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-blue-500 text-sm font-medium">
                      {((analyticsData?.overview.activeUsers || 0) / (analyticsData?.overview.totalUsers || 1) * 100).toFixed(1)}% active
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      of total users
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversations</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData?.overview.totalConversations.toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-purple-500 text-sm font-medium">
                      {((analyticsData?.overview.totalConversations || 0) / (analyticsData?.overview.totalUsers || 1)).toFixed(1)} avg
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      per user
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                    <MessageSquare className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Messages</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {analyticsData?.overview.totalMessages.toLocaleString()}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-yellow-500 text-sm font-medium">
                      {((analyticsData?.overview.totalMessages || 0) / (analyticsData?.overview.totalConversations || 1)).toFixed(1)} avg
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      per conversation
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
                    <Bot className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Top Model</p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                      {analyticsData?.modelUsage[0]?.modelName || 'N/A'}
                    </h3>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-red-500 text-sm font-medium">
                      {analyticsData?.modelUsage[0]?.count.toLocaleString() || 0} uses
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      most popular
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Registrations Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                User Registrations
              </h3>
              <div className="h-64">
                {analyticsData?.userRegistrations && analyticsData.userRegistrations.length > 0 ? (
                  <div className="flex h-full items-end space-x-2">
                    {analyticsData.userRegistrations.map((item, index) => {
                      const maxCount = Math.max(...analyticsData.userRegistrations.map(i => i.count));
                      const height = (item.count / maxCount) * 100;
                      const date = new Date(item.date);
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1">
                          <div 
                            className="w-full bg-blue-500 dark:bg-blue-600 rounded-t-sm hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                            title={`${item.count} users on ${date.toLocaleDateString()}`}
                          ></div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 transform -rotate-45 origin-top-left">
                            {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 dark:text-gray-400">No registration data available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Model Usage */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Model Usage
              </h3>
              <div className="space-y-4">
                {analyticsData?.modelUsage && analyticsData.modelUsage.length > 0 ? (
                  analyticsData.modelUsage.map((model, index) => {
                    const totalUses = analyticsData.modelUsage.reduce((sum, m) => sum + m.count, 0);
                    const percentage = (model.count / totalUses) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{model.modelName}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">{model.count.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No model usage data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminRoute>
  );
}