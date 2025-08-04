/**
 * AI Builder Integration Module - Main Export
 * 
 * This module provides the main exports for the AI builder integration system.
 * It combines node placement, connection creation, state integration, layout
 * optimization, and animation control into a cohesive system.
 * 
 * SAFE INTEGRATION: All components use existing builder APIs without modification
 * PROTECTION: No changes to core builder files
 * 
 * Requirements: 1.2, 1.3, 3.1, 7.1, 7.2, 7.3
 */

// Core AI Builder Components
export {
  AINodePlacer,
  getAINodePlacer,
  resetAINodePlacer,
  AINodePlacementUtils,
  DEFAULT_AI_PLACEMENT_CONFIG
} from './node-placer';

export type {
  AINodePlacementConfig,
  NodePlacementResult,
  NodePlacement,
  LayoutStrategy
} from './node-placer';

export {
  AIConnectionCreator,
  getAIConnectionCreator,
  resetAIConnectionCreator,
  AIConnectionUtils,
  DEFAULT_AI_CONNECTION_CONFIG
} from './connection-creator';

export type {
  AIConnectionConfig,
  ConnectionCreationResult,
  AIConnection,
  ConnectionPlan
} from './connection-creator';

export {
  AIBuilderStateIntegrator,
  getAIBuilderStateIntegrator,
  resetAIBuilderStateIntegrator,
  AIBuilderStateUtils,
  DEFAULT_AI_BUILDER_SETTINGS
} from './state-integrator';

export type {
  AIBuilderState,
  AINodeMetadata,
  AIEdgeMetadata,
  AIOperation,
  AIBuilderSettings,
  StateIntegrationResult
} from './state-integrator';

export {
  AILayoutOptimizer,
  getAILayoutOptimizer,
  resetAILayoutOptimizer,
  LayoutOptimizationUtils,
  DEFAULT_LAYOUT_OPTIMIZATION_CONFIG
} from './layout-optimizer';

export type {
  LayoutOptimizationConfig,
  LayoutOptimizationResult,
  LayoutImprovement,
  LayoutMetrics
} from './layout-optimizer';

export {
  AIAnimationController,
  getAIAnimationController,
  resetAIAnimationController,
  AnimationUtils,
  DEFAULT_ANIMATION_CONFIG
} from './animation-controller';

export type {
  AnimationConfig,
  AnimationSequence,
  AnimationStep,
  AnimationState,
  AnimationControls
} from './animation-controller';

// Integrated AI Builder System
import { AINodePlacer, getAINodePlacer } from './node-placer';
import { AIConnectionCreator, getAIConnectionCreator } from './connection-creator';
import { AIBuilderStateIntegrator, getAIBuilderStateIntegrator } from './state-integrator';
import { AILayoutOptimizer, getAILayoutOptimizer } from './layout-optimizer';
import { AIAnimationController, getAIAnimationController } from './animation-controller';

import { StrategyBlueprint } from '../types/strategy-types';
import { BuilderNode } from '../../../app/builder/builder-state';

/**
 * Integrated AI Builder System
 * 
 * Combines all AI builder components into a single, easy-to-use interface
 * that provides complete AI-assisted strategy building capabilities.
 */
export class AIBuilderSystem {
  private nodePlacer: AINodePlacer;
  private connectionCreator: AIConnectionCreator;
  private stateIntegrator: AIBuilderStateIntegrator;
  private layoutOptimizer: AILayoutOptimizer;
  private animationController: AIAnimationController;

  constructor() {
    this.nodePlacer = getAINodePlacer();
    this.connectionCreator = getAIConnectionCreator();
    this.stateIntegrator = getAIBuilderStateIntegrator();
    this.layoutOptimizer = getAILayoutOptimizer();
    this.animationController = getAIAnimationController();
  }

  /**
   * Initialize the AI builder system with the builder store
   * 
   * SAFE INTEGRATION: Uses existing useBuilderStore without modification
   */
  initialize(builderStore: any): void {
    this.stateIntegrator.initialize(builderStore);
  }

