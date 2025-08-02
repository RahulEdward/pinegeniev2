/**
 * Unit Tests for Connection Manager
 * 
 * Tests the enhanced connection state management system including:
 * - Connection creation and validation
 * - Circular dependency detection
 * - Connection deletion and cleanup
 * - Node movement updates
 */

import { 
  ConnectionManager, 
  ConnectionNode, 
  Connection, 
  ConnectionAttempt,
  ConnectionUtils,
  getConnectionManager,
  resetConnectionManager
} from '../connection-manager';
import { CanvasState } from '../coordinate-system';

describe('ConnectionManager', () => {
  let connectionManager: ConnectionManager;
  let mockNodes: ConnectionNode[];
  let mockCanvasState: CanvasState;

  beforeEach(() => {
    // Reset singleton instance
    resetConnectionManager();
    
    // Create test nodes
    mockNodes = [
      {
        id: 'node1',
        type: 'data',
        position: { x: 100, y: 100 },
        data: { label: 'Data Source' }
      },
      {
        id: 'node2',
        type: 'indicator',
        position: { x: 300, y: 100 },
        data: { label: 'RSI' }
      },
      {
        id: 'node3',
        type: 'condition',
        position: { x: 500, y: 100 },
        data: { label: 'Greater Than' }
      },
      {
        id: 'node4',
        type: 'action',
        position: { x: 700, y: 100 },
        data: { label: 'Buy Order' }
      }
    ];

    mockCanvasState = {
      zoom: 1,
      offset: { x: 0, y: 0 }
    };

    connectionManager = new ConnectionManager({
      nodes: mockNodes,
      canvasState: mockCanvasState
    });
  });

  describe('Basic Connection Operations', () => {
    test('should create a valid connection', () => {
      const attempt: ConnectionAttempt = {
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input'
      };

      const validation = connectionManager.validateConnection(attempt);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      // Start and complete connection
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      const success = connectionManager.completeConnection('node2', 'input');
      
      expect(success).toBe(true);
      expect(connectionManager.getConnections()).toHaveLength(1);
    });

    test('should prevent self-connections', () => {
      const attempt: ConnectionAttempt = {
        sourceNodeId: 'node1',
        targetNodeId: 'node1',
        sourceHandle: 'output',
        targetHandle: 'input'
      };

      const validation = connectionManager.validateConnection(attempt);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Cannot connect a node to itself');
    });

    test('should prevent duplicate connections', () => {
      // Create first connection
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');

      // Try to create duplicate
      const attempt: ConnectionAttempt = {
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input'
      };

      const validation = connectionManager.validateConnection(attempt);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Connection already exists between these nodes');
    });

    test('should validate connection direction', () => {
      const invalidAttempt: ConnectionAttempt = {
        sourceNodeId: 'node1',
        targetNodeId: 'node2',
        sourceHandle: 'output',
        targetHandle: 'output'
      };

      const validation = connectionManager.validateConnection(invalidAttempt);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Connections must be from output to input or input to output');
    });
  });

  describe('Circular Dependency Detection', () => {
    test('should detect simple circular dependency', () => {
      // Create connections: node1 -> node2 -> node3
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');
      
      connectionManager.startConnection('node2', 'output', { x: 300, y: 100 });
      connectionManager.completeConnection('node3', 'input');

      // Try to create cycle: node3 -> node1
      const cyclicAttempt: ConnectionAttempt = {
        sourceNodeId: 'node3',
        targetNodeId: 'node1',
        sourceHandle: 'output',
        targetHandle: 'input'
      };

      const validation = connectionManager.validateConnection(cyclicAttempt);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Connection would create a circular dependency');
    });

    test('should detect complex circular dependency', () => {
      // Create connections: node1 -> node2 -> node3 -> node4
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');
      
      connectionManager.startConnection('node2', 'output', { x: 300, y: 100 });
      connectionManager.completeConnection('node3', 'input');
      
      connectionManager.startConnection('node3', 'output', { x: 500, y: 100 });
      connectionManager.completeConnection('node4', 'input');

      // Try to create cycle: node4 -> node2
      const cyclicAttempt: ConnectionAttempt = {
        sourceNodeId: 'node4',
        targetNodeId: 'node2',
        sourceHandle: 'output',
        targetHandle: 'input'
      };

      const validation = connectionManager.validateConnection(cyclicAttempt);
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Connection would create a circular dependency');
    });

    test('should allow valid non-cyclic connections', () => {
      // Create connections: node1 -> node2, node1 -> node3
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');
      
      // This should be valid (no cycle)
      const validAttempt: ConnectionAttempt = {
        sourceNodeId: 'node1',
        targetNodeId: 'node3',
        sourceHandle: 'output',
        targetHandle: 'input'
      };

      const validation = connectionManager.validateConnection(validAttempt);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Connection Deletion', () => {
    beforeEach(() => {
      // Create some test connections
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');
      
      connectionManager.startConnection('node2', 'output', { x: 300, y: 100 });
      connectionManager.completeConnection('node3', 'input');
    });

    test('should delete connection by ID', () => {
      const connections = connectionManager.getConnections();
      expect(connections).toHaveLength(2);

      const connectionToDelete = connections[0];
      const success = connectionManager.deleteConnection(connectionToDelete.id);
      
      expect(success).toBe(true);
      expect(connectionManager.getConnections()).toHaveLength(1);
    });

    test('should delete all connections for a node', () => {
      expect(connectionManager.getConnections()).toHaveLength(2);

      const deletedCount = connectionManager.deleteConnectionsForNode('node2');
      
      expect(deletedCount).toBe(2); // node2 is involved in both connections
      expect(connectionManager.getConnections()).toHaveLength(0);
    });

    test('should handle deletion of non-existent connection', () => {
      const success = connectionManager.deleteConnection('non-existent-id');
      expect(success).toBe(false);
      expect(connectionManager.getConnections()).toHaveLength(2);
    });
  });

  describe('Node Movement Updates', () => {
    test('should update node positions when nodes are moved', () => {
      const newPosition = { x: 200, y: 200 };
      connectionManager.updateConnectionsForNodeMove('node1', newPosition);

      const state = connectionManager.getState();
      const updatedNode = state.nodes.find(n => n.id === 'node1');
      
      expect(updatedNode?.position).toEqual(newPosition);
    });

    test('should clean up connections when nodes are removed', () => {
      // Create a connection
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');
      
      expect(connectionManager.getConnections()).toHaveLength(1);

      // Remove node2 from nodes array
      const updatedNodes = mockNodes.filter(n => n.id !== 'node2');
      connectionManager.updateNodes(updatedNodes);

      // Connection should be automatically removed
      expect(connectionManager.getConnections()).toHaveLength(0);
    });
  });

  describe('Active Connection Management', () => {
    test('should manage active connection state', () => {
      expect(connectionManager.getActiveConnection()).toBeNull();

      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      
      const activeConnection = connectionManager.getActiveConnection();
      expect(activeConnection).not.toBeNull();
      expect(activeConnection?.sourceNodeId).toBe('node1');
      expect(activeConnection?.sourceHandle).toBe('output');
    });

    test('should update active connection position', () => {
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      
      const newPosition = { x: 150, y: 150 };
      connectionManager.updateConnectionPosition(newPosition);
      
      const activeConnection = connectionManager.getActiveConnection();
      expect(activeConnection?.currentPosition).toEqual(newPosition);
    });

    test('should cancel active connection', () => {
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      expect(connectionManager.getActiveConnection()).not.toBeNull();

      connectionManager.cancelConnection();
      expect(connectionManager.getActiveConnection()).toBeNull();
    });
  });

  describe('Connection Statistics', () => {
    beforeEach(() => {
      // Create test connections
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');
      
      connectionManager.startConnection('node2', 'output', { x: 300, y: 100 });
      connectionManager.completeConnection('node3', 'input');
    });

    test('should provide connection statistics', () => {
      const stats = connectionManager.getConnectionStats();
      
      expect(stats.totalConnections).toBe(2);
      expect(stats.validConnections).toBe(2);
      expect(stats.invalidConnections).toBe(0);
      expect(stats.nodeConnections['node1']).toBe(1);
      expect(stats.nodeConnections['node2']).toBe(2);
      expect(stats.nodeConnections['node3']).toBe(1);
    });

    test('should get connections for specific node', () => {
      const node2Connections = connectionManager.getConnectionsForNode('node2');
      expect(node2Connections).toHaveLength(2);

      const node1Connections = connectionManager.getConnectionsForNode('node1');
      expect(node1Connections).toHaveLength(1);
    });

    test('should get connected nodes', () => {
      const connectedToNode2 = connectionManager.getConnectedNodes('node2');
      expect(connectedToNode2).toHaveLength(2);
      expect(connectedToNode2.map(n => n.id)).toContain('node1');
      expect(connectedToNode2.map(n => n.id)).toContain('node3');
    });
  });

  describe('Import/Export', () => {
    test('should export connection data', () => {
      // Create a connection
      connectionManager.startConnection('node1', 'output', { x: 100, y: 100 });
      connectionManager.completeConnection('node2', 'input');

      const exportData = connectionManager.exportConnections();
      
      expect(exportData.connections).toHaveLength(1);
      expect(exportData.metadata.totalConnections).toBe(1);
      expect(exportData.metadata.canvasState).toEqual(mockCanvasState);
    });

    test('should import connection data', () => {
      const importData = {
        connections: [{
          id: 'test-connection',
          source: 'node1',
          target: 'node2',
          sourceHandle: 'output' as const,
          targetHandle: 'input' as const,
          created: new Date(),
          isValid: true
        }]
      };

      connectionManager.importConnections(importData);
      expect(connectionManager.getConnections()).toHaveLength(1);
    });
  });

  describe('Singleton Pattern', () => {
    test('should return same instance from getConnectionManager', () => {
      const instance1 = getConnectionManager();
      const instance2 = getConnectionManager();
      
      expect(instance1).toBe(instance2);
    });

    test('should reset singleton instance', () => {
      const instance1 = getConnectionManager();
      resetConnectionManager();
      const instance2 = getConnectionManager();
      
      expect(instance1).not.toBe(instance2);
    });
  });
});

describe('ConnectionUtils', () => {
  const mockNodes: ConnectionNode[] = [
    {
      id: 'node1',
      type: 'data',
      position: { x: 100, y: 100 },
      data: { label: 'Data Source' }
    },
    {
      id: 'node2',
      type: 'indicator',
      position: { x: 300, y: 100 },
      data: { label: 'RSI' }
    }
  ];

  const mockConnection: Connection = {
    id: 'test-connection',
    source: 'node1',
    target: 'node2',
    sourceHandle: 'output',
    targetHandle: 'input',
    created: new Date(),
    isValid: true
  };

  test('should generate unique connection IDs', () => {
    const id1 = ConnectionUtils.generateConnectionId('node1', 'node2');
    const id2 = ConnectionUtils.generateConnectionId('node1', 'node2');
    
    expect(id1).not.toBe(id2);
    expect(id1).toContain('node1');
    expect(id1).toContain('node2');
  });

  test('should check connection equivalence', () => {
    const connection1: Connection = { ...mockConnection };
    const connection2: Connection = { ...mockConnection, source: 'node2', target: 'node1' };
    const connection3: Connection = { ...mockConnection, target: 'node3' };

    expect(ConnectionUtils.areConnectionsEquivalent(connection1, connection1)).toBe(true);
    expect(ConnectionUtils.areConnectionsEquivalent(connection1, connection2)).toBe(true);
    expect(ConnectionUtils.areConnectionsEquivalent(connection1, connection3)).toBe(false);
  });

  test('should generate connection display names', () => {
    const displayName = ConnectionUtils.getConnectionDisplayName(mockConnection, mockNodes);
    expect(displayName).toBe('Data Source → RSI');
  });

  test('should calculate connection screen path', () => {
    const canvasState: CanvasState = { zoom: 1, offset: { x: 0, y: 0 } };
    const path = ConnectionUtils.calculateConnectionScreenPath(mockConnection, mockNodes, canvasState);
    
    expect(path).toContain('M '); // Should start with Move command
    expect(path).toContain(' C '); // Should contain Curve command
    expect(path.length).toBeGreaterThan(0);
  });
});