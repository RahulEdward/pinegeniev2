'use client';

import { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';

interface SystemStatus {
  server: 'online' | 'warning' | 'offline';
  database: 'online' | 'warning' | 'offline';
  api: 'online' | 'warning' | 'offline';
  storage: 'online' | 'warning' | 'offline';
  uptime: string;
  lastUpdated: string;
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    connections: number;
  };
}

const statusConfig = {
  online: {
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    label: 'Online',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    label: 'Warning',
  },
  offline: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    label: 'Offline',
  },
};

export default function SystemStatusCard() {
  const [status, setStatus] = useState<SystemStatus>({
    server: 'online',
    database: 'online',
    api: 'online',
    storage: 'online',
    uptime: '99.9%',
    lastUpdated: new Date().toLocaleTimeString(),
    metrics: {
      cpu: 45,
      memory: 62,
      disk: 78,
      connections: 156,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching system status
    const fetchStatus = async () => {
      try {
        // In a real app, this would fetch from an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate some random metrics
        setStatus(prev => ({
          ...prev,
          lastUpdated: new Date().toLocaleTimeString(),
          metrics: {
            cpu: Math.floor(Math.random() * 30) + 30,
            memory: Math.floor(Math.random() * 40) + 40,
            disk: Math.floor(Math.random() * 20) + 70,
            connections: Math.floor(Math.random() * 100) + 100,
          },
        }));
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    
    // Update every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatusIndicator = ({ 
    type, 
    icon: Icon, 
    label 
  }: { 
    type: keyof typeof statusConfig; 
    icon: any; 
    label: string; 
  }) => {
    const config = statusConfig[type];
    const StatusIcon = config.icon;
    
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <StatusIcon className={`w-4 h-4 ${config.color}`} />
          <span className={`text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        </div>
      </div>
    );
  };

  const MetricBar = ({ 
    label, 
    value, 
    color = 'blue' 
  }: { 
    label: string; 
    value: number; 
    color?: string; 
  }) => {
    const getColorClass = (color: string, value: number) => {
      if (value > 80) return 'bg-red-500';
      if (value > 60) return 'bg-yellow-500';
      return `bg-${color}-500`;
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
          <span className="font-medium text-gray-900 dark:text-white">{value}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getColorClass(color, value)}`}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          System Status
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Updated {status.lastUpdated}</span>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Service Status */}
          <div className="space-y-3">
            <StatusIndicator type={status.server} icon={Server} label="Server" />
            <StatusIndicator type={status.database} icon={Database} label="Database" />
            <StatusIndicator type={status.api} icon={Wifi} label="API" />
            <StatusIndicator type={status.storage} icon={HardDrive} label="Storage" />
          </div>

          {/* System Metrics */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Resource Usage
            </h4>
            <MetricBar label="CPU Usage" value={status.metrics.cpu} color="blue" />
            <MetricBar label="Memory Usage" value={status.metrics.memory} color="green" />
            <MetricBar label="Disk Usage" value={status.metrics.disk} color="purple" />
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="font-medium text-gray-900 dark:text-white">{status.uptime}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600 dark:text-gray-400">Active Connections</span>
              <span className="font-medium text-gray-900 dark:text-white">{status.metrics.connections}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}