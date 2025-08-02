/**
 * Unit tests for node positioning utilities
 * 
 * Tests cover:
 * - Viewport bounds calculation
 * - Optimal node positioning
 * - Boundary checking
 * - Multi-node spacing
 * - Zoom scaling
 */

import {
  getViewportBounds,
  calculateOptimalNodePosition,
  ensureNodeWithinBounds,
  calculateMultipleNodePositions,
  updateNodePositionsForZoom,
  calculateNodeArrangement,
  DEFAULT_POSITION_CONFIG,
  ExistingNode
} from '../node-positioning';
import { DEFAULT_NODE_DIMENSIONS, CanvasState } from '../coordinate-system';

// Mock DOM element
const createMockCanvasElement = (width: number = 800, height: number = 600): HTMLElement => {
  const element = document.createElement('div');
  element.getBoundingClientRect = jest.fn(() => ({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({})
  }));
  return element;
};

describe('Node Positioning Utilities', () => {
  const mockCanvas = createMockCanvasElement();
  const defaultCanvasState: CanvasState = { zoom: 1, offset: { x: 0, y: 0 } };

  describe('getViewportBounds', () => {
    test('calculates viewport bounds correctly at zoom 1', () => {
      const bounds = getViewportBounds(mockCanvas, defaultCanvasState);
      
      expect(bounds).toEqual({
        x: 0,
        y: 0,
        width: 800,
        height: 600
      });
    });

    test('calculates viewport bounds correctly with zoom and offset', () => {
      const canvasState: CanvasState = { zoom: 2, offset: { x: 100, y: 50 } };
      const bounds = getViewportBounds(mockCanvas, canvasState);
      
      expect(bounds).toEqual({
        x: -50,   // (0 - 100) / 2
        y: -25,   // (0 - 50) / 2
        width: 400, // 800 / 2
        height: 300 // 600 / 2
      });
    });

    test('handles negative offsets correctly', () => {
      const canvasState: CanvasState = { zoom: 0.5, offset: { x: -200, y: -100 } };
      const bounds = getViewportBounds(mockCanvas, canvasState);
      
      expect(bounds).toEqual({
        x: 400,   // (0 - (-200)) / 0.5
        y: 200,   // (0 - (-100)) / 0.5
        width: 1600, // 800 / 0.5
        height: 1200 // 600 / 0.5
      });
    });
  });

  describe('calculateOptimalNodePosition', () => {
    test('places first node in center of viewport', () => {
      const position = calculateOptimalNodePosition(
        mockCanvas,
        defaultCanvasState,
        []
      );
      
      // Should be centered in the safe area
      const expectedX = DEFAULT_POSITION_CONFIG.edgeMargin + (800 - 2 * DEFAULT_POSITION_CONFIG.edgeMargin - DEFAULT_NODE_DIMENSIONS.width) / 2;
      const expectedY = DEFAULT_POSITION_CONFIG.edgeMargin + (600 - 2 * DEFAULT_POSITION_CONFIG.edgeMargin - DEFAULT_NODE_DIMENSIONS.height) / 2;
      
      expect(position.x).toBeCloseTo(expectedX);
      expect(position.y).toBeCloseTo(expectedY);
    });

    test('avoids overlapping with existing nodes', () => {
      const existingNodes: ExistingNode[] = [
        { id: 'node1', position: { x: 400, y: 300 } }
      ];
      
      const position = calculateOptimalNodePosition(
        mockCanvas,
        defaultCanvasState,
        existingNodes
      );
      
      // Should not be at the same position as existing node
      expect(position.x).not.toBe(400);
      expect(position.y).not.toBe(300);
      
      // Should be within viewport bounds
      expect(position.x).toBeGreaterThanOrEqual(DEFAULT_POSITION_CONFIG.edgeMargin);
      expect(position.x).toBeLessThanOrEqual(800 - DEFAULT_POSITION_CONFIG.edgeMargin - DEFAULT_NODE_DIMENSIONS.width);
      expect(position.y).toBeGreaterThanOrEqual(DEFAULT_POSITION_CONFIG.edgeMargin);
      expect(position.y).toBeLessThanOrEqual(600 - DEFAULT_POSITION_CONFIG.edgeMargin - DEFAULT_NODE_DIMENSIONS.height);
    });

    test('handles small viewport gracefully', () => {
      const smallCanvas = createMockCanvasElement(200, 150);
      
      const position = calculateOptimalNodePosition(
        smallCanvas,
        defaultCanvasState,
        []
      );
      
      // Should still return a valid position even if margins are too large
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
      expect(isFinite(position.x)).toBe(true);
      expect(isFinite(position.y)).toBe(true);
    });

    test('respects custom positioning config', () => {
      const customConfig = {
        ...DEFAULT_POSITION_CONFIG,
        edgeMargin: 100,
        gridSize: 50
      };
      
      const position = calculateOptimalNodePosition(
        mockCanvas,
        defaultCanvasState,
        [],
        DEFAULT_NODE_DIMENSIONS,
        customConfig
      );
      
      // Should respect larger edge margin
      expect(position.x).toBeGreaterThanOrEqual(100);
      expect(position.y).toBeGreaterThanOrEqual(100);
      
      // Should be snapped to grid
      expect(position.x % 50).toBe(0);
      expect(position.y % 50).toBe(0);
    });
  });

  describe('ensureNodeWithinBounds', () => {
    test('keeps valid position unchanged', () => {
      const validPosition = { x: 400, y: 300 };
      
      const result = ensureNodeWithinBounds(
        validPosition,
        mockCanvas,
        defaultCanvasState
      );
      
      expect(result).toEqual(validPosition);
    });

    test('clamps position that is too far left', () => {
      const invalidPosition = { x: -500, y: 300 };
      
      const result = ensureNodeWithinBounds(
        invalidPosition,
        mockCanvas,
        defaultCanvasState
      );
      
      expect(result.x).toBeGreaterThan(invalidPosition.x);
      expect(result.y).toBe(invalidPosition.y);
    });

    test('clamps position that is too far right', () => {
      const invalidPosition = { x: 1000, y: 300 };
      
      const result = ensureNodeWithinBounds(
        invalidPosition,
        mockCanvas,
        defaultCanvasState
      );
      
      expect(result.x).toBeLessThan(invalidPosition.x);
      expect(result.y).toBe(invalidPosition.y);
    });

    test('clamps position that is too far up', () => {
      const invalidPosition = { x: 400, y: -200 };
      
      const result = ensureNodeWithinBounds(
        invalidPosition,
        mockCanvas,
        defaultCanvasState
      );
      
      expect(result.x).toBe(invalidPosition.x);
      expect(result.y).toBeGreaterThan(invalidPosition.y);
    });

    test('clamps position that is too far down', () => {
      const invalidPosition = { x: 400, y: 800 };
      
      const result = ensureNodeWithinBounds(
        invalidPosition,
        mockCanvas,
        defaultCanvasState
      );
      
      expect(result.x).toBe(invalidPosition.x);
      expect(result.y).toBeLessThan(invalidPosition.y);
    });

    test('handles zoomed canvas correctly', () => {
      const zoomedCanvasState: CanvasState = { zoom: 2, offset: { x: 0, y: 0 } };
      const position = { x: 500, y: 400 };
      
      const result = ensureNodeWithinBounds(
        position,
        mockCanvas,
        zoomedCanvasState
      );
      
      // Should account for zoom level in bounds calculation
      expect(typeof result.x).toBe('number');
      expect(typeof result.y).toBe('number');
      expect(isFinite(result.x)).toBe(true);
      expect(isFinite(result.y)).toBe(true);
    });
  });

  describe('calculateMultipleNodePositions', () => {
    test('calculates positions for multiple nodes without overlap', () => {
      const positions = calculateMultipleNodePositions(
        3,
        mockCanvas,
        defaultCanvasState,
        []
      );
      
      expect(positions).toHaveLength(3);
      
      // Check that all positions are different
      const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
      expect(uniquePositions.size).toBe(3);
      
      // Check that all positions are within bounds
      positions.forEach(position => {
        expect(position.x).toBeGreaterThanOrEqual(0);
        expect(position.x).toBeLessThanOrEqual(800);
        expect(position.y).toBeGreaterThanOrEqual(0);
        expect(position.y).toBeLessThanOrEqual(600);
      });
    });

    test('avoids existing nodes when calculating multiple positions', () => {
      const existingNodes: ExistingNode[] = [
        { id: 'existing1', position: { x: 200, y: 200 } },
        { id: 'existing2', position: { x: 600, y: 400 } }
      ];
      
      const positions = calculateMultipleNodePositions(
        2,
        mockCanvas,
        defaultCanvasState,
        existingNodes
      );
      
      expect(positions).toHaveLength(2);
      
      // Check that new positions don't overlap with existing ones
      positions.forEach(newPos => {
        existingNodes.forEach(existingNode => {
          const distance = Math.sqrt(
            Math.pow(newPos.x - existingNode.position.x, 2) +
            Math.pow(newPos.y - existingNode.position.y, 2)
          );
          expect(distance).toBeGreaterThan(DEFAULT_POSITION_CONFIG.nodeSpacing);
        });
      });
    });

    test('handles zero nodes gracefully', () => {
      const positions = calculateMultipleNodePositions(
        0,
        mockCanvas,
        defaultCanvasState,
        []
      );
      
      expect(positions).toHaveLength(0);
    });
  });

  describe('updateNodePositionsForZoom', () => {
    test('keeps positions stable when zoom unchanged', () => {
      const nodes: ExistingNode[] = [
        { id: 'node1', position: { x: 100, y: 100 } },
        { id: 'node2', position: { x: 200, y: 200 } }
      ];
      
      const updatedNodes = updateNodePositionsForZoom(
        nodes,
        1.0,
        1.0,
        mockCanvas,
        defaultCanvasState
      );
      
      expect(updatedNodes).toEqual(nodes);
    });

    test('adjusts positions when zoom changes significantly', () => {
      const nodes: ExistingNode[] = [
        { id: 'node1', position: { x: 100, y: 100 } },
        { id: 'node2', position: { x: 700, y: 500 } }
      ];
      
      const newCanvasState: CanvasState = { zoom: 2, offset: { x: 0, y: 0 } };
      
      const updatedNodes = updateNodePositionsForZoom(
        nodes,
        1.0,
        2.0,
        mockCanvas,
        newCanvasState
      );
      
      expect(updatedNodes).toHaveLength(2);
      
      // Positions should be adjusted but still valid
      updatedNodes.forEach(node => {
        expect(typeof node.position.x).toBe('number');
        expect(typeof node.position.y).toBe('number');
        expect(isFinite(node.position.x)).toBe(true);
        expect(isFinite(node.position.y)).toBe(true);
      });
    });

    test('ensures updated positions remain within bounds', () => {
      const nodes: ExistingNode[] = [
        { id: 'node1', position: { x: 50, y: 50 } },
        { id: 'node2', position: { x: 750, y: 550 } }
      ];
      
      const newCanvasState: CanvasState = { zoom: 0.5, offset: { x: 0, y: 0 } };
      
      const updatedNodes = updateNodePositionsForZoom(
        nodes,
        1.0,
        0.5,
        mockCanvas,
        newCanvasState
      );
      
      // All nodes should remain within reasonable bounds
      updatedNodes.forEach(node => {
        expect(node.position.x).toBeGreaterThan(-DEFAULT_NODE_DIMENSIONS.width);
        expect(node.position.x).toBeLessThan(1600 + DEFAULT_NODE_DIMENSIONS.width); // Viewport width at 0.5 zoom
        expect(node.position.y).toBeGreaterThan(-DEFAULT_NODE_DIMENSIONS.height);
        expect(node.position.y).toBeLessThan(1200 + DEFAULT_NODE_DIMENSIONS.height); // Viewport height at 0.5 zoom
      });
    });
  });

  describe('calculateNodeArrangement', () => {
    test('calculates optimal arrangement for small number of nodes', () => {
      const arrangement = calculateNodeArrangement(
        4,
        { width: 800, height: 600 },
        DEFAULT_NODE_DIMENSIONS,
        30
      );
      
      expect(arrangement.rows).toBeGreaterThan(0);
      expect(arrangement.cols).toBeGreaterThan(0);
      expect(arrangement.rows * arrangement.cols).toBeGreaterThanOrEqual(4);
      expect(arrangement.spacing.x).toBeGreaterThanOrEqual(30);
      expect(arrangement.spacing.y).toBeGreaterThanOrEqual(30);
    });

    test('handles single node correctly', () => {
      const arrangement = calculateNodeArrangement(
        1,
        { width: 800, height: 600 },
        DEFAULT_NODE_DIMENSIONS,
        30
      );
      
      expect(arrangement.rows).toBe(1);
      expect(arrangement.cols).toBe(1);
    });

    test('handles zero nodes correctly', () => {
      const arrangement = calculateNodeArrangement(
        0,
        { width: 800, height: 600 },
        DEFAULT_NODE_DIMENSIONS,
        30
      );
      
      expect(arrangement.rows).toBe(0);
      expect(arrangement.cols).toBe(0);
    });

    test('handles very small available area', () => {
      const arrangement = calculateNodeArrangement(
        3,
        { width: 100, height: 100 },
        DEFAULT_NODE_DIMENSIONS,
        30
      );
      
      // Should fallback to single column arrangement
      expect(arrangement.cols).toBe(1);
      expect(arrangement.rows).toBe(3);
    });

    test('prefers square-ish arrangements', () => {
      const arrangement = calculateNodeArrangement(
        9,
        { width: 1000, height: 1000 },
        DEFAULT_NODE_DIMENSIONS,
        30
      );
      
      // For 9 nodes in a square area, should prefer 3x3 arrangement
      expect(arrangement.rows).toBe(3);
      expect(arrangement.cols).toBe(3);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles invalid canvas element gracefully', () => {
      const invalidCanvas = document.createElement('div');
      invalidCanvas.getBoundingClientRect = jest.fn(() => ({
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        x: 0,
        y: 0,
        toJSON: () => ({})
      }));
      
      expect(() => {
        getViewportBounds(invalidCanvas, defaultCanvasState);
      }).not.toThrow();
    });

    test('handles extreme zoom levels', () => {
      const extremeCanvasState: CanvasState = { zoom: 0.01, offset: { x: 0, y: 0 } };
      
      expect(() => {
        calculateOptimalNodePosition(
          mockCanvas,
          extremeCanvasState,
          []
        );
      }).not.toThrow();
    });

    test('handles large number of existing nodes', () => {
      const manyNodes: ExistingNode[] = Array.from({ length: 100 }, (_, i) => ({
        id: `node${i}`,
        position: { x: (i % 10) * 50, y: Math.floor(i / 10) * 50 }
      }));
      
      expect(() => {
        calculateOptimalNodePosition(
          mockCanvas,
          defaultCanvasState,
          manyNodes
        );
      }).not.toThrow();
    });

    test('handles negative dimensions gracefully', () => {
      const negativeDimensions = { width: -100, height: -50 };
      
      expect(() => {
        calculateOptimalNodePosition(
          mockCanvas,
          defaultCanvasState,
          [],
          negativeDimensions
        );
      }).not.toThrow();
    });
  });
});