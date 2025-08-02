'use client';

import { useState, useEffect } from 'react';
import { Key, Plus, Edit, Trash2, Eye, EyeOff, TestTube, Shield } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import toast from 'react-hot-toast';

interface ApiKeyData {
  id: string;
  provider: string;
  keyName: string;
  maskedKey: string;
  isActive: boolean;
  lastUsed: Date | null;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKeyData | null>(null);
  const [encryptionStatus, setEncryptionStatus] = useState<string>('unknown');

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/api-keys');
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }

      const data = await response.json();
      setApiKeys(data.apiKeys || []);
      setAvailableProviders(data.availableProviders || []);
      setEncryptionStatus(data.encryptionStatus || 'unknown');
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleAddApiKey = async (keyData: { provider: string; keyName: string; apiKey: string }) => {
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(keyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add API key');
      }

      toast.success('API key added successfully');
      setShowAddModal(false);
      fetchApiKeys();
    } catch (error) {
      console.error('Error adding API key:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add API key');
    }
  };

  const handleUpdateApiKey = async (id: string, updates: { keyName?: string; apiKey?: string; isActive?: boolean }) => {
    try {
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update API key');
      }

      toast.success('API key updated successfully');
      setEditingKey(null);
      fetchApiKeys();
    } catch (error) {
      console.error('Error updating API key:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update API key');
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete API key');
      }

      toast.success('API key deleted successfully');
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete API key');
    }
  };

  const getProviderDisplayName = (provider: string): string => {
    const names: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google AI',
      deepseek: 'DeepSeek',
      ollama: 'Ollama'
    };
    return names[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  const getProviderColor = (provider: string): string => {
    const colors: Record<string, string> = {
      openai: 'bg-green-100 text-green-800',
      anthropic: 'bg-orange-100 text-orange-800',
      google: 'bg-blue-100 text-blue-800',
      deepseek: 'bg-purple-100 text-purple-800',
      ollama: 'bg-gray-100 text-gray-800'
    };
    return colors[provider] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <AdminLayout title="API Key Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'API Keys', icon: 'Key' },
  ];

  return (
    <AdminLayout 
      title="API Key Management" 
      breadcrumbs={breadcrumbs}
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add API Key
        </button>
      }
    >
      <div className="space-y-6">
        {/* Encryption Status */}
        <div className={`p-4 rounded-lg border ${
          encryptionStatus === 'working' 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          <div className="flex items-start">
            <Shield className={`w-5 h-5 mt-0.5 mr-3 ${
              encryptionStatus === 'working' ? 'text-green-600' : 'text-red-600'
            }`} />
            <div>
              <h3 className={`text-sm font-medium ${
                encryptionStatus === 'working' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
              }`}>
                {encryptionStatus === 'working' ? 'Encryption Active' : 'Encryption Issue'}
              </h3>
              <p className={`text-sm mt-1 ${
                encryptionStatus === 'working' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
              }`}>
                {encryptionStatus === 'working' 
                  ? 'All API keys are encrypted with AES-256 encryption and stored securely in the database.'
                  : 'Encryption system is not working properly. Check your ENCRYPTION_KEY environment variable.'
                }
              </p>
              {encryptionStatus !== 'working' && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                  <p>Add ENCRYPTION_KEY to your .env.local file:</p>
                  <code className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                    ENCRYPTION_KEY=your_64_character_hex_key_here
                  </code>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Keys List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stored API Keys
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage encrypted API keys for AI providers
            </p>
          </div>

          {apiKeys.length === 0 ? (
            <div className="p-8 text-center">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No API Keys
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add your first API key to enable AI models
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add API Key
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Key Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {apiKeys.map((apiKey) => (
                    <tr key={apiKey.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProviderColor(apiKey.provider)}`}>
                          {getProviderDisplayName(apiKey.provider)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {apiKey.keyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600 dark:text-gray-400">
                        {apiKey.maskedKey}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          apiKey.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {apiKey.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        <div>
                          <div>{apiKey.usageCount} requests</div>
                          {apiKey.lastUsed && (
                            <div className="text-xs text-gray-500">
                              Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateApiKey(apiKey.id, { isActive: !apiKey.isActive })}
                            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                              apiKey.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {apiKey.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => setEditingKey(apiKey)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteApiKey(apiKey.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add API Key Modal */}
      {showAddModal && (
        <AddApiKeyModal
          availableProviders={availableProviders}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddApiKey}
        />
      )}

      {/* Edit API Key Modal */}
      {editingKey && (
        <EditApiKeyModal
          apiKey={editingKey}
          onClose={() => setEditingKey(null)}
          onUpdate={(updates) => handleUpdateApiKey(editingKey.id, updates)}
        />
      )}
    </AdminLayout>
  );
}

// Add API Key Modal Component
interface AddApiKeyModalProps {
  availableProviders: string[];
  onClose: () => void;
  onAdd: (data: { provider: string; keyName: string; apiKey: string }) => void;
}

function AddApiKeyModal({ availableProviders, onClose, onAdd }: AddApiKeyModalProps) {
  const [formData, setFormData] = useState({
    provider: availableProviders[0] || '',
    keyName: '',
    apiKey: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider || !formData.keyName || !formData.apiKey) {
      toast.error('All fields are required');
      return;
    }
    onAdd(formData);
  };

  const getProviderDisplayName = (provider: string): string => {
    const names: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      google: 'Google AI',
      deepseek: 'DeepSeek',
      ollama: 'Ollama'
    };
    return names[provider] || provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add API Key
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider
            </label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              {availableProviders.map(provider => (
                <option key={provider} value={provider}>
                  {getProviderDisplayName(provider)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Name
            </label>
            <input
              type="text"
              value={formData.keyName}
              onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
              placeholder="e.g., Production Key, Development Key"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key"
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit API Key Modal Component
interface EditApiKeyModalProps {
  apiKey: ApiKeyData;
  onClose: () => void;
  onUpdate: (updates: { keyName?: string; apiKey?: string; isActive?: boolean }) => void;
}

function EditApiKeyModal({ apiKey, onClose, onUpdate }: EditApiKeyModalProps) {
  const [formData, setFormData] = useState({
    keyName: apiKey.keyName,
    apiKey: '',
    isActive: apiKey.isActive
  });
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {
      keyName: formData.keyName,
      isActive: formData.isActive
    };
    
    if (formData.apiKey) {
      updates.apiKey = formData.apiKey;
    }
    
    onUpdate(updates);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit API Key
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Key Name
            </label>
            <input
              type="text"
              value={formData.keyName}
              onChange={(e) => setFormData(prev => ({ ...prev, keyName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key (leave empty to keep current)
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter new API key (optional)"
                className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Active
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}