/**
 * LLM Connection Infrastructure
 * Handles OpenAI/Anthropic API connections with error handling, rate limiting, and fallbacks
 */

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'mistral';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
  responseTime: number;
}

export interface LLMError {
  code: string;
  message: string;
  provider: string;
  retryable: boolean;
  details?: any;
}

export interface RateLimitInfo {
  requestsPerMinute: number;
  tokensPerMinute: number;
  currentRequests: number;
  currentTokens: number;
  resetTime: Date;
}

/**
 * LLM Connection Manager
 */
export class LLMConnectionManager {
  private configs: Map<string, LLMConfig>;
  private rateLimits: Map<string, RateLimitInfo>;
  private requestQueue: Array<{
    id: string;
    provider: string;
    messages: LLMMessage[];
    resolve: (response: LLMResponse) => void;
    reject: (error: LLMError) => void;
    timestamp: Date;
  }>;
  private isProcessingQueue: boolean;

  constructor() {
    this.configs = new Map();
    this.rateLimits = new Map();
    this.requestQueue = [];
    this.isProcessingQueue = false;
    
    this.initializeDefaultConfigs();
    this.startQueueProcessor();
  }

  /**
   * Initialize default configurations
   */
  private initializeDefaultConfigs(): void {
    // OpenAI Configuration
    this.configs.set('openai', {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    });

    // Anthropic Configuration
    this.configs.set('anthropic', {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    });

    // Mistral Configuration
    this.configs.set('mistral', {
      provider: 'mistral',
      apiKey: process.env.MISTRAL_API_KEY || '',
      model: 'mistral-large-latest',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    });

    // Initialize rate limits
    this.rateLimits.set('openai', {
      requestsPerMinute: 60,
      tokensPerMinute: 90000,
      currentRequests: 0,
      currentTokens: 0,
      resetTime: new Date(Date.now() + 60000)
    });

    this.rateLimits.set('anthropic', {
      requestsPerMinute: 50,
      tokensPerMinute: 40000,
      currentRequests: 0,
      currentTokens: 0,
      resetTime: new Date(Date.now() + 60000)
    });

    this.rateLimits.set('mistral', {
      requestsPerMinute: 60,
      tokensPerMinute: 100000,
      currentRequests: 0,
      currentTokens: 0,
      resetTime: new Date(Date.now() + 60000)
    });
  }

  /**
   * Update LLM configuration
   */
  updateConfig(provider: string, config: Partial<LLMConfig>): void {
    const existingConfig = this.configs.get(provider);
    if (!existingConfig) {
      throw new Error(`Provider '${provider}' not found`);
    }

    this.configs.set(provider, { ...existingConfig, ...config });
  }

  /**
   * Send message to LLM with automatic provider selection and fallback
   */
  async sendMessage(
    messages: LLMMessage[],
    preferredProvider?: string,
    options?: Partial<LLMConfig>
  ): Promise<LLMResponse> {
    const providers = preferredProvider 
      ? [preferredProvider, ...this.getAvailableProviders().filter(p => p !== preferredProvider)]
      : this.getAvailableProviders();

    let lastError: LLMError | null = null;

    for (const provider of providers) {
      try {
        const response = await this.sendToProvider(provider, messages, options);
        return response;
      } catch (error) {
        lastError = error as LLMError;
        
        // If error is not retryable, try next provider
        if (!lastError.retryable) {
          continue;
        }
        
        // If it's the last provider, throw the error
        if (provider === providers[providers.length - 1]) {
          throw lastError;
        }
      }
    }

    throw lastError || new Error('All providers failed');
  }

