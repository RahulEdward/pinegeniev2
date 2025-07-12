/**
* Canvas Configuration - Node Types and Default Settings
* 
* This file contains:
* - Node type definitions and configurations
* - Initial nodes and edges for canvas setup
* - Node component mapping without ReactFlow dependency
* - Default styling and edge configurations
* - Integration with indicator definitions
* - Strategy template configurations
*/

import { getIndicatorById } from './data/indicator-defs';

// Custom node types without ReactFlow dependency
export type NodeType = 'input' | 'output' | 'indicator' | 'condition' | 'action' | 'data-source' | 'math' | 'risk' | 'timing';

// Node configuration interface
export interface NodeConfig {
 // Indicator-specific config
 indicatorId?: string;
 parameters?: Record<string, unknown>;
 
 // Condition-specific config
 operator?: 'greater_than' | 'less_than' | 'equal_to' | 'crosses_above' | 'crosses_below';
 threshold?: number;
 
 // Action-specific config
 orderType?: 'market' | 'limit' | 'stop';
 quantity?: string | number;
 
 // Data source config
 symbol?: string;
 timeframe?: string;
 source?: string;
 
 // Math operation config
 operation?: 'add' | 'subtract' | 'multiply' | 'divide' | 'abs' | 'max' | 'min';
 value?: number;
 
 // Risk management config
 stopLoss?: number;
 takeProfit?: number;
 maxRisk?: number;
 
 // Timing config
 startTime?: string;
 endTime?: string;
 timezone?: string;
 
 // Common properties
 enabled?: boolean;
 timeout?: number;
 [key: string]: unknown;
}

// Custom node data interface
export interface CustomNodeData {
 id: string;
 label: string;
 type: NodeType;
 description?: string;
 config?: NodeConfig;
 parameters?: Record<string, unknown>;
 category?: string;
 icon?: string;
 color?: string;
 onChange?: (data: Partial<CustomNodeData>) => void;
}

// Node position interface
export interface NodePosition {
 x: number;
 y: number;
}

// Custom node interface
export interface CustomNode {
 id: string;
 type: NodeType;
 data: CustomNodeData;
 position: NodePosition;
 selected?: boolean;
 dragging?: boolean;
}

// Custom edge interface
export interface CustomEdge {
 id: string;
 source: string;
 target: string;
 sourceHandle?: string;
 targetHandle?: string;
 animated?: boolean;
 style?: {
   stroke?: string;
   strokeWidth?: number;
   strokeDasharray?: string;
 };
 type?: 'default' | 'smoothstep' | 'straight' | 'step';
 label?: string;
}

// Node templates for different categories
export const NODE_TEMPLATES = {
 'Data Sources': [
   {
     type: 'data-source' as NodeType,
     label: 'Market Data',
     description: 'Real-time market price data',
     config: {
       symbol: 'BTCUSDT',
       timeframe: '1h',
       source: 'binance'
     }
   },
   {
     type: 'data-source' as NodeType,
     label: 'Custom Data',
     description: 'External data source',
     config: {
       symbol: 'CUSTOM',
       timeframe: '1h',
       source: 'custom'
     }
   }
 ],
 'Technical Indicators': [
   {
     type: 'indicator' as NodeType,
     label: 'RSI',
     description: 'Relative Strength Index',
     config: {
       indicatorId: 'rsi',
       parameters: getIndicatorById('rsi')?.defaultParams || { period: 14, overbought: 70, oversold: 30 }
     }
   },
   {
     type: 'indicator' as NodeType,
     label: 'SMA',
     description: 'Simple Moving Average',
     config: {
       indicatorId: 'sma',
       parameters: { period: 20, source: 'close' }
     }
   },
   {
     type: 'indicator' as NodeType,
     label: 'MACD',
     description: 'Moving Average Convergence Divergence',
     config: {
       indicatorId: 'macd',
       parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
     }
   },
   {
     type: 'indicator' as NodeType,
     label: 'Bollinger Bands',
     description: 'Volatility indicator with upper and lower bands',
     config: {
       indicatorId: 'bb',
       parameters: { period: 20, stddev: 2 }
     }
   }
 ],
 'Conditions': [
   {
     type: 'condition' as NodeType,
     label: 'Price Condition',
     description: 'Compare price with threshold',
     config: {
       operator: 'greater_than' as const,
       threshold: 0
     }
   },
   {
     type: 'condition' as NodeType,
     label: 'Crossover',
     description: 'Detect line crossovers',
     config: {
       operator: 'crosses_above' as const,
       threshold: 0
     }
   },
   {
     type: 'condition' as NodeType,
     label: 'Range Check',
     description: 'Check if value is within range',
     config: {
       operator: 'equal_to' as const,
       threshold: 50
     }
   }
 ],
 'Actions': [
   {
     type: 'action' as NodeType,
     label: 'Buy Order',
     description: 'Execute buy order',
     config: {
       orderType: 'market' as const,
       quantity: '25%'
     }
   },
   {
     type: 'action' as NodeType,
     label: 'Sell Order',
     description: 'Execute sell order',
     config: {
       orderType: 'market' as const,
       quantity: '100%'
     }
   },
   {
     type: 'action' as NodeType,
     label: 'Close Position',
     description: 'Close current position',
     config: {
       orderType: 'market' as const,
       quantity: '100%'
     }
   }
 ],
 'Math & Logic': [
   {
     type: 'math' as NodeType,
     label: 'Calculator',
     description: 'Mathematical operations',
     config: {
       operation: 'add' as const,
       value: 0
     }
   },
   {
     type: 'math' as NodeType,
     label: 'Comparison',
     description: 'Compare two values',
     config: {
       operation: 'subtract' as const,
       value: 0
     }
   }
 ],
 'Risk Management': [
   {
     type: 'risk' as NodeType,
     label: 'Stop Loss',
     description: 'Risk management with stop loss',
     config: {
       stopLoss: 2,
       maxRisk: 1
     }
   },
   {
     type: 'risk' as NodeType,
     label: 'Take Profit',
     description: 'Profit target management',
     config: {
       takeProfit: 5,
       maxRisk: 1
     }
   }
 ],
 'Timing': [
   {
     type: 'timing' as NodeType,
     label: 'Time Filter',
     description: 'Trading hours filter',
     config: {
       startTime: '09:00',
       endTime: '16:00',
       timezone: 'UTC'
     }
   }
 ]
};

