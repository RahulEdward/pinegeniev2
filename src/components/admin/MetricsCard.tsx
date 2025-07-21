'use client';

import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Users, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  Activity 
} from 'lucide-react';

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    lightBg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  green: {
    bg: 'bg-green-500',
    text: 'text-green-600',
    lightBg: 'bg-green-50 dark:bg-green-900/20',
  },
  yellow: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
    lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
  },
  red: {
    bg: 'bg-red-500',
    text: 'text-red-600',
    lightBg: 'bg-red-50 dark:bg-red-900/20',
  },
  purple: {
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    lightBg: 'bg-purple-50 dark:bg-purple-900/20',
  },
};

const iconMap = {
  Users,
  Bot,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Activity,
};

export default function MetricsCard({
  title,
  value,
  change,
  icon: iconName,
  color,
  loading = false,
}: MetricsCardProps) {
  const Icon = iconMap[iconName as keyof typeof iconMap] || Users;
  const colors = colorClasses[color];

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className={`w-12 h-12 ${colors.lightBg} rounded-lg`}></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!change) return '';
    
    switch (change.trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </h3>
        <div className={`w-12 h-12 ${colors.lightBg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>

      {change && (
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {change.value > 0 ? '+' : ''}{change.value}%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            vs {change.period}
          </span>
        </div>
      )}
    </div>
  );
}