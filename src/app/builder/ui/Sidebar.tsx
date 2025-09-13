import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import {
  BarChart3, TrendingUp, GitBranch, Zap, Shield, Calculator, Timer, Menu, Sparkles
} from 'lucide-react';
import { indicatorDefinitions, getIndicatorsByCategory, type IndicatorDefinition } from '../data/indicator-defs';

const CATEGORY_CONFIG = {
  'Data Sources': {
    icon: BarChart3,
    color: 'purple',
    nodeType: 'data'
  },
  'Trend': {
    icon: TrendingUp,
    color: 'blue',
    nodeType: 'indicator'
  },
  'Momentum': {
    icon: Zap,
    color: 'orange',
    nodeType: 'indicator'
  },
  'Volatility': {
    icon: BarChart3,
    color: 'red',
    nodeType: 'indicator'
  },
  'Volume': {
    icon: BarChart3,
    color: 'purple',
    nodeType: 'indicator'
  },
  'Support/Resistance': {
    icon: Shield,
    color: 'green',
    nodeType: 'indicator'
  },
  'Custom': {
    icon: Sparkles,
    color: 'indigo',
    nodeType: 'indicator'
  },
  'Conditions': {
    icon: GitBranch,
    color: 'orange',
    nodeType: 'condition'
  },
  'Actions': {
    icon: Zap,
    color: 'green',
    nodeType: 'action'
  },
  'Risk Management': {
    icon: Shield,
    color: 'red',
    nodeType: 'risk'
  },
  'Math & Logic': {
    icon: Calculator,
    color: 'indigo',
    nodeType: 'math'
  }
};

const NODE_TYPES = {
  data: {
    icon: BarChart3,
    category: 'Data Sources',
    color: 'purple',
    defaultProps: { timeframe: '1h', source: 'binance' }
  },
  indicator: {
    icon: TrendingUp,
    category: 'Trend',
    color: 'blue',
    defaultProps: { period: 14, type: 'sma' }
  },
  condition: {
    icon: GitBranch,
    category: 'Conditions',
    color: 'orange',
    defaultProps: { operator: 'crossover', threshold: 0 }
  },
  action: {
    icon: Zap,
    category: 'Actions',
    color: 'green',
    defaultProps: { quantity: '10%', orderType: 'market' }
  },
  risk: {
    icon: Shield,
    category: 'Risk Management',
    color: 'red',
    defaultProps: { stopLoss: '2%', takeProfit: '5%' }
  },
  math: {
    icon: Calculator,
    category: 'Math & Logic',
    color: 'indigo',
    defaultProps: { operation: 'add', value: 0 }
  },
  timing: {
    icon: Timer,
    category: 'Timing',
    color: 'indigo',
    defaultProps: { startTime: '09:00', endTime: '16:00' }
  }
};

// Get indicators organized by category
const indicatorsByCategory = getIndicatorsByCategory();

const nodeTemplates = {
  'Data Sources': [
    { type: 'data', label: 'Price Data', description: 'OHLCV price data (handled by TradingView)' },
    { type: 'data', label: 'Volume Data', description: 'Trading volume data' },
  ],
  'Trend': indicatorsByCategory.Trend?.map(indicator => ({
    type: 'indicator' as const,
    label: indicator.name,
    description: indicator.description,
    indicatorId: indicator.id,
    indicatorData: indicator
  })) || [],
  'Momentum': indicatorsByCategory.Momentum?.map(indicator => ({
    type: 'indicator' as const,
    label: indicator.name,
    description: indicator.description,
    indicatorId: indicator.id,
    indicatorData: indicator
  })) || [],
  'Volatility': indicatorsByCategory.Volatility?.map(indicator => ({
    type: 'indicator' as const,
    label: indicator.name,
    description: indicator.description,
    indicatorId: indicator.id,
    indicatorData: indicator
  })) || [],
  'Volume': indicatorsByCategory.Volume?.map(indicator => ({
    type: 'indicator' as const,
    label: indicator.name,
    description: indicator.description,
    indicatorId: indicator.id,
    indicatorData: indicator
  })) || [],
  'Support/Resistance': indicatorsByCategory['Support/Resistance']?.map(indicator => ({
    type: 'indicator' as const,
    label: indicator.name,
    description: indicator.description,
    indicatorId: indicator.id,
    indicatorData: indicator
  })) || [],
  'Custom': indicatorsByCategory.Custom?.map(indicator => ({
    type: 'indicator' as const,
    label: indicator.name,
    description: indicator.description,
    indicatorId: indicator.id,
    indicatorData: indicator
  })) || [],
  'Conditions': [
    { type: 'condition', label: 'Price Crossover', description: 'Price crosses indicator' },
    { type: 'condition', label: 'Breakout', description: 'Support/resistance breaks' },
    { type: 'condition', label: 'Divergence', description: 'Price-indicator divergence' },
    { type: 'condition', label: 'Pattern Match', description: 'Chart pattern recognition' },
  ],
  'Actions': [
    { type: 'action', label: 'Buy Order', description: 'Long position entry' },
    { type: 'action', label: 'Sell Order', description: 'Short position entry' },
    { type: 'action', label: 'Close Position', description: 'Exit current position' },
    { type: 'action', label: 'Alert', description: 'Send notification' },
  ],
  'Risk Management': [
    { type: 'risk', label: 'Stop Loss', description: 'Risk management' },
    { type: 'risk', label: 'Take Profit', description: 'Profit target' },
    { type: 'risk', label: 'Position Size', description: 'Calculate position size' },
  ],
  'Math & Logic': [
    { type: 'math', label: 'Calculator', description: 'Mathematical operations' },
    { type: 'math', label: 'Comparison', description: 'Compare values' },
    { type: 'timing', label: 'Time Filter', description: 'Trading hours filter' },
  ]
};