// Initial nodes for the canvas
export const initialNodes: CustomNode[] = [
 {
   id: 'start_node',
   type: 'input',
   data: {
     id: 'start_node',
     label: 'Strategy Start',
     type: 'input',
     description: 'Starting point for strategy execution',
     category: 'Flow Control'
   },
   position: { x: 100, y: 200 }
 },
 {
   id: 'data_node',
   type: 'data-source',
   data: {
     id: 'data_node',
     label: 'Market Data',
     type: 'data-source',
     description: 'BTCUSDT 1h data from Binance',
     config: {
       symbol: 'BTCUSDT',
       timeframe: '1h',
       source: 'binance'
     },
     category: 'Data'
   },
   position: { x: 350, y: 100 }
 },
 {
   id: 'rsi_node',
   type: 'indicator',
   data: {
     id: 'rsi_node',
     label: 'RSI (14)',
     type: 'indicator',
     description: 'Relative Strength Index with 14 period',
     config: {
       indicatorId: 'rsi',
       parameters: {
         period: 14,
         source: 'close',
         overbought: 70,
         oversold: 30
       }
     },
     category: 'Technical Analysis'
   },
   position: { x: 600, y: 150 }
 }
];

// Initial edges for the canvas
export const initialEdges: CustomEdge[] = [
 {
   id: 'edge_start_data',
   source: 'start_node',
   target: 'data_node',
   animated: true,
   style: {
     stroke: '#60a5fa',
     strokeWidth: 2
   },
   type: 'smoothstep'
 },
 {
   id: 'edge_data_rsi',
   source: 'data_node',
   target: 'rsi_node',
   animated: true,
   style: {
     stroke: '#60a5fa',
     strokeWidth: 2
   },
   type: 'smoothstep'
 }
];

// Default edge styling options
export const defaultEdgeOptions = {
 animated: true,
 style: {
   stroke: '#60a5fa',
   strokeWidth: 2,
   strokeDasharray: undefined
 },
 type: 'smoothstep' as const
};

// Strategy templates for quick start
export const STRATEGY_TEMPLATES = {
 'RSI Oversold/Overbought': {
   name: 'RSI Mean Reversion',
   description: 'Buy when RSI < 30, Sell when RSI > 70',
   nodes: [
     {
       type: 'data-source',
       label: 'Price Data',
       position: { x: 100, y: 100 }
     },
     {
       type: 'indicator',
       label: 'RSI (14)',
       position: { x: 300, y: 100 },
       config: { indicatorId: 'rsi', parameters: { period: 14 } }
     },
     {
       type: 'condition',
       label: 'RSI < 30',
       position: { x: 500, y: 50 },
       config: { operator: 'less_than', threshold: 30 }
     },
     {
       type: 'condition',
       label: 'RSI > 70',
       position: { x: 500, y: 150 },
       config: { operator: 'greater_than', threshold: 70 }
     },
     {
       type: 'action',
       label: 'Buy',
       position: { x: 700, y: 50 },
       config: { orderType: 'market', quantity: '25%' }
     },
     {
       type: 'action',
       label: 'Sell',
       position: { x: 700, y: 150 },
       config: { orderType: 'market', quantity: '100%' }
     }
   ]
 },
 'Moving Average Crossover': {
   name: 'MA Crossover Strategy',
   description: 'Buy when fast MA crosses above slow MA',
   nodes: [
     {
       type: 'data-source',
       label: 'Price Data',
       position: { x: 100, y: 100 }
     },
     {
       type: 'indicator',
       label: 'SMA (10)',
       position: { x: 300, y: 50 },
       config: { indicatorId: 'sma', parameters: { period: 10 } }
     },
     {
       type: 'indicator',
       label: 'SMA (20)',
       position: { x: 300, y: 150 },
       config: { indicatorId: 'sma', parameters: { period: 20 } }
     },
     {
       type: 'condition',
       label: 'MA Crossover',
       position: { x: 500, y: 100 },
       config: { operator: 'crosses_above' }
     },
     {
       type: 'action',
       label: 'Buy',
       position: { x: 700, y: 100 },
       config: { orderType: 'market', quantity: '50%' }
     }
   ]
 }
};

