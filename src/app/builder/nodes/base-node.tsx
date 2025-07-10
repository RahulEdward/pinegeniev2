'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '../canvas-config';
import useBuilderStore from '../builder-state';

export default function BaseNode({ id, data, selected }: NodeProps<CustomNodeData>) {
  const nodeType = data.type || 'default';
  
  const getNodeColor = () => {
    switch (nodeType) {
      case 'input':
        return 'bg-blue-500';
      case 'output':
        return 'bg-green-500';
      case 'indicator':
        return 'bg-purple-500';
      case 'condition':
        return 'bg-yellow-500';
      case 'action':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // We can access the store directly when needed via useBuilderStore.getState()
  // This avoids creating unused variables

  return (
    <div 
      className={`px-3 py-1.5 rounded-md shadow-md border-2 ${
        selected ? 'border-blue-400 dark:border-blue-500' : 'border-transparent'
      } bg-white dark:bg-gray-800`}
      style={{
        minWidth: '140px',
      }}
      onClick={() => useBuilderStore.getState().setSelectedNode(id)}
    >
      <div className={`h-0.5 w-full ${getNodeColor()} rounded-t-md -mx-2 -mt-1.5 mb-1.5`} />
      <div className="text-xs font-medium text-gray-900 dark:text-white">{data.label}</div>
      
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 -left-1"
        style={{ backgroundColor: '#94a3b8' }}
      />
      
      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 -right-1"
        style={{ backgroundColor: '#94a3b8' }}
      />
    </div>
  );
}
