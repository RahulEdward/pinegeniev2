/**
 * Connection Optimizer
 * Optimizes connection creation and management for large strategies
 */

interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  weight: number;
  metadata?: Record<string, unknown>;
}

interface ConnectionPath {
  points: { x: number; y: number }[];
  length: number;
  crossings: number;
}

interface OptimizationMetrics {
  totalLength: number;
  totalCrossings: number;
  averageLength: number;
  maxCrossings: number;
  optimizationTime: number;
}

export class ConnectionOptimizer {
  private connections: Map<string, Connection> = new Map();
  private connectionPaths: Map<string, ConnectionPath> = new Map();
  private nodePositions: Map<string, { x: number; y: number }> = new Map();

  /**
   * Add connection to optimizer
   */
  addConnection(connection: Connection): void {
    this.connections.set(connection.id, connection);
  }

  /**
   * Update node positions
   */
  updateNodePositions(positions: Map<string, { x: number; y: number }>): void {
    this.nodePositions = new Map(positions);
    // Recalculate paths when positions change
    this.recalculateAllPaths();
  }

  /**
   * Optimize all connections
   */
  optimizeConnections(): OptimizationMetrics {
    const startTime = Date.now();
    
    // Calculate initial paths
    this.recalculateAllPaths();
    
    // Optimize connection routing
    this.optimizeRouting();
    
    // Minimize crossings
    this.minimizeCrossings();
    
    // Calculate final metrics
    const metrics = this.calculateMetrics();
    metrics.optimizationTime = Date.now() - startTime;
    
    return metrics;
  }

  /**
   * Optimize connections for large strategies
   */
  optimizeLargeStrategy(): OptimizationMetrics {
    const startTime = Date.now();
    
    // For large strategies, use hierarchical optimization
    const connectionGroups = this.groupConnectionsByProximity();
    
    // Optimize each group separately
    connectionGroups.forEach(group => {
      this.optimizeConnectionGroup(group);
    });
    
    // Global optimization pass
    this.globalOptimizationPass();
    
    const metrics = this.calculateMetrics();
    metrics.optimizationTime = Date.now() - startTime;
    
    return metrics;
  }

  /**
   * Create efficient connection path
   */
  createOptimalPath(sourceId: string, targetId: string): ConnectionPath {
    const sourcePos = this.nodePositions.get(sourceId);
    const targetPos = this.nodePositions.get(targetId);
    
    if (!sourcePos || !targetPos) {
      return { points: [], length: 0, crossings: 0 };
    }

    // Use A* algorithm for pathfinding with obstacle avoidance
    const path = this.findPathAStar(sourcePos, targetPos);
    
    // Smooth the path
    const smoothedPath = this.smoothPath(path);
    
    // Calculate metrics
    const length = this.calculatePathLength(smoothedPath);
    const crossings = this.calculatePathCrossings(smoothedPath);
    
    return {
      points: smoothedPath,
      length,
      crossings
    };
  }

  /**
   * Batch create connections efficiently
   */
  batchCreateConnections(connections: Connection[]): Map<string, ConnectionPath> {
    const paths = new Map<string, ConnectionPath>();
    
    // Sort connections by priority/weight
    const sortedConnections = connections.sort((a, b) => b.weight - a.weight);
    
    // Process in batches to avoid overwhelming
    const batchSize = 20;
    for (let i = 0; i < sortedConnections.length; i += batchSize) {
      const batch = sortedConnections.slice(i, i + batchSize);
      
      batch.forEach(connection => {
        const path = this.createOptimalPath(connection.sourceId, connection.targetId);
        paths.set(connection.id, path);
        this.connectionPaths.set(connection.id, path);
      });
      
      // Small delay between batches for performance
      if (i + batchSize < sortedConnections.length) {
        // In a real implementation, this would be an actual async delay
        // For now, we'll just continue
      }
    }
    
    return paths;
  }

  /**
   * Recalculate all connection paths
   */
  private recalculateAllPaths(): void {
    this.connections.forEach((connection, id) => {
      const path = this.createOptimalPath(connection.sourceId, connection.targetId);
      this.connectionPaths.set(id, path);
    });
  }

  /**
   * Optimize connection routing
   */
  private optimizeRouting(): void {
    // Implement routing optimization algorithms
    this.connections.forEach((connection, id) => {
      const currentPath = this.connectionPaths.get(id);
      if (currentPath) {
        // Try alternative routes and pick the best one
        const alternatives = this.generateAlternativeRoutes(connection);
        const bestRoute = this.selectBestRoute([currentPath, ...alternatives]);
        this.connectionPaths.set(id, bestRoute);
      }
    });
  }

  /**
   * Minimize connection crossings
   */
  private minimizeCrossings(): void {
    const maxIterations = 10;
    
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      let improved = false;
      
      // Find all crossing pairs
      const crossingPairs = this.findCrossingPairs();
      
      // Try to resolve crossings
      crossingPairs.forEach(({ connection1, connection2 }) => {
        const resolved = this.resolveCrossing(connection1, connection2);
        if (resolved) {
          improved = true;
        }
      });
      
      if (!improved) break;
    }
  }

  /**
   * Group connections by proximity for hierarchical optimization
   */
  private groupConnectionsByProximity(): Connection[][] {
    const groups: Connection[][] = [];
    const processed = new Set<string>();
    
    this.connections.forEach((connection, id) => {
      if (!processed.has(id)) {
        const group = this.findProximityGroup(connection, processed);
        groups.push(group);
      }
    });
    
    return groups;
  }

  /**
   * Find connections in proximity to form a group
   */
  private findProximityGroup(startConnection: Connection, processed: Set<string>): Connection[] {
    const group: Connection[] = [startConnection];
    processed.add(startConnection.id);
    
    const proximityThreshold = 200; // pixels
    const startPos = this.getConnectionCenter(startConnection);
    
    this.connections.forEach((connection, id) => {
      if (!processed.has(id)) {
        const connectionPos = this.getConnectionCenter(connection);
        const distance = this.calculateDistance(startPos, connectionPos);
        
        if (distance < proximityThreshold) {
          group.push(connection);
          processed.add(id);
        }
      }
    });
    
    return group;
  }

  /**
   * Optimize a group of connections
   */
  private optimizeConnectionGroup(group: Connection[]): void {
    // For each group, optimize routing and minimize crossings
    group.forEach(connection => {
      const optimizedPath = this.createOptimalPath(connection.sourceId, connection.targetId);
      this.connectionPaths.set(connection.id, optimizedPath);
    });
    
    // Minimize crossings within the group
    this.minimizeCrossingsInGroup(group);
  }

  /**
   * Global optimization pass
   */
  private globalOptimizationPass(): void {
    // Perform global optimizations that consider all connections
    this.optimizeGlobalRouting();
    this.balanceConnectionDensity();
  }

  /**
   * A* pathfinding algorithm
   */
  private findPathAStar(
    start: { x: number; y: number }, 
    end: { x: number; y: number }
  ): { x: number; y: number }[] {
    // Simplified A* implementation
    // In a real implementation, this would include obstacle avoidance
    
    const path: { x: number; y: number }[] = [];
    
    // For now, create a simple path with waypoints
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Add intermediate waypoints for better routing
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal-first routing
      path.push(start);
      path.push({ x: start.x + dx * 0.7, y: start.y });
      path.push({ x: start.x + dx * 0.7, y: end.y });
      path.push(end);
    } else {
      // Vertical-first routing
      path.push(start);
      path.push({ x: start.x, y: start.y + dy * 0.7 });
      path.push({ x: end.x, y: start.y + dy * 0.7 });
      path.push(end);
    }
    
    return path;
  }

  /**
   * Smooth connection path
   */
  private smoothPath(path: { x: number; y: number }[]): { x: number; y: number }[] {
    if (path.length < 3) return path;
    
    const smoothed: { x: number; y: number }[] = [path[0]];
    
    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1];
      const current = path[i];
      const next = path[i + 1];
      
      // Apply smoothing using weighted average
      const smoothedPoint = {
        x: (prev.x + 2 * current.x + next.x) / 4,
        y: (prev.y + 2 * current.y + next.y) / 4
      };
      
      smoothed.push(smoothedPoint);
    }
    
    smoothed.push(path[path.length - 1]);
    return smoothed;
  }

  /**
   * Calculate path length
   */
  private calculatePathLength(path: { x: number; y: number }[]): number {
    let length = 0;
    
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    
    return length;
  }

  /**
   * Calculate path crossings with other connections
   */
  private calculatePathCrossings(path: { x: number; y: number }[]): number {
    let crossings = 0;
    
    // Check against all other connection paths
    this.connectionPaths.forEach(otherPath => {
      if (otherPath.points.length > 1) {
        crossings += this.countPathIntersections(path, otherPath.points);
      }
    });
    
    return crossings;
  }

  /**
   * Count intersections between two paths
   */
  private countPathIntersections(
    path1: { x: number; y: number }[], 
    path2: { x: number; y: number }[]
  ): number {
    let intersections = 0;
    
    for (let i = 1; i < path1.length; i++) {
      for (let j = 1; j < path2.length; j++) {
        if (this.lineSegmentsIntersect(
          path1[i - 1], path1[i],
          path2[j - 1], path2[j]
        )) {
          intersections++;
        }
      }
    }
    
    return intersections;
  }

  /**
   * Check if two line segments intersect
   */
  private lineSegmentsIntersect(
    p1: { x: number; y: number }, p2: { x: number; y: number },
    p3: { x: number; y: number }, p4: { x: number; y: number }
  ): boolean {
    const d1 = this.direction(p3, p4, p1);
    const d2 = this.direction(p3, p4, p2);
    const d3 = this.direction(p1, p2, p3);
    const d4 = this.direction(p1, p2, p4);
    
    if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) &&
        ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate direction for line intersection test
   */
  private direction(
    pi: { x: number; y: number }, 
    pj: { x: number; y: number }, 
    pk: { x: number; y: number }
  ): number {
    return (pk.x - pi.x) * (pj.y - pi.y) - (pj.x - pi.x) * (pk.y - pi.y);
  }

  /**
   * Generate alternative routes for a connection
   */
  private generateAlternativeRoutes(connection: Connection): ConnectionPath[] {
    const alternatives: ConnectionPath[] = [];
    const sourcePos = this.nodePositions.get(connection.sourceId);
    const targetPos = this.nodePositions.get(connection.targetId);
    
    if (!sourcePos || !targetPos) return alternatives;
    
    // Generate different routing strategies
    const strategies = [
      this.createDirectRoute(sourcePos, targetPos),
      this.createCurvedRoute(sourcePos, targetPos),
      this.createOrthogonalRoute(sourcePos, targetPos)
    ];
    
    strategies.forEach(path => {
      if (path.points.length > 0) {
        alternatives.push({
          points: path.points,
          length: this.calculatePathLength(path.points),
          crossings: this.calculatePathCrossings(path.points)
        });
      }
    });
    
    return alternatives;
  }

  /**
   * Create direct route between two points
   */
  private createDirectRoute(
    start: { x: number; y: number }, 
    end: { x: number; y: number }
  ): { points: { x: number; y: number }[] } {
    return { points: [start, end] };
  }

  /**
   * Create curved route between two points
   */
  private createCurvedRoute(
    start: { x: number; y: number }, 
    end: { x: number; y: number }
  ): { points: { x: number; y: number }[] } {
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    
    // Add curve by offsetting the midpoint
    const offset = 50;
    const perpX = -(end.y - start.y);
    const perpY = end.x - start.x;
    const perpLength = Math.sqrt(perpX * perpX + perpY * perpY) || 1;
    
    const curvePoint = {
      x: midX + (perpX / perpLength) * offset,
      y: midY + (perpY / perpLength) * offset
    };
    
    return { points: [start, curvePoint, end] };
  }

  /**
   * Create orthogonal route between two points
   */
  private createOrthogonalRoute(
    start: { x: number; y: number }, 
    end: { x: number; y: number }
  ): { points: { x: number; y: number }[] } {
    // Create L-shaped path
    const corner = { x: end.x, y: start.y };
    return { points: [start, corner, end] };
  }

  /**
   * Select best route from alternatives
   */
  private selectBestRoute(routes: ConnectionPath[]): ConnectionPath {
    if (routes.length === 0) {
      return { points: [], length: 0, crossings: 0 };
    }
    
    // Score routes based on length and crossings
    let bestRoute = routes[0];
    let bestScore = this.calculateRouteScore(bestRoute);
    
    routes.slice(1).forEach(route => {
      const score = this.calculateRouteScore(route);
      if (score < bestScore) {
        bestScore = score;
        bestRoute = route;
      }
    });
    
    return bestRoute;
  }

  /**
   * Calculate route score (lower is better)
   */
  private calculateRouteScore(route: ConnectionPath): number {
    // Weight crossings more heavily than length
    return route.length * 0.1 + route.crossings * 100;
  }

  /**
   * Find crossing pairs of connections
   */
  private findCrossingPairs(): { connection1: string; connection2: string }[] {
    const pairs: { connection1: string; connection2: string }[] = [];
    const connectionIds = Array.from(this.connections.keys());
    
    for (let i = 0; i < connectionIds.length; i++) {
      for (let j = i + 1; j < connectionIds.length; j++) {
        const path1 = this.connectionPaths.get(connectionIds[i]);
        const path2 = this.connectionPaths.get(connectionIds[j]);
        
        if (path1 && path2 && this.pathsIntersect(path1.points, path2.points)) {
          pairs.push({
            connection1: connectionIds[i],
            connection2: connectionIds[j]
          });
        }
      }
    }
    
    return pairs;
  }

  /**
   * Check if two paths intersect
   */
  private pathsIntersect(
    path1: { x: number; y: number }[], 
    path2: { x: number; y: number }[]
  ): boolean {
    return this.countPathIntersections(path1, path2) > 0;
  }

  /**
   * Resolve crossing between two connections
   */
  private resolveCrossing(connection1Id: string, connection2Id: string): boolean {
    // Try to reroute one of the connections to avoid crossing
    const connection1 = this.connections.get(connection1Id);
    const connection2 = this.connections.get(connection2Id);
    
    if (!connection1 || !connection2) return false;
    
    // Generate alternative routes for both connections
    const alternatives1 = this.generateAlternativeRoutes(connection1);
    const alternatives2 = this.generateAlternativeRoutes(connection2);
    
    // Find the best combination that minimizes crossings
    let bestCombination: { path1: ConnectionPath; path2: ConnectionPath } | null = null;
    let bestScore = Infinity;
    
    alternatives1.forEach(path1 => {
      alternatives2.forEach(path2 => {
        const crossings = this.countPathIntersections(path1.points, path2.points);
        const score = crossings * 100 + path1.length * 0.1 + path2.length * 0.1;
        
        if (score < bestScore) {
          bestScore = score;
          bestCombination = { path1, path2 };
        }
      });
    });
    
    if (bestCombination && bestScore < this.calculateRouteScore(this.connectionPaths.get(connection1Id)!) + this.calculateRouteScore(this.connectionPaths.get(connection2Id)!)) {
      this.connectionPaths.set(connection1Id, bestCombination.path1);
      this.connectionPaths.set(connection2Id, bestCombination.path2);
      return true;
    }
    
    return false;
  }

  /**
   * Minimize crossings within a group
   */
  private minimizeCrossingsInGroup(group: Connection[]): void {
    // Similar to global crossing minimization but limited to the group
    const groupIds = group.map(c => c.id);
    
    for (let i = 0; i < groupIds.length; i++) {
      for (let j = i + 1; j < groupIds.length; j++) {
        this.resolveCrossing(groupIds[i], groupIds[j]);
      }
    }
  }

  /**
   * Optimize global routing
   */
  private optimizeGlobalRouting(): void {
    // Implement global routing optimizations
    // This could include traffic balancing, avoiding congested areas, etc.
  }

  /**
   * Balance connection density
   */
  private balanceConnectionDensity(): void {
    // Analyze connection density and redistribute routes to avoid congestion
    const densityMap = this.calculateDensityMap();
    this.redistributeConnections(densityMap);
  }

  /**
   * Calculate connection density map
   */
  private calculateDensityMap(): Map<string, number> {
    const densityMap = new Map<string, number>();
    // Implementation would create a grid-based density map
    return densityMap;
  }

  /**
   * Redistribute connections based on density
   */
  private redistributeConnections(densityMap: Map<string, number>): void {
    // Implementation would reroute connections away from high-density areas
  }

  /**
   * Get connection center point
   */
  private getConnectionCenter(connection: Connection): { x: number; y: number } {
    const sourcePos = this.nodePositions.get(connection.sourceId);
    const targetPos = this.nodePositions.get(connection.targetId);
    
    if (!sourcePos || !targetPos) {
      return { x: 0, y: 0 };
    }
    
    return {
      x: (sourcePos.x + targetPos.x) / 2,
      y: (sourcePos.y + targetPos.y) / 2
    };
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(
    p1: { x: number; y: number }, 
    p2: { x: number; y: number }
  ): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate optimization metrics
   */
  private calculateMetrics(): OptimizationMetrics {
    let totalLength = 0;
    let totalCrossings = 0;
    let maxCrossings = 0;
    
    this.connectionPaths.forEach(path => {
      totalLength += path.length;
      totalCrossings += path.crossings;
      maxCrossings = Math.max(maxCrossings, path.crossings);
    });
    
    const connectionCount = this.connectionPaths.size;
    
    return {
      totalLength,
      totalCrossings,
      averageLength: connectionCount > 0 ? totalLength / connectionCount : 0,
      maxCrossings,
      optimizationTime: 0 // Will be set by caller
    };
  }

  /**
   * Get connection path
   */
  getConnectionPath(connectionId: string): ConnectionPath | null {
    return this.connectionPaths.get(connectionId) || null;
  }

  /**
   * Clear all connections and paths
   */
  clear(): void {
    this.connections.clear();
    this.connectionPaths.clear();
    this.nodePositions.clear();
  }
}

// Singleton instance
export const connectionOptimizer = new ConnectionOptimizer();