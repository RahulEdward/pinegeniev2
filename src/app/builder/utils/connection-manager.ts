/**
 * Enhanced Connection State Management for PineGenie Strategy Builder
 * 
 * This module provides centralized connection management with proper validation,
 * circular dependency detection, and coordinate system integration.
 * 
 * Requirements addressed: 1.3, 1.4, 6.1, 6.2, 6.3
 */

import { Point, CanvasState, getHandleScreenPosition, DEFAULT_NODE_DIMENSIONS } from './coordinate-system';

export interface ConnectionNode {
  id: string;
  type: string;
  position: Point;
  data?: {
    label?: string;
    [key: string]: unknown;
  };
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  sourceHandle: 'output';
  targetHandle: 'input';
  created: Date;
  isValid: boolean;
  metadata?: {
    [key: string]: unknown;
  };
}

export interface ConnectionAttempt {
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: 'input' | 'output';
  targetHandle: 'input' | 'output';
}

export interface ActiveConnection {
  sourceNodeId: string;
  sourceHandle: 'input' | 'output';
  startPosition: Point;
  currentPosition: Point;
  isValid: boolean;
}

export interface ConnectionValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ConnectionManagerState {
  connections: Connection[];
  activeConnection: ActiveConnection | null;
  nodes: ConnectionNode[];
  canvasState: CanvasState;
}

/**
 * Enhanced Connection Manager Class
 * Provides centralized connection state management with validation and coordinate integration
 */
export class ConnectionManager {
  private state: ConnectionManagerState;
  private listeners: Set<(state: ConnectionManagerState) => void> = new Set();

  constructor(initialState?: Partial<ConnectionManagerState>) {
    this.state = {
      connections: [],
      activeConnection: null,
      nodes: [],
      canvasState: { zoom: 1, offset: { x: 0, y: 0 } },
      ...initialState
    };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: ConnectionManagerState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update the canvas state (zoom and offset)
   */
  updateCanvasState(canvasState: CanvasState): void {
    this.state.canvasState = canvasState;
    this.notifyListeners();
  }

  /**
   * Update the nodes array
   */
  updateNodes(nodes: ConnectionNode[]): void {
    this.state.nodes = nodes;
    
    // Update connections when nodes change (handle node deletions)
    this.state.connections = this.state.connections.filter(connection => {
      const sourceExists = nodes.some(node => node.id === connection.source);
      const targetExists = nodes.some(node => node.id === connection.target);
      return sourceExists && targetExists;
    });
    
    this.notifyListeners();
  }

  /**
   * Start creating a new connection
   */
  startConnection(
    sourceNodeId: string, 
    sourceHandle: 'input' | 'output', 
    startPosition: Point
  ): void {
    // Cancel any existing active connection
    if (this.state.activeConnection) {
      this.cancelConnection();
    }

    this.state.activeConnection = {
      sourceNodeId,
      sourceHandle,
      startPosition,
      currentPosition: startPosition,
      isValid: false
    };

    this.notifyListeners();
  }

  /**
   * Update the current position of an active connection
   */
  updateConnectionPosition(currentPosition: Point): void {
    if (!this.state.activeConnection) return;

    this.state.activeConnection.currentPosition = currentPosition;
    
    // Check if we're hovering over a valid target
    const targetNode = this.getNodeAtPosition(currentPosition);
    if (targetNode && targetNode.id !== this.state.activeConnection.sourceNodeId) {
      const targetHandle = this.state.activeConnection.sourceHandle === 'output' ? 'input' : 'output';
      const validationResult = this.validateConnection({
        sourceNodeId: this.state.activeConnection.sourceNodeId,
        targetNodeId: targetNode.id,
        sourceHandle: this.state.activeConnection.sourceHandle,
        targetHandle
      });
      this.state.activeConnection.isValid = validationResult.isValid;
    } else {
      this.state.activeConnection.isValid = false;
    }

    this.notifyListeners();
  }

  /**
   * Complete a connection attempt
   */
  completeConnection(targetNodeId: string, targetHandle: 'input' | 'output'): boolean {
    if (!this.state.activeConnection) return false;

    const connectionAttempt: ConnectionAttempt = {
      sourceNodeId: this.state.activeConnection.sourceNodeId,
      targetNodeId,
      sourceHandle: this.state.activeConnection.sourceHandle,
      targetHandle
    };

    const validationResult = this.validateConnection(connectionAttempt);
    
    if (validationResult.isValid) {
      const connection = this.createConnection(connectionAttempt);
      this.state.connections.push(connection);
      this.state.activeConnection = null;
      this.notifyListeners();
      return true;
    } else {
      // Log validation errors for debugging
      console.warn('Connection validation failed:', validationResult.errors);
      // Clear active connection on failed attempt
      this.state.activeConnection = null;
      this.notifyListeners();
      return false;
    }
  }

  /**
   * Cancel the current active connection
   */
  cancelConnection(): void {
    if (this.state.activeConnection) {
      this.state.activeConnection = null;
      this.notifyListeners();
    }
  }

  /**
   * Delete a connection by ID
   */
  deleteConnection(connectionId: string): boolean {
    const initialLength = this.state.connections.length;
    this.state.connections = this.state.connections.filter(conn => conn.id !== connectionId);
    
    const wasDeleted = this.state.connections.length < initialLength;
    if (wasDeleted) {
      this.notifyListeners();
    }
    
    return wasDeleted;
  }

  /**
   * Delete all connections involving a specific node
   */
  deleteConnectionsForNode(nodeId: string): number {
    const initialLength = this.state.connections.length;
    this.state.connections = this.state.connections.filter(
      conn => conn.source !== nodeId && conn.target !== nodeId
    );
    
    const deletedCount = initialLength - this.state.connections.length;
    if (deletedCount > 0) {
      this.notifyListeners();
    }
    
    return deletedCount;
  }

  /**
   * Update connections when nodes are moved
   */
  updateConnectionsForNodeMove(nodeId: string, newPosition: Point): void {
    // Update the node position in our state
    const nodeIndex = this.state.nodes.findIndex(node => node.id === nodeId);
    if (nodeIndex !== -1) {
      this.state.nodes[nodeIndex].position = newPosition;
    }

    // Connections will automatically use the updated positions when rendered
    // No need to update connection objects themselves
    this.notifyListeners();
  }

  /**
   * Validate a connection attempt
   */
  validateConnection(attempt: ConnectionAttempt): ConnectionValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (!attempt.sourceNodeId || !attempt.targetNodeId) {
      errors.push('Source and target nodes must be specified');
    }

    if (attempt.sourceNodeId === attempt.targetNodeId) {
      errors.push('Cannot connect a node to itself');
    }

    // Check if nodes exist
    const sourceNode = this.getNodeById(attempt.sourceNodeId);
    const targetNode = this.getNodeById(attempt.targetNodeId);

    if (!sourceNode) {
      errors.push(`Source node '${attempt.sourceNodeId}' not found`);
    }

    if (!targetNode) {
      errors.push(`Target node '${attempt.targetNodeId}' not found`);
    }

    // Validate connection direction (output to input)
    if (attempt.sourceHandle === attempt.targetHandle) {
      errors.push('Connections must be from output to input or input to output');
    }

    // Ensure proper connection direction (output -> input)
    const isValidDirection = 
      (attempt.sourceHandle === 'output' && attempt.targetHandle === 'input') ||
      (attempt.sourceHandle === 'input' && attempt.targetHandle === 'output');

    if (!isValidDirection) {
      errors.push('Invalid connection direction');
    }

    // Check for duplicate connections
    const normalizedSource = attempt.sourceHandle === 'output' ? attempt.sourceNodeId : attempt.targetNodeId;
    const normalizedTarget = attempt.sourceHandle === 'output' ? attempt.targetNodeId : attempt.sourceNodeId;

    const duplicateConnection = this.state.connections.find(conn =>
      conn.source === normalizedSource && conn.target === normalizedTarget
    );

    if (duplicateConnection) {
      errors.push('Connection already exists between these nodes');
    }

    // Check for circular dependencies
    if (sourceNode && targetNode && errors.length === 0) {
      const wouldCreateCycle = this.wouldCreateCircularDependency(
        normalizedSource,
        normalizedTarget
      );

      if (wouldCreateCycle) {
        errors.push('Connection would create a circular dependency');
      }
    }

    // Node type compatibility warnings
    if (sourceNode && targetNode) {
      const compatibilityWarnings = this.checkNodeCompatibility(sourceNode, targetNode);
      warnings.push(...compatibilityWarnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if a connection would create a circular dependency
   */
  private wouldCreateCircularDependency(sourceId: string, targetId: string): boolean {
    // Use depth-first search to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true; // Back edge found, cycle detected
      }

      if (visited.has(nodeId)) {
        return false; // Already processed this node
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      // Get all nodes that this node connects to
      const outgoingConnections = this.state.connections.filter(conn => conn.source === nodeId);
      
      // Add the potential new connection
      if (nodeId === sourceId) {
        outgoingConnections.push({
          id: 'temp',
          source: sourceId,
          target: targetId,
          sourceHandle: 'output',
          targetHandle: 'input',
          created: new Date(),
          isValid: true
        });
      }

      for (const connection of outgoingConnections) {
        if (hasCycle(connection.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    return hasCycle(sourceId);
  }

  /**
   * Check node type compatibility and return warnings
   */
  private checkNodeCompatibility(sourceNode: ConnectionNode, targetNode: ConnectionNode): string[] {
    const warnings: string[] = [];

    // Define node type compatibility rules
    const compatibilityRules: Record<string, string[]> = {
      'data': ['indicator', 'condition', 'action'],
      'indicator': ['condition', 'action', 'indicator'],
      'condition': ['action', 'condition'],
      'action': ['risk'],
      'risk': []
    };

    const sourceCompatible = compatibilityRules[sourceNode.type] || [];
    if (!sourceCompatible.includes(targetNode.type)) {
      warnings.push(`Connecting ${sourceNode.type} to ${targetNode.type} may not produce expected results`);
    }

    return warnings;
  }

  /**
   * Create a new connection object
   */
  private createConnection(attempt: ConnectionAttempt): Connection {
    // Normalize connection direction (always output -> input)
    const source = attempt.sourceHandle === 'output' ? attempt.sourceNodeId : attempt.targetNodeId;
    const target = attempt.sourceHandle === 'output' ? attempt.targetNodeId : attempt.sourceNodeId;

    return {
      id: `conn_${source}_${target}_${Date.now()}`,
      source,
      target,
      sourceHandle: 'output',
      targetHandle: 'input',
      created: new Date(),
      isValid: true,
      metadata: {
        originalAttempt: attempt
      }
    };
  }

  /**
   * Get node by ID
   */
  private getNodeById(nodeId: string): ConnectionNode | undefined {
    return this.state.nodes.find(node => node.id === nodeId);
  }

  /**
   * Get node at a specific screen position (for hover detection)
   */
  private getNodeAtPosition(screenPosition: Point): ConnectionNode | undefined {
    // This is a simplified implementation
    // In a real scenario, you'd check if the position is within node bounds
    for (const node of this.state.nodes) {
      const nodeScreenPosition = {
        x: node.position.x * this.state.canvasState.zoom + this.state.canvasState.offset.x,
        y: node.position.y * this.state.canvasState.zoom + this.state.canvasState.offset.y
      };

      const nodeWidth = DEFAULT_NODE_DIMENSIONS.width * this.state.canvasState.zoom;
      const nodeHeight = DEFAULT_NODE_DIMENSIONS.height * this.state.canvasState.zoom;

      if (
        screenPosition.x >= nodeScreenPosition.x &&
        screenPosition.x <= nodeScreenPosition.x + nodeWidth &&
        screenPosition.y >= nodeScreenPosition.y &&
        screenPosition.y <= nodeScreenPosition.y + nodeHeight
      ) {
        return node;
      }
    }

    return undefined;
  }

  /**
   * Get all connections
   */
  getConnections(): Connection[] {
    return [...this.state.connections];
  }

  /**
   * Get active connection
   */
  getActiveConnection(): ActiveConnection | null {
    return this.state.activeConnection;
  }

  /**
   * Get connections for a specific node
   */
  getConnectionsForNode(nodeId: string): Connection[] {
    return this.state.connections.filter(
      conn => conn.source === nodeId || conn.target === nodeId
    );
  }

  /**
   * Get connected nodes for a specific node
   */
  getConnectedNodes(nodeId: string): ConnectionNode[] {
    const connectedNodeIds = new Set<string>();
    
    this.state.connections.forEach(conn => {
      if (conn.source === nodeId) {
        connectedNodeIds.add(conn.target);
      }
      if (conn.target === nodeId) {
        connectedNodeIds.add(conn.source);
      }
    });

    return this.state.nodes.filter(node => connectedNodeIds.has(node.id));
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): {
    totalConnections: number;
    validConnections: number;
    invalidConnections: number;
    nodeConnections: Record<string, number>;
  } {
    const nodeConnections: Record<string, number> = {};
    let validConnections = 0;
    let invalidConnections = 0;

    this.state.connections.forEach(conn => {
      // Count connections per node
      nodeConnections[conn.source] = (nodeConnections[conn.source] || 0) + 1;
      nodeConnections[conn.target] = (nodeConnections[conn.target] || 0) + 1;

      // Count valid/invalid
      if (conn.isValid) {
        validConnections++;
      } else {
        invalidConnections++;
      }
    });

    return {
      totalConnections: this.state.connections.length,
      validConnections,
      invalidConnections,
      nodeConnections
    };
  }

  /**
   * Clear all connections
   */
  clearAllConnections(): void {
    this.state.connections = [];
    this.state.activeConnection = null;
    this.notifyListeners();
  }

  /**
   * Export connection data
   */
  exportConnections(): {
    connections: Connection[];
    metadata: {
      exportedAt: string;
      totalConnections: number;
      canvasState: CanvasState;
    };
  } {
    return {
      connections: this.getConnections(),
      metadata: {
        exportedAt: new Date().toISOString(),
        totalConnections: this.state.connections.length,
        canvasState: this.state.canvasState
      }
    };
  }

  /**
   * Import connection data
   */
  importConnections(data: { connections: Connection[] }): void {
    // Validate imported connections
    const validConnections = data.connections.filter(conn => {
      const validation = this.validateConnection({
        sourceNodeId: conn.source,
        targetNodeId: conn.target,
        sourceHandle: 'output',
        targetHandle: 'input'
      });
      return validation.isValid;
    });

    this.state.connections = validConnections;
    this.notifyListeners();
  }

  /**
   * Get current state (for debugging)
   */
  getState(): ConnectionManagerState {
    return { ...this.state };
  }
}

/**
 * Create a singleton connection manager instance
 */
let connectionManagerInstance: ConnectionManager | null = null;

export function getConnectionManager(): ConnectionManager {
  if (!connectionManagerInstance) {
    connectionManagerInstance = new ConnectionManager();
  }
  return connectionManagerInstance;
}

/**
 * Reset the connection manager instance (for testing)
 */
export function resetConnectionManager(): void {
  connectionManagerInstance = null;
}

/**
 * Utility functions for connection management
 */
export const ConnectionUtils = {
  /**
   * Generate a unique connection ID
   */
  generateConnectionId(sourceId: string, targetId: string): string {
    return `conn_${sourceId}_${targetId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Check if two connections are equivalent
   */
  areConnectionsEquivalent(conn1: Connection, conn2: Connection): boolean {
    return (
      (conn1.source === conn2.source && conn1.target === conn2.target) ||
      (conn1.source === conn2.target && conn1.target === conn2.source)
    );
  },

  /**
   * Get connection display name
   */
  getConnectionDisplayName(connection: Connection, nodes: ConnectionNode[]): string {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    const sourceName = sourceNode?.data?.label || sourceNode?.id || 'Unknown';
    const targetName = targetNode?.data?.label || targetNode?.id || 'Unknown';
    
    return `${sourceName} → ${targetName}`;
  },

  /**
   * Calculate connection path using coordinate system
   */
  calculateConnectionScreenPath(
    connection: Connection,
    nodes: ConnectionNode[],
    canvasState: CanvasState
  ): string {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) {
      return '';
    }

    const startPos = getHandleScreenPosition(sourceNode.position, 'output', canvasState);
    const endPos = getHandleScreenPosition(targetNode.position, 'input', canvasState);

    // N8N-style bezier curve control points
    const deltaX = endPos.x - startPos.x;
    
    // N8N uses a fixed control point offset for consistent curves
    const controlOffset = Math.max(Math.abs(deltaX) * 0.5, 100);

    const controlPoint1 = {
      x: startPos.x + controlOffset,
      y: startPos.y
    };

    const controlPoint2 = {
      x: endPos.x - controlOffset,
      y: endPos.y
    };

    return `M ${startPos.x} ${startPos.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${endPos.x} ${endPos.y}`;
  }
};