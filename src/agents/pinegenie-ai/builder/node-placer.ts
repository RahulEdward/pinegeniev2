/**
 * AI-Enhanced Node Placement System for PineGenie Strategy Builder
 * 
 * This module provides intelligent node placement algorithms that work with
 * the existing builder system without modifying core files. It uses the
 * existing node positioning utilities and coordinate system.
 * 
 * SAFE INTEGRATION: Uses existing APIs without modification
 * PROTECTION: No changes to existing positioning or canvas files
 * 
 * Requirements: 1.2, 3.1, 7.1
 */

import { 
  Point, 
  CanvasState, 
  NodeDimensions, 
  DEFAULT_NODE_DIMENSIONS 
} from '../../../app/builder/utils/coordinate-system';

import {
  calculateOptimalNodePosition,
  calculateMultipleNodePositions,
  ensureNodeWithinBounds,
  getViewportBounds,
  NodePositionConfig,
  DEFAULT_POSITION_CONFIG,
  ExistingNode
} from '../../../app/builder/utils/node-positioning';

import { BuilderNode } from '../../../app/builder/builder-state';
import { StrategyBlueprint, StrategyComponent } from '../types/strategy-types';

export interface AINodePlacementConfig extends NodePositionConfig {
  /** Strategy-specific spacing for different node types */
  strategySpacing: {
    dataSource: { x: number; y: number };
    indicator: { x: number; y: number };
    condition: { x: number; y: number };
    action: { x: number; y: number };
    risk: { x: number; y: number };
  };
  /** Animation timing for node placement */
  animationTiming: {
    delayBetweenNodes: number;
    placementDuration: number;
    connectionDelay: number;
  };
  /** Layout patterns for different strategy types */
  layoutPatterns: {
    'trend-following': 'linear' | 'hierarchical' | 'circular';
    'mean-reversion': 'linear' | 'hierarchical' | 'circular';
    'breakout': 'linear' | 'hierarchical' | 'circular';
    'scalping': 'linear' | 'hierarchical' | 'circular';
    'custom': 'linear' | 'hierarchical' | 'circular';
  };
}

export interface NodePlacementResult {
  success: boolean;
  placements: NodePlacement[];
  errors: string[];
  warnings: string[];
  totalDuration: number;
}

export interface NodePlacement {
  nodeId: string;
  position: Point;
  animationDelay: number;
  reasoning: string;
  confidence: number;
}

export interface LayoutStrategy {
  name: string;
  description: string;
  calculatePositions: (
    components: StrategyComponent[],
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: ExistingNode[],
    config: AINodePlacementConfig
  ) => NodePlacement[];
}

/**
 * Default AI node placement configuration
 */
export const DEFAULT_AI_PLACEMENT_CONFIG: AINodePlacementConfig = {
  ...DEFAULT_POSITION_CONFIG,
  strategySpacing: {
    dataSource: { x: 200, y: 100 },
    indicator: { x: 180, y: 120 },
    condition: { x: 160, y: 140 },
    action: { x: 140, y: 160 },
    risk: { x: 120, y: 180 }
  },
  animationTiming: {
    delayBetweenNodes: 300,
    placementDuration: 500,
    connectionDelay: 200
  },
  layoutPatterns: {
    'trend-following': 'linear',
    'mean-reversion': 'hierarchical',
    'breakout': 'linear',
    'scalping': 'circular',
    'custom': 'hierarchical'
  }
};

/**
 * AI-Enhanced Node Placer Class
 * 
 * Provides intelligent node placement using existing positioning utilities
 * without modifying core builder files.
 */
export class AINodePlacer {
  private config: AINodePlacementConfig;
  private layoutStrategies: Map<string, LayoutStrategy>;

  constructor(config: AINodePlacementConfig = DEFAULT_AI_PLACEMENT_CONFIG) {
    this.config = config;
    this.layoutStrategies = new Map();
    this.initializeLayoutStrategies();
  }

