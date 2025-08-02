/**
 * Trading Knowledge Base Module
 * 
 * This module contains all trading knowledge including patterns,
 * indicators, and strategy templates.
 */

// Main knowledge base
export { KnowledgeBase } from './knowledge-base';

// Knowledge components
export { TradingPatterns } from './patterns';
export { RiskManagementEngine } from './risk-rules';

// Enhanced indicator exports
export {
  UnifiedIndicatorSystem,
  TechnicalIndicatorDatabase,
  OscillatorDatabase,
  indicatorSystem,
  type TechnicalIndicator,
  type IndicatorSuggestion,
  type IndicatorAnalysis,
  type ParameterOptimization,
  type IndicatorCompatibilityRule
} from './indicators';

// Pattern systems
export {
  TrendFollowingPatternMatcher,
  MeanReversionPatternMatcher,
  BreakoutPatternMatcher
} from './patterns';

// Types
export type {
  KnowledgeQuery,
  KnowledgeResult,
  KnowledgeRecommendation,
  StrategyKnowledge,
  IndicatorCombination,
  EducationalContent
} from './knowledge-base';

export type {
  UnifiedTradingPattern,
  PatternMatchResult
} from './patterns';

export type {
  IndicatorParameter,
  IndicatorOutput,
  IndicatorInterpretation
} from './indicators';

export type {
  RiskRule,
  RiskAssessment,
  RiskFactor,
  RiskRecommendation,
  PositionSizingParameters
} from './risk-rules';