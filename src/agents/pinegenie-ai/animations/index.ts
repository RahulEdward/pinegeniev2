/**
 * Educational Animation System Module
 * 
 * This module provides step-by-step animations and explanations
 * for strategy building.
 */

// Main animation system (to be implemented in task 7)
export { AnimationSystem } from './animation-system';

// Animation components (to be implemented in task 7)
export { StepAnimator } from './step-animator';
export { ExplanationGenerator } from './explanation-generator';
export { ReplaySystem } from './replay-system';
export { HighlightController } from './highlight-controller';

// Types
export type {
  AnimationSequence,
  AnimationStep,
  ExplanationStep,
  AnimationControls
} from '../types/animation-types';