  /**
   * Place nodes for a complete strategy blueprint
   * 
   * SAFE INTEGRATION: Uses existing calculateOptimalNodePosition without modification
   */
  async placeStrategyNodes(
    blueprint: StrategyBlueprint,
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: BuilderNode[]
  ): Promise<NodePlacementResult> {
    try {
      // Convert existing nodes to the format expected by positioning utilities
      const existingNodePositions: ExistingNode[] = existingNodes.map(node => ({
        id: node.id,
        position: node.position,
        dimensions: {
          width: node.width || DEFAULT_NODE_DIMENSIONS.width,
          height: node.height || DEFAULT_NODE_DIMENSIONS.height
        }
      }));

      // Get the appropriate layout strategy
      const layoutPattern = this.config.layoutPatterns[blueprint.strategyType] || 'hierarchical';
      const layoutStrategy = this.layoutStrategies.get(layoutPattern);

      if (!layoutStrategy) {
        throw new Error(`Layout strategy '${layoutPattern}' not found`);
      }

      // Calculate positions using the selected layout strategy
      const placements = layoutStrategy.calculatePositions(
        blueprint.components,
        canvasElement,
        canvasState,
        existingNodePositions,
        this.config
      );

      // Validate all placements
      const validatedPlacements = this.validatePlacements(
        placements,
        canvasElement,
        canvasState,
        existingNodePositions
      );

      // Calculate total animation duration
      const totalDuration = this.calculateTotalAnimationDuration(validatedPlacements);

      return {
        success: true,
        placements: validatedPlacements,
        errors: [],
        warnings: [],
        totalDuration
      };

    } catch (error) {
      return {
        success: false,
        placements: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
        totalDuration: 0
      };
    }
  }

  /**
   * Place a single node intelligently
   * 
   * SAFE INTEGRATION: Uses existing calculateOptimalNodePosition
   */
  placeSingleNode(
    component: StrategyComponent,
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: ExistingNode[],
    preferredPosition?: Point
  ): NodePlacement {
    const nodeDimensions = this.getNodeDimensions(component.type);
    
    let position: Point;
    let reasoning: string;
    let confidence: number;

    if (preferredPosition) {
      // Try to use preferred position, but ensure it's within bounds
      position = ensureNodeWithinBounds(
        preferredPosition,
        canvasElement,
        canvasState,
        nodeDimensions,
        this.config
      );
      reasoning = 'Placed at preferred position with bounds adjustment';
      confidence = 0.9;
    } else {
      // Use existing optimal positioning algorithm
      position = calculateOptimalNodePosition(
        canvasElement,
        canvasState,
        existingNodes,
        nodeDimensions,
        this.config
      );
      reasoning = 'Calculated optimal position using AI placement algorithm';
      confidence = 0.8;
    }

    return {
      nodeId: component.id || `node_${Date.now()}`,
      position,
      animationDelay: 0,
      reasoning,
      confidence
    };
  }

  /**
   * Place multiple related nodes with intelligent spacing
   * 
   * SAFE INTEGRATION: Uses existing calculateMultipleNodePositions
   */
  placeRelatedNodes(
    components: StrategyComponent[],
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: ExistingNode[],
    relationshipType: 'sequential' | 'parallel' | 'hierarchical' = 'sequential'
  ): NodePlacement[] {
    if (components.length === 0) return [];

    const nodeDimensions = DEFAULT_NODE_DIMENSIONS;
    
    // Calculate positions using existing utility
    const positions = calculateMultipleNodePositions(
      components.length,
      canvasElement,
      canvasState,
      existingNodes,
      nodeDimensions,
      this.config
    );

    // Apply relationship-specific adjustments
    const adjustedPositions = this.adjustPositionsForRelationship(
      positions,
      relationshipType,
      canvasElement,
      canvasState
    );

    // Create placements with animation timing
    return components.map((component, index) => ({
      nodeId: component.id || `node_${Date.now()}_${index}`,
      position: adjustedPositions[index] || positions[index],
      animationDelay: index * this.config.animationTiming.delayBetweenNodes,
      reasoning: `Placed as part of ${relationshipType} relationship group`,
      confidence: 0.85
    }));
  }

