/**
 * Step-by-Step Animation System for PineGenie AI
 * 
 * This module provides step-by-step animations for educational strategy building,
 * showing users how AI constructs trading strategies with visual feedback.
 * 
 * SAFE INTEGRATION: Uses existing canvas and node systems without modification
 * PROTECTION: No changes to existing animation or canvas files
 * 
 * Requirements: 3.1, 3.2, 3.4
 */

import { Point } from '../../../app/builder/utils/coordinate-system';
import { BuilderNode, BuilderEdge } from '../../../app/builder/builder-state';
import { AnimationSequence, AnimationStep, AnimationType, EasingFunction } from '../types/animation-types';

export interface StepAnimationConfig {
  /** Node appearance settings */
  nodeAnimation: {
    duration: number;
    easing: EasingFunction;
    scaleFrom: number;
    scaleTo: number;
    opacityFrom: number;
    opacityTo: number;
    enableGlow: boolean;
    glowColor: string;
    glowIntensity: number;
  };
  
  /** Connection drawing settings */
  connectionAnimation: {
    duration: number;
    easing: EasingFunction;
    strokeWidth: number;
    strokeColor: string;
    enableParticles: boolean;
    particleCount: number;
    particleSpeed: number;
  };
  
  /** Highlight effects */
  highlightAnimation: {
    duration: number;
    easing: EasingFunction;
    pulseCount: number;
    highlightColor: string;
    highlightOpacity: number;
    borderWidth: number;
  };
  
  /** Timing and flow */
  timing: {
    stepDelay: number;
    explanationDuration: number;
    pauseForUserInput: boolean;
    autoAdvance: boolean;
    maxTotalDuration: number;
  };
  
  /** Educational features */
  education: {
    showStepNumbers: boolean;
    showProgress: boolean;
    enableTooltips: boolean;
    highlightRelated: boolean;
    showReasoningBubbles: boolean;
  };
}

export interface AnimationStepData {
  id: string;
  type: 'node-placement' | 'connection-creation' | 'highlight' | 'explanation' | 'focus';
  title: string;
  description: string;
  reasoning: string;
  target?: {
    nodeId?: string;
    edgeId?: string;
    position?: Point;
    element?: HTMLElement;
  };
  animation: {
    duration: number;
    delay: number;
    easing: EasingFunction;
    properties: Record<string, { from: unknown; to: unknown }>;
  };
  education: {
    explanation: string;
    tips: string[];
    relatedConcepts: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  controls: {
    canPause: boolean;
    canSkip: boolean;
    requiresConfirmation: boolean;
  };
}

export interface AnimationProgress {
  currentStep: number;
  totalSteps: number;
  stepProgress: number; // 0-1 for current step
  totalProgress: number; // 0-1 for entire sequence
  elapsedTime: number;
  estimatedTimeRemaining: number;
  isPlaying: boolean;
  isPaused: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface AnimationControls {
  play(): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  next(): void;
  previous(): void;
  skipTo(stepIndex: number): void;
  setSpeed(speed: number): void;
  replay(): Promise<void>;
}

export interface AnimationEventData {
  type: 'step-started' | 'step-completed' | 'animation-paused' | 'animation-resumed' | 'animation-completed';
  stepIndex: number;
  stepData: AnimationStepData;
  progress: AnimationProgress;
  timestamp: number;
}

export type AnimationEventListener = (event: AnimationEventData) => void;

/**
 * Default step animation configuration
 */
export const DEFAULT_STEP_ANIMATION_CONFIG: StepAnimationConfig = {
  nodeAnimation: {
    duration: 800,
    easing: EasingFunction.EASE_IN_OUT,
    scaleFrom: 0.1,
    scaleTo: 1.0,
    opacityFrom: 0,
    opacityTo: 1,
    enableGlow: true,
    glowColor: '#4F46E5',
    glowIntensity: 0.6
  },
  connectionAnimation: {
    duration: 1200,
    easing: EasingFunction.EASE_OUT,
    strokeWidth: 3,
    strokeColor: '#10B981',
    enableParticles: true,
    particleCount: 8,
    particleSpeed: 2
  },
  highlightAnimation: {
    duration: 1000,
    easing: EasingFunction.EASE_IN_OUT,
    pulseCount: 2,
    highlightColor: '#F59E0B',
    highlightOpacity: 0.7,
    borderWidth: 4
  },
  timing: {
    stepDelay: 500,
    explanationDuration: 3000,
    pauseForUserInput: false,
    autoAdvance: true,
    maxTotalDuration: 60000
  },
  education: {
    showStepNumbers: true,
    showProgress: true,
    enableTooltips: true,
    highlightRelated: true,
    showReasoningBubbles: true
  }
};

/**
 * Step-by-Step Animation Controller
 * 
 * Manages educational animations for AI strategy building process
 */
export class StepAnimator {
  private config: StepAnimationConfig;
  private steps: AnimationStepData[] = [];
  private currentStepIndex: number = -1;
  private isPlaying: boolean = false;
  private isPaused: boolean = false;
  private playbackSpeed: number = 1.0;
  private startTime: number = 0;
  private pausedTime: number = 0;
  private animationFrame: number | null = null;
  private listeners: Set<AnimationEventListener> = new Set();
  private stepElements: Map<string, HTMLElement> = new Map();
  private activeAnimations: Map<string, Animation> = new Map();

