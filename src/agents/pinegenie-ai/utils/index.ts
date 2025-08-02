/**
 * AI Utilities Module
 * 
 * This module contains utility functions, performance optimizations,
 * and helper functions for the AI system.
 */

// Re-export core utilities
export { AILogger } from '../core/logger';
export { AIErrorHandler } from '../core/error-handler';

// Performance utilities (to be implemented in task 10)
export { PatternCache } from './performance/pattern-cache';
export { MemoryManager } from './performance/memory-manager';

// Algorithm utilities (to be implemented in task 10)
export { PatternMatching } from './algorithms/pattern-matching';
export { OptimizationAlgorithms } from './algorithms/optimization';

// Helper utilities (to be implemented in task 10)
export { ValidationHelpers } from './helpers/validation';
export { FormattingHelpers } from './helpers/formatting';

// Types
export type {
  AIError,
  LogLevel,
  PerformanceMetrics
} from '../types';