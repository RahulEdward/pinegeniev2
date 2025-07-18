import React, { useState, useRef, useCallback } from 'react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import Sidebar from './Sidebar';
import Toolbar from './toolbar';
import N8nNode, { N8nNodeData } from './N8nNode';
import ConnectionLine from './ConnectionLine';
import ValidationStatus from './ValidationStatus';
import UserManual from './UserManual';

interface Connection {
  id: string;
  source: string;
  target: string;
  sourceType: 'input' | 'output';
  targetType: 'input' | 'output';
}

const initialNodes: N8nNodeData[] = [];
const initialConnections: Connection[] = [];

const Canvas: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [nodes, setNodes] = useState<N8nNodeData[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [connecting, setConnecting] = useState<{
    sourceId: string;
    sourceType: 'input' | 'output';
    startPosition: { x: number; y: number };
  } | null>(null);
  const [tempConnection, setTempConnection] = useState<{
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [backgroundType, setBackgroundType] = useState<'grid' | 'dots' | 'lines' | 'clean'>('grid');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

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
          'Moving Average': { indicatorId: 'sma', parameters: { period: 20, source: 'close' } },
          'RSI': { indicatorId: 'rsi', parameters: { period: 14, source: 'close', overbought: 70, oversold: 30 } },
          'MACD': { indicatorId: 'macd', parameters: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, source: 'close' } },
          'Bollinger Bands': { indicatorId: 'bb', parameters: { period: 20, stddev: 2, source: 'close' } },
          'Stochastic': { indicatorId: 'stoch', parameters: { period: 14, source: 'close' } }
        };
        nodeConfig = indicatorMap[nodeTemplate.label] || { indicatorId: 'sma', parameters: { period: 20, source: 'close' } };
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

    const newNode: N8nNodeData = {
      id: `${nodeTemplate.type}-${Date.now()}`,
      type: nodeTemplate.type,
      label: nodeTemplate.label,
      description: nodeTemplate.description,
      props: nodeConfig,
      position: { x: 150 + Math.random() * 100, y: 100 + nodes.length * 80 }
    };
    setNodes(prev => [...prev, newNode]);
  };

  const onNodeMove = (nodeId: string, newPosition: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => node.id === nodeId ? { ...node, position: newPosition } : node));
  };

  const onNodeUpdate = (nodeId: string, updatedNode: N8nNodeData) => {
    setNodes(prev => prev.map(node => node.id === nodeId ? updatedNode : node));
  };

  const onNodeDelete = (nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.source !== nodeId && conn.target !== nodeId));
    if (selectedNode === nodeId) setSelectedNode(null);
  };

  const onNodeSelect = (nodeId: string) => setSelectedNode(nodeId);

  // Connection operations
  const onConnectionStart = (nodeId: string, type: 'input' | 'output', position: { x: number; y: number }) => {
    setConnecting({ sourceId: nodeId, sourceType: type, startPosition: position });
  };

  const onConnectionEnd = (nodeId: string, type: 'input' | 'output') => {
    if (connecting && connecting.sourceId !== nodeId) {
      const newConnection: Connection = {
        id: `${connecting.sourceId}-${nodeId}`,
        source: connecting.sourceId,
        target: nodeId,
        sourceType: connecting.sourceType,
        targetType: type
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setConnecting(null);
    setTempConnection(null);
  };

  // Canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
      setSelectedNode(null);
    }
  };

  const handleCanvasMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      setCanvasOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
    if (connecting) {
      setTempConnection({
        start: connecting.startPosition,
        end: { x: e.clientX, y: e.clientY }
      });
    }
  }, [isPanning, panStart, connecting]);

  const handleCanvasMouseUp = useCallback(() => {
    setIsPanning(false);
    setConnecting(null);
    setTempConnection(null);
  }, []);

  React.useEffect(() => {
    document.addEventListener('mousemove', handleCanvasMouseMove);
    document.addEventListener('mouseup', handleCanvasMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleCanvasMouseMove);
      document.removeEventListener('mouseup', handleCanvasMouseUp);
    };
  }, [handleCanvasMouseMove, handleCanvasMouseUp]);

  // Canvas clear
  const clearCanvas = () => {
    setNodes([]);
    setConnections([]);
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
            config: node.props || {},
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

  // Save strategy (placeholder)
  const saveStrategy = () => {
    const data = { nodes, connections, timestamp: new Date().toISOString() };
    localStorage.setItem('pinegenie_strategy', JSON.stringify(data));
    alert('Strategy saved to localStorage!');
  };

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

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
        />
        <div className="flex-1 relative overflow-hidden">
          <div
            ref={canvasRef}
            className="w-full h-full cursor-move relative"
            onMouseDown={handleCanvasMouseDown}
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
            {/* SVG for connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {connections.map(conn => {
                const sourceNode = getNodeById(conn.source);
                const targetNode = getNodeById(conn.target);
                if (!sourceNode || !targetNode) return null;
                const start = {
                  x: (sourceNode.position.x + 240) * zoom + canvasOffset.x,
                  y: (sourceNode.position.y + 60) * zoom + canvasOffset.y
                };
                const end = {
                  x: targetNode.position.x * zoom + canvasOffset.x,
                  y: (targetNode.position.y + 60) * zoom + canvasOffset.y
                };
                return (
                  <ConnectionLine
                    key={conn.id}
                    start={start}
                    end={end}
                    isActive={selectedNode === conn.source || selectedNode === conn.target}
                    isDarkMode={isDark}
                  />
                );
              })}
              {/* Temporary connection */}
              {tempConnection && (
                <ConnectionLine
                  start={tempConnection.start}
                  end={tempConnection.end}
                  isTemporary={true}
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
      
      {/* User Manual Modal */}
      <UserManual 
        isOpen={isManualOpen} 
        onClose={() => setIsManualOpen(false)} 
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