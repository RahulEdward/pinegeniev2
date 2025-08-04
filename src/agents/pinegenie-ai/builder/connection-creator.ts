/**
 * AI-Enhanced Automatic Connection Creation System for PineGenie Strategy Builder
 * 
 * This module provides intelligent connection creation that works with the existing
 * connection manager APIs without modifying core files. It uses existing validation
 * methods and connection system.
 * 
 * SAFE INTEGRATION: Uses existing connection manager APIs without modification
 * PROTECTION: No changes to connection-manager.ts or related files
 * 
 * Requirements: 1.2, 1.3, 7.1
 */

import { Point } from '../../../app/builder/utils/coordinate-system';
import { 
  ConnectionManager, 
  Connection, 
  ConnectionAttempt, 
  ConnectionValidationResult,
  ConnectionNode,
  getConnectionManager
} from '../../../app/builder/utils/connection-manager';

import { BuilderNode, BuilderEdge } from '../../../app/builder/builder-state';
import { StrategyBlueprint, StrategyComponent } from '../types/strategy-types';

export interface AIConnectionConfig {
  /** Connection rules for different node types */
  connectionRules: {
    [sourceType: string]: {
      allowedTargets: string[];
      priority: number;
      maxConnections: number;
    };
  };
  /** Animation settings for connection creation */
  animationSettings: {
    connectionDelay: number;
    animationDuration: number;
    highlightDuration: number;
  };
  /** Validation settings */
  validation: {
    allowCircularConnections: boolean;
    maxConnectionsPerNode: number;
    requireUniqueConnections: boolean;
  };
}

export interface ConnectionCreationResult {
  success: boolean;
  connections: AIConnection[];
  errors: string[];
  warnings: string[];
  totalDuration: number;
}

export interface AIConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceHandle: 'output';
  targetHandle: 'input';
  animationDelay: number;
  reasoning: string;
  confidence: number;
  priority: number;
}

export interface ConnectionPlan {
  connections: AIConnection[];
  executionOrder: number[];
  totalDuration: number;
  reasoning: string;
}

/**
 * Default AI connection configuration
 */
export const DEFAULT_AI_CONNECTION_CONFIG: AIConnectionConfig = {
  connectionRules: {
    'data-source': {
      allowedTargets: ['indicator', 'condition', 'action'],
      priority: 1,
      maxConnections: 5
    },
    'indicator': {
      allowedTargets: ['condition', 'action', 'indicator'],
      priority: 2,
      maxConnections: 3
    },
    'condition': {
      allowedTargets: ['action', 'condition'],
      priority: 3,
      maxConnections: 2
    },
    'action': {
      allowedTargets: ['risk', 'timing'],
      priority: 4,
      maxConnections: 2
    },
    'risk': {
      allowedTargets: [],
      priority: 5,
      maxConnections: 0
    },
    'timing': {
      allowedTargets: ['action'],
      priority: 3,
      maxConnections: 1
    }
  },
  animationSettings: {
    connectionDelay: 200,
    animationDuration: 500,
    highlightDuration: 1000
  },
  validation: {
    allowCircularConnections: false,
    maxConnectionsPerNode: 5,
    requireUniqueConnections: true
  }
};

/**
 * AI-Enhanced Connection Creator Class
 * 
 * Provides intelligent connection creation using existing connection manager
 * without modifying core connection files.
 */
export class AIConnectionCreator {
  private config: AIConnectionConfig;
  private connectionManager: ConnectionManager;

  constructor(config: AIConnectionConfig = DEFAULT_AI_CONNECTION_CONFIG) {
    this.config = config;
    this.connectionManager = getConnectionManager();
  }