// Node category colors
export const NODE_CATEGORY_COLORS = {
 'Data Sources': {
   main: 'from-blue-500 to-cyan-500',
   bg: 'bg-blue-50 dark:bg-blue-950/30',
   border: 'border-blue-200 dark:border-blue-800'
 },
 'Technical Indicators': {
   main: 'from-green-500 to-emerald-500',
   bg: 'bg-green-50 dark:bg-green-950/30',
   border: 'border-green-200 dark:border-green-800'
 },
 'Conditions': {
   main: 'from-yellow-500 to-orange-500',
   bg: 'bg-yellow-50 dark:bg-yellow-950/30',
   border: 'border-yellow-200 dark:border-yellow-800'
 },
 'Actions': {
   main: 'from-red-500 to-pink-500',
   bg: 'bg-red-50 dark:bg-red-950/30',
   border: 'border-red-200 dark:border-red-800'
 },
 'Math & Logic': {
   main: 'from-purple-500 to-indigo-500',
   bg: 'bg-purple-50 dark:bg-purple-950/30',
   border: 'border-purple-200 dark:border-purple-800'
 },
 'Risk Management': {
   main: 'from-orange-500 to-red-500',
   bg: 'bg-orange-50 dark:bg-orange-950/30',
   border: 'border-orange-200 dark:border-orange-800'
 },
 'Timing': {
   main: 'from-teal-500 to-cyan-500',
   bg: 'bg-teal-50 dark:bg-teal-950/30',
   border: 'border-teal-200 dark:border-teal-800'
 }
};

// Canvas background patterns
export const BACKGROUND_PATTERNS = {
 grid: {
   name: 'Grid',
   pattern: (isDark: boolean) => isDark 
     ? 'linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)'
     : 'linear-gradient(rgba(71, 85, 105, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(71, 85, 105, 0.1) 1px, transparent 1px)',
   size: '20px 20px'
 },
 dots: {
   name: 'Dots',
   pattern: (isDark: boolean) => isDark 
     ? 'radial-gradient(circle, rgba(148, 163, 184, 0.6) 1.5px, transparent 1.5px)'
     : 'radial-gradient(circle, rgba(71, 85, 105, 0.4) 1.5px, transparent 1.5px)',
   size: '24px 24px'
 },
 lines: {
   name: 'Lines',
   pattern: (isDark: boolean) => isDark 
     ? 'linear-gradient(45deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(-45deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)'
     : 'linear-gradient(45deg, rgba(71, 85, 105, 0.1) 1px, transparent 1px), linear-gradient(-45deg, rgba(71, 85, 105, 0.1) 1px, transparent 1px)',
   size: '40px 40px'
 },
 clean: {
   name: 'Clean',
   pattern: () => 'none',
   size: 'auto'
 }
};

// Node template interface
interface NodeTemplate {
  type: NodeType;
  label: string;
  description?: string;
  config?: NodeConfig;
  category?: string;
  [key: string]: unknown;
}

// Export utility functions
export const createNode = (template: NodeTemplate, position?: NodePosition): CustomNode => {
  const nodeId = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const nodeType = template.type || 'indicator'; // Default to 'indicator' if type is not provided
  
  return {
    id: nodeId,
    type: nodeType,
    data: {
      id: nodeId,
      label: template.label || 'Unnamed Node',
      type: nodeType,
      description: template.description || '',
      config: template.config || {},
      category: template.category || 'Unknown'
    },
    position: position || { x: 100, y: 100 }
  };
};

export const createEdge = (source: string, target: string): CustomEdge => {
 return {
   id: `edge_${source}_${target}_${Date.now()}`,
   source,
   target,
   animated: true,
   style: defaultEdgeOptions.style,
   type: defaultEdgeOptions.type
 };
};

// Export types for easier imports (without ReactFlow dependency)
// These are already exported at their declaration sites, so we don't need to re-export them here