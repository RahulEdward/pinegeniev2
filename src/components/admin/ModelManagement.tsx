'use client';

import { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
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
            AI Model Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your real AI models - activate/deactivate and set defaults
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Models are defined in <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/lib/ai-models.ts</code>
        </div>
      </div>



      {/* API Keys Status */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Real AI Models Loaded
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              These are your actual AI models from the configuration. You can activate/deactivate them and set defaults.
              Add API keys to .env.local to enable external models.
            </p>
            <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              <p>• OPENAI_API_KEY=your_openai_key_here (for GPT models)</p>
              <p>• ANTHROPIC_API_KEY=your_anthropic_key_here (for Claude models)</p>
              <p>• GOOGLE_AI_KEY=your_google_key_here (for Gemini models)</p>
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

      {/* Note about adding models */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Want to add more models?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          To add new AI models, edit the <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">availableModels</code> array 
          in <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">src/lib/ai-models.ts</code>
        </p>
      </div>
    </div>
  );
}