  /**
   * Create connections for a complete strategy blueprint
   * 
   * SAFE INTEGRATION: Uses existing connection manager APIs
   */
  async createStrategyConnections(
    blueprint: StrategyBlueprint,
    nodes: BuilderNode[]
  ): Promise<ConnectionCreationResult> {
    try {
      // Convert nodes to connection format
      const connectionNodes: ConnectionNode[] = nodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data
      }));

      // Update connection manager with current nodes
      this.connectionManager.updateNodes(connectionNodes);

      // Generate connection plan
      const connectionPlan = this.generateConnectionPlan(blueprint, connectionNodes);

      // Execute connections in planned order
      const createdConnections: AIConnection[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      for (const connectionIndex of connectionPlan.executionOrder) {
        const plannedConnection = connectionPlan.connections[connectionIndex];
        
        try {
          const success = await this.createSingleConnection(plannedConnection, connectionNodes);
          
          if (success) {
            createdConnections.push(plannedConnection);
          } else {
            errors.push(`Failed to create connection from ${plannedConnection.sourceNodeId} to ${plannedConnection.targetNodeId}`);
          }
        } catch (error) {
          errors.push(`Error creating connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // Add delay between connections for animation
        if (connectionIndex < connectionPlan.executionOrder.length - 1) {
          await this.delay(this.config.animationSettings.connectionDelay);
        }
      }

      return {
        success: errors.length === 0,
        connections: createdConnections,
        errors,
        warnings,
        totalDuration: connectionPlan.totalDuration
      };

    } catch (error) {
      return {
        success: false,
        connections: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        warnings: [],
        totalDuration: 0
      };
    }
  }

  /**
   * Create a single intelligent connection
   * 
   * SAFE INTEGRATION: Uses existing connection validation and creation
   */
  async createSingleConnection(
    aiConnection: AIConnection,
    nodes: ConnectionNode[]
  ): Promise<boolean> {
    // Validate connection using existing validation
    const connectionAttempt: ConnectionAttempt = {
      sourceNodeId: aiConnection.sourceNodeId,
      targetNodeId: aiConnection.targetNodeId,
      sourceHandle: aiConnection.sourceHandle,
      targetHandle: aiConnection.targetHandle
    };

    const validationResult = this.connectionManager.validateConnection(connectionAttempt);
    
    if (!validationResult.isValid) {
      console.warn('AI Connection validation failed:', validationResult.errors);
      return false;
    }

    // Create connection using existing connection manager
    const success = this.connectionManager.completeConnection(
      aiConnection.targetNodeId,
      aiConnection.targetHandle
    );

    if (success) {
      // Start connection animation if needed
      await this.animateConnection(aiConnection, nodes);
    }

    return success;
  }

  /**
   * Create connections between specific nodes
   * 
   * SAFE INTEGRATION: Uses existing connection validation
   */
  createConnectionsBetweenNodes(
    sourceNodes: BuilderNode[],
    targetNodes: BuilderNode[],
    connectionType: 'sequential' | 'parallel' | 'cross' = 'sequential'
  ): Promise<ConnectionCreationResult> {
    const connectionNodes: ConnectionNode[] = [...sourceNodes, ...targetNodes].map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }));

    const connections: AIConnection[] = [];

    switch (connectionType) {
      case 'sequential':
        connections.push(...this.createSequentialConnections(sourceNodes, targetNodes));
        break;
      case 'parallel':
        connections.push(...this.createParallelConnections(sourceNodes, targetNodes));
        break;
      case 'cross':
        connections.push(...this.createCrossConnections(sourceNodes, targetNodes));
        break;
    }

    // Execute connections
    return this.executeConnectionPlan({
      connections,
      executionOrder: connections.map((_, index) => index),
      totalDuration: connections.length * this.config.animationSettings.connectionDelay,
      reasoning: `Created ${connectionType} connections between node groups`
    }, connectionNodes);
  }

  /**
   * Optimize existing connections
   * 
   * SAFE INTEGRATION: Uses existing connection manager for analysis
   */
  optimizeExistingConnections(nodes: BuilderNode[]): Promise<ConnectionCreationResult> {
    const connectionNodes: ConnectionNode[] = nodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data
    }));

    // Analyze current connections
    const currentConnections = this.connectionManager.getConnections();
    const optimizations = this.analyzeConnectionOptimizations(currentConnections, connectionNodes);

    // Create optimization plan
    const optimizationPlan: ConnectionPlan = {
      connections: optimizations,
      executionOrder: optimizations.map((_, index) => index),
      totalDuration: optimizations.length * this.config.animationSettings.connectionDelay,
      reasoning: 'Optimized connections for better strategy flow'
    };

    return this.executeConnectionPlan(optimizationPlan, connectionNodes);
  }

  /**
   * Generate connection plan for strategy blueprint
   */
  private generateConnectionPlan(
    blueprint: StrategyBlueprint,
    nodes: ConnectionNode[]
  ): ConnectionPlan {
    const connections: AIConnection[] = [];
    
    // Group components by type for logical connection order
    const componentsByType = this.groupComponentsByType(blueprint.components);
    
    // Create connections based on strategy flow
    const strategyFlow = blueprint.flow || this.generateDefaultFlow(componentsByType);
    
    strategyFlow.forEach((flowStep, stepIndex) => {
      const sourceComponents = componentsByType[flowStep.from] || [];
      const targetComponents = componentsByType[flowStep.to] || [];
      
      sourceComponents.forEach((sourceComponent, sourceIndex) => {
        targetComponents.forEach((targetComponent, targetIndex) => {
          const sourceNode = nodes.find(n => n.id === sourceComponent.id);
          const targetNode = nodes.find(n => n.id === targetComponent.id);
          
          if (sourceNode && targetNode && this.shouldConnect(sourceComponent, targetComponent)) {
            connections.push({
              id: `ai_conn_${sourceNode.id}_${targetNode.id}`,
              sourceNodeId: sourceNode.id,
              targetNodeId: targetNode.id,
              sourceHandle: 'output',
              targetHandle: 'input',
              animationDelay: (stepIndex * 500) + (sourceIndex * 200) + (targetIndex * 100),
              reasoning: `Connecting ${sourceComponent.type} to ${targetComponent.type} for strategy flow`,
              confidence: this.calculateConnectionConfidence(sourceComponent, targetComponent),
              priority: this.getConnectionPriority(sourceComponent.type, targetComponent.type)
            });
          }
        });
      });
    });

    // Sort connections by priority and dependencies
    const sortedConnections = this.sortConnectionsByPriority(connections);
    const executionOrder = sortedConnections.map((_, index) => index);

    return {
      connections: sortedConnections,
      executionOrder,
      totalDuration: this.calculateTotalConnectionDuration(sortedConnections),
      reasoning: `Generated ${connections.length} connections for ${blueprint.strategyType} strategy`
    };
  }

  /**
   * Execute connection plan
   */
  private async executeConnectionPlan(
    plan: ConnectionPlan,
    nodes: ConnectionNode[]
  ): Promise<ConnectionCreationResult> {
    const createdConnections: AIConnection[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const connectionIndex of plan.executionOrder) {
      const connection = plan.connections[connectionIndex];
      
      try {
        const success = await this.createSingleConnection(connection, nodes);
        
        if (success) {
          createdConnections.push(connection);
        } else {
          errors.push(`Failed to create connection: ${connection.reasoning}`);
        }
      } catch (error) {
        errors.push(`Error executing connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      connections: createdConnections,
      errors,
      warnings,
      totalDuration: plan.totalDuration
    };
  }

  /**
   * Create sequential connections (1-to-1 in order)
   */
  private createSequentialConnections(
    sourceNodes: BuilderNode[],
    targetNodes: BuilderNode[]
  ): AIConnection[] {
    const connections: AIConnection[] = [];
    const minLength = Math.min(sourceNodes.length, targetNodes.length);

    for (let i = 0; i < minLength; i++) {
      connections.push({
        id: `seq_conn_${sourceNodes[i].id}_${targetNodes[i].id}`,
        sourceNodeId: sourceNodes[i].id,
        targetNodeId: targetNodes[i].id,
        sourceHandle: 'output',
        targetHandle: 'input',
        animationDelay: i * this.config.animationSettings.connectionDelay,
        reasoning: `Sequential connection ${i + 1} of ${minLength}`,
        confidence: 0.9,
        priority: i + 1
      });
    }

    return connections;
  }

  /**
   * Create parallel connections (1-to-many)
   */
  private createParallelConnections(
    sourceNodes: BuilderNode[],
    targetNodes: BuilderNode[]
  ): AIConnection[] {
    const connections: AIConnection[] = [];

    sourceNodes.forEach((sourceNode, sourceIndex) => {
      targetNodes.forEach((targetNode, targetIndex) => {
        connections.push({
          id: `par_conn_${sourceNode.id}_${targetNode.id}`,
          sourceNodeId: sourceNode.id,
          targetNodeId: targetNode.id,
          sourceHandle: 'output',
          targetHandle: 'input',
          animationDelay: (sourceIndex * targetNodes.length + targetIndex) * this.config.animationSettings.connectionDelay,
          reasoning: `Parallel connection from source ${sourceIndex + 1} to target ${targetIndex + 1}`,
          confidence: 0.8,
          priority: sourceIndex + 1
        });
      });
    });

    return connections;
  }

  /**
   * Create cross connections (many-to-many with logic)
   */
  private createCrossConnections(
    sourceNodes: BuilderNode[],
    targetNodes: BuilderNode[]
  ): AIConnection[] {
    const connections: AIConnection[] = [];

    sourceNodes.forEach((sourceNode, sourceIndex) => {
      // Find best target for each source based on type compatibility
      const bestTarget = this.findBestConnectionTarget(sourceNode, targetNodes);
      
      if (bestTarget) {
        const targetIndex = targetNodes.findIndex(n => n.id === bestTarget.id);
        connections.push({
          id: `cross_conn_${sourceNode.id}_${bestTarget.id}`,
          sourceNodeId: sourceNode.id,
          targetNodeId: bestTarget.id,
          sourceHandle: 'output',
          targetHandle: 'input',
          animationDelay: sourceIndex * this.config.animationSettings.connectionDelay,
          reasoning: `Cross connection based on type compatibility`,
          confidence: 0.85,
          priority: this.getConnectionPriority(sourceNode.type, bestTarget.type)
        });
      }
    });

    return connections;
  }

  /**
   * Find best connection target for a source node
   */
  private findBestConnectionTarget(
    sourceNode: BuilderNode,
    targetNodes: BuilderNode[]
  ): BuilderNode | null {
    const sourceRules = this.config.connectionRules[sourceNode.type];
    if (!sourceRules) return null;

    // Filter targets by allowed types
    const allowedTargets = targetNodes.filter(target =>
      sourceRules.allowedTargets.includes(target.type)
    );

    if (allowedTargets.length === 0) return null;

    // Return the first allowed target (could be enhanced with more logic)
    return allowedTargets[0];
  }

  /**
   * Group components by type
   */
  private groupComponentsByType(components: StrategyComponent[]): Record<string, StrategyComponent[]> {
    const groups: Record<string, StrategyComponent[]> = {};
    
    components.forEach(component => {
      if (!groups[component.type]) {
        groups[component.type] = [];
      }
      groups[component.type].push(component);
    });

    return groups;
  }

  /**
   * Generate default flow for strategy
   */
  private generateDefaultFlow(componentsByType: Record<string, StrategyComponent[]>): Array<{ from: string; to: string }> {
    const flow: Array<{ from: string; to: string }> = [];
    const typeOrder = ['data-source', 'indicator', 'condition', 'action', 'risk', 'timing'];
    
    for (let i = 0; i < typeOrder.length - 1; i++) {
      const fromType = typeOrder[i];
      const toType = typeOrder[i + 1];
      
      if (componentsByType[fromType] && componentsByType[toType]) {
        flow.push({ from: fromType, to: toType });
      }
    }

    return flow;
  }

  /**
   * Check if two components should be connected
   */
  private shouldConnect(source: StrategyComponent, target: StrategyComponent): boolean {
    const sourceRules = this.config.connectionRules[source.type];
    if (!sourceRules) return false;

    // Check if target type is allowed
    if (!sourceRules.allowedTargets.includes(target.type)) return false;

    // Check dependencies
    if (target.dependencies && !target.dependencies.includes(source.id || '')) {
      return false;
    }

    return true;
  }

  /**
   * Calculate connection confidence
   */
  private calculateConnectionConfidence(source: StrategyComponent, target: StrategyComponent): number {
    const sourceRules = this.config.connectionRules[source.type];
    if (!sourceRules) return 0.5;

    // Higher confidence for direct type matches
    if (sourceRules.allowedTargets.includes(target.type)) {
      return 0.9;
    }

    // Lower confidence for indirect connections
    return 0.6;
  }

  /**
   * Get connection priority
   */
  private getConnectionPriority(sourceType: string, targetType: string): number {
    const sourceRules = this.config.connectionRules[sourceType];
    const targetRules = this.config.connectionRules[targetType];
    
    const sourcePriority = sourceRules?.priority || 5;
    const targetPriority = targetRules?.priority || 5;
    
    return (sourcePriority + targetPriority) / 2;
  }

  /**
   * Sort connections by priority
   */
  private sortConnectionsByPriority(connections: AIConnection[]): AIConnection[] {
    return [...connections].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Calculate total connection duration
   */
  private calculateTotalConnectionDuration(connections: AIConnection[]): number {
    if (connections.length === 0) return 0;
    
    const maxDelay = Math.max(...connections.map(c => c.animationDelay));
    return maxDelay + this.config.animationSettings.animationDuration;
  }

  /**
   * Analyze connection optimizations
   */
  private analyzeConnectionOptimizations(
    currentConnections: Connection[],
    nodes: ConnectionNode[]
  ): AIConnection[] {
    const optimizations: AIConnection[] = [];

    // Find missing connections that should exist
    const missingConnections = this.findMissingConnections(nodes, currentConnections);
    optimizations.push(...missingConnections);

    // Find redundant connections that could be removed
    const redundantConnections = this.findRedundantConnections(currentConnections, nodes);
    // Note: We don't automatically remove connections, just identify them

    return optimizations;
  }

  /**
   * Find missing connections
   */
  private findMissingConnections(
    nodes: ConnectionNode[],
    existingConnections: Connection[]
  ): AIConnection[] {
    const missing: AIConnection[] = [];

    nodes.forEach(sourceNode => {
      const sourceRules = this.config.connectionRules[sourceNode.type];
      if (!sourceRules) return;

      sourceRules.allowedTargets.forEach(targetType => {
        const targetNodes = nodes.filter(n => n.type === targetType);
        
        targetNodes.forEach(targetNode => {
          // Check if connection already exists
          const connectionExists = existingConnections.some(conn =>
            (conn.source === sourceNode.id && conn.target === targetNode.id) ||
            (conn.source === targetNode.id && conn.target === sourceNode.id)
          );

          if (!connectionExists) {
            missing.push({
              id: `missing_conn_${sourceNode.id}_${targetNode.id}`,
              sourceNodeId: sourceNode.id,
              targetNodeId: targetNode.id,
              sourceHandle: 'output',
              targetHandle: 'input',
              animationDelay: 0,
              reasoning: `Missing connection between ${sourceNode.type} and ${targetNode.type}`,
              confidence: 0.7,
              priority: this.getConnectionPriority(sourceNode.type, targetNode.type)
            });
          }
        });
      });
    });

    return missing;
  }

  /**
   * Find redundant connections
   */
  private findRedundantConnections(
    connections: Connection[],
    nodes: ConnectionNode[]
  ): Connection[] {
    // This is a placeholder for redundancy detection logic
    // In a real implementation, you might check for:
    // - Duplicate paths
    // - Unnecessary intermediate nodes
    // - Circular dependencies that don't add value
    return [];
  }

  /**
   * Animate connection creation
   */
  private async animateConnection(
    connection: AIConnection,
    nodes: ConnectionNode[]
  ): Promise<void> {
    // This would integrate with the existing animation system
    // For now, we just add a delay to simulate animation
    await this.delay(connection.animationDelay);
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIConnectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIConnectionConfig {
    return { ...this.config };
  }
}

/**
 * Create a singleton AI connection creator instance
 */
let aiConnectionCreatorInstance: AIConnectionCreator | null = null;

export function getAIConnectionCreator(): AIConnectionCreator {
  if (!aiConnectionCreatorInstance) {
    aiConnectionCreatorInstance = new AIConnectionCreator();
  }
  return aiConnectionCreatorInstance;
}

/**
 * Reset the AI connection creator instance (for testing)
 */
export function resetAIConnectionCreator(): void {
  aiConnectionCreatorInstance = null;
}

/**
 * Utility functions for AI connection creation
 */
export const AIConnectionUtils = {
  /**
   * Validate connection configuration
   */
  validateConnectionConfig(config: AIConnectionConfig): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate connection rules
    Object.entries(config.connectionRules).forEach(([nodeType, rules]) => {
      if (rules.maxConnections < 0) {
        errors.push(`Invalid maxConnections for ${nodeType}: must be >= 0`);
      }
      
      if (rules.priority < 1) {
        warnings.push(`Low priority for ${nodeType}: consider using priority >= 1`);
      }
    });

    // Validate animation settings
    if (config.animationSettings.connectionDelay < 0) {
      errors.push('Connection delay must be >= 0');
    }

    if (config.animationSettings.animationDuration < 100) {
      warnings.push('Very short animation duration may not be visible');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Generate connection statistics
   */
  generateConnectionStats(connections: AIConnection[]): {
    totalConnections: number;
    averageConfidence: number;
    connectionsByType: Record<string, number>;
    priorityDistribution: Record<number, number>;
  } {
    const stats = {
      totalConnections: connections.length,
      averageConfidence: 0,
      connectionsByType: {} as Record<string, number>,
      priorityDistribution: {} as Record<number, number>
    };

    if (connections.length === 0) return stats;

    // Calculate average confidence
    const totalConfidence = connections.reduce((sum, conn) => sum + conn.confidence, 0);
    stats.averageConfidence = totalConfidence / connections.length;

    // Count connections by type (would need node type info)
    connections.forEach(conn => {
      const priority = Math.floor(conn.priority);
      stats.priorityDistribution[priority] = (stats.priorityDistribution[priority] || 0) + 1;
    });

    return stats;
  },

  /**
   * Export connection plan
   */
  exportConnectionPlan(plan: ConnectionPlan): string {
    return JSON.stringify({
      plan,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  },

  /**
   * Import connection plan
   */
  importConnectionPlan(planData: string): ConnectionPlan | null {
    try {
      const parsed = JSON.parse(planData);
      return parsed.plan || null;
    } catch (error) {
      console.error('Failed to import connection plan:', error);
      return null;
    }
  }
};