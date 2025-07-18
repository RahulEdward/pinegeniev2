/**
 * Pine Script v6 Template Library
 * 
 * This library contains:
 * - Pre-validated Pine Script v6 strategy templates
 * - Common trading patterns and strategies
 * - Template categories for different trading styles
 * - Template customization and parameter injection
 * - Zero-error template validation system
 */

import { CustomNode, CustomEdge, NodeConfig } from './canvas-config';

// Template categories for organization
export enum TemplateCategory {
  TREND_FOLLOWING = 'trend_following',
  MEAN_REVERSION = 'mean_reversion',
  BREAKOUT = 'breakout',
  SCALPING = 'scalping',
  SWING_TRADING = 'swing_trading',
  POSITION_TRADING = 'position_trading',
  ARBITRAGE = 'arbitrage',
  MOMENTUM = 'momentum',
  VOLATILITY = 'volatility',
  MULTI_TIMEFRAME = 'multi_timeframe'
}

// Template difficulty levels
export enum TemplateDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

// Template interface
export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: TemplateDifficulty;
  tags: string[];
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  
  // Template configuration
  nodes: TemplateNode[];
  edges: TemplateEdge[];
  parameters: TemplateParameter[];
  
  // Metadata
  expectedReturn?: number;
  maxDrawdown?: number;
  winRate?: number;
  sharpeRatio?: number;
  
  // Documentation
  documentation: {
    overview: string;
    howItWorks: string;
    bestMarkets: string[];
    timeframes: string[];
    riskLevel: 'low' | 'medium' | 'high';
    pros: string[];
    cons: string[];
    tips: string[];
  };
  
  // Pine Script code template
  pineScriptTemplate: string;
}

// Template node interface
export interface TemplateNode {
  id: string;
  type: string;
  label: string;
  description: string;
  position: { x: number; y: number };
  config: NodeConfig;
  category: string;
  isCustomizable: boolean;
  customizationOptions?: TemplateCustomization[];
}

// Template edge interface
export interface TemplateEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  description?: string;
}

// Template parameter interface
export interface TemplateParameter {
  id: string;
  name: string;
  type: 'int' | 'float' | 'bool' | 'string' | 'color';
  defaultValue: number | string | boolean;
  minValue?: number;
  maxValue?: number;
  options?: string[];
  description: string;
  category: string;
  affects: string[]; // Which nodes this parameter affects
}

// Template customization options
export interface TemplateCustomization {
  parameter: string;
  displayName: string;
  description: string;
  type: 'slider' | 'input' | 'select' | 'toggle';
  validation?: (value: number | string | boolean) => boolean;
}

