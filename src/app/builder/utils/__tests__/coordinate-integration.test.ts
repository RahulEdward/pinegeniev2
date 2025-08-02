/**
 * Integration Tests for Coordinate System with Canvas Components
 * 
 * These tests verify that the coordinate system utilities integrate correctly
 * with the existing Canvas and Node components.
 */

import {
  screenToCanvas,
  canvasToScreen,
  getHandleScreenPosition,
  calculateConnectionPath,
  DEFAULT_NODE_DIMENSIONS,
  Point,
  CanvasState
} from '../coordinate-system';

describe('Coordinate System Integration', () => {
  
  describe('Canvas Integration', () => {
    
    test('coordinates work with typical canvas state', () => {
      // Simulate typical canvas state from Canvas.tsx
      const canvasState: CanvasState = {
        zoom: 1.2,
        offset: { x: 150, y: 100 }
      };
      
      // Simulate mouse click at screen position
      const mouseScreenPosition: Point = { x: 400, y: 300 };
      
      // Convert to canvas coordinates (where nodes are positioned)
      const canvasPosition = screenToCanvas(mouseScreenPosition, canvasState);
      
      // Verify conversion
      expect(canvasPosition.x).toBeCloseTo(208.33, 2); // (400 - 150) / 1.2
      expect(canvasPosition.y).toBeCloseTo(166.67, 2); // (300 - 100) / 1.2
      
      // Convert back to screen coordinates
      const backToScreen = canvasToScreen(canvasPosition, canvasState);
      
      // Should match original mouse position
      expect(backToScreen.x).toBeCloseTo(mouseScreenPosition.x, 5);
      expect(backToScreen.y).toBeCloseTo(mouseScreenPosition.y, 5);
    });
    
    test('handle positions work with zoomed canvas', () => {
      // Simulate node position in canvas coordinates
      const nodePosition: Point = { x: 100, y: 150 };
      
      // Simulate zoomed and panned canvas
      const canvasState: CanvasState = {
        zoom: 2.0,
        offset: { x: 50, y: 75 }
      };
      
      // Calculate input handle screen position
      const inputHandleScreen = getHandleScreenPosition(
        nodePosition, 
        'input', 
        canvasState, 
        DEFAULT_NODE_DIMENSIONS
      );
      
      // Expected calculation:
      // Canvas handle position: { x: 100 - 12, y: 150 + 60 } = { x: 88, y: 210 }
      // Screen position: { x: 88 * 2 + 50, y: 210 * 2 + 75 } = { x: 226, y: 495 }
      expect(inputHandleScreen.x).toBe(226);
      expect(inputHandleScreen.y).toBe(495);
      
      // Calculate output handle screen position
      const outputHandleScreen = getHandleScreenPosition(
        nodePosition, 
        'output', 
        canvasState, 
        DEFAULT_NODE_DIMENSIONS
      );
      
      // Expected calculation:
      // Canvas handle position: { x: 100 + 240 + 12, y: 150 + 60 } = { x: 352, y: 210 }
      // Screen position: { x: 352 * 2 + 50, y: 210 * 2 + 75 } = { x: 754, y: 495 }
      expect(outputHandleScreen.x).toBe(754);
      expect(outputHandleScreen.y).toBe(495);
    });
    
  });
  
  describe('Connection Line Integration', () => {
    
    test('connection path works with realistic node positions', () => {
      // Simulate two connected nodes
      const sourceNodePosition: Point = { x: 100, y: 100 };
      const targetNodePosition: Point = { x: 400, y: 200 };
      
      const canvasState: CanvasState = {
        zoom: 1.5,
        offset: { x: 25, y: 50 }
      };
      
      // Get handle positions in screen coordinates
      const sourceHandleScreen = getHandleScreenPosition(
        sourceNodePosition, 
        'output', 
        canvasState
      );
      
      const targetHandleScreen = getHandleScreenPosition(
        targetNodePosition, 
        'input', 
        canvasState
      );
      
      // Create connection path
      const connectionPath = calculateConnectionPath(sourceHandleScreen, targetHandleScreen);
      
      // Verify path format
      expect(connectionPath).toMatch(/^M \d+\.?\d* \d+\.?\d* C \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*$/);
      
      // Verify path starts and ends at correct positions
      expect(connectionPath).toContain(`M ${sourceHandleScreen.x} ${sourceHandleScreen.y}`);
      expect(connectionPath).toContain(`${targetHandleScreen.x} ${targetHandleScreen.y}`);
    });
    
    test('connection path handles close nodes correctly', () => {
      // Simulate two nodes close together
      const sourceNodePosition: Point = { x: 100, y: 100 };
      const targetNodePosition: Point = { x: 150, y: 110 };
      
      const canvasState: CanvasState = {
        zoom: 1.0,
        offset: { x: 0, y: 0 }
      };
      
      // Get handle positions
      const sourceHandleScreen = getHandleScreenPosition(
        sourceNodePosition, 
        'output', 
        canvasState
      );
      
      const targetHandleScreen = getHandleScreenPosition(
        targetNodePosition, 
        'input', 
        canvasState
      );
      
      // Create connection path
      const connectionPath = calculateConnectionPath(sourceHandleScreen, targetHandleScreen);
      
      // Should still create a valid path with minimum control offset
      expect(connectionPath).toMatch(/^M \d+\.?\d* \d+\.?\d* C \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*$/);
    });
    
  });
  
  describe('Real-world Scenarios', () => {
    
    test('handles typical strategy builder workflow', () => {
      // Simulate a user creating a strategy with multiple nodes
      const nodes = [
        { id: 'data-1', position: { x: 50, y: 100 } },
        { id: 'indicator-1', position: { x: 350, y: 100 } },
        { id: 'condition-1', position: { x: 650, y: 100 } },
        { id: 'action-1', position: { x: 950, y: 100 } }
      ];
      
      // Simulate canvas state during editing
      const canvasState: CanvasState = {
        zoom: 1.2,
        offset: { x: 100, y: 50 }
      };
      
      // Test that all node handle positions can be calculated correctly
      for (const node of nodes) {
        const inputHandle = getHandleScreenPosition(node.position, 'input', canvasState);
        const outputHandle = getHandleScreenPosition(node.position, 'output', canvasState);
        
        // Verify handles are positioned correctly relative to each other
        expect(outputHandle.x).toBeGreaterThan(inputHandle.x);
        expect(outputHandle.y).toBe(inputHandle.y); // Same vertical position
        
        // Verify positions are reasonable screen coordinates
        expect(inputHandle.x).toBeGreaterThan(0);
        expect(inputHandle.y).toBeGreaterThan(0);
        expect(outputHandle.x).toBeGreaterThan(0);
        expect(outputHandle.y).toBeGreaterThan(0);
      }
      
      // Test connection paths between consecutive nodes
      for (let i = 0; i < nodes.length - 1; i++) {
        const sourceHandle = getHandleScreenPosition(nodes[i].position, 'output', canvasState);
        const targetHandle = getHandleScreenPosition(nodes[i + 1].position, 'input', canvasState);
        
        const connectionPath = calculateConnectionPath(sourceHandle, targetHandle);
        
        // Verify valid SVG path
        expect(connectionPath).toMatch(/^M \d+\.?\d* \d+\.?\d* C \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*, \d+\.?\d* \d+\.?\d*$/);
      }
    });
    
    test('handles extreme zoom levels gracefully', () => {
      const nodePosition: Point = { x: 200, y: 300 };
      
      // Test minimum zoom
      const minZoomState: CanvasState = { zoom: 0.1, offset: { x: 0, y: 0 } };
      const minZoomHandle = getHandleScreenPosition(nodePosition, 'output', minZoomState);
      
      expect(minZoomHandle.x).toBeCloseTo(45.2, 1); // (200 + 240 + 12) * 0.1
      expect(minZoomHandle.y).toBeCloseTo(36, 1);   // (300 + 60) * 0.1
      
      // Test maximum zoom
      const maxZoomState: CanvasState = { zoom: 3.0, offset: { x: 0, y: 0 } };
      const maxZoomHandle = getHandleScreenPosition(nodePosition, 'output', maxZoomState);
      
      expect(maxZoomHandle.x).toBeCloseTo(1356, 1); // (200 + 240 + 12) * 3.0
      expect(maxZoomHandle.y).toBeCloseTo(1080, 1); // (300 + 60) * 3.0
    });
    
    test('handles large canvas offsets correctly', () => {
      const nodePosition: Point = { x: 100, y: 200 };
      
      // Test large positive offset
      const largeOffsetState: CanvasState = { 
        zoom: 1.0, 
        offset: { x: 5000, y: 3000 } 
      };
      
      const handleWithOffset = getHandleScreenPosition(nodePosition, 'input', largeOffsetState);
      
      // Expected: canvas position (88, 260) + offset (5000, 3000) = (5088, 3260)
      expect(handleWithOffset.x).toBe(5088);
      expect(handleWithOffset.y).toBe(3260);
      
      // Test conversion back to canvas coordinates
      const backToCanvas = screenToCanvas(handleWithOffset, largeOffsetState);
      
      expect(backToCanvas.x).toBeCloseTo(88, 5);  // 100 - 12
      expect(backToCanvas.y).toBeCloseTo(260, 5); // 200 + 60
    });
    
  });
  
  describe('Performance and Precision', () => {
    
    test('maintains precision with many transformations', () => {
      const originalPoint: Point = { x: 123.456789, y: 987.654321 };
      const canvasState: CanvasState = { 
        zoom: 1.234567, 
        offset: { x: 12.3456, y: 98.7654 } 
      };
      
      // Perform multiple round-trip transformations
      let currentPoint = originalPoint;
      
      for (let i = 0; i < 10; i++) {
        const canvasPoint = screenToCanvas(currentPoint, canvasState);
        currentPoint = canvasToScreen(canvasPoint, canvasState);
      }
      
      // Should maintain precision within reasonable tolerance
      expect(currentPoint.x).toBeCloseTo(originalPoint.x, 8);
      expect(currentPoint.y).toBeCloseTo(originalPoint.y, 8);
    });
    
    test('handles rapid coordinate calculations efficiently', () => {
      const nodePositions: Point[] = [];
      const canvasState: CanvasState = { zoom: 1.5, offset: { x: 100, y: 200 } };
      
      // Generate many node positions
      for (let i = 0; i < 1000; i++) {
        nodePositions.push({
          x: Math.random() * 2000,
          y: Math.random() * 1500
        });
      }
      
      const startTime = performance.now();
      
      // Calculate handle positions for all nodes
      const handlePositions = nodePositions.map(pos => ({
        input: getHandleScreenPosition(pos, 'input', canvasState),
        output: getHandleScreenPosition(pos, 'output', canvasState)
      }));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Should complete within reasonable time (less than 100ms for 1000 calculations)
      expect(duration).toBeLessThan(100);
      expect(handlePositions).toHaveLength(1000);
      
      // Verify all calculations are valid
      handlePositions.forEach(handles => {
        expect(typeof handles.input.x).toBe('number');
        expect(typeof handles.input.y).toBe('number');
        expect(typeof handles.output.x).toBe('number');
        expect(typeof handles.output.y).toBe('number');
        expect(isFinite(handles.input.x)).toBe(true);
        expect(isFinite(handles.input.y)).toBe(true);
        expect(isFinite(handles.output.x)).toBe(true);
        expect(isFinite(handles.output.y)).toBe(true);
      });
    });
    
  });
  
});