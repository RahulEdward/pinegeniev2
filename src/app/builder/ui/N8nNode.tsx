import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { getHandleScreenPosition, DEFAULT_NODE_DIMENSIONS } from '../utils/coordinate-system';

export interface N8nNodeData {
  id: string;
  type: string;
  label: string;
  description?: string;
  props?: Record<string, string | number | boolean>;
  position: { x: number; y: number };
}

interface N8nNodeProps {
  node: N8nNodeData;
  isSelected: boolean;
  onNodeMove: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onNodeDelete: (nodeId: string) => void;
  onNodeSelect: (nodeId: string) => void;
  onConnectionStart: (nodeId: string, type: 'input' | 'output', position: { x: number; y: number }) => void;
  onConnectionEnd: (nodeId: string, type: 'input' | 'output') => void;
  onNodeUpdate: (nodeId: string, updatedNode: N8nNodeData) => void;
  zoom: number;
  canvasOffset: { x: number; y: number };
  isValidConnectionTarget?: boolean;
  isConnectionActive?: boolean;
  mouseEventManager?: any; // Will be passed from Canvas
}

const NODE_TYPES = {
  data: {
    color: 'purple',
    defaultProps: { timeframe: '1h', source: 'binance' }
  },
  indicator: {
    color: 'blue',
    defaultProps: { period: 14, type: 'sma' }
  },
  condition: {
    color: 'orange',
    defaultProps: { operator: 'crossover', threshold: 0 }
  },
  action: {
    color: 'green',
    defaultProps: { quantity: '10%', orderType: 'market' }
  },
  risk: {
    color: 'red',
    defaultProps: { stopLoss: '2%', takeProfit: '5%' }
  },
  math: {
    color: 'indigo',
    defaultProps: { operation: 'add', value: 0 }
  },
  timing: {
    color: 'indigo',
    defaultProps: { startTime: '09:00', endTime: '16:00' }
  }
};

