/**
 * Strategy Optimization Module
 * 
 * This module handles strategy analysis, parameter optimization,
 * and performance improvements.
 */

// Main optimization engine (to be implemented in task 8)
export { OptimizationEngine } from './optimization-engine';

// Optimization components (to be implemented in task 8)
export { StrategyAnalyzer } from './strategy-analyzer';
export { ParameterOptimizer } from './parameter-optimizer';
export { FeedbackSystem } from './feedback-system';
export { ImprovementSuggester } from './improvement-suggester';

// Types
export type {
  Optimization,
  RiskAssessment,
  OptimizationResult,
  PerformanceMetrics
} from '../types/optimization-types';