  constructor(config: StepAnimationConfig = DEFAULT_STEP_ANIMATION_CONFIG) {
    this.config = { ...config };
  }

  /**
   * Create animation steps for node placement sequence
   */
  createNodePlacementSteps(
    nodes: Array<{
      id: string;
      type: string;
      position: Point;
      data: Record<string, unknown>;
      reasoning: string;
      relatedNodes?: string[];
    }>
  ): AnimationStepData[] {
    return nodes.map((node, index) => ({
      id: `node-placement-${node.id}`,
      type: 'node-placement',
      title: `Place ${node.type} Node`,
      description: `Adding ${node.type} indicator to the strategy`,
      reasoning: node.reasoning,
      target: {
        nodeId: node.id,
        position: node.position
      },
      animation: {
        duration: this.config.nodeAnimation.duration,
        delay: index * this.config.timing.stepDelay,
        easing: this.config.nodeAnimation.easing,
        properties: {
          scale: {
            from: this.config.nodeAnimation.scaleFrom,
            to: this.config.nodeAnimation.scaleTo
          },
          opacity: {
            from: this.config.nodeAnimation.opacityFrom,
            to: this.config.nodeAnimation.opacityTo
          }
        }
      },
      education: {
        explanation: this.generateNodeExplanation(node.type, node.reasoning),
        tips: this.generateNodeTips(node.type),
        relatedConcepts: this.getRelatedConcepts(node.type),
        difficulty: this.assessDifficulty(node.type)
      },
      controls: {
        canPause: true,
        canSkip: true,
        requiresConfirmation: false
      }
    }));
  }

  /**
   * Create animation steps for connection creation sequence
   */
  createConnectionSteps(
    connections: Array<{
      id: string;
      sourceNodeId: string;
      targetNodeId: string;
      reasoning: string;
      dataFlow: string;
    }>
  ): AnimationStepData[] {
    return connections.map((connection, index) => ({
      id: `connection-${connection.id}`,
      type: 'connection-creation',
      title: `Connect ${connection.sourceNodeId} → ${connection.targetNodeId}`,
      description: `Creating data flow connection`,
      reasoning: connection.reasoning,
      target: {
        edgeId: connection.id
      },
      animation: {
        duration: this.config.connectionAnimation.duration,
        delay: index * this.config.timing.stepDelay,
        easing: this.config.connectionAnimation.easing,
        properties: {
          strokeDashoffset: { from: 100, to: 0 },
          opacity: { from: 0, to: 1 }
        }
      },
      education: {
        explanation: this.generateConnectionExplanation(connection.dataFlow, connection.reasoning),
        tips: this.generateConnectionTips(connection.dataFlow),
        relatedConcepts: ['data-flow', 'signal-processing', 'strategy-logic'],
        difficulty: 'intermediate'
      },
      controls: {
        canPause: true,
        canSkip: true,
        requiresConfirmation: false
      }
    }));
  }

