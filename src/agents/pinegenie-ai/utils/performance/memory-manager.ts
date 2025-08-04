/**
 * Memory Manager
 * Manages memory usage and optimization for the PineGenie AI system
 */

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
  timestamp: number;
}

interface MemoryThresholds {
  warning: number;  // Percentage at which to show warnings
  critical: number; // Percentage at which to start aggressive cleanup
  maximum: number;  // Maximum allowed percentage
}

interface MemoryStats {
  currentUsage: MemoryUsage;
  peakUsage: number;
  averageUsage: number;
  gcCount: number;
  lastGcTime: number;
  memoryLeaks: number;
}

export class MemoryManager {
  private thresholds: MemoryThresholds;
  private stats: MemoryStats;
  private usageHistory: MemoryUsage[] = [];
  private readonly maxHistorySize = 100;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private weakRefs = new Set<WeakRef<any>>();
  private objectRegistry = new Map<string, any>();

  constructor(thresholds: Partial<MemoryThresholds> = {}) {
    this.thresholds = {
      warning: thresholds.warning || 70,
      critical: thresholds.critical || 85,
      maximum: thresholds.maximum || 95
    };

    this.stats = {
      currentUsage: this.getCurrentUsage(),
      peakUsage: 0,
      averageUsage: 0,
      gcCount: 0,
      lastGcTime: 0,
      memoryLeaks: 0
    };
  }

  /**
   * Start memory monitoring
   */
  startMonitoring(intervalMs = 5000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.updateMemoryStats();
      this.checkThresholds();
      this.cleanupWeakRefs();
    }, intervalMs);
  }

  /**
   * Stop memory monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Get current memory usage
   */
  private getCurrentUsage(): MemoryUsage {
    // In browser environment, we can't get exact memory usage
    // This is a simplified implementation
    const performance = (globalThis as any).performance;
    
    if (performance && performance.memory) {
      const memory = performance.memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        timestamp: Date.now()
      };
    }

    // Fallback for environments without performance.memory
    return {
      used: 0,
      total: 100 * 1024 * 1024, // Assume 100MB total
      percentage: 0,
      timestamp: Date.now()
    };
  }

  /**
   * Update memory statistics
   */
  private updateMemoryStats(): void {
    const currentUsage = this.getCurrentUsage();
    this.stats.currentUsage = currentUsage;

    // Update peak usage
    if (currentUsage.percentage > this.stats.peakUsage) {
      this.stats.peakUsage = currentUsage.percentage;
    }

    // Add to history
    this.usageHistory.push(currentUsage);
    if (this.usageHistory.length > this.maxHistorySize) {
      this.usageHistory.shift();
    }

    // Calculate average usage
    const sum = this.usageHistory.reduce((acc, usage) => acc + usage.percentage, 0);
    this.stats.averageUsage = sum / this.usageHistory.length;
  }

  /**
   * Check memory thresholds and take action
   */
  private checkThresholds(): void {
    const currentPercentage = this.stats.currentUsage.percentage;

    if (currentPercentage >= this.thresholds.maximum) {
      this.performEmergencyCleanup();
    } else if (currentPercentage >= this.thresholds.critical) {
      this.performAggressiveCleanup();
    } else if (currentPercentage >= this.thresholds.warning) {
      this.performGentleCleanup();
    }
  }

  /**
   * Perform gentle cleanup
   */
  private performGentleCleanup(): void {
    // Clear expired cache entries
    this.clearExpiredCaches();
    
    // Clean up weak references
    this.cleanupWeakRefs();
    
    console.warn(`Memory usage at ${this.stats.currentUsage.percentage.toFixed(1)}% - performing gentle cleanup`);
  }

  /**
   * Perform aggressive cleanup
   */
  private performAggressiveCleanup(): void {
    this.performGentleCleanup();
    
    // Clear more caches
    this.clearNonEssentialCaches();
    
    // Force garbage collection if available
    this.forceGarbageCollection();
    
    console.warn(`Memory usage at ${this.stats.currentUsage.percentage.toFixed(1)}% - performing aggressive cleanup`);
  }

  /**
   * Perform emergency cleanup
   */
  private performEmergencyCleanup(): void {
    this.performAggressiveCleanup();
    
    // Clear all non-critical data
    this.clearAllCaches();
    
    // Reset object registry
    this.objectRegistry.clear();
    
    console.error(`Memory usage at ${this.stats.currentUsage.percentage.toFixed(1)}% - performing emergency cleanup`);
  }

  /**
   * Clear expired caches (placeholder - would integrate with actual cache systems)
   */
  private clearExpiredCaches(): void {
    // This would integrate with the PatternCache and other cache systems
    // For now, it's a placeholder
  }

  /**
   * Clear non-essential caches
   */
  private clearNonEssentialCaches(): void {
    // Clear search result caches, temporary data, etc.
  }

  /**
   * Clear all caches
   */
  private clearAllCaches(): void {
    // Clear all cache systems
  }

  /**
   * Force garbage collection if available
   */
  private forceGarbageCollection(): void {
    if ((globalThis as any).gc) {
      (globalThis as any).gc();
      this.stats.gcCount++;
      this.stats.lastGcTime = Date.now();
    }
  }

  /**
   * Clean up weak references
   */
  private cleanupWeakRefs(): void {
    const toDelete: WeakRef<any>[] = [];
    
    for (const ref of this.weakRefs) {
      if (ref.deref() === undefined) {
        toDelete.push(ref);
      }
    }
    
    toDelete.forEach(ref => this.weakRefs.delete(ref));
  }

  /**
   * Register an object for memory tracking
   */
  registerObject(id: string, object: any): void {
    this.objectRegistry.set(id, object);
  }

  /**
   * Unregister an object
   */
  unregisterObject(id: string): void {
    this.objectRegistry.delete(id);
  }

  /**
   * Create a weak reference to an object
   */
  createWeakRef<T extends object>(object: T): WeakRef<T> {
    const ref = new WeakRef(object);
    this.weakRefs.add(ref);
    return ref;
  }

  /**
   * Get memory statistics
   */
  getStats(): MemoryStats {
    return { ...this.stats };
  }

  /**
   * Get memory usage history
   */
  getUsageHistory(): MemoryUsage[] {
    return [...this.usageHistory];
  }

  /**
   * Get current memory status
   */
  getMemoryStatus(): {
    status: 'normal' | 'warning' | 'critical' | 'emergency';
    percentage: number;
    message: string;
  } {
    const percentage = this.stats.currentUsage.percentage;
    
    if (percentage >= this.thresholds.maximum) {
      return {
        status: 'emergency',
        percentage,
        message: 'Memory usage is critically high - emergency cleanup in progress'
      };
    } else if (percentage >= this.thresholds.critical) {
      return {
        status: 'critical',
        percentage,
        message: 'Memory usage is high - aggressive cleanup in progress'
      };
    } else if (percentage >= this.thresholds.warning) {
      return {
        status: 'warning',
        percentage,
        message: 'Memory usage is elevated - monitoring closely'
      };
    } else {
      return {
        status: 'normal',
        percentage,
        message: 'Memory usage is normal'
      };
    }
  }

  /**
   * Optimize memory usage for large datasets
   */
  optimizeForLargeDataset(): void {
    // Reduce cache sizes
    this.thresholds.warning = 60;
    this.thresholds.critical = 75;
    this.thresholds.maximum = 90;
    
    // More frequent cleanup
    this.performGentleCleanup();
  }

  /**
   * Reset memory optimization settings
   */
  resetOptimization(): void {
    this.thresholds = {
      warning: 70,
      critical: 85,
      maximum: 95
    };
  }

  /**
   * Get memory recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const status = this.getMemoryStatus();
    
    if (status.status === 'warning' || status.status === 'critical') {
      recommendations.push('Consider reducing the number of cached patterns');
      recommendations.push('Clear browser cache and reload the application');
      recommendations.push('Close other browser tabs to free up memory');
    }
    
    if (status.status === 'critical' || status.status === 'emergency') {
      recommendations.push('Restart the application to reset memory usage');
      recommendations.push('Use smaller strategy templates');
      recommendations.push('Avoid building very complex strategies');
    }
    
    if (this.stats.memoryLeaks > 0) {
      recommendations.push('Memory leaks detected - consider restarting the application');
    }
    
    return recommendations;
  }

  /**
   * Cleanup and destroy the memory manager
   */
  destroy(): void {
    this.stopMonitoring();
    this.objectRegistry.clear();
    this.weakRefs.clear();
    this.usageHistory = [];
  }
}

// Singleton instance
export const memoryManager = new MemoryManager();