/**
 * Algorithms Index
 * Exports all optimization and pattern matching algorithms
 */

export { PatternMatcher, patternMatcher } from './pattern-matching';
export { StrategyOptimizer, strategyOptimizer } from './optimization';

// Re-export types
export type {
  MatchResult,
  PatternIndex
} from './pattern-matching';

export type {
  OptimizationResult,
  OptimizationConstraints,
  GeneticAlgorithmConfig
} from './optimization';