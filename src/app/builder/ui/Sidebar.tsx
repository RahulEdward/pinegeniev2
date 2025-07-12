import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';
import {
  BarChart3, TrendingUp, GitBranch, Zap, Shield, Calculator, Timer, Menu, Sparkles
} from 'lucide-react';

const NODE_TYPES = {
  data: {
    icon: BarChart3,
    category: 'Data Sources',
    color: 'purple',
    defaultProps: { timeframe: '1h', source: 'binance' }
  },
  indicator: {
    icon: TrendingUp,
    category: 'Technical Analysis',
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

const nodeTemplates = {
  'Data Sources': [
    { type: 'data', label: 'Live Market Feed', description: 'Real-time OHLCV data stream' },
    { type: 'data', label: 'Historical Data', description: 'Backtesting data source' },
    { type: 'data', label: 'Custom Dataset', description: 'External data integration' },
    { type: 'data', label: 'Crypto Feed', description: 'Cryptocurrency market data' },
  ],
  'Technical Analysis': [
    { type: 'indicator', label: 'Moving Average', description: 'SMA/EMA with adaptive periods' },
    { type: 'indicator', label: 'RSI', description: 'Momentum oscillator' },
    { type: 'indicator', label: 'MACD', description: 'Trend following momentum' },
    { type: 'indicator', label: 'Bollinger Bands', description: 'Volatility bands' },
    { type: 'indicator', label: 'Stochastic', description: 'Momentum oscillator' },
  ],
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
    <div className={`w-80 bg-gradient-to-br ${colors.bg.primary} ${colors.border.primary} border-r overflow-hidden`}>
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
            const nodeType = Object.values(NODE_TYPES).find(nt => nt.category === category) || NODE_TYPES.data;
            const IconComponent = nodeType.icon;
            const accentColor = colors.accent[nodeType.color as keyof typeof colors.accent];
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
      <div className="p-4 h-full overflow-y-auto">
        <div className="space-y-3">
          {nodeTemplates[categoryKeys[activeCategory]]?.map((node, nodeIdx) => {
            const nodeType = NODE_TYPES[node.type as NodeTypeKey];
            const IconComponent = nodeType.icon;
            const accentColor = colors.accent[nodeType.color as keyof typeof colors.accent];
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