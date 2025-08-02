/**
 * Integration Tests for Enhanced Connection System
 * 
 * Tests the integration between the ConnectionManager and the Canvas component,
 * ensuring proper coordinate system integration and state synchronization.
 */

import { 
  ConnectionManager, 
  ConnectionNode, 
  ConnectionUtils,
  getConnectionManager,
  resetConnectionManager
} from '../connection-manager';
import { 
  screenToCanvas, 
  canvasToScreen, 
  getHandleScreenPosition,
  DEFAULT_NODE_DIMENSIONS,
  CanvasState
} from '../coordinate-system';

describe('Connection System Integration', () => {
  let connectionManager: ConnectionManager;
  let mockNodes: ConnectionNode[];
  let canvasState: CanvasState;

  beforeEach(() => {
    resetConnectionManager();
    
    mockNodes = [
      {
        id: 'data-node',
        type: 'data',
        position: { x: 100, y: 100 },
        data: { label: 'BTCUSDT Data' }
      },
      {
        id: 'indicator-node',
        type: 'indicator',
        position: { x: 400, y: 100 },
        data: { label: 'RSI' }
      },
      {
        id: 'condition-node',
        type: 'condition',
        position: { x: 700, y: 100 },
        data: { label: 'Greater Than 70' }
      },
      {
        id: 'action-node',
        type: 'action',
        position: { x: 1000, y: 100 },
        data: { label: 'Buy Order' }
      }
    ];

    canvasState = {
      zoom: 1,
      offset: { x: 0, y: 0 }
    };

    connectionManager = getConnectionManager();
    connectionManager.updateNodes(mockNodes);
    connectionManager.updateCanvasState(canvasState);
  });

  describe('Coordinate System Integration', () => {
    test('should calculate accurate handle positions for connections', () => {
      const dataNode = mockNodes[0];
      const indicatorNode = mockNodes[1];

      // Get handle positions using coordinate system
      const outputHandle = getHandleScreenPosition(
        dataNode.position,
        'output',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      const inputHandle = getHandleScreenPosition(
        indicatorNode.position,
        'input',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      // Verify handle positions are calculated correctly
      expect(outputHandle.x).toBe(dataNode.position.x + DEFAULT_NODE_DIMENSIONS.width + 12);
      expect(outputHandle.y).toBe(dataNode.position.y + DEFAULT_NODE_DIMENSIONS.height / 2);

      expect(inputHandle.x).toBe(indicatorNode.position.x - 12);
      expect(inputHandle.y).toBe(indicatorNode.position.y + DEFAULT_NODE_DIMENSIONS.height / 2);
    });

    test('should handle zoom and offset transformations correctly', () => {
      const zoomedCanvasState: CanvasState = {
        zoom: 1.5,
        offset: { x: 50, y: 30 }
      };

      connectionManager.updateCanvasState(zoomedCanvasState);

      const dataNode = mockNodes[0];
      const handlePosition = getHandleScreenPosition(
        dataNode.position,
        'output',
        zoomedCanvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      // Verify zoom and offset are applied correctly
      const expectedX = (dataNode.position.x + DEFAULT_NODE_DIMENSIONS.width + 12) * 1.5 + 50;
      const expectedY = (dataNode.position.y + DEFAULT_NODE_DIMENSIONS.height / 2) * 1.5 + 30;

      expect(handlePosition.x).toBeCloseTo(expectedX, 1);
      expect(handlePosition.y).toBeCloseTo(expectedY, 1);
    });

    test('should maintain coordinate consistency during node movement', () => {
      const nodeId = 'data-node';
      const newPosition = { x: 200, y: 150 };

      // Move node and update connection manager
      connectionManager.updateConnectionsForNodeMove(nodeId, newPosition);

      // Verify node position is updated in connection manager
      const state = connectionManager.getState();
      const updatedNode = state.nodes.find(n => n.id === nodeId);
      
      expect(updatedNode?.position).toEqual(newPosition);

      // Verify handle positions are recalculated correctly
      const handlePosition = getHandleScreenPosition(
        newPosition,
        'output',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      expect(handlePosition.x).toBe(newPosition.x + DEFAULT_NODE_DIMENSIONS.width + 12);
      expect(handlePosition.y).toBe(newPosition.y + DEFAULT_NODE_DIMENSIONS.height / 2);
    });
  });

  describe('Connection Workflow Integration', () => {
    test('should complete full connection workflow with coordinate validation', () => {
      const sourceNode = mockNodes[0]; // data-node
      const targetNode = mockNodes[1]; // indicator-node

      // Start connection
      const startPosition = getHandleScreenPosition(
        sourceNode.position,
        'output',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      connectionManager.startConnection(sourceNode.id, 'output', startPosition);

      // Verify active connection is created
      const activeConnection = connectionManager.getActiveConnection();
      expect(activeConnection).not.toBeNull();
      expect(activeConnection?.sourceNodeId).toBe(sourceNode.id);
      expect(activeConnection?.startPosition).toEqual(startPosition);

      // Update connection position (simulating mouse movement)
      const endPosition = getHandleScreenPosition(
        targetNode.position,
        'input',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      connectionManager.updateConnectionPosition(endPosition);

      // Complete connection
      const success = connectionManager.completeConnection(targetNode.id, 'input');
      expect(success).toBe(true);

      // Verify connection is created
      const connections = connectionManager.getConnections();
      expect(connections).toHaveLength(1);
      expect(connections[0].source).toBe(sourceNode.id);
      expect(connections[0].target).toBe(targetNode.id);

      // Verify active connection is cleared
      expect(connectionManager.getActiveConnection()).toBeNull();
    });

    test('should handle connection cancellation properly', () => {
      const sourceNode = mockNodes[0];
      const startPosition = getHandleScreenPosition(
        sourceNode.position,
        'output',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      // Start connection
      connectionManager.startConnection(sourceNode.id, 'output', startPosition);
      expect(connectionManager.getActiveConnection()).not.toBeNull();

      // Cancel connection
      connectionManager.cancelConnection();
      expect(connectionManager.getActiveConnection()).toBeNull();

      // Verify no connections were created
      expect(connectionManager.getConnections()).toHaveLength(0);
    });

    test('should validate connections during creation workflow', () => {
      const sourceNode = mockNodes[0]; // data-node
      const startPosition = getHandleScreenPosition(
        sourceNode.position,
        'output',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      // Start connection
      connectionManager.startConnection(sourceNode.id, 'output', startPosition);

      // Try to connect to same node (should fail)
      const success = connectionManager.completeConnection(sourceNode.id, 'input');
      expect(success).toBe(false);

      // Verify no connection was created
      expect(connectionManager.getConnections()).toHaveLength(0);
      expect(connectionManager.getActiveConnection()).toBeNull();
    });
  });

  describe('Complex Strategy Scenarios', () => {
    test('should handle complex strategy with multiple connections', () => {
      // Create a complex strategy: data -> indicator -> condition -> action
      const connections = [
        { source: 'data-node', target: 'indicator-node' },
        { source: 'indicator-node', target: 'condition-node' },
        { source: 'condition-node', target: 'action-node' }
      ];

      // Create connections
      connections.forEach(({ source, target }) => {
        const sourceNode = mockNodes.find(n => n.id === source)!;
        const targetNode = mockNodes.find(n => n.id === target)!;

        const startPos = getHandleScreenPosition(
          sourceNode.position,
          'output',
          canvasState,
          DEFAULT_NODE_DIMENSIONS
        );

        connectionManager.startConnection(source, 'output', startPos);
        const success = connectionManager.completeConnection(target, 'input');
        expect(success).toBe(true);
      });

      // Verify all connections were created
      expect(connectionManager.getConnections()).toHaveLength(3);

      // Verify connection statistics
      const stats = connectionManager.getConnectionStats();
      expect(stats.totalConnections).toBe(3);
      expect(stats.validConnections).toBe(3);
      expect(stats.nodeConnections['data-node']).toBe(1);
      expect(stats.nodeConnections['indicator-node']).toBe(2);
      expect(stats.nodeConnections['condition-node']).toBe(2);
      expect(stats.nodeConnections['action-node']).toBe(1);
    });

    test('should prevent circular dependencies in complex strategies', () => {
      // Create linear connections: data -> indicator -> condition
      connectionManager.startConnection('data-node', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('indicator-node', 'input');

      connectionManager.startConnection('indicator-node', 'output', { x: 400, y: 100 });
      connectionManager.completeConnection('condition-node', 'input');

      // Try to create circular dependency: condition -> data
      connectionManager.startConnection('condition-node', 'output', { x: 700, y: 100 });
      const success = connectionManager.completeConnection('data-node', 'input');

      // Should fail due to circular dependency
      expect(success).toBe(false);
      expect(connectionManager.getConnections()).toHaveLength(2);
    });

    test('should handle node deletion with connection cleanup', () => {
      // Create connections involving indicator-node
      connectionManager.startConnection('data-node', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('indicator-node', 'input');

      connectionManager.startConnection('indicator-node', 'output', { x: 400, y: 100 });
      connectionManager.completeConnection('condition-node', 'input');

      expect(connectionManager.getConnections()).toHaveLength(2);

      // Remove indicator-node from nodes array (simulating node deletion)
      const updatedNodes = mockNodes.filter(n => n.id !== 'indicator-node');
      connectionManager.updateNodes(updatedNodes);

      // All connections involving indicator-node should be removed
      expect(connectionManager.getConnections()).toHaveLength(0);
    });
  });

  describe('Performance and State Management', () => {
    test('should handle rapid connection updates efficiently', () => {
      const sourceNode = mockNodes[0];
      const startPosition = getHandleScreenPosition(
        sourceNode.position,
        'output',
        canvasState,
        DEFAULT_NODE_DIMENSIONS
      );

      // Start connection
      connectionManager.startConnection(sourceNode.id, 'output', startPosition);

      // Simulate rapid mouse movements
      const positions = [
        { x: 200, y: 100 },
        { x: 300, y: 120 },
        { x: 400, y: 110 },
        { x: 500, y: 105 }
      ];

      positions.forEach(position => {
        connectionManager.updateConnectionPosition(position);
        const activeConnection = connectionManager.getActiveConnection();
        expect(activeConnection?.currentPosition).toEqual(position);
      });

      // Cancel connection
      connectionManager.cancelConnection();
      expect(connectionManager.getActiveConnection()).toBeNull();
    });

    test('should maintain state consistency across canvas operations', () => {
      // Create initial connection
      connectionManager.startConnection('data-node', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('indicator-node', 'input');

      // Update canvas state (zoom and pan)
      const newCanvasState: CanvasState = {
        zoom: 2,
        offset: { x: 100, y: 50 }
      };

      connectionManager.updateCanvasState(newCanvasState);

      // Move nodes
      connectionManager.updateConnectionsForNodeMove('data-node', { x: 150, y: 120 });
      connectionManager.updateConnectionsForNodeMove('indicator-node', { x: 450, y: 120 });

      // Verify connections are still valid and state is consistent
      const connections = connectionManager.getConnections();
      expect(connections).toHaveLength(1);

      const state = connectionManager.getState();
      expect(state.canvasState).toEqual(newCanvasState);
      expect(state.nodes.find(n => n.id === 'data-node')?.position).toEqual({ x: 150, y: 120 });
    });
  });

  describe('Connection Path Calculation', () => {
    test('should calculate accurate connection paths', () => {
      // Create a connection
      connectionManager.startConnection('data-node', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('indicator-node', 'input');

      const connections = connectionManager.getConnections();
      const connection = connections[0];

      // Calculate connection path using utility
      const path = ConnectionUtils.calculateConnectionScreenPath(
        connection,
        mockNodes,
        canvasState
      );

      // Verify path is a valid SVG path string
      expect(path).toMatch(/^M \d+\.?\d* \d+\.?\d* C/);
      expect(path.length).toBeGreaterThan(0);
    });

    test('should update connection paths when nodes move', () => {
      // Create connection
      connectionManager.startConnection('data-node', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('indicator-node', 'input');

      const connections = connectionManager.getConnections();
      const connection = connections[0];

      // Calculate initial path
      const initialPath = ConnectionUtils.calculateConnectionScreenPath(
        connection,
        mockNodes,
        canvasState
      );

      // Move nodes
      const newDataPosition = { x: 200, y: 150 };
      const newIndicatorPosition = { x: 500, y: 150 };

      connectionManager.updateConnectionsForNodeMove('data-node', newDataPosition);
      connectionManager.updateConnectionsForNodeMove('indicator-node', newIndicatorPosition);

      // Update mockNodes for path calculation
      const updatedNodes = mockNodes.map(node => {
        if (node.id === 'data-node') return { ...node, position: newDataPosition };
        if (node.id === 'indicator-node') return { ...node, position: newIndicatorPosition };
        return node;
      });

      // Calculate updated path
      const updatedPath = ConnectionUtils.calculateConnectionScreenPath(
        connection,
        updatedNodes,
        canvasState
      );

      // Paths should be different
      expect(updatedPath).not.toBe(initialPath);
      expect(updatedPath.length).toBeGreaterThan(0);
    });
  });
});