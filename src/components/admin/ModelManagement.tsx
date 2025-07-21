'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface LLMModel {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  isDefault: boolean;
  maxTokens?: number;
  costPer1kTokens?: number;
  createdAt: string;
  updatedAt: string;
}

export default function ModelManagement() {
  const [models, setModels] = useState<LLMModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModel, setEditingModel] = useState<LLMModel | null>(null);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models');
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data);
    } catch (error) {
      console.error('Fetch models error:', error);
      toast.error('Failed to load models');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddModel = async (modelData: Partial<LLMModel>) => {
    try {
      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData),
      });

      if (!response.ok) throw new Error('Failed to create model');
      
      toast.success('Model added successfully');
      setShowAddModal(false);
      fetchModels();
    } catch (error) {
      console.error('Add model error:', error);
      toast.error('Failed to add model');
    }
  };

  const toggleModelStatus = async (modelId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) throw new Error('Failed to update model');
      
      toast.success('Model status updated');
      fetchModels();
    } catch (error) {
      console.error('Toggle model error:', error);
      toast.error('Failed to update model');
    }
  };

  const setDefaultModel = async (modelId: string) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!response.ok) throw new Error('Failed to set default model');
      
      toast.success('Default model updated');
      fetchModels();
    } catch (error) {
      console.error('Set default model error:', error);
      toast.error('Failed to set default model');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            LLM Model Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage AI models for PineGenie AI chat
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Model
        </button>
      </div>

      {/* API Keys Status */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <Settings className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              API Configuration Required
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Add your OpenAI and Anthropic API keys to .env.local to enable full AI functionality. 
              Currently running in demo mode with mock responses.
            </p>
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              <p>• OPENAI_API_KEY=your_openai_key_here</p>
              <p>• ANTHROPIC_API_KEY=your_anthropic_key_here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <div
            key={model.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {model.displayName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {model.provider} • {model.modelId}
                </p>
              </div>
              <div className="flex gap-2">
                {model.isDefault && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Default
                  </span>
                )}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  model.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {model.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {model.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {model.description}
              </p>
            )}

            <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
              {model.maxTokens && (
                <div>Max Tokens: {model.maxTokens.toLocaleString()}</div>
              )}
              {model.costPer1kTokens && (
                <div>Cost: ${model.costPer1kTokens}/1K tokens</div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleModelStatus(model.id, model.isActive)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium ${
                  model.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {model.isActive ? 'Deactivate' : 'Activate'}
              </button>
              
              {!model.isDefault && model.isActive && (
                <button
                  onClick={() => setDefaultModel(model.id)}
                  className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                >
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Model Modal */}
      {showAddModal && (
        <AddModelModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddModel}
        />
      )}
    </div>
  );
}

interface AddModelModalProps {
  onClose: () => void;
  onAdd: (model: Partial<LLMModel>) => void;
}

function AddModelModal({ onClose, onAdd }: AddModelModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    provider: 'openai',
    modelId: '',
    displayName: '',
    description: '',
    maxTokens: '',
    costPer1kTokens: '',
    isActive: true,
    isDefault: false,
  });

  const presetModels = {
    openai: [
      { id: 'gpt-4', name: 'GPT-4', maxTokens: 8192 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', maxTokens: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', maxTokens: 4096 },
    ],
    claude: [
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', maxTokens: 200000 },
      { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', maxTokens: 200000 },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', maxTokens: 200000 },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      maxTokens: formData.maxTokens ? parseInt(formData.maxTokens) : undefined,
      costPer1kTokens: formData.costPer1kTokens ? parseFloat(formData.costPer1kTokens) : undefined,
    });
  };

  const handlePresetSelect = (preset: any) => {
    setFormData(prev => ({
      ...prev,
      modelId: preset.id,
      displayName: preset.name,
      name: preset.id,
      maxTokens: preset.maxTokens.toString(),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Add New Model
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider
            </label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude (Anthropic)</option>
            </select>
          </div>

          {/* Preset Models */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-1 gap-2">
              {presetModels[formData.provider as keyof typeof presetModels].map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset)}
                  className="text-left p-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-sm text-gray-500">{preset.id}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Model ID
            </label>
            <input
              type="text"
              value={formData.modelId}
              onChange={(e) => setFormData(prev => ({ ...prev, modelId: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Tokens
              </label>
              <input
                type="number"
                value={formData.maxTokens}
                onChange={(e) => setFormData(prev => ({ ...prev, maxTokens: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost per 1K tokens
              </label>
              <input
                type="number"
                step="0.001"
                value={formData.costPer1kTokens}
                onChange={(e) => setFormData(prev => ({ ...prev, costPer1kTokens: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Set as Default</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}