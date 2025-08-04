/**
 * AI Builder State Integration System for PineGenie Strategy Builder
 * 
 * This module provides seamless integration with the existing builder state
 * management system without modifying core files. It uses existing useBuilderStore
 * methods and provides AI-specific state management on top.
 * 
 * SAFE INTEGRATION: Uses existing useBuilderStore methods without modification
 * PROTECTION: No changes to builder-state.ts or core builder files
 * 
 * Requirements: 7.1, 7.2, 7.3
 */

import { 
  BuilderNode, 
  BuilderEdge, 
  Connection, 
  NodePosition,
  BuilderState
} from '../../../app/builder/builder-state';

import { StrategyBlueprint, StrategyComponent } from '../types/strategy-types';
import { NodePlacement } from './node-placer';
import { AIConnection } from './connection-creator';

export interface AIBuilderState {
  /** AI-generated nodes and their metadata */
  aiNodes: Map<string, AINodeMetadata>;
  /** AI-generated edges and their metadata */
  aiEdges: Map<string, AIEdgeMetadata>;
  /** Current AI operation state */
  currentOperation: AIOperation | null;
  /** AI operation history for undo/redo */
  operationHistory: AIOperation[];
  /** AI operation index for undo/redo */
  operationIndex: number;
  /** AI-specific settings */
  settings: AIBuilderSettings;
}

export interface AINodeMetadata {
  nodeId: string;
  generatedBy: 'ai' | 'template' | 'optimization';
  confidence: number;
  reasoning: string;
  originalComponent?: StrategyComponent;
  placement?: NodePlacement;
  createdAt: Date;
  lastModified: Date;
}

export interface AIEdgeMetadata {
  edgeId: string;
  generatedBy: 'ai' | 'template' | 'optimization';
  confidence: number;
  reasoning: string;
  originalConnection?: AIConnection;
  createdAt: Date;
  lastModified: Date;
}

export interface AIOperation {
  id: string;
  type: 'node-creation' | 'edge-creation' | 'strategy-build' | 'optimization';
  description: string;
  nodeChanges: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  edgeChanges: {
    added: string[];
    modified: string[];
    removed: string[];
  };
  timestamp: Date;
  canUndo: boolean;
  canRedo: boolean;
}

export interface AIBuilderSettings {
  /** Auto-save AI operations */
  autoSave: boolean;
  /** Maximum operation history size */
  maxHistorySize: number;
  /** Animation settings */
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  /** Validation settings */
  validation: {
    realTimeValidation: boolean;
    showWarnings: boolean;
    autoFix: boolean;
  };
}

export interface StateIntegrationResult {
  success: boolean;
  nodesCreated: number;
  edgesCreated: number;
  errors: string[];
  warnings: string[];
  operationId: string;
}

/**
 * Default AI builder settings
 */
export const DEFAULT_AI_BUILDER_SETTINGS: AIBuilderSettings = {
  autoSave: true,
  maxHistorySize: 50,
  animations: {
    enabled: true,
    duration: 500,
    easing: 'ease-in-out'
  },
  validation: {
    realTimeValidation: true,
    showWarnings: true,
    autoFix: false
  }
};

/**
 * AI Builder State Integrator Class
 * 
 * Provides AI-specific state management that integrates seamlessly with
 * the existing builder state without modifying core files.
 */
export class AIBuilderStateIntegrator {
  private aiState: AIBuilderState;
  private builderStore: any; // Will be injected with useBuilderStore

  constructor(settings: AIBuilderSettings = DEFAULT_AI_BUILDER_SETTINGS) {
    this.aiState = {
      aiNodes: new Map(),
      aiEdges: new Map(),
      currentOperation: null,
      operationHistory: [],
      operationIndex: -1,
      settings
    };
  }

  /**
   * Initialize with builder store
   * 
   * SAFE INTEGRATION: Uses existing useBuilderStore without modification
   */
  initialize(builderStore: any): void {
    this.builderStore = builderStore;
  }