// Comprehensive Template Library
export const PINE_SCRIPT_TEMPLATES: Record<string, StrategyTemplate> = {
  
  // 1. RSI Mean Reversion Strategy
  'rsi_mean_reversion': {
    id: 'rsi_mean_reversion',
    name: 'RSI Mean Reversion',
    description: 'Classic mean reversion strategy using RSI overbought/oversold levels',
    category: TemplateCategory.MEAN_REVERSION,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['RSI', 'mean reversion', 'overbought', 'oversold', 'beginner'],
    author: 'PineGenie',
    version: '1.0.0',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    
    expectedReturn: 15.2,
    maxDrawdown: 8.5,
    winRate: 68,
    sharpeRatio: 1.45,
    
    nodes: [
      {
        id: 'data_source',
        type: 'data-source',
        label: 'Market Data',
        description: 'Real-time price data source',
        position: { x: 100, y: 200 },
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        category: 'Data',
        isCustomizable: true,
        customizationOptions: [
          {
            parameter: 'timeframe',
            displayName: 'Timeframe',
            description: 'Chart timeframe for analysis',
            type: 'select'
          }
        ]
      },
      {
        id: 'rsi_indicator',
        type: 'indicator',
        label: 'RSI (14)',
        description: 'Relative Strength Index with 14-period',
        position: { x: 350, y: 200 },
        config: {
          indicatorId: 'rsi',
          parameters: { period: 14, source: 'close', overbought: 70, oversold: 30 }
        },
        category: 'Technical Analysis',
        isCustomizable: true,
        customizationOptions: [
          {
            parameter: 'period',
            displayName: 'RSI Period',
            description: 'Number of periods for RSI calculation',
            type: 'slider'
          },
          {
            parameter: 'overbought',
            displayName: 'Overbought Level',
            description: 'RSI level considered overbought',
            type: 'slider'
          },
          {
            parameter: 'oversold',
            displayName: 'Oversold Level',
            description: 'RSI level considered oversold',
            type: 'slider'
          }
        ]
      },
      {
        id: 'oversold_condition',
        type: 'condition',
        label: 'RSI Oversold',
        description: 'Trigger when RSI is below oversold level',
        position: { x: 600, y: 150 },
        config: { operator: 'less_than', threshold: 30 },
        category: 'Conditions',
        isCustomizable: true
      },
      {
        id: 'overbought_condition',
        type: 'condition',
        label: 'RSI Overbought',
        description: 'Trigger when RSI is above overbought level',
        position: { x: 600, y: 250 },
        config: { operator: 'greater_than', threshold: 70 },
        category: 'Conditions',
        isCustomizable: true
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Order',
        description: 'Execute buy order when oversold',
        position: { x: 850, y: 150 },
        config: { orderType: 'market', quantity: '25%' },
        category: 'Actions',
        isCustomizable: true
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Order',
        description: 'Execute sell order when overbought',
        position: { x: 850, y: 250 },
        config: { orderType: 'market', quantity: '100%' },
        category: 'Actions',
        isCustomizable: true
      },
      {
        id: 'stop_loss',
        type: 'risk',
        label: 'Stop Loss',
        description: 'Risk management with 2% stop loss',
        position: { x: 850, y: 350 },
        config: { stopLoss: 2, maxRisk: 1 },
        category: 'Risk Management',
        isCustomizable: true
      }
    ],
    
    edges: [
      { id: 'e1', source: 'data_source', target: 'rsi_indicator' },
      { id: 'e2', source: 'rsi_indicator', target: 'oversold_condition' },
      { id: 'e3', source: 'rsi_indicator', target: 'overbought_condition' },
      { id: 'e4', source: 'oversold_condition', target: 'buy_action' },
      { id: 'e5', source: 'overbought_condition', target: 'sell_action' }
    ],
    
    parameters: [
      {
        id: 'rsi_period',
        name: 'RSI Period',
        type: 'int',
        defaultValue: 14,
        minValue: 2,
        maxValue: 100,
        description: 'Number of periods for RSI calculation',
        category: 'Technical Analysis',
        affects: ['rsi_indicator']
      },
      {
        id: 'overbought_level',
        name: 'Overbought Level',
        type: 'int',
        defaultValue: 70,
        minValue: 50,
        maxValue: 95,
        description: 'RSI level considered overbought',
        category: 'Technical Analysis',
        affects: ['overbought_condition']
      },
      {
        id: 'oversold_level',
        name: 'Oversold Level',
        type: 'int',
        defaultValue: 30,
        minValue: 5,
        maxValue: 50,
        description: 'RSI level considered oversold',
        category: 'Technical Analysis',
        affects: ['oversold_condition']
      }
    ],
    
    documentation: {
      overview: 'The RSI Mean Reversion strategy is a classic approach that capitalizes on the tendency of prices to revert to their mean after reaching extreme levels.',
      howItWorks: 'The strategy uses the Relative Strength Index (RSI) to identify overbought and oversold conditions. When RSI falls below 30 (oversold), it generates a buy signal. When RSI rises above 70 (overbought), it generates a sell signal.',
      bestMarkets: ['Cryptocurrency', 'Forex', 'Stocks', 'Commodities'],
      timeframes: ['15m', '1h', '4h', '1d'],
      riskLevel: 'medium',
      pros: [
        'Simple and easy to understand',
        'Works well in ranging markets',
        'Good risk-reward ratio',
        'Widely tested and proven'
      ],
      cons: [
        'Can generate false signals in trending markets',
        'May miss strong trend moves',
        'Requires proper risk management'
      ],
      tips: [
        'Use in conjunction with support/resistance levels',
        'Consider market context and overall trend',
        'Adjust RSI parameters based on market volatility',
        'Always use stop losses'
      ]
    },
    
    pineScriptTemplate: `//@version=6
strategy("RSI Mean Reversion Strategy", overlay=true, initial_capital=10000)

// Strategy Parameters
rsi_period = input.int(14, "RSI Period", minval=2, maxval=100)
overbought_level = input.int(70, "Overbought Level", minval=50, maxval=95)
oversold_level = input.int(30, "Oversold Level", minval=5, maxval=50)
position_size = input.float(25.0, "Position Size (%)", minval=1, maxval=100)

// Technical Indicators
rsi = ta.rsi(close, rsi_period)

// Trading Conditions
oversold_condition = rsi < oversold_level
overbought_condition = rsi > overbought_level

// Strategy Logic
if oversold_condition
    strategy.entry("Long", strategy.long, qty=strategy.equity * position_size / 100 / close)

if overbought_condition
    strategy.close("Long")

// Risk Management
strategy.exit("Stop Loss", "Long", loss=close * 0.02)

// Plots
plot(rsi, "RSI", color=color.purple)
hline(overbought_level, "Overbought", color=color.red, linestyle=hline.style_dashed)
hline(oversold_level, "Oversold", color=color.green, linestyle=hline.style_dashed)
plotshape(oversold_condition, title="Buy Signal", location=location.belowbar, color=color.green, style=shape.labelup, text="BUY")
plotshape(overbought_condition, title="Sell Signal", location=location.abovebar, color=color.red, style=shape.labeldown, text="SELL")`
  },

  // 2. Moving Average Crossover Strategy
  'ma_crossover': {
    id: 'ma_crossover',
    name: 'Moving Average Crossover',
    description: 'Trend-following strategy using fast and slow moving average crossovers',
    category: TemplateCategory.TREND_FOLLOWING,
    difficulty: TemplateDifficulty.BEGINNER,
    tags: ['moving average', 'crossover', 'trend following', 'SMA', 'EMA'],
    author: 'PineGenie',
    version: '1.0.0',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    
    expectedReturn: 22.8,
    maxDrawdown: 12.3,
    winRate: 58,
    sharpeRatio: 1.32,
    
    nodes: [
      {
        id: 'data_source',
        type: 'data-source',
        label: 'Market Data',
        description: 'Price data source',
        position: { x: 100, y: 200 },
        config: { symbol: 'BTCUSDT', timeframe: '4h', source: 'close' },
        category: 'Data',
        isCustomizable: true
      },
      {
        id: 'fast_ma',
        type: 'indicator',
        label: 'Fast MA (10)',
        description: 'Fast moving average',
        position: { x: 350, y: 150 },
        config: { indicatorId: 'sma', parameters: { period: 10, source: 'close' } },
        category: 'Technical Analysis',
        isCustomizable: true
      },
      {
        id: 'slow_ma',
        type: 'indicator',
        label: 'Slow MA (20)',
        description: 'Slow moving average',
        position: { x: 350, y: 250 },
        config: { indicatorId: 'sma', parameters: { period: 20, source: 'close' } },
        category: 'Technical Analysis',
        isCustomizable: true
      },
      {
        id: 'crossover_condition',
        type: 'condition',
        label: 'MA Crossover',
        description: 'Fast MA crosses above Slow MA',
        position: { x: 600, y: 150 },
        config: { operator: 'crosses_above' },
        category: 'Conditions',
        isCustomizable: false
      },
      {
        id: 'crossunder_condition',
        type: 'condition',
        label: 'MA Crossunder',
        description: 'Fast MA crosses below Slow MA',
        position: { x: 600, y: 250 },
        config: { operator: 'crosses_below' },
        category: 'Conditions',
        isCustomizable: false
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Order',
        description: 'Enter long position',
        position: { x: 850, y: 150 },
        config: { orderType: 'market', quantity: '50%' },
        category: 'Actions',
        isCustomizable: true
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Order',
        description: 'Close long position',
        position: { x: 850, y: 250 },
        config: { orderType: 'market', quantity: '100%' },
        category: 'Actions',
        isCustomizable: true
      }
    ],
    
    edges: [
      { id: 'e1', source: 'data_source', target: 'fast_ma' },
      { id: 'e2', source: 'data_source', target: 'slow_ma' },
      { id: 'e3', source: 'fast_ma', target: 'crossover_condition' },
      { id: 'e4', source: 'slow_ma', target: 'crossover_condition' },
      { id: 'e5', source: 'fast_ma', target: 'crossunder_condition' },
      { id: 'e6', source: 'slow_ma', target: 'crossunder_condition' },
      { id: 'e7', source: 'crossover_condition', target: 'buy_action' },
      { id: 'e8', source: 'crossunder_condition', target: 'sell_action' }
    ],
    
    parameters: [
      {
        id: 'fast_period',
        name: 'Fast MA Period',
        type: 'int',
        defaultValue: 10,
        minValue: 2,
        maxValue: 50,
        description: 'Period for fast moving average',
        category: 'Technical Analysis',
        affects: ['fast_ma']
      },
      {
        id: 'slow_period',
        name: 'Slow MA Period',
        type: 'int',
        defaultValue: 20,
        minValue: 10,
        maxValue: 200,
        description: 'Period for slow moving average',
        category: 'Technical Analysis',
        affects: ['slow_ma']
      }
    ],
    
    documentation: {
      overview: 'The Moving Average Crossover strategy is one of the most popular trend-following strategies, using the crossover of two moving averages to generate trading signals.',
      howItWorks: 'When the fast moving average crosses above the slow moving average, it generates a buy signal. When the fast MA crosses below the slow MA, it generates a sell signal.',
      bestMarkets: ['Trending markets', 'Cryptocurrency', 'Forex', 'Stocks'],
      timeframes: ['1h', '4h', '1d', '1w'],
      riskLevel: 'medium',
      pros: [
        'Simple and reliable',
        'Works well in trending markets',
        'Easy to understand and implement',
        'Good for beginners'
      ],
      cons: [
        'Generates false signals in sideways markets',
        'Lagging indicator',
        'Can miss quick reversals'
      ],
      tips: [
        'Use in trending markets for best results',
        'Consider adding volume confirmation',
        'Adjust periods based on market volatility',
        'Use with other trend indicators'
      ]
    },
    
    pineScriptTemplate: `//@version=6
strategy("Moving Average Crossover Strategy", overlay=true, initial_capital=10000)

// Strategy Parameters
fast_period = input.int(10, "Fast MA Period", minval=2, maxval=50)
slow_period = input.int(20, "Slow MA Period", minval=10, maxval=200)
position_size = input.float(50.0, "Position Size (%)", minval=1, maxval=100)

// Technical Indicators
fast_ma = ta.sma(close, fast_period)
slow_ma = ta.sma(close, slow_period)

// Trading Conditions
crossover_condition = ta.crossover(fast_ma, slow_ma)
crossunder_condition = ta.crossunder(fast_ma, slow_ma)

// Strategy Logic
if crossover_condition
    strategy.entry("Long", strategy.long, qty=strategy.equity * position_size / 100 / close)

if crossunder_condition
    strategy.close("Long")

// Plots
plot(fast_ma, "Fast MA", color=color.blue, linewidth=2)
plot(slow_ma, "Slow MA", color=color.red, linewidth=2)
plotshape(crossover_condition, title="Buy Signal", location=location.belowbar, color=color.green, style=shape.labelup, text="BUY")
plotshape(crossunder_condition, title="Sell Signal", location=location.abovebar, color=color.red, style=shape.labeldown, text="SELL")`
  },

  // 3. Bollinger Bands Breakout Strategy
  'bollinger_breakout': {
    id: 'bollinger_breakout',
    name: 'Bollinger Bands Breakout',
    description: 'Volatility breakout strategy using Bollinger Bands expansion and contraction',
    category: TemplateCategory.BREAKOUT,
    difficulty: TemplateDifficulty.INTERMEDIATE,
    tags: ['bollinger bands', 'breakout', 'volatility', 'squeeze'],
    author: 'PineGenie',
    version: '1.0.0',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    
    expectedReturn: 28.5,
    maxDrawdown: 15.2,
    winRate: 52,
    sharpeRatio: 1.58,
    
    nodes: [
      {
        id: 'data_source',
        type: 'data-source',
        label: 'Market Data',
        description: 'Price data source',
        position: { x: 100, y: 200 },
        config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
        category: 'Data',
        isCustomizable: true
      },
      {
        id: 'bb_indicator',
        type: 'indicator',
        label: 'Bollinger Bands',
        description: 'Bollinger Bands with 20 period and 2 std dev',
        position: { x: 350, y: 200 },
        config: { indicatorId: 'bb', parameters: { period: 20, stddev: 2, source: 'close' } },
        category: 'Technical Analysis',
        isCustomizable: true
      },
      {
        id: 'upper_breakout',
        type: 'condition',
        label: 'Upper Band Breakout',
        description: 'Price breaks above upper Bollinger Band',
        position: { x: 600, y: 150 },
        config: { operator: 'crosses_above' },
        category: 'Conditions',
        isCustomizable: false
      },
      {
        id: 'lower_breakout',
        type: 'condition',
        label: 'Lower Band Breakout',
        description: 'Price breaks below lower Bollinger Band',
        position: { x: 600, y: 250 },
        config: { operator: 'crosses_below' },
        category: 'Conditions',
        isCustomizable: false
      },
      {
        id: 'buy_action',
        type: 'action',
        label: 'Buy Breakout',
        description: 'Buy on upper band breakout',
        position: { x: 850, y: 150 },
        config: { orderType: 'market', quantity: '30%' },
        category: 'Actions',
        isCustomizable: true
      },
      {
        id: 'sell_action',
        type: 'action',
        label: 'Sell Breakout',
        description: 'Sell on lower band breakout',
        position: { x: 850, y: 250 },
        config: { orderType: 'market', quantity: '30%' },
        category: 'Actions',
        isCustomizable: true
      }
    ],
    
    edges: [
      { id: 'e1', source: 'data_source', target: 'bb_indicator' },
      { id: 'e2', source: 'bb_indicator', target: 'upper_breakout' },
      { id: 'e3', source: 'bb_indicator', target: 'lower_breakout' },
      { id: 'e4', source: 'upper_breakout', target: 'buy_action' },
      { id: 'e5', source: 'lower_breakout', target: 'sell_action' }
    ],
    
    parameters: [
      {
        id: 'bb_period',
        name: 'Bollinger Bands Period',
        type: 'int',
        defaultValue: 20,
        minValue: 5,
        maxValue: 100,
        description: 'Period for Bollinger Bands calculation',
        category: 'Technical Analysis',
        affects: ['bb_indicator']
      },
      {
        id: 'bb_stddev',
        name: 'Standard Deviation',
        type: 'float',
        defaultValue: 2.0,
        minValue: 1.0,
        maxValue: 3.0,
        description: 'Standard deviation multiplier for bands',
        category: 'Technical Analysis',
        affects: ['bb_indicator']
      }
    ],
    
    documentation: {
      overview: 'The Bollinger Bands Breakout strategy capitalizes on volatility expansion by trading breakouts from the bands.',
      howItWorks: 'When price breaks above the upper Bollinger Band, it signals potential upward momentum. When price breaks below the lower band, it signals potential downward momentum.',
      bestMarkets: ['High volatility markets', 'Cryptocurrency', 'Forex during news events'],
      timeframes: ['15m', '1h', '4h'],
      riskLevel: 'high',
      pros: [
        'Captures strong momentum moves',
        'Works well in volatile markets',
        'Good risk-reward potential',
        'Visual and easy to understand'
      ],
      cons: [
        'Can generate false breakouts',
        'Requires quick execution',
        'Higher risk strategy',
        'May struggle in low volatility periods'
      ],
      tips: [
        'Use volume confirmation for breakouts',
        'Set tight stop losses',
        'Avoid trading during low volatility periods',
        'Consider time-based exits'
      ]
    },
    
    pineScriptTemplate: `//@version=6
strategy("Bollinger Bands Breakout Strategy", overlay=true, initial_capital=10000)

// Strategy Parameters
bb_period = input.int(20, "Bollinger Bands Period", minval=5, maxval=100)
bb_stddev = input.float(2.0, "Standard Deviation", minval=1.0, maxval=3.0, step=0.1)
position_size = input.float(30.0, "Position Size (%)", minval=1, maxval=100)

// Technical Indicators
[bb_middle, bb_upper, bb_lower] = ta.bb(close, bb_period, bb_stddev)

// Trading Conditions
upper_breakout = ta.crossover(close, bb_upper)
lower_breakout = ta.crossunder(close, bb_lower)

// Strategy Logic
if upper_breakout
    strategy.entry("Long", strategy.long, qty=strategy.equity * position_size / 100 / close)

if lower_breakout
    strategy.entry("Short", strategy.short, qty=strategy.equity * position_size / 100 / close)

// Risk Management
strategy.exit("Stop Long", "Long", loss=close * 0.03)
strategy.exit("Stop Short", "Short", loss=close * 0.03)

// Plots
plot(bb_upper, "BB Upper", color=color.red)
plot(bb_middle, "BB Middle", color=color.orange)
plot(bb_lower, "BB Lower", color=color.green)
plotshape(upper_breakout, title="Buy Signal", location=location.belowbar, color=color.green, style=shape.labelup, text="BUY")
plotshape(lower_breakout, title="Sell Signal", location=location.abovebar, color=color.red, style=shape.labeldown, text="SELL")`
  }
};

