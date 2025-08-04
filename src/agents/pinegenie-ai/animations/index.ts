/**
 * PineGenie AI Animation System
 * 
 * This module provides a comprehensive educational animation system for AI-assisted
 * strategy building, including step-by-step animations, explanations, and replay features.
 * 
 * SAFE INTEGRATION: Uses existing systems without modification
 * PROTECTION: No changes to existing animation or educational systems
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */

// Core animation components
export {
  StepAnimator,
  createStepAnimator,
  StepAnimationUtils,
  type StepAnimationConfig,
  type AnimationStepData,
  type AnimationProgress,
  type AnimationControls,
  type AnimationEventData,
  type AnimationEventListener,
  DEFAULT_STEP_ANIMATION_CONFIG
} from './step-animator';

export {
  ExplanationGenerator,
  createExplanationGenerator,
  ExplanationUtils,
  type ExplanationConfig,
  type ExplanationContext,
  type GeneratedExplanation,
  type ExplanationContent,
  type ExplanationMetadata,
  type InteractiveElements,
  type AccessibilityFeatures,
  type ExplanationTemplate,
  DEFAULT_EXPLANATION_CONFIG
} from './explanation-generator';

export {
  ReplaySystem,
  createReplaySystem,
  ReplayUtils,
  type ReplayConfig,
  type ReplaySession,
  type ReplayBookmark,
  type ReplayNote,
  type QuizResult,
  type ProgressData,
  type Achievement,
  type ReplayChapter,
  type ReplayControls,
  type ReplayEvent,
  type ReplayEventListener,
  DEFAULT_REPLAY_CONFIG
} from './replay-system';

export {
  HighlightController,
  createHighlightController,
  HighlightUtils,
  type HighlightConfig,
  type HighlightStyle,
  type HighlightTarget,
  type ActiveHighlight,
  type HighlightEvent,
  type HighlightEventListener,
  DEFAULT_HIGHLIGHT_CONFIG
} from './highlight-controller';

export {
  TimingManager,
  createTimingManager,
  TimingUtils,
  type TimingConfig,
  type TimingEvent,
  type TimingSchedule,
  type TimingState,
  type TimingControls,
  type TimingEventListener,
  DEFAULT_TIMING_CONFIG
} from './timing-manager';

// Animation system integration
import { StepAnimator, createStepAnimator, DEFAULT_STEP_ANIMATION_CONFIG } from './step-animator';
import { ExplanationGenerator, createExplanationGenerator, DEFAULT_EXPLANATION_CONFIG } from './explanation-generator';
import { ReplaySystem, createReplaySystem, DEFAULT_REPLAY_CONFIG } from './replay-system';
import { HighlightController, createHighlightController, DEFAULT_HIGHLIGHT_CONFIG } from './highlight-controller';
import { TimingManager, createTimingManager, DEFAULT_TIMING_CONFIG } from './timing-manager';

/**
 * Integrated Animation System Configuration
 */
export interface AnimationSystemConfig {
  stepAnimation: typeof DEFAULT_STEP_ANIMATION_CONFIG;
  explanation: typeof DEFAULT_EXPLANATION_CONFIG;
  replay: typeof DEFAULT_REPLAY_CONFIG;
  highlight: typeof DEFAULT_HIGHLIGHT_CONFIG;
  timing: typeof DEFAULT_TIMING_CONFIG;
}

/**
 * Default configuration for the entire animation system
 */
export const DEFAULT_ANIMATION_SYSTEM_CONFIG: AnimationSystemConfig = {
  stepAnimation: DEFAULT_STEP_ANIMATION_CONFIG,
  explanation: DEFAULT_EXPLANATION_CONFIG,
  replay: DEFAULT_REPLAY_CONFIG,
  highlight: DEFAULT_HIGHLIGHT_CONFIG,
  timing: DEFAULT_TIMING_CONFIG
};

/**
 * Integrated Animation System
 * 
 * Combines all animation components into a cohesive educational system
 */
export class AnimationSystem {
  private stepAnimator: StepAnimator;
  private explanationGenerator: ExplanationGenerator;
  private replaySystem: ReplaySystem;
  private highlightController: HighlightController;
  private timingManager: TimingManager;
  private isInitialized: boolean = false;

  constructor(config: Partial<AnimationSystemConfig> = {}) {
    const fullConfig = { ...DEFAULT_ANIMATION_SYSTEM_CONFIG, ...config };
    
    this.stepAnimator = createStepAnimator(fullConfig.stepAnimation);
    this.explanationGenerator = createExplanationGenerator(fullConfig.explanation);
    this.replaySystem = createReplaySystem(fullConfig.replay);
    this.highlightController = createHighlightController(fullConfig.highlight);
    this.timingManager = createTimingManager(fullConfig.timing);
  }

