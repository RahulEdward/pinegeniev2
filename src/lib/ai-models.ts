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
    id: 'gpt-4o',
    name: 'OpenAI 4',
    provider: 'OpenAI',
    tier: 'paid',
    description: 'Latest GPT-4 Omni model with multimodal capabilities',
    maxTokens: 128000,
    costPer1k: 0.005
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    tier: 'paid',
    description: 'Latest Claude model with enhanced reasoning and coding capabilities',
    maxTokens: 200000,
    costPer1k: 0.003
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini Pro 2.5',
    provider: 'Google',
    tier: 'paid',
    description: 'Advanced Google AI model with superior reasoning capabilities',
    maxTokens: 2000000,
    costPer1k: 0.0025
  },
  {
    id: 'ollama-mistral',
    name: 'Mistral',
    provider: 'Mistral',
    tier: 'free',
    description: 'High-performance Mistral model for advanced reasoning',
    maxTokens: 8192
  }
];