type NodeTypeKey = keyof typeof NODE_TYPES;
type NodeCategory = keyof typeof nodeTemplates;

interface NodeTemplate {
  type: NodeTypeKey;
  label: string;
  description: string;
  indicatorId?: string;
  indicatorData?: IndicatorDefinition;
}

interface SidebarProps {
  onNodeAdd: (nodeTemplate: NodeTemplate) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNodeAdd, isCollapsed, onToggleCollapse }) => {
  const { colors } = useTheme();
  const [activeCategory, setActiveCategory] = useState(0);

  if (isCollapsed) {
    return (
      <div className={`w-16 bg-gradient-to-br ${colors.bg.primary} ${colors.border.primary} border-r flex flex-col items-center py-4`}>
        <button
          onClick={onToggleCollapse}
          className={`p-3 ${colors.bg.secondary} rounded-xl ${colors.text.secondary} hover:${colors.text.primary} transition-colors mb-4`}
        >
          <Menu className="w-5 h-5" />
        </button>
        {Object.values(NODE_TYPES).map((nodeType, idx) => {
          const IconComponent = nodeType.icon;
          return (
            <div
              key={idx}
              className={`p-3 mb-2 ${colors.bg.card} rounded-xl ${colors.text.tertiary} hover:${colors.text.primary} transition-colors cursor-pointer`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
          );
        })}
      </div>
    );
  }

  const categoryKeys = Object.keys(nodeTemplates) as NodeCategory[];

  return (
    <div className={`w-64 bg-gradient-to-br ${colors.bg.primary} ${colors.border.primary} border-r overflow-y-auto overflow-x-hidden`} style={{ maxHeight: '100vh' }}>
      {/* Header */}
      <div className={`p-6 ${colors.border.primary} border-b`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h3 className={`text-xl font-bold ${colors.text.primary}`}>Components</h3>
          </div>
          <button
            onClick={onToggleCollapse}
            className={`p-2 ${colors.bg.tertiary} rounded-lg ${colors.text.secondary} hover:${colors.text.primary} transition-colors`}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
        <p className={`text-sm ${colors.text.tertiary}`}>
          Click to add components to your strategy
        </p>
      </div>
      {/* Category tabs */}
      <div className={`p-4 ${colors.border.primary} border-b`}>
        <div className="grid grid-cols-2 gap-2">
          {categoryKeys.map((category, idx) => {
            const categoryConfig = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
            const IconComponent = categoryConfig?.icon || BarChart3;
            const accentColor = colors.accent[categoryConfig?.color as keyof typeof colors.accent] || colors.accent.blue;
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`flex items-center gap-2 p-3 rounded-xl transition-all duration-300 text-xs font-medium ${
                  activeCategory === idx 
                    ? `bg-gradient-to-r ${accentColor} text-white shadow-lg` 
                    : `${colors.bg.card} ${colors.text.tertiary} hover:${colors.bg.tertiary} hover:${colors.text.primary}`
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="truncate">{category}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Component list */}
      <div className="p-4 overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="space-y-3" style={{ maxHeight: 'none', overflow: 'visible' }}>
          {nodeTemplates[categoryKeys[activeCategory]]?.map((node, nodeIdx) => {
            const currentCategory = categoryKeys[activeCategory];
            const categoryConfig = CATEGORY_CONFIG[currentCategory as keyof typeof CATEGORY_CONFIG];
            const IconComponent = categoryConfig?.icon || BarChart3;
            const accentColor = colors.accent[categoryConfig?.color as keyof typeof colors.accent] || colors.accent.blue;
            
            return (
              <div
                key={nodeIdx}
                className={`group ${colors.bg.card} backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:${colors.bg.tertiary} ${colors.border.secondary} border hover:${colors.border.primary} transition-all duration-300 transform hover:scale-105`}
                onClick={() => onNodeAdd(node as NodeTemplate)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${accentColor} text-white flex-shrink-0`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${colors.text.primary} group-hover:text-blue-400 transition-colors`}>
                      {node.label}
                    </h4>
                    <p className={`text-xs ${colors.text.tertiary} mt-1 leading-relaxed`}>
                      {node.description}
                    </p>
                    {node.indicatorData && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${colors.bg.tertiary} ${colors.text.secondary}`}>
                          {node.indicatorData.difficulty}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${colors.bg.tertiary} ${colors.text.secondary}`}>
                          {node.indicatorData.type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 