  /**
   * Initialize the animation system
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.highlightController.initialize();
    this.isInitialized = true;
  }

  /**
   * Create complete educational animation for strategy building
   */
  createStrategyBuildingAnimation(
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      reasoning: string;
    }>,
    connections: Array<{
      id: string;
      sourceNodeId: string;
      targetNodeId: string;
      reasoning: string;
      dataFlow: string;
    }>,
    strategyName: string = 'AI Strategy'
  ): {
    animationSteps: any[];
    explanations: Map<string, any>;
    replaySession: any;
    highlights: string[];
  } {
    if (!this.isInitialized) {
      this.initialize();
    }

    // Create animation steps
    const animationSteps = this.stepAnimator.createStrategyBuildingSequence(
      nodes,
      connections,
      nodes.map(n => ({ id: n.id, type: 'node', title: `${n.type} Node`, explanation: n.reasoning }))
    );

    // Generate explanations for each step
    const explanations = new Map();
    
    // Node placement explanations
    nodes.forEach(node => {
      const explanation = this.explanationGenerator.generateNodePlacementExplanation(
        node.type,
        node.id,
        node.reasoning,
        node.position
      );
      explanations.set(`node_${node.id}`, explanation);
    });

    // Connection explanations
    connections.forEach(connection => {
      const explanation = this.explanationGenerator.generateConnectionExplanation(
        connection.sourceNodeId,
        connection.targetNodeId,
        connection.dataFlow,
        connection.reasoning
      );
      explanations.set(`connection_${connection.id}`, explanation);
    });

    // Create replay session
    const animationSequence = {
      id: `strategy_${Date.now()}`,
      name: `Building ${strategyName}`,
      description: `Educational animation for ${strategyName} construction`,
      steps: animationSteps,
      totalDuration: animationSteps.reduce((sum, step) => sum + step.animation.duration, 0),
      canPause: true,
      canReplay: true
    };

    const replaySession = this.replaySystem.createSession(
      animationSequence.id,
      animationSequence.name,
      animationSequence,
      explanations
    );

    // Create highlights for important elements
    const highlights = [
      ...nodes.map(n => n.id),
      ...connections.map(c => c.id)
    ];

    return {
      animationSteps,
      explanations,
      replaySession,
      highlights
    };
  }

  /**
   * Start educational animation
   */
  async startAnimation(
    animationData: {
      animationSteps: any[];
      explanations: Map<string, any>;
      replaySession: any;
      highlights: string[];
    }
  ): Promise<void> {
    const { animationSteps, replaySession } = animationData;

    // Load steps into step animator
    this.stepAnimator.loadSteps(animationSteps);

    // Start replay session
    this.replaySystem.startReplay(replaySession.id);

    // Start step animation
    await this.stepAnimator.play();
  }

  /**
   * Create highlight for specific element
   */
  highlightElement(
    elementId: string,
    element: HTMLElement,
    type: 'primary' | 'secondary' | 'success' | 'warning' | 'error' = 'primary',
    duration: number = 2000
  ): void {
    if (!this.isInitialized) {
      this.initialize();
    }

    const target = {
      id: elementId,
      element,
      type: 'node' as const,
      priority: 1
    };

    const color = this.getHighlightColor(type);
    this.highlightController.createGlowHighlight(elementId, target, color);

    // Auto-remove after duration
    setTimeout(() => {
      this.highlightController.removeHighlight(elementId);
    }, duration);
  }

  /**
   * Create explanation for current context
   */
  generateContextualExplanation(
    stepType: 'node-placement' | 'connection-creation' | 'parameter-setting',
    context: any
  ): any {
    return this.explanationGenerator.generateExplanation({
      step: {
        id: `context_${Date.now()}`,
        type: stepType,
        title: context.title || 'Strategy Step',
        description: context.description || 'Building strategy component',
        complexity: context.complexity || 'moderate'
      },
      strategy: context.strategy || {
        name: 'Trading Strategy',
        type: 'custom',
        components: [],
        currentProgress: 0.5,
        totalSteps: 10
      },
      user: context.user || {
        experienceLevel: 'intermediate',
        preferredLearningStyle: 'visual',
        previousKnowledge: [],
        currentFocus: []
      },
      technical: context.technical || {}
    });
  }

  /**
   * Get step animator
   */
  getStepAnimator(): StepAnimator {
    return this.stepAnimator;
  }

  /**
   * Get explanation generator
   */
  getExplanationGenerator(): ExplanationGenerator {
    return this.explanationGenerator;
  }

  /**
   * Get replay system
   */
  getReplaySystem(): ReplaySystem {
    return this.replaySystem;
  }

  /**
   * Get highlight controller
   */
  getHighlightController(): HighlightController {
    return this.highlightController;
  }

  /**
   * Get timing manager
   */
  getTimingManager(): TimingManager {
    return this.timingManager;
  }

  /**
   * Subscribe to all animation events
   */
  subscribeToEvents(listener: (event: any) => void): () => void {
    const unsubscribers: (() => void)[] = [];

    // Subscribe to step animator events
    unsubscribers.push(this.stepAnimator.subscribe(listener));

    // Subscribe to replay system events
    unsubscribers.push(this.replaySystem.subscribe(listener));

    // Subscribe to highlight controller events
    unsubscribers.push(this.highlightController.subscribe(listener));

    // Subscribe to timing manager events
    unsubscribers.push(this.timingManager.subscribe(listener));

    // Return combined unsubscriber
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  /**
   * Get highlight color by type
   */
  private getHighlightColor(type: string): string {
    const colors = {
      primary: '#4F46E5',
      secondary: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    };
    return colors[type as keyof typeof colors] || colors.primary;
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    this.stepAnimator.cleanup();
    this.explanationGenerator.cleanup();
    this.replaySystem.cleanup();
    this.highlightController.cleanup();
    this.timingManager.cleanup();
    this.isInitialized = false;
  }
}

