/**
 * AI Animation Controller for PineGenie Strategy Builder
 * 
 * This module provides intelligent animation control for AI-generated strategy
 * building without modifying existing animation or canvas systems.
 * 
 * SAFE INTEGRATION: Uses existing animation systems without modification
 * PROTECTION: No changes to existing animation or canvas files
 * 
 * Requirements: 3.1, 3.2, 3.4
 */

import { Point } from '../../../app/builder/utils/coordinate-system';
import { BuilderNode, BuilderEdge } from '../../../app/builder/builder-state';
import { NodePlacement } from './node-placer';
import { AIConnection } from './connection-creator';

export interface AnimationConfig {
  /** Animation timing settings */
  timing: {
    nodeAppearDuration: number;
    connectionDrawDuration: number;
    highlightDuration: number;
    pauseBetweenSteps: number;
    totalTimeout: number;
  };
  /** Animation easing functions */
  easing: {
    nodeAppear: string;
    connectionDraw: string;
    highlight: string;
  };
  /** Visual effects settings */
  effects: {
    enableParticles: boolean;
    enableGlow: boolean;
    enablePulse: boolean;
    enableTrails: boolean;
  };
  /** Educational settings */
  education: {
    showExplanations: boolean;
    explanationDuration: number;
    highlightRelatedElements: boolean;
    pauseForUserInput: boolean;
  };
}

export interface AnimationSequence {
  id: string;
  name: string;
  description: string;
  steps: AnimationStep[];
  totalDuration: number;
  canPause: boolean;
  canReplay: boolean;
}

export interface AnimationStep {
  id: string;
  type: 'node-appear' | 'connection-draw' | 'highlight' | 'explanation' | 'pause';
  startTime: number;
  duration: number;
  target?: string; // Node or edge ID
  position?: Point;
  explanation?: string;
  data?: Record<string, unknown>;
}

export interface AnimationState {
  currentSequence: AnimationSequence | null;
  currentStepIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  playbackSpeed: number;
  startTime: number;
  elapsedTime: number;
}

export interface AnimationControls {
  play: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  replay: () => Promise<void>;
  skipToStep: (stepIndex: number) => void;
  setSpeed: (speed: number) => void;
}

/**
 * Default animation configuration
 */
export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  timing: {
    nodeAppearDuration: 500,
    connectionDrawDuration: 800,
    highlightDuration: 1000,
    pauseBetweenSteps: 300,
    totalTimeout: 30000
  },
  easing: {
    nodeAppear: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    connectionDraw: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    highlight: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  effects: {
    enableParticles: true,
    enableGlow: true,
    enablePulse: true,
    enableTrails: false
  },
  education: {
    showExplanations: true,
    explanationDuration: 2000,
    highlightRelatedElements: true,
    pauseForUserInput: false
  }
};

/**
 * AI Animation Controller Class
 * 
 * Provides intelligent animation control for AI strategy building
 * without modifying existing animation systems.
 */
export class AIAnimationController {
  private config: AnimationConfig;
  private state: AnimationState;
  private animationFrame: number | null = null;
  private listeners: Set<(state: AnimationState) => void> = new Set();
  private stepCallbacks: Map<string, () => void> = new Map();

  constructor(config: AnimationConfig = DEFAULT_ANIMATION_CONFIG) {
    this.config = config;
    this.state = {
      currentSequence: null,
      currentStepIndex: -1,
      isPlaying: false,
      isPaused: false,
      playbackSpeed: 1.0,
      startTime: 0,
      elapsedTime: 0
    };
  }