const N8nNode: React.FC<N8nNodeProps> = ({
  node,
  isSelected,
  onNodeMove,
  onNodeDelete,
  onNodeSelect,
  onConnectionStart,
  onConnectionEnd,
  onNodeUpdate,
  zoom,
  canvasOffset,
  isValidConnectionTarget = false,
  isConnectionActive = false,
  mouseEventManager
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [inputHandleHovered, setInputHandleHovered] = useState(false);
  const [outputHandleHovered, setOutputHandleHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Get interaction state from mouse event manager
  const isDragging = mouseEventManager?.getState().mode === 'dragging-node' && 
                    mouseEventManager?.getState().activeNodeId === node.id;
  const isConnecting = mouseEventManager?.getState().mode === 'creating-connection';
  const handlesInteractive = mouseEventManager?.areHandlesInteractive() ?? true;
  const nodeDraggingAllowed = mouseEventManager?.isNodeDraggingAllowed() ?? true;

  const nodeType = NODE_TYPES[node.type as keyof typeof NODE_TYPES] || NODE_TYPES.data;
  const accentColor = colors.accent[nodeType.color as keyof typeof colors.accent];

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent node dragging if clicking on controls or connection handles
    if ((e.target as HTMLElement).closest('.node-control') || 
        (e.target as HTMLElement).closest('.connection-handle') ||
        !nodeDraggingAllowed) {
      return;
    }
    
    // Use mouse event manager for node dragging
    if (mouseEventManager && nodeRef.current) {
      const canvasElement = document.querySelector('[data-canvas]') as HTMLElement;
      if (canvasElement) {
        mouseEventManager.handleNodeMouseDown(node.id, e, canvasElement);
      }
    }
    
    onNodeSelect(node.id);
  };

  // Enhanced connection handle event handlers with proper coordinate calculations
  const handleConnectionStart = (e: React.MouseEvent, type: 'input' | 'output') => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!handlesInteractive) return;
    
    // Use mouse event manager for connection handling
    if (mouseEventManager) {
      const canvasElement = document.querySelector('[data-canvas]') as HTMLElement;
      if (canvasElement) {
        mouseEventManager.handleHandleMouseDown(node.id, type, e, canvasElement);
      }
    } else {
      // Fallback to direct connection handling
      const canvasState = { zoom, offset: canvasOffset };
      const handlePosition = getHandleScreenPosition(
        node.position,
        type,
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );
      
      onConnectionStart(node.id, type, handlePosition);
    }
  };

  const handleConnectionEnd = (e: React.MouseEvent, type: 'input' | 'output') => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!handlesInteractive) return;
    
    // Use mouse event manager for connection handling
    if (mouseEventManager) {
      mouseEventManager.handleHandleMouseUp(node.id, type, e);
    } else {
      // Fallback to direct connection handling
      onConnectionEnd(node.id, type);
    }
  };

  // Handle mouse enter/leave for connection handles
  const handleInputHandleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputHandleHovered(true);
  };

  const handleInputHandleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputHandleHovered(false);
  };

  const handleOutputHandleMouseEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOutputHandleHovered(true);
  };

  const handleOutputHandleMouseLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOutputHandleHovered(false);
  };

  const handleParameterChange = (paramName: string, value: string | number | boolean) => {
    onNodeUpdate(node.id, {
      ...node,
      props: {
        ...node.props,
        [paramName]: value
      }
    });
  };

  return (
    <div
      ref={nodeRef}
      className={`absolute ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } select-none ${
        isDragging ? '' : 'transition-all duration-300'
      } transform-gpu ${
        isSelected ? 'z-40' : 'z-20'
      }`}
      style={{
        left: node.position.x * zoom + canvasOffset.x,
        top: node.position.y * zoom + canvasOffset.y,
        transform: isDragging ? 'none' : `${isSelected ? 'scale(1.05)' : ''} ${isHovered ? 'scale(1.02)' : ''}`,
        transformOrigin: 'top left'
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect for selected nodes */}
      {isSelected && (
        <div className={`absolute inset-0 bg-gradient-to-r ${accentColor} rounded-2xl blur-lg opacity-30 scale-110 animate-pulse`} />
      )}
      {/* Main node container with connection feedback */}
      <div className={`relative ${colors.bg.glass} ${colors.border.primary} border shadow-2xl rounded-2xl min-w-[240px] overflow-hidden ${
        isSelected ? `ring-2 ${colors.border.accent} shadow-blue-500/20` : ''
      } ${
        isValidConnectionTarget ? 'ring-2 ring-green-400 shadow-green-400/30 animate-pulse' : ''
      } ${
        isConnectionActive ? 'ring-2 ring-blue-400 shadow-blue-400/30' : ''
      }`}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${accentColor} p-4`}>
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              {/* You can add an icon here if you want */}
              <div className="font-semibold text-sm tracking-wide">{node.label}</div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="node-control text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-lg transition-all duration-200"
                onClick={e => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                className="node-control text-white/80 hover:text-white hover:bg-red-500/30 p-1.5 rounded-lg transition-all duration-200"
                onClick={e => {
                  e.stopPropagation();
                  onNodeDelete(node.id);
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="p-4">
          {node.description && (
            <div className={`text-xs ${colors.text.tertiary} mb-3 leading-relaxed`}>
              {node.description}
            </div>
          )}
          {/* Parameters */}
          {isExpanded && (
            <div className={`${colors.bg.tertiary} rounded-xl p-3 text-xs backdrop-blur-sm`}>
              <div className="space-y-2">
                {Object.entries(node.props || nodeType.defaultProps).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <span className={`${colors.text.secondary} font-medium capitalize`}>
                      {key}:
                    </span>
                    <input
                      type="text"
                      value={String(value)}
                      onChange={e => handleParameterChange(key, e.target.value)}
                      className={`${colors.bg.secondary} px-2 py-1 rounded text-xs ${colors.text.primary} border ${colors.border.secondary} focus:outline-none focus:ring-1 focus:ring-blue-400 w-20`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* N8N-style Connection Handles - Simple and Clean */}
      
      {/* Input Handle */}
      <div
        className="connection-handle absolute w-4 h-4 cursor-crosshair z-50"
        style={{
          left: -8,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onMouseDown={(e) => handleConnectionStart(e, 'input')}
        onMouseUp={(e) => handleConnectionEnd(e, 'input')}
        onMouseEnter={handleInputHandleMouseEnter}
        onMouseLeave={handleInputHandleMouseLeave}
      >
        <div className={`w-full h-full rounded-full border-2 border-white transition-all duration-200 ${
          inputHandleHovered || isValidConnectionTarget
            ? 'bg-orange-500 scale-125 shadow-lg' 
            : 'bg-gray-400 hover:bg-gray-500'
        }`} />
      </div>

      {/* Output Handle */}
      <div
        className="connection-handle absolute w-4 h-4 cursor-crosshair z-50"
        style={{
          right: -8,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onMouseDown={(e) => handleConnectionStart(e, 'output')}
        onMouseUp={(e) => handleConnectionEnd(e, 'output')}
        onMouseEnter={handleOutputHandleMouseEnter}
        onMouseLeave={handleOutputHandleMouseLeave}
      >
        <div className={`w-full h-full rounded-full border-2 border-white transition-all duration-200 ${
          outputHandleHovered || isConnectionActive
            ? 'bg-orange-500 scale-125 shadow-lg' 
            : 'bg-gray-400 hover:bg-gray-500'
        }`} />
      </div>
    </div>
  );
};

export default N8nNode; 