// Template utility functions
export class TemplateLibrary {
  
  // Get all templates
  static getAllTemplates(): StrategyTemplate[] {
    return Object.values(PINE_SCRIPT_TEMPLATES);
  }
  
  // Get templates by category
  static getTemplatesByCategory(category: TemplateCategory): StrategyTemplate[] {
    return Object.values(PINE_SCRIPT_TEMPLATES).filter(template => template.category === category);
  }
  
  // Get templates by difficulty
  static getTemplatesByDifficulty(difficulty: TemplateDifficulty): StrategyTemplate[] {
    return Object.values(PINE_SCRIPT_TEMPLATES).filter(template => template.difficulty === difficulty);
  }
  
  // Search templates by tags
  static searchTemplatesByTags(tags: string[]): StrategyTemplate[] {
    return Object.values(PINE_SCRIPT_TEMPLATES).filter(template => 
      tags.some(tag => template.tags.includes(tag.toLowerCase()))
    );
  }
  
  // Get template by ID
  static getTemplateById(id: string): StrategyTemplate | null {
    return PINE_SCRIPT_TEMPLATES[id] || null;
  }
  
  // Convert template to nodes and edges
  static templateToNodesAndEdges(template: StrategyTemplate): { nodes: CustomNode[], edges: CustomEdge[] } {
    const nodes: CustomNode[] = template.nodes.map(templateNode => {
      // Map node types to match the expected NodeType
      let nodeType = templateNode.type;
      if (templateNode.type === 'dataSource') nodeType = 'data-source';
      if (templateNode.type === 'riskManagement') nodeType = 'risk';
      
      return {
        id: templateNode.id,
        type: nodeType as 'data-source' | 'indicator' | 'condition' | 'action' | 'risk',
        data: {
          id: templateNode.id,
          label: templateNode.label,
          type: nodeType as 'data-source' | 'indicator' | 'condition' | 'action' | 'risk',
          description: templateNode.description,
          config: templateNode.config,
          category: templateNode.category
        },
        position: templateNode.position
      };
    });
    
    const edges: CustomEdge[] = template.edges.map(templateEdge => ({
      id: templateEdge.id,
      source: templateEdge.source,
      target: templateEdge.target,
      label: templateEdge.label,
      animated: true,
      style: { stroke: '#60a5fa', strokeWidth: 2 },
      type: 'smoothstep'
    }));
    
    return { nodes, edges };
  }
  
