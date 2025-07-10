'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '../canvas-config';
import useBuilderStore from '../builder-state';

export default function N8nBaseNode({ id, data, selected }: NodeProps<CustomNodeData>) {
  const nodeType = data.type || 'default';
  
  // Get node color based on type
  const getNodeColor = () => {
    switch (nodeType) {
      case 'input':
        return 'bg-blue-500';
      case 'output':
        return 'bg-green-500';
      case 'condition':
        return 'bg-yellow-500';
      case 'action':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get node description based on type
  const getNodeDescription = () => {
    switch (nodeType) {
      case 'input':
        return 'Starting point for the workflow';
      case 'output':
        return 'Final output of the workflow';
      case 'condition':
        return 'Conditional logic for decision making';
      case 'action':
        return 'Performs an action in the workflow';
      default:
        return 'Node in the workflow';
    }
  };
  
  // Get category badge color and text
  const getNodeCategory = () => {
    switch (nodeType) {
      case 'input':
        return { text: 'Input', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
      case 'output':
        return { text: 'Output', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
      case 'condition':
        return { text: 'Logic', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
      case 'action':
        return { text: 'Action', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' };
      default:
        return { text: 'Node', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
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
          <span className={`text-xs px-2 py-0.5 rounded-full ${getNodeCategory().color}`}>
            {getNodeCategory().text}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {getNodeDescription()}
        </p>
      </div>
      
      {/* Input handle */}
      {nodeType !== 'input' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 -left-1.5 rounded-full border-2 border-white dark:border-gray-800"
          style={{ backgroundColor: '#94a3b8' }}
        />
      )}
      
      {/* Output handle */}
      {nodeType !== 'output' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 -right-1.5 rounded-full border-2 border-white dark:border-gray-800"
          style={{ backgroundColor: '#94a3b8' }}
        />
      )}
    </div>
  );
}