/**
 * Create integrated animation system
 */
export function createAnimationSystem(config?: Partial<AnimationSystemConfig>): AnimationSystem {
  return new AnimationSystem(config);
}

/**
 * Animation system utilities
 */
export const AnimationSystemUtils = {
  /**
   * Create default strategy building animation
   */
  createDefaultStrategyAnimation(
    strategyName: string,
    nodeCount: number = 5,
    connectionCount: number = 4
  ): {
    nodes: Array<{
      id: string;
      type: string;
      position: { x: number; y: number };
      reasoning: string;
    }>;
    connections: Array<{
      id: string;
      sourceNodeId: string;
      targetNodeId: string;
      reasoning: string;
      dataFlow: string;
    }>;
  } {
    const nodes = [];
    const connections = [];

    // Create sample nodes
    const nodeTypes = ['data-source', 'rsi', 'sma', 'condition', 'action'];
    for (let i = 0; i < Math.min(nodeCount, nodeTypes.length); i++) {
      nodes.push({
        id: `node_${i}`,
        type: nodeTypes[i],
        position: { x: 100 + i * 150, y: 100 },
        reasoning: `Adding ${nodeTypes[i]} for ${strategyName} strategy`
      });
    }

    // Create sample connections
    for (let i = 0; i < Math.min(connectionCount, nodes.length - 1); i++) {
      connections.push({
        id: `connection_${i}`,
        sourceNodeId: nodes[i].id,
        targetNodeId: nodes[i + 1].id,
        reasoning: `Connecting ${nodes[i].type} to ${nodes[i + 1].type}`,
        dataFlow: 'price-data'
      });
    }

    return { nodes, connections };
  },

  /**
   * Validate animation system configuration
   */
  validateConfig(config: Partial<AnimationSystemConfig>): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate step animation config
    if (config.stepAnimation) {
      if (config.stepAnimation.nodeAnimation.duration <= 0) {
        errors.push('Node animation duration must be positive');
      }
    }

    // Validate explanation config
    if (config.explanation) {
      if (config.explanation.content.maxLength <= config.explanation.content.minLength) {
        errors.push('Max explanation length must be greater than min length');
      }
    }

    // Validate replay config
    if (config.replay) {
      if (config.replay.playback.maxSpeed <= config.replay.playback.minSpeed) {
        errors.push('Max playback speed must be greater than min speed');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Get recommended configuration for experience level
   */
  getConfigForExperienceLevel(level: 'beginner' | 'intermediate' | 'advanced'): Partial<AnimationSystemConfig> {
    const configs = {
      beginner: {
        stepAnimation: {
          ...DEFAULT_STEP_ANIMATION_CONFIG,
          timing: {
            ...DEFAULT_STEP_ANIMATION_CONFIG.timing,
            stepDelay: 800,
            explanationDuration: 4000
          }
        },
        explanation: {
          ...DEFAULT_EXPLANATION_CONFIG,
          content: {
            ...DEFAULT_EXPLANATION_CONFIG.content,
            complexityLevel: 'beginner' as const,
            includeExamples: true
          },
          language: {
            ...DEFAULT_EXPLANATION_CONFIG.language,
            vocabulary: 'simple' as const,
            useAnalogies: true
          }
        }
      },
      intermediate: {
        stepAnimation: {
          ...DEFAULT_STEP_ANIMATION_CONFIG,
          timing: {
            ...DEFAULT_STEP_ANIMATION_CONFIG.timing,
            stepDelay: 500,
            explanationDuration: 3000
          }
        },
        explanation: {
          ...DEFAULT_EXPLANATION_CONFIG,
          content: {
            ...DEFAULT_EXPLANATION_CONFIG.content,
            complexityLevel: 'intermediate' as const
          }
        }
      },
      advanced: {
        stepAnimation: {
          ...DEFAULT_STEP_ANIMATION_CONFIG,
          timing: {
            ...DEFAULT_STEP_ANIMATION_CONFIG.timing,
            stepDelay: 300,
            explanationDuration: 2000
          }
        },
        explanation: {
          ...DEFAULT_EXPLANATION_CONFIG,
          content: {
            ...DEFAULT_EXPLANATION_CONFIG.content,
            complexityLevel: 'advanced' as const,
            includeTips: false
          },
          language: {
            ...DEFAULT_EXPLANATION_CONFIG.language,
            vocabulary: 'technical' as const
          }
        }
      }
    };

    return configs[level];
  }
};

// Default export
export default AnimationSystem;