import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Settings, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';

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
  canvasOffset
}) => {
  const { colors } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const nodeType = NODE_TYPES[node.type as keyof typeof NODE_TYPES] || NODE_TYPES.data;
  const accentColor = colors.accent[nodeType.color as keyof typeof colors.accent];

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.node-control')) return;
    const rect = nodeRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragOffset({
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    });
    setIsDragging(true);
    onNodeSelect(node.id);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const newX = (e.clientX - canvasOffset.x) / zoom - dragOffset.x;
    const newY = (e.clientY - canvasOffset.y) / zoom - dragOffset.y;
    onNodeMove(node.id, { x: newX, y: newY });
  }, [isDragging, dragOffset, onNodeMove, node.id, zoom, canvasOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleConnectionStart = (e: React.MouseEvent, type: 'input' | 'output') => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    onConnectionStart(node.id, type, { x: centerX, y: centerY });
  };

  const handleConnectionEnd = (e: React.MouseEvent, type: 'input' | 'output') => {
    e.stopPropagation();
    onConnectionEnd(node.id, type);
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
      className={`absolute cursor-move select-none transition-all duration-300 transform-gpu ${
        isSelected ? 'z-40 scale-105' : 'z-20'
      } ${isHovered ? 'scale-102' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: `scale(${zoom}) ${isSelected ? 'scale(1.05)' : ''} ${isHovered ? 'scale(1.02)' : ''}`,
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
      {/* Main node container */}
      <div className={`relative ${colors.bg.glass} ${colors.border.primary} border shadow-2xl rounded-2xl min-w-[240px] overflow-hidden ${
        isSelected ? `ring-2 ${colors.border.accent} shadow-blue-500/20` : ''
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
      {/* Connection handles */}
      <div
        className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 shadow-lg border-2 border-white"
        onMouseEnter={e => handleConnectionEnd(e, 'input')}
      >
        <div className="absolute inset-1 bg-white rounded-full" />
      </div>
      <div
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full cursor-crosshair hover:scale-125 transition-all duration-200 shadow-lg border-2 border-white"
        onMouseDown={e => handleConnectionStart(e, 'output')}
      >
        <div className="absolute inset-1 bg-white rounded-full" />
      </div>
    </div>
  );
};

export default N8nNode; 