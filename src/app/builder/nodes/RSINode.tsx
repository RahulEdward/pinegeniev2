'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '../canvas-config';
import useBuilderStore from '../builder-state';
import { getIndicatorById } from '../data/indicator-defs';

export default function RSINode({ id, data, selected }: NodeProps<CustomNodeData>) {
  // Get RSI indicator definition
  const rsiDef = getIndicatorById('rsi');
  
  // Get dot color for oscillator type indicators
  const getDotColor = () => {
    return 'bg-purple-500';
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
          <div className={`w-2.5 h-2.5 rounded-full ${getDotColor()} mr-2`}></div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {data.label}
          </h3>
        </div>
      </div>
      
      {/* Body */}
      <div className="px-4 py-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {rsiDef?.description || 'Measures overbought/oversold conditions'}
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
