/**
 * AI Layout Optimizer for PineGenie Strategy Builder
 * 
 * This module provides intelligent layout optimization algorithms that work
 * with existing canvas and positioning systems without modifying core files.
 * 
 * SAFE INTEGRATION: Uses existing positioning utilities without modification
 * PROTECTION: No changes to existing canvas or layout files
 * 
 * Requirements: 1.2, 3.1, 7.1
 */

import { Point, CanvasState, NodeDimensions, DEFAULT_NODE_DIMENSIONS } from '../../../app/builder/utils/coordinate-system';
import { 
  getViewportBounds, 
  calculateOptimalNodePosition,
  ensureNodeWithinBounds,
  ExistingNode,
  NodePositionConfig,
  DEFAULT_POSITION_CONFIG
} from '../../../app/builder/utils/node-positioning';

import { BuilderNode } from '../../../app/builder/builder-state';

export interface LayoutOptimizationConfig extends NodePositionConfig {
  /** Optimization algorithms to use */
  algorithms: {
    forceDirected: boolean;
    hierarchical: boolean;
    circular: boolean;
    grid: boolean;
  };
  /** Optimization parameters */
  optimization: {
    maxIterations: number;
    convergenceThreshold: number;
    coolingRate: number;
    initialTemperature: number;
  };
  /** Layout preferences */
  preferences: {
    minimizeOverlaps: boolean;
    minimizeCrossings: boolean;
    maximizeSymmetry: boolean;
    preserveAspectRatio: boolean;
  };
}

export interface LayoutOptimizationResult {
  success: boolean;
  optimizedPositions: Map<string, Point>;
  improvements: LayoutImprovement[];
  metrics: LayoutMetrics;
  iterations: number;
  convergenceReached: boolean;
}

export interface LayoutImprovement {
  nodeId: string;
  oldPosition: Point;
  newPosition: Point;
  improvementType: 'overlap-reduction' | 'crossing-reduction' | 'symmetry-improvement' | 'spacing-optimization';
  improvementScore: number;
  reasoning: string;
}

export interface LayoutMetrics {
  totalOverlaps: number;
  totalCrossings: number;
  averageSpacing: number;
  symmetryScore: number;
  aspectRatio: number;
  compactness: number;
  readabilityScore: number;
}

/**
 * Default layout optimization configuration
 */
export const DEFAULT_LAYOUT_OPTIMIZATION_CONFIG: LayoutOptimizationConfig = {
  ...DEFAULT_POSITION_CONFIG,
  algorithms: {
    forceDirected: true,
    hierarchical: true,
    circular: false,
    grid: true
  },
  optimization: {
    maxIterations: 100,
    convergenceThreshold: 0.01,
    coolingRate: 0.95,
    initialTemperature: 100
  },
  preferences: {
    minimizeOverlaps: true,
    minimizeCrossings: true,
    maximizeSymmetry: false,
    preserveAspectRatio: true
  }
};

/**
 * AI Layout Optimizer Class
 * 
 * Provides intelligent layout optimization using existing positioning utilities
 * without modifying core canvas or layout files.
 */
export class AILayoutOptimizer {
  private config: LayoutOptimizationConfig;

  constructor(config: LayoutOptimizationConfig = DEFAULT_LAYOUT_OPTIMIZATION_CONFIG) {
    this.config = config;
  }

  /**
   * Optimize layout of existing nodes
   * 
   * SAFE INTEGRATION: Uses existing positioning utilities
   */
  async optimizeLayout(
    nodes: BuilderNode[],
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    connections: Array<{ source: string; target: string }> = []
  ): Promise<LayoutOptimizationResult> {
    if (nodes.length === 0) {
      return this.createEmptyResult();
    }

    // Convert nodes to optimization format
    const optimizationNodes = this.convertNodesToOptimizationFormat(nodes);
    
    // Calculate initial metrics
    const initialMetrics = this.calculateLayoutMetrics(optimizationNodes, connections);
    
    // Run optimization algorithms
    let bestPositions = new Map<string, Point>();
    let bestMetrics = initialMetrics;
    let totalIterations = 0;
    let convergenceReached = false;

    // Try different optimization algorithms
    if (this.config.algorithms.forceDirected) {
      const forceResult = await this.runForceDirectedOptimization(
        optimizationNodes,
        connections,
        canvasElement,
        canvasState
      );
      
      if (this.isLayoutBetter(forceResult.metrics, bestMetrics)) {
        bestPositions = forceResult.positions;
        bestMetrics = forceResult.metrics;
      }
      
      totalIterations += forceResult.iterations;
      convergenceReached = convergenceReached || forceResult.converged;
    }

    if (this.config.algorithms.hierarchical) {
      const hierarchicalResult = await this.runHierarchicalOptimization(
        optimizationNodes,
        connections,
        canvasElement,
        canvasState
      );
      
      if (this.isLayoutBetter(hierarchicalResult.metrics, bestMetrics)) {
        bestPositions = hierarchicalResult.positions;
        bestMetrics = hierarchicalResult.metrics;
      }
      
      totalIterations += hierarchicalResult.iterations;
    }

    if (this.config.algorithms.grid) {
      const gridResult = await this.runGridOptimization(
        optimizationNodes,
        canvasElement,
        canvasState
      );
      
      if (this.isLayoutBetter(gridResult.metrics, bestMetrics)) {
        bestPositions = gridResult.positions;
        bestMetrics = gridResult.metrics;
      }
    }

    // Calculate improvements
    const improvements = this.calculateImprovements(
      optimizationNodes,
      bestPositions,
      initialMetrics,
      bestMetrics
    );

    return {
      success: bestPositions.size > 0,
      optimizedPositions: bestPositions,
      improvements,
      metrics: bestMetrics,
      iterations: totalIterations,
      convergenceReached
    };
  }

  /**
   * Optimize layout for specific strategy type
   */
  async optimizeForStrategyType(
    nodes: BuilderNode[],
    strategyType: 'trend-following' | 'mean-reversion' | 'breakout' | 'scalping' | 'custom',
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    connections: Array<{ source: string; target: string }> = []
  ): Promise<LayoutOptimizationResult> {
    // Adjust configuration based on strategy type
    const strategyConfig = this.getStrategySpecificConfig(strategyType);
    const originalConfig = this.config;
    
    try {
      this.config = { ...this.config, ...strategyConfig };
      return await this.optimizeLayout(nodes, canvasElement, canvasState, connections);
    } finally {
      this.config = originalConfig;
    }
  }

  /**
   * Run force-directed optimization algorithm
   */
  private async runForceDirectedOptimization(
    nodes: OptimizationNode[],
    connections: Array<{ source: string; target: string }>,
    canvasElement: HTMLElement,
    canvasState: CanvasState
  ): Promise<{
    positions: Map<string, Point>;
    metrics: LayoutMetrics;
    iterations: number;
    converged: boolean;
  }> {
    const positions = new Map<string, Point>();
    nodes.forEach(node => positions.set(node.id, { ...node.position }));

    let temperature = this.config.optimization.initialTemperature;
    let converged = false;
    let iteration = 0;

    const viewport = getViewportBounds(canvasElement, canvasState);

    for (iteration = 0; iteration < this.config.optimization.maxIterations && !converged; iteration++) {
      const forces = new Map<string, { x: number; y: number }>();
      
      // Initialize forces
      nodes.forEach(node => {
        forces.set(node.id, { x: 0, y: 0 });
      });

      // Calculate repulsive forces between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          const pos1 = positions.get(node1.id)!;
          const pos2 = positions.get(node2.id)!;

          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const repulsiveForce = (this.config.nodeSpacing * this.config.nodeSpacing) / distance;
          const fx = (dx / distance) * repulsiveForce;
          const fy = (dy / distance) * repulsiveForce;

          const force1 = forces.get(node1.id)!;
          const force2 = forces.get(node2.id)!;

          force1.x -= fx;
          force1.y -= fy;
          force2.x += fx;
          force2.y += fy;
        }
      }

      // Calculate attractive forces for connected nodes
      connections.forEach(connection => {
        const pos1 = positions.get(connection.source);
        const pos2 = positions.get(connection.target);

        if (pos1 && pos2) {
          const dx = pos2.x - pos1.x;
          const dy = pos2.y - pos1.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;

          const attractiveForce = distance / (this.config.nodeSpacing * 2);
          const fx = (dx / distance) * attractiveForce;
          const fy = (dy / distance) * attractiveForce;

          const force1 = forces.get(connection.source);
          const force2 = forces.get(connection.target);

          if (force1) {
            force1.x += fx;
            force1.y += fy;
          }
          if (force2) {
            force2.x -= fx;
            force2.y -= fy;
          }
        }
      });

      // Apply forces with temperature cooling
      let maxDisplacement = 0;
      
      nodes.forEach(node => {
        const force = forces.get(node.id)!;
        const currentPos = positions.get(node.id)!;

        const displacement = Math.sqrt(force.x * force.x + force.y * force.y);
        maxDisplacement = Math.max(maxDisplacement, displacement);

        if (displacement > 0) {
          const limitedDisplacement = Math.min(displacement, temperature);
          const newPos = {
            x: currentPos.x + (force.x / displacement) * limitedDisplacement,
            y: currentPos.y + (force.y / displacement) * limitedDisplacement
          };

          // Ensure position stays within bounds
          const boundedPos = ensureNodeWithinBounds(
            newPos,
            canvasElement,
            canvasState,
            node.dimensions,
            this.config
          );

          positions.set(node.id, boundedPos);
        }
      });

      // Cool down temperature
      temperature *= this.config.optimization.coolingRate;

      // Check for convergence
      if (maxDisplacement < this.config.optimization.convergenceThreshold) {
        converged = true;
      }
    }

    const optimizedNodes = nodes.map(node => ({
      ...node,
      position: positions.get(node.id)!
    }));

    const metrics = this.calculateLayoutMetrics(optimizedNodes, connections);

    return {
      positions,
      metrics,
      iterations: iteration,
      converged
    };
  }

  /**
   * Run hierarchical optimization algorithm
   */
  private async runHierarchicalOptimization(
    nodes: OptimizationNode[],
    connections: Array<{ source: string; target: string }>,
    canvasElement: HTMLElement,
    canvasState: CanvasState
  ): Promise<{
    positions: Map<string, Point>;
    metrics: LayoutMetrics;
    iterations: number;
  }> {
    const positions = new Map<string, Point>();
    const viewport = getViewportBounds(canvasElement, canvasState);

    // Group nodes into layers based on connections
    const layers = this.calculateNodeLayers(nodes, connections);
    
    // Position nodes layer by layer
    const layerHeight = (viewport.height - this.config.edgeMargin * 2) / layers.length;
    
    layers.forEach((layerNodes, layerIndex) => {
      const y = viewport.y + this.config.edgeMargin + (layerIndex * layerHeight);
      const layerWidth = viewport.width - this.config.edgeMargin * 2;
      const nodeSpacing = layerWidth / (layerNodes.length + 1);

      layerNodes.forEach((node, nodeIndex) => {
        const x = viewport.x + this.config.edgeMargin + ((nodeIndex + 1) * nodeSpacing) - (node.dimensions.width / 2);
        
        const position = ensureNodeWithinBounds(
          { x, y },
          canvasElement,
          canvasState,
          node.dimensions,
          this.config
        );

        positions.set(node.id, position);
      });
    });

    const optimizedNodes = nodes.map(node => ({
      ...node,
      position: positions.get(node.id)!
    }));

    const metrics = this.calculateLayoutMetrics(optimizedNodes, connections);

    return {
      positions,
      metrics,
      iterations: 1
    };
  }

  /**
   * Run grid optimization algorithm
   */
  private async runGridOptimization(
    nodes: OptimizationNode[],
    canvasElement: HTMLElement,
    canvasState: CanvasState
  ): Promise<{
    positions: Map<string, Point>;
    metrics: LayoutMetrics;
  }> {
    const positions = new Map<string, Point>();
    const viewport = getViewportBounds(canvasElement, canvasState);

    // Calculate grid dimensions
    const cols = Math.ceil(Math.sqrt(nodes.length));
    const rows = Math.ceil(nodes.length / cols);

    const cellWidth = (viewport.width - this.config.edgeMargin * 2) / cols;
    const cellHeight = (viewport.height - this.config.edgeMargin * 2) / rows;

    nodes.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      const x = viewport.x + this.config.edgeMargin + (col * cellWidth) + (cellWidth - node.dimensions.width) / 2;
      const y = viewport.y + this.config.edgeMargin + (row * cellHeight) + (cellHeight - node.dimensions.height) / 2;

      const position = ensureNodeWithinBounds(
        { x, y },
        canvasElement,
        canvasState,
        node.dimensions,
        this.config
      );

      positions.set(node.id, position);
    });

    const optimizedNodes = nodes.map(node => ({
      ...node,
      position: positions.get(node.id)!
    }));

    const metrics = this.calculateLayoutMetrics(optimizedNodes, []);

    return {
      positions,
      metrics
    };
  }

  /**
   * Calculate node layers for hierarchical layout
   */
  private calculateNodeLayers(
    nodes: OptimizationNode[],
    connections: Array<{ source: string; target: string }>
  ): OptimizationNode[][] {
    const layers: OptimizationNode[][] = [];
    const nodeToLayer = new Map<string, number>();
    const visited = new Set<string>();

    // Find root nodes (nodes with no incoming connections)
    const hasIncoming = new Set<string>();
    connections.forEach(conn => hasIncoming.add(conn.target));
    
    const rootNodes = nodes.filter(node => !hasIncoming.has(node.id));
    
    // If no clear roots, use all nodes as roots
    if (rootNodes.length === 0) {
      rootNodes.push(...nodes);
    }

    // Assign layers using BFS
    const queue = rootNodes.map(node => ({ node, layer: 0 }));
    
    while (queue.length > 0) {
      const { node, layer } = queue.shift()!;
      
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      // Ensure layer array exists
      while (layers.length <= layer) {
        layers.push([]);
      }

      layers[layer].push(node);
      nodeToLayer.set(node.id, layer);

      // Add connected nodes to next layer
      connections
        .filter(conn => conn.source === node.id)
        .forEach(conn => {
          const targetNode = nodes.find(n => n.id === conn.target);
          if (targetNode && !visited.has(targetNode.id)) {
            queue.push({ node: targetNode, layer: layer + 1 });
          }
        });
    }

    // Add any remaining unvisited nodes to the last layer
    const unvisited = nodes.filter(node => !visited.has(node.id));
    if (unvisited.length > 0) {
      if (layers.length === 0) {
        layers.push([]);
      }
      layers[layers.length - 1].push(...unvisited);
    }

    return layers;
  }

  /**
   * Calculate layout metrics
   */
  private calculateLayoutMetrics(
    nodes: OptimizationNode[],
    connections: Array<{ source: string; target: string }>
  ): LayoutMetrics {
    let totalOverlaps = 0;
    let totalCrossings = 0;
    let totalSpacing = 0;
    let spacingCount = 0;

    // Calculate overlaps and spacing
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];

        const dx = Math.abs(node2.position.x - node1.position.x);
        const dy = Math.abs(node2.position.y - node1.position.y);

        const minDistanceX = (node1.dimensions.width + node2.dimensions.width) / 2;
        const minDistanceY = (node1.dimensions.height + node2.dimensions.height) / 2;

        // Check for overlap
        if (dx < minDistanceX && dy < minDistanceY) {
          totalOverlaps++;
        }

        // Calculate spacing
        const distance = Math.sqrt(dx * dx + dy * dy);
        totalSpacing += distance;
        spacingCount++;
      }
    }

    // Calculate crossings (simplified)
    for (let i = 0; i < connections.length; i++) {
      for (let j = i + 1; j < connections.length; j++) {
        if (this.doConnectionsCross(connections[i], connections[j], nodes)) {
          totalCrossings++;
        }
      }
    }

    const averageSpacing = spacingCount > 0 ? totalSpacing / spacingCount : 0;

    // Calculate bounding box for aspect ratio and compactness
    const bounds = this.calculateBoundingBox(nodes);
    const aspectRatio = bounds.width / bounds.height;
    const totalArea = bounds.width * bounds.height;
    const nodeArea = nodes.reduce((sum, node) => 
      sum + node.dimensions.width * node.dimensions.height, 0
    );
    const compactness = nodeArea / totalArea;

    // Simple readability score based on overlaps and crossings
    const readabilityScore = Math.max(0, 100 - (totalOverlaps * 10) - (totalCrossings * 5));

    return {
      totalOverlaps,
      totalCrossings,
      averageSpacing,
      symmetryScore: this.calculateSymmetryScore(nodes),
      aspectRatio,
      compactness,
      readabilityScore
    };
  }

  /**
   * Check if two connections cross
   */
  private doConnectionsCross(
    conn1: { source: string; target: string },
    conn2: { source: string; target: string },
    nodes: OptimizationNode[]
  ): boolean {
    const node1a = nodes.find(n => n.id === conn1.source);
    const node1b = nodes.find(n => n.id === conn1.target);
    const node2a = nodes.find(n => n.id === conn2.source);
    const node2b = nodes.find(n => n.id === conn2.target);

    if (!node1a || !node1b || !node2a || !node2b) return false;

    // Simplified line intersection check
    return this.doLinesIntersect(
      node1a.position, node1b.position,
      node2a.position, node2b.position
    );
  }

  /**
   * Check if two lines intersect
   */
  private doLinesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
    if (Math.abs(denom) < 1e-10) return false; // Lines are parallel

    const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
    const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  /**
   * Calculate bounding box of nodes
   */
  private calculateBoundingBox(nodes: OptimizationNode[]): {
    x: number; y: number; width: number; height: number;
  } {
    if (nodes.length === 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.dimensions.width);
      maxY = Math.max(maxY, node.position.y + node.dimensions.height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  /**
   * Calculate symmetry score
   */
  private calculateSymmetryScore(nodes: OptimizationNode[]): number {
    if (nodes.length < 2) return 100;

    const bounds = this.calculateBoundingBox(nodes);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    let symmetryScore = 0;
    let comparisons = 0;

    // Check horizontal symmetry
    nodes.forEach(node => {
      const mirrorX = centerX + (centerX - (node.position.x + node.dimensions.width / 2));
      const mirrorY = node.position.y + node.dimensions.height / 2;

      const closestNode = this.findClosestNode(nodes, { x: mirrorX, y: mirrorY }, node.id);
      if (closestNode) {
        const distance = Math.sqrt(
          Math.pow(mirrorX - (closestNode.position.x + closestNode.dimensions.width / 2), 2) +
          Math.pow(mirrorY - (closestNode.position.y + closestNode.dimensions.height / 2), 2)
        );
        
        const maxDistance = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height);
        const similarity = Math.max(0, 1 - (distance / maxDistance));
        symmetryScore += similarity;
      }
      comparisons++;
    });

    return comparisons > 0 ? (symmetryScore / comparisons) * 100 : 0;
  }

  /**
   * Find closest node to a point
   */
  private findClosestNode(
    nodes: OptimizationNode[],
    point: Point,
    excludeId: string
  ): OptimizationNode | null {
    let closest: OptimizationNode | null = null;
    let minDistance = Infinity;

    nodes.forEach(node => {
      if (node.id === excludeId) return;

      const nodeCenter = {
        x: node.position.x + node.dimensions.width / 2,
        y: node.position.y + node.dimensions.height / 2
      };

      const distance = Math.sqrt(
        Math.pow(point.x - nodeCenter.x, 2) + Math.pow(point.y - nodeCenter.y, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = node;
      }
    });

    return closest;
  }

  /**
   * Convert builder nodes to optimization format
   */
  private convertNodesToOptimizationFormat(nodes: BuilderNode[]): OptimizationNode[] {
    return nodes.map(node => ({
      id: node.id,
      position: node.position,
      dimensions: {
        width: node.width || DEFAULT_NODE_DIMENSIONS.width,
        height: node.height || DEFAULT_NODE_DIMENSIONS.height
      },
      type: node.type
    }));
  }

  /**
   * Check if one layout is better than another
   */
  private isLayoutBetter(metrics1: LayoutMetrics, metrics2: LayoutMetrics): boolean {
    // Weighted scoring system
    const score1 = this.calculateLayoutScore(metrics1);
    const score2 = this.calculateLayoutScore(metrics2);
    
    return score1 > score2;
  }

  /**
   * Calculate overall layout score
   */
  private calculateLayoutScore(metrics: LayoutMetrics): number {
    const weights = {
      overlaps: -10,      // Negative because fewer overlaps is better
      crossings: -5,      // Negative because fewer crossings is better
      spacing: 0.1,       // Positive because more spacing is generally better
      symmetry: 0.2,      // Positive because more symmetry is better
      compactness: 0.3,   // Positive because more compactness is better
      readability: 1      // Positive because higher readability is better
    };

    return (
      metrics.totalOverlaps * weights.overlaps +
      metrics.totalCrossings * weights.crossings +
      metrics.averageSpacing * weights.spacing +
      metrics.symmetryScore * weights.symmetry +
      metrics.compactness * weights.compactness +
      metrics.readabilityScore * weights.readability
    );
  }

  /**
   * Calculate improvements between layouts
   */
  private calculateImprovements(
    originalNodes: OptimizationNode[],
    optimizedPositions: Map<string, Point>,
    originalMetrics: LayoutMetrics,
    optimizedMetrics: LayoutMetrics
  ): LayoutImprovement[] {
    const improvements: LayoutImprovement[] = [];

    originalNodes.forEach(node => {
      const newPosition = optimizedPositions.get(node.id);
      if (!newPosition) return;

      const oldPosition = node.position;
      const distance = Math.sqrt(
        Math.pow(newPosition.x - oldPosition.x, 2) + 
        Math.pow(newPosition.y - oldPosition.y, 2)
      );

      if (distance > 5) { // Only consider significant movements
        let improvementType: LayoutImprovement['improvementType'] = 'spacing-optimization';
        let reasoning = 'Optimized node position for better layout';

        // Determine improvement type based on metrics changes
        if (optimizedMetrics.totalOverlaps < originalMetrics.totalOverlaps) {
          improvementType = 'overlap-reduction';
          reasoning = 'Moved to reduce node overlaps';
        } else if (optimizedMetrics.totalCrossings < originalMetrics.totalCrossings) {
          improvementType = 'crossing-reduction';
          reasoning = 'Repositioned to minimize connection crossings';
        } else if (optimizedMetrics.symmetryScore > originalMetrics.symmetryScore) {
          improvementType = 'symmetry-improvement';
          reasoning = 'Adjusted position to improve layout symmetry';
        }

        improvements.push({
          nodeId: node.id,
          oldPosition,
          newPosition,
          improvementType,
          improvementScore: distance,
          reasoning
        });
      }
    });

    return improvements;
  }

  /**
   * Get strategy-specific configuration
   */
  private getStrategySpecificConfig(
    strategyType: 'trend-following' | 'mean-reversion' | 'breakout' | 'scalping' | 'custom'
  ): Partial<LayoutOptimizationConfig> {
    const configs: Record<string, Partial<LayoutOptimizationConfig>> = {
      'trend-following': {
        algorithms: { forceDirected: true, hierarchical: true, circular: false, grid: false },
        preferences: { minimizeOverlaps: true, minimizeCrossings: true, maximizeSymmetry: false, preserveAspectRatio: true }
      },
      'mean-reversion': {
        algorithms: { forceDirected: true, hierarchical: false, circular: true, grid: false },
        preferences: { minimizeOverlaps: true, minimizeCrossings: false, maximizeSymmetry: true, preserveAspectRatio: false }
      },
      'breakout': {
        algorithms: { forceDirected: true, hierarchical: true, circular: false, grid: false },
        preferences: { minimizeOverlaps: true, minimizeCrossings: true, maximizeSymmetry: false, preserveAspectRatio: true }
      },
      'scalping': {
        algorithms: { forceDirected: false, hierarchical: false, circular: false, grid: true },
        preferences: { minimizeOverlaps: true, minimizeCrossings: false, maximizeSymmetry: false, preserveAspectRatio: true }
      },
      'custom': {
        algorithms: { forceDirected: true, hierarchical: true, circular: false, grid: true },
        preferences: { minimizeOverlaps: true, minimizeCrossings: true, maximizeSymmetry: false, preserveAspectRatio: true }
      }
    };

    return configs[strategyType] || configs.custom;
  }

  /**
   * Create empty result
   */
  private createEmptyResult(): LayoutOptimizationResult {
    return {
      success: false,
      optimizedPositions: new Map(),
      improvements: [],
      metrics: {
        totalOverlaps: 0,
        totalCrossings: 0,
        averageSpacing: 0,
        symmetryScore: 0,
        aspectRatio: 1,
        compactness: 0,
        readabilityScore: 0
      },
      iterations: 0,
      convergenceReached: false
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LayoutOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): LayoutOptimizationConfig {
    return { ...this.config };
  }
}

/**
 * Optimization node interface
 */
interface OptimizationNode {
  id: string;
  position: Point;
  dimensions: NodeDimensions;
  type: string;
}

/**
 * Create a singleton AI layout optimizer instance
 */
let aiLayoutOptimizerInstance: AILayoutOptimizer | null = null;

export function getAILayoutOptimizer(): AILayoutOptimizer {
  if (!aiLayoutOptimizerInstance) {
    aiLayoutOptimizerInstance = new AILayoutOptimizer();
  }
  return aiLayoutOptimizerInstance;
}

/**
 * Reset the AI layout optimizer instance (for testing)
 */
export function resetAILayoutOptimizer(): void {
  aiLayoutOptimizerInstance = null;
}

/**
 * Utility functions for layout optimization
 */
export const LayoutOptimizationUtils = {
  /**
   * Compare two layout metrics
   */
  compareMetrics(metrics1: LayoutMetrics, metrics2: LayoutMetrics): {
    better: 'first' | 'second' | 'equal';
    improvements: string[];
    regressions: string[];
  } {
    const improvements: string[] = [];
    const regressions: string[] = [];

    if (metrics1.totalOverlaps < metrics2.totalOverlaps) {
      improvements.push(`Reduced overlaps by ${metrics2.totalOverlaps - metrics1.totalOverlaps}`);
    } else if (metrics1.totalOverlaps > metrics2.totalOverlaps) {
      regressions.push(`Increased overlaps by ${metrics1.totalOverlaps - metrics2.totalOverlaps}`);
    }

    if (metrics1.totalCrossings < metrics2.totalCrossings) {
      improvements.push(`Reduced crossings by ${metrics2.totalCrossings - metrics1.totalCrossings}`);
    } else if (metrics1.totalCrossings > metrics2.totalCrossings) {
      regressions.push(`Increased crossings by ${metrics1.totalCrossings - metrics2.totalCrossings}`);
    }

    if (metrics1.readabilityScore > metrics2.readabilityScore) {
      improvements.push(`Improved readability by ${(metrics1.readabilityScore - metrics2.readabilityScore).toFixed(1)} points`);
    } else if (metrics1.readabilityScore < metrics2.readabilityScore) {
      regressions.push(`Decreased readability by ${(metrics2.readabilityScore - metrics1.readabilityScore).toFixed(1)} points`);
    }

    let better: 'first' | 'second' | 'equal' = 'equal';
    if (improvements.length > regressions.length) {
      better = 'first';
    } else if (regressions.length > improvements.length) {
      better = 'second';
    }

    return { better, improvements, regressions };
  },

  /**
   * Generate optimization report
   */
  generateOptimizationReport(result: LayoutOptimizationResult): string {
    const report = [
      `Layout Optimization Report`,
      `========================`,
      `Success: ${result.success}`,
      `Iterations: ${result.iterations}`,
      `Convergence Reached: ${result.convergenceReached}`,
      ``,
      `Metrics:`,
      `- Total Overlaps: ${result.metrics.totalOverlaps}`,
      `- Total Crossings: ${result.metrics.totalCrossings}`,
      `- Average Spacing: ${result.metrics.averageSpacing.toFixed(2)}`,
      `- Symmetry Score: ${result.metrics.symmetryScore.toFixed(2)}`,
      `- Aspect Ratio: ${result.metrics.aspectRatio.toFixed(2)}`,
      `- Compactness: ${result.metrics.compactness.toFixed(2)}`,
      `- Readability Score: ${result.metrics.readabilityScore.toFixed(2)}`,
      ``,
      `Improvements: ${result.improvements.length}`,
      ...result.improvements.map(imp => 
        `- ${imp.nodeId}: ${imp.improvementType} (${imp.reasoning})`
      )
    ];

    return report.join('\n');
  }
};