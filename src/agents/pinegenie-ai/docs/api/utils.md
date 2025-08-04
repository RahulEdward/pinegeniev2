# Utilities and Helpers API

The Utilities module provides performance optimization, caching, algorithms, and helper functions that support the entire PineGenie AI system. These utilities ensure efficient operation and provide common functionality across all modules.

## 📋 **Table of Contents**

- [Performance Utilities](#performance-utilities)
- [Algorithm Utilities](#algorithm-utilities)
- [Helper Functions](#helper-functions)
- [Caching System](#caching-system)
- [Memory Management](#memory-management)
- [Validation Utilities](#validation-utilities)

## ⚡ **Performance Utilities**

### `PerformanceMonitor`

Monitors system performance and provides optimization insights.

```typescript
class PerformanceMonitor {
  constructor(config?: MonitorConfig);
  
  // Performance tracking
  startTracking(operationId: string): PerformanceTracker;
  stopTracking(trackerId: string): PerformanceResult;
  getMetrics(): PerformanceMetrics;
  
  // Memory monitoring
  trackMemoryUsage(): MemorySnapshot;
  detectMemoryLeaks(): MemoryLeakReport[];
  
  // Optimization suggestions
  analyzePerformance(): OptimizationSuggestion[];
  generatePerformanceReport(): PerformanceReport;
}
```

### `PatternCache`

High-performance caching system for pattern matching and AI operations.

```typescript
class PatternCache {
  constructor(config?: CacheConfig);
  
  // Cache operations
  set(key: string, value: any, ttl?: number): void;
  get(key: string): any | null;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  
  // Cache statistics
  getStats(): CacheStats;
  getHitRate(): number;
  
  // Cache optimization
  optimize(): void;
  evictExpired(): number;
}
```

## 🧮 **Algorithm Utilities**

### `PatternMatching`

Advanced pattern matching algorithms for strategy analysis.

```typescript
class PatternMatching {
  // String matching
  static fuzzyMatch(pattern: string, text: string, threshold?: number): MatchResult;
  static exactMatch(pattern: string, text: string): boolean;
  
  // Pattern analysis
  static findCommonPatterns(data: any[]): Pattern[];
  static calculateSimilarity(item1: any, item2: any): number;
  
  // Sequence matching
  static longestCommonSubsequence(seq1: any[], seq2: any[]): any[];
  static editDistance(str1: string, str2: string): number;
}
```

### `OptimizationAlgorithms`

Collection of optimization algorithms for parameter tuning.

```typescript
class OptimizationAlgorithms {
  // Genetic Algorithm
  static geneticAlgorithm(config: GAConfig): OptimizationResult;
  
  // Particle Swarm Optimization
  static particleSwarm(config: PSOConfig): OptimizationResult;
  
  // Simulated Annealing
  static simulatedAnnealing(config: SAConfig): OptimizationResult;
  
  // Gradient-based optimization
  static gradientDescent(config: GDConfig): OptimizationResult;
}
```

## 🛠 **Helper Functions**

### `ValidationHelpers`

Common validation functions used throughout the system.

```typescript
class ValidationHelpers {
  // Type validation
  static isValidNumber(value: any, min?: number, max?: number): boolean;
  static isValidString(value: any, minLength?: number, maxLength?: number): boolean;
  static isValidArray(value: any, minLength?: number, maxLength?: number): boolean;
  
  // Trading-specific validation
  static isValidIndicatorPeriod(period: number): boolean;
  static isValidPrice(price: number): boolean;
  static isValidTimeframe(timeframe: string): boolean;
  
  // Strategy validation
  static validateStrategyComponent(component: StrategyComponent): ValidationResult;
  static validateParameterRange(value: number, range: [number, number]): boolean;
}
```

### `FormattingHelpers`

Formatting utilities for display and output.

```typescript
class FormattingHelpers {
  // Number formatting
  static formatPercentage(value: number, decimals?: number): string;
  static formatCurrency(value: number, currency?: string): string;
  static formatNumber(value: number, decimals?: number): string;
  
  // Date formatting
  static formatDate(date: Date, format?: string): string;
  static formatDuration(milliseconds: number): string;
  
  // Text formatting
  static truncateText(text: string, maxLength: number): string;
  static capitalizeWords(text: string): string;
  static slugify(text: string): string;
}
```

---

**Previous**: [Template Integration API](./templates.md)  
**Back to**: [Main Documentation](../README.md)