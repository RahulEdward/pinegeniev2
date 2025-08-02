/**
 * Unit Tests for Coordinate System Utilities
 * 
 * These tests ensure mathematical precision and accuracy of coordinate transformations
 * between screen and canvas space, including zoom and offset calculations.
 */

import {
  Point,
  CanvasState,
  NodeDimensions,
  screenToCanvas,
  canvasToScreen,
  getHandleScreenPosition,
  getHandleCanvasPosition,
  calculateConnectionPath,
  calculateDistance,
  isPointInCircle,
  isPointInRect,
  clamp,
  clampZoom,
  getZoomedDimensions,
  getRectCenter,
  getBoundingBox,
  isValidPoint,
  isValidCanvasState,
  createPoint,
  createCanvasState,
  CoordinateDebug,
  DEFAULT_NODE_DIMENSIONS,
  HANDLE_OFFSET,
  HANDLE_SIZE
} from '../coordinate-system';

describe('Coordinate System Utilities', () => {
  
  describe('Basic Coordinate Transformations', () => {
    
    test('screenToCanvas with no zoom or offset', () => {
      const screenPoint: Point = { x: 100, y: 200 };
      const canvasState: CanvasState = { zoom: 1, offset: { x: 0, y: 0 } };
      
      const result = screenToCanvas(screenPoint, canvasState);
      
      expect(result).toEqual({ x: 100, y: 200 });
    });
    
    test('canvasToScreen with no zoom or offset', () => {
      const canvasPoint: Point = { x: 100, y: 200 };
      const canvasState: CanvasState = { zoom: 1, offset: { x: 0, y: 0 } };
      
      const result = canvasToScreen(canvasPoint, canvasState);
      
      expect(result).toEqual({ x: 100, y: 200 });
    });
    
    test('screenToCanvas with zoom only', () => {
      const screenPoint: Point = { x: 200, y: 400 };
      const canvasState: CanvasState = { zoom: 2, offset: { x: 0, y: 0 } };
      
      const result = screenToCanvas(screenPoint, canvasState);
      
      expect(result).toEqual({ x: 100, y: 200 });
    });
    
    test('canvasToScreen with zoom only', () => {
      const canvasPoint: Point = { x: 100, y: 200 };
      const canvasState: CanvasState = { zoom: 2, offset: { x: 0, y: 0 } };
      
      const result = canvasToScreen(canvasPoint, canvasState);
      
      expect(result).toEqual({ x: 200, y: 400 });
    });
    
    test('screenToCanvas with offset only', () => {
      const screenPoint: Point = { x: 150, y: 250 };
      const canvasState: CanvasState = { zoom: 1, offset: { x: 50, y: 50 } };
      
      const result = screenToCanvas(screenPoint, canvasState);
      
      expect(result).toEqual({ x: 100, y: 200 });
    });
    
    test('canvasToScreen with offset only', () => {
      const canvasPoint: Point = { x: 100, y: 200 };
      const canvasState: CanvasState = { zoom: 1, offset: { x: 50, y: 50 } };
      
      const result = canvasToScreen(canvasPoint, canvasState);
      
      expect(result).toEqual({ x: 150, y: 250 });
    });
    
    test('screenToCanvas with zoom and offset', () => {
      const screenPoint: Point = { x: 350, y: 550 };
      const canvasState: CanvasState = { zoom: 2, offset: { x: 50, y: 50 } };
      
      const result = screenToCanvas(screenPoint, canvasState);
      
      expect(result).toEqual({ x: 150, y: 250 });
    });
    
    test('canvasToScreen with zoom and offset', () => {
      const canvasPoint: Point = { x: 150, y: 250 };
      const canvasState: CanvasState = { zoom: 2, offset: { x: 50, y: 50 } };
      
      const result = canvasToScreen(canvasPoint, canvasState);
      
      expect(result).toEqual({ x: 350, y: 550 });
    });
    
    test('round-trip transformation accuracy', () => {
      const originalScreen: Point = { x: 123.456, y: 789.012 };
      const canvasState: CanvasState = { zoom: 1.5, offset: { x: 25.5, y: 37.25 } };
      
      const canvasPoint = screenToCanvas(originalScreen, canvasState);
      const backToScreen = canvasToScreen(canvasPoint, canvasState);
      
      expect(backToScreen.x).toBeCloseTo(originalScreen.x, 10);
      expect(backToScreen.y).toBeCloseTo(originalScreen.y, 10);
    });
    
  });
  
  describe('Handle Position Calculations', () => {
    
    test('getHandleCanvasPosition for input handle', () => {
      const nodePosition: Point = { x: 100, y: 100 };
      const nodeDimensions: NodeDimensions = { width: 240, height: 120 };
      
      const result = getHandleCanvasPosition(nodePosition, 'input', nodeDimensions);
      
      expect(result).toEqual({
        x: 100 - HANDLE_OFFSET, // 88
        y: 100 + 120 / 2 // 160
      });
    });
    
    test('getHandleCanvasPosition for output handle', () => {
      const nodePosition: Point = { x: 100, y: 100 };
      const nodeDimensions: NodeDimensions = { width: 240, height: 120 };
      
      const result = getHandleCanvasPosition(nodePosition, 'output', nodeDimensions);
      
      expect(result).toEqual({
        x: 100 + 240 + HANDLE_OFFSET, // 352
        y: 100 + 120 / 2 // 160
      });
    });
    
    test('getHandleScreenPosition with zoom and offset', () => {
      const nodePosition: Point = { x: 100, y: 100 };
      const canvasState: CanvasState = { zoom: 2, offset: { x: 50, y: 50 } };
      
      const result = getHandleScreenPosition(nodePosition, 'input', canvasState);
      
      // Expected canvas position: { x: 88, y: 160 }
      // Expected screen position: { x: 88 * 2 + 50, y: 160 * 2 + 50 }
      expect(result).toEqual({ x: 226, y: 370 });
    });
    
    test('getHandleScreenPosition uses default dimensions', () => {
      const nodePosition: Point = { x: 0, y: 0 };
      const canvasState: CanvasState = { zoom: 1, offset: { x: 0, y: 0 } };
      
      const result = getHandleScreenPosition(nodePosition, 'output', canvasState);
      
      expect(result).toEqual({
        x: DEFAULT_NODE_DIMENSIONS.width + HANDLE_OFFSET,
        y: DEFAULT_NODE_DIMENSIONS.height / 2
      });
    });
    
  });
  
  describe('Connection Path Calculations', () => {
    
    test('calculateConnectionPath creates valid SVG path', () => {
      const start: Point = { x: 100, y: 150 };
      const end: Point = { x: 300, y: 200 };
      
      const result = calculateConnectionPath(start, end);
      
      expect(result).toMatch(/^M \d+\.?\d* \d+\.?\d* C \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*$/);
      expect(result).toContain(`M ${start.x} ${start.y}`);
      expect(result).toContain(`${end.x} ${end.y}`);
    });
    
    test('calculateConnectionPath handles minimum control offset', () => {
      const start: Point = { x: 100, y: 150 };
      const end: Point = { x: 110, y: 150 }; // Very close points
      
      const result = calculateConnectionPath(start, end);
      
      // Should still create a valid path with minimum 50px control offset
      expect(result).toMatch(/^M \d+\.?\d* \d+\.?\d* C \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*$/);
    });
    
    test('calculateConnectionPath handles negative delta', () => {
      const start: Point = { x: 300, y: 150 };
      const end: Point = { x: 100, y: 200 };
      
      const result = calculateConnectionPath(start, end);
      
      expect(result).toMatch(/^M \d+\.?\d* \d+\.?\d* C \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*$/);
    });
    
  });
  
  describe('Utility Functions', () => {
    
    test('calculateDistance between points', () => {
      const point1: Point = { x: 0, y: 0 };
      const point2: Point = { x: 3, y: 4 };
      
      const result = calculateDistance(point1, point2);
      
      expect(result).toBe(5); // 3-4-5 triangle
    });
    
    test('calculateDistance with same points', () => {
      const point: Point = { x: 100, y: 200 };
      
      const result = calculateDistance(point, point);
      
      expect(result).toBe(0);
    });
    
    test('isPointInCircle returns true for point inside', () => {
      const point: Point = { x: 102, y: 103 };
      const center: Point = { x: 100, y: 100 };
      const radius = 5;
      
      const result = isPointInCircle(point, center, radius);
      
      expect(result).toBe(true);
    });
    
    test('isPointInCircle returns false for point outside', () => {
      const point: Point = { x: 110, y: 110 };
      const center: Point = { x: 100, y: 100 };
      const radius = 5;
      
      const result = isPointInCircle(point, center, radius);
      
      expect(result).toBe(false);
    });
    
    test('isPointInRect returns true for point inside', () => {
      const point: Point = { x: 150, y: 175 };
      const rect = { x: 100, y: 150, width: 100, height: 50 };
      
      const result = isPointInRect(point, rect);
      
      expect(result).toBe(true);
    });
    
    test('isPointInRect returns false for point outside', () => {
      const point: Point = { x: 250, y: 175 };
      const rect = { x: 100, y: 150, width: 100, height: 50 };
      
      const result = isPointInRect(point, rect);
      
      expect(result).toBe(false);
    });
    
    test('clamp constrains value within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
    
    test('clampZoom constrains zoom to valid range', () => {
      expect(clampZoom(1.5)).toBe(1.5);
      expect(clampZoom(0.05)).toBe(0.1);
      expect(clampZoom(5)).toBe(3.0);
    });
    
    test('getZoomedDimensions scales dimensions correctly', () => {
      const dimensions: NodeDimensions = { width: 100, height: 50 };
      const zoom = 2;
      
      const result = getZoomedDimensions(dimensions, zoom);
      
      expect(result).toEqual({ width: 200, height: 100 });
    });
    
    test('getRectCenter calculates center point', () => {
      const rect = { x: 100, y: 150, width: 200, height: 100 };
      
      const result = getRectCenter(rect);
      
      expect(result).toEqual({ x: 200, y: 200 });
    });
    
    test('getBoundingBox calculates correct bounds', () => {
      const points: Point[] = [
        { x: 100, y: 150 },
        { x: 300, y: 100 },
        { x: 200, y: 250 }
      ];
      
      const result = getBoundingBox(points);
      
      expect(result).toEqual({
        x: 100,
        y: 100,
        width: 200,
        height: 150
      });
    });
    
    test('getBoundingBox handles empty array', () => {
      const result = getBoundingBox([]);
      
      expect(result).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });
    
  });
  
  describe('Validation Functions', () => {
    
    test('isValidPoint validates correct points', () => {
      expect(isValidPoint({ x: 100, y: 200 })).toBe(true);
      expect(isValidPoint({ x: 0, y: 0 })).toBe(true);
      expect(isValidPoint({ x: -100, y: -200 })).toBe(true);
      expect(isValidPoint({ x: 123.456, y: 789.012 })).toBe(true);
    });
    
    test('isValidPoint rejects invalid points', () => {
      expect(isValidPoint({ x: NaN, y: 100 })).toBe(false);
      expect(isValidPoint({ x: 100, y: NaN })).toBe(false);
      expect(isValidPoint({ x: Infinity, y: 100 })).toBe(false);
      expect(isValidPoint({ x: 100, y: -Infinity })).toBe(false);
      expect(isValidPoint(null as any)).toBe(false);
      expect(isValidPoint(undefined as any)).toBe(false);
      expect(isValidPoint({ x: '100', y: 200 } as any)).toBe(false);
    });
    
    test('isValidCanvasState validates correct states', () => {
      expect(isValidCanvasState({ zoom: 1, offset: { x: 0, y: 0 } })).toBe(true);
      expect(isValidCanvasState({ zoom: 2.5, offset: { x: -100, y: 200 } })).toBe(true);
      expect(isValidCanvasState({ zoom: 0.1, offset: { x: 123.456, y: -789.012 } })).toBe(true);
    });
    
    test('isValidCanvasState rejects invalid states', () => {
      expect(isValidCanvasState({ zoom: 0, offset: { x: 0, y: 0 } })).toBe(false);
      expect(isValidCanvasState({ zoom: -1, offset: { x: 0, y: 0 } })).toBe(false);
      expect(isValidCanvasState({ zoom: NaN, offset: { x: 0, y: 0 } })).toBe(false);
      expect(isValidCanvasState({ zoom: 1, offset: { x: NaN, y: 0 } })).toBe(false);
      expect(isValidCanvasState(null as any)).toBe(false);
      expect(isValidCanvasState({ zoom: '1', offset: { x: 0, y: 0 } } as any)).toBe(false);
    });
    
    test('createPoint creates safe points', () => {
      expect(createPoint(100, 200)).toEqual({ x: 100, y: 200 });
      expect(createPoint()).toEqual({ x: 0, y: 0 });
      expect(createPoint(NaN, 100)).toEqual({ x: 0, y: 100 });
      expect(createPoint(100, Infinity)).toEqual({ x: 100, y: 0 });
    });
    
    test('createCanvasState creates safe canvas states', () => {
      expect(createCanvasState(1.5, { x: 100, y: 200 })).toEqual({
        zoom: 1.5,
        offset: { x: 100, y: 200 }
      });
      expect(createCanvasState()).toEqual({
        zoom: 1,
        offset: { x: 0, y: 0 }
      });
      expect(createCanvasState(5)).toEqual({
        zoom: 3.0, // Clamped to max
        offset: { x: 0, y: 0 }
      });
      expect(createCanvasState(NaN, { x: NaN, y: 100 })).toEqual({
        zoom: 1,
        offset: { x: 0, y: 0 }
      });
    });
    
  });
  
  describe('Error Handling', () => {
    
    test('screenToCanvas throws on invalid input', () => {
      expect(() => {
        screenToCanvas({ x: NaN, y: 100 }, { zoom: 1, offset: { x: 0, y: 0 } });
      }).toThrow('Invalid input parameters for screenToCanvas');
      
      expect(() => {
        screenToCanvas({ x: 100, y: 100 }, { zoom: 0, offset: { x: 0, y: 0 } });
      }).toThrow('Invalid input parameters for screenToCanvas');
    });
    
    test('canvasToScreen throws on invalid input', () => {
      expect(() => {
        canvasToScreen({ x: NaN, y: 100 }, { zoom: 1, offset: { x: 0, y: 0 } });
      }).toThrow('Invalid input parameters for canvasToScreen');
      
      expect(() => {
        canvasToScreen({ x: 100, y: 100 }, { zoom: -1, offset: { x: 0, y: 0 } });
      }).toThrow('Invalid input parameters for canvasToScreen');
    });
    
    test('getHandleScreenPosition throws on invalid input', () => {
      expect(() => {
        getHandleScreenPosition({ x: NaN, y: 100 }, 'input', { zoom: 1, offset: { x: 0, y: 0 } });
      }).toThrow('Invalid input parameters for getHandleScreenPosition');
    });
    
    test('calculateConnectionPath throws on invalid input', () => {
      expect(() => {
        calculateConnectionPath({ x: NaN, y: 100 }, { x: 200, y: 150 });
      }).toThrow('Invalid input parameters for calculateConnectionPath');
    });
    
  });
  
  describe('Debug Utilities', () => {
    
    test('CoordinateDebug.validateRoundTrip returns true for valid transformation', () => {
      const screenPoint: Point = { x: 100, y: 200 };
      const canvasState: CanvasState = { zoom: 1.5, offset: { x: 25, y: 50 } };
      
      const result = CoordinateDebug.validateRoundTrip(screenPoint, canvasState);
      
      expect(result).toBe(true);
    });
    
    test('CoordinateDebug.validateRoundTrip handles errors gracefully', () => {
      const screenPoint: Point = { x: NaN, y: 200 };
      const canvasState: CanvasState = { zoom: 1, offset: { x: 0, y: 0 } };
      
      const result = CoordinateDebug.validateRoundTrip(screenPoint, canvasState);
      
      expect(result).toBe(false);
    });
    
  });
  
  describe('Edge Cases and Precision', () => {
    
    test('handles very small zoom levels', () => {
      const screenPoint: Point = { x: 1000, y: 2000 };
      const canvasState: CanvasState = { zoom: 0.1, offset: { x: 0, y: 0 } };
      
      const canvasPoint = screenToCanvas(screenPoint, canvasState);
      const backToScreen = canvasToScreen(canvasPoint, canvasState);
      
      expect(backToScreen.x).toBeCloseTo(screenPoint.x, 5);
      expect(backToScreen.y).toBeCloseTo(screenPoint.y, 5);
    });
    
    test('handles very large zoom levels', () => {
      const screenPoint: Point = { x: 100, y: 200 };
      const canvasState: CanvasState = { zoom: 3.0, offset: { x: 0, y: 0 } };
      
      const canvasPoint = screenToCanvas(screenPoint, canvasState);
      const backToScreen = canvasToScreen(canvasPoint, canvasState);
      
      expect(backToScreen.x).toBeCloseTo(screenPoint.x, 5);
      expect(backToScreen.y).toBeCloseTo(screenPoint.y, 5);
    });
    
    test('handles large offset values', () => {
      const screenPoint: Point = { x: 100, y: 200 };
      const canvasState: CanvasState = { zoom: 1, offset: { x: 10000, y: -5000 } };
      
      const canvasPoint = screenToCanvas(screenPoint, canvasState);
      const backToScreen = canvasToScreen(canvasPoint, canvasState);
      
      expect(backToScreen.x).toBeCloseTo(screenPoint.x, 5);
      expect(backToScreen.y).toBeCloseTo(screenPoint.y, 5);
    });
    
    test('maintains precision with floating point coordinates', () => {
      const screenPoint: Point = { x: 123.456789, y: 987.654321 };
      const canvasState: CanvasState = { zoom: 1.234567, offset: { x: 12.3456, y: 98.7654 } };
      
      const canvasPoint = screenToCanvas(screenPoint, canvasState);
      const backToScreen = canvasToScreen(canvasPoint, canvasState);
      
      expect(backToScreen.x).toBeCloseTo(screenPoint.x, 10);
      expect(backToScreen.y).toBeCloseTo(screenPoint.y, 10);
    });
    
  });
  
});