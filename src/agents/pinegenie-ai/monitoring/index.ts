/**
 * PineGenie AI Monitoring System
 * 
 * Comprehensive monitoring and debugging tools for the AI system
 * integration with existing PineGenie functionality.
 */

export { SystemMonitor } from './system-monitor';
export { DebugDashboard } from './debug-dashboard';

export type {
  SystemMetrics,
  PerformanceMetrics,
  MemoryMetrics,
  ErrorMetrics,
  IntegrationMetrics
} from './system-monitor';

// Create singleton monitor instance
import { SystemMonitor } from './system-monitor';

export const globalSystemMonitor = new SystemMonitor({
  maxMetricsHistory: 1000,
  monitoringInterval: 5000,
  enablePerformanceTracking: true,
  enableMemoryTracking: true,
  enableErrorTracking: true
});

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  globalSystemMonitor.startMonitoring();
  console.log('🔍 PineGenie AI system monitoring started in development mode');
}

/**
 * Utility function to track AI operations
 */
export function trackAIOperation<T>(
  operationName: string,
  operation: () => Promise<T> | T
): Promise<T> | T {
  return globalSystemMonitor.trackPerformance(operationName, operation);
}

/**
 * Utility function to get current system health
 */
export function getSystemHealth() {
  return globalSystemMonitor.getSystemStatus();
}

/**
 * Utility function to get performance report
 */
export function getPerformanceReport() {
  return globalSystemMonitor.getPerformanceReport();
}

/**
 * Utility function to export monitoring data
 */
export function exportMonitoringData() {
  return globalSystemMonitor.exportMetrics();
}