  /**
   * Create AI-generated strategy in builder state
   * 
   * SAFE INTEGRATION: Uses existing addNode and addEdge methods
   */
  async createAIStrategy(
    blueprint: StrategyBlueprint,
    placements: NodePlacement[],
    connections: AIConnection[]
  ): Promise<StateIntegrationResult> {
    if (!this.builderStore) {
      throw new Error('Builder store not initialized. Call initialize() first.');
    }

    const operationId = this.generateOperationId();
    const operation: AIOperation = {
      id: operationId,
      type: 'strategy-build',
      description: `AI-generated ${blueprint.strategyType} strategy`,
      nodeChanges: { added: [], modified: [], removed: [] },
      edgeChanges: { added: [], modified: [], removed: [] },
      timestamp: new Date(),
      canUndo: true,
      canRedo: false
    };

    const errors: string[] = [];
    const warnings: string[] = [];
    let nodesCreated = 0;
    let edgesCreated = 0;

    try {
      // Start AI operation
      this.startOperation(operation);

      // Create nodes using existing addNode method
      for (const placement of placements) {
        try {
          const component = blueprint.components.find(c => c.id === placement.nodeId);
          if (!component) {
            warnings.push(`Component not found for placement: ${placement.nodeId}`);
            continue;
          }

          const nodeTemplate = this.createNodeTemplate(component, placement);
          
          // Use existing addNode method - SAFE INTEGRATION
          this.builderStore.addNode(nodeTemplate);
          
          // Track AI metadata
          this.trackAINode(placement.nodeId, {
            nodeId: placement.nodeId,
            generatedBy: 'ai',
            confidence: placement.confidence,
            reasoning: placement.reasoning,
            originalComponent: component,
            placement,
            createdAt: new Date(),
            lastModified: new Date()
          });

          operation.nodeChanges.added.push(placement.nodeId);
          nodesCreated++;

        } catch (error) {
          errors.push(`Failed to create node ${placement.nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Create edges using existing addEdge method
      for (const connection of connections) {
        try {
          const connectionData: Connection = {
            source: connection.sourceNodeId,
            target: connection.targetNodeId,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle
          };

          // Use existing addEdge method - SAFE INTEGRATION
          this.builderStore.addEdge(connectionData);

          // Track AI metadata
          this.trackAIEdge(connection.id, {
            edgeId: connection.id,
            generatedBy: 'ai',
            confidence: connection.confidence,
            reasoning: connection.reasoning,
            originalConnection: connection,
            createdAt: new Date(),
            lastModified: new Date()
          });

          operation.edgeChanges.added.push(connection.id);
          edgesCreated++;

        } catch (error) {
          errors.push(`Failed to create connection ${connection.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Complete operation
      this.completeOperation(operation);

      // Auto-save if enabled
      if (this.aiState.settings.autoSave) {
        await this.autoSaveStrategy();
      }

      return {
        success: errors.length === 0,
        nodesCreated,
        edgesCreated,
        errors,
        warnings,
        operationId
      };

    } catch (error) {
      this.cancelOperation();
      return {
        success: false,
        nodesCreated: 0,
        edgesCreated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings,
        operationId
      };
    }
  }

  /**
   * Add single AI node to builder state
   * 
   * SAFE INTEGRATION: Uses existing addNode method
   */
  async addAINode(
    component: StrategyComponent,
    placement: NodePlacement
  ): Promise<{ success: boolean; nodeId: string; error?: string }> {
    if (!this.builderStore) {
      return { success: false, nodeId: '', error: 'Builder store not initialized' };
    }

    try {
      const nodeTemplate = this.createNodeTemplate(component, placement);
      
      // Use existing addNode method - SAFE INTEGRATION
      this.builderStore.addNode(nodeTemplate);

      // Track AI metadata
      this.trackAINode(placement.nodeId, {
        nodeId: placement.nodeId,
        generatedBy: 'ai',
        confidence: placement.confidence,
        reasoning: placement.reasoning,
        originalComponent: component,
        placement,
        createdAt: new Date(),
        lastModified: new Date()
      });

      return { success: true, nodeId: placement.nodeId };

    } catch (error) {
      return {
        success: false,
        nodeId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add single AI edge to builder state
   * 
   * SAFE INTEGRATION: Uses existing addEdge method
   */
  async addAIEdge(
    connection: AIConnection
  ): Promise<{ success: boolean; edgeId: string; error?: string }> {
    if (!this.builderStore) {
      return { success: false, edgeId: '', error: 'Builder store not initialized' };
    }

    try {
      const connectionData: Connection = {
        source: connection.sourceNodeId,
        target: connection.targetNodeId,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle
      };

      // Use existing addEdge method - SAFE INTEGRATION
      this.builderStore.addEdge(connectionData);

      // Track AI metadata
      this.trackAIEdge(connection.id, {
        edgeId: connection.id,
        generatedBy: 'ai',
        confidence: connection.confidence,
        reasoning: connection.reasoning,
        originalConnection: connection,
        createdAt: new Date(),
        lastModified: new Date()
      });

      return { success: true, edgeId: connection.id };

    } catch (error) {
      return {
        success: false,
        edgeId: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update AI node in builder state
   * 
   * SAFE INTEGRATION: Uses existing updateNode method
   */
  async updateAINode(
    nodeId: string,
    updates: Partial<BuilderNode>
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.builderStore) {
      return { success: false, error: 'Builder store not initialized' };
    }

    try {
      // Use existing updateNode method - SAFE INTEGRATION
      this.builderStore.updateNode(nodeId, updates);

      // Update AI metadata
      const aiMetadata = this.aiState.aiNodes.get(nodeId);
      if (aiMetadata) {
        aiMetadata.lastModified = new Date();
        this.aiState.aiNodes.set(nodeId, aiMetadata);
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Remove AI nodes and edges from builder state
   * 
   * SAFE INTEGRATION: Uses existing deleteNode and deleteEdge methods
   */
  async removeAIElements(
    nodeIds: string[],
    edgeIds: string[]
  ): Promise<StateIntegrationResult> {
    if (!this.builderStore) {
      throw new Error('Builder store not initialized');
    }

    const operationId = this.generateOperationId();
    const operation: AIOperation = {
      id: operationId,
      type: 'optimization',
      description: 'Remove AI-generated elements',
      nodeChanges: { added: [], modified: [], removed: nodeIds },
      edgeChanges: { added: [], modified: [], removed: edgeIds },
      timestamp: new Date(),
      canUndo: true,
      canRedo: false
    };

    const errors: string[] = [];

    try {
      this.startOperation(operation);

      // Remove edges first to avoid orphaned connections
      for (const edgeId of edgeIds) {
        try {
          // Use existing deleteEdge method - SAFE INTEGRATION
          this.builderStore.deleteEdge(edgeId);
          this.aiState.aiEdges.delete(edgeId);
        } catch (error) {
          errors.push(`Failed to remove edge ${edgeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Remove nodes
      for (const nodeId of nodeIds) {
        try {
          // Use existing deleteNode method - SAFE INTEGRATION
          this.builderStore.deleteNode(nodeId);
          this.aiState.aiNodes.delete(nodeId);
        } catch (error) {
          errors.push(`Failed to remove node ${nodeId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      this.completeOperation(operation);

      return {
        success: errors.length === 0,
        nodesCreated: 0,
        edgesCreated: 0,
        errors,
        warnings: [],
        operationId
      };

    } catch (error) {
      this.cancelOperation();
      throw error;
    }
  }

  /**
   * Undo AI operation
   * 
   * SAFE INTEGRATION: Uses existing undo method when possible
   */
  async undoAIOperation(): Promise<{ success: boolean; error?: string }> {
    if (!this.builderStore) {
      return { success: false, error: 'Builder store not initialized' };
    }

    if (!this.canUndoAI()) {
      return { success: false, error: 'No AI operations to undo' };
    }

    try {
      // Use existing undo method if available - SAFE INTEGRATION
      if (this.builderStore.canUndo && this.builderStore.canUndo()) {
        this.builderStore.undo();
      }

      // Update AI operation index
      this.aiState.operationIndex--;

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Redo AI operation
   * 
   * SAFE INTEGRATION: Uses existing redo method when possible
   */
  async redoAIOperation(): Promise<{ success: boolean; error?: string }> {
    if (!this.builderStore) {
      return { success: false, error: 'Builder store not initialized' };
    }

    if (!this.canRedoAI()) {
      return { success: false, error: 'No AI operations to redo' };
    }

    try {
      // Use existing redo method if available - SAFE INTEGRATION
      if (this.builderStore.canRedo && this.builderStore.canRedo()) {
        this.builderStore.redo();
      }

      // Update AI operation index
      this.aiState.operationIndex++;

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sync AI state with builder state
   * 
   * SAFE INTEGRATION: Reads from existing builder state without modification
   */
  syncWithBuilderState(): void {
    if (!this.builderStore) return;

    // Get current builder state
    const currentNodes = this.builderStore.nodes || [];
    const currentEdges = this.builderStore.edges || [];

    // Clean up AI metadata for removed elements
    const currentNodeIds = new Set(currentNodes.map((n: BuilderNode) => n.id));
    const currentEdgeIds = new Set(currentEdges.map((e: BuilderEdge) => e.id));

    // Remove AI metadata for deleted nodes
    for (const nodeId of this.aiState.aiNodes.keys()) {
      if (!currentNodeIds.has(nodeId)) {
        this.aiState.aiNodes.delete(nodeId);
      }
    }

    // Remove AI metadata for deleted edges
    for (const edgeId of this.aiState.aiEdges.keys()) {
      if (!currentEdgeIds.has(edgeId)) {
        this.aiState.aiEdges.delete(edgeId);
      }
    }
  }

  /**
   * Get AI-generated elements
   */
  getAIElements(): {
    nodes: Array<{ node: BuilderNode; metadata: AINodeMetadata }>;
    edges: Array<{ edge: BuilderEdge; metadata: AIEdgeMetadata }>;
  } {
    if (!this.builderStore) {
      return { nodes: [], edges: [] };
    }

    const currentNodes = this.builderStore.nodes || [];
    const currentEdges = this.builderStore.edges || [];

    const aiNodes = currentNodes
      .filter((node: BuilderNode) => this.aiState.aiNodes.has(node.id))
      .map((node: BuilderNode) => ({
        node,
        metadata: this.aiState.aiNodes.get(node.id)!
      }));

    const aiEdges = currentEdges
      .filter((edge: BuilderEdge) => this.aiState.aiEdges.has(edge.id))
      .map((edge: BuilderEdge) => ({
        edge,
        metadata: this.aiState.aiEdges.get(edge.id)!
      }));

    return { nodes: aiNodes, edges: aiEdges };
  }

  /**
   * Get AI operation history
   */
  getOperationHistory(): AIOperation[] {
    return [...this.aiState.operationHistory];
  }

  /**
   * Check if can undo AI operations
   */
  canUndoAI(): boolean {
    return this.aiState.operationIndex >= 0;
  }

  /**
   * Check if can redo AI operations
   */
  canRedoAI(): boolean {
    return this.aiState.operationIndex < this.aiState.operationHistory.length - 1;
  }

  /**
   * Create node template from component and placement
   */
  private createNodeTemplate(component: StrategyComponent, placement: NodePlacement): Partial<BuilderNode> {
    return {
      id: placement.nodeId,
      type: component.type,
      position: placement.position,
      data: {
        id: placement.nodeId,
        type: component.type,
        label: component.subtype || component.type,
        description: `AI-generated ${component.type}`,
        config: component.parameters || {},
        parameters: component.parameters || {},
        aiGenerated: true,
        confidence: placement.confidence,
        reasoning: placement.reasoning
      }
    };
  }

  /**
   * Track AI node metadata
   */
  private trackAINode(nodeId: string, metadata: AINodeMetadata): void {
    this.aiState.aiNodes.set(nodeId, metadata);
  }

  /**
   * Track AI edge metadata
   */
  private trackAIEdge(edgeId: string, metadata: AIEdgeMetadata): void {
    this.aiState.aiEdges.set(edgeId, metadata);
  }

  /**
   * Start AI operation
   */
  private startOperation(operation: AIOperation): void {
    this.aiState.currentOperation = operation;
  }

  /**
   * Complete AI operation
   */
  private completeOperation(operation: AIOperation): void {
    // Add to history
    const newHistory = this.aiState.operationHistory.slice(0, this.aiState.operationIndex + 1);
    newHistory.push(operation);

    // Limit history size
    if (newHistory.length > this.aiState.settings.maxHistorySize) {
      newHistory.shift();
    }

    this.aiState.operationHistory = newHistory;
    this.aiState.operationIndex = newHistory.length - 1;
    this.aiState.currentOperation = null;
  }

  /**
   * Cancel current operation
   */
  private cancelOperation(): void {
    this.aiState.currentOperation = null;
  }

  /**
   * Auto-save strategy
   */
  private async autoSaveStrategy(): Promise<void> {
    if (!this.builderStore || !this.builderStore.saveStrategy) return;

    try {
      await this.builderStore.saveStrategy(`AI_Strategy_${Date.now()}`);
    } catch (error) {
      console.warn('Auto-save failed:', error);
    }
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(): string {
    return `ai_op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update settings
   */
  updateSettings(newSettings: Partial<AIBuilderSettings>): void {
    this.aiState.settings = { ...this.aiState.settings, ...newSettings };
  }

  /**
   * Get current settings
   */
  getSettings(): AIBuilderSettings {
    return { ...this.aiState.settings };
  }

  /**
   * Get AI state
   */
  getAIState(): AIBuilderState {
    return { ...this.aiState };
  }

  /**
   * Clear AI state
   */
  clearAIState(): void {
    this.aiState.aiNodes.clear();
    this.aiState.aiEdges.clear();
    this.aiState.operationHistory = [];
    this.aiState.operationIndex = -1;
    this.aiState.currentOperation = null;
  }
}

/**
 * Create a singleton AI builder state integrator instance
 */
let aiBuilderStateIntegratorInstance: AIBuilderStateIntegrator | null = null;

export function getAIBuilderStateIntegrator(): AIBuilderStateIntegrator {
  if (!aiBuilderStateIntegratorInstance) {
    aiBuilderStateIntegratorInstance = new AIBuilderStateIntegrator();
  }
  return aiBuilderStateIntegratorInstance;
}

/**
 * Reset the AI builder state integrator instance (for testing)
 */
export function resetAIBuilderStateIntegrator(): void {
  aiBuilderStateIntegratorInstance = null;
}

/**
 * Utility functions for AI builder state integration
 */
export const AIBuilderStateUtils = {
  /**
   * Validate AI operation
   */
  validateAIOperation(operation: AIOperation): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!operation.id) {
      errors.push('Operation must have an ID');
    }

    if (!operation.type) {
      errors.push('Operation must have a type');
    }

    if (!operation.description) {
      warnings.push('Operation should have a description');
    }

    if (operation.nodeChanges.added.length === 0 && 
        operation.nodeChanges.modified.length === 0 && 
        operation.nodeChanges.removed.length === 0 &&
        operation.edgeChanges.added.length === 0 && 
        operation.edgeChanges.modified.length === 0 && 
        operation.edgeChanges.removed.length === 0) {
      warnings.push('Operation has no changes');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Calculate operation impact
   */
  calculateOperationImpact(operation: AIOperation): {
    totalChanges: number;
    nodeChanges: number;
    edgeChanges: number;
    impactLevel: 'low' | 'medium' | 'high';
  } {
    const nodeChanges = operation.nodeChanges.added.length + 
                       operation.nodeChanges.modified.length + 
                       operation.nodeChanges.removed.length;

    const edgeChanges = operation.edgeChanges.added.length + 
                       operation.edgeChanges.modified.length + 
                       operation.edgeChanges.removed.length;

    const totalChanges = nodeChanges + edgeChanges;

    let impactLevel: 'low' | 'medium' | 'high' = 'low';
    if (totalChanges > 10) {
      impactLevel = 'high';
    } else if (totalChanges > 3) {
      impactLevel = 'medium';
    }

    return {
      totalChanges,
      nodeChanges,
      edgeChanges,
      impactLevel
    };
  },

  /**
   * Generate operation summary
   */
  generateOperationSummary(operation: AIOperation): string {
    const impact = AIBuilderStateUtils.calculateOperationImpact(operation);
    
    const parts = [];
    
    if (operation.nodeChanges.added.length > 0) {
      parts.push(`Added ${operation.nodeChanges.added.length} nodes`);
    }
    
    if (operation.nodeChanges.modified.length > 0) {
      parts.push(`Modified ${operation.nodeChanges.modified.length} nodes`);
    }
    
    if (operation.nodeChanges.removed.length > 0) {
      parts.push(`Removed ${operation.nodeChanges.removed.length} nodes`);
    }
    
    if (operation.edgeChanges.added.length > 0) {
      parts.push(`Added ${operation.edgeChanges.added.length} connections`);
    }
    
    if (operation.edgeChanges.modified.length > 0) {
      parts.push(`Modified ${operation.edgeChanges.modified.length} connections`);
    }
    
    if (operation.edgeChanges.removed.length > 0) {
      parts.push(`Removed ${operation.edgeChanges.removed.length} connections`);
    }

    const summary = parts.join(', ');
    return summary || 'No changes';
  },

  /**
   * Export AI state
   */
  exportAIState(aiState: AIBuilderState): string {
    const exportData = {
      aiNodes: Array.from(aiState.aiNodes.entries()),
      aiEdges: Array.from(aiState.aiEdges.entries()),
      operationHistory: aiState.operationHistory,
      settings: aiState.settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(exportData, null, 2);
  },

  /**
   * Import AI state
   */
  importAIState(stateData: string): Partial<AIBuilderState> | null {
    try {
      const parsed = JSON.parse(stateData);
      
      return {
        aiNodes: new Map(parsed.aiNodes || []),
        aiEdges: new Map(parsed.aiEdges || []),
        operationHistory: parsed.operationHistory || [],
        operationIndex: (parsed.operationHistory || []).length - 1,
        settings: parsed.settings || DEFAULT_AI_BUILDER_SETTINGS
      };
    } catch (error) {
      console.error('Failed to import AI state:', error);
      return null;
    }
  }
};