  /**
   * Send message to specific provider
   */
  private async sendToProvider(
    provider: string,
    messages: LLMMessage[],
    options?: Partial<LLMConfig>
  ): Promise<LLMResponse> {
    const config = this.configs.get(provider);
    if (!config) {
      throw new Error(`Provider '${provider}' not configured`);
    }

    // Check rate limits
    await this.checkRateLimit(provider);

    // Merge options with config
    const finalConfig = { ...config, ...options };

    return new Promise((resolve, reject) => {
      const requestId = `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      
      this.requestQueue.push({
        id: requestId,
        provider,
        messages,
        resolve,
        reject,
        timestamp: new Date()
      });
    });
  }

  /**
   * Process request queue
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (this.isProcessingQueue || this.requestQueue.length === 0) {
        return;
      }

      this.isProcessingQueue = true;

      try {
        const request = this.requestQueue.shift();
        if (!request) {
          this.isProcessingQueue = false;
          return;
        }

        const response = await this.executeRequest(request);
        request.resolve(response);
      } catch (error) {
        const request = this.requestQueue.shift();
        if (request) {
          request.reject(error as LLMError);
        }
      } finally {
        this.isProcessingQueue = false;
      }
    }, 100);
  }

  /**
   * Execute actual API request
   */
  private async executeRequest(request: {
    id: string;
    provider: string;
    messages: LLMMessage[];
  }): Promise<LLMResponse> {
    const config = this.configs.get(request.provider)!;
    const startTime = Date.now();

    try {
      let response: any;

      switch (request.provider) {
        case 'openai':
          response = await this.callOpenAI(config, request.messages);
          break;
        case 'anthropic':
          response = await this.callAnthropic(config, request.messages);
          break;
        case 'mistral':
          response = await this.callMistral(config, request.messages);
          break;
        default:
          throw new Error(`Unsupported provider: ${request.provider}`);
      }

      const responseTime = Date.now() - startTime;

      // Update rate limits
      this.updateRateLimit(request.provider, response.usage);

      return {
        content: response.content,
        usage: response.usage,
        model: config.model,
        provider: request.provider,
        responseTime
      };
    } catch (error) {
      throw this.handleError(error, request.provider);
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(config: LLMConfig, messages: LLMMessage[]): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: config.maxTokens,
        temperature: config.temperature
      }),
      signal: AbortSignal.timeout(config.timeout)
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(config: LLMConfig, messages: LLMMessage[]): Promise<any> {
    const systemMessage = messages.find(m => m.role === 'system');
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        system: systemMessage?.content,
        messages: userMessages.map(m => ({ role: m.role, content: m.content }))
      }),
      signal: AbortSignal.timeout(config.timeout)
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      }
    };
  }

  /**
   * Call Mistral API
   */
  private async callMistral(config: LLMConfig, messages: LLMMessage[]): Promise<any> {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: config.maxTokens,
        temperature: config.temperature
      }),
      signal: AbortSignal.timeout(config.timeout)
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }

  /**
   * Check rate limits
   */
  private async checkRateLimit(provider: string): Promise<void> {
    const rateLimit = this.rateLimits.get(provider);
    if (!rateLimit) return;

    // Reset counters if time window has passed
    if (new Date() > rateLimit.resetTime) {
      rateLimit.currentRequests = 0;
      rateLimit.currentTokens = 0;
      rateLimit.resetTime = new Date(Date.now() + 60000);
    }

    // Check if we're at the limit
    if (rateLimit.currentRequests >= rateLimit.requestsPerMinute) {
      const waitTime = rateLimit.resetTime.getTime() - Date.now();
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Update rate limit counters
   */
  private updateRateLimit(provider: string, usage: any): void {
    const rateLimit = this.rateLimits.get(provider);
    if (!rateLimit) return;

    rateLimit.currentRequests++;
    rateLimit.currentTokens += usage.totalTokens;
  }

  /**
   * Handle API errors
   */
  private handleError(error: any, provider: string): LLMError {
    let code = 'unknown_error';
    let message = 'Unknown error occurred';
    let retryable = false;

    if (error.name === 'AbortError') {
      code = 'timeout';
      message = 'Request timed out';
      retryable = true;
    } else if (error.message.includes('429')) {
      code = 'rate_limit';
      message = 'Rate limit exceeded';
      retryable = true;
    } else if (error.message.includes('401')) {
      code = 'auth_error';
      message = 'Authentication failed';
      retryable = false;
    } else if (error.message.includes('500')) {
      code = 'server_error';
      message = 'Server error';
      retryable = true;
    } else {
      message = error.message || 'Unknown error';
    }

    return {
      code,
      message,
      provider,
      retryable,
      details: error
    };
  }

  /**
   * Get available providers
   */
  private getAvailableProviders(): string[] {
    return Array.from(this.configs.keys()).filter(provider => {
      const config = this.configs.get(provider);
      return config && config.apiKey;
    });
  }

  /**
   * Get provider status
   */
  getProviderStatus(): Record<string, {
    available: boolean;
    rateLimit: RateLimitInfo;
    queueLength: number;
  }> {
    const status: Record<string, any> = {};

    this.configs.forEach((config, provider) => {
      status[provider] = {
        available: !!config.apiKey,
        rateLimit: this.rateLimits.get(provider),
        queueLength: this.requestQueue.filter(r => r.provider === provider).length
      };
    });

    return status;
  }

  /**
   * Clear request queue
   */
  clearQueue(): void {
    this.requestQueue.forEach(request => {
      request.reject({
        code: 'queue_cleared',
        message: 'Request queue was cleared',
        provider: request.provider,
        retryable: false
      });
    });
    this.requestQueue = [];
  }

  /**
   * Health check for all providers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    const testMessage: LLMMessage[] = [
      { role: 'user', content: 'Hello, this is a health check. Please respond with "OK".' }
    ];

    for (const provider of this.getAvailableProviders()) {
      try {
        const response = await this.sendToProvider(provider, testMessage, { maxTokens: 10 });
        results[provider] = response.content.toLowerCase().includes('ok');
      } catch (error) {
        results[provider] = false;
      }
    }

    return results;
  }
}

// Export singleton instance
export const llmConnectionManager = new LLMConnectionManager();