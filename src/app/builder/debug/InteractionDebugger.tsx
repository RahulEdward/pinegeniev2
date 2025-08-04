/**
 * Interaction Debugger Component
 * 
 * Displays real-time information about mouse interactions and system state
 * to help debug connection and movement issues.
 */

import React, { useState, useEffect } from 'react';
import { MouseEventManager, InteractionMode } from '../utils/mouse-event-manager';
import { ConnectionManager } from '../utils/connection-manager';

interface InteractionDebuggerProps {
  mouseEventManager?: MouseEventManager;
  connectionManager?: ConnectionManager;
  isVisible?: boolean;
}

const InteractionDebugger: React.FC<InteractionDebuggerProps> = ({
  mouseEventManager,
  connectionManager,
  isVisible = false
}) => {
  const [debugState, setDebugState] = useState<{
    mouseMode: InteractionMode;
    activeNodeId: string | null;
    connectionCount: number;
    canDragNodes: boolean;
    canCreateConnections: boolean;
    lastUpdate: string;
  }>({
    mouseMode: 'idle',
    activeNodeId: null,
    connectionCount: 0,
    canDragNodes: true,
    canCreateConnections: true,
    lastUpdate: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    if (!mouseEventManager || !connectionManager) return;

    const updateDebugState = () => {
      const mouseState = mouseEventManager.getState();
      const connections = connectionManager.getConnections();

      setDebugState({
        mouseMode: mouseState.mode,
        activeNodeId: mouseState.activeNodeId,
        connectionCount: connections.length,
        canDragNodes: mouseEventManager.isNodeDraggingAllowed(),
        canCreateConnections: mouseEventManager.areHandlesInteractive(),
        lastUpdate: new Date().toLocaleTimeString()
      });
    };

    // Update immediately
    updateDebugState();

    // Subscribe to changes
    const unsubscribeMouseEvents = mouseEventManager.subscribe(updateDebugState);
    const unsubscribeConnections = connectionManager.subscribe(updateDebugState);

    // Update every second for real-time feedback
    const interval = setInterval(updateDebugState, 1000);

    return () => {
      unsubscribeMouseEvents();
      unsubscribeConnections();
      clearInterval(interval);
    };
  }, [mouseEventManager, connectionManager]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 min-w-[300px]">
      <div className="text-green-400 font-bold mb-2">🔧 Interaction Debugger</div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-300">Mouse Mode:</span>
          <span className={`font-bold ${
            debugState.mouseMode === 'idle' ? 'text-green-400' :
            debugState.mouseMode === 'dragging-node' ? 'text-blue-400' :
            debugState.mouseMode === 'creating-connection' ? 'text-orange-400' :
            debugState.mouseMode === 'panning-canvas' ? 'text-purple-400' :
            'text-yellow-400'
          }`}>
            {debugState.mouseMode}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-300">Active Node:</span>
          <span className="text-cyan-400">
            {debugState.activeNodeId || 'none'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-300">Connections:</span>
          <span className="text-green-400">{debugState.connectionCount}</span>
        </div>

        <div className="border-t border-gray-600 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Can Drag Nodes:</span>
            <span className={debugState.canDragNodes ? 'text-green-400' : 'text-red-400'}>
              {debugState.canDragNodes ? '✓' : '✗'}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-300">Can Connect:</span>
            <span className={debugState.canCreateConnections ? 'text-green-400' : 'text-red-400'}>
              {debugState.canCreateConnections ? '✓' : '✗'}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-2 mt-2 text-gray-400">
          Last Update: {debugState.lastUpdate}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400">
        <div>💡 Tips:</div>
        <div>• Drag nodes to move them</div>
        <div>• Click handles to connect</div>
        <div>• Press ESC to cancel</div>
      </div>
    </div>
  );
};

export default InteractionDebugger;