  /**
   * Create animation sequence for strategy building
   */
  createStrategyBuildingSequence(
    placements: NodePlacement[],
    connections: AIConnection[],
    strategyName: string = 'AI Strategy'
  ): AnimationSequence {
    const steps: AnimationStep[] = [];
    let currentTime = 0;

    // Add introduction step
    steps.push({
      id: 'intro',
      type: 'explanation',
      startTime: currentTime,
      duration: this.config.education.explanationDuration,
      explanation: `Building ${strategyName} with AI assistance`
    });
    currentTime += this.config.education.explanationDuration + this.config.timing.pauseBetweenSteps;

    // Add node placement steps
    placements.forEach((placement, index) => {
      // Add explanation for this node
      if (this.config.education.showExplanations) {
        steps.push({
          id: `node_explanation_${placement.nodeId}`,
          type: 'explanation',
          startTime: currentTime,
          duration: this.config.education.explanationDuration,
          explanation: placement.reasoning,
          target: placement.nodeId
        });
        currentTime += this.config.education.explanationDuration;
      }

      // Add node appearance animation
      steps.push({
        id: `node_appear_${placement.nodeId}`,
        type: 'node-appear',
        startTime: currentTime,
        duration: this.config.timing.nodeAppearDuration,
        target: placement.nodeId,
        position: placement.position,
        data: {
          confidence: placement.confidence,
          animationDelay: placement.animationDelay
        }
      });
      currentTime += this.config.timing.nodeAppearDuration + this.config.timing.pauseBetweenSteps;

      // Add highlight step
      steps.push({
        id: `node_highlight_${placement.nodeId}`,
        type: 'highlight',
        startTime: currentTime,
        duration: this.config.timing.highlightDuration,
        target: placement.nodeId
      });
      currentTime += this.config.timing.highlightDuration + this.config.timing.pauseBetweenSteps;
    });

    // Add connection drawing steps
    connections.forEach((connection, index) => {
      // Add explanation for this connection
      if (this.config.education.showExplanations) {
        steps.push({
          id: `connection_explanation_${connection.id}`,
          type: 'explanation',
          startTime: currentTime,
          duration: this.config.education.explanationDuration,
          explanation: connection.reasoning,
          target: connection.id
        });
        currentTime += this.config.education.explanationDuration;
      }

      // Add connection drawing animation
      steps.push({
        id: `connection_draw_${connection.id}`,
        type: 'connection-draw',
        startTime: currentTime,
        duration: this.config.timing.connectionDrawDuration,
        target: connection.id,
        data: {
          sourceNodeId: connection.sourceNodeId,
          targetNodeId: connection.targetNodeId,
          confidence: connection.confidence,
          animationDelay: connection.animationDelay
        }
      });
      currentTime += this.config.timing.connectionDrawDuration + this.config.timing.pauseBetweenSteps;
    });

    // Add completion step
    steps.push({
      id: 'completion',
      type: 'explanation',
      startTime: currentTime,
      duration: this.config.education.explanationDuration,
      explanation: `${strategyName} construction completed! The strategy is now ready for use.`
    });
    currentTime += this.config.education.explanationDuration;

    return {
      id: `strategy_build_${Date.now()}`,
      name: `Building ${strategyName}`,
      description: `Animated construction of ${strategyName} with ${placements.length} nodes and ${connections.length} connections`,
      steps,
      totalDuration: currentTime,
      canPause: true,
      canReplay: true
    };
  }

  /**
   * Create animation sequence for node placement only
   */
  createNodePlacementSequence(
    placements: NodePlacement[],
    title: string = 'Node Placement'
  ): AnimationSequence {
    const steps: AnimationStep[] = [];
    let currentTime = 0;

    placements.forEach((placement, index) => {
      // Add explanation
      if (this.config.education.showExplanations) {
        steps.push({
          id: `placement_explanation_${placement.nodeId}`,
          type: 'explanation',
          startTime: currentTime,
          duration: this.config.education.explanationDuration,
          explanation: `Placing ${placement.nodeId}: ${placement.reasoning}`,
          target: placement.nodeId
        });
        currentTime += this.config.education.explanationDuration;
      }

      // Add node appearance
      steps.push({
        id: `placement_appear_${placement.nodeId}`,
        type: 'node-appear',
        startTime: currentTime,
        duration: this.config.timing.nodeAppearDuration,
        target: placement.nodeId,
        position: placement.position,
        data: { confidence: placement.confidence }
      });
      currentTime += this.config.timing.nodeAppearDuration + this.config.timing.pauseBetweenSteps;
    });

    return {
      id: `node_placement_${Date.now()}`,
      name: title,
      description: `Animated placement of ${placements.length} nodes`,
      steps,
      totalDuration: currentTime,
      canPause: true,
      canReplay: true
    };
  }

