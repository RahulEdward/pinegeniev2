/**
 * Animation System Type Definitions
 */

export interface AnimationSequence {
  id: string;
  name: string;
  steps: AnimationStep[];
  totalDuration: number;
  canPause: boolean;
  canReplay: boolean;
  metadata?: AnimationMetadata;
}

export interface AnimationStep {
  id: string;
  type: AnimationType;
  duration: number;
  delay: number;
  easing: EasingFunction;
  target: AnimationTarget;
  properties: AnimationProperties;
  explanation?: StepExplanation;
}

export enum AnimationType {
  FADE_IN = 'fade-in',
  FADE_OUT = 'fade-out',
  SLIDE_IN = 'slide-in',
  SLIDE_OUT = 'slide-out',
  SCALE_IN = 'scale-in',
  SCALE_OUT = 'scale-out',
  HIGHLIGHT = 'highlight',
  PULSE = 'pulse',
  DRAW_CONNECTION = 'draw-connection',
  MOVE_TO_POSITION = 'move-to-position',
}

export enum EasingFunction {
  LINEAR = 'linear',
  EASE_IN = 'ease-in',
  EASE_OUT = 'ease-out',
  EASE_IN_OUT = 'ease-in-out',
  BOUNCE = 'bounce',
  ELASTIC = 'elastic',
}

export interface AnimationTarget {
  type: 'node' | 'edge' | 'canvas' | 'ui-element';
  id: string;
  selector?: string;
}

export interface AnimationProperties {
  [key: string]: AnimationValue;
}

export interface AnimationValue {
  from: unknown;
  to: unknown;
  unit?: string;
}

export interface StepExplanation {
  title: string;
  description: string;
  reasoning: string;
  tips?: string[];
  relatedConcepts?: string[];
}

export interface AnimationMetadata {
  createdAt: Date;
  complexity: 'simple' | 'moderate' | 'complex';
  educationalValue: 'low' | 'medium' | 'high';
  targetAudience: 'beginner' | 'intermediate' | 'advanced';
}

export interface AnimationControls {
  play(): void;
  pause(): void;
  stop(): void;
  replay(): void;
  skipToStep(stepIndex: number): void;
  setSpeed(speed: number): void;
  getCurrentStep(): number;
  getTotalSteps(): number;
  isPlaying(): boolean;
  isPaused(): boolean;
}

export interface AnimationEvent {
  type: AnimationEventType;
  stepIndex: number;
  timestamp: Date;
  data?: Record<string, unknown>;
}

export enum AnimationEventType {
  STARTED = 'started',
  STEP_STARTED = 'step-started',
  STEP_COMPLETED = 'step-completed',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  COMPLETED = 'completed',
  STOPPED = 'stopped',
  ERROR = 'error',
}

export type AnimationEventListener = (event: AnimationEvent) => void;