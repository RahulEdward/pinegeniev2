// AI Models configuration - Server-side compatible

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
    name: 'PineGenie AI',
    provider: 'Custom',
    tier: 'free',
    description: 'Specialized Pine Script AI assistant - Always available',
    maxTokens: 4096
  },
  {
    id: 'gpt-4',
    name: 'ChatGPT-4',
    provider: 'OpenAI',
    tier: 'paid',
    description: '✅ WORKING - Advanced GPT-4 model for code generation',
    maxTokens: 8192,
    costPer1k: 0.03
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'ChatGPT-3.5 Turbo',
    provider: 'OpenAI',
    tier: 'paid',
    description: '✅ WORKING - Fast and efficient GPT-3.5 model',
    maxTokens: 4096,
    costPer1k: 0.002
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI 4 (Legacy)',
    provider: 'OpenAI',
    tier: 'paid',
    description: 'Legacy GPT-4 Omni model - Use ChatGPT-4 instead',
    maxTokens: 128000,
    costPer1k: 0.005
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude Sonnet (Not Configured)',
    provider: 'Anthropic',
    tier: 'paid',
    description: 'Requires Anthropic API key configuration',
    maxTokens: 200000,
    costPer1k: 0.003
  }
];