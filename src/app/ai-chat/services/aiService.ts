
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  responseTime: number;
}

export interface ModelConnection {
  endpoint: string;
  headers: Record<string, string>;
  requestFormat: 'openai' | 'google-ai' | 'anthropic' | 'custom';
}

export class AIService {
  private apiKeys: Record<string, string> = {};
  private initialized = false;

  constructor() {
    // Don't load API keys immediately to avoid SSR issues
  }

  private loadApiKeys() {
    if (this.initialized) return;

    const isClient = typeof window !== 'undefined';

    this.apiKeys = {
      'google': process.env.NEXT_PUBLIC_GOOGLE_AI_KEY || (isClient ? localStorage.getItem('google_ai_key') : null) || '',
      'openai': process.env.NEXT_PUBLIC_OPENAI_API_KEY || (isClient ? localStorage.getItem('openai_api_key') : null) || '',
      'anthropic': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || (isClient ? localStorage.getItem('anthropic_api_key') : null) || '',
      'deepseek': process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || (isClient ? localStorage.getItem('deepseek_api_key') : null) || '',
      'ollama': process.env.NEXT_PUBLIC_OLLAMA_URL || (isClient ? localStorage.getItem('ollama_url') : null) || 'http://localhost:11434'
    };

    this.initialized = true;
  }

  private getModelConnection(modelId: string): ModelConnection {
    this.loadApiKeys();
    const connections: Record<string, ModelConnection> = {
      'pine-genie': {
        endpoint: '/api/pine-genie/chat',
        headers: { 'Content-Type': 'application/json' },
        requestFormat: 'custom'
      },
      'claude-3-sonnet': {
        endpoint: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.anthropic}`,
          'anthropic-version': '2023-06-01'
        },
        requestFormat: 'anthropic'
      }
    };

    return connections[modelId] || connections['pine-genie'];
  }

  setApiKey(provider: string, apiKey: string) {
    this.loadApiKeys();
    this.apiKeys[provider] = apiKey;
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${provider}_api_key`, apiKey);
    }
  }

  getApiKey(provider: string): string {
    this.loadApiKeys();
    return this.apiKeys[provider] || '';
  }

  async sendMessage(modelId: string, messages: ChatMessage[]): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // For Pine Genie model, use internal API
      if (modelId === 'pine-genie') {
        return this.sendPineGenieMessage(messages[messages.length - 1].content, startTime);
      }

      // For other models, implement basic response
      const responseTime = Date.now() - startTime;
      return {
        content: `This is a placeholder response from ${modelId}. The model integration is being implemented.`,
        model: modelId,
        responseTime
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(`Failed to send message to ${modelId}`);
    }
  }

  private async sendPineGenieMessage(content: string, startTime: number): Promise<AIResponse> {
    try {
      const response = await fetch('/api/pine-genie/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.response || 'No response generated',
        model: 'pine-genie',
        responseTime
      };
    } catch (error) {
      console.error('Pine Genie API error:', error);
      throw new Error('Failed to get response from Pine Genie');
    }
  }
}

export const aiService = new AIService();