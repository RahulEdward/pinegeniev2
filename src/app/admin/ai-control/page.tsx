'use client';

import { useState, useEffect } from 'react';
import { 
  Bot, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Users
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  usage: {
    requests: number;
    tokens: number;
    cost: number;
  };
  limits: {
    requestsPerHour: number;
    tokensPerDay: number;
    maxCostPerDay: number;
  };
  lastUsed: string | null;
}

interface AISettings {
  globalEnabled: boolean;
  defaultModel: string;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  contentFiltering: {
    enabled: boolean;
    strictMode: boolean;
  };
  logging: {
    enabled: boolean;
    level: 'basic' | 'detailed' | 'debug';
  };
  autoModeration: {
    enabled: boolean;
    flagInappropriate: boolean;
    blockHarmful: boolean;
  };
}

export default function AIControlPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [settings, setSettings] = useState<AISettings>({
    globalEnabled: true,
    defaultModel: 'pine-genie',
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 10,
      requestsPerHour: 100
    },
    contentFiltering: {
      enabled: true,
      strictMode: false
    },
    logging: {
      enabled: true,
      level: 'basic'
    },
    autoModeration: {
      enabled: true,
      flagInappropriate: true,
      blockHarmful: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeUsers: 0,
    errorRate: 0,
    avgResponseTime: 0
  });

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      setLoading(true);
      const [modelsRes, settingsRes, statsRes] = await Promise.all([
        fetch('/api/admin/ai/models'),
        fetch('/api/admin/ai/settings'),
        fetch('/api/admin/ai/stats')
      ]);

      if (modelsRes.ok) {
        const modelsData = await modelsRes.json();
        setModels(modelsData.models || []);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings || settings);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching AI data:', error);
      toast.error('Failed to load AI control data');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AISettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      const response = await fetch('/api/admin/ai/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      if (response.ok) {
        setSettings(updatedSettings);
        toast.success('AI settings updated successfully');
      } else {
        toast.error('Failed to update AI settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update AI settings');
    }
  };

  const toggleModel = async (modelId: string, status: 'active' | 'inactive') => {
    try {
      const response = await fetch(`/api/admin/ai/models/${modelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setModels(prev => prev.map(model => 
          model.id === modelId ? { ...model, status } : model
        ));
        toast.success(`Model ${status === 'active' ? 'activated' : 'deactivated'}`);
      } else {
        toast.error('Failed to update model status');
      }
    } catch (error) {
      console.error('Error updating model:', error);
      toast.error('Failed to update model status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Control Center</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage AI models, settings, and monitoring</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              settings.globalEnabled 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              AI {settings.globalEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <MessageSquare className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRequests.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Error Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.errorRate}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgResponseTime}ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global AI Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Global AI Settings
            </h2>
          </div>
          <div className="p-6 space-y-6">
            {/* Global Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">AI System Status</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enable or disable all AI functionality</p>
              </div>
              <button
                onClick={() => updateSettings({ globalEnabled: !settings.globalEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.globalEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.globalEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Rate Limiting */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Rate Limiting</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Control API request limits</p>
                </div>
                <button
                  onClick={() => updateSettings({ 
                    rateLimiting: { ...settings.rateLimiting, enabled: !settings.rateLimiting.enabled }
                  })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.rateLimiting.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.rateLimiting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {settings.rateLimiting.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Requests per minute
                    </label>
                    <input
                      type="number"
                      value={settings.rateLimiting.requestsPerMinute}
                      onChange={(e) => updateSettings({
                        rateLimiting: { 
                          ...settings.rateLimiting, 
                          requestsPerMinute: parseInt(e.target.value) 
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Requests per hour
                    </label>
                    <input
                      type="number"
                      value={settings.rateLimiting.requestsPerHour}
                      onChange={(e) => updateSettings({
                        rateLimiting: { 
                          ...settings.rateLimiting, 
                          requestsPerHour: parseInt(e.target.value) 
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Content Filtering */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Content Filtering</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Filter inappropriate content</p>
              </div>
              <button
                onClick={() => updateSettings({ 
                  contentFiltering: { ...settings.contentFiltering, enabled: !settings.contentFiltering.enabled }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.contentFiltering.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.contentFiltering.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Auto Moderation */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Auto Moderation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically moderate harmful content</p>
              </div>
              <button
                onClick={() => updateSettings({ 
                  autoModeration: { ...settings.autoModeration, enabled: !settings.autoModeration.enabled }
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoModeration.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoModeration.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* AI Models Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Bot className="w-5 h-5 mr-2" />
              AI Models
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {models.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Bot className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {model.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {model.provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(model.status)}
                        <span className={`ml-2 text-sm font-medium ${
                          model.status === 'active' ? 'text-green-600' :
                          model.status === 'error' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div>
                        <div>{model.usage.requests.toLocaleString()} requests</div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {model.usage.tokens.toLocaleString()} tokens
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${model.usage.cost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => toggleModel(
                          model.id, 
                          model.status === 'active' ? 'inactive' : 'active'
                        )}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          model.status === 'active'
                            ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                        }`}
                      >
                        {model.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}