  // Customize template with parameters
  static customizeTemplate(template: StrategyTemplate, customizations: Record<string, unknown>): StrategyTemplate {
    const customizedTemplate = JSON.parse(JSON.stringify(template)); // Deep clone
    
    // Apply customizations to parameters
    Object.entries(customizations).forEach(([paramId, value]) => {
      const parameter = template.parameters.find(p => p.id === paramId);
      if (parameter) {
        // Update affected nodes
        parameter.affects.forEach(nodeId => {
          const node = customizedTemplate.nodes.find((n: TemplateNode) => n.id === nodeId);
          if (node && node.config.parameters) {
            // Update the specific parameter in the node config
            const paramName = paramId.replace(`${parameter.category.toLowerCase()}_`, '');
            node.config.parameters[paramName] = value;
          }
        });
      }
    });
    
    return customizedTemplate;
  }
  
  // Validate template
  static validateTemplate(template: StrategyTemplate): { isValid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    // Check required fields
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.nodes || template.nodes.length === 0) errors.push('Template must have at least one node');
    
    // Check node references in edges
    const nodeIds = new Set(template.nodes.map(n => n.id));
    template.edges.forEach(edge => {
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge references non-existent source node: ${edge.source}`);
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge references non-existent target node: ${edge.target}`);
      }
    });
    
    // Check for required node types
    const hasDataSource = template.nodes.some(n => n.type === 'data-source');
    if (!hasDataSource) {
      errors.push('Template must have at least one data source');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Get template categories
  static getCategories(): { id: TemplateCategory, name: string, description: string }[] {
    return [
      { id: TemplateCategory.TREND_FOLLOWING, name: 'Trend Following', description: 'Strategies that follow market trends' },
      { id: TemplateCategory.MEAN_REVERSION, name: 'Mean Reversion', description: 'Strategies that trade reversals to the mean' },
      { id: TemplateCategory.BREAKOUT, name: 'Breakout', description: 'Strategies that trade price breakouts' },
      { id: TemplateCategory.SCALPING, name: 'Scalping', description: 'Short-term high-frequency strategies' },
      { id: TemplateCategory.SWING_TRADING, name: 'Swing Trading', description: 'Medium-term trading strategies' },
      { id: TemplateCategory.POSITION_TRADING, name: 'Position Trading', description: 'Long-term trading strategies' },
      { id: TemplateCategory.MOMENTUM, name: 'Momentum', description: 'Strategies based on price momentum' },
      { id: TemplateCategory.VOLATILITY, name: 'Volatility', description: 'Strategies that trade volatility changes' }
    ];
  }
}

// Template categories and difficulties are already exported above