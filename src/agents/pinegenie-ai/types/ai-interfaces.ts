/**
 * Core AI Interface Definitions
 * 
 * Base interfaces used throughout the AI system.
 */

// Base AI Component Interface
export interface AIComponent {
  id: string;
  name: string;
  version: string;
  isInitialized: boolean;
  initialize(): Promise<void>;
  reset(): void;
}

// AI Processing Result
export interface AIResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, unknown>;
  processingTime?: number;
}

// AI Context for maintaining conversation state
export interface AIContext {
  conversationId: string;
  userId?: string;
  sessionId: string;
  history: ContextEntry[];
  currentStrategy?: string;
  preferences: UserPreferences;
}

export interface ContextEntry {
  timestamp: Date;
  type: 'user_input' | 'ai_response' | 'system_action';
  content: string;
  metadata?: Record<string, unknown>;
}

export interface UserPreferences {
  preferredTimeframes: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  favoriteIndicators: string[];
  defaultParameters: Record<string, unknown>;
}

// AI Performance Metrics
export interface PerformanceMetrics {
  requestsProcessed: number;
  averageProcessingTime: number;
  successRate: number;
  errorRate: number;
  memoryUsage: number;
  cacheHitRate: number;
}

// AI System Events
export interface AIEvent {
  type: string;
  timestamp: Date;
  component: string;
  data: Record<string, unknown>;
}

export type AIEventListener = (event: AIEvent) => void;