  /**
   * Create animation sequence for connection creation only
   */
  createConnectionSequence(
    connections: AIConnection[],
    title: string = 'Connection Creation'
  ): AnimationSequence {
    const steps: AnimationStep[] = [];
    let currentTime = 0;

    connections.forEach((connection, index) => {
      // Add explanation
      if (this.config.education.showExplanations) {
        steps.push({
          id: `connection_explanation_${connection.id}`,
          type: 'explanation',
          startTime: currentTime,
          duration: this.config.education.explanationDuration,
          explanation: `Connecting nodes: ${connection.reasoning}`,
          target: connection.id
        });
        currentTime += this.config.education.explanationDuration;
      }

      // Add connection drawing
      steps.push({
        id: `connection_draw_${connection.id}`,
        type: 'connection-draw',
        startTime: currentTime,
        duration: this.config.timing.connectionDrawDuration,
        target: connection.id,
        data: {
          sourceNodeId: connection.sourceNodeId,
          targetNodeId: connection.targetNodeId,
          confidence: connection.confidence
        }
      });
      currentTime += this.config.timing.connectionDrawDuration + this.config.timing.pauseBetweenSteps;
    });

    return {
      id: `connection_creation_${Date.now()}`,
      name: title,
      description: `Animated creation of ${connections.length} connections`,
      steps,
      totalDuration: currentTime,
      canPause: true,
      canReplay: true
    };
  }

  /**
   * Play animation sequence
   */
  async playSequence(sequence: AnimationSequence): Promise<void> {
    return new Promise((resolve, reject) => {
      this.state.currentSequence = sequence;
      this.state.currentStepIndex = 0;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.startTime = performance.now();
      this.state.elapsedTime = 0;

      this.notifyListeners();

      const animate = () => {
        if (!this.state.isPlaying) {
          resolve();
          return;
        }

        if (this.state.isPaused) {
          this.animationFrame = requestAnimationFrame(animate);
          return;
        }

        const currentTime = performance.now();
        this.state.elapsedTime = (currentTime - this.state.startTime) * this.state.playbackSpeed;

        // Check for timeout
        if (this.state.elapsedTime > this.config.timing.totalTimeout) {
          this.stop();
          reject(new Error('Animation timeout'));
          return;
        }

        // Execute current steps
        this.executeCurrentSteps();

        // Check if animation is complete
        if (this.state.currentStepIndex >= sequence.steps.length) {
          this.state.isPlaying = false;
          this.notifyListeners();
          resolve();
          return;
        }

        this.animationFrame = requestAnimationFrame(animate);
      };

      this.animationFrame = requestAnimationFrame(animate);
    });
  }

  /**
   * Get animation controls
   */
  getControls(): AnimationControls {
    return {
      play: () => {
        if (this.state.currentSequence) {
          return this.playSequence(this.state.currentSequence);
        }
        return Promise.resolve();
      },

      pause: () => {
        this.state.isPaused = true;
        this.notifyListeners();
      },

      resume: () => {
        if (this.state.isPaused) {
          this.state.isPaused = false;
          this.state.startTime = performance.now() - this.state.elapsedTime / this.state.playbackSpeed;
          this.notifyListeners();
        }
      },

      stop: () => {
        this.stop();
      },

      replay: () => {
        if (this.state.currentSequence) {
          this.stop();
          return this.playSequence(this.state.currentSequence);
        }
        return Promise.resolve();
      },

      skipToStep: (stepIndex: number) => {
        if (this.state.currentSequence && stepIndex >= 0 && stepIndex < this.state.currentSequence.steps.length) {
          this.state.currentStepIndex = stepIndex;
          const step = this.state.currentSequence.steps[stepIndex];
          this.state.elapsedTime = step.startTime;
          this.state.startTime = performance.now() - this.state.elapsedTime / this.state.playbackSpeed;
          this.notifyListeners();
        }
      },

      setSpeed: (speed: number) => {
        const wasPlaying = this.state.isPlaying && !this.state.isPaused;
        if (wasPlaying) {
          // Adjust start time to maintain current position
          const currentRealTime = performance.now();
          const currentAnimationTime = this.state.elapsedTime;
          this.state.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
          this.state.startTime = currentRealTime - currentAnimationTime / this.state.playbackSpeed;
        } else {
          this.state.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
        }
        this.notifyListeners();
      }
    };
  }

