// AI Control System - Integrates admin settings with AI services

interface AISettings {
  globalEnabled: boolean;
  defaultModel: string;
  rateLimiting: {
    enabled: boolean;
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  contentFiltering: {
    enabled: boolean;
    strictMode: boolean;
  };
  logging: {
    enabled: boolean;
    level: 'basic' | 'detailed' | 'debug';
  };
  autoModeration: {
    enabled: boolean;
    flagInappropriate: boolean;
    blockHarmful: boolean;
  };
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  status: 'active' | 'inactive' | 'error';
  usage: {
    requests: number;
    tokens: number;
    cost: number;
  };
  limits: {
    requestsPerHour: number;
    tokensPerDay: number;
    maxCostPerDay: number;
  };
}

class AIControlSystem {
  private static instance: AIControlSystem;
  private settings: AISettings | null = null;
  private models: Map<string, AIModel> = new Map();
  private requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  private constructor() {}

  static getInstance(): AIControlSystem {
    if (!AIControlSystem.instance) {
      AIControlSystem.instance = new AIControlSystem();
    }
    return AIControlSystem.instance;
  }

  async loadSettings(): Promise<AISettings> {
    if (this.settings) {
      return this.settings;
    }

    try {
      const response = await fetch('/api/admin/ai/settings');
      if (response.ok) {
        const data = await response.json();
        this.settings = data.settings;
        return this.settings;
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }

    // Return default settings if loading fails
    this.settings = {
      globalEnabled: true,
      defaultModel: 'pine-genie',
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 10,
        requestsPerHour: 100
      },
      contentFiltering: {
        enabled: true,
        strictMode: false
      },
      logging: {
        enabled: true,
        level: 'basic'
      },
      autoModeration: {
        enabled: true,
        flagInappropriate: true,
        blockHarmful: true
      }
    };

    return this.settings;
  }

  async loadModels(): Promise<AIModel[]> {
    try {
      const response = await fetch('/api/admin/ai/models');
      if (response.ok) {
        const data = await response.json();
        data.models.forEach((model: AIModel) => {
          this.models.set(model.id, model);
        });
        return data.models;
      }
    } catch (error) {
      console.error('Failed to load AI models:', error);
    }
    return [];
  }

  async isAIEnabled(): Promise<boolean> {
    const settings = await this.loadSettings();
    return settings.globalEnabled;
  }

  async isModelActive(modelId: string): Promise<boolean> {
    // Pine Genie is always active as it's our built-in model
    if (modelId === 'pine-genie') {
      return true;
    }
    
    if (this.models.size === 0) {
      await this.loadModels();
    }
    const model = this.models.get(modelId);
    return model?.status === 'active' || false;
  }

  async checkRateLimit(userId: string, modelId: string): Promise<{ allowed: boolean; reason?: string }> {
    const settings = await this.loadSettings();
    
    if (!settings.rateLimiting.enabled) {
      return { allowed: true };
    }

    const key = `${userId}-${modelId}`;
    const now = Date.now();
    const minuteKey = `${key}-minute`;
    const hourKey = `${key}-hour`;

    // Check minute limit
    const minuteData = this.requestCounts.get(minuteKey);
    if (minuteData) {
      if (now < minuteData.resetTime) {
        if (minuteData.count >= settings.rateLimiting.requestsPerMinute) {
          return { allowed: false, reason: 'Rate limit exceeded: too many requests per minute' };
        }
      } else {
        // Reset minute counter
        this.requestCounts.set(minuteKey, { count: 0, resetTime: now + 60000 });
      }
    } else {
      this.requestCounts.set(minuteKey, { count: 0, resetTime: now + 60000 });
    }

    // Check hour limit
    const hourData = this.requestCounts.get(hourKey);
    if (hourData) {
      if (now < hourData.resetTime) {
        if (hourData.count >= settings.rateLimiting.requestsPerHour) {
          return { allowed: false, reason: 'Rate limit exceeded: too many requests per hour' };
        }
      } else {
        // Reset hour counter
        this.requestCounts.set(hourKey, { count: 0, resetTime: now + 3600000 });
      }
    } else {
      this.requestCounts.set(hourKey, { count: 0, resetTime: now + 3600000 });
    }

    return { allowed: true };
  }

  async incrementRequestCount(userId: string, modelId: string): Promise<void> {
    const key = `${userId}-${modelId}`;
    const minuteKey = `${key}-minute`;
    const hourKey = `${key}-hour`;

    // Increment minute counter
    const minuteData = this.requestCounts.get(minuteKey);
    if (minuteData) {
      minuteData.count++;
    }

    // Increment hour counter
    const hourData = this.requestCounts.get(hourKey);
    if (hourData) {
      hourData.count++;
    }
  }

  async filterContent(content: string): Promise<{ allowed: boolean; filteredContent?: string; reason?: string }> {
    const settings = await this.loadSettings();
    
    if (!settings.contentFiltering.enabled) {
      return { allowed: true, filteredContent: content };
    }

    // Basic content filtering (in production, use more sophisticated filtering)
    const inappropriateWords = ['spam', 'hack', 'exploit', 'malicious'];
    const harmfulWords = ['virus', 'malware', 'phishing', 'scam'];

    let filteredContent = content;
    let hasInappropriate = false;
    let hasHarmful = false;

    // Check for inappropriate content
    inappropriateWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        hasInappropriate = true;
        if (settings.contentFiltering.strictMode) {
          filteredContent = filteredContent.replace(new RegExp(word, 'gi'), '[FILTERED]');
        }
      }
    });

    // Check for harmful content
    harmfulWords.forEach(word => {
      if (content.toLowerCase().includes(word)) {
        hasHarmful = true;
        if (settings.autoModeration.blockHarmful) {
          return { allowed: false, reason: 'Content blocked: potentially harmful content detected' };
        }
      }
    });

    if (hasInappropriate && settings.autoModeration.flagInappropriate) {
      // Log the flagged content (in production, store in database)
      console.warn('Flagged inappropriate content:', { content: content.substring(0, 100) });
    }

    return { allowed: true, filteredContent };
  }

  async logRequest(data: {
    userId: string;
    modelId: string;
    request: string;
    response?: string;
    error?: string;
    duration: number;
  }): Promise<void> {
    const settings = await this.loadSettings();
    
    if (!settings.logging.enabled) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      userId: data.userId,
      modelId: data.modelId,
      duration: data.duration,
      success: !data.error,
      ...(settings.logging.level === 'detailed' && {
        requestLength: data.request.length,
        responseLength: data.response?.length || 0
      }),
      ...(settings.logging.level === 'debug' && {
        request: data.request.substring(0, 200),
        response: data.response?.substring(0, 200),
        error: data.error
      })
    };

    // In production, store in database
    console.log('AI Request Log:', logEntry);
  }

  async getDefaultModel(): Promise<string> {
    const settings = await this.loadSettings();
    return settings.defaultModel;
  }

  async updateModelUsage(modelId: string, tokens: number, cost: number): Promise<void> {
    const model = this.models.get(modelId);
    if (model) {
      model.usage.requests++;
      model.usage.tokens += tokens;
      model.usage.cost += cost;
      
      // In production, update database
      console.log(`Updated usage for ${modelId}:`, model.usage);
    }
  }

  // Reset settings cache to force reload
  invalidateCache(): void {
    this.settings = null;
    this.models.clear();
  }
}

export const aiControl = AIControlSystem.getInstance();
export type { AISettings, AIModel };