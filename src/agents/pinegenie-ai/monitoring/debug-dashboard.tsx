/**
 * PineGenie AI Debug Dashboard
 * 
 * React component for monitoring and debugging the AI system
 * integration with existing functionality.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SystemMonitor, SystemMetrics, PerformanceMetrics } from './system-monitor';

interface DebugDashboardProps {
  monitor: SystemMonitor;
  className?: string;
}

interface DashboardState {
  isMonitoring: boolean;
  currentMetrics: SystemMetrics | null;
  performanceHistory: PerformanceMetrics[];
  systemStatus: 'healthy' | 'warning' | 'critical';
  issues: string[];
  selectedTab: 'overview' | 'performance' | 'memory' | 'errors' | 'integration';
}

export const DebugDashboard: React.FC<DebugDashboardProps> = ({ 
  monitor, 
  className = '' 
}) => {
  const [state, setState] = useState<DashboardState>({
    isMonitoring: false,
    currentMetrics: null,
    performanceHistory: [],
    systemStatus: 'healthy',
    issues: [],
    selectedTab: 'overview'
  });

  // Update metrics callback
  const updateMetrics = useCallback(() => {
    const status = monitor.getSystemStatus();
    const latest = monitor.getLatestMetrics();
    const recent = monitor.getRecentMetrics(20);
    
    setState(prev => ({
      ...prev,
      currentMetrics: latest,
      performanceHistory: recent.map(m => m.performance),
      systemStatus: status.status,
      issues: status.issues
    }));
  }, [monitor]);

  // Setup monitoring
  useEffect(() => {
    monitor.onPerformanceUpdate(updateMetrics);
    updateMetrics();
    
    const interval = setInterval(updateMetrics, 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [monitor, updateMetrics]);

  const toggleMonitoring = () => {
    if (state.isMonitoring) {
      monitor.stopMonitoring();
    } else {
      monitor.startMonitoring();
    }
    
    setState(prev => ({
      ...prev,
      isMonitoring: !prev.isMonitoring
    }));
  };

  const exportMetrics = () => {
    const data = monitor.exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pinegenie-ai-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Status</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(state.systemStatus)}`}>
            {state.systemStatus.toUpperCase()}
          </span>
        </div>
        
        {state.issues.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600 dark:text-red-400">Issues:</h4>
            <ul className="space-y-1">
              {state.issues.map((issue, index) => (
                <li key={index} className="text-sm text-red-600 dark:text-red-400">
                  • {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {state.issues.length === 0 && (
          <p className="text-green-600 dark:text-green-400">All systems operational</p>
        )}
      </div>

      {/* Quick Stats */}
      {state.currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Response Time</div>
            <div className="text-2xl font-bold">
              {formatDuration(state.currentMetrics.performance.totalRequestTime)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</div>
            <div className="text-2xl font-bold">
              {formatBytes(state.currentMetrics.memory.heapUsed)}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Errors</div>
            <div className="text-2xl font-bold text-red-500">
              {state.currentMetrics.errors.totalErrors}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            <div className="text-sm text-gray-600 dark:text-gray-400">Requests/sec</div>
            <div className="text-2xl font-bold">
              {state.currentMetrics.performance.requestsPerSecond.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        
        {state.currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Processing Times</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>NLP Processing:</span>
                  <span>{formatDuration(state.currentMetrics.performance.nlpProcessingTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Strategy Building:</span>
                  <span>{formatDuration(state.currentMetrics.performance.strategyBuildTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pine Script Generation:</span>
                  <span>{formatDuration(state.currentMetrics.performance.pineScriptGenerationTime)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total Request Time:</span>
                  <span>{formatDuration(state.currentMetrics.performance.totalRequestTime)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Throughput</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Requests per Second:</span>
                  <span>{state.currentMetrics.performance.requestsPerSecond.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderMemory = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Memory Usage</h3>
        
        {state.currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Heap Memory</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Used:</span>
                  <span>{formatBytes(state.currentMetrics.memory.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{formatBytes(state.currentMetrics.memory.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span>
                    {((state.currentMetrics.memory.heapUsed / state.currentMetrics.memory.heapTotal) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">System Memory</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>RSS:</span>
                  <span>{formatBytes(state.currentMetrics.memory.rss)}</span>
                </div>
                <div className="flex justify-between">
                  <span>External:</span>
                  <span>{formatBytes(state.currentMetrics.memory.external)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Knowledge Base:</span>
                  <span>{formatBytes(state.currentMetrics.memory.knowledgeBaseSize)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderErrors = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Error Tracking</h3>
        
        {state.currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Error Counts</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Errors:</span>
                  <span className="text-red-500">{state.currentMetrics.errors.totalErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span>NLP Errors:</span>
                  <span>{state.currentMetrics.errors.nlpErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Builder Errors:</span>
                  <span>{state.currentMetrics.errors.builderErrors}</span>
                </div>
                <div className="flex justify-between">
                  <span>Integration Errors:</span>
                  <span>{state.currentMetrics.errors.integrationErrors}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Last Error</h4>
              {state.currentMetrics.errors.lastError ? (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Message:</span>
                    <div className="text-red-600 dark:text-red-400 mt-1">
                      {state.currentMetrics.errors.lastError.message}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Time:</span>
                    <div className="text-gray-600 dark:text-gray-400 mt-1">
                      {new Date(state.currentMetrics.errors.lastError.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-green-600 dark:text-green-400">No recent errors</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderIntegration = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Integration Metrics</h3>
        
        {state.currentMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">System Interactions</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Builder State Changes:</span>
                  <span>{state.currentMetrics.integration.builderStateChanges}</span>
                </div>
                <div className="flex justify-between">
                  <span>Template System Calls:</span>
                  <span>{state.currentMetrics.integration.templateSystemCalls}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pine Script Generations:</span>
                  <span>{state.currentMetrics.integration.pineScriptGenerations}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">UI Integration</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Theme System Interactions:</span>
                  <span>{state.currentMetrics.integration.themeSystemInteractions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Existing Functionality Usage:</span>
                  <span>{state.currentMetrics.integration.existingFunctionalityUsage}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'memory', label: 'Memory', icon: '💾' },
    { id: 'errors', label: 'Errors', icon: '🚨' },
    { id: 'integration', label: 'Integration', icon: '🔗' }
  ] as const;

  return (
    <div className={`pinegenie-ai-debug-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">🤖 PineGenie AI Debug Dashboard</h2>
            <span className={`px-2 py-1 rounded text-sm ${getStatusColor(state.systemStatus)}`}>
              {state.systemStatus}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMonitoring}
              className={`px-4 py-2 rounded font-medium ${
                state.isMonitoring
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {state.isMonitoring ? '⏹️ Stop' : '▶️ Start'} Monitoring
            </button>
            
            <button
              onClick={exportMetrics}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
            >
              📥 Export
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setState(prev => ({ ...prev, selectedTab: tab.id }))}
              className={`px-6 py-3 font-medium text-sm flex items-center space-x-2 ${
                state.selectedTab === tab.id
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
        
        <div className="p-6">
          {state.selectedTab === 'overview' && renderOverview()}
          {state.selectedTab === 'performance' && renderPerformance()}
          {state.selectedTab === 'memory' && renderMemory()}
          {state.selectedTab === 'errors' && renderErrors()}
          {state.selectedTab === 'integration' && renderIntegration()}
        </div>
      </div>
    </div>
  );
};