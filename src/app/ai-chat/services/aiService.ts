import { AIModel } from '../components/ModelSelector';

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
    // They will be loaded on first use
  }

  private loadApiKeys() {
    if (this.initialized) return;
    
    // Check if we're in the browser environment
    const isClient = typeof window !== 'undefined';
    
    // Load from environment variables or localStorage (only on client-side)
    this.apiKeys = {
      'google': process.env.NEXT_PUBLIC_GOOGLE_AI_KEY || (isClient ? localStorage.getItem('google_ai_key') : null) || '',
      'openai': process.env.NEXT_PUBLIC_OPENAI_API_KEY || (isClient ? localStorage.getItem('openai_api_key') : null) || '',
      'anthropic': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || (isClient ? localStorage.getItem('anthropic_api_key') : null) || ''
    };
    
    this.initialized = true;
  }

  private getModelConnection(modelId: string): ModelConnection {
    this.loadApiKeys(); // Ensure API keys are loaded
    const connections: Record<string, ModelConnection> = {
      'gemini-1.5-flash': {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKeys.google
        },
        requestFormat: 'google-ai'
      },
      'gemini-1.5-pro': {
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKeys.google
        },
        requestFormat: 'google-ai'
      },
      'gpt-4-turbo': {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.openai}`
        },
        requestFormat: 'openai'
      },
      'claude-3-sonnet': {
        endpoint: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.anthropic}`,
          'anthropic-version': '2023-06-01'
        },
        requestFormat: 'anthropic'
      },
      'pine-genie': {
        endpoint: '/api/pine-genie/chat',
        headers: {
          'Content-Type': 'application/json'
        },
        requestFormat: 'custom'
      }
    };

    return connections[modelId] || connections['pine-genie'];
  }

  private formatRequest(modelId: string, messages: ChatMessage[], connection: ModelConnection) {
    const lastMessage = messages[messages.length - 1];
    
    switch (connection.requestFormat) {
      case 'google-ai':
        return {
          contents: [{
            parts: [{
              text: `You are Pine Genie AI, a specialized assistant for Pine Script trading strategies. 

User Query: ${lastMessage.content}

Please provide a helpful response about Pine Script, trading strategies, or technical analysis. If generating code, use proper Pine Script v6 syntax.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        };

      case 'openai':
        return {
          model: modelId,
          messages: [
            {
              role: 'system',
              content: 'You are Pine Genie AI, a specialized assistant for Pine Script trading strategies and technical analysis.'
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 2048
        };

      case 'anthropic':
        return {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2048,
          temperature: 0.7,
          system: 'You are Pine Genie AI, a specialized assistant for Pine Script trading strategies and technical analysis.',
          messages: messages.filter(msg => msg.role !== 'system').map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        };

      case 'custom':
      default:
        return {
          message: lastMessage.content,
          model: modelId,
          context: 'pine-script-assistant'
        };
    }
  }

  private parseResponse(modelId: string, response: any, connection: ModelConnection): string {
    switch (connection.requestFormat) {
      case 'google-ai':
        return response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

      case 'openai':
        return response.choices?.[0]?.message?.content || 'No response generated';

      case 'anthropic':
        return response.content?.[0]?.text || 'No response generated';

      case 'custom':
      default:
        return response.response || response.content || 'No response generated';
    }
  }

  async sendMessage(modelId: string, messages: ChatMessage[]): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      const connection = this.getModelConnection(modelId);
      const requestBody = this.formatRequest(modelId, messages, connection);

      // For Pine Genie model, use internal API
      if (modelId === 'pine-genie') {
        return this.sendPineGenieMessage(messages[messages.length - 1].content, startTime);
      }

      const response = await fetch(connection.endpoint, {
        method: 'POST',
        headers: connection.headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = this.parseResponse(modelId, data, connection);
      const responseTime = Date.now() - startTime;

      return {
        content,
        model: modelId,
        responseTime,
        usage: this.extractUsage(data, connection.requestFormat)
      };

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Fallback to Pine Genie for errors
      return this.sendPineGenieMessage(messages[messages.length - 1].content, startTime);
    }
  }

  private async sendPineGenieMessage(content: string, startTime: number): Promise<AIResponse> {
    // Simulate Pine Genie AI response
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    let response = `I understand you want to work on: "${content}". Let me help you create a Pine Script strategy for this.`;

    // Check if user is asking for code
    const codeKeywords = ['strategy', 'indicator', 'script', 'code', 'pine', 'rsi', 'macd', 'sma', 'ema'];
    const needsCode = codeKeywords.some(keyword => content.toLowerCase().includes(keyword));

    if (needsCode) {
      response += `\n\nHere's a Pine Script template to get you started:\n\n\`\`\`pinescript\n//@version=6\nstrategy("${content.slice(0, 20)} Strategy", overlay=true)\n\n// Strategy parameters\nlength = input.int(14, "Length")\nsource = input.source(close, "Source")\n\n// Calculate indicator\nvalue = ta.sma(source, length)\n\n// Entry conditions\nlongCondition = ta.crossover(close, value)\nshortCondition = ta.crossunder(close, value)\n\n// Execute trades\nif longCondition\n    strategy.entry("Long", strategy.long)\nif shortCondition\n    strategy.entry("Short", strategy.short)\n\n// Plot\nplot(value, "SMA", color=color.blue)\n\`\`\`\n\nWould you like me to customize this further?`;
    }

    return {
      content: response,
      model: 'pine-genie',
      responseTime: Date.now() - startTime
    };
  }

  private extractUsage(data: any, format: string) {
    switch (format) {
      case 'openai':
        return data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        } : undefined;

      case 'google-ai':
        return data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount,
          completionTokens: data.usageMetadata.candidatesTokenCount,
          totalTokens: data.usageMetadata.totalTokenCount
        } : undefined;

      case 'anthropic':
        return data.usage ? {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        } : undefined;

      default:
        return undefined;
    }
  }

  setApiKey(provider: string, apiKey: string) {
    this.loadApiKeys(); // Ensure API keys are loaded
    this.apiKeys[provider] = apiKey;
    // Only save to localStorage on client-side
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${provider}_api_key`, apiKey);
    }
  }

  getApiKey(provider: string): string {
    this.loadApiKeys(); // Ensure API keys are loaded
    return this.apiKeys[provider] || '';
  }
}

export const aiService = new AIService();