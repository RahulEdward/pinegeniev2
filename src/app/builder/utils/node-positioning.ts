/**
 * Node Positioning and Display Utilities for PineGenie Strategy Builder
 * 
 * This module provides enhanced node positioning logic to ensure nodes:
 * - Always appear within the visible canvas area
 * - Don't disappear off-screen during operations
 * - Scale properly with zoom levels
 * - Have automatic spacing to prevent overlapping
 * 
 * Requirements addressed: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { Point, CanvasState, DEFAULT_NODE_DIMENSIONS, NodeDimensions, clamp, screenToCanvas, canvasToScreen } from './coordinate-system';

export interface ViewportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NodePositionConfig {
  /** Minimum distance from viewport edges */
  edgeMargin: number;
  /** Minimum spacing between nodes */
  nodeSpacing: number;
  /** Grid snap size for positioning */
  gridSize: number;
  /** Maximum attempts to find non-overlapping position */
  maxPositionAttempts: number;
}

export interface ExistingNode {
  id: string;
  position: Point;
  dimensions?: NodeDimensions;
}

/**
 * Default configuration for node positioning
 */
export const DEFAULT_POSITION_CONFIG: NodePositionConfig = {
  edgeMargin: 50,
  nodeSpacing: 30,
  gridSize: 20,
  maxPositionAttempts: 50
};

/**
 * Calculate the visible viewport bounds in canvas coordinates
 * 
 * @param canvasElement - Canvas DOM element
 * @param canvasState - Current canvas zoom and offset state
 * @returns Viewport bounds in canvas coordinates
 */
export function getViewportBounds(
  canvasElement: HTMLElement,
  canvasState: CanvasState
): ViewportBounds {
  const rect = canvasElement.getBoundingClientRect();
  
  // Convert viewport corners to canvas coordinates
  const topLeft = screenToCanvas({ x: 0, y: 0 }, canvasState);
  const bottomRight = screenToCanvas({ x: rect.width, y: rect.height }, canvasState);
  
  return {
    x: topLeft.x,
    y: topLeft.y,
    width: bottomRight.x - topLeft.x,
    height: bottomRight.y - topLeft.y
  };
}

/**
 * Calculate optimal position for a new node within the visible viewport
 * 
 * @param canvasElement - Canvas DOM element
 * @param canvasState - Current canvas zoom and offset state
 * @param existingNodes - Array of existing nodes to avoid overlapping
 * @param nodeDimensions - Dimensions of the new node
 * @param config - Positioning configuration
 * @returns Optimal position for the new node in canvas coordinates
 */
export function calculateOptimalNodePosition(
  canvasElement: HTMLElement,
  canvasState: CanvasState,
  existingNodes: ExistingNode[],
  nodeDimensions: NodeDimensions = DEFAULT_NODE_DIMENSIONS,
  config: NodePositionConfig = DEFAULT_POSITION_CONFIG
): Point {
  const viewport = getViewportBounds(canvasElement, canvasState);
  
  // Calculate the safe area within the viewport (accounting for margins)
  const safeArea = {
    x: viewport.x + config.edgeMargin,
    y: viewport.y + config.edgeMargin,
    width: viewport.width - (config.edgeMargin * 2) - nodeDimensions.width,
    height: viewport.height - (config.edgeMargin * 2) - nodeDimensions.height
  };
  
  // Ensure safe area is valid
  if (safeArea.width <= 0 || safeArea.height <= 0) {
    // Fallback to center of viewport if margins are too large
    return {
      x: viewport.x + (viewport.width - nodeDimensions.width) / 2,
      y: viewport.y + (viewport.height - nodeDimensions.height) / 2
    };
  }
  
  // Try to find a non-overlapping position
  for (let attempt = 0; attempt < config.maxPositionAttempts; attempt++) {
    let candidatePosition: Point;
    
    if (attempt === 0) {
      // First attempt: center of safe area
      candidatePosition = {
        x: safeArea.x + safeArea.width / 2,
        y: safeArea.y + safeArea.height / 2
      };
    } else if (attempt < 10) {
      // Next attempts: systematic grid positions
      const gridCols = Math.floor(safeArea.width / (nodeDimensions.width + config.nodeSpacing));
      const gridRows = Math.floor(safeArea.height / (nodeDimensions.height + config.nodeSpacing));
      
      if (gridCols > 0 && gridRows > 0) {
        const col = attempt % gridCols;
        const row = Math.floor(attempt / gridCols) % gridRows;
        
        candidatePosition = {
          x: safeArea.x + col * (nodeDimensions.width + config.nodeSpacing),
          y: safeArea.y + row * (nodeDimensions.height + config.nodeSpacing)
        };
      } else {
        // Fallback to random position
        candidatePosition = {
          x: safeArea.x + Math.random() * safeArea.width,
          y: safeArea.y + Math.random() * safeArea.height
        };
      }
    } else {
      // Random positions with slight offset from existing nodes
      candidatePosition = {
        x: safeArea.x + Math.random() * safeArea.width,
        y: safeArea.y + Math.random() * safeArea.height
      };
      
      // Add small offset if near existing nodes
      const nearbyNode = findNearestNode(candidatePosition, existingNodes);
      if (nearbyNode && calculateNodeDistance(candidatePosition, nearbyNode.position, nodeDimensions) < config.nodeSpacing * 2) {
        candidatePosition.x += (Math.random() - 0.5) * config.nodeSpacing * 2;
        candidatePosition.y += (Math.random() - 0.5) * config.nodeSpacing * 2;
        
        // Clamp to safe area
        candidatePosition.x = clamp(candidatePosition.x, safeArea.x, safeArea.x + safeArea.width);
        candidatePosition.y = clamp(candidatePosition.y, safeArea.y, safeArea.y + safeArea.height);
      }
    }
    
    // Snap to grid if enabled
    if (config.gridSize > 0) {
      candidatePosition = snapToGrid(candidatePosition, config.gridSize);
    }
    
    // Check if position is valid (no overlapping)
    if (isPositionValid(candidatePosition, existingNodes, nodeDimensions, config.nodeSpacing)) {
      return candidatePosition;
    }
  }
  
  // If no non-overlapping position found, return a position with offset
  const fallbackPosition = {
    x: safeArea.x + (existingNodes.length * 20) % safeArea.width,
    y: safeArea.y + (existingNodes.length * 20) % safeArea.height
  };
  
  return snapToGrid(fallbackPosition, config.gridSize);
}

/**
 * Ensure a node position stays within reasonable bounds
 * 
 * @param position - Current node position
 * @param canvasElement - Canvas DOM element
 * @param canvasState - Current canvas zoom and offset state
 * @param nodeDimensions - Node dimensions
 * @param config - Positioning configuration
 * @returns Corrected position within bounds
 */
export function ensureNodeWithinBounds(
  position: Point,
  canvasElement: HTMLElement,
  canvasState: CanvasState,
  nodeDimensions: NodeDimensions = DEFAULT_NODE_DIMENSIONS,
  config: NodePositionConfig = DEFAULT_POSITION_CONFIG
): Point {
  const viewport = getViewportBounds(canvasElement, canvasState);
  
  // Calculate bounds with margin
  const minX = viewport.x - nodeDimensions.width + config.edgeMargin;
  const maxX = viewport.x + viewport.width - config.edgeMargin;
  const minY = viewport.y - nodeDimensions.height + config.edgeMargin;
  const maxY = viewport.y + viewport.height - config.edgeMargin;
  
  return {
    x: clamp(position.x, minX, maxX),
    y: clamp(position.y, minY, maxY)
  };
}

/**
 * Calculate spacing for multiple new nodes to prevent overlapping
 * 
 * @param count - Number of nodes to position
 * @param canvasElement - Canvas DOM element
 * @param canvasState - Current canvas zoom and offset state
 * @param existingNodes - Array of existing nodes
 * @param nodeDimensions - Dimensions of the new nodes
 * @param config - Positioning configuration
 * @returns Array of positions for the new nodes
 */
export function calculateMultipleNodePositions(
  count: number,
  canvasElement: HTMLElement,
  canvasState: CanvasState,
  existingNodes: ExistingNode[],
  nodeDimensions: NodeDimensions = DEFAULT_NODE_DIMENSIONS,
  config: NodePositionConfig = DEFAULT_POSITION_CONFIG
): Point[] {
  const positions: Point[] = [];
  const allNodes = [...existingNodes];
  
  for (let i = 0; i < count; i++) {
    const position = calculateOptimalNodePosition(
      canvasElement,
      canvasState,
      allNodes,
      nodeDimensions,
      config
    );
    
    positions.push(position);
    
    // Add this position to the list of nodes to avoid for next iteration
    allNodes.push({
      id: `temp_${i}`,
      position,
      dimensions: nodeDimensions
    });
  }
  
  return positions;
}

/**
 * Update node positions when canvas zoom changes to maintain proportions
 * 
 * @param nodes - Array of nodes to update
 * @param oldZoom - Previous zoom level
 * @param newZoom - New zoom level
 * @param canvasElement - Canvas DOM element
 * @param canvasState - Current canvas state with new zoom
 * @returns Updated node positions
 */
export function updateNodePositionsForZoom(
  nodes: ExistingNode[],
  oldZoom: number,
  newZoom: number,
  canvasElement: HTMLElement,
  canvasState: CanvasState
): ExistingNode[] {
  // If zoom hasn't changed significantly, return original nodes
  if (Math.abs(oldZoom - newZoom) < 0.01) {
    return nodes;
  }
  
  const viewport = getViewportBounds(canvasElement, canvasState);
  const viewportCenter = {
    x: viewport.x + viewport.width / 2,
    y: viewport.y + viewport.height / 2
  };
  
  return nodes.map(node => {
    // Keep nodes roughly in the same relative position to viewport center
    const relativeToCenter = {
      x: node.position.x - viewportCenter.x,
      y: node.position.y - viewportCenter.y
    };
    
    // Scale the relative position slightly to account for zoom
    const scaleFactor = Math.sqrt(newZoom / oldZoom);
    const newRelativePosition = {
      x: relativeToCenter.x * scaleFactor,
      y: relativeToCenter.y * scaleFactor
    };
    
    const newPosition = {
      x: viewportCenter.x + newRelativePosition.x,
      y: viewportCenter.y + newRelativePosition.y
    };
    
    // Ensure the new position is within reasonable bounds
    const boundedPosition = ensureNodeWithinBounds(
      newPosition,
      canvasElement,
      canvasState,
      node.dimensions || DEFAULT_NODE_DIMENSIONS
    );
    
    return {
      ...node,
      position: boundedPosition
    };
  });
}

/**
 * Helper function to check if a position is valid (no overlapping with existing nodes)
 */
function isPositionValid(
  position: Point,
  existingNodes: ExistingNode[],
  nodeDimensions: NodeDimensions,
  minSpacing: number
): boolean {
  for (const existingNode of existingNodes) {
    const distance = calculateNodeDistance(
      position,
      existingNode.position,
      nodeDimensions,
      existingNode.dimensions || DEFAULT_NODE_DIMENSIONS
    );
    
    if (distance < minSpacing) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculate distance between two nodes (edge to edge)
 */
function calculateNodeDistance(
  pos1: Point,
  pos2: Point,
  dim1: NodeDimensions,
  dim2: NodeDimensions = DEFAULT_NODE_DIMENSIONS
): number {
  // Calculate the closest points between the two rectangles
  const rect1 = { x: pos1.x, y: pos1.y, width: dim1.width, height: dim1.height };
  const rect2 = { x: pos2.x, y: pos2.y, width: dim2.width, height: dim2.height };
  
  // Check if rectangles overlap
  if (rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y) {
    return 0; // Overlapping
  }
  
  // Calculate minimum distance between rectangles
  const dx = Math.max(0, Math.max(rect1.x - (rect2.x + rect2.width), rect2.x - (rect1.x + rect1.width)));
  const dy = Math.max(0, Math.max(rect1.y - (rect2.y + rect2.height), rect2.y - (rect1.y + rect1.height)));
  
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Find the nearest node to a given position
 */
function findNearestNode(position: Point, nodes: ExistingNode[]): ExistingNode | null {
  if (nodes.length === 0) return null;
  
  let nearestNode = nodes[0];
  let minDistance = calculateNodeDistance(
    position,
    nearestNode.position,
    DEFAULT_NODE_DIMENSIONS,
    nearestNode.dimensions
  );
  
  for (let i = 1; i < nodes.length; i++) {
    const distance = calculateNodeDistance(
      position,
      nodes[i].position,
      DEFAULT_NODE_DIMENSIONS,
      nodes[i].dimensions
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestNode = nodes[i];
    }
  }
  
  return nearestNode;
}

/**
 * Snap position to grid
 */
function snapToGrid(position: Point, gridSize: number): Point {
  if (gridSize <= 0) return position;
  
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}

/**
 * Calculate automatic spacing pattern for nodes
 * 
 * @param nodeCount - Number of nodes to arrange
 * @param availableArea - Available area for positioning
 * @param nodeDimensions - Dimensions of each node
 * @param minSpacing - Minimum spacing between nodes
 * @returns Optimal arrangement pattern
 */
export function calculateNodeArrangement(
  nodeCount: number,
  availableArea: { width: number; height: number },
  nodeDimensions: NodeDimensions = DEFAULT_NODE_DIMENSIONS,
  minSpacing: number = 30
): { rows: number; cols: number; spacing: { x: number; y: number } } {
  if (nodeCount <= 0) {
    return { rows: 0, cols: 0, spacing: { x: 0, y: 0 } };
  }
  
  const nodeWithSpacing = {
    width: nodeDimensions.width + minSpacing,
    height: nodeDimensions.height + minSpacing
  };
  
  // Calculate optimal grid dimensions
  const maxCols = Math.floor(availableArea.width / nodeWithSpacing.width);
  const maxRows = Math.floor(availableArea.height / nodeWithSpacing.height);
  
  if (maxCols <= 0 || maxRows <= 0) {
    // Fallback: single column or row
    return {
      rows: nodeCount,
      cols: 1,
      spacing: { x: minSpacing, y: minSpacing }
    };
  }
  
  // Find the arrangement that best fits the available space
  let bestArrangement = { rows: 1, cols: nodeCount };
  let bestScore = Number.MAX_VALUE;
  
  for (let cols = 1; cols <= Math.min(maxCols, nodeCount); cols++) {
    const rows = Math.ceil(nodeCount / cols);
    
    if (rows <= maxRows) {
      const usedWidth = cols * nodeWithSpacing.width;
      const usedHeight = rows * nodeWithSpacing.height;
      
      // Calculate how well this arrangement uses the available space
      const widthRatio = usedWidth / availableArea.width;
      const heightRatio = usedHeight / availableArea.height;
      
      // Prefer arrangements that:
      // 1. Are more square-ish (minimize aspect ratio difference)
      // 2. Use space efficiently
      const aspectRatioScore = Math.abs(rows - cols); // Lower is more square
      const spaceUsageScore = Math.abs(widthRatio - heightRatio); // Lower is more balanced
      const totalScore = aspectRatioScore + spaceUsageScore;
      
      if (totalScore < bestScore) {
        bestScore = totalScore;
        bestArrangement = { rows, cols };
      }
    }
  }
  
  // Calculate actual spacing to center the arrangement
  const totalWidth = bestArrangement.cols * nodeDimensions.width + (bestArrangement.cols - 1) * minSpacing;
  const totalHeight = bestArrangement.rows * nodeDimensions.height + (bestArrangement.rows - 1) * minSpacing;
  
  const extraSpacingX = Math.max(0, (availableArea.width - totalWidth) / (bestArrangement.cols + 1));
  const extraSpacingY = Math.max(0, (availableArea.height - totalHeight) / (bestArrangement.rows + 1));
  
  return {
    rows: bestArrangement.rows,
    cols: bestArrangement.cols,
    spacing: {
      x: minSpacing + extraSpacingX,
      y: minSpacing + extraSpacingY
    }
  };
}

/**
 * Debugging utilities for node positioning
 */
export const NodePositionDebug = {
  /**
   * Log positioning information for debugging
   */
  logPositioning(
    position: Point,
    viewport: ViewportBounds,
    canvasState: CanvasState,
    operation: string
  ): void {
    console.log(`[NodePositioning] ${operation}:`, {
      position,
      viewport,
      canvasState,
      screenPosition: canvasToScreen(position, canvasState)
    });
  },
  
  /**
   * Validate that a position is within expected bounds
   */
  validatePosition(
    position: Point,
    viewport: ViewportBounds,
    nodeDimensions: NodeDimensions = DEFAULT_NODE_DIMENSIONS
  ): boolean {
    const isValid = (
      position.x >= viewport.x - nodeDimensions.width &&
      position.x <= viewport.x + viewport.width &&
      position.y >= viewport.y - nodeDimensions.height &&
      position.y <= viewport.y + viewport.height
    );
    
    if (!isValid) {
      console.warn('[NodePositioning] Position validation failed:', {
        position,
        viewport,
        nodeDimensions
      });
    }
    
    return isValid;
  }
};