  /**
   * Create highlight animation steps
   */
  createHighlightSteps(
    targets: Array<{
      id: string;
      type: 'node' | 'edge' | 'group';
      title: string;
      explanation: string;
      relatedElements?: string[];
    }>
  ): AnimationStepData[] {
    return targets.map((target, index) => ({
      id: `highlight-${target.id}`,
      type: 'highlight',
      title: target.title,
      description: `Highlighting ${target.type}`,
      reasoning: target.explanation,
      target: {
        nodeId: target.type === 'node' ? target.id : undefined,
        edgeId: target.type === 'edge' ? target.id : undefined
      },
      animation: {
        duration: this.config.highlightAnimation.duration,
        delay: index * this.config.timing.stepDelay,
        easing: this.config.highlightAnimation.easing,
        properties: {
          borderWidth: { from: 0, to: this.config.highlightAnimation.borderWidth },
          borderColor: { from: 'transparent', to: this.config.highlightAnimation.highlightColor },
          boxShadow: { from: 'none', to: `0 0 20px ${this.config.highlightAnimation.highlightColor}` }
        }
      },
      education: {
        explanation: target.explanation,
        tips: this.generateHighlightTips(target.type),
        relatedConcepts: target.relatedElements || [],
        difficulty: 'beginner'
      },
      controls: {
        canPause: true,
        canSkip: true,
        requiresConfirmation: false
      }
    }));
  }

  /**
   * Create complete strategy building animation sequence
   */
  createStrategyBuildingSequence(
    nodes: Array<{ id: string; type: string; position: Point; reasoning: string }>,
    connections: Array<{ id: string; sourceNodeId: string; targetNodeId: string; reasoning: string; dataFlow: string }>,
    highlights?: Array<{ id: string; type: 'node' | 'edge'; title: string; explanation: string }>
  ): AnimationStepData[] {
    const steps: AnimationStepData[] = [];

    // Add introduction step
    steps.push({
      id: 'introduction',
      type: 'explanation',
      title: 'Strategy Construction Overview',
      description: 'AI will now build your trading strategy step by step',
      reasoning: 'Educational introduction to help users understand the process',
      animation: {
        duration: this.config.timing.explanationDuration,
        delay: 0,
        easing: EasingFunction.LINEAR,
        properties: {}
      },
      education: {
        explanation: `We'll build this strategy by placing ${nodes.length} nodes and creating ${connections.length} connections. Watch how each component contributes to the overall trading logic.`,
        tips: [
          'Pay attention to the order of operations',
          'Notice how data flows between components',
          'Each step builds upon the previous ones'
        ],
        relatedConcepts: ['strategy-design', 'component-architecture', 'data-flow'],
        difficulty: 'beginner'
      },
      controls: {
        canPause: false,
        canSkip: true,
        requiresConfirmation: false
      }
    });

    // Add node placement steps
    const nodeSteps = this.createNodePlacementSteps(nodes.map(node => ({
      ...node,
      data: {},
      relatedNodes: []
    })));
    steps.push(...nodeSteps);

    // Add connection steps
    const connectionSteps = this.createConnectionSteps(connections);
    steps.push(...connectionSteps);

    // Add highlight steps if provided
    if (highlights) {
      const highlightSteps = this.createHighlightSteps(highlights);
      steps.push(...highlightSteps);
    }

    // Add completion step
    steps.push({
      id: 'completion',
      type: 'explanation',
      title: 'Strategy Construction Complete',
      description: 'Your trading strategy is now ready to use',
      reasoning: 'Completion summary to reinforce learning',
      animation: {
        duration: this.config.timing.explanationDuration,
        delay: 0,
        easing: EasingFunction.LINEAR,
        properties: {}
      },
      education: {
        explanation: 'The strategy is now complete with all necessary components connected and configured. You can now generate Pine Script code or make further modifications.',
        tips: [
          'Review the complete strategy flow',
          'Test the strategy with different parameters',
          'Consider adding risk management components'
        ],
        relatedConcepts: ['strategy-completion', 'testing', 'optimization'],
        difficulty: 'beginner'
      },
      controls: {
        canPause: false,
        canSkip: false,
        requiresConfirmation: false
      }
    });

    return steps;
  }

