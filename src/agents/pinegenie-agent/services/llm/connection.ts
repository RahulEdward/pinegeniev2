/**
 * LLM Connection Infrastructure for Pine Genie Agent
 * Handles OpenAI/Mistral API connections with error handling and rate limiting
 */

export interface LLMConfig {
  provider: 'openai' | 'mistral' | 'anthropic';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
}

export interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  recordRequest(): void {
    this.requests.push(Date.now());
  }
}

class LLMConnectionManager {
  private config: LLMConfig;
  private rateLimiter: RateLimiter;
  private requestQueue: Array<{
    request: LLMRequest;
    resolve: (response: LLMResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  private isProcessingQueue = false;

  constructor(config: LLMConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter();
  }

  async sendRequest(request: LLMRequest): Promise<LLMResponse> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      if (!this.rateLimiter.canMakeRequest()) {
        await this.delay(1000); // Wait 1 second before retrying
        continue;
      }

      const { request, resolve, reject } = this.requestQueue.shift()!;
      
      try {
        const response = await this.makeAPIRequest(request);
        this.rateLimiter.recordRequest();
        resolve(response);
      } catch (error) {
        reject(error as Error);
      }

      // Small delay between requests
      await this.delay(100);
    }

    this.isProcessingQueue = false;
  }

  private async makeAPIRequest(request: LLMRequest): Promise<LLMResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      let response: Response;

      switch (this.config.provider) {
        case 'openai':
          response = await this.makeOpenAIRequest(request, controller.signal);
          break;
        case 'anthropic':
          response = await this.makeAnthropicRequest(request, controller.signal);
          break;
        case 'mistral':
          response = await this.makeMistralRequest(request, controller.signal);
          break;
        default:
          throw new Error(`Unsupported LLM provider: ${this.config.provider}`);
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.parseResponse(data);

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  private async makeOpenAIRequest(request: LLMRequest, signal: AbortSignal): Promise<Response> {
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
      }),
      signal,
    });
  }

  private async makeAnthropicRequest(request: LLMRequest, signal: AbortSignal): Promise<Response> {
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages.filter(m => m.role !== 'system'),
        system: request.messages.find(m => m.role === 'system')?.content || '',
        max_tokens: request.maxTokens ?? this.config.maxTokens,
        temperature: request.temperature ?? this.config.temperature,
      }),
      signal,
    });
  }

  private async makeMistralRequest(request: LLMRequest, signal: AbortSignal): Promise<Response> {
    return fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages,
        temperature: request.temperature ?? this.config.temperature,
        max_tokens: request.maxTokens ?? this.config.maxTokens,
      }),
      signal,
    });
  }

  private parseResponse(data: any): LLMResponse {
    switch (this.config.provider) {
      case 'openai':
      case 'mistral':
        return {
          content: data.choices[0].message.content,
          usage: {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          },
          model: data.model,
          finishReason: data.choices[0].finish_reason,
        };
      
      case 'anthropic':
        return {
          content: data.content[0].text,
          usage: {
            promptTokens: data.usage.input_tokens,
            completionTokens: data.usage.output_tokens,
            totalTokens: data.usage.input_tokens + data.usage.output_tokens,
          },
          model: data.model,
          finishReason: data.stop_reason,
        };
      
      default:
        throw new Error(`Unsupported provider for response parsing: ${this.config.provider}`);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateConfig(newConfig: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getQueueLength(): number {
    return this.requestQueue.length;
  }
}

// Default configuration
const defaultConfig: LLMConfig = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4',
  maxTokens: 2000,
  temperature: 0.7,
  timeout: 30000,
};

export const llmConnection = new LLMConnectionManager(defaultConfig);
export { LLMConnectionManager };