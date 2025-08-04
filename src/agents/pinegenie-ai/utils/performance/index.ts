/**
 * Performance Utilities Index
 * Exports all performance-related utilities for the PineGenie AI system
 */

export { PatternCache, patternCache } from './pattern-cache';
export { MemoryManager, memoryManager } from './memory-manager';
export { LazyLoader, StrategyComponentLoader, strategyComponentLoader, generalLazyLoader } from './lazy-loader';
export { LayoutOptimizer, layoutOptimizer } from './layout-optimizer';
export { ConnectionOptimizer, connectionOptimizer } from './connection-optimizer';
export { PerformanceMonitor, performanceMonitor } from './performance-monitor';

// Re-export types
export type {
  CacheStats,
  MemoryUsage,
  MemoryThresholds,
  MemoryStats
} from './pattern-cache';

export type {
  MemoryUsage as MemoryUsageType,
  MemoryThresholds as MemoryThresholdsType,
  MemoryStats as MemoryStatsType
} from './memory-manager';

export type {
  LazyLoadConfig,
  LoadableItem,
  LoadResult
} from './lazy-loader';

export type {
  NodePosition,
  NodeDimensions,
  LayoutNode,
  LayoutConstraints,
  LayoutResult
} from './layout-optimizer';

export type {
  Connection,
  ConnectionPath,
  OptimizationMetrics
} from './connection-optimizer';

export type {
  PerformanceMetrics,
  PerformanceThresholds
} from './performance-monitor';