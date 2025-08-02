/**
 * Coordinate System Utilities for PineGenie Strategy Builder
 * 
 * This module provides precise coordinate transformations between screen and canvas space,
 * handling zoom levels, canvas offsets, and node handle positioning with mathematical precision.
 * 
 * Requirements addressed: 5.1, 5.2, 5.3, 5.4, 5.5
 */

export interface Point {
  x: number;
  y: number;
}

export interface CanvasState {
  zoom: number;
  offset: Point;
}

export interface NodeDimensions {
  width: number;
  height: number;
}

export interface HandlePosition {
  nodeId: string;
  handleType: 'input' | 'output';
  position: Point;
}

/**
 * Default node dimensions used for handle position calculations
 */
export const DEFAULT_NODE_DIMENSIONS: NodeDimensions = {
  width: 240,
  height: 120
};

/**
 * Handle offset from node edges (in canvas coordinates)
 */
export const HANDLE_OFFSET = 12; // 12px from node edge

/**
 * Handle size for interaction area calculations
 */
export const HANDLE_SIZE = 24; // 24px diameter

/**
 * Convert screen coordinates to canvas coordinates
 * 
 * @param screenPoint - Point in screen coordinate system
 * @param canvasState - Current canvas zoom and offset state
 * @returns Point in canvas coordinate system
 */
export function screenToCanvas(screenPoint: Point, canvasState: CanvasState): Point {
  const { zoom, offset } = canvasState;
  
  // Validate inputs
  if (!isValidPoint(screenPoint) || !isValidCanvasState(canvasState)) {
    throw new Error('Invalid input parameters for screenToCanvas');
  }
  
  return {
    x: (screenPoint.x - offset.x) / zoom,
    y: (screenPoint.y - offset.y) / zoom
  };
}

/**
 * Convert canvas coordinates to screen coordinates
 * 
 * @param canvasPoint - Point in canvas coordinate system
 * @param canvasState - Current canvas zoom and offset state
 * @returns Point in screen coordinate system
 */
export function canvasToScreen(canvasPoint: Point, canvasState: CanvasState): Point {
  const { zoom, offset } = canvasState;
  
  // Validate inputs
  if (!isValidPoint(canvasPoint) || !isValidCanvasState(canvasState)) {
    throw new Error('Invalid input parameters for canvasToScreen');
  }
  
  return {
    x: canvasPoint.x * zoom + offset.x,
    y: canvasPoint.y * zoom + offset.y
  };
}

/**
 * Calculate the screen position of a node handle
 * 
 * @param nodePosition - Node position in canvas coordinates
 * @param handleType - Type of handle ('input' or 'output')
 * @param canvasState - Current canvas zoom and offset state
 * @param nodeDimensions - Node dimensions (optional, uses defaults)
 * @returns Handle position in screen coordinates
 */
export function getHandleScreenPosition(
  nodePosition: Point,
  handleType: 'input' | 'output',
  canvasState: CanvasState,
  nodeDimensions: NodeDimensions = DEFAULT_NODE_DIMENSIONS
): Point {
  // Validate inputs
  if (!isValidPoint(nodePosition) || !isValidCanvasState(canvasState)) {
    throw new Error('Invalid input parameters for getHandleScreenPosition');
  }
  
  // Calculate handle position in canvas coordinates
  const handleCanvasPosition = getHandleCanvasPosition(nodePosition, handleType, nodeDimensions);
  
  // Convert to screen coordinates
  return canvasToScreen(handleCanvasPosition, canvasState);
}

/**
 * Calculate the canvas position of a node handle
 * 
 * @param nodePosition - Node position in canvas coordinates
 * @param handleType - Type of handle ('input' or 'output')
 * @param nodeDimensions - Node dimensions
 * @returns Handle position in canvas coordinates
 */
export function getHandleCanvasPosition(
  nodePosition: Point,
  handleType: 'input' | 'output',
  nodeDimensions: NodeDimensions = DEFAULT_NODE_DIMENSIONS
): Point {
  const { width, height } = nodeDimensions;
  const centerY = nodePosition.y + height / 2;
  
  if (handleType === 'input') {
    return {
      x: nodePosition.x - HANDLE_OFFSET,
      y: centerY
    };
  } else {
    return {
      x: nodePosition.x + width + HANDLE_OFFSET,
      y: centerY
    };
  }
}

/**
 * Calculate connection line path between two points
 * 
 * @param start - Start point in screen coordinates
 * @param end - End point in screen coordinates
 * @returns SVG path string for bezier curve
 */
export function calculateConnectionPath(start: Point, end: Point): string {
  // Validate inputs
  if (!isValidPoint(start) || !isValidPoint(end)) {
    throw new Error('Invalid input parameters for calculateConnectionPath');
  }
  
  // Calculate control points for smooth bezier curve
  const deltaX = end.x - start.x;
  const controlOffset = Math.max(Math.abs(deltaX) * 0.5, 50); // Minimum 50px offset
  
  const controlPoint1: Point = {
    x: start.x + controlOffset,
    y: start.y
  };
  
  const controlPoint2: Point = {
    x: end.x - controlOffset,
    y: end.y
  };
  
  return `M ${start.x} ${start.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${end.x} ${end.y}`;
}

/**
 * Calculate the distance between two points
 * 
 * @param point1 - First point
 * @param point2 - Second point
 * @returns Distance between points
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const deltaX = point2.x - point1.x;
  const deltaY = point2.y - point1.y;
  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
}

/**
 * Check if a point is within a circular area (for handle interaction)
 * 
 * @param point - Point to check
 * @param center - Center of the circular area
 * @param radius - Radius of the circular area
 * @returns True if point is within the area
 */
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  return calculateDistance(point, center) <= radius;
}

/**
 * Check if a point is within a rectangular area
 * 
 * @param point - Point to check
 * @param rect - Rectangle defined by top-left corner and dimensions
 * @returns True if point is within the rectangle
 */
export function isPointInRect(
  point: Point, 
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Clamp a value between minimum and maximum bounds
 * 
 * @param value - Value to clamp
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp zoom level to reasonable bounds
 * 
 * @param zoom - Zoom level to clamp
 * @returns Clamped zoom level
 */
export function clampZoom(zoom: number): number {
  return clamp(zoom, 0.1, 3.0);
}

/**
 * Calculate zoom-adjusted dimensions
 * 
 * @param dimensions - Original dimensions
 * @param zoom - Zoom level
 * @returns Zoom-adjusted dimensions
 */
export function getZoomedDimensions(dimensions: NodeDimensions, zoom: number): NodeDimensions {
  return {
    width: dimensions.width * zoom,
    height: dimensions.height * zoom
  };
}

/**
 * Get the center point of a rectangle
 * 
 * @param rect - Rectangle defined by position and dimensions
 * @returns Center point of the rectangle
 */
export function getRectCenter(rect: { x: number; y: number; width: number; height: number }): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2
  };
}

/**
 * Calculate the bounding box for a set of points
 * 
 * @param points - Array of points
 * @returns Bounding box containing all points
 */
export function getBoundingBox(points: Point[]): { x: number; y: number; width: number; height: number } {
  if (points.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;
  
  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Validation helper functions
 */

/**
 * Check if a point has valid numeric coordinates
 * 
 * @param point - Point to validate
 * @returns True if point is valid
 */
export function isValidPoint(point: Point): boolean {
  return (
    typeof point === 'object' &&
    point !== null &&
    typeof point.x === 'number' &&
    typeof point.y === 'number' &&
    !isNaN(point.x) &&
    !isNaN(point.y) &&
    isFinite(point.x) &&
    isFinite(point.y)
  );
}

/**
 * Check if canvas state has valid values
 * 
 * @param canvasState - Canvas state to validate
 * @returns True if canvas state is valid
 */
export function isValidCanvasState(canvasState: CanvasState): boolean {
  return (
    typeof canvasState === 'object' &&
    canvasState !== null &&
    typeof canvasState.zoom === 'number' &&
    !isNaN(canvasState.zoom) &&
    isFinite(canvasState.zoom) &&
    canvasState.zoom > 0 &&
    isValidPoint(canvasState.offset)
  );
}

/**
 * Create a safe point with fallback values
 * 
 * @param x - X coordinate (defaults to 0)
 * @param y - Y coordinate (defaults to 0)
 * @returns Valid point object
 */
export function createPoint(x: number = 0, y: number = 0): Point {
  return {
    x: isFinite(x) ? x : 0,
    y: isFinite(y) ? y : 0
  };
}

/**
 * Create a safe canvas state with fallback values
 * 
 * @param zoom - Zoom level (defaults to 1)
 * @param offset - Canvas offset (defaults to origin)
 * @returns Valid canvas state object
 */
export function createCanvasState(zoom: number = 1, offset: Point = { x: 0, y: 0 }): CanvasState {
  return {
    zoom: clampZoom(isFinite(zoom) ? zoom : 1),
    offset: isValidPoint(offset) ? offset : { x: 0, y: 0 }
  };
}

/**
 * Coordinate system utilities for debugging and development
 */
export const CoordinateDebug = {
  /**
   * Log coordinate transformation for debugging
   */
  logTransformation(
    screenPoint: Point,
    canvasPoint: Point,
    canvasState: CanvasState,
    operation: 'screenToCanvas' | 'canvasToScreen'
  ): void {
    console.log(`[CoordinateSystem] ${operation}:`, {
      input: operation === 'screenToCanvas' ? screenPoint : canvasPoint,
      output: operation === 'screenToCanvas' ? canvasPoint : screenPoint,
      canvasState,
      zoom: canvasState.zoom,
      offset: canvasState.offset
    });
  },
  
  /**
   * Validate coordinate system consistency
   */
  validateRoundTrip(screenPoint: Point, canvasState: CanvasState): boolean {
    try {
      const canvasPoint = screenToCanvas(screenPoint, canvasState);
      const backToScreen = canvasToScreen(canvasPoint, canvasState);
      
      const deltaX = Math.abs(screenPoint.x - backToScreen.x);
      const deltaY = Math.abs(screenPoint.y - backToScreen.y);
      
      // Allow for small floating point errors
      const tolerance = 0.001;
      const isValid = deltaX < tolerance && deltaY < tolerance;
      
      if (!isValid) {
        console.warn('[CoordinateSystem] Round-trip validation failed:', {
          original: screenPoint,
          roundTrip: backToScreen,
          delta: { x: deltaX, y: deltaY },
          tolerance
        });
      }
      
      return isValid;
    } catch (error) {
      console.error('[CoordinateSystem] Round-trip validation error:', error);
      return false;
    }
  }
};