  /**
   * Build complete AI strategy with animation
   * 
   * This is the main method that orchestrates the entire AI strategy building process
   */
  async buildAIStrategy(
    blueprint: StrategyBlueprint,
    canvasElement: HTMLElement,
    canvasState: { zoom: number; offset: { x: number; y: number } },
    existingNodes: BuilderNode[] = [],
    options: {
      animate?: boolean;
      optimizeLayout?: boolean;
      showExplanations?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    nodesCreated: number;
    edgesCreated: number;
    animationSequence?: any;
    errors: string[];
    warnings: string[];
  }> {
    const {
      animate = true,
      optimizeLayout = true,
      showExplanations = true
    } = options;

    try {
      // Step 1: Calculate node placements
      const placementResult = await this.nodePlacer.placeStrategyNodes(
        blueprint,
        canvasElement,
        canvasState,
        existingNodes
      );

      if (!placementResult.success) {
        return {
          success: false,
          nodesCreated: 0,
          edgesCreated: 0,
          errors: placementResult.errors,
          warnings: placementResult.warnings
        };
      }

      // Step 2: Create connections
      const connectionResult = await this.connectionCreator.createStrategyConnections(
        blueprint,
        [...existingNodes, ...this.createTemporaryNodes(placementResult.placements)]
      );

      if (!connectionResult.success) {
        return {
          success: false,
          nodesCreated: 0,
          edgesCreated: 0,
          errors: connectionResult.errors,
          warnings: connectionResult.warnings
        };
      }

      // Step 3: Optimize layout if requested
      if (optimizeLayout) {
        const allNodes = [...existingNodes, ...this.createTemporaryNodes(placementResult.placements)];
        const connections = connectionResult.connections.map(conn => ({
          source: conn.sourceNodeId,
          target: conn.targetNodeId
        }));

        const optimizationResult = await this.layoutOptimizer.optimizeLayout(
          allNodes,
          canvasElement,
          canvasState,
          connections
        );

        if (optimizationResult.success) {
          // Update placements with optimized positions
          placementResult.placements.forEach(placement => {
            const optimizedPosition = optimizationResult.optimizedPositions.get(placement.nodeId);
            if (optimizedPosition) {
              placement.position = optimizedPosition;
              placement.reasoning += ' (layout optimized)';
            }
          });
        }
      }

      // Step 4: Create animation sequence if requested
      let animationSequence;
      if (animate) {
        // Update animation config for explanations
        if (showExplanations) {
          this.animationController.updateConfig({
            education: {
              showExplanations: true,
              explanationDuration: 2000,
              highlightRelatedElements: true,
              pauseForUserInput: false
            }
          });
        }

        animationSequence = this.animationController.createStrategyBuildingSequence(
          placementResult.placements,
          connectionResult.connections,
          blueprint.name || 'AI Strategy'
        );
      }

      // Step 5: Integrate with builder state
      const integrationResult = await this.stateIntegrator.createAIStrategy(
        blueprint,
        placementResult.placements,
        connectionResult.connections
      );

      // Step 6: Play animation if created
      if (animationSequence && animate) {
        // Start animation (non-blocking)
        this.animationController.playSequence(animationSequence).catch(error => {
          console.warn('Animation failed:', error);
        });
      }

      return {
        success: integrationResult.success,
        nodesCreated: integrationResult.nodesCreated,
        edgesCreated: integrationResult.edgesCreated,
        animationSequence,
        errors: [
          ...placementResult.errors,
          ...connectionResult.errors,
          ...integrationResult.errors
        ],
        warnings: [
          ...placementResult.warnings,
          ...connectionResult.warnings,
          ...integrationResult.warnings
        ]
      };

    } catch (error) {
      return {
        success: false,
        nodesCreated: 0,
        edgesCreated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: []
      };
    }
  }

  /**
   * Add single AI node with animation
   */
  async addAINode(
    component: any,
    canvasElement: HTMLElement,
    canvasState: { zoom: number; offset: { x: number; y: number } },
    existingNodes: BuilderNode[] = [],
    animate: boolean = true
  ): Promise<{
    success: boolean;
    nodeId: string;
    animationSequence?: any;
    error?: string;
  }> {
    try {
      // Calculate placement
      const placement = this.nodePlacer.placeSingleNode(
        component,
        canvasElement,
        canvasState,
        existingNodes.map(node => ({
          id: node.id,
          position: node.position,
          dimensions: {
            width: node.width || 200,
            height: node.height || 100
          }
        }))
      );

      // Create animation sequence if requested
      let animationSequence;
      if (animate) {
        animationSequence = this.animationController.createNodePlacementSequence(
          [placement],
          `Adding ${component.type}`
        );
      }

      // Add to builder state
      const result = await this.stateIntegrator.addAINode(component, placement);

      // Play animation if created
      if (animationSequence && animate && result.success) {
        this.animationController.playSequence(animationSequence).catch(error => {
          console.warn('Node animation failed:', error);
        });
      }

      return {
        success: result.success,
        nodeId: result.nodeId,
        animationSequence,
        error: result.error
      };

    } catch (error) {
      return {
        success: false,
        nodeId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Optimize existing layout with animation
   */
  async optimizeExistingLayout(
    nodes: BuilderNode[],
    canvasElement: HTMLElement,
    canvasState: { zoom: number; offset: { x: number; y: number } },
    connections: Array<{ source: string; target: string }> = [],
    animate: boolean = true
  ): Promise<{
    success: boolean;
    improvements: number;
    animationSequence?: any;
    errors: string[];
  }> {
    try {
      // Run layout optimization
      const optimizationResult = await this.layoutOptimizer.optimizeLayout(
        nodes,
        canvasElement,
        canvasState,
        connections
      );

      if (!optimizationResult.success) {
        return {
          success: false,
          improvements: 0,
          errors: ['Layout optimization failed']
        };
      }

      // Apply optimized positions to nodes
      const updatedNodes: BuilderNode[] = [];
      nodes.forEach(node => {
        const optimizedPosition = optimizationResult.optimizedPositions.get(node.id);
        if (optimizedPosition) {
          const updatedNode = { ...node, position: optimizedPosition };
          updatedNodes.push(updatedNode);
          
          // Update in builder state
          this.stateIntegrator.updateAINode(node.id, { position: optimizedPosition });
        }
      });

      // Create animation sequence if requested
      let animationSequence;
      if (animate && optimizationResult.improvements.length > 0) {
        // Convert improvements to placements for animation
        const placements = optimizationResult.improvements.map(improvement => ({
          nodeId: improvement.nodeId,
          position: improvement.newPosition,
          animationDelay: 0,
          reasoning: improvement.reasoning,
          confidence: 0.9
        }));

        animationSequence = this.animationController.createNodePlacementSequence(
          placements,
          'Layout Optimization'
        );

        // Play animation
        this.animationController.playSequence(animationSequence).catch(error => {
          console.warn('Optimization animation failed:', error);
        });
      }

      return {
        success: true,
        improvements: optimizationResult.improvements.length,
        animationSequence,
        errors: []
      };

    } catch (error) {
      return {
        success: false,
        improvements: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get animation controls for current sequence
   */
  getAnimationControls() {
    return this.animationController.getControls();
  }

  /**
   * Get AI builder statistics
   */
  getAIBuilderStats(): {
    aiNodes: number;
    aiEdges: number;
    operations: number;
    canUndo: boolean;
    canRedo: boolean;
  } {
    const aiElements = this.stateIntegrator.getAIElements();
    const operationHistory = this.stateIntegrator.getOperationHistory();

    return {
      aiNodes: aiElements.nodes.length,
      aiEdges: aiElements.edges.length,
      operations: operationHistory.length,
      canUndo: this.stateIntegrator.canUndoAI(),
      canRedo: this.stateIntegrator.canRedoAI()
    };
  }

  /**
   * Undo last AI operation
   */
  async undoAIOperation(): Promise<{ success: boolean; error?: string }> {
    return await this.stateIntegrator.undoAIOperation();
  }

  /**
   * Redo last AI operation
   */
  async redoAIOperation(): Promise<{ success: boolean; error?: string }> {
    return await this.stateIntegrator.redoAIOperation();
  }

  /**
   * Clear all AI state
   */
  clearAIState(): void {
    this.stateIntegrator.clearAIState();
    this.animationController.cleanup();
  }

  /**
   * Create temporary nodes for connection calculation
   */
  private createTemporaryNodes(placements: any[]): BuilderNode[] {
    return placements.map(placement => ({
      id: placement.nodeId,
      type: 'temp',
      position: placement.position,
      data: {
        id: placement.nodeId,
        type: 'temp',
        label: 'Temp Node'
      }
    }));
  }
}

/**
 * Create a singleton AI builder system instance
 */
let aiBuilderSystemInstance: AIBuilderSystem | null = null;

export function getAIBuilderSystem(): AIBuilderSystem {
  if (!aiBuilderSystemInstance) {
    aiBuilderSystemInstance = new AIBuilderSystem();
  }
  return aiBuilderSystemInstance;
}

/**
 * Reset the AI builder system instance (for testing)
 */
export function resetAIBuilderSystem(): void {
  aiBuilderSystemInstance = null;
}

/**
 * Utility functions for the AI builder system
 */
export const AIBuilderSystemUtils = {
  /**
   * Validate AI builder configuration
   */
  validateConfiguration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if all required components are available
    try {
      getAINodePlacer();
      getAIConnectionCreator();
      getAIBuilderStateIntegrator();
      getAILayoutOptimizer();
      getAIAnimationController();
    } catch (error) {
      errors.push('Failed to initialize AI builder components');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Get system health status
   */
  getSystemHealth(): {
    status: 'healthy' | 'warning' | 'error';
    components: Record<string, 'ok' | 'warning' | 'error'>;
    message: string;
  } {
    const components: Record<string, 'ok' | 'warning' | 'error'> = {
      nodePlacer: 'ok',
      connectionCreator: 'ok',
      stateIntegrator: 'ok',
      layoutOptimizer: 'ok',
      animationController: 'ok'
    };

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    let message = 'All AI builder components are functioning normally';

    // Check each component
    try {
      const system = getAIBuilderSystem();
      const stats = system.getAIBuilderStats();
      
      if (stats.operations > 100) {
        components.stateIntegrator = 'warning';
        status = 'warning';
        message = 'High number of AI operations may impact performance';
      }
    } catch (error) {
      status = 'error';
      message = 'AI builder system is not functioning properly';
      Object.keys(components).forEach(key => {
        components[key] = 'error';
      });
    }

    return { status, components, message };
  },

  /**
   * Export AI builder configuration
   */
  exportConfiguration(): string {
    const config = {
      nodePlacement: getAINodePlacer().getConfig(),
      connections: getAIConnectionCreator().getConfig(),
      builderSettings: getAIBuilderStateIntegrator().getSettings(),
      layoutOptimization: getAILayoutOptimizer().getConfig(),
      animation: getAIAnimationController().getConfig(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(config, null, 2);
  },

  /**
   * Import AI builder configuration
   */
  importConfiguration(configData: string): {
    success: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const config = JSON.parse(configData);

      if (config.nodePlacement) {
        getAINodePlacer().updateConfig(config.nodePlacement);
      } else {
        warnings.push('Node placement configuration not found');
      }

      if (config.connections) {
        getAIConnectionCreator().updateConfig(config.connections);
      } else {
        warnings.push('Connection configuration not found');
      }

      if (config.builderSettings) {
        getAIBuilderStateIntegrator().updateSettings(config.builderSettings);
      } else {
        warnings.push('Builder settings not found');
      }

      if (config.layoutOptimization) {
        getAILayoutOptimizer().updateConfig(config.layoutOptimization);
      } else {
        warnings.push('Layout optimization configuration not found');
      }

      if (config.animation) {
        getAIAnimationController().updateConfig(config.animation);
      } else {
        warnings.push('Animation configuration not found');
      }

    } catch (error) {
      errors.push('Failed to parse configuration data');
    }

    return {
      success: errors.length === 0,
      errors,
      warnings
    };
  }
};