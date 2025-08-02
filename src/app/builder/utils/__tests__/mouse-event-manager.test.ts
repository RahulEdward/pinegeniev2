/**
 * Unit Tests for Mouse Event Manager
 * 
 * Tests the centralized mouse event state management system
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { MouseEventManager, MouseEventHandlers, InteractionMode, MouseEventUtils } from '../mouse-event-manager';
import { CanvasState } from '../coordinate-system';

// Mock DOM methods
const mockGetBoundingClientRect = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

// Mock document methods
Object.defineProperty(document, 'addEventListener', {
  value: mockAddEventListener,
  writable: true
});

Object.defineProperty(document, 'removeEventListener', {
  value: mockRemoveEventListener,
  writable: true
});

// Mock querySelector
Object.defineProperty(document, 'querySelector', {
  value: jest.fn().mockImplementation((selector) => {
    if (selector === '[data-canvas]') {
      return {
        getBoundingClientRect: mockGetBoundingClientRect.mockReturnValue({
          left: 0,
          top: 0,
          width: 800,
          height: 600
        })
      };
    }
    return null;
  }),
  writable: true
});

describe('MouseEventManager', () => {
  let manager: MouseEventManager;
  let mockHandlers: jest.Mocked<MouseEventHandlers>;
  let canvasState: CanvasState;
  let mockCanvasElement: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock handlers
    mockHandlers = {
      onNodeDragStart: jest.fn(),
      onNodeDragMove: jest.fn(),
      onNodeDragEnd: jest.fn(),
      onConnectionStart: jest.fn(),
      onConnectionMove: jest.fn(),
      onConnectionEnd: jest.fn(),
      onCanvasPanStart: jest.fn(),
      onCanvasPanMove: jest.fn(),
      onCanvasPanEnd: jest.fn(),
      onModeChange: jest.fn(),
      onNodeHover: jest.fn(),
      onHandleHover: jest.fn(),
      onInteractionConflict: jest.fn()
    };

    // Setup canvas state
    canvasState = {
      zoom: 1,
      offset: { x: 0, y: 0 }
    };

    // Setup mock canvas element
    mockCanvasElement = {
      getBoundingClientRect: mockGetBoundingClientRect.mockReturnValue({
        left: 0,
        top: 0,
        width: 800,
        height: 600
      }),
      closest: jest.fn().mockReturnValue(null)
    } as any;

    // Create manager instance
    manager = new MouseEventManager(canvasState, mockHandlers);
  });

  afterEach(() => {
    manager.destroy();
  });

  describe('Initialization', () => {
    test('should initialize with idle state', () => {
      const state = manager.getState();
      expect(state.mode).toBe('idle');
      expect(state.activeNodeId).toBeNull();
      expect(state.isDragging).toBe(false);
      expect(state.isConnecting).toBe(false);
      expect(state.isPanning).toBe(false);
    });

    test('should attach global event listeners', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });

  describe('Node Dragging', () => {
    test('should start node dragging on mouse down', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node1', mockEvent, mockCanvasElement);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      
      // With drag threshold, it should start in preparing-drag mode
      expect(manager.getCurrentMode()).toBe('preparing-drag');
      expect(manager.getState().isDragging).toBe(false);
      
      // Simulate mouse move beyond threshold to trigger actual drag
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 110, // Move 10 pixels (beyond default threshold of 5)
        clientY: 160
      });
      
      // Directly call the drag threshold check method
      manager.checkDragThreshold(mouseMoveEvent);
      
      // Now it should be in dragging mode and call the handler
      expect(manager.getCurrentMode()).toBe('dragging-node');
      expect(manager.getState().isDragging).toBe(true);
      expect(mockHandlers.onNodeDragStart).toHaveBeenCalledWith(
        'node1',
        { x: 100, y: 150 },
        expect.any(Object)
      );
    });

    test('should not start node dragging if already in another mode', () => {
      // First start a connection
      const connectionEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 50,
        clientY: 75
      } as any;

      manager.handleHandleMouseDown('node1', 'output', connectionEvent, mockCanvasElement);

      // Then try to start node dragging
      const nodeEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node2', nodeEvent, mockCanvasElement);

      // Should still be in connection mode
      expect(manager.getCurrentMode()).toBe('creating-connection');
      expect(mockHandlers.onNodeDragStart).not.toHaveBeenCalled();
    });

    test('should allow node dragging when not creating connections', () => {
      expect(manager.isNodeDraggingAllowed()).toBe(true);

      // Start connection
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleHandleMouseDown('node1', 'output', mockEvent, mockCanvasElement);
      expect(manager.isNodeDraggingAllowed()).toBe(false);
    });
  });

  describe('Connection Creation', () => {
    test('should start connection creation on handle mouse down', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleHandleMouseDown('node1', 'output', mockEvent, mockCanvasElement);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      expect(mockHandlers.onConnectionStart).toHaveBeenCalledWith(
        'node1',
        'output',
        { x: 100, y: 150 }
      );
      expect(manager.getCurrentMode()).toBe('creating-connection');
      expect(manager.getState().isConnecting).toBe(true);
    });

    test('should complete connection on handle mouse up', () => {
      // Start connection
      const startEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleHandleMouseDown('node1', 'output', startEvent, mockCanvasElement);

      // End connection
      const endEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
      } as any;

      manager.handleHandleMouseUp('node2', 'input', endEvent);

      expect(mockHandlers.onConnectionEnd).toHaveBeenCalledWith('node2', 'input');
      expect(manager.getCurrentMode()).toBe('idle');
      expect(manager.getState().isConnecting).toBe(false);
    });

    test('should cancel ongoing interaction when starting new connection', () => {
      // Start node dragging
      const dragEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 50,
        clientY: 75
      } as any;

      manager.handleNodeMouseDown('node1', dragEvent, mockCanvasElement);
      expect(manager.getCurrentMode()).toBe('preparing-drag');

      // Start connection (should cancel dragging)
      const connectionEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleHandleMouseDown('node2', 'output', connectionEvent, mockCanvasElement);

      expect(manager.getCurrentMode()).toBe('creating-connection');
      // Since we were in preparing-drag mode, no onNodeDragEnd should be called
      expect(mockHandlers.onNodeDragEnd).not.toHaveBeenCalled();
    });

    test('should keep handles interactive unless dragging node', () => {
      expect(manager.areHandlesInteractive()).toBe(true);

      // Start node dragging preparation
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node1', mockEvent, mockCanvasElement);
      // Handles should remain interactive during preparation
      expect(manager.areHandlesInteractive()).toBe(true);
      
      // Simulate mouse move beyond threshold to start actual dragging
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 110,
        clientY: 160
      });
      
      document.dispatchEvent(mouseMoveEvent);
      
      // Now handles should still be interactive (requirement 4.3)
      expect(manager.areHandlesInteractive()).toBe(true);
    });
  });

  describe('Canvas Panning', () => {
    test('should start canvas panning on canvas mouse down', () => {
      const mockEvent = {
        target: mockCanvasElement,
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleCanvasMouseDown(mockEvent, mockCanvasElement);

      expect(mockHandlers.onCanvasPanStart).toHaveBeenCalledWith({ x: 100, y: 150 });
      expect(manager.getCurrentMode()).toBe('panning-canvas');
      expect(manager.getState().isPanning).toBe(true);
    });

    test('should not start panning if not clicking on canvas element', () => {
      const otherElement = document.createElement('div');
      const mockEvent = {
        target: otherElement,
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleCanvasMouseDown(mockEvent, mockCanvasElement);

      expect(mockHandlers.onCanvasPanStart).not.toHaveBeenCalled();
      expect(manager.getCurrentMode()).toBe('idle');
    });

    test('should not start panning if already in another mode', () => {
      // Start connection first
      const connectionEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 50,
        clientY: 75
      } as any;

      manager.handleHandleMouseDown('node1', 'output', connectionEvent, mockCanvasElement);

      // Try to start panning
      const panEvent = {
        target: mockCanvasElement,
        preventDefault: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleCanvasMouseDown(panEvent, mockCanvasElement);

      expect(mockHandlers.onCanvasPanStart).not.toHaveBeenCalled();
      expect(manager.getCurrentMode()).toBe('creating-connection');
    });

    test('should only allow canvas panning when idle', () => {
      expect(manager.isCanvasPanningAllowed()).toBe(true);

      // Start connection
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleHandleMouseDown('node1', 'output', mockEvent, mockCanvasElement);
      expect(manager.isCanvasPanningAllowed()).toBe(false);
    });
  });

  describe('Mode Management', () => {
    test('should track interaction modes correctly', () => {
      expect(manager.isMode('idle')).toBe(true);
      expect(manager.isInteracting()).toBe(false);

      // Start node dragging
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node1', mockEvent, mockCanvasElement);

      expect(manager.isMode('preparing-drag')).toBe(true);
      expect(manager.isInteracting()).toBe(true);
    });

    test('should notify mode changes', () => {
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node1', mockEvent, mockCanvasElement);

      expect(mockHandlers.onModeChange).toHaveBeenCalledWith('preparing-drag');
    });
  });

  describe('Handle Hover', () => {
    test('should handle handle hover events', () => {
      manager.handleHandleHover('node1', 'output', true);
      expect(manager.getCurrentMode()).toBe('hovering-handle');

      manager.handleHandleHover('node1', 'output', false);
      expect(manager.getCurrentMode()).toBe('idle');
    });

    test('should not change mode when hovering if already interacting', () => {
      // Start dragging
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node1', mockEvent, mockCanvasElement);

      // Try to hover
      manager.handleHandleHover('node2', 'input', true);
      expect(manager.getCurrentMode()).toBe('preparing-drag');
    });
  });

  describe('Keyboard Events', () => {
    test('should cancel current interaction on Escape key', () => {
      // Start connection
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleHandleMouseDown('node1', 'output', mockEvent, mockCanvasElement);
      expect(manager.getCurrentMode()).toBe('creating-connection');

      // Simulate Escape key
      const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      manager.handleGlobalKeyDown(keyEvent);

      expect(manager.getCurrentMode()).toBe('idle');
      expect(mockHandlers.onConnectionEnd).toHaveBeenCalled();
    });
  });

  describe('State Management', () => {
    test('should update canvas state', () => {
      const newCanvasState = { zoom: 1.5, offset: { x: 100, y: 200 } };
      manager.updateCanvasState(newCanvasState);

      const state = manager.getState();
      expect(state.canvasState).toEqual(newCanvasState);
    });

    test('should update handlers', () => {
      const newHandlers = {
        onNodeDragStart: jest.fn()
      };

      manager.updateHandlers(newHandlers);

      // Start dragging to test new handler
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node1', mockEvent, mockCanvasElement);
      
      // Simulate mouse move beyond threshold to trigger actual drag
      const mouseMoveEvent = new MouseEvent('mousemove', {
        clientX: 110,
        clientY: 160
      });
      
      // Directly call the drag threshold check method
      manager.checkDragThreshold(mouseMoveEvent);
      
      expect(newHandlers.onNodeDragStart).toHaveBeenCalled();
    });

    test('should notify state change listeners', () => {
      const listener = jest.fn();
      const unsubscribe = manager.subscribe(listener);

      // Trigger state change
      const mockEvent = {
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        clientX: 100,
        clientY: 150
      } as any;

      manager.handleNodeMouseDown('node1', mockEvent, mockCanvasElement);

      expect(listener).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });
  });

  describe('Cleanup', () => {
    test('should remove event listeners on destroy', () => {
      manager.destroy();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function));
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
  });
});

describe('MouseEventUtils', () => {
  describe('shouldHandleEvent', () => {
    test('should handle events on regular elements', () => {
      const div = document.createElement('div');
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: div });

      expect(MouseEventUtils.shouldHandleEvent(event, div)).toBe(true);
    });

    test('should not handle events on form inputs', () => {
      const input = document.createElement('input');
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: input });

      expect(MouseEventUtils.shouldHandleEvent(event, input)).toBe(false);
    });

    test('should not handle events on node controls', () => {
      const button = document.createElement('button');
      button.className = 'node-control';
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: button });

      expect(MouseEventUtils.shouldHandleEvent(event, button)).toBe(false);
    });

    test('should not handle events on elements with ignore attribute', () => {
      const div = document.createElement('div');
      div.setAttribute('data-ignore-mouse-events', 'true');
      const event = new MouseEvent('click', { bubbles: true });
      Object.defineProperty(event, 'target', { value: div });

      expect(MouseEventUtils.shouldHandleEvent(event, div)).toBe(false);
    });
  });

  describe('getRelativeMousePosition', () => {
    test('should calculate relative mouse position', () => {
      const element = {
        getBoundingClientRect: () => ({ left: 100, top: 200 })
      } as HTMLElement;

      const event = { clientX: 150, clientY: 250 } as MouseEvent;
      const position = MouseEventUtils.getRelativeMousePosition(event, element);

      expect(position).toEqual({ x: 50, y: 50 });
    });
  });

  describe('isWithinDistance', () => {
    test('should check if points are within distance', () => {
      const point1 = { x: 0, y: 0 };
      const point2 = { x: 3, y: 4 };

      expect(MouseEventUtils.isWithinDistance(point1, point2, 5)).toBe(true);
      expect(MouseEventUtils.isWithinDistance(point1, point2, 4)).toBe(false);
    });
  });

  describe('calculateDragDistance', () => {
    test('should calculate drag distance', () => {
      const start = { x: 0, y: 0 };
      const current = { x: 3, y: 4 };

      const distance = MouseEventUtils.calculateDragDistance(start, current);
      expect(distance).toBe(5);
    });
  });
});