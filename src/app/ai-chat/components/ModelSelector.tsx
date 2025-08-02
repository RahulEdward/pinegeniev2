'use client';

import React, { useState } from 'react';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  tier: 'free' | 'paid';
  description: string;
  maxTokens: number;
  costPer1k?: number;
}

export const availableModels: AIModel[] = [
  {
    id: 'pine-genie',
    name: 'Pine Genie AI',
    provider: 'Custom',
    tier: 'free',
    description: 'Specialized Pine Script AI assistant',
    maxTokens: 4096
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    tier: 'free',
    description: 'Fast and efficient Google AI model',
    maxTokens: 1000000
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    tier: 'paid',
    description: 'Advanced Google AI model with superior reasoning',
    maxTokens: 2000000,
    costPer1k: 0.003
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    tier: 'paid',
    description: 'Latest GPT-4 model with improved performance',
    maxTokens: 128000,
    costPer1k: 0.01
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    tier: 'paid',
    description: 'Balanced performance and speed',
    maxTokens: 200000,
    costPer1k: 0.003
  }
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export default function ModelSelector({ selectedModel, onModelChange, className = '' }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = availableModels.find(model => model.id === selectedModel) || availableModels[0];

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setIsOpen(false);
  };

  return (
    <div className={`model-selector ${className}`}>
      <button
        className="model-selector-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="model-info">
          <div className="model-name">{currentModel.name}</div>
          <div className="model-provider">
            {currentModel.provider} • {currentModel.tier === 'free' ? 'Free' : 'Paid'}
          </div>
        </div>
        <svg 
          className={`chevron-icon ${isOpen ? 'open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {isOpen && (
        <div className="model-dropdown">
          <div className="model-list" role="listbox">
            {availableModels.map((model) => (
              <button
                key={model.id}
                className={`model-option ${model.id === selectedModel ? 'selected' : ''}`}
                onClick={() => handleModelSelect(model.id)}
                role="option"
                aria-selected={model.id === selectedModel}
              >
                <div className="model-option-content">
                  <div className="model-option-header">
                    <span className="model-option-name">{model.name}</span>
                    <span className={`model-tier ${model.tier}`}>
                      {model.tier === 'free' ? 'FREE' : 'PAID'}
                    </span>
                  </div>
                  <div className="model-option-provider">{model.provider}</div>
                  <div className="model-option-description">{model.description}</div>
                  <div className="model-option-specs">
                    Max tokens: {model.maxTokens.toLocaleString()}
                    {model.costPer1k && ` • $${model.costPer1k}/1k tokens`}
                  </div>
                </div>
                {model.id === selectedModel && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="model-selector-backdrop" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}