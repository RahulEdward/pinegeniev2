
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

  private async loadApiKeys() {
    if (this.initialized) return;

    const isClient = typeof window !== 'undefined';

    // Try to load from simple storage first (server-side only)
    if (!isClient && typeof process !== 'undefined') {
      try {
        // Only import on server side
        const { simpleApiKeys } = await import('@/lib/simple-api-keys');
        
        this.apiKeys = {
          'google': simpleApiKeys.getApiKey('google') || process.env.GOOGLE_AI_KEY || '',
          'openai': simpleApiKeys.getApiKey('openai') || process.env.OPENAI_API_KEY || '',
          'anthropic': simpleApiKeys.getApiKey('anthropic') || process.env.ANTHROPIC_API_KEY || '',
          'deepseek': simpleApiKeys.getApiKey('deepseek') || process.env.DEEPSEEK_API_KEY || '',
          'ollama': simpleApiKeys.getApiKey('ollama') || process.env.OLLAMA_URL || 'http://localhost:11434'
        };
      } catch (error) {
        console.error('Failed to load API keys from storage:', error);
        // Fallback to environment variables
        this.apiKeys = {
          'google': process.env.GOOGLE_AI_KEY || '',
          'openai': process.env.OPENAI_API_KEY || '',
          'anthropic': process.env.ANTHROPIC_API_KEY || '',
          'deepseek': process.env.DEEPSEEK_API_KEY || '',
          'ollama': process.env.OLLAMA_URL || 'http://localhost:11434'
        };
      }
    } else {
      // Client-side fallback to localStorage only
      this.apiKeys = {
        'google': (typeof localStorage !== 'undefined' ? localStorage.getItem('google_ai_key') : null) || '',
        'openai': (typeof localStorage !== 'undefined' ? localStorage.getItem('openai_api_key') : null) || '',
        'anthropic': (typeof localStorage !== 'undefined' ? localStorage.getItem('anthropic_api_key') : null) || '',
        'deepseek': (typeof localStorage !== 'undefined' ? localStorage.getItem('deepseek_api_key') : null) || '',
        'ollama': (typeof localStorage !== 'undefined' ? localStorage.getItem('ollama_url') : null) || 'http://localhost:11434'
      };
    }

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
      'claude-3-5-sonnet': {
        endpoint: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.anthropic}`,
          'anthropic-version': '2023-06-01'
        },
        requestFormat: 'anthropic'
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
      'claude-3-haiku': {
        endpoint: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.anthropic}`,
          'anthropic-version': '2023-06-01'
        },
        requestFormat: 'anthropic'
      },
      'gpt-4o': {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.openai}`
        },
        requestFormat: 'openai'
      },
      'gpt-4-turbo': {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.openai}`
        },
        requestFormat: 'openai'
      },
      'gpt-3.5-turbo': {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.openai}`
        },
        requestFormat: 'openai'
      },
      'gemini-1.5-flash': {
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKeys.google}`,
        headers: { 'Content-Type': 'application/json' },
        requestFormat: 'google-ai'
      },
      'gemini-1.5-pro': {
        endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${this.apiKeys.google}`,
        headers: { 'Content-Type': 'application/json' },
        requestFormat: 'google-ai'
      },
      'deepseek-coder': {
        endpoint: 'https://api.deepseek.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.deepseek}`
        },
        requestFormat: 'openai'
      },
      'ollama-mistral': {
        endpoint: `${this.apiKeys.ollama}/api/generate`,
        headers: { 'Content-Type': 'application/json' },
        requestFormat: 'custom'
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

  private getProviderFromModelId(modelId: string): string {
    if (modelId.startsWith('claude-')) return 'anthropic';
    if (modelId.startsWith('gpt-')) return 'openai';
    if (modelId.startsWith('gemini-')) return 'google';
    if (modelId === 'deepseek-coder') return 'deepseek';
    if (modelId === 'ollama-mistral') return 'ollama';
    return 'unknown';
  }

  async sendMessage(modelId: string, messages: ChatMessage[], userId?: string): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Load API keys (including from database)
      await this.loadApiKeys();

      // Import AI control system dynamically to avoid SSR issues
      const { aiControl } = await import('@/lib/ai-control');

      // Check if AI is globally enabled
      const aiEnabled = await aiControl.isAIEnabled();
      if (!aiEnabled) {
        throw new Error('AI services are currently disabled by administrator');
      }

      // Check if specific model is active
      const modelActive = await aiControl.isModelActive(modelId);
      if (!modelActive) {
        // Fall back to default model if current model is inactive
        const defaultModel = await aiControl.getDefaultModel();
        if (defaultModel !== modelId) {
          modelId = defaultModel;
        } else {
          throw new Error(`Model ${modelId} is currently unavailable`);
        }
      }

      // Check rate limits
      if (userId) {
        const rateLimitCheck = await aiControl.checkRateLimit(userId, modelId);
        if (!rateLimitCheck.allowed) {
          throw new Error(rateLimitCheck.reason || 'Rate limit exceeded');
        }
      }

      // Filter content
      const userMessage = messages[messages.length - 1].content;
      const contentCheck = await aiControl.filterContent(userMessage);
      if (!contentCheck.allowed) {
        throw new Error(contentCheck.reason || 'Content blocked by filter');
      }

      let response: AIResponse;

      // Route to appropriate model handler
      if (modelId === 'pine-genie') {
        response = await this.sendPineGenieMessage(contentCheck.filteredContent || userMessage, startTime);
      } else if (modelId.startsWith('claude-')) {
        response = await this.sendClaudeMessage(modelId, contentCheck.filteredContent || userMessage, startTime);
      } else if (modelId.startsWith('gpt-')) {
        response = await this.sendOpenAIMessage(modelId, contentCheck.filteredContent || userMessage, startTime);
      } else if (modelId.startsWith('gemini-')) {
        response = await this.sendGeminiMessage(modelId, contentCheck.filteredContent || userMessage, startTime);
      } else if (modelId === 'deepseek-coder') {
        response = await this.sendDeepSeekMessage(modelId, contentCheck.filteredContent || userMessage, startTime);
      } else if (modelId === 'ollama-mistral') {
        response = await this.sendOllamaMessage(modelId, contentCheck.filteredContent || userMessage, startTime);
      } else {
        // Fallback for unknown models
        const responseTime = Date.now() - startTime;
        response = {
          content: `Model ${modelId} is not yet implemented. Please use Pine Genie or configure API keys for external models.`,
          model: modelId,
          responseTime
        };
      }

      // Increment request count
      if (userId) {
        await aiControl.incrementRequestCount(userId, modelId);
      }

      // Log the request
      await aiControl.logRequest({
        userId: userId || 'anonymous',
        modelId,
        request: userMessage,
        response: response.content,
        duration: response.responseTime
      });

      // Update model usage statistics
      await aiControl.updateModelUsage(
        modelId,
        response.usage?.totalTokens || 100,
        (response.usage?.totalTokens || 100) * 0.001
      );

      return response;
    } catch (error) {
      console.error('Error sending message:', error);

      // Log the error
      try {
        const { aiControl } = await import('@/lib/ai-control');
        await aiControl.logRequest({
          userId: userId || 'anonymous',
          modelId,
          request: messages[messages.length - 1].content,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime
        });
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }

      throw error;
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

  private async sendClaudeMessage(modelId: string, content: string, startTime: number): Promise<AIResponse> {
    try {
      if (!this.apiKeys.anthropic) {
        throw new Error('Anthropic API key not configured. Add ANTHROPIC_API_KEY to your environment.');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.anthropic}`,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelId === 'claude-3-5-sonnet' ? 'claude-3-5-sonnet-20241022' :
            modelId === 'claude-3-sonnet' ? 'claude-3-sonnet-20240229' :
              'claude-3-haiku-20240307',
          max_tokens: 4000,
          messages: [{ role: 'user', content }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Claude API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.content[0]?.text || 'No response generated',
        model: modelId,
        responseTime,
        usage: {
          promptTokens: data.usage?.input_tokens || 0,
          completionTokens: data.usage?.output_tokens || 0,
          totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
        }
      };
    } catch (error) {
      console.error('Claude API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from Claude');
    }
  }

  private async sendOpenAIMessage(modelId: string, content: string, startTime: number): Promise<AIResponse> {
    try {
      if (!this.apiKeys.openai) {
        throw new Error('OpenAI API key not configured. Add OPENAI_API_KEY to your environment.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.openai}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content }],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        model: modelId,
        responseTime,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from OpenAI');
    }
  }

  private async sendGeminiMessage(modelId: string, content: string, startTime: number): Promise<AIResponse> {
    try {
      if (!this.apiKeys.google) {
        throw new Error('Google AI API key not configured. Add GOOGLE_AI_KEY to your environment.');
      }

      const model = modelId === 'gemini-1.5-pro' ? 'gemini-1.5-pro-latest' : 'gemini-1.5-flash-latest';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKeys.google}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: content }] }],
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.candidates[0]?.content?.parts[0]?.text || 'No response generated',
        model: modelId,
        responseTime,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from Gemini');
    }
  }

  private async sendDeepSeekMessage(modelId: string, content: string, startTime: number): Promise<AIResponse> {
    try {
      if (!this.apiKeys.deepseek) {
        throw new Error('DeepSeek API key not configured. Add DEEPSEEK_API_KEY to your environment.');
      }

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKeys.deepseek}`
        },
        body: JSON.stringify({
          model: 'deepseek-coder',
          messages: [{ role: 'user', content }],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.choices[0]?.message?.content || 'No response generated',
        model: modelId,
        responseTime,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get response from DeepSeek');
    }
  }

  private async sendOllamaMessage(modelId: string, content: string, startTime: number): Promise<AIResponse> {
    try {
      const ollamaUrl = this.apiKeys.ollama || 'http://localhost:11434';
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: content,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} - Make sure Ollama is running locally`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data.response || 'No response generated',
        model: modelId,
        responseTime
      };
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error('Failed to connect to Ollama. Make sure Ollama is installed and running locally.');
    }
  }
}

export const aiService = new AIService();