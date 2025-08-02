/**
 * AI Strategy Builder Module
 * 
 * This module handles automated placement and connection of nodes
 * on the visual canvas.
 */

// Main builder (to be implemented in task 5)
export { AIStrategyBuilder } from './ai-strategy-builder';

// Builder components (to be implemented in task 5)
export { NodePlacer } from './node-placer';
export { ConnectionCreator } from './connection-creator';
export { StateIntegrator } from './state-integrator';
export { LayoutOptimizer } from './layout-optimizer';

// Types
export type {
  BuildResult,
  AIBuilderNode,
  AIBuilderEdge,
  AnimationStep
} from '../types/builder-types';