  /**
   * Subscribe to animation state changes
   */
  subscribe(listener: (state: AnimationState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Register callback for specific animation step
   */
  onStep(stepId: string, callback: () => void): void {
    this.stepCallbacks.set(stepId, callback);
  }

  /**
   * Execute current animation steps
   */
  private executeCurrentSteps(): void {
    if (!this.state.currentSequence) return;

    const sequence = this.state.currentSequence;
    const currentTime = this.state.elapsedTime;

    // Find and execute all steps that should be running at current time
    for (let i = this.state.currentStepIndex; i < sequence.steps.length; i++) {
      const step = sequence.steps[i];
      
      if (step.startTime <= currentTime) {
        if (step.startTime + step.duration >= currentTime) {
          // Step is currently active
          this.executeStep(step, currentTime - step.startTime);
        }
        
        // Move to next step if this one is complete
        if (step.startTime + step.duration < currentTime) {
          this.state.currentStepIndex = i + 1;
        }
      } else {
        // Future steps, stop checking
        break;
      }
    }

    this.notifyListeners();
  }

  /**
   * Execute a single animation step
   */
  private executeStep(step: AnimationStep, stepProgress: number): void {
    const progress = Math.min(1, stepProgress / step.duration);
    
    // Call registered callback if exists
    const callback = this.stepCallbacks.get(step.id);
    if (callback && progress === 0) {
      // Only call callback once at the start of the step
      callback();
    }

    switch (step.type) {
      case 'node-appear':
        this.executeNodeAppearStep(step, progress);
        break;
      case 'connection-draw':
        this.executeConnectionDrawStep(step, progress);
        break;
      case 'highlight':
        this.executeHighlightStep(step, progress);
        break;
      case 'explanation':
        this.executeExplanationStep(step, progress);
        break;
      case 'pause':
        // Pause step doesn't need execution, just time
        break;
    }
  }

  /**
   * Execute node appearance animation step
   */
  private executeNodeAppearStep(step: AnimationStep, progress: number): void {
    if (!step.target || !step.position) return;

    // This would integrate with the actual DOM/Canvas animation system
    // For now, we just track the progress
    const easedProgress = this.applyEasing(progress, this.config.easing.nodeAppear);
    
    // Emit animation event that the UI can listen to
    this.emitAnimationEvent('node-appear', {
      nodeId: step.target,
      position: step.position,
      progress: easedProgress,
      data: step.data
    });
  }

  /**
   * Execute connection drawing animation step
   */
  private executeConnectionDrawStep(step: AnimationStep, progress: number): void {
    if (!step.target) return;

    const easedProgress = this.applyEasing(progress, this.config.easing.connectionDraw);
    
    // Emit animation event that the UI can listen to
    this.emitAnimationEvent('connection-draw', {
      connectionId: step.target,
      progress: easedProgress,
      data: step.data
    });
  }

  /**
   * Execute highlight animation step
   */
  private executeHighlightStep(step: AnimationStep, progress: number): void {
    if (!step.target) return;

    const easedProgress = this.applyEasing(progress, this.config.easing.highlight);
    
    // Emit animation event that the UI can listen to
    this.emitAnimationEvent('highlight', {
      targetId: step.target,
      progress: easedProgress,
      intensity: Math.sin(easedProgress * Math.PI * 4) * 0.5 + 0.5 // Pulsing effect
    });
  }

  /**
   * Execute explanation animation step
   */
  private executeExplanationStep(step: AnimationStep, progress: number): void {
    if (!step.explanation) return;

    // Emit animation event that the UI can listen to
    this.emitAnimationEvent('explanation', {
      text: step.explanation,
      progress,
      targetId: step.target
    });
  }

  /**
   * Apply easing function to progress
   */
  private applyEasing(progress: number, easingFunction: string): number {
    // Simple easing implementations
    switch (easingFunction) {
      case 'linear':
        return progress;
      case 'ease-in':
        return progress * progress;
      case 'ease-out':
        return 1 - Math.pow(1 - progress, 2);
      case 'ease-in-out':
        return progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      default:
        // For complex cubic-bezier, use approximation or return linear
        return progress;
    }
  }

  /**
   * Emit animation event
   */
  private emitAnimationEvent(type: string, data: Record<string, unknown>): void {
    // This would emit events that the UI components can listen to
    // For now, we just log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`Animation Event: ${type}`, data);
    }
  }

  /**
   * Stop animation
   */
  private stop(): void {
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentStepIndex = -1;
    this.state.elapsedTime = 0;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  /**
   * Get current animation state
   */
  getState(): AnimationState {
    return { ...this.state };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AnimationConfig {
    return { ...this.config };
  }

  /**
   * Clear all callbacks and listeners
   */
  cleanup(): void {
    this.stop();
    this.listeners.clear();
    this.stepCallbacks.clear();
  }
}

/**
 * Create a singleton AI animation controller instance
 */
let aiAnimationControllerInstance: AIAnimationController | null = null;

export function getAIAnimationController(): AIAnimationController {
  if (!aiAnimationControllerInstance) {
    aiAnimationControllerInstance = new AIAnimationController();
  }
  return aiAnimationControllerInstance;
}

/**
 * Reset the AI animation controller instance (for testing)
 */
export function resetAIAnimationController(): void {
  if (aiAnimationControllerInstance) {
    aiAnimationControllerInstance.cleanup();
  }
  aiAnimationControllerInstance = null;
}

/**
 * Utility functions for animation control
 */
export const AnimationUtils = {
  /**
   * Create simple fade-in sequence
   */
  createFadeInSequence(
    elements: Array<{ id: string; delay: number }>,
    duration: number = 500
  ): AnimationSequence {
    const steps: AnimationStep[] = [];
    let maxTime = 0;

    elements.forEach(element => {
      steps.push({
        id: `fade_in_${element.id}`,
        type: 'node-appear',
        startTime: element.delay,
        duration,
        target: element.id
      });
      maxTime = Math.max(maxTime, element.delay + duration);
    });

    return {
      id: `fade_in_${Date.now()}`,
      name: 'Fade In Animation',
      description: `Fade in ${elements.length} elements`,
      steps,
      totalDuration: maxTime,
      canPause: true,
      canReplay: true
    };
  },

  /**
   * Create staggered animation sequence
   */
  createStaggeredSequence(
    elements: string[],
    staggerDelay: number = 200,
    duration: number = 500
  ): AnimationSequence {
    const steps: AnimationStep[] = [];

    elements.forEach((elementId, index) => {
      steps.push({
        id: `stagger_${elementId}`,
        type: 'node-appear',
        startTime: index * staggerDelay,
        duration,
        target: elementId
      });
    });

    return {
      id: `stagger_${Date.now()}`,
      name: 'Staggered Animation',
      description: `Staggered animation of ${elements.length} elements`,
      steps,
      totalDuration: (elements.length - 1) * staggerDelay + duration,
      canPause: true,
      canReplay: true
    };
  },

  /**
   * Calculate optimal animation timing
   */
  calculateOptimalTiming(
    elementCount: number,
    maxTotalDuration: number = 10000
  ): { duration: number; staggerDelay: number } {
    const minDuration = 300;
    const maxDuration = 1000;
    const minStaggerDelay = 100;
    const maxStaggerDelay = 500;

    // Calculate based on element count and max duration
    const totalStaggerTime = maxTotalDuration * 0.7; // 70% for staggering
    const staggerDelay = Math.max(
      minStaggerDelay,
      Math.min(maxStaggerDelay, totalStaggerTime / elementCount)
    );

    const remainingTime = maxTotalDuration - (elementCount * staggerDelay);
    const duration = Math.max(minDuration, Math.min(maxDuration, remainingTime));

    return { duration, staggerDelay };
  },

  /**
   * Validate animation sequence
   */
  validateSequence(sequence: AnimationSequence): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!sequence.id) {
      errors.push('Sequence must have an ID');
    }

    if (!sequence.name) {
      warnings.push('Sequence should have a name');
    }

    if (sequence.steps.length === 0) {
      errors.push('Sequence must have at least one step');
    }

    // Check step timing
    sequence.steps.forEach((step, index) => {
      if (step.startTime < 0) {
        errors.push(`Step ${index} has negative start time`);
      }

      if (step.duration <= 0) {
        errors.push(`Step ${index} has invalid duration`);
      }

      if (step.startTime + step.duration > sequence.totalDuration) {
        warnings.push(`Step ${index} extends beyond sequence duration`);
      }
    });

    // Check for overlapping explanation steps
    const explanationSteps = sequence.steps.filter(s => s.type === 'explanation');
    for (let i = 0; i < explanationSteps.length - 1; i++) {
      const current = explanationSteps[i];
      const next = explanationSteps[i + 1];
      
      if (current.startTime + current.duration > next.startTime) {
        warnings.push('Overlapping explanation steps may cause confusion');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
};