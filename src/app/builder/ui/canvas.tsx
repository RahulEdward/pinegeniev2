import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import Sidebar from './Sidebar';
import Toolbar from './toolbar';
import N8nNode, { N8nNodeData } from './N8nNode';
import ConnectionLine from './ConnectionLine';
import ValidationStatus from './ValidationStatus';
import UserManual from './UserManual';

import ConnectionInstructions from './ConnectionInstructions';
import AIAssistant from './AIAssistant';
import { getHandleScreenPosition, screenToCanvas, DEFAULT_NODE_DIMENSIONS } from '../utils/coordinate-system';
import {
  ConnectionNode,
  Connection,
  getConnectionManager
} from '../utils/connection-manager';
import { 
  SimpleConnection, 
  getSimpleConnectionHandler 
} from '../utils/simple-connection-handler';
import {
  MouseEventManager,
  MouseEventHandlers,
  InteractionMode,
  getMouseEventManager,
  resetMouseEventManager
} from '../utils/mouse-event-manager';

const initialNodes: N8nNodeData[] = [];

const Canvas: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [nodes, setNodes] = useState<N8nNodeData[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backgroundType, setBackgroundType] = useState<'grid' | 'dots' | 'lines' | 'clean'>('grid');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [currentInteractionMode, setCurrentInteractionMode] = useState<InteractionMode>('idle');
  const canvasRef = useRef<HTMLDivElement>(null);

  // Enhanced connection management
  const connectionManager = getConnectionManager();
  const simpleConnectionHandler = getSimpleConnectionHandler();
  const [connections, setConnections] = useState<SimpleConnection[]>([]);
  const [activeConnection, setActiveConnection] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
    isValid: boolean;
  } | null>(null);

  // Enhanced mouse event management
  const mouseEventHandlers: MouseEventHandlers = {
    onNodeDragStart: (nodeId: string, position, offset) => {
      setSelectedNode(nodeId);
    },
    onNodeDragMove: (nodeId: string, position) => {
      onNodeMove(nodeId, position);
    },
    onNodeDragEnd: (nodeId: string) => {
      // Node drag completed
    },
    onConnectionStart: (nodeId: string, handleType, position) => {
      connectionManager.startConnection(nodeId, handleType, position);
    },
    onConnectionMove: (position) => {
      connectionManager.updateConnectionPosition(position);
    },
    onConnectionEnd: (nodeId?: string, handleType?: 'input' | 'output') => {
      if (nodeId && handleType) {
        connectionManager.completeConnection(nodeId, handleType);
      } else {
        connectionManager.cancelConnection();
      }
    },
    onCanvasPanStart: (position) => {
      setSelectedNode(null);
    },
    onCanvasPanMove: (delta) => {
      setCanvasOffset(prev => ({
        x: prev.x + delta.x,
        y: prev.y + delta.y
      }));
    },
    onCanvasPanEnd: () => {
      // Canvas panning completed
    },
    onModeChange: (mode: InteractionMode) => {
      setCurrentInteractionMode(mode);
    }
  };

  const mouseEventManager = getMouseEventManager(
    { zoom, offset: canvasOffset },
    mouseEventHandlers
  );

  // Initialize simple connection handler and subscribe to changes
  useEffect(() => {
    const unsubscribe = simpleConnectionHandler.subscribe((connections, state) => {
      setConnections(connections);

      // Update active connection display
      if (state.tempConnection) {
        setActiveConnection({
          start: state.tempConnection.start,
          end: state.tempConnection.end,
          isValid: true
        });
      } else {
        setActiveConnection(null);
      }
    });

    return unsubscribe;
  }, [simpleConnectionHandler]);

  // Also keep the original connection manager for compatibility
  useEffect(() => {
    const unsubscribe = connectionManager.subscribe((state) => {
      // Keep this for any existing functionality that depends on it
      // This is just for compatibility, main connections use simpleConnectionHandler
    });

    // Update canvas state in connection manager and mouse event manager
    connectionManager.updateCanvasState({ zoom, offset: canvasOffset });
    mouseEventManager.updateCanvasState({ zoom, offset: canvasOffset });

    return unsubscribe;
  }, [connectionManager, mouseEventManager, zoom, canvasOffset]);

  // Update connection manager when nodes change
  useEffect(() => {
    const connectionNodes: ConnectionNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        ...node,
        label: node.label
      }
    }));

    connectionManager.updateNodes(connectionNodes);
  }, [nodes, connectionManager]);

  // Node operations
  const onNodeAdd = (nodeTemplate: { type: string; label: string; description: string }) => {
    // Create proper configuration based on node type
    let nodeConfig = {};

    // Configure based on node type for zero-error system
    switch (nodeTemplate.type) {
      case 'data':
        nodeConfig = {
          symbol: 'BTCUSDT',
          timeframe: '1h',
          source: 'close'
        };
        break;
      case 'indicator':
        // Map indicator labels to proper IDs
        const indicatorMap: Record<string, { indicatorId: string; parameters: Record<string, number | string> }> = {
          'Moving Average': { indicatorId: 'sma', parameters: { length: 20, source: 'close' } },
          'RSI': { indicatorId: 'rsi', parameters: { length: 14, source: 'close', overbought: 70, oversold: 30 } },
          'MACD': { indicatorId: 'macd', parameters: { fastlen: 12, slowlen: 26, siglen: 9, source: 'close' } },
          'Bollinger Bands': { indicatorId: 'bb', parameters: { length: 20, stddev: 2, source: 'close' } },
          'Stochastic': { indicatorId: 'stoch', parameters: { length: 14, source: 'close' } }
        };
        nodeConfig = indicatorMap[nodeTemplate.label] || { indicatorId: 'sma', parameters: { length: 20, source: 'close' } };
        break;
      case 'condition':
        nodeConfig = {
          operator: 'greater_than',
          threshold: 50
        };
        break;
      case 'action':
        nodeConfig = {
          orderType: 'market',
          quantity: '25%'
        };
        break;
      case 'risk':
        nodeConfig = {
          stopLoss: 2,
          takeProfit: 5,
          maxRisk: 1
        };
        break;
      default:
        nodeConfig = {};
    }

    // Simple and reliable positioning - center of visible area
    let newNodePosition = { x: 0, y: 0 };
    
    if (canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      
      // Calculate center position in canvas coordinates
      // This accounts for zoom and canvas offset properly
      const viewportCenterX = canvasRect.width / 2;
      const viewportCenterY = canvasRect.height / 2;
      
      // Convert screen coordinates to canvas coordinates
      const canvasCenterX = (viewportCenterX - canvasOffset.x) / zoom;
      const canvasCenterY = (viewportCenterY - canvasOffset.y) / zoom;
      
      // Position node at center
      newNodePosition = {
        x: canvasCenterX - DEFAULT_NODE_DIMENSIONS.width / 2,
        y: canvasCenterY - DEFAULT_NODE_DIMENSIONS.height / 2
      };
      
      // Add small offset for each new node to prevent overlap
      const offsetAmount = 40;
      const offsetIndex = nodes.length % 8; // Cycle through 8 positions
      const angle = (offsetIndex * Math.PI * 2) / 8; // Distribute in circle
      
      newNodePosition.x += Math.cos(angle) * offsetAmount;
      newNodePosition.y += Math.sin(angle) * offsetAmount;
      
    } else {
      // Fallback positioning
      newNodePosition = {
        x: 300 + (nodes.length * 40),
        y: 200 + (nodes.length * 40)
      };
    }

    const newNode: N8nNodeData = {
      id: `${nodeTemplate.type}-${Date.now()}`,
      type: nodeTemplate.type,
      label: nodeTemplate.label,
      description: nodeTemplate.description,
      props: nodeConfig,
      position: newNodePosition
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  const onNodeMove = (nodeId: string, newPosition: { x: number; y: number }) => {
    // Update node position directly without boundary restrictions for smooth movement
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, position: newPosition } : node
    ));

    // Update connection manager with new position
    connectionManager.updateConnectionsForNodeMove(nodeId, newPosition);
  };

  const onNodeUpdate = (nodeId: string, updatedNode: N8nNodeData) => {
    setNodes(prev => prev.map(node => node.id === nodeId ? updatedNode : node));
  };

  const onNodeDelete = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));

    // Delete all connections involving this node
    connectionManager.deleteConnectionsForNode(nodeId);

    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const onNodeSelect = (nodeId: string) => setSelectedNode(nodeId);

  // Simplified connection operations using simple connection handler
  const onConnectionStart = (nodeId: string, type: 'input' | 'output', position: { x: number; y: number }) => {
    try {
      simpleConnectionHandler.startConnection(nodeId, type, position);
    } catch (error) {
      console.error('Error starting connection:', error);
    }
  };

  const onConnectionEnd = (nodeId: string, type: 'input' | 'output') => {
    try {
      const connectionState = simpleConnectionHandler.getState();
      
      if (connectionState.isConnecting) {
        simpleConnectionHandler.completeConnection(nodeId, type);
      }
    } catch (error) {
      console.error('Error ending connection:', error);
    }
  };

  // Connection deletion with enhanced cleanup
  const onConnectionDelete = (connectionId: string) => {
    connectionManager.deleteConnection(connectionId);
  };

  // Enhanced canvas mouse down using mouse event manager
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only handle canvas clicks if we're clicking directly on the canvas
    if (e.target !== canvasRef.current) {
      return;
    }
    
    // Cancel any active connection when clicking on empty canvas
    const connectionState = simpleConnectionHandler.getState();
    if (connectionState.isConnecting) {
      simpleConnectionHandler.cancelConnection();
      return;
    }
    
    if (!canvasRef.current) return;
    mouseEventManager.handleCanvasMouseDown(e, canvasRef.current);
  };

  // Handle mouse move for connection preview
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    const connectionState = simpleConnectionHandler.getState();
    if (connectionState.isConnecting && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      simpleConnectionHandler.updateConnection(position);
    }
  };

  // Cleanup mouse event manager on unmount
  useEffect(() => {
    return () => {
      resetMouseEventManager();
    };
  }, []);

  // Canvas clear with enhanced connection cleanup
  // Enhanced multiple node addition with automatic spacing
  const onMultipleNodesAdd = (nodeTemplates: Array<{ type: string; label: string; description: string }>) => {
    if (!canvasRef.current || nodeTemplates.length === 0) return;

    // Import positioning utilities dynamically
    import('../utils/node-positioning').then(({ calculateMultipleNodePositions }) => {
      const existingNodes = nodes.map(node => ({
        id: node.id,
        position: node.position,
        dimensions: DEFAULT_NODE_DIMENSIONS
      }));

      const newPositions = calculateMultipleNodePositions(
        nodeTemplates.length,
        canvasRef.current!,
        { zoom, offset: canvasOffset },
        existingNodes,
        DEFAULT_NODE_DIMENSIONS
      );

      const newNodes: N8nNodeData[] = nodeTemplates.map((template, index) => {
        // Create proper configuration based on node type
        let nodeConfig = {};
        switch (template.type) {
          case 'data':
            nodeConfig = { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' };
            break;
          case 'indicator':
            nodeConfig = { indicatorId: 'sma', parameters: { length: 20, source: 'close' } };
            break;
          case 'condition':
            nodeConfig = { operator: 'greater_than', threshold: 50 };
            break;
          case 'action':
            nodeConfig = { orderType: 'market', quantity: '25%' };
            break;
          case 'risk':
            nodeConfig = { stopLoss: 2, takeProfit: 5, maxRisk: 1 };
            break;
          default:
            nodeConfig = {};
        }

        return {
          id: `${template.type}-${Date.now()}-${index}`,
          type: template.type,
          label: template.label,
          description: template.description,
          props: nodeConfig,
          position: newPositions[index] || { x: 100 + index * 50, y: 100 + index * 50 }
        };
      });

      setNodes(prev => [...prev, ...newNodes]);
    }).catch(() => {
      // Fallback to simple positioning
      const newNodes: N8nNodeData[] = nodeTemplates.map((template, index) => {
        let nodeConfig = {};
        switch (template.type) {
          case 'data':
            nodeConfig = { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' };
            break;
          case 'indicator':
            nodeConfig = { indicatorId: 'sma', parameters: { length: 20, source: 'close' } };
            break;
          case 'condition':
            nodeConfig = { operator: 'greater_than', threshold: 50 };
            break;
          case 'action':
            nodeConfig = { orderType: 'market', quantity: '25%' };
            break;
          case 'risk':
            nodeConfig = { stopLoss: 2, takeProfit: 5, maxRisk: 1 };
            break;
          default:
            nodeConfig = {};
        }

        return {
          id: `${template.type}-${Date.now()}-${index}`,
          type: template.type,
          label: template.label,
          description: template.description,
          props: nodeConfig,
          position: { x: 100 + (nodes.length + index) * 50, y: 100 + (nodes.length + index) * 50 }
        };
      });

      setNodes(prev => [...prev, ...newNodes]);
    });
  };

  const clearCanvas = () => {
    setNodes([]);
    connectionManager.clearAllConnections();
    simpleConnectionHandler.clearConnections();
    setSelectedNode(null);
  };

  // Enhanced PineScript generation using zero-error system
  const generateScript = () => {
    // Import the enhanced generator
    import('../enhanced-pinescript-generator').then(({ generateEnhancedPineScript }) => {
      // Convert current nodes and connections to the format expected by the generator
      const convertedNodes = nodes.map(node => {
        // Map node types to match what the generator expects
        let nodeType = node.type;
        if (node.type === 'data') {
          nodeType = 'data-source'; // Fix the type mismatch
        }

        return {
          id: node.id,
          type: nodeType as 'data-source' | 'indicator' | 'condition' | 'action' | 'risk',
          data: {
            id: node.id,
            label: node.label,
            type: nodeType as 'data-source' | 'indicator' | 'condition' | 'action' | 'risk',
            description: node.description,
            config: node.config || node.props || {},
            category: 'Generated'
          },
          position: node.position
        };
      });

      const convertedEdges = connections.map(conn => ({
        id: conn.id,
        source: conn.source,
        target: conn.target,
        animated: true,
        style: { stroke: '#60a5fa', strokeWidth: 2 },
        type: 'smoothstep' as const
      }));

      // Generate enhanced Pine Script
      const result = generateEnhancedPineScript(convertedNodes, convertedEdges);

      if (result.success) {
        navigator.clipboard.writeText(result.code);
        alert(`✅ Zero-Error Pine Script Generated!\n\n📋 Code copied to clipboard\n🎯 ${result.metadata?.codeLines} lines of perfect Pine Script v6\n⚡ ${result.warnings.length} warnings (if any)`);

        // Log success details
        console.log('✅ Pine Script Generation Success:', {
          codeLines: result.metadata?.codeLines,
          nodeCount: result.metadata?.nodeCount,
          warnings: result.warnings
        });
      } else {
        // Show detailed error information
        const errorDetails = result.errors.join('\n• ');
        alert(`❌ Pine Script Generation Failed\n\nErrors found:\n• ${errorDetails}\n\nPlease fix these issues and try again.`);

        // Still copy the error script for debugging
        navigator.clipboard.writeText(result.code);
        console.error('❌ Pine Script Generation Errors:', result.errors);
      }
    }).catch(error => {
      console.error('Failed to load Pine Script generator:', error);
      alert('❌ Failed to load Pine Script generator. Please refresh and try again.');
    });
  };

  // Enhanced strategy saving with connection export
  const saveStrategy = () => {
    const connectionData = connectionManager.exportConnections();
    const data = {
      nodes,
      connections: connectionData.connections,
      metadata: connectionData.metadata,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('pinegenie_strategy', JSON.stringify(data));
    alert('Strategy saved to localStorage!');
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  // Helper function to convert mouse events to canvas coordinates
  const getCanvasCoordinatesFromMouse = (e: MouseEvent | React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const screenPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    return screenToCanvas(screenPoint, { zoom, offset: canvasOffset });
  };

  return (
    <div className={`flex h-screen bg-gradient-to-br ${colors.bg.primary}`}>
      <Sidebar onNodeAdd={onNodeAdd} isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col">
        <Toolbar
          zoom={zoom}
          setZoom={setZoom}
          isDark={isDark}
          toggleTheme={toggleTheme}
          clearCanvas={clearCanvas}
          generateScript={generateScript}
          saveStrategy={saveStrategy}
          backgroundType={backgroundType}
          setBackgroundType={setBackgroundType}
          openUserManual={() => setIsManualOpen(true)}
          openAIAssistant={() => setIsAIAssistantOpen(true)}
        />
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className={`w-full h-full relative ${
              currentInteractionMode === 'creating-connection' ? 'cursor-crosshair' : 
              currentInteractionMode === 'panning-canvas' ? 'cursor-grabbing' :
              currentInteractionMode === 'dragging-node' ? 'cursor-grabbing' : 'cursor-move'
            }`}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            data-canvas
            style={{
              backgroundImage: isDark ? `
                radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
              ` : `
                radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.05) 0%, transparent 50%),
                linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%)
              `,
              backgroundSize: '100% 100%, 100% 100%, 100% 100%'
            }}
          >
            {/* Dynamic Background */}
            {backgroundType === 'grid' && (
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(${isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.1)'} 1px, transparent 1px),
                    linear-gradient(90deg, ${isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.1)'} 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px',
                  backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
                }}
              />
            )}
            {backgroundType === 'dots' && (
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage: `radial-gradient(circle, ${isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(71, 85, 105, 0.4)'} 1.5px, transparent 1.5px)`,
                  backgroundSize: '24px 24px',
                  backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
                }}
              />
            )}
            {backgroundType === 'lines' && (
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, ${isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.1)'} 1px, transparent 1px),
                    linear-gradient(-45deg, ${isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(71, 85, 105, 0.1)'} 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                  backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
                }}
              />
            )}
            {/* Enhanced SVG for connections with coordinate system integration */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {connections.map(conn => {
                const sourceNode = getNodeById(conn.source);
                const targetNode = getNodeById(conn.target);
                if (!sourceNode || !targetNode) return null;

                // Use coordinate system utilities for accurate handle positions
                const canvasState = { zoom, offset: canvasOffset };
                const start = getHandleScreenPosition(
                  sourceNode.position,
                  'output',
                  canvasState,
                  DEFAULT_NODE_DIMENSIONS
                );
                const end = getHandleScreenPosition(
                  targetNode.position,
                  'input',
                  canvasState,
                  DEFAULT_NODE_DIMENSIONS
                );

                return (
                  <ConnectionLine
                    key={conn.id}
                    start={start}
                    end={end}
                    isActive={selectedNode === conn.source || selectedNode === conn.target}
                    isValid={true}
                    isDarkMode={isDark}
                    connectionId={conn.id}
                    onConnectionClick={(connectionId) => {
                      // Delete connection using simple handler
                      simpleConnectionHandler.deleteConnection(connectionId);
                    }}
                    onConnectionHover={(connectionId, isHovering) => {
                      // Add hover effects or tooltips
                      if (isHovering) {
                        console.log('Connection hovered:', connectionId);
                      }
                    }}
                  />
                );
              })}
              {/* Active connection with enhanced visual feedback */}
              {activeConnection && (
                <ConnectionLine
                  start={activeConnection.start}
                  end={activeConnection.end}
                  isTemporary={true}
                  isValid={activeConnection.isValid}
                  isDarkMode={isDark}
                />
              )}
            </svg>
            {/* Render nodes */}
            {nodes.map(node => (
              <N8nNode
                key={node.id}
                node={node}
                onNodeMove={onNodeMove}
                onNodeUpdate={onNodeUpdate}
                onNodeDelete={onNodeDelete}
                onNodeSelect={onNodeSelect}
                onConnectionStart={onConnectionStart}
                onConnectionEnd={onConnectionEnd}
                isSelected={selectedNode === node.id}
                zoom={zoom}
                canvasOffset={canvasOffset}
                mouseEventManager={mouseEventManager}
                isValidConnectionTarget={
                  currentInteractionMode === 'creating-connection' && 
                  mouseEventManager.getState().activeNodeId !== node.id
                }
                isConnectionActive={
                  currentInteractionMode === 'creating-connection' ||
                  connections.some(conn => conn.source === node.id || conn.target === node.id)
                }
              />
            ))}
            {/* Welcome screen */}
            {nodes.length === 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className={`${colors.bg.glass} ${colors.border.primary} border rounded-3xl p-8 max-w-lg shadow-2xl`}>
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 bg-gradient-to-r ${colors.accent.blue} rounded-full blur-xl opacity-30 animate-pulse`} />
                      <div className={`relative p-4 bg-gradient-to-r ${colors.accent.blue} rounded-full inline-block`}>
                        <span role="img" aria-label="sparkles" className="text-3xl">✨</span>
                      </div>
                    </div>
                    <h3 className={`text-2xl font-bold bg-gradient-to-r ${colors.accent.blue} bg-clip-text text-transparent mb-3`}>
                      Welcome to PineGenie Pro
                    </h3>
                    <p className={`${colors.text.secondary} mb-6 leading-relaxed`}>
                      Build sophisticated trading strategies with our visual drag-and-drop interface.
                      No coding required - just pure strategy creation.
                    </p>
                    <div className={`flex items-center justify-center gap-3 text-sm ${colors.text.tertiary}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span>Click components to add</span>
                      </div>
                      <div className={`w-px h-4 ${colors.border.secondary}`} />
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                        <span>Drag to connect</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Enhanced Stats panel with real-time validation */}
            {nodes.length > 0 && (
              <div className={`absolute top-6 right-6 ${colors.bg.glass} ${colors.border.primary} border rounded-2xl p-4 shadow-xl min-w-[280px]`}>
                <div className="space-y-3">
                  {/* Basic Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span className={colors.text.secondary}>Nodes: {nodes.length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span className={colors.text.secondary}>Links: {connections.length}</span>
                    </div>
                  </div>

                  {/* Strategy Validation Status */}
                  <div className={`${colors.border.secondary} border-t pt-3`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${colors.text.primary}`}>Strategy Status</span>
                      <ValidationStatus nodes={nodes} connections={connections} />
                    </div>

                    {/* Node Type Breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        <span className={colors.text.tertiary}>
                          Indicators: {nodes.filter(n => n.type === 'indicator').length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
                        <span className={colors.text.tertiary}>
                          Conditions: {nodes.filter(n => n.type === 'condition').length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className={colors.text.tertiary}>
                          Data: {nodes.filter(n => n.type === 'data').length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        <span className={colors.text.tertiary}>
                          Actions: {nodes.filter(n => n.type === 'action').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Status bar */}
        <div className={`${colors.bg.glass} ${colors.border.primary} border-t px-6 py-3`}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className={colors.text.secondary}>System Ready</span>
              </div>
              {selectedNode && (
                <div className="flex items-center gap-2">
                  <span role="img" aria-label="target" className="text-blue-400">🎯</span>
                  <span className={colors.text.secondary}>
                    Selected: <span className="text-blue-400 font-medium">{getNodeById(selectedNode)?.label}</span>
                  </span>
                </div>
              )}
            </div>
            <div className={`flex items-center gap-4 ${colors.text.tertiary}`}>
              <span>Theme: {isDark ? 'Dark' : 'Light'}</span>
              <span>Background: {backgroundType.charAt(0).toUpperCase() + backgroundType.slice(1)}</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
              <span>Components: {nodes.length}</span>
              <span>Connections: {connections.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onStrategyGenerated={(aiNodes, aiConnections) => {
          // Add AI-generated nodes to canvas
          setNodes(prev => [...prev, ...aiNodes]);
          
          // Add AI-generated connections using simple handler
          const currentConnections = simpleConnectionHandler.getConnections();
          aiConnections.forEach(conn => {
            // Use the proper method to add connections
            if (!currentConnections.find(existing => existing.id === conn.id)) {
              simpleConnectionHandler.connections.push(conn);
            }
          });
          
          // Trigger update
          simpleConnectionHandler['notifyListeners']?.();
          
          // Close AI assistant
          setIsAIAssistantOpen(false);
        }}
      />

      {/* User Manual Modal */}
      <UserManual
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
      />

      {/* Connection Instructions - show only when user might need help */}
      <ConnectionInstructions 
        isVisible={nodes.length >= 2 && connections.length === 0}
        connectionCount={connections.length}
        isConnecting={simpleConnectionHandler.getState().isConnecting}
      />
    </div>
  );
};

const CanvasWithTheme: React.FC = () => (
  <ThemeProvider>
    <Canvas />
  </ThemeProvider>
);

export default CanvasWithTheme; 