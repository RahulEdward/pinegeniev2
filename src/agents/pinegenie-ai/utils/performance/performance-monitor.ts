/**
 * Performance Monitor
 * Comprehensive performance monitoring and optimization system
 */

import { patternCache } from './pattern-cache';
import { memoryManager } from './memory-manager';
import { layoutOptimizer } from './layout-optimizer';
import { connectionOptimizer } from './connection-optimizer';

interface PerformanceMetrics {
  timestamp: number;
  memory: {
    usage: number;
    percentage: number;
    status: string;
  };
  cache: {
    hitRate: number;
    size: number;
    evictions: number;
  };
  layout: {
    optimizationTime: number;
    nodeCount: number;
    iterations: number;
  };
  connections: {
    totalLength: number;
    crossings: number;
    optimizationTime: number;
  };
  overall: {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  };
}

interface PerformanceThresholds {
  memory: {
    warning: number;
    critical: number;
  };
  cache: {
    minHitRate: number;
    maxSize: number;
  };
  layout: {
    maxOptimizationTime: number;
    maxIterations: number;
  };
  connections: {
    maxCrossings: number;
    maxOptimizationTime: number;
  };
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      memory: {
        warning: thresholds.memory?.warning || 70,
        critical: thresholds.memory?.critical || 85
      },
      cache: {
        minHitRate: thresholds.cache?.minHitRate || 0.7,
        maxSize: thresholds.cache?.maxSize || 1000
      },
      layout: {
        maxOptimizationTime: thresholds.layout?.maxOptimizationTime || 2000,
        maxIterations: thresholds.layout?.maxIterations || 100
      },
      connections: {
        maxCrossings: thresholds.connections?.maxCrossings || 10,
        maxOptimizationTime: thresholds.connections?.maxOptimizationTime || 1500
      }
    };
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs = 5000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    memoryManager.startMonitoring(intervalMs);

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.analyzePerformance();
      this.applyOptimizations();
    }, intervalMs);
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.isMonitoring = false;
    memoryManager.stopMonitoring();
  }

  /**
   * Collect current performance metrics
   */
  collectMetrics(): PerformanceMetrics {
    const timestamp = Date.now();
    
    // Memory metrics
    const memoryStats = memoryManager.getStats();
    const memoryStatus = memoryManager.getMemoryStatus();
    
    // Cache metrics
    const cacheStats = patternCache.getStats();
    
    // Create metrics object
    const metrics: PerformanceMetrics = {
      timestamp,
      memory: {
        usage: memoryStats.currentUsage.used,
        percentage: memoryStats.currentUsage.percentage,
        status: memoryStatus.status
      },
      cache: {
        hitRate: cacheStats.hitRate,
        size: cacheStats.totalSize,
        evictions: cacheStats.evictions
      },
      layout: {
        optimizationTime: 0, // Will be updated when layout optimization occurs
        nodeCount: 0,
        iterations: 0
      },
      connections: {
        totalLength: 0, // Will be updated when connection optimization occurs
        crossings: 0,
        optimizationTime: 0
      },
      overall: {
        score: 0,
        status: 'good',
        recommendations: []
      }
    };

    // Calculate overall performance score
    metrics.overall = this.calculateOverallScore(metrics);
    
    // Store metrics
    this.metrics.push(metrics);
    
    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }

    return metrics;
  }

  /**
   * Analyze performance and identify issues
   */
  analyzePerformance(): void {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return;

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze memory performance
    if (currentMetrics.memory.percentage > this.thresholds.memory.critical) {
      issues.push('Critical memory usage detected');
      recommendations.push('Restart application or clear caches');
    } else if (currentMetrics.memory.percentage > this.thresholds.memory.warning) {
      issues.push('High memory usage detected');
      recommendations.push('Consider clearing non-essential caches');
    }

    // Analyze cache performance
    if (currentMetrics.cache.hitRate < this.thresholds.cache.minHitRate) {
      issues.push('Low cache hit rate');
      recommendations.push('Review caching strategy or increase cache size');
    }

    if (currentMetrics.cache.size > this.thresholds.cache.maxSize) {
      issues.push('Cache size is too large');
      recommendations.push('Implement more aggressive cache eviction');
    }

    // Analyze layout performance
    if (currentMetrics.layout.optimizationTime > this.thresholds.layout.maxOptimizationTime) {
      issues.push('Layout optimization is slow');
      recommendations.push('Use hierarchical optimization for large strategies');
    }

    // Analyze connection performance
    if (currentMetrics.connections.crossings > this.thresholds.connections.maxCrossings) {
      issues.push('Too many connection crossings');
      recommendations.push('Optimize connection routing');
    }

    // Log issues if any
    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues);
      console.info('Recommendations:', recommendations);
    }
  }

  /**
   * Apply automatic optimizations based on performance
   */
  applyOptimizations(): void {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return;

    // Memory optimizations
    if (currentMetrics.memory.percentage > this.thresholds.memory.warning) {
      this.optimizeMemoryUsage();
    }

    // Cache optimizations
    if (currentMetrics.cache.hitRate < this.thresholds.cache.minHitRate) {
      this.optimizeCachePerformance();
    }

    // Layout optimizations
    if (currentMetrics.layout.optimizationTime > this.thresholds.layout.maxOptimizationTime) {
      this.optimizeLayoutPerformance();
    }

    // Connection optimizations
    if (currentMetrics.connections.crossings > this.thresholds.connections.maxCrossings) {
      this.optimizeConnectionPerformance();
    }
  }

  /**
   * Optimize memory usage
   */
  private optimizeMemoryUsage(): void {
    // Clear expired cache entries
    patternCache.clearExpired();
    
    // Force garbage collection if available
    if ((globalThis as any).gc) {
      (globalThis as any).gc();
    }
    
    // Optimize memory manager settings
    memoryManager.optimizeForLargeDataset();
  }

  /**
   * Optimize cache performance
   */
  private optimizeCachePerformance(): void {
    // Clear least recently used entries
    const cacheStats = patternCache.getStats();
    
    if (cacheStats.totalSize > this.thresholds.cache.maxSize) {
      // This would trigger cache cleanup in a real implementation
      console.info('Optimizing cache performance');
    }
  }

  /**
   * Optimize layout performance
   */
  private optimizeLayoutPerformance(): void {
    // Switch to more efficient layout algorithm for large strategies
    console.info('Switching to optimized layout algorithm');
  }

  /**
   * Optimize connection performance
   */
  private optimizeConnectionPerformance(): void {
    // Apply connection optimization
    console.info('Optimizing connection routing');
  }

  /**
   * Calculate overall performance score
   */
  private calculateOverallScore(metrics: PerformanceMetrics): {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    let score = 100;
    const recommendations: string[] = [];

    // Memory score (30% weight)
    const memoryScore = Math.max(0, 100 - metrics.memory.percentage);
    score -= (100 - memoryScore) * 0.3;

    if (metrics.memory.percentage > 80) {
      recommendations.push('Reduce memory usage');
    }

    // Cache score (25% weight)
    const cacheScore = metrics.cache.hitRate * 100;
    score -= (100 - cacheScore) * 0.25;

    if (metrics.cache.hitRate < 0.7) {
      recommendations.push('Improve cache hit rate');
    }

    // Layout score (25% weight)
    const layoutScore = Math.max(0, 100 - (metrics.layout.optimizationTime / 50));
    score -= (100 - layoutScore) * 0.25;

    if (metrics.layout.optimizationTime > 2000) {
      recommendations.push('Optimize layout algorithms');
    }

    // Connection score (20% weight)
    const connectionScore = Math.max(0, 100 - (metrics.connections.crossings * 10));
    score -= (100 - connectionScore) * 0.2;

    if (metrics.connections.crossings > 5) {
      recommendations.push('Reduce connection crossings');
    }

    // Determine status
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 90) {
      status = 'excellent';
    } else if (score >= 75) {
      status = 'good';
    } else if (score >= 60) {
      status = 'fair';
    } else {
      status = 'poor';
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      status,
      recommendations
    };
  }

  /**
   * Get current metrics
   */
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  /**
   * Get metrics history
   */
  getMetricsHistory(count = 10): PerformanceMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Get performance trends
   */
  getPerformanceTrends(): {
    memory: { trend: 'improving' | 'stable' | 'degrading'; change: number };
    cache: { trend: 'improving' | 'stable' | 'degrading'; change: number };
    overall: { trend: 'improving' | 'stable' | 'degrading'; change: number };
  } {
    if (this.metrics.length < 2) {
      return {
        memory: { trend: 'stable', change: 0 },
        cache: { trend: 'stable', change: 0 },
        overall: { trend: 'stable', change: 0 }
      };
    }

    const recent = this.metrics.slice(-5);
    const older = this.metrics.slice(-10, -5);

    const recentAvg = {
      memory: recent.reduce((sum, m) => sum + m.memory.percentage, 0) / recent.length,
      cache: recent.reduce((sum, m) => sum + m.cache.hitRate, 0) / recent.length,
      overall: recent.reduce((sum, m) => sum + m.overall.score, 0) / recent.length
    };

    const olderAvg = {
      memory: older.reduce((sum, m) => sum + m.memory.percentage, 0) / older.length,
      cache: older.reduce((sum, m) => sum + m.cache.hitRate, 0) / older.length,
      overall: older.reduce((sum, m) => sum + m.overall.score, 0) / older.length
    };

    const getTrend = (recent: number, older: number, higherIsBetter = true): 'improving' | 'stable' | 'degrading' => {
      const change = recent - older;
      const threshold = 0.05; // 5% change threshold
      
      if (Math.abs(change) < threshold) return 'stable';
      
      if (higherIsBetter) {
        return change > 0 ? 'improving' : 'degrading';
      } else {
        return change < 0 ? 'improving' : 'degrading';
      }
    };

    return {
      memory: {
        trend: getTrend(recentAvg.memory, olderAvg.memory, false),
        change: recentAvg.memory - olderAvg.memory
      },
      cache: {
        trend: getTrend(recentAvg.cache, olderAvg.cache, true),
        change: recentAvg.cache - olderAvg.cache
      },
      overall: {
        trend: getTrend(recentAvg.overall, olderAvg.overall, true),
        change: recentAvg.overall - olderAvg.overall
      }
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) {
      return 'No performance data available';
    }

    const trends = this.getPerformanceTrends();
    
    const report = [
      '# Performance Report',
      '',
      `**Overall Score:** ${currentMetrics.overall.score.toFixed(1)}/100 (${currentMetrics.overall.status})`,
      '',
      '## Current Metrics',
      `- Memory Usage: ${currentMetrics.memory.percentage.toFixed(1)}% (${currentMetrics.memory.status})`,
      `- Cache Hit Rate: ${(currentMetrics.cache.hitRate * 100).toFixed(1)}%`,
      `- Cache Size: ${currentMetrics.cache.size} items`,
      `- Layout Optimization Time: ${currentMetrics.layout.optimizationTime}ms`,
      `- Connection Crossings: ${currentMetrics.connections.crossings}`,
      '',
      '## Trends',
      `- Memory: ${trends.memory.trend} (${trends.memory.change > 0 ? '+' : ''}${trends.memory.change.toFixed(1)}%)`,
      `- Cache: ${trends.cache.trend} (${trends.cache.change > 0 ? '+' : ''}${(trends.cache.change * 100).toFixed(1)}%)`,
      `- Overall: ${trends.overall.trend} (${trends.overall.change > 0 ? '+' : ''}${trends.overall.change.toFixed(1)} points)`,
      ''
    ];

    if (currentMetrics.overall.recommendations.length > 0) {
      report.push('## Recommendations');
      currentMetrics.overall.recommendations.forEach(rec => {
        report.push(`- ${rec}`);
      });
    }

    return report.join('\n');
  }

  /**
   * Reset performance monitoring
   */
  reset(): void {
    this.metrics = [];
    patternCache.clear();
    memoryManager.resetOptimization();
  }

  /**
   * Get monitoring status
   */
  getStatus(): {
    isMonitoring: boolean;
    metricsCount: number;
    lastUpdate: number | null;
  } {
    return {
      isMonitoring: this.isMonitoring,
      metricsCount: this.metrics.length,
      lastUpdate: this.metrics.length > 0 ? this.metrics[this.metrics.length - 1].timestamp : null
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();