  /**
   * Load animation steps
   */
  loadSteps(steps: AnimationStepData[]): void {
    this.steps = [...steps];
    this.currentStepIndex = -1;
    this.isPlaying = false;
    this.isPaused = false;
  }

  /**
   * Play animation sequence
   */
  async play(): Promise<void> {
    if (this.steps.length === 0) {
      throw new Error('No animation steps loaded');
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.startTime = performance.now();
    this.currentStepIndex = 0;

    return this.executeSequence();
  }

  /**
   * Pause animation
   */
  pause(): void {
    if (this.isPlaying && !this.isPaused) {
      this.isPaused = true;
      this.pausedTime = performance.now();
      
      // Pause all active animations
      this.activeAnimations.forEach(animation => {
        animation.pause();
      });

      this.notifyListeners({
        type: 'animation-paused',
        stepIndex: this.currentStepIndex,
        stepData: this.steps[this.currentStepIndex],
        progress: this.getProgress(),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Resume animation
   */
  resume(): void {
    if (this.isPlaying && this.isPaused) {
      this.isPaused = false;
      
      // Adjust start time to account for pause duration
      const pauseDuration = performance.now() - this.pausedTime;
      this.startTime += pauseDuration;
      
      // Resume all active animations
      this.activeAnimations.forEach(animation => {
        animation.play();
      });

      this.notifyListeners({
        type: 'animation-resumed',
        stepIndex: this.currentStepIndex,
        stepData: this.steps[this.currentStepIndex],
        progress: this.getProgress(),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Stop animation
   */
  stop(): void {
    this.isPlaying = false;
    this.isPaused = false;
    this.currentStepIndex = -1;
    
    // Cancel animation frame
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Stop all active animations
    this.activeAnimations.forEach(animation => {
      animation.cancel();
    });
    this.activeAnimations.clear();
  }

  /**
   * Go to next step
   */
  next(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      if (this.isPlaying) {
        this.executeCurrentStep();
      }
    }
  }

  /**
   * Go to previous step
   */
  previous(): void {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      if (this.isPlaying) {
        this.executeCurrentStep();
      }
    }
  }

  /**
   * Skip to specific step
   */
  skipTo(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.steps.length) {
      this.currentStepIndex = stepIndex;
      if (this.isPlaying) {
        this.executeCurrentStep();
      }
    }
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number): void {
    this.playbackSpeed = Math.max(0.1, Math.min(5.0, speed));
    
    // Update active animations
    this.activeAnimations.forEach(animation => {
      animation.playbackRate = this.playbackSpeed;
    });
  }

  /**
   * Replay animation
   */
  async replay(): Promise<void> {
    this.stop();
    return this.play();
  }

  /**
   * Get animation controls
   */
  getControls(): AnimationControls {
    return {
      play: () => this.play(),
      pause: () => this.pause(),
      resume: () => this.resume(),
      stop: () => this.stop(),
      next: () => this.next(),
      previous: () => this.previous(),
      skipTo: (stepIndex: number) => this.skipTo(stepIndex),
      setSpeed: (speed: number) => this.setSpeed(speed),
      replay: () => this.replay()
    };
  }

  /**
   * Get current progress
   */
  getProgress(): AnimationProgress {
    const currentTime = this.isPaused ? this.pausedTime : performance.now();
    const elapsedTime = currentTime - this.startTime;
    
    const totalSteps = this.steps.length;
    const currentStep = Math.max(0, this.currentStepIndex);
    
    // Calculate step progress
    let stepProgress = 0;
    if (this.currentStepIndex >= 0 && this.currentStepIndex < this.steps.length) {
      const step = this.steps[this.currentStepIndex];
      const stepElapsed = elapsedTime - step.animation.delay;
      stepProgress = Math.max(0, Math.min(1, stepElapsed / step.animation.duration));
    }
    
    // Calculate total progress
    const totalProgress = totalSteps > 0 ? (currentStep + stepProgress) / totalSteps : 0;
    
    // Estimate remaining time
    const averageStepDuration = this.steps.reduce((sum, step) => sum + step.animation.duration, 0) / totalSteps;
    const remainingSteps = totalSteps - currentStep - stepProgress;
    const estimatedTimeRemaining = remainingSteps * averageStepDuration;

    return {
      currentStep,
      totalSteps,
      stepProgress,
      totalProgress,
      elapsedTime,
      estimatedTimeRemaining,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      canGoBack: currentStep > 0,
      canGoForward: currentStep < totalSteps - 1
    };
  }

  /**
   * Subscribe to animation events
   */
  subscribe(listener: AnimationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Execute animation sequence
   */
  private async executeSequence(): Promise<void> {
    while (this.isPlaying && this.currentStepIndex < this.steps.length) {
      if (this.isPaused) {
        await new Promise(resolve => {
          const checkPause = () => {
            if (!this.isPaused || !this.isPlaying) {
              resolve(undefined);
            } else {
              setTimeout(checkPause, 100);
            }
          };
          checkPause();
        });
      }

      if (!this.isPlaying) break;

      await this.executeCurrentStep();
      this.currentStepIndex++;
    }

    if (this.isPlaying) {
      this.notifyListeners({
        type: 'animation-completed',
        stepIndex: this.steps.length - 1,
        stepData: this.steps[this.steps.length - 1],
        progress: this.getProgress(),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Execute current step
   */
  private async executeCurrentStep(): Promise<void> {
    if (this.currentStepIndex < 0 || this.currentStepIndex >= this.steps.length) {
      return;
    }

    const step = this.steps[this.currentStepIndex];
    
    this.notifyListeners({
      type: 'step-started',
      stepIndex: this.currentStepIndex,
      stepData: step,
      progress: this.getProgress(),
      timestamp: Date.now()
    });

    // Wait for step delay
    if (step.animation.delay > 0) {
      await this.wait(step.animation.delay);
    }

    // Execute step animation
    await this.executeStepAnimation(step);

    this.notifyListeners({
      type: 'step-completed',
      stepIndex: this.currentStepIndex,
      stepData: step,
      progress: this.getProgress(),
      timestamp: Date.now()
    });
  }

  /**
   * Execute step animation
   */
  private async executeStepAnimation(step: AnimationStepData): Promise<void> {
    switch (step.type) {
      case 'node-placement':
        return this.animateNodePlacement(step);
      case 'connection-creation':
        return this.animateConnectionCreation(step);
      case 'highlight':
        return this.animateHighlight(step);
      case 'explanation':
        return this.showExplanation(step);
      case 'focus':
        return this.animateFocus(step);
      default:
        return Promise.resolve();
    }
  }

  /**
   * Animate node placement
   */
  private async animateNodePlacement(step: AnimationStepData): Promise<void> {
    if (!step.target?.nodeId) return;

    const element = this.stepElements.get(step.target.nodeId);
    if (!element) return;

    const keyframes = [
      {
        transform: `scale(${this.config.nodeAnimation.scaleFrom})`,
        opacity: this.config.nodeAnimation.opacityFrom,
        filter: this.config.nodeAnimation.enableGlow ? 'drop-shadow(0 0 0 transparent)' : 'none'
      },
      {
        transform: `scale(${this.config.nodeAnimation.scaleTo})`,
        opacity: this.config.nodeAnimation.opacityTo,
        filter: this.config.nodeAnimation.enableGlow 
          ? `drop-shadow(0 0 ${this.config.nodeAnimation.glowIntensity * 20}px ${this.config.nodeAnimation.glowColor})`
          : 'none'
      }
    ];

    const animation = element.animate(keyframes, {
      duration: step.animation.duration / this.playbackSpeed,
      easing: this.getEasingString(step.animation.easing),
      fill: 'forwards'
    });

    this.activeAnimations.set(step.id, animation);
    
    return new Promise(resolve => {
      animation.onfinish = () => {
        this.activeAnimations.delete(step.id);
        resolve();
      };
    });
  }

  /**
   * Animate connection creation
   */
  private async animateConnectionCreation(step: AnimationStepData): Promise<void> {
    if (!step.target?.edgeId) return;

    const element = this.stepElements.get(step.target.edgeId);
    if (!element) return;

    const keyframes = [
      {
        strokeDashoffset: '100',
        opacity: '0'
      },
      {
        strokeDashoffset: '0',
        opacity: '1'
      }
    ];

    const animation = element.animate(keyframes, {
      duration: step.animation.duration / this.playbackSpeed,
      easing: this.getEasingString(step.animation.easing),
      fill: 'forwards'
    });

    this.activeAnimations.set(step.id, animation);
    
    return new Promise(resolve => {
      animation.onfinish = () => {
        this.activeAnimations.delete(step.id);
        resolve();
      };
    });
  }

  /**
   * Animate highlight effect
   */
  private async animateHighlight(step: AnimationStepData): Promise<void> {
    const targetId = step.target?.nodeId || step.target?.edgeId;
    if (!targetId) return;

    const element = this.stepElements.get(targetId);
    if (!element) return;

    const keyframes = [];
    for (let i = 0; i <= this.config.highlightAnimation.pulseCount * 2; i++) {
      const progress = i / (this.config.highlightAnimation.pulseCount * 2);
      const intensity = Math.sin(progress * Math.PI * this.config.highlightAnimation.pulseCount);
      
      keyframes.push({
        borderWidth: `${this.config.highlightAnimation.borderWidth * intensity}px`,
        borderColor: this.config.highlightAnimation.highlightColor,
        boxShadow: `0 0 ${20 * intensity}px ${this.config.highlightAnimation.highlightColor}`,
        opacity: this.config.highlightAnimation.highlightOpacity * intensity + 0.3
      });
    }

    const animation = element.animate(keyframes, {
      duration: step.animation.duration / this.playbackSpeed,
      easing: this.getEasingString(step.animation.easing),
      fill: 'none'
    });

    this.activeAnimations.set(step.id, animation);
    
    return new Promise(resolve => {
      animation.onfinish = () => {
        this.activeAnimations.delete(step.id);
        resolve();
      };
    });
  }

  /**
   * Show explanation
   */
  private async showExplanation(step: AnimationStepData): Promise<void> {
    // This would integrate with the explanation system
    // For now, just wait for the duration
    return this.wait(step.animation.duration);
  }

  /**
   * Animate focus effect
   */
  private async animateFocus(step: AnimationStepData): Promise<void> {
    // This would implement focus animations
    return this.wait(step.animation.duration);
  }

  /**
   * Wait for specified duration
   */
  private wait(duration: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, duration / this.playbackSpeed);
    });
  }

  /**
   * Convert easing function to CSS string
   */
  private getEasingString(easing: EasingFunction): string {
    switch (easing) {
      case EasingFunction.LINEAR:
        return 'linear';
      case EasingFunction.EASE_IN:
        return 'ease-in';
      case EasingFunction.EASE_OUT:
        return 'ease-out';
      case EasingFunction.EASE_IN_OUT:
        return 'ease-in-out';
      case EasingFunction.BOUNCE:
        return 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';
      case EasingFunction.ELASTIC:
        return 'cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      default:
        return 'ease-in-out';
    }
  }

  /**
   * Register DOM element for animation
   */
  registerElement(id: string, element: HTMLElement): void {
    this.stepElements.set(id, element);
  }

  /**
   * Unregister DOM element
   */
  unregisterElement(id: string): void {
    this.stepElements.delete(id);
  }

  /**
   * Notify listeners
   */
  private notifyListeners(event: AnimationEventData): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Animation event listener error:', error);
      }
    });
  }

  /**
   * Generate node explanation
   */
  private generateNodeExplanation(nodeType: string, reasoning: string): string {
    const explanations: Record<string, string> = {
      'rsi': 'RSI (Relative Strength Index) measures momentum by comparing recent gains to losses, helping identify overbought and oversold conditions.',
      'sma': 'Simple Moving Average smooths price data to identify trend direction by averaging prices over a specific period.',
      'macd': 'MACD (Moving Average Convergence Divergence) shows the relationship between two moving averages to identify trend changes.',
      'bollinger-bands': 'Bollinger Bands use standard deviation to create dynamic support and resistance levels around a moving average.',
      'condition': 'Conditions evaluate indicator values to generate trading signals when specific criteria are met.',
      'action': 'Actions execute trades (buy/sell) when conditions are satisfied, implementing the strategy logic.'
    };

    return explanations[nodeType] || reasoning;
  }

  /**
   * Generate node tips
   */
  private generateNodeTips(nodeType: string): string[] {
    const tips: Record<string, string[]> = {
      'rsi': [
        'RSI values above 70 typically indicate overbought conditions',
        'RSI values below 30 typically indicate oversold conditions',
        'Look for divergences between price and RSI for stronger signals'
      ],
      'sma': [
        'Longer periods create smoother but slower signals',
        'Price above SMA suggests uptrend, below suggests downtrend',
        'SMA crossovers can generate entry and exit signals'
      ],
      'macd': [
        'MACD line crossing above signal line suggests bullish momentum',
        'Histogram shows the strength of the momentum',
        'Zero line crossovers indicate trend changes'
      ],
      'condition': [
        'Combine multiple conditions for stronger signals',
        'Consider using confirmation indicators',
        'Test different threshold values for optimization'
      ],
      'action': [
        'Always include risk management with actions',
        'Consider position sizing based on signal strength',
        'Set appropriate stop losses and take profits'
      ]
    };

    return tips[nodeType] || ['This component contributes to the overall strategy logic'];
  }

  /**
   * Get related concepts
   */
  private getRelatedConcepts(nodeType: string): string[] {
    const concepts: Record<string, string[]> = {
      'rsi': ['momentum', 'oscillators', 'overbought-oversold'],
      'sma': ['trend-following', 'moving-averages', 'smoothing'],
      'macd': ['momentum', 'trend-following', 'convergence-divergence'],
      'condition': ['signal-generation', 'logic-gates', 'thresholds'],
      'action': ['trade-execution', 'risk-management', 'position-sizing']
    };

    return concepts[nodeType] || ['technical-analysis'];
  }

  /**
   * Assess difficulty level
   */
  private assessDifficulty(nodeType: string): 'beginner' | 'intermediate' | 'advanced' {
    const difficulty: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
      'sma': 'beginner',
      'rsi': 'beginner',
      'macd': 'intermediate',
      'bollinger-bands': 'intermediate',
      'condition': 'intermediate',
      'action': 'advanced'
    };

    return difficulty[nodeType] || 'intermediate';
  }

  /**
   * Generate connection explanation
   */
  private generateConnectionExplanation(dataFlow: string, reasoning: string): string {
    return `This connection passes ${dataFlow} data between components. ${reasoning}`;
  }

  /**
   * Generate connection tips
   */
  private generateConnectionTips(dataFlow: string): string[] {
    return [
      'Data flows from source to target node',
      'Each connection represents a specific data type',
      'Proper connections ensure accurate signal processing'
    ];
  }

  /**
   * Generate highlight tips
   */
  private generateHighlightTips(type: 'node' | 'edge' | 'group'): string[] {
    const tips: Record<string, string[]> = {
      'node': ['This node processes specific data', 'Node parameters can be customized', 'Nodes can have multiple inputs and outputs'],
      'edge': ['This connection carries data between nodes', 'Connection type determines data format', 'Connections must match compatible types'],
      'group': ['This group represents related components', 'Groups can be collapsed for better organization', 'Group operations affect all contained elements']
    };

    return tips[type] || ['This element is important for the strategy'];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<StepAnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): StepAnimationConfig {
    return { ...this.config };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stop();
    this.listeners.clear();
    this.stepElements.clear();
    this.activeAnimations.clear();
  }
}

/**
 * Create step animator instance
 */
export function createStepAnimator(config?: Partial<StepAnimationConfig>): StepAnimator {
  const fullConfig = config ? { ...DEFAULT_STEP_ANIMATION_CONFIG, ...config } : DEFAULT_STEP_ANIMATION_CONFIG;
  return new StepAnimator(fullConfig);
}

/**
 * Animation utilities
 */
export const StepAnimationUtils = {
  /**
   * Calculate optimal step timing
   */
  calculateOptimalTiming(stepCount: number, totalDuration: number): {
    stepDuration: number;
    stepDelay: number;
  } {
    const minStepDuration = 500;
    const maxStepDuration = 2000;
    const minStepDelay = 200;
    const maxStepDelay = 1000;

    const availableTime = totalDuration * 0.8; // 80% for actual animations
    const stepDuration = Math.max(minStepDuration, Math.min(maxStepDuration, availableTime / stepCount));
    
    const remainingTime = totalDuration - (stepCount * stepDuration);
    const stepDelay = Math.max(minStepDelay, Math.min(maxStepDelay, remainingTime / stepCount));

    return { stepDuration, stepDelay };
  },

  /**
   * Validate animation steps
   */
  validateSteps(steps: AnimationStepData[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (steps.length === 0) {
      errors.push('No animation steps provided');
      return { isValid: false, errors, warnings };
    }

    steps.forEach((step, index) => {
      if (!step.id) {
        errors.push(`Step ${index} missing ID`);
      }

      if (!step.title) {
        warnings.push(`Step ${index} missing title`);
      }

      if (step.animation.duration <= 0) {
        errors.push(`Step ${index} has invalid duration`);
      }

      if (step.animation.delay < 0) {
        errors.push(`Step ${index} has negative delay`);
      }
    });

    // Check for duplicate IDs
    const ids = steps.map(s => s.id);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate step IDs: ${duplicateIds.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Optimize step sequence
   */
  optimizeSequence(steps: AnimationStepData[]): AnimationStepData[] {
    // Sort steps by delay to ensure proper execution order
    const sortedSteps = [...steps].sort((a, b) => a.animation.delay - b.animation.delay);

    // Adjust delays to prevent overlaps
    let currentTime = 0;
    return sortedSteps.map(step => {
      const optimizedStep = { ...step };
      if (optimizedStep.animation.delay < currentTime) {
        optimizedStep.animation.delay = currentTime;
      }
      currentTime = optimizedStep.animation.delay + optimizedStep.animation.duration + 100; // 100ms buffer
      return optimizedStep;
    });
  }
};