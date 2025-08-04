/**
 * PineGenie AI System Monitor
 * 
 * Provides comprehensive monitoring and debugging capabilities
 * for the AI system integration with existing functionality.
 */

export interface SystemMetrics {
  timestamp: number;
  performance: PerformanceMetrics;
  memory: MemoryMetrics;
  errors: ErrorMetrics;
  integration: IntegrationMetrics;
}

export interface PerformanceMetrics {
  nlpProcessingTime: number;
  strategyBuildTime: number;
  pineScriptGenerationTime: number;
  totalRequestTime: number;
  requestsPerSecond: number;
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  knowledgeBaseSize: number;
}

export interface ErrorMetrics {
  totalErrors: number;
  nlpErrors: number;
  builderErrors: number;
  integrationErrors: number;
  lastError?: {
    message: string;
    timestamp: number;
    stack?: string;
  };
}

export interface IntegrationMetrics {
  builderStateChanges: number;
  templateSystemCalls: number;
  pineScriptGenerations: number;
  themeSystemInteractions: number;
  existingFunctionalityUsage: number;
}

export class SystemMonitor {
  private metrics: SystemMetrics[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private errorCallbacks: ((error: Error) => void)[] = [];
  private performanceCallbacks: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor(private config: {
    maxMetricsHistory?: number;
    monitoringInterval?: number;
    enablePerformanceTracking?: boolean;
    enableMemoryTracking?: boolean;
    enableErrorTracking?: boolean;
  } = {}) {
    this.config = {
      maxMetricsHistory: 1000,
      monitoringInterval: 5000, // 5 seconds
      enablePerformanceTracking: true,
      enableMemoryTracking: true,
      enableErrorTracking: true,
      ...config
    };
  }

  /**
   * Start system monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('System monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    console.log('🔍 Starting PineGenie AI system monitoring...');

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.monitoringInterval);

    // Initial metrics collection
    this.collectMetrics();
  }

  /**
   * Stop system monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('⏹️  Stopped PineGenie AI system monitoring');
  }

  /**
   * Collect current system metrics
   */
  private collectMetrics(): void {
    const timestamp = Date.now();
    
    const metrics: SystemMetrics = {
      timestamp,
      performance: this.collectPerformanceMetrics(),
      memory: this.collectMemoryMetrics(),
      errors: this.collectErrorMetrics(),
      integration: this.collectIntegrationMetrics()
    };

    this.metrics.push(metrics);

    // Maintain metrics history limit
    if (this.metrics.length > this.config.maxMetricsHistory!) {
      this.metrics = this.metrics.slice(-this.config.maxMetricsHistory!);
    }

    // Trigger callbacks
    this.performanceCallbacks.forEach(callback => {
      try {
        callback(metrics.performance);
      } catch (error) {
        console.error('Error in performance callback:', error);
      }
    });
  }

  /**
   * Collect performance metrics
   */
  private collectPerformanceMetrics(): PerformanceMetrics {
    // These would be populated by actual AI system usage
    return {
      nlpProcessingTime: this.getAverageProcessingTime('nlp'),
      strategyBuildTime: this.getAverageProcessingTime('builder'),
      pineScriptGenerationTime: this.getAverageProcessingTime('pinescript'),
      totalRequestTime: this.getAverageProcessingTime('total'),
      requestsPerSecond: this.calculateRequestsPerSecond()
    };
  }

  /**
   * Collect memory metrics
   */
  private collectMemoryMetrics(): MemoryMetrics {
    const memUsage = process.memoryUsage();
    
    return {
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      rss: memUsage.rss,
      knowledgeBaseSize: this.estimateKnowledgeBaseSize()
    };
  }

  /**
   * Collect error metrics
   */
  private collectErrorMetrics(): ErrorMetrics {
    return {
      totalErrors: this.getTotalErrorCount(),
      nlpErrors: this.getErrorCount('nlp'),
      builderErrors: this.getErrorCount('builder'),
      integrationErrors: this.getErrorCount('integration'),
      lastError: this.getLastError()
    };
  }

  /**
   * Collect integration metrics
   */
  private collectIntegrationMetrics(): IntegrationMetrics {
    return {
      builderStateChanges: this.getIntegrationCount('builder-state'),
      templateSystemCalls: this.getIntegrationCount('template-system'),
      pineScriptGenerations: this.getIntegrationCount('pinescript-generation'),
      themeSystemInteractions: this.getIntegrationCount('theme-system'),
      existingFunctionalityUsage: this.getIntegrationCount('existing-functionality')
    };
  }

  /**
   * Track AI system performance
   */
  trackPerformance<T>(
    operation: string,
    fn: () => Promise<T> | T
  ): Promise<T> | T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      
      if (result instanceof Promise) {
        return result.then(
          (value) => {
            this.recordPerformance(operation, performance.now() - startTime);
            return value;
          },
          (error) => {
            this.recordPerformance(operation, performance.now() - startTime);
            this.recordError(operation, error);
            throw error;
          }
        );
      } else {
        this.recordPerformance(operation, performance.now() - startTime);
        return result;
      }
    } catch (error) {
      this.recordPerformance(operation, performance.now() - startTime);
      this.recordError(operation, error as Error);
      throw error;
    }
  }

  /**
   * Record performance timing
   */
  private recordPerformance(operation: string, duration: number): void {
    // Store performance data for later analysis
    const key = `performance_${operation}`;
    if (!this.performanceData) {
      this.performanceData = new Map();
    }
    
    if (!this.performanceData.has(key)) {
      this.performanceData.set(key, []);
    }
    
    const data = this.performanceData.get(key)!;
    data.push({ timestamp: Date.now(), duration });
    
    // Keep only recent data
    if (data.length > 100) {
      data.splice(0, data.length - 100);
    }
  }

  /**
   * Record system error
   */
  private recordError(operation: string, error: Error): void {
    const errorRecord = {
      operation,
      message: error.message,
      stack: error.stack,
      timestamp: Date.now()
    };

    if (!this.errorData) {
      this.errorData = [];
    }

    this.errorData.push(errorRecord);

    // Keep only recent errors
    if (this.errorData.length > 500) {
      this.errorData.splice(0, this.errorData.length - 500);
    }

    // Trigger error callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in error callback:', callbackError);
      }
    });
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: SystemMetrics;
  } {
    const latestMetrics = this.getLatestMetrics();
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check performance issues
    if (latestMetrics.performance.totalRequestTime > 5000) {
      issues.push('High request processing time detected');
      status = 'warning';
    }

    // Check memory issues
    const memoryUsagePercent = (latestMetrics.memory.heapUsed / latestMetrics.memory.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      issues.push('High memory usage detected');
      status = 'critical';
    } else if (memoryUsagePercent > 75) {
      issues.push('Elevated memory usage detected');
      if (status === 'healthy') status = 'warning';
    }

    // Check error rates
    if (latestMetrics.errors.totalErrors > 10) {
      issues.push('High error rate detected');
      status = 'critical';
    }

    return { status, issues, metrics: latestMetrics };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    averageResponseTime: number;
    requestsPerSecond: number;
    errorRate: number;
    memoryUsage: number;
    topSlowOperations: Array<{ operation: string; averageTime: number }>;
  } {
    const recentMetrics = this.getRecentMetrics(10);
    
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.performance.totalRequestTime, 0) / recentMetrics.length;
    const requestsPerSecond = recentMetrics.reduce((sum, m) => sum + m.performance.requestsPerSecond, 0) / recentMetrics.length;
    const totalRequests = recentMetrics.reduce((sum, m) => sum + m.performance.requestsPerSecond * 5, 0); // 5 second intervals
    const totalErrors = recentMetrics.reduce((sum, m) => sum + m.errors.totalErrors, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const memoryUsage = recentMetrics[recentMetrics.length - 1]?.memory.heapUsed || 0;

    return {
      averageResponseTime,
      requestsPerSecond,
      errorRate,
      memoryUsage,
      topSlowOperations: this.getTopSlowOperations()
    };
  }

  /**
   * Add error callback
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallbacks.push(callback);
  }

  /**
   * Add performance callback
   */
  onPerformanceUpdate(callback: (metrics: PerformanceMetrics) => void): void {
    this.performanceCallbacks.push(callback);
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): SystemMetrics {
    return this.metrics[this.metrics.length - 1] || this.createEmptyMetrics();
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number): SystemMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    timestamp: number;
    metrics: SystemMetrics[];
    summary: any;
  } {
    return {
      timestamp: Date.now(),
      metrics: this.metrics,
      summary: this.getPerformanceReport()
    };
  }

  // Private helper methods
  private performanceData?: Map<string, Array<{ timestamp: number; duration: number }>>;
  private errorData?: Array<{ operation: string; message: string; stack?: string; timestamp: number }>;
  private integrationData?: Map<string, number>;

  private getAverageProcessingTime(operation: string): number {
    const key = `performance_${operation}`;
    const data = this.performanceData?.get(key) || [];
    if (data.length === 0) return 0;
    
    const recentData = data.slice(-10); // Last 10 measurements
    return recentData.reduce((sum, d) => sum + d.duration, 0) / recentData.length;
  }

  private calculateRequestsPerSecond(): number {
    // Calculate based on recent performance data
    const now = Date.now();
    const oneSecondAgo = now - 1000;
    
    let requestCount = 0;
    this.performanceData?.forEach(data => {
      requestCount += data.filter(d => d.timestamp > oneSecondAgo).length;
    });
    
    return requestCount;
  }

  private estimateKnowledgeBaseSize(): number {
    // Estimate knowledge base memory usage
    return 1024 * 1024; // 1MB placeholder
  }

  private getTotalErrorCount(): number {
    return this.errorData?.length || 0;
  }

  private getErrorCount(type: string): number {
    return this.errorData?.filter(e => e.operation.includes(type)).length || 0;
  }

  private getLastError(): ErrorMetrics['lastError'] {
    const lastError = this.errorData?.[this.errorData.length - 1];
    if (!lastError) return undefined;
    
    return {
      message: lastError.message,
      timestamp: lastError.timestamp,
      stack: lastError.stack
    };
  }

  private getIntegrationCount(type: string): number {
    return this.integrationData?.get(type) || 0;
  }

  private getTopSlowOperations(): Array<{ operation: string; averageTime: number }> {
    const operations: Array<{ operation: string; averageTime: number }> = [];
    
    this.performanceData?.forEach((data, key) => {
      const operation = key.replace('performance_', '');
      const averageTime = data.reduce((sum, d) => sum + d.duration, 0) / data.length;
      operations.push({ operation, averageTime });
    });
    
    return operations.sort((a, b) => b.averageTime - a.averageTime).slice(0, 5);
  }

  private createEmptyMetrics(): SystemMetrics {
    return {
      timestamp: Date.now(),
      performance: {
        nlpProcessingTime: 0,
        strategyBuildTime: 0,
        pineScriptGenerationTime: 0,
        totalRequestTime: 0,
        requestsPerSecond: 0
      },
      memory: {
        heapUsed: 0,
        heapTotal: 0,
        external: 0,
        rss: 0,
        knowledgeBaseSize: 0
      },
      errors: {
        totalErrors: 0,
        nlpErrors: 0,
        builderErrors: 0,
        integrationErrors: 0
      },
      integration: {
        builderStateChanges: 0,
        templateSystemCalls: 0,
        pineScriptGenerations: 0,
        themeSystemInteractions: 0,
        existingFunctionalityUsage: 0
      }
    };
  }
}