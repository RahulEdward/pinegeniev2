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
    name: 'Pine Genie AI',
    provider: 'Custom',
    tier: 'free',
    description: 'Specialized Pine Script AI assistant - Always available',
    maxTokens: 4096
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    tier: 'paid',
    description: 'Latest Claude model with enhanced reasoning and coding capabilities',
    maxTokens: 200000,
    costPer1k: 0.003
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    tier: 'paid',
    description: 'Balanced performance and speed from Anthropic',
    maxTokens: 200000,
    costPer1k: 0.003
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    tier: 'paid',
    description: 'Fast and cost-effective Claude model',
    maxTokens: 200000,
    costPer1k: 0.00025
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    tier: 'paid',
    description: 'Latest GPT-4 Omni model with multimodal capabilities',
    maxTokens: 128000,
    costPer1k: 0.005
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    tier: 'paid',
    description: 'High-performance GPT-4 model with large context window',
    maxTokens: 128000,
    costPer1k: 0.01
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    tier: 'paid',
    description: 'Fast and cost-effective OpenAI model',
    maxTokens: 16385,
    costPer1k: 0.0015
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Free)',
    provider: 'Google',
    tier: 'free',
    description: 'Fast and efficient Google AI model - Free tier with rate limits',
    maxTokens: 1000000
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    tier: 'paid',
    description: 'Advanced Google AI model with superior reasoning capabilities',
    maxTokens: 2000000,
    costPer1k: 0.0025
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder',
    provider: 'DeepSeek',
    tier: 'paid',
    description: 'Specialized coding AI model with advanced programming capabilities',
    maxTokens: 16000,
    costPer1k: 0.0014
  },
  {
    id: 'ollama-mistral',
    name: 'Mistral 7B (Local)',
    provider: 'Ollama',
    tier: 'free',
    description: 'Local Mistral model running via Ollama - No API costs',
    maxTokens: 8192
  }
];