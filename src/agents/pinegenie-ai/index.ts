/**
 * PineGenie AI System - Main Entry Point
 * 
 * This is the single entry point for the entire PineGenie AI system.
 * All AI functionality is isolated in this directory to ensure zero
 * interference with existing application functionality.
 * 
 * @version 1.0.0
 * @author PineGenie Team
 */

// Core AI System
export { PineGenieAI } from './core';

// Natural Language Processing
export { 
  NaturalLanguageProcessor,
  type ParsedRequest,
  type TradingIntent,
  type StrategyParameters 
} from './nlp';

// Knowledge Base
export { 
  KnowledgeBase,
  type TradingPattern,
  type IndicatorDefinition 
} from './knowledge';

// Strategy Interpretation
export { 
  StrategyInterpreter,
  type StrategyBlueprint,
  type StrategyComponent 
} from './interpreter';

// AI Builder Integration
export { 
  AIBuilderSystem,
  type BuildResult,
  type AnimationStep 
} from './builder';

// Chat Interface
export { 
  AIChatInterface,
  type AIResponse,
  type ChatMessage 
} from './chat';

// Educational Animations
export { 
  AnimationSystem,
  type AnimationSequence,
  type ExplanationStep 
} from './animations';

// Strategy Optimization
export { 
  OptimizationEngine,
  type Optimization,
  type RiskAssessment 
} from './optimization';

// Template Integration
export { 
  TemplateIntegrator,
  type AITemplate 
} from './templates';

// Utilities
export { 
  AILogger,
  AIErrorHandler,
  type AIError 
} from './utils';

// Type Definitions
export * from './types';

// Version and metadata
export const PINEGENIE_AI_VERSION = '1.0.0';
export const PINEGENIE_AI_BUILD = Date.now();