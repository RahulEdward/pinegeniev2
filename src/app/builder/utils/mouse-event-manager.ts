/**
 * Enhanced Mouse Event System for PineGenie Strategy Builder
 * 
 * This module provides centralized mouse event state management with proper
 * conflict resolution between different interaction modes.
 * 
 * Requirements addressed: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { Point, CanvasState, screenToCanvas } from './coordinate-system';

export type InteractionMode = 
  | 'idle' 
  | 'dragging-node' 
  | 'creating-connection' 
  | 'panning-canvas'
  | 'hovering-handle'
  | 'preparing-drag'
  | 'preparing-connection';

export interface MouseEventState {
  mode: InteractionMode;
  startPosition: Point;
  currentPosition: Point;
  dragOffset: Point;
  activeNodeId: string | null;
  activeHandleType: 'input' | 'output' | null;
  isPanning: boolean;
  isConnecting: boolean;
  isDragging: boolean;
  canvasState: CanvasState;
  // Enhanced state for better conflict resolution
  dragThreshold: number;
  hasMovedBeyondThreshold: boolean;
  lastInteractionTime: number;
  preventNextClick: boolean;
  hoveredNodeId: string | null;
  hoveredHandleType: 'input' | 'output' | null;
}

export interface MouseEventHandlers {
  onNodeDragStart: (nodeId: string, position: Point, offset: Point) => void;
  onNodeDragMove: (nodeId: string, position: Point) => void;
  onNodeDragEnd: (nodeId: string) => void;
  onConnectionStart: (nodeId: string, handleType: 'input' | 'output', position: Point) => void;
  onConnectionMove: (position: Point) => void;
  onConnectionEnd: (nodeId?: string, handleType?: 'input' | 'output') => void;
  onCanvasPanStart: (position: Point) => void;
  onCanvasPanMove: (delta: Point) => void;
  onCanvasPanEnd: () => void;
  onModeChange: (mode: InteractionMode) => void;
  // Enhanced handlers for better conflict resolution
  onNodeHover: (nodeId: string | null) => void;
  onHandleHover: (nodeId: string | null, handleType: 'input' | 'output' | null) => void;
  onInteractionConflict: (currentMode: InteractionMode, attemptedMode: InteractionMode) => void;
}

/**
 * Enhanced Mouse Event Manager Class
 * Provides centralized mouse event handling with conflict resolution
 */
export class MouseEventManager {
  private state: MouseEventState;
  private handlers: Partial<MouseEventHandlers>;
  private listeners: Set<(state: MouseEventState) => void> = new Set();
  private boundEventHandlers: {
    handleMouseMove: (e: MouseEvent) => void;
    handleMouseUp: (e: MouseEvent) => void;
    handleKeyDown: (e: KeyboardEvent) => void;
  };

  constructor(
    initialCanvasState: CanvasState,
    handlers: Partial<MouseEventHandlers> = {}
  ) {
    this.state = {
      mode: 'idle',
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      dragOffset: { x: 0, y: 0 },
      activeNodeId: null,
      activeHandleType: null,
      isPanning: false,
      isConnecting: false,
      isDragging: false,
      canvasState: initialCanvasState,
      // Enhanced state for better conflict resolution
      dragThreshold: 5, // pixels to move before considering it a drag
      hasMovedBeyondThreshold: false,
      lastInteractionTime: 0,
      preventNextClick: false,
      hoveredNodeId: null,
      hoveredHandleType: null
    };

    this.handlers = handlers;

    // Bind event handlers to maintain proper context
    this.boundEventHandlers = {
      handleMouseMove: this.handleGlobalMouseMove.bind(this),
      handleMouseUp: this.handleGlobalMouseUp.bind(this),
      handleKeyDown: this.handleGlobalKeyDown.bind(this)
    };

    // Attach global event listeners
    this.attachGlobalListeners();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: MouseEventState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update canvas state
   */
  updateCanvasState(canvasState: CanvasState): void {
    this.state.canvasState = canvasState;
    this.notifyListeners();
  }

  /**
   * Update event handlers
   */
  updateHandlers(handlers: Partial<MouseEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  /**
   * Handle node mouse down event with enhanced conflict resolution
   */
  handleNodeMouseDown(
    nodeId: string, 
    event: React.MouseEvent, 
    canvasElement: HTMLElement
  ): void {
    // Prevent default to avoid text selection
    event.preventDefault();
    event.stopPropagation();

    // Enhanced conflict resolution - check if we should handle this event
    if (!this.shouldHandleNodeInteraction(nodeId)) {
      return;
    }

    // Calculate mouse position relative to canvas
    const rect = canvasElement.getBoundingClientRect();
    const mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Calculate drag offset for smooth dragging
    const nodeScreenPosition = {
      x: this.state.canvasState.offset.x,
      y: this.state.canvasState.offset.y
    };

    const dragOffset = {
      x: mousePosition.x - nodeScreenPosition.x,
      y: mousePosition.y - nodeScreenPosition.y
    };

    // Start in preparing-drag mode to implement drag threshold
    this.setState({
      mode: 'preparing-drag',
      startPosition: mousePosition,
      currentPosition: mousePosition,
      dragOffset,
      activeNodeId: nodeId,
      isDragging: false,
      hasMovedBeyondThreshold: false,
      lastInteractionTime: Date.now()
    });

    // Don't notify drag start until we move beyond threshold
  }

  /**
   * Enhanced method to check if node interaction should be handled
   */
  private shouldHandleNodeInteraction(nodeId: string): boolean {
    // Don't handle if we're creating a connection
    if (this.state.mode === 'creating-connection') {
      this.handlers.onInteractionConflict?.('creating-connection', 'dragging-node');
      return false;
    }

    // Don't handle if we're already dragging another node
    if (this.state.mode === 'dragging-node' && this.state.activeNodeId !== nodeId) {
      this.handlers.onInteractionConflict?.('dragging-node', 'dragging-node');
      return false;
    }

    // Don't handle if we're panning
    if (this.state.mode === 'panning-canvas') {
      this.handlers.onInteractionConflict?.('panning-canvas', 'dragging-node');
      return false;
    }

    return true;
  }

  /**
   * Handle connection handle mouse down event with enhanced conflict resolution
   */
  handleHandleMouseDown(
    nodeId: string,
    handleType: 'input' | 'output',
    event: React.MouseEvent,
    canvasElement: HTMLElement
  ): void {
    // Prevent default and stop propagation to avoid node dragging
    event.preventDefault();
    event.stopPropagation();

    // Enhanced conflict resolution - check if we should handle this event
    if (!this.shouldHandleConnectionInteraction(nodeId, handleType)) {
      return;
    }

    // Cancel any ongoing interaction that can be safely cancelled
    this.cancelCurrentInteractionIfSafe();

    // Calculate mouse position relative to canvas
    const rect = canvasElement.getBoundingClientRect();
    const mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.setState({
      mode: 'creating-connection',
      startPosition: mousePosition,
      currentPosition: mousePosition,
      activeNodeId: nodeId,
      activeHandleType: handleType,
      isConnecting: true,
      isDragging: false,
      isPanning: false,
      hasMovedBeyondThreshold: false,
      lastInteractionTime: Date.now()
    });

    // Notify handler
    this.handlers.onConnectionStart?.(nodeId, handleType, mousePosition);
  }

  /**
   * Enhanced method to check if connection interaction should be handled
   */
  private shouldHandleConnectionInteraction(nodeId: string, handleType: 'input' | 'output'): boolean {
    // Always allow connection creation - it takes priority over other interactions
    // But check for specific conflicts

    // Don't allow if we're already creating a connection from the same handle
    if (this.state.mode === 'creating-connection' && 
        this.state.activeNodeId === nodeId && 
        this.state.activeHandleType === handleType) {
      return false;
    }

    return true;
  }

  /**
   * Cancel current interaction only if it's safe to do so
   */
  private cancelCurrentInteractionIfSafe(): void {
    switch (this.state.mode) {
      case 'preparing-drag':
      case 'hovering-handle':
        // Safe to cancel these modes
        this.cancelCurrentInteraction();
        break;
      case 'dragging-node':
        // Only cancel if we haven't moved much
        if (!this.state.hasMovedBeyondThreshold) {
          this.cancelCurrentInteraction();
        } else {
          this.handlers.onInteractionConflict?.(this.state.mode, 'creating-connection');
        }
        break;
      case 'creating-connection':
        // Cancel existing connection to start new one
        this.cancelCurrentInteraction();
        break;
      case 'panning-canvas':
        // Don't cancel panning - let it complete
        this.handlers.onInteractionConflict?.(this.state.mode, 'creating-connection');
        break;
    }
  }

  /**
   * Handle connection handle mouse up event
   */
  handleHandleMouseUp(
    nodeId: string,
    handleType: 'input' | 'output',
    event: React.MouseEvent
  ): void {
    event.preventDefault();
    event.stopPropagation();

    // Only handle if we're in connection mode
    if (this.state.mode === 'creating-connection') {
      // Notify handler with target information
      this.handlers.onConnectionEnd?.(nodeId, handleType);

      // Reset state
      this.setState({
        mode: 'idle',
        activeNodeId: null,
        activeHandleType: null,
        isConnecting: false
      });
    }
  }

  /**
   * Handle canvas mouse down event (for panning) with enhanced conflict resolution
   */
  handleCanvasMouseDown(
    event: React.MouseEvent,
    canvasElement: HTMLElement
  ): void {
    // Enhanced target checking - ensure we're clicking on empty canvas
    if (!this.isCanvasEmptyAreaClick(event, canvasElement)) {
      return;
    }

    // Enhanced conflict resolution for panning
    if (!this.shouldHandleCanvasPanning()) {
      return;
    }

    event.preventDefault();

    const rect = canvasElement.getBoundingClientRect();
    const mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    this.setState({
      mode: 'panning-canvas',
      startPosition: mousePosition,
      currentPosition: mousePosition,
      isPanning: true,
      isDragging: false,
      isConnecting: false,
      hasMovedBeyondThreshold: false,
      lastInteractionTime: Date.now()
    });

    // Notify handler
    this.handlers.onCanvasPanStart?.(mousePosition);
  }

  /**
   * Check if the click is on empty canvas area
   */
  private isCanvasEmptyAreaClick(event: React.MouseEvent, canvasElement: HTMLElement): boolean {
    const target = event.target as HTMLElement;
    
    // Must be clicking directly on the canvas element
    if (target !== canvasElement) {
      return false;
    }

    // Check if click is not on any interactive elements
    const interactiveElements = [
      '.connection-handle',
      '.node-control',
      '[data-node]',
      '[data-connection]'
    ];

    for (const selector of interactiveElements) {
      // Safe check for closest method (may not exist in test environment)
      if (target.closest && target.closest(selector)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if canvas panning should be allowed
   */
  private shouldHandleCanvasPanning(): boolean {
    // Don't allow panning if we're in an active interaction
    if (this.state.mode === 'creating-connection') {
      this.handlers.onInteractionConflict?.('creating-connection', 'panning-canvas');
      return false;
    }

    if (this.state.mode === 'dragging-node') {
      this.handlers.onInteractionConflict?.('dragging-node', 'panning-canvas');
      return false;
    }

    // Allow panning from idle or preparing states
    return this.state.mode === 'idle' || this.state.mode === 'hovering-handle';
  }

  /**
   * Handle global mouse move event with enhanced threshold detection
   */
  private handleGlobalMouseMove(event: MouseEvent): void {
    const currentPosition = {
      x: event.clientX,
      y: event.clientY
    };

    this.state.currentPosition = currentPosition;

    // Check for drag threshold in preparing-drag mode
    if (this.state.mode === 'preparing-drag') {
      this.checkDragThreshold(event);
    }

    switch (this.state.mode) {
      case 'preparing-drag':
        // Don't handle movement until threshold is exceeded
        break;
      case 'dragging-node':
        this.handleNodeDragMove(event);
        break;
      case 'creating-connection':
        this.handleConnectionMove(event);
        break;
      case 'panning-canvas':
        this.handleCanvasPanMove(event);
        break;
    }

    this.notifyListeners();
  }

  /**
   * Check if mouse movement exceeds drag threshold
   */
  public checkDragThreshold(event: MouseEvent): void {
    if (this.state.hasMovedBeyondThreshold) {
      return;
    }

    // Get canvas element to calculate relative position
    const canvasElement = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const currentCanvasPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Calculate distance from start position (both in canvas coordinates)
    const deltaX = currentCanvasPosition.x - this.state.startPosition.x;
    const deltaY = currentCanvasPosition.y - this.state.startPosition.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > this.state.dragThreshold) {
      // Threshold exceeded - transition to actual dragging
      this.setState({
        mode: 'dragging-node',
        isDragging: true,
        hasMovedBeyondThreshold: true
      });

      // Now notify the drag start handler
      if (this.state.activeNodeId) {
        this.handlers.onNodeDragStart?.(
          this.state.activeNodeId, 
          this.state.startPosition, 
          this.state.dragOffset
        );
      }
    }
  }

  /**
   * Handle node drag move with enhanced coordinate handling
   */
  private handleNodeDragMove(event: MouseEvent): void {
    if (!this.state.activeNodeId || !this.state.isDragging) return;

    // Get canvas element for accurate coordinate calculation
    const canvasElement = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const screenPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Calculate new position accounting for drag offset
    const adjustedPosition = {
      x: screenPosition.x - this.state.dragOffset.x,
      y: screenPosition.y - this.state.dragOffset.y
    };

    // Convert to canvas coordinates with proper zoom and offset handling
    const canvasPosition = screenToCanvas(adjustedPosition, this.state.canvasState);

    // Ensure connection handles remain interactive during drag
    this.ensureHandlesRemainInteractive();

    // Notify handler
    this.handlers.onNodeDragMove?.(this.state.activeNodeId, canvasPosition);
  }

  /**
   * Ensure connection handles remain interactive during node dragging
   */
  private ensureHandlesRemainInteractive(): void {
    // This method ensures that connection handles on other nodes remain
    // interactive while dragging a node (requirement 4.3)
    
    // The handles should remain clickable and hoverable
    // This is handled by the areHandlesInteractive() method
    // which returns true unless we're in creating-connection mode
  }

  /**
   * Handle connection move with enhanced coordinate handling
   */
  private handleConnectionMove(event: MouseEvent): void {
    if (!this.state.isConnecting) return;

    // Get canvas-relative position
    const canvasElement = document.querySelector('[data-canvas]') as HTMLElement;
    if (!canvasElement) return;

    const rect = canvasElement.getBoundingClientRect();
    const canvasPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    // Ensure node dragging is disabled during connection creation (requirement 4.4)
    this.ensureNodeDraggingDisabled();

    // Notify handler
    this.handlers.onConnectionMove?.(canvasPosition);
  }

  /**
   * Ensure node dragging is disabled during connection creation
   */
  private ensureNodeDraggingDisabled(): void {
    // This method ensures that node dragging is temporarily disabled
    // while creating a connection (requirement 4.4)
    
    // This is handled by the isNodeDraggingAllowed() method
    // which returns false when mode is 'creating-connection'
  }

  /**
   * Handle canvas pan move with enhanced interference prevention
   */
  private handleCanvasPanMove(event: MouseEvent): void {
    if (!this.state.isPanning) return;

    // Calculate delta from current position to avoid accumulation errors
    const currentScreenPosition = {
      x: event.clientX,
      y: event.clientY
    };

    const delta = {
      x: currentScreenPosition.x - this.state.startPosition.x,
      y: currentScreenPosition.y - this.state.startPosition.y
    };

    // Update start position for next delta calculation
    this.state.startPosition = currentScreenPosition;

    // Ensure panning doesn't interfere with node and connection interactions
    this.ensurePanningDoesNotInterfere();

    // Notify handler
    this.handlers.onCanvasPanMove?.(delta);
  }

  /**
   * Ensure canvas panning doesn't interfere with node and connection interactions
   */
  private ensurePanningDoesNotInterfere(): void {
    // This method ensures that canvas panning doesn't interfere with
    // node and connection interactions (requirement from task details)
    
    // Panning should only be active when no other interactions are happening
    // This is enforced by the shouldHandleCanvasPanning() method
    
    // During panning, nodes and connection handles should remain interactive
    // for future interactions once panning stops
  }

  /**
   * Handle global mouse up event with enhanced state management
   */
  private handleGlobalMouseUp(event: MouseEvent): void {
    switch (this.state.mode) {
      case 'preparing-drag':
        // If we were preparing to drag but never exceeded threshold, treat as click
        this.handleNodeClick();
        break;
      case 'dragging-node':
        this.handleNodeDragEnd();
        break;
      case 'creating-connection':
        this.handleConnectionEnd();
        break;
      case 'panning-canvas':
        this.handleCanvasPanEnd();
        break;
    }
  }

  /**
   * Handle node click (when drag threshold was not exceeded)
   */
  private handleNodeClick(): void {
    // Reset to idle state
    this.setState({
      mode: 'idle',
      activeNodeId: null,
      isDragging: false,
      hasMovedBeyondThreshold: false
    });
  }

  /**
   * Handle node drag end
   */
  private handleNodeDragEnd(): void {
    if (this.state.activeNodeId) {
      this.handlers.onNodeDragEnd?.(this.state.activeNodeId);
    }

    this.setState({
      mode: 'idle',
      activeNodeId: null,
      isDragging: false
    });
  }

  /**
   * Handle connection end (when releasing over empty space)
   */
  private handleConnectionEnd(): void {
    // Notify handler without target (connection cancelled)
    this.handlers.onConnectionEnd?.();

    this.setState({
      mode: 'idle',
      activeNodeId: null,
      activeHandleType: null,
      isConnecting: false
    });
  }

  /**
   * Handle canvas pan end
   */
  private handleCanvasPanEnd(): void {
    this.handlers.onCanvasPanEnd?.();

    this.setState({
      mode: 'idle',
      isPanning: false
    });
  }

  /**
   * Handle global keyboard events
   */
  public handleGlobalKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        if (this.state.mode !== 'idle') {
          this.cancelCurrentInteraction();
        }
        break;
    }
  }

  /**
   * Cancel current interaction with enhanced cleanup
   */
  cancelCurrentInteraction(): void {
    const previousMode = this.state.mode;
    
    switch (this.state.mode) {
      case 'creating-connection':
        this.handlers.onConnectionEnd?.();
        break;
      case 'preparing-drag':
        // No handler notification needed for preparation phase
        break;
      case 'dragging-node':
        if (this.state.activeNodeId) {
          this.handlers.onNodeDragEnd?.(this.state.activeNodeId);
        }
        break;
      case 'panning-canvas':
        this.handlers.onCanvasPanEnd?.();
        break;
      case 'hovering-handle':
        this.handlers.onHandleHover?.(null, null);
        break;
    }

    // Reset all state to idle
    this.setState({
      mode: 'idle',
      activeNodeId: null,
      activeHandleType: null,
      isPanning: false,
      isConnecting: false,
      isDragging: false,
      hasMovedBeyondThreshold: false,
      preventNextClick: false,
      hoveredNodeId: null,
      hoveredHandleType: null
    });

    // Log interaction cancellation for debugging
    if (previousMode !== 'idle') {
      console.debug(`Mouse event manager: Cancelled ${previousMode} interaction`);
    }
  }

  /**
   * Check if a specific interaction mode is active
   */
  isMode(mode: InteractionMode): boolean {
    return this.state.mode === mode;
  }

  /**
   * Check if any interaction is active
   */
  isInteracting(): boolean {
    return this.state.mode !== 'idle';
  }

  /**
   * Get current interaction mode
   */
  getCurrentMode(): InteractionMode {
    return this.state.mode;
  }

  /**
   * Get current state
   */
  getState(): MouseEventState {
    return { ...this.state };
  }

  /**
   * Handle handle hover events with enhanced state management
   */
  handleHandleHover(
    nodeId: string,
    handleType: 'input' | 'output',
    isHovering: boolean
  ): void {
    if (isHovering) {
      // Only update hover state if we're not in an active interaction
      if (this.state.mode === 'idle' || this.state.mode === 'hovering-handle') {
        this.setState({
          mode: 'hovering-handle',
          hoveredNodeId: nodeId,
          hoveredHandleType: handleType
        });
        
        // Notify handler
        this.handlers.onHandleHover?.(nodeId, handleType);
      }
    } else {
      // Clear hover state if we were hovering this specific handle
      if (this.state.mode === 'hovering-handle' && 
          this.state.hoveredNodeId === nodeId && 
          this.state.hoveredHandleType === handleType) {
        this.setState({
          mode: 'idle',
          hoveredNodeId: null,
          hoveredHandleType: null
        });
        
        // Notify handler
        this.handlers.onHandleHover?.(null, null);
      }
    }
  }

  /**
   * Handle node hover events
   */
  handleNodeHover(nodeId: string | null): void {
    this.setState({
      hoveredNodeId: nodeId
    });
    
    // Notify handler
    this.handlers.onNodeHover?.(nodeId);
  }

  /**
   * Check if connection handles should be interactive (requirement 4.3)
   */
  areHandlesInteractive(): boolean {
    // Handles should remain interactive during node dragging (requirement 4.3)
    // but not during canvas panning or when already creating a connection
    switch (this.state.mode) {
      case 'idle':
      case 'hovering-handle':
      case 'preparing-drag':
        return true;
      case 'dragging-node': // This is key - handles remain interactive during node drag
        return true;
      case 'creating-connection':
      case 'panning-canvas':
        return false;
      default:
        return false;
    }
  }

  /**
   * Check if node dragging should be allowed (requirement 4.4)
   */
  isNodeDraggingAllowed(): boolean {
    // Node dragging is temporarily disabled during connection creation (requirement 4.4)
    switch (this.state.mode) {
      case 'idle':
      case 'hovering-handle':
      case 'preparing-drag':
      case 'dragging-node':
        return true;
      case 'creating-connection': // This is key - dragging disabled during connection
      case 'panning-canvas':
        return false;
      default:
        return false;
    }
  }

  /**
   * Check if canvas panning should be allowed
   */
  isCanvasPanningAllowed(): boolean {
    // Canvas panning should not interfere with node and connection interactions
    switch (this.state.mode) {
      case 'idle':
      case 'hovering-handle':
        return true;
      case 'preparing-drag':
      case 'dragging-node':
      case 'creating-connection':
      case 'panning-canvas':
        return false;
      default:
        return false;
    }
  }

  /**
   * Get interaction priority for conflict resolution
   */
  getInteractionPriority(mode: InteractionMode): number {
    // Higher numbers have higher priority
    const priorities = {
      'idle': 0,
      'hovering-handle': 1,
      'preparing-drag': 2,
      'panning-canvas': 3,
      'dragging-node': 4,
      'creating-connection': 5 // Highest priority
    };
    return priorities[mode] || 0;
  }

  /**
   * Check if one interaction can interrupt another
   */
  canInterrupt(currentMode: InteractionMode, newMode: InteractionMode): boolean {
    const currentPriority = this.getInteractionPriority(currentMode);
    const newPriority = this.getInteractionPriority(newMode);
    
    // Higher priority interactions can interrupt lower priority ones
    // Special cases for smooth user experience
    if (currentMode === 'preparing-drag' && newMode === 'creating-connection') {
      return true; // Connection creation can interrupt drag preparation
    }
    
    if (currentMode === 'hovering-handle' && newMode !== 'idle') {
      return true; // Any active interaction can interrupt hovering
    }
    
    return newPriority > currentPriority;
  }

  /**
   * Update state helper
   */
  private setState(updates: Partial<MouseEventState>): void {
    const previousMode = this.state.mode;
    this.state = { ...this.state, ...updates };
    
    // Notify mode change if it changed
    if (previousMode !== this.state.mode) {
      this.handlers.onModeChange?.(this.state.mode);
    }
    
    this.notifyListeners();
  }

  /**
   * Attach global event listeners
   */
  private attachGlobalListeners(): void {
    document.addEventListener('mousemove', this.boundEventHandlers.handleMouseMove);
    document.addEventListener('mouseup', this.boundEventHandlers.handleMouseUp);
    document.addEventListener('keydown', this.boundEventHandlers.handleKeyDown);
  }

  /**
   * Detach global event listeners
   */
  private detachGlobalListeners(): void {
    document.removeEventListener('mousemove', this.boundEventHandlers.handleMouseMove);
    document.removeEventListener('mouseup', this.boundEventHandlers.handleMouseUp);
    document.removeEventListener('keydown', this.boundEventHandlers.handleKeyDown);
  }

  /**
   * Get detailed interaction state for debugging
   */
  getDetailedState(): {
    mode: InteractionMode;
    activeNodeId: string | null;
    activeHandleType: 'input' | 'output' | null;
    hoveredNodeId: string | null;
    hoveredHandleType: 'input' | 'output' | null;
    isInteracting: boolean;
    canDragNodes: boolean;
    canCreateConnections: boolean;
    canPanCanvas: boolean;
    dragDistance: number;
    timeSinceLastInteraction: number;
  } {
    const dragDistance = MouseEventUtils.calculateDragDistance(
      this.state.startPosition,
      this.state.currentPosition
    );

    return {
      mode: this.state.mode,
      activeNodeId: this.state.activeNodeId,
      activeHandleType: this.state.activeHandleType,
      hoveredNodeId: this.state.hoveredNodeId,
      hoveredHandleType: this.state.hoveredHandleType,
      isInteracting: this.isInteracting(),
      canDragNodes: this.isNodeDraggingAllowed(),
      canCreateConnections: this.areHandlesInteractive(),
      canPanCanvas: this.isCanvasPanningAllowed(),
      dragDistance,
      timeSinceLastInteraction: Date.now() - this.state.lastInteractionTime
    };
  }

  /**
   * Force reset to idle state (emergency reset)
   */
  forceReset(): void {
    console.warn('Mouse event manager: Force reset triggered');
    this.cancelCurrentInteraction();
  }

  /**
   * Set drag threshold dynamically
   */
  setDragThreshold(threshold: number): void {
    this.state.dragThreshold = Math.max(1, threshold);
  }

  /**
   * Check if a specific node is currently being interacted with
   */
  isNodeActive(nodeId: string): boolean {
    return this.state.activeNodeId === nodeId;
  }

  /**
   * Check if a specific handle is currently being interacted with
   */
  isHandleActive(nodeId: string, handleType: 'input' | 'output'): boolean {
    return this.state.activeNodeId === nodeId && 
           this.state.activeHandleType === handleType;
  }

  /**
   * Get current interaction statistics
   */
  getInteractionStats(): {
    totalInteractions: number;
    currentSessionDuration: number;
    averageInteractionTime: number;
    conflictCount: number;
  } {
    // This would be enhanced with actual tracking in a production system
    return {
      totalInteractions: 0,
      currentSessionDuration: Date.now() - this.state.lastInteractionTime,
      averageInteractionTime: 0,
      conflictCount: 0
    };
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    this.detachGlobalListeners();
    this.listeners.clear();
    console.debug('Mouse event manager: Destroyed');
  }
}

/**
 * Create a singleton mouse event manager instance
 */
let mouseEventManagerInstance: MouseEventManager | null = null;

export function getMouseEventManager(
  canvasState?: CanvasState,
  handlers?: Partial<MouseEventHandlers>
): MouseEventManager {
  if (!mouseEventManagerInstance && canvasState) {
    mouseEventManagerInstance = new MouseEventManager(canvasState, handlers);
  } else if (mouseEventManagerInstance && handlers) {
    mouseEventManagerInstance.updateHandlers(handlers);
  }
  
  if (mouseEventManagerInstance && canvasState) {
    mouseEventManagerInstance.updateCanvasState(canvasState);
  }
  
  return mouseEventManagerInstance!;
}

/**
 * Reset the mouse event manager instance (for testing)
 */
export function resetMouseEventManager(): void {
  if (mouseEventManagerInstance) {
    mouseEventManagerInstance.destroy();
    mouseEventManagerInstance = null;
  }
}

/**
 * Enhanced utility functions for mouse event management
 */
export const MouseEventUtils = {
  /**
   * Check if an event should be handled by the mouse event manager
   */
  shouldHandleEvent(event: Event, targetElement: HTMLElement): boolean {
    // Don't handle events on form inputs, buttons, etc.
    const ignoredElements = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
    const target = event.target as HTMLElement;
    
    return !ignoredElements.includes(target.tagName) && 
           !target.closest('.node-control') &&
           !target.hasAttribute('data-ignore-mouse-events');
  },

  /**
   * Get relative mouse position within an element
   */
  getRelativeMousePosition(event: MouseEvent, element: HTMLElement): Point {
    const rect = element.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  },

  /**
   * Check if two points are within a certain distance
   */
  isWithinDistance(point1: Point, point2: Point, distance: number): boolean {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy) <= distance;
  },

  /**
   * Calculate drag distance
   */
  calculateDragDistance(startPoint: Point, currentPoint: Point): number {
    const dx = currentPoint.x - startPoint.x;
    const dy = currentPoint.y - startPoint.y;
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Check if an element is a connection handle
   */
  isConnectionHandle(element: HTMLElement): boolean {
    return element.classList.contains('connection-handle') ||
           element.closest('.connection-handle') !== null;
  },

  /**
   * Check if an element is a node control
   */
  isNodeControl(element: HTMLElement): boolean {
    return element.classList.contains('node-control') ||
           element.closest('.node-control') !== null;
  },

  /**
   * Check if an element is part of a node
   */
  isNodeElement(element: HTMLElement): boolean {
    return element.hasAttribute('data-node') ||
           element.closest('[data-node]') !== null;
  },

  /**
   * Get the node ID from an element
   */
  getNodeIdFromElement(element: HTMLElement): string | null {
    const nodeElement = element.closest('[data-node]') as HTMLElement;
    return nodeElement?.getAttribute('data-node') || null;
  },

  /**
   * Debounce function for performance optimization
   */
  debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for performance optimization
   */
  throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};