  /**
   * Optimize existing node layout
   * 
   * SAFE INTEGRATION: Uses existing positioning utilities for optimization
   */
  optimizeNodeLayout(
    nodes: BuilderNode[],
    canvasElement: HTMLElement,
    canvasState: CanvasState
  ): NodePlacement[] {
    const existingNodes: ExistingNode[] = nodes.map(node => ({
      id: node.id,
      position: node.position,
      dimensions: {
        width: node.width || DEFAULT_NODE_DIMENSIONS.width,
        height: node.height || DEFAULT_NODE_DIMENSIONS.height
      }
    }));

    // Analyze current layout for optimization opportunities
    const optimizations = this.analyzeLayoutOptimizations(existingNodes, canvasElement, canvasState);

    // Apply optimizations
    return optimizations.map((optimization, index) => ({
      nodeId: optimization.nodeId,
      position: optimization.newPosition,
      animationDelay: index * 100, // Stagger optimization animations
      reasoning: optimization.reason,
      confidence: optimization.confidence
    }));
  }

  /**
   * Initialize layout strategies
   */
  private initializeLayoutStrategies(): void {
    // Linear layout strategy
    this.layoutStrategies.set('linear', {
      name: 'Linear Layout',
      description: 'Places nodes in a linear flow from left to right',
      calculatePositions: (components, canvasElement, canvasState, existingNodes, config) => {
        return this.calculateLinearLayout(components, canvasElement, canvasState, existingNodes, config);
      }
    });

    // Hierarchical layout strategy
    this.layoutStrategies.set('hierarchical', {
      name: 'Hierarchical Layout',
      description: 'Places nodes in a hierarchical tree structure',
      calculatePositions: (components, canvasElement, canvasState, existingNodes, config) => {
        return this.calculateHierarchicalLayout(components, canvasElement, canvasState, existingNodes, config);
      }
    });

    // Circular layout strategy
    this.layoutStrategies.set('circular', {
      name: 'Circular Layout',
      description: 'Places nodes in a circular pattern around a center point',
      calculatePositions: (components, canvasElement, canvasState, existingNodes, config) => {
        return this.calculateCircularLayout(components, canvasElement, canvasState, existingNodes, config);
      }
    });
  }

  /**
   * Calculate linear layout positions
   */
  private calculateLinearLayout(
    components: StrategyComponent[],
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: ExistingNode[],
    config: AINodePlacementConfig
  ): NodePlacement[] {
    const viewport = getViewportBounds(canvasElement, canvasState);
    const startX = viewport.x + config.edgeMargin;
    const centerY = viewport.y + viewport.height / 2;

    return components.map((component, index) => {
      const spacing = config.strategySpacing[component.type as keyof typeof config.strategySpacing] || 
                     { x: 180, y: 0 };
      
      const position: Point = {
        x: startX + (index * spacing.x),
        y: centerY - (DEFAULT_NODE_DIMENSIONS.height / 2)
      };

      // Ensure position is within bounds
      const boundedPosition = ensureNodeWithinBounds(
        position,
        canvasElement,
        canvasState,
        DEFAULT_NODE_DIMENSIONS,
        config
      );

      return {
        nodeId: component.id || `node_${Date.now()}_${index}`,
        position: boundedPosition,
        animationDelay: index * config.animationTiming.delayBetweenNodes,
        reasoning: `Linear layout position ${index + 1} of ${components.length}`,
        confidence: 0.9
      };
    });
  }

  /**
   * Calculate hierarchical layout positions
   */
  private calculateHierarchicalLayout(
    components: StrategyComponent[],
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: ExistingNode[],
    config: AINodePlacementConfig
  ): NodePlacement[] {
    // Group components by type to create hierarchy levels
    const levels = this.groupComponentsByHierarchy(components);
    const viewport = getViewportBounds(canvasElement, canvasState);
    
    const placements: NodePlacement[] = [];
    let currentY = viewport.y + config.edgeMargin;

    levels.forEach((levelComponents, levelIndex) => {
      const levelWidth = viewport.width - (config.edgeMargin * 2);
      const nodeSpacing = levelWidth / (levelComponents.length + 1);

      levelComponents.forEach((component, nodeIndex) => {
        const position: Point = {
          x: viewport.x + config.edgeMargin + (nodeSpacing * (nodeIndex + 1)) - (DEFAULT_NODE_DIMENSIONS.width / 2),
          y: currentY
        };

        const boundedPosition = ensureNodeWithinBounds(
          position,
          canvasElement,
          canvasState,
          DEFAULT_NODE_DIMENSIONS,
          config
        );

        placements.push({
          nodeId: component.id || `node_${Date.now()}_${levelIndex}_${nodeIndex}`,
          position: boundedPosition,
          animationDelay: (levelIndex * levelComponents.length + nodeIndex) * config.animationTiming.delayBetweenNodes,
          reasoning: `Hierarchical layout level ${levelIndex + 1}, position ${nodeIndex + 1}`,
          confidence: 0.85
        });
      });

      currentY += DEFAULT_NODE_DIMENSIONS.height + config.nodeSpacing;
    });

    return placements;
  }

  /**
   * Calculate circular layout positions
   */
  private calculateCircularLayout(
    components: StrategyComponent[],
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: ExistingNode[],
    config: AINodePlacementConfig
  ): NodePlacement[] {
    const viewport = getViewportBounds(canvasElement, canvasState);
    const centerX = viewport.x + viewport.width / 2;
    const centerY = viewport.y + viewport.height / 2;
    
    // Calculate radius based on number of nodes and available space
    const minRadius = Math.max(DEFAULT_NODE_DIMENSIONS.width, DEFAULT_NODE_DIMENSIONS.height) * 2;
    const maxRadius = Math.min(viewport.width, viewport.height) / 3;
    const radius = Math.max(minRadius, Math.min(maxRadius, components.length * 30));

    return components.map((component, index) => {
      const angle = (2 * Math.PI * index) / components.length;
      const position: Point = {
        x: centerX + Math.cos(angle) * radius - (DEFAULT_NODE_DIMENSIONS.width / 2),
        y: centerY + Math.sin(angle) * radius - (DEFAULT_NODE_DIMENSIONS.height / 2)
      };

      const boundedPosition = ensureNodeWithinBounds(
        position,
        canvasElement,
        canvasState,
        DEFAULT_NODE_DIMENSIONS,
        config
      );

      return {
        nodeId: component.id || `node_${Date.now()}_${index}`,
        position: boundedPosition,
        animationDelay: index * config.animationTiming.delayBetweenNodes,
        reasoning: `Circular layout at angle ${Math.round(angle * 180 / Math.PI)}°`,
        confidence: 0.8
      };
    });
  }

  /**
   * Group components by hierarchy level
   */
  private groupComponentsByHierarchy(components: StrategyComponent[]): StrategyComponent[][] {
    const levels: StrategyComponent[][] = [];
    
    // Define hierarchy order
    const hierarchyOrder = ['data-source', 'indicator', 'condition', 'action', 'risk', 'timing'];
    
    hierarchyOrder.forEach(type => {
      const componentsOfType = components.filter(comp => comp.type === type);
      if (componentsOfType.length > 0) {
        levels.push(componentsOfType);
      }
    });

    // Add any remaining components that don't fit the standard hierarchy
    const remainingComponents = components.filter(comp => 
      !hierarchyOrder.includes(comp.type)
    );
    if (remainingComponents.length > 0) {
      levels.push(remainingComponents);
    }

    return levels;
  }

  /**
   * Adjust positions based on relationship type
   */
  private adjustPositionsForRelationship(
    positions: Point[],
    relationshipType: 'sequential' | 'parallel' | 'hierarchical',
    canvasElement: HTMLElement,
    canvasState: CanvasState
  ): Point[] {
    switch (relationshipType) {
      case 'sequential':
        // Positions are already good for sequential
        return positions;
        
      case 'parallel':
        // Align nodes vertically for parallel processing
        const avgY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
        return positions.map(pos => ({ ...pos, y: avgY }));
        
      case 'hierarchical':
        // Already handled in hierarchical layout
        return positions;
        
      default:
        return positions;
    }
  }

  /**
   * Analyze layout for optimization opportunities
   */
  private analyzeLayoutOptimizations(
    nodes: ExistingNode[],
    canvasElement: HTMLElement,
    canvasState: CanvasState
  ): Array<{
    nodeId: string;
    newPosition: Point;
    reason: string;
    confidence: number;
  }> {
    const optimizations: Array<{
      nodeId: string;
      newPosition: Point;
      reason: string;
      confidence: number;
    }> = [];

    const viewport = getViewportBounds(canvasElement, canvasState);

    nodes.forEach(node => {
      // Check if node is outside viewport
      if (this.isNodeOutsideViewport(node, viewport)) {
        const newPosition = this.moveNodeToViewport(node, viewport);
        optimizations.push({
          nodeId: node.id,
          newPosition,
          reason: 'Moved node into visible viewport area',
          confidence: 0.95
        });
      }

      // Check for overlapping nodes
      const overlappingNode = this.findOverlappingNode(node, nodes);
      if (overlappingNode) {
        const newPosition = this.resolveNodeOverlap(node, overlappingNode, viewport);
        optimizations.push({
          nodeId: node.id,
          newPosition,
          reason: 'Resolved node overlap for better visibility',
          confidence: 0.8
        });
      }
    });

    return optimizations;
  }

  /**
   * Check if node is outside viewport
   */
  private isNodeOutsideViewport(node: ExistingNode, viewport: ViewportBounds): boolean {
    const nodeRight = node.position.x + (node.dimensions?.width || DEFAULT_NODE_DIMENSIONS.width);
    const nodeBottom = node.position.y + (node.dimensions?.height || DEFAULT_NODE_DIMENSIONS.height);

    return (
      node.position.x > viewport.x + viewport.width ||
      nodeRight < viewport.x ||
      node.position.y > viewport.y + viewport.height ||
      nodeBottom < viewport.y
    );
  }

  /**
   * Move node to viewport
   */
  private moveNodeToViewport(node: ExistingNode, viewport: ViewportBounds): Point {
    const nodeDimensions = node.dimensions || DEFAULT_NODE_DIMENSIONS;
    
    return {
      x: Math.max(viewport.x, Math.min(node.position.x, viewport.x + viewport.width - nodeDimensions.width)),
      y: Math.max(viewport.y, Math.min(node.position.y, viewport.y + viewport.height - nodeDimensions.height))
    };
  }

  /**
   * Find overlapping node
   */
  private findOverlappingNode(node: ExistingNode, allNodes: ExistingNode[]): ExistingNode | null {
    const nodeDimensions = node.dimensions || DEFAULT_NODE_DIMENSIONS;
    
    for (const otherNode of allNodes) {
      if (otherNode.id === node.id) continue;
      
      const otherDimensions = otherNode.dimensions || DEFAULT_NODE_DIMENSIONS;
      
      // Check for overlap
      if (
        node.position.x < otherNode.position.x + otherDimensions.width &&
        node.position.x + nodeDimensions.width > otherNode.position.x &&
        node.position.y < otherNode.position.y + otherDimensions.height &&
        node.position.y + nodeDimensions.height > otherNode.position.y
      ) {
        return otherNode;
      }
    }
    
    return null;
  }

  /**
   * Resolve node overlap
   */
  private resolveNodeOverlap(
    node: ExistingNode,
    overlappingNode: ExistingNode,
    viewport: ViewportBounds
  ): Point {
    const nodeDimensions = node.dimensions || DEFAULT_NODE_DIMENSIONS;
    const spacing = this.config.nodeSpacing;
    
    // Try to move node to the right of overlapping node
    let newPosition: Point = {
      x: overlappingNode.position.x + (overlappingNode.dimensions?.width || DEFAULT_NODE_DIMENSIONS.width) + spacing,
      y: node.position.y
    };
    
    // If that would put it outside viewport, try below
    if (newPosition.x + nodeDimensions.width > viewport.x + viewport.width) {
      newPosition = {
        x: node.position.x,
        y: overlappingNode.position.y + (overlappingNode.dimensions?.height || DEFAULT_NODE_DIMENSIONS.height) + spacing
      };
    }
    
    // Ensure final position is within viewport
    return {
      x: Math.max(viewport.x, Math.min(newPosition.x, viewport.x + viewport.width - nodeDimensions.width)),
      y: Math.max(viewport.y, Math.min(newPosition.y, viewport.y + viewport.height - nodeDimensions.height))
    };
  }

  /**
   * Get node dimensions based on type
   */
  private getNodeDimensions(nodeType: string): NodeDimensions {
    // Different node types might have different dimensions
    const typeDimensions: Record<string, NodeDimensions> = {
      'data-source': { width: 200, height: 80 },
      'indicator': { width: 180, height: 100 },
      'condition': { width: 160, height: 90 },
      'action': { width: 140, height: 85 },
      'risk': { width: 160, height: 95 },
      'timing': { width: 150, height: 80 }
    };

    return typeDimensions[nodeType] || DEFAULT_NODE_DIMENSIONS;
  }

  /**
   * Validate all placements
   */
  private validatePlacements(
    placements: NodePlacement[],
    canvasElement: HTMLElement,
    canvasState: CanvasState,
    existingNodes: ExistingNode[]
  ): NodePlacement[] {
    return placements.map(placement => {
      // Ensure position is within bounds
      const validatedPosition = ensureNodeWithinBounds(
        placement.position,
        canvasElement,
        canvasState,
        DEFAULT_NODE_DIMENSIONS,
        this.config
      );

      return {
        ...placement,
        position: validatedPosition
      };
    });
  }

  /**
   * Calculate total animation duration
   */
  private calculateTotalAnimationDuration(placements: NodePlacement[]): number {
    if (placements.length === 0) return 0;
    
    const maxDelay = Math.max(...placements.map(p => p.animationDelay));
    return maxDelay + this.config.animationTiming.placementDuration;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AINodePlacementConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AINodePlacementConfig {
    return { ...this.config };
  }
}

/**
 * Create a singleton AI node placer instance
 */
let aiNodePlacerInstance: AINodePlacer | null = null;

export function getAINodePlacer(): AINodePlacer {
  if (!aiNodePlacerInstance) {
    aiNodePlacerInstance = new AINodePlacer();
  }
  return aiNodePlacerInstance;
}

/**
 * Reset the AI node placer instance (for testing)
 */
export function resetAINodePlacer(): void {
  aiNodePlacerInstance = null;
}

/**
 * Utility functions for AI node placement
 */
export const AINodePlacementUtils = {
  /**
   * Calculate optimal spacing between nodes based on their types
   */
  calculateOptimalSpacing(
    sourceType: string,
    targetType: string,
    config: AINodePlacementConfig
  ): { x: number; y: number } {
    const sourceSpacing = config.strategySpacing[sourceType as keyof typeof config.strategySpacing];
    const targetSpacing = config.strategySpacing[targetType as keyof typeof config.strategySpacing];
    
    if (sourceSpacing && targetSpacing) {
      return {
        x: (sourceSpacing.x + targetSpacing.x) / 2,
        y: (sourceSpacing.y + targetSpacing.y) / 2
      };
    }
    
    return { x: 180, y: 120 }; // Default spacing
  },

  /**
   * Generate placement reasoning text
   */
  generatePlacementReasoning(
    placement: NodePlacement,
    context: {
      totalNodes: number;
      layoutType: string;
      nodeIndex: number;
    }
  ): string {
    const { totalNodes, layoutType, nodeIndex } = context;
    
    const baseReasons = [
      `Positioned using ${layoutType} layout strategy`,
      `Optimally placed as node ${nodeIndex + 1} of ${totalNodes}`,
      `Calculated position ensures visibility and accessibility`,
      `Positioned to maintain logical flow and readability`
    ];

    return baseReasons[Math.floor(Math.random() * baseReasons.length)];
  },

  /**
   * Validate node placement configuration
   */
  validatePlacementConfig(config: AINodePlacementConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate spacing values
    if (config.nodeSpacing < 10) {
      errors.push('Node spacing must be at least 10 pixels');
    }

    if (config.edgeMargin < 20) {
      warnings.push('Edge margin less than 20 pixels may cause nodes to appear too close to viewport edges');
    }

    // Validate animation timing
    if (config.animationTiming.delayBetweenNodes < 50) {
      warnings.push('Very short animation delays may cause visual confusion');
    }

    if (config.animationTiming.placementDuration < 100) {
      warnings.push('Very short placement duration may make animations hard to follow');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};