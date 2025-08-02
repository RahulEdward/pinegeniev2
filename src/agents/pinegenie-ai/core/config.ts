/**
 * PineGenie AI Configuration System
 * 
 * Centralized configuration for all AI system components.
 * Isolated from existing application configuration to prevent conflicts.
 */

export interface AIConfiguration {
  // Natural Language Processing Settings
  nlp: {
    confidenceThreshold: number;
    maxTokens: number;
    enableContextMemory: boolean;
    conversationHistoryLimit: number;
  };

  // Strategy Building Settings
  builder: {
    maxNodesPerStrategy: number;
    animationSpeed: number;
    enableStepByStep: boolean;
    autoOptimizeLayout: boolean;
  };

  // Knowledge Base Settings
  knowledge: {
    enablePatternCaching: boolean;
    maxCacheSize: number;
    patternMatchThreshold: number;
  };

  // Performance Settings
  performance: {
    enablePerformanceMonitoring: boolean;
    maxProcessingTime: number;
    enableMemoryOptimization: boolean;
  };

  // Debug Settings
  debug: {
    enableLogging: boolean;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    enablePerformanceMetrics: boolean;
  };
}

export const DEFAULT_AI_CONFIG: AIConfiguration = {
  nlp: {
    confidenceThreshold: 0.7,
    maxTokens: 1000,
    enableContextMemory: true,
    conversationHistoryLimit: 50,
  },
  builder: {
    maxNodesPerStrategy: 20,
    animationSpeed: 1000, // milliseconds
    enableStepByStep: true,
    autoOptimizeLayout: true,
  },
  knowledge: {
    enablePatternCaching: true,
    maxCacheSize: 100,
    patternMatchThreshold: 0.8,
  },
  performance: {
    enablePerformanceMonitoring: true,
    maxProcessingTime: 5000, // 5 seconds
    enableMemoryOptimization: true,
  },
  debug: {
    enableLogging: true,
    logLevel: 'info',
    enablePerformanceMetrics: false,
  },
};

export class AIConfig {
  private static instance: AIConfig;
  private config: AIConfiguration;

  private constructor() {
    this.config = { ...DEFAULT_AI_CONFIG };
  }

  public static getInstance(): AIConfig {
    if (!AIConfig.instance) {
      AIConfig.instance = new AIConfig();
    }
    return AIConfig.instance;
  }

  public getConfig(): AIConfiguration {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AIConfiguration>): void {
    this.config = {
      ...this.config,
      ...updates,
      nlp: { ...this.config.nlp, ...updates.nlp },
      builder: { ...this.config.builder, ...updates.builder },
      knowledge: { ...this.config.knowledge, ...updates.knowledge },
      performance: { ...this.config.performance, ...updates.performance },
      debug: { ...this.config.debug, ...updates.debug },
    };
  }

  public resetToDefaults(): void {
    this.config = { ...DEFAULT_AI_CONFIG };
  }

  // Convenience getters for commonly used config values
  public get nlpConfidenceThreshold(): number {
    return this.config.nlp.confidenceThreshold;
  }

  public get maxProcessingTime(): number {
    return this.config.performance.maxProcessingTime;
  }

  public get isLoggingEnabled(): boolean {
    return this.config.debug.enableLogging;
  }

  public get logLevel(): string {
    return this.config.debug.logLevel;
  }
}