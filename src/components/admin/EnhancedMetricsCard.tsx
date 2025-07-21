'use client';

import { 
  Users, 
  Bot, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Shield,
  Database,
  Clock,
  Zap,
  AlertTriangle
} from 'lucide-react';

const iconMap = {
  Users,
  Bot,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Shield,
  Database,
  Clock,
  Zap,
  AlertTriangle,
};

interface MetricsCardProps {
  title: string;
  value: number | string;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: keyof typeof iconMap;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo' | 'pink' | 'teal';
  loading?: boolean;
  subtitle?: string;
  format?: 'number' | 'currency' | 'percentage';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    icon: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    border: 'border-green-200 dark:border-green-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    icon: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-800',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    icon: 'text-red-600 dark:text-red-400',
    border: 'border-red-200 dark:border-red-800',
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  pink: {
    bg: 'bg-pink-50 dark:bg-pink-900/20',
    icon: 'text-pink-600 dark:text-pink-400',
    border: 'border-pink-200 dark:border-pink-800',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-900/20',
    icon: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800',
  },
};

export default function EnhancedMetricsCard({
  title,
  value,
  change,
  icon,
  color,
  loading = false,
  subtitle,
  format = 'number',
}: MetricsCardProps) {
  const Icon = iconMap[icon];
  const colorClass = colorClasses[color];

  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <div className={`p-2 rounded-lg ${colorClass.bg} ${colorClass.border} border`}>
              <Icon className={`w-5 h-5 ${colorClass.icon}`} />
            </div>
          </div>
          
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline space-x-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatValue(value)}
                </p>
                {change && (
                  <div className={`flex items-center space-x-1 ${getTrendColor(change.trend)}`}>
                    {getTrendIcon(change.trend)}
                    <span className="text-sm font-medium">
                      {change.value > 0 ? '+' : ''}{change.value}%
                    </span>
                  </div>
                )}
              </div>
              
              {(subtitle || change) && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {subtitle || (change && `${change.period}`)}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}