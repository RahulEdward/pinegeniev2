'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '../canvas-config';
import useBuilderStore from '../builder-state';
import { getIndicatorById } from '../data/indicator-defs';

export default function IndicatorNode({ id, data, selected }: NodeProps<CustomNodeData>) {
  // Get indicator definition based on data label or config
  const indicatorId = (data.config?.indicatorId as string) || 'rsi';
  const indicator = getIndicatorById(indicatorId);
  
  // Get node color based on indicator type
  const getNodeColor = () => {
    switch (indicator?.type) {
      case 'oscillator':
        return 'bg-purple-500';
      case 'overlay':
        return 'bg-blue-500';
      case 'utility':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get category badge color
  const getCategoryColor = () => {
    switch (indicator?.category) {
      case 'Momentum':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Trend':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Volatility':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <div 
      className={`rounded-xl shadow-lg border ${
        selected ? 'border-blue-400 dark:border-blue-500' : 'border-gray-200 dark:border-gray-700'
      } bg-white dark:bg-gray-800 overflow-hidden`}
      style={{
        width: '220px',
      }}
      onClick={() => useBuilderStore.getState().setSelectedNode(id)}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-2.5 h-2.5 rounded-full ${getNodeColor()} mr-2`}></div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {data.label}
          </h3>
        </div>
      </div>
      
      {/* Body */}
      <div className="px-4 py-2">
        <div className="mb-1.5">
          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor()}`}>
            {indicator?.category || 'Technical'}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {indicator?.description || 'Technical indicator'}
        </p>
      </div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 -left-1.5 rounded-full border-2 border-white dark:border-gray-800"
        style={{ backgroundColor: '#94a3b8' }}
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 -right-1.5 rounded-full border-2 border-white dark:border-gray-800"
        style={{ backgroundColor: '#94a3b8' }}
      />
    </div>
  );
}
