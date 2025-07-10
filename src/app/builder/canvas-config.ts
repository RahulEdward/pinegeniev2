import { Node, Edge } from 'reactflow';
import IndicatorNode from './nodes/IndicatorNode';
import N8nBaseNode from './nodes/n8n-base-node';
import { getIndicatorById } from './data/indicator-defs';

export type NodeType = 'input' | 'output' | 'indicator' | 'condition' | 'action';

// Define a more specific type for node configuration
export type NodeConfig = {
  // Common properties
  label?: string;
  // Add more specific configuration properties as needed
  [key: string]: string | number | boolean | undefined;
};

export interface CustomNodeData {
  label: string;
  type: NodeType;
  config?: NodeConfig;
  onChange?: (data: Partial<CustomNodeData>) => void;
}

export type CustomNode = Node<CustomNodeData>;

export const initialNodes: CustomNode[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start', type: 'input' },
    position: { x: 250, y: 5 },
  },
  {
    id: '2',
    type: 'indicator',
    data: { 
      label: 'RSI Indicator', 
      type: 'indicator', 
      config: { 
        indicatorId: 'rsi',
        ...getIndicatorById('rsi')?.defaultParams || { length: 14, overbought: 70, oversold: 30 } 
      }
    },
    position: { x: 250, y: 60 },
  },
];

export const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#94a3b8' },
  },
];

export const nodeTypes = {
  input: N8nBaseNode,
  output: N8nBaseNode,
  indicator: IndicatorNode,
  condition: N8nBaseNode,
  action: N8nBaseNode,
  default: N8nBaseNode,
};

export const defaultEdgeOptions = {
  animated: true,
  style: {
    stroke: '#94a3b8',
    strokeWidth: 2,
  },
};

// Export types for easier imports
export type { Node, Edge } from 'reactflow';
