/**
 * Simple Connection Handler
 * 
 * A simplified connection system that directly handles connection creation
 * without complex state management conflicts.
 */

export interface SimpleConnection {
  id: string;
  source: string;
  target: string;
  created: Date;
}

export interface ConnectionState {
  isConnecting: boolean;
  sourceNodeId: string | null;
  sourceHandleType: 'input' | 'output' | null;
  tempConnection: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null;
}

export class SimpleConnectionHandler {
  private state: ConnectionState = {
    isConnecting: false,
    sourceNodeId: null,
    sourceHandleType: null,
    tempConnection: null
  };

  private connections: SimpleConnection[] = [];
  private listeners: Set<(connections: SimpleConnection[], state: ConnectionState) => void> = new Set();

  /**
   * Subscribe to connection changes
   */
  subscribe(listener: (connections: SimpleConnection[], state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.connections, this.state));
  }

  /**
   * Start a connection from a handle
   */
  startConnection(nodeId: string, handleType: 'input' | 'output', position: { x: number; y: number }): void {
    try {
      // Cancel any existing connection first
      if (this.state.isConnecting) {
        this.cancelConnection();
      }
      
      this.state = {
        isConnecting: true,
        sourceNodeId: nodeId,
        sourceHandleType: handleType,
        tempConnection: {
          start: position,
          end: position
        }
      };

      this.notifyListeners();
    } catch (error) {
      console.error('SimpleConnectionHandler: Error starting connection', error);
    }
  }

  /**
   * Update the temporary connection position
   */
  updateConnection(position: { x: number; y: number }): void {
    if (!this.state.isConnecting || !this.state.tempConnection) return;

    this.state.tempConnection.end = position;
    this.notifyListeners();
  }

  /**
   * Complete a connection to a target handle
   */
  completeConnection(targetNodeId: string, targetHandleType: 'input' | 'output'): boolean {
    if (!this.state.isConnecting || !this.state.sourceNodeId) {
      return false;
    }

    // Validate connection
    if (this.state.sourceNodeId === targetNodeId) {
      this.cancelConnection();
      return false;
    }

    // Check if connection already exists
    const existingConnection = this.connections.find(conn =>
      (conn.source === this.state.sourceNodeId && conn.target === targetNodeId) ||
      (conn.source === targetNodeId && conn.target === this.state.sourceNodeId)
    );

    if (existingConnection) {
      this.cancelConnection();
      return false;
    }

    // Ensure proper connection direction (output -> input)
    let sourceId = this.state.sourceNodeId;
    let targetId = targetNodeId;

    // If we started from input, swap the direction
    if (this.state.sourceHandleType === 'input') {
      sourceId = targetNodeId;
      targetId = this.state.sourceNodeId;
    }

    // Create the connection
    const newConnection: SimpleConnection = {
      id: `conn_${sourceId}_${targetId}_${Date.now()}`,
      source: sourceId,
      target: targetId,
      created: new Date()
    };

    this.connections.push(newConnection);

    // Reset state
    this.state = {
      isConnecting: false,
      sourceNodeId: null,
      sourceHandleType: null,
      tempConnection: null
    };

    this.notifyListeners();
    return true;
  }

  /**
   * Cancel the current connection
   */
  cancelConnection(): void {
    this.state = {
      isConnecting: false,
      sourceNodeId: null,
      sourceHandleType: null,
      tempConnection: null
    };

    this.notifyListeners();
  }

  /**
   * Delete a connection
   */
  deleteConnection(connectionId: string): void {
    const initialLength = this.connections.length;
    this.connections = this.connections.filter(conn => conn.id !== connectionId);
    
    if (this.connections.length < initialLength) {
      this.notifyListeners();
    }
  }

  /**
   * Get all connections
   */
  getConnections(): SimpleConnection[] {
    return [...this.connections];
  }

  /**
   * Get current state
   */
  getState(): ConnectionState {
    return { ...this.state };
  }

  /**
   * Clear all connections
   */
  clearConnections(): void {
    this.connections = [];
    this.cancelConnection();
    this.notifyListeners();
  }
}

// Create singleton instance
let simpleConnectionHandler: SimpleConnectionHandler | null = null;

export function getSimpleConnectionHandler(): SimpleConnectionHandler {
  if (!simpleConnectionHandler) {
    simpleConnectionHandler = new SimpleConnectionHandler();
  }
  return simpleConnectionHandler;
}