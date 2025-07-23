'use client';

import { useState } from 'react';
import { templateManager, StrategyTemplate } from '@/agents/pinegenie-agent/core/pine-generator/templates';

interface StrategyTemplateSelectorProps {
  onTemplateSelect: (template: StrategyTemplate, parameters: Record<string, any>) => void;
  onClose: () => void;
}

export default function StrategyTemplateSelector({ onTemplateSelect, onClose }: StrategyTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const templates = templateManager.getAllTemplates();
  const categories = ['all', 'trend', 'momentum', 'mean-reversion', 'breakout'];

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === activeCategory);

  const handleTemplateClick = (template: StrategyTemplate) => {
    setSelectedTemplate(template);
    // Initialize parameters with default values
    const defaultParams: Record<string, any> = {};
    template.parameters.forEach(param => {
      defaultParams[param.name] = param.defaultValue;
    });
    setParameters(defaultParams);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const handleGenerate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate, parameters);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Strategy Templates</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Template List */}
          <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
            {/* Category Filter */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm capitalize ${
                      activeCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Cards */}
            <div className="p-4 space-y-3">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
                  }`}
                >
                  <h3 className="font-semibold text-white mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Parameter Configuration */}
          <div className="w-1/2 overflow-y-auto">
            {selectedTemplate ? (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Configure {selectedTemplate.name}
                </h3>
                
                <div className="space-y-4 mb-6">
                  {selectedTemplate.parameters.map(param => (
                    <div key={param.name}>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        {param.description}
                      </label>
                      
                      {param.type === 'int' || param.type === 'float' ? (
                        <input
                          type="number"
                          value={parameters[param.name] || param.defaultValue}
                          onChange={(e) => handleParameterChange(param.name, 
                            param.type === 'int' ? parseInt(e.target.value) : parseFloat(e.target.value)
                          )}
                          min={param.min}
                          max={param.max}
                          step={param.type === 'float' ? 0.1 : 1}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      ) : param.type === 'bool' ? (
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={parameters[param.name] || param.defaultValue}
                            onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-gray-300">Enable</span>
                        </label>
                      ) : param.type === 'source' ? (
                        <select
                          value={parameters[param.name] || param.defaultValue}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="close">Close</option>
                          <option value="open">Open</option>
                          <option value="high">High</option>
                          <option value="low">Low</option>
                          <option value="hl2">HL2</option>
                          <option value="hlc3">HLC3</option>
                          <option value="ohlc4">OHLC4</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={parameters[param.name] || param.defaultValue}
                          onChange={(e) => handleParameterChange(param.name, e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      )}
                      
                      {param.min !== undefined && param.max !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">
                          Range: {param.min} - {param.max}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Generate Pine Script Code
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a template to configure its parameters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}