/**
 * Highlight Controller for PineGenie AI Animations
 * 
 * This module manages visual highlights and focus indicators for educational animations,
 * drawing attention to specific elements during strategy building explanations.
 * 
 * SAFE INTEGRATION: Uses existing DOM and styling systems without modification
 * PROTECTION: No changes to existing highlight or focus systems
 * 
 * Requirements: 3.1, 3.2, 3.4
 */

export interface HighlightConfig {
  /** Visual appearance settings */
  appearance: {
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    shadowBlur: number;
    shadowSpread: number;
    glowIntensity: number;
    pulseIntensity: number;
  };
  
  /** Color schemes for different highlight types */
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    focus: string;
    selection: string;
  };
  
  /** Animation settings */
  animation: {
    duration: number;
    easing: string;
    pulseCount: number;
    fadeInDuration: number;
    fadeOutDuration: number;
    scaleFactor: number;
  };
  
  /** Behavior settings */
  behavior: {
    autoRemove: boolean;
    autoRemoveDelay: number;
    stackHighlights: boolean;
    maxStackSize: number;
    preventOverlap: boolean;
    maintainAspectRatio: boolean;
  };
  
  /** Accessibility settings */
  accessibility: {
    enableAriaLabels: boolean;
    enableFocusManagement: boolean;
    enableScreenReaderSupport: boolean;
    highContrastMode: boolean;
  };
}

export interface HighlightStyle {
  type: 'border' | 'glow' | 'pulse' | 'outline' | 'background' | 'overlay';
  color: string;
  intensity: number;
  size: number;
  opacity: number;
  animation?: {
    type: 'pulse' | 'glow' | 'fade' | 'scale' | 'rotate';
    duration: number;
    iterations: number | 'infinite';
    direction: 'normal' | 'reverse' | 'alternate';
  };
}

export interface HighlightTarget {
  id: string;
  element: HTMLElement | string; // Element or selector
  type: 'node' | 'edge' | 'group' | 'area' | 'text';
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  priority: number;
  metadata?: Record<string, unknown>;
}

export interface ActiveHighlight {
  id: string;
  target: HighlightTarget;
  style: HighlightStyle;
  element: HTMLElement;
  overlayElement?: HTMLElement;
  startTime: number;
  duration: number;
  isActive: boolean;
  isPaused: boolean;
  animation?: Animation;
}

export interface HighlightEvent {
  type: 'highlight-added' | 'highlight-removed' | 'highlight-updated' | 'highlight-clicked';
  highlightId: string;
  target: HighlightTarget;
  timestamp: number;
  data?: Record<string, unknown>;
}

export type HighlightEventListener = (event: HighlightEvent) => void;

/**
 * Default highlight configuration
 */
export const DEFAULT_HIGHLIGHT_CONFIG: HighlightConfig = {
  appearance: {
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 8,
    shadowBlur: 15,
    shadowSpread: 2,
    glowIntensity: 0.8,
    pulseIntensity: 0.6
  },
  colors: {
    primary: '#4F46E5',
    secondary: '#7C3AED',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    focus: '#F97316',
    selection: '#EC4899'
  },
  animation: {
    duration: 1000,
    easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    pulseCount: 2,
    fadeInDuration: 300,
    fadeOutDuration: 200,
    scaleFactor: 1.05
  },
  behavior: {
    autoRemove: true,
    autoRemoveDelay: 3000,
    stackHighlights: false,
    maxStackSize: 3,
    preventOverlap: true,
    maintainAspectRatio: true
  },
  accessibility: {
    enableAriaLabels: true,
    enableFocusManagement: true,
    enableScreenReaderSupport: true,
    highContrastMode: false
  }
};

/**
 * Highlight Controller Class
 * 
 * Manages visual highlights and focus indicators for educational animations
 */
export class HighlightController {
  private config: HighlightConfig;
  private activeHighlights: Map<string, ActiveHighlight> = new Map();
  private listeners: Set<HighlightEventListener> = new Set();
  private overlayContainer: HTMLElement | null = null;
  private styleSheet: CSSStyleSheet | null = null;
  private animationFrame: number | null = null;
  private isInitialized: boolean = false;

  constructor(config: HighlightConfig = DEFAULT_HIGHLIGHT_CONFIG) {
    this.config = { ...config };
  }

  /**
   * Initialize highlight controller
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.createOverlayContainer();
    this.createStyleSheet();
    this.setupEventListeners();
    this.isInitialized = true;
  }

  /**
   * Add highlight to target element
   */
  addHighlight(
    id: string,
    target: HighlightTarget,
    style: Partial<HighlightStyle> = {},
    duration: number = this.config.animation.duration
  ): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Remove existing highlight with same ID
    this.removeHighlight(id);

    // Get target element
    const element = this.getTargetElement(target);
    if (!element) {
      console.warn(`Highlight target element not found: ${target.id}`);
      return;
    }

    // Create highlight style
    const highlightStyle: HighlightStyle = {
      type: 'glow',
      color: this.config.colors.primary,
      intensity: this.config.appearance.glowIntensity,
      size: this.config.appearance.borderWidth,
      opacity: 1,
      ...style
    };

    // Create active highlight
    const activeHighlight: ActiveHighlight = {
      id,
      target,
      style: highlightStyle,
      element,
      startTime: performance.now(),
      duration,
      isActive: true,
      isPaused: false
    };

    // Apply highlight
    this.applyHighlight(activeHighlight);

    // Store active highlight
    this.activeHighlights.set(id, activeHighlight);

    // Set up auto-removal
    if (this.config.behavior.autoRemove && duration > 0) {
      setTimeout(() => {
        this.removeHighlight(id);
      }, duration);
    }

    // Notify listeners
    this.notifyListeners({
      type: 'highlight-added',
      highlightId: id,
      target,
      timestamp: Date.now()
    });
  }

  /**
   * Remove highlight
   */
  removeHighlight(id: string): void {
    const highlight = this.activeHighlights.get(id);
    if (!highlight) return;

    // Stop animation
    if (highlight.animation) {
      highlight.animation.cancel();
    }

    // Remove visual effects
    this.removeHighlightEffects(highlight);

    // Remove from active highlights
    this.activeHighlights.delete(id);

    // Notify listeners
    this.notifyListeners({
      type: 'highlight-removed',
      highlightId: id,
      target: highlight.target,
      timestamp: Date.now()
    });
  }

  /**
   * Update highlight style
   */
  updateHighlight(id: string, style: Partial<HighlightStyle>): void {
    const highlight = this.activeHighlights.get(id);
    if (!highlight) return;

    // Update style
    highlight.style = { ...highlight.style, ...style };

    // Reapply highlight
    this.applyHighlight(highlight);

    // Notify listeners
    this.notifyListeners({
      type: 'highlight-updated',
      highlightId: id,
      target: highlight.target,
      timestamp: Date.now(),
      data: { newStyle: style }
    });
  }

  /**
   * Pause highlight animation
   */
  pauseHighlight(id: string): void {
    const highlight = this.activeHighlights.get(id);
    if (!highlight || !highlight.animation) return;

    highlight.animation.pause();
    highlight.isPaused = true;
  }

  /**
   * Resume highlight animation
   */
  resumeHighlight(id: string): void {
    const highlight = this.activeHighlights.get(id);
    if (!highlight || !highlight.animation) return;

    highlight.animation.play();
    highlight.isPaused = false;
  }

  /**
   * Clear all highlights
   */
  clearAllHighlights(): void {
    const highlightIds = Array.from(this.activeHighlights.keys());
    highlightIds.forEach(id => this.removeHighlight(id));
  }

  /**
   * Create pulse highlight
   */
  createPulseHighlight(
    id: string,
    target: HighlightTarget,
    color: string = this.config.colors.primary,
    pulseCount: number = this.config.animation.pulseCount
  ): void {
    this.addHighlight(id, target, {
      type: 'pulse',
      color,
      intensity: this.config.appearance.pulseIntensity,
      animation: {
        type: 'pulse',
        duration: this.config.animation.duration,
        iterations: pulseCount,
        direction: 'alternate'
      }
    });
  }

  /**
   * Create glow highlight
   */
  createGlowHighlight(
    id: string,
    target: HighlightTarget,
    color: string = this.config.colors.primary,
    intensity: number = this.config.appearance.glowIntensity
  ): void {
    this.addHighlight(id, target, {
      type: 'glow',
      color,
      intensity,
      size: this.config.appearance.shadowBlur
    });
  }

  /**
   * Create border highlight
   */
  createBorderHighlight(
    id: string,
    target: HighlightTarget,
    color: string = this.config.colors.primary,
    width: number = this.config.appearance.borderWidth
  ): void {
    this.addHighlight(id, target, {
      type: 'border',
      color,
      size: width,
      opacity: 1
    });
  }

  /**
   * Create focus highlight
   */
  createFocusHighlight(
    id: string,
    target: HighlightTarget,
    color: string = this.config.colors.focus
  ): void {
    this.addHighlight(id, target, {
      type: 'outline',
      color,
      size: this.config.appearance.borderWidth,
      animation: {
        type: 'pulse',
        duration: 800,
        iterations: 'infinite',
        direction: 'alternate'
      }
    });
  }

  /**
   * Create selection highlight
   */
  createSelectionHighlight(
    id: string,
    target: HighlightTarget,
    color: string = this.config.colors.selection
  ): void {
    this.addHighlight(id, target, {
      type: 'background',
      color,
      opacity: 0.2,
      animation: {
        type: 'fade',
        duration: this.config.animation.fadeInDuration,
        iterations: 1,
        direction: 'normal'
      }
    });
  }

  /**
   * Highlight multiple targets in sequence
   */
  highlightSequence(
    targets: Array<{
      id: string;
      target: HighlightTarget;
      style?: Partial<HighlightStyle>;
      delay?: number;
      duration?: number;
    }>,
    staggerDelay: number = 300
  ): void {
    targets.forEach((item, index) => {
      const delay = (item.delay || 0) + (index * staggerDelay);
      
      setTimeout(() => {
        this.addHighlight(
          item.id,
          item.target,
          item.style,
          item.duration
        );
      }, delay);
    });
  }

  /**
   * Highlight multiple targets simultaneously
   */
  highlightGroup(
    targets: Array<{
      id: string;
      target: HighlightTarget;
      style?: Partial<HighlightStyle>;
      duration?: number;
    }>,
    groupStyle?: Partial<HighlightStyle>
  ): void {
    targets.forEach(item => {
      const style = groupStyle ? { ...groupStyle, ...item.style } : item.style;
      this.addHighlight(item.id, item.target, style, item.duration);
    });
  }

  /**
   * Create highlight trail effect
   */
  createTrailEffect(
    baseId: string,
    targets: HighlightTarget[],
    color: string = this.config.colors.primary,
    trailDelay: number = 100
  ): void {
    targets.forEach((target, index) => {
      const id = `${baseId}_trail_${index}`;
      const delay = index * trailDelay;
      const opacity = Math.max(0.2, 1 - (index * 0.2));
      
      setTimeout(() => {
        this.addHighlight(id, target, {
          type: 'glow',
          color,
          opacity,
          intensity: this.config.appearance.glowIntensity * opacity
        });
      }, delay);
    });
  }

  /**
   * Subscribe to highlight events
   */
  subscribe(listener: HighlightEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get active highlights
   */
  getActiveHighlights(): ActiveHighlight[] {
    return Array.from(this.activeHighlights.values());
  }

  /**
   * Get highlight by ID
   */
  getHighlight(id: string): ActiveHighlight | undefined {
    return this.activeHighlights.get(id);
  }

  /**
   * Check if highlight exists
   */
  hasHighlight(id: string): boolean {
    return this.activeHighlights.has(id);
  }

  /**
   * Apply highlight to element
   */
  private applyHighlight(highlight: ActiveHighlight): void {
    const { element, style } = highlight;

    switch (style.type) {
      case 'border':
        this.applyBorderHighlight(element, style);
        break;
      case 'glow':
        this.applyGlowHighlight(element, style);
        break;
      case 'pulse':
        this.applyPulseHighlight(highlight);
        break;
      case 'outline':
        this.applyOutlineHighlight(element, style);
        break;
      case 'background':
        this.applyBackgroundHighlight(element, style);
        break;
      case 'overlay':
        this.applyOverlayHighlight(highlight);
        break;
    }

    // Apply animation if specified
    if (style.animation) {
      this.applyAnimation(highlight);
    }
  }

  /**
   * Apply border highlight
   */
  private applyBorderHighlight(element: HTMLElement, style: HighlightStyle): void {
    element.style.border = `${style.size}px ${this.config.appearance.borderStyle} ${style.color}`;
    element.style.borderRadius = `${this.config.appearance.borderRadius}px`;
    element.style.opacity = style.opacity.toString();
  }

  /**
   * Apply glow highlight
   */
  private applyGlowHighlight(element: HTMLElement, style: HighlightStyle): void {
    const shadowSize = style.size || this.config.appearance.shadowBlur;
    const shadowSpread = this.config.appearance.shadowSpread;
    
    element.style.boxShadow = `0 0 ${shadowSize}px ${shadowSpread}px ${style.color}`;
    element.style.opacity = style.opacity.toString();
  }

  /**
   * Apply pulse highlight
   */
  private applyPulseHighlight(highlight: ActiveHighlight): void {
    const { element, style } = highlight;
    
    // Set initial glow
    this.applyGlowHighlight(element, style);
    
    // Animation will be applied separately
  }

  /**
   * Apply outline highlight
   */
  private applyOutlineHighlight(element: HTMLElement, style: HighlightStyle): void {
    element.style.outline = `${style.size}px solid ${style.color}`;
    element.style.outlineOffset = '2px';
    element.style.opacity = style.opacity.toString();
  }

  /**
   * Apply background highlight
   */
  private applyBackgroundHighlight(element: HTMLElement, style: HighlightStyle): void {
    const originalBackground = element.style.backgroundColor;
    element.style.backgroundColor = style.color;
    element.style.opacity = style.opacity.toString();
    
    // Store original background for restoration
    element.dataset.originalBackground = originalBackground;
  }

  /**
   * Apply overlay highlight
   */
  private applyOverlayHighlight(highlight: ActiveHighlight): void {
    if (!this.overlayContainer) return;

    const { element, style } = highlight;
    const rect = element.getBoundingClientRect();
    
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'highlight-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background-color: ${style.color};
      opacity: ${style.opacity};
      pointer-events: none;
      border-radius: ${this.config.appearance.borderRadius}px;
      z-index: 9999;
    `;
    
    this.overlayContainer.appendChild(overlay);
    highlight.overlayElement = overlay;
  }

  /**
   * Apply animation to highlight
   */
  private applyAnimation(highlight: ActiveHighlight): void {
    const { element, style } = highlight;
    const animation = style.animation;
    if (!animation) return;

    let keyframes: Keyframe[] = [];

    switch (animation.type) {
      case 'pulse':
        keyframes = [
          { transform: 'scale(1)', opacity: '1' },
          { transform: `scale(${this.config.animation.scaleFactor})`, opacity: '0.7' },
          { transform: 'scale(1)', opacity: '1' }
        ];
        break;
      case 'glow':
        keyframes = [
          { boxShadow: `0 0 0px 0px ${style.color}` },
          { boxShadow: `0 0 ${style.size * 2}px ${this.config.appearance.shadowSpread}px ${style.color}` },
          { boxShadow: `0 0 0px 0px ${style.color}` }
        ];
        break;
      case 'fade':
        keyframes = [
          { opacity: '0' },
          { opacity: style.opacity.toString() }
        ];
        break;
      case 'scale':
        keyframes = [
          { transform: 'scale(1)' },
          { transform: `scale(${this.config.animation.scaleFactor})` },
          { transform: 'scale(1)' }
        ];
        break;
      case 'rotate':
        keyframes = [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' }
        ];
        break;
    }

    const animationOptions: KeyframeAnimationOptions = {
      duration: animation.duration,
      iterations: animation.iterations,
      direction: animation.direction,
      easing: this.config.animation.easing,
      fill: 'forwards'
    };

    highlight.animation = element.animate(keyframes, animationOptions);
  }

  /**
   * Remove highlight effects
   */
  private removeHighlightEffects(highlight: ActiveHighlight): void {
    const { element, style } = highlight;

    switch (style.type) {
      case 'border':
        element.style.border = '';
        element.style.borderRadius = '';
        break;
      case 'glow':
      case 'pulse':
        element.style.boxShadow = '';
        break;
      case 'outline':
        element.style.outline = '';
        element.style.outlineOffset = '';
        break;
      case 'background':
        const originalBackground = element.dataset.originalBackground || '';
        element.style.backgroundColor = originalBackground;
        delete element.dataset.originalBackground;
        break;
      case 'overlay':
        if (highlight.overlayElement) {
          highlight.overlayElement.remove();
        }
        break;
    }

    // Reset opacity
    element.style.opacity = '';
  }

  /**
   * Get target element
   */
  private getTargetElement(target: HighlightTarget): HTMLElement | null {
    if (typeof target.element === 'string') {
      return document.querySelector(target.element) as HTMLElement;
    }
    return target.element;
  }

  /**
   * Create overlay container
   */
  private createOverlayContainer(): void {
    this.overlayContainer = document.createElement('div');
    this.overlayContainer.id = 'highlight-overlay-container';
    this.overlayContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9998;
    `;
    document.body.appendChild(this.overlayContainer);
  }

  /**
   * Create style sheet
   */
  private createStyleSheet(): void {
    const style = document.createElement('style');
    style.textContent = `
      .highlight-overlay {
        transition: all ${this.config.animation.fadeInDuration}ms ${this.config.animation.easing};
      }
      
      .highlight-pulse {
        animation: highlight-pulse ${this.config.animation.duration}ms ${this.config.animation.easing} infinite;
      }
      
      @keyframes highlight-pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(${this.config.animation.scaleFactor}); opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for clicks on highlighted elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      this.activeHighlights.forEach((highlight, id) => {
        if (highlight.element === target || highlight.element.contains(target)) {
          this.notifyListeners({
            type: 'highlight-clicked',
            highlightId: id,
            target: highlight.target,
            timestamp: Date.now(),
            data: { clickEvent: event }
          });
        }
      });
    });

    // Handle window resize for overlay positioning
    window.addEventListener('resize', () => {
      this.activeHighlights.forEach(highlight => {
        if (highlight.overlayElement) {
          const rect = highlight.element.getBoundingClientRect();
          const overlay = highlight.overlayElement;
          overlay.style.top = `${rect.top}px`;
          overlay.style.left = `${rect.left}px`;
          overlay.style.width = `${rect.width}px`;
          overlay.style.height = `${rect.height}px`;
        }
      });
    });
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: HighlightEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Highlight event listener error:', error);
      }
    });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<HighlightConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): HighlightConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.clearAllHighlights();
    
    if (this.overlayContainer) {
      this.overlayContainer.remove();
      this.overlayContainer = null;
    }
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.listeners.clear();
    this.isInitialized = false;
  }
}

/**
 * Create highlight controller instance
 */
export function createHighlightController(config?: Partial<HighlightConfig>): HighlightController {
  const fullConfig = config ? { ...DEFAULT_HIGHLIGHT_CONFIG, ...config } : DEFAULT_HIGHLIGHT_CONFIG;
  return new HighlightController(fullConfig);
}

/**
 * Highlight utilities
 */
export const HighlightUtils = {
  /**
   * Create highlight target from element
   */
  createTarget(
    id: string,
    element: HTMLElement | string,
    type: 'node' | 'edge' | 'group' | 'area' | 'text' = 'node',
    priority: number = 1
  ): HighlightTarget {
    return {
      id,
      element,
      type,
      priority,
      bounds: typeof element !== 'string' ? {
        x: element.offsetLeft,
        y: element.offsetTop,
        width: element.offsetWidth,
        height: element.offsetHeight
      } : undefined
    };
  },

  /**
   * Create highlight style
   */
  createStyle(
    type: 'border' | 'glow' | 'pulse' | 'outline' | 'background' | 'overlay',
    color: string,
    options: Partial<HighlightStyle> = {}
  ): HighlightStyle {
    return {
      type,
      color,
      intensity: 1,
      size: 3,
      opacity: 1,
      ...options
    };
  },

  /**
   * Get color by semantic meaning
   */
  getSemanticColor(meaning: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary'): string {
    const colors = {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
      primary: '#4F46E5',
      secondary: '#7C3AED'
    };
    return colors[meaning];
  },

  /**
   * Calculate optimal highlight size
   */
  calculateOptimalSize(element: HTMLElement): number {
    const area = element.offsetWidth * element.offsetHeight;
    const baseSize = 3;
    const scaleFactor = Math.sqrt(area) / 100;
    return Math.max(baseSize, Math.min(10, baseSize * scaleFactor));
  },

  /**
   * Check if highlights overlap
   */
  checkOverlap(target1: HighlightTarget, target2: HighlightTarget): boolean {
    if (!target1.bounds || !target2.bounds) return false;

    const rect1 = target1.bounds;
    const rect2 = target2.bounds;

    return !(
      rect1.x + rect1.width < rect2.x ||
      rect2.x + rect2.width < rect1.x ||
      rect1.y + rect1.height < rect2.y ||
      rect2.y + rect2.height < rect1.y
    );
  }
};