/**
 * Layout Optimizer
 * Optimizes node positioning and layout algorithms for large strategies
 */

interface NodePosition {
  x: number;
  y: number;
}

interface NodeDimensions {
  width: number;
  height: number;
}

interface LayoutNode {
  id: string;
  position: NodePosition;
  dimensions: NodeDimensions;
  type: string;
  connections: string[];
  priority: number;
}

interface LayoutConstraints {
  minSpacing: number;
  maxWidth: number;
  maxHeight: number;
  gridSize: number;
  avoidOverlaps: boolean;
}

interface LayoutResult {
  nodes: Map<string, NodePosition>;
  totalWidth: number;
  totalHeight: number;
  optimizationTime: number;
  iterations: number;
}

export class LayoutOptimizer {
  private constraints: LayoutConstraints;
  private nodeCache = new Map<string, LayoutNode>();

  constructor(constraints: Partial<LayoutConstraints> = {}) {
    this.constraints = {
      minSpacing: constraints.minSpacing || 50,
      maxWidth: constraints.maxWidth || 2000,
      maxHeight: constraints.maxHeight || 1500,
      gridSize: constraints.gridSize || 25,
      avoidOverlaps: constraints.avoidOverlaps !== false
    };
  }

  /**
   * Optimize layout using hierarchical algorithm
   */
  optimizeHierarchical(nodes: LayoutNode[]): LayoutResult {
    const startTime = Date.now();
    
    // Build dependency graph
    const graph = this.buildDependencyGraph(nodes);
    
    // Perform topological sort to determine layers
    const layers = this.topologicalSort(graph);
    
    // Position nodes layer by layer
    const positions = new Map<string, NodePosition>();
    let maxWidth = 0;
    let totalHeight = 0;

    layers.forEach((layer, layerIndex) => {
      const layerY = layerIndex * (this.getMaxNodeHeight(layer, nodes) + this.constraints.minSpacing);
      const layerPositions = this.positionNodesInLayer(layer, nodes, layerY);
      
      layerPositions.forEach((position, nodeId) => {
        positions.set(nodeId, position);
        maxWidth = Math.max(maxWidth, position.x + this.getNodeWidth(nodeId, nodes));
      });
      
      totalHeight = Math.max(totalHeight, layerY + this.getMaxNodeHeight(layer, nodes));
    });

    // Apply fine-tuning optimizations
    this.optimizeConnections(positions, nodes);
    
    return {
      nodes: positions,
      totalWidth: maxWidth,
      totalHeight: totalHeight,
      optimizationTime: Date.now() - startTime,
      iterations: layers.length
    };
  }

  /**
   * Optimize layout using force-directed algorithm
   */
  optimizeForceDirected(nodes: LayoutNode[], iterations = 100): LayoutResult {
    const startTime = Date.now();
    const positions = new Map<string, NodePosition>();
    
    // Initialize random positions
    nodes.forEach(node => {
      positions.set(node.id, {
        x: Math.random() * this.constraints.maxWidth,
        y: Math.random() * this.constraints.maxHeight
      });
    });

    // Force-directed iterations
    for (let i = 0; i < iterations; i++) {
      const forces = this.calculateForces(nodes, positions);
      this.applyForces(positions, forces, 0.1 * (1 - i / iterations)); // Cooling factor
      
      if (this.constraints.avoidOverlaps) {
        this.resolveOverlaps(positions, nodes);
      }
    }

    // Snap to grid
    this.snapToGrid(positions);

    // Calculate bounds
    const bounds = this.calculateBounds(positions, nodes);

    return {
      nodes: positions,
      totalWidth: bounds.width,
      totalHeight: bounds.height,
      optimizationTime: Date.now() - startTime,
      iterations
    };
  }

  /**
   * Optimize layout for large strategies (hybrid approach)
   */
  optimizeLargeStrategy(nodes: LayoutNode[]): LayoutResult {
    const startTime = Date.now();
    
    // For large strategies, use a hybrid approach
    if (nodes.length > 50) {
      // First, cluster related nodes
      const clusters = this.clusterNodes(nodes);
      
      // Optimize each cluster separately
      const clusterResults = clusters.map(cluster => 
        this.optimizeHierarchical(cluster.nodes)
      );
      
      // Position clusters relative to each other
      const finalPositions = this.positionClusters(clusters, clusterResults);
      
      const bounds = this.calculateBounds(finalPositions, nodes);
      
      return {
        nodes: finalPositions,
        totalWidth: bounds.width,
        totalHeight: bounds.height,
        optimizationTime: Date.now() - startTime,
        iterations: clusterResults.reduce((sum, result) => sum + result.iterations, 0)
      };
    } else {
      // For smaller strategies, use hierarchical approach
      return this.optimizeHierarchical(nodes);
    }
  }

  /**
   * Build dependency graph from nodes
   */
  private buildDependencyGraph(nodes: LayoutNode[]): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();
    
    nodes.forEach(node => {
      if (!graph.has(node.id)) {
        graph.set(node.id, new Set());
      }
      
      node.connections.forEach(connectionId => {
        if (!graph.has(connectionId)) {
          graph.set(connectionId, new Set());
        }
        graph.get(connectionId)!.add(node.id);
      });
    });
    
    return graph;
  }

  /**
   * Perform topological sort to determine node layers
   */
  private topologicalSort(graph: Map<string, Set<string>>): string[][] {
    const layers: string[][] = [];
    const visited = new Set<string>();
    const inDegree = new Map<string, number>();
    
    // Calculate in-degrees
    graph.forEach((dependencies, nodeId) => {
      inDegree.set(nodeId, dependencies.size);
    });
    
    // Process nodes layer by layer
    while (visited.size < graph.size) {
      const currentLayer: string[] = [];
      
      // Find nodes with no dependencies
      graph.forEach((dependencies, nodeId) => {
        if (!visited.has(nodeId) && dependencies.size === 0) {
          currentLayer.push(nodeId);
        }
      });
      
      if (currentLayer.length === 0) {
        // Handle cycles by picking the node with minimum in-degree
        let minInDegree = Infinity;
        let nextNode = '';
        
        graph.forEach((dependencies, nodeId) => {
          if (!visited.has(nodeId) && dependencies.size < minInDegree) {
            minInDegree = dependencies.size;
            nextNode = nodeId;
          }
        });
        
        if (nextNode) {
          currentLayer.push(nextNode);
        }
      }
      
      // Mark nodes as visited and remove them from dependencies
      currentLayer.forEach(nodeId => {
        visited.add(nodeId);
        graph.forEach(dependencies => {
          dependencies.delete(nodeId);
        });
      });
      
      layers.push(currentLayer);
    }
    
    return layers;
  }

  /**
   * Position nodes within a layer
   */
  private positionNodesInLayer(
    layer: string[], 
    nodes: LayoutNode[], 
    y: number
  ): Map<string, NodePosition> {
    const positions = new Map<string, NodePosition>();
    
    // Sort nodes by priority and connections
    const sortedNodes = layer
      .map(id => nodes.find(n => n.id === id)!)
      .filter(Boolean)
      .sort((a, b) => {
        // Primary sort: priority
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Secondary sort: number of connections
        return b.connections.length - a.connections.length;
      });
    
    // Calculate total width needed
    const totalWidth = sortedNodes.reduce((sum, node) => sum + node.dimensions.width, 0);
    const totalSpacing = (sortedNodes.length - 1) * this.constraints.minSpacing;
    const availableWidth = this.constraints.maxWidth - totalSpacing;
    
    // Position nodes with equal spacing
    let currentX = Math.max(0, (this.constraints.maxWidth - totalWidth - totalSpacing) / 2);
    
    sortedNodes.forEach(node => {
      positions.set(node.id, {
        x: currentX,
        y: y
      });
      currentX += node.dimensions.width + this.constraints.minSpacing;
    });
    
    return positions;
  }

  /**
   * Calculate forces for force-directed layout
   */
  private calculateForces(
    nodes: LayoutNode[], 
    positions: Map<string, NodePosition>
  ): Map<string, { fx: number; fy: number }> {
    const forces = new Map<string, { fx: number; fy: number }>();
    
    // Initialize forces
    nodes.forEach(node => {
      forces.set(node.id, { fx: 0, fy: 0 });
    });
    
    // Repulsive forces between all nodes
    nodes.forEach(nodeA => {
      nodes.forEach(nodeB => {
        if (nodeA.id !== nodeB.id) {
          const posA = positions.get(nodeA.id)!;
          const posB = positions.get(nodeB.id)!;
          
          const dx = posA.x - posB.x;
          const dy = posA.y - posB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const repulsiveForce = 1000 / (distance * distance);
          const forceA = forces.get(nodeA.id)!;
          
          forceA.fx += (dx / distance) * repulsiveForce;
          forceA.fy += (dy / distance) * repulsiveForce;
        }
      });
    });
    
    // Attractive forces between connected nodes
    nodes.forEach(node => {
      const nodePos = positions.get(node.id)!;
      const nodeForce = forces.get(node.id)!;
      
      node.connections.forEach(connectedId => {
        const connectedPos = positions.get(connectedId);
        if (connectedPos) {
          const dx = connectedPos.x - nodePos.x;
          const dy = connectedPos.y - nodePos.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const attractiveForce = distance * 0.01;
          
          nodeForce.fx += (dx / distance) * attractiveForce;
          nodeForce.fy += (dy / distance) * attractiveForce;
        }
      });
    });
    
    return forces;
  }

  /**
   * Apply forces to node positions
   */
  private applyForces(
    positions: Map<string, NodePosition>,
    forces: Map<string, { fx: number; fy: number }>,
    damping: number
  ): void {
    forces.forEach((force, nodeId) => {
      const position = positions.get(nodeId)!;
      
      position.x += force.fx * damping;
      position.y += force.fy * damping;
      
      // Keep within bounds
      position.x = Math.max(0, Math.min(this.constraints.maxWidth, position.x));
      position.y = Math.max(0, Math.min(this.constraints.maxHeight, position.y));
    });
  }

  /**
   * Resolve overlapping nodes
   */
  private resolveOverlaps(positions: Map<string, NodePosition>, nodes: LayoutNode[]): void {
    const overlaps = this.detectOverlaps(positions, nodes);
    
    overlaps.forEach(({ nodeA, nodeB }) => {
      const posA = positions.get(nodeA)!;
      const posB = positions.get(nodeB)!;
      
      const dx = posA.x - posB.x;
      const dy = posA.y - posB.y;
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      
      const minDistance = this.constraints.minSpacing;
      const overlap = minDistance - distance;
      
      if (overlap > 0) {
        const moveDistance = overlap / 2;
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;
        
        posA.x += moveX;
        posA.y += moveY;
        posB.x -= moveX;
        posB.y -= moveY;
      }
    });
  }

  /**
   * Detect overlapping nodes
   */
  private detectOverlaps(
    positions: Map<string, NodePosition>, 
    nodes: LayoutNode[]
  ): { nodeA: string; nodeB: string }[] {
    const overlaps: { nodeA: string; nodeB: string }[] = [];
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        
        const posA = positions.get(nodeA.id)!;
        const posB = positions.get(nodeB.id)!;
        
        const dx = Math.abs(posA.x - posB.x);
        const dy = Math.abs(posA.y - posB.y);
        
        const minDx = (nodeA.dimensions.width + nodeB.dimensions.width) / 2 + this.constraints.minSpacing;
        const minDy = (nodeA.dimensions.height + nodeB.dimensions.height) / 2 + this.constraints.minSpacing;
        
        if (dx < minDx && dy < minDy) {
          overlaps.push({ nodeA: nodeA.id, nodeB: nodeB.id });
        }
      }
    }
    
    return overlaps;
  }

  /**
   * Snap positions to grid
   */
  private snapToGrid(positions: Map<string, NodePosition>): void {
    positions.forEach(position => {
      position.x = Math.round(position.x / this.constraints.gridSize) * this.constraints.gridSize;
      position.y = Math.round(position.y / this.constraints.gridSize) * this.constraints.gridSize;
    });
  }

  /**
   * Calculate layout bounds
   */
  private calculateBounds(
    positions: Map<string, NodePosition>, 
    nodes: LayoutNode[]
  ): { width: number; height: number } {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    positions.forEach((position, nodeId) => {
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        minX = Math.min(minX, position.x);
        maxX = Math.max(maxX, position.x + node.dimensions.width);
        minY = Math.min(minY, position.y);
        maxY = Math.max(maxY, position.y + node.dimensions.height);
      }
    });
    
    return {
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Cluster related nodes for large strategies
   */
  private clusterNodes(nodes: LayoutNode[]): { id: string; nodes: LayoutNode[] }[] {
    const clusters: { id: string; nodes: LayoutNode[] }[] = [];
    const visited = new Set<string>();
    
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        const cluster = this.findConnectedComponent(node, nodes, visited);
        clusters.push({
          id: `cluster_${clusters.length}`,
          nodes: cluster
        });
      }
    });
    
    return clusters;
  }

  /**
   * Find connected component starting from a node
   */
  private findConnectedComponent(
    startNode: LayoutNode, 
    allNodes: LayoutNode[], 
    visited: Set<string>
  ): LayoutNode[] {
    const component: LayoutNode[] = [];
    const stack = [startNode];
    
    while (stack.length > 0) {
      const node = stack.pop()!;
      
      if (!visited.has(node.id)) {
        visited.add(node.id);
        component.push(node);
        
        // Add connected nodes to stack
        node.connections.forEach(connectedId => {
          const connectedNode = allNodes.find(n => n.id === connectedId);
          if (connectedNode && !visited.has(connectedId)) {
            stack.push(connectedNode);
          }
        });
      }
    }
    
    return component;
  }

  /**
   * Position clusters relative to each other
   */
  private positionClusters(
    clusters: { id: string; nodes: LayoutNode[] }[],
    clusterResults: LayoutResult[]
  ): Map<string, NodePosition> {
    const finalPositions = new Map<string, NodePosition>();
    
    let currentX = 0;
    let currentY = 0;
    let maxHeightInRow = 0;
    const maxRowWidth = this.constraints.maxWidth;
    
    clusters.forEach((cluster, index) => {
      const result = clusterResults[index];
      
      // Check if cluster fits in current row
      if (currentX + result.totalWidth > maxRowWidth && currentX > 0) {
        currentX = 0;
        currentY += maxHeightInRow + this.constraints.minSpacing;
        maxHeightInRow = 0;
      }
      
      // Position all nodes in the cluster
      result.nodes.forEach((position, nodeId) => {
        finalPositions.set(nodeId, {
          x: currentX + position.x,
          y: currentY + position.y
        });
      });
      
      currentX += result.totalWidth + this.constraints.minSpacing;
      maxHeightInRow = Math.max(maxHeightInRow, result.totalHeight);
    });
    
    return finalPositions;
  }

  /**
   * Optimize connections between nodes
   */
  private optimizeConnections(positions: Map<string, NodePosition>, nodes: LayoutNode[]): void {
    // This could implement connection-specific optimizations
    // such as minimizing connection crossings or lengths
    
    // For now, we'll implement a simple connection length minimization
    const maxIterations = 10;
    
    for (let i = 0; i < maxIterations; i++) {
      let improved = false;
      
      nodes.forEach(node => {
        if (node.connections.length > 0) {
          const currentPos = positions.get(node.id)!;
          const connectedPositions = node.connections
            .map(id => positions.get(id))
            .filter(Boolean) as NodePosition[];
          
          if (connectedPositions.length > 0) {
            // Calculate centroid of connected nodes
            const centroidX = connectedPositions.reduce((sum, pos) => sum + pos.x, 0) / connectedPositions.length;
            const centroidY = connectedPositions.reduce((sum, pos) => sum + pos.y, 0) / connectedPositions.length;
            
            // Move slightly towards centroid
            const moveX = (centroidX - currentPos.x) * 0.1;
            const moveY = (centroidY - currentPos.y) * 0.1;
            
            if (Math.abs(moveX) > 1 || Math.abs(moveY) > 1) {
              currentPos.x += moveX;
              currentPos.y += moveY;
              improved = true;
            }
          }
        }
      });
      
      if (!improved) break;
    }
  }

  /**
   * Helper methods
   */
  private getNodeWidth(nodeId: string, nodes: LayoutNode[]): number {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.dimensions.width : 100;
  }

  private getNodeHeight(nodeId: string, nodes: LayoutNode[]): number {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.dimensions.height : 60;
  }

  private getMaxNodeHeight(nodeIds: string[], nodes: LayoutNode[]): number {
    return Math.max(...nodeIds.map(id => this.getNodeHeight(id, nodes)));
  }
}

// Singleton instance
export const layoutOptimizer = new LayoutOptimizer();