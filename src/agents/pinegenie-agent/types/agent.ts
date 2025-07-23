/**
 * Agent Types
 * 
 * Type definitions for the Kiro-Style Pine Script Agent.
 */

import type { GeneratedCode } from './pine-script';

/**
 * Agent response interface
 */
export interface AgentResponse {
  /**
   * The message content
   */
  message: string;
  
  /**
   * The generated code (if any)
   */
  code?: GeneratedCode;
  
  /**
   * Suggested follow-up actions
   */
  suggestions: string[];
  
  /**
   * Next steps in the process
   */
  nextSteps: string[];
  
  /**
   * Whether the agent requires user input
   */
  requiresInput: boolean;
  
  /**
   * Voice response audio (if voice is enabled)
   */
  voiceResponse?: AudioBuffer;
}

/**
 * Conversation context interface
 */
export interface ConversationContext {
  /**
   * The session ID
   */
  sessionId: string;
  
  /**
   * The user ID
   */
  userId: string;
  
  /**
   * The conversation history
   */
  conversationHistory: Message[];
  
  /**
   * The current strategy (if any)
   */
  currentStrategy?: PartialStrategy;
  
  /**
   * User preferences
   */
  preferences: UserPreferences;
  
  /**
   * Progress steps
   */
  progressSteps: ProgressStep[];
}

/**
 * Message interface
 */
export interface Message {
  /**
   * The role of the message sender
   */
  role: 'user' | 'agent' | 'system';
  
  /**
   * The message content
   */
  content: string;
  
  /**
   * The timestamp of the message
   */
  timestamp: Date;
  
  /**
   * The generated code (if any)
   */
  code?: GeneratedCode;
}

/**
 * Partial strategy interface
 */
export interface PartialStrategy {
  /**
   * The strategy name
   */
  name?: string;
  
  /**
   * The strategy timeframe
   */
  timeframe?: string;
  
  /**
   * The stop loss percentage
   */
  stopLoss?: number;
  
  /**
   * The take profit percentage
   */
  takeProfit?: number;
  
  /**
   * The risk percentage per trade
   */
  riskPercentage?: number;
  
  /**
   * The strategy parameters
   */
  parameters?: Record<string, any>;
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  /**
   * Whether voice is enabled
   */
  voiceEnabled: boolean;
  
  /**
   * The theme preference
   */
  theme: 'light' | 'dark' | 'system';
  
  /**
   * Whether code preview is enabled
   */
  codePreviewEnabled: boolean;
}

/**
 * Progress step interface
 */
export interface ProgressStep {
  /**
   * The step name
   */
  step: string;
  
  /**
   * The timestamp of the step
   */
  timestamp: Date;
}

/**
 * Hook context interface
 */
export interface HookContext {
  /**
   * The conversation context
   */
  conversation: ConversationContext;
  
  /**
   * The generated code (if any)
   */
  code?: GeneratedCode;
  
  /**
   * The agent response
   */
  response: AgentResponse;
}

/**
 * Hook result interface
 */
export interface HookResult {
  /**
   * Whether the hook was successful
   */
  success: boolean;
  
  /**
   * The modified code (if any)
   */
  modifiedCode?: GeneratedCode;
  
  /**
   * The modified response (if any)
   */
  modifiedResponse?: AgentResponse;
  
  /**
   * Any errors that occurred
   */
  errors?: string[];
}