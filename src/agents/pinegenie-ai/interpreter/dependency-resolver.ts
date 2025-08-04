/**
 * Component Dependency Resolver
 * 
 * Resolves dependencies between strategy components to ensure proper
 * execution order and data flow in trading strategies.
 */

import { 
  StrategyComponent, 
  ComponentType, 
  StrategyFlow, 
  FlowType 
} from '../types/strategy-types';

import { AILogger } from '../core/logger';
import { AIError, AIErrorType } from '../core/error-handler';

export interface DependencyNode {
  componentId: string;
  component: StrategyComponent;
  dependencies: string[];
  dependents: string[];
  level: number;
  resolved: boolean;
}

export interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: DependencyEdge[];
  levels: string[][];
  hasCycles: boolean;
  executionOrder: string[];
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: DependencyType;
  weight: number;
  required: boolean;
}

export enum DependencyType {
  DATA_FLOW = 'data_flow',
  SIGNAL_FLOW = 'signal_flow',
  TRIGGER_FLOW = 'trigger_flow',
  CONTROL_FLOW = 'control_flow',
  VALIDATION_FLOW = 'validation_flow'
}

export interface DependencyResolutionResult {
  graph: DependencyGraph;
  executionOrder: string[];
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export class DependencyResolver {
  private logger: AILogger;
  
  // Dependency rules for different component types
  private dependencyRules: Map<ComponentType, DependencyRule[]> = new Map();
  
  // Cache for resolved dependencies
  private resolutionCache: Map<string, DependencyResolutionResult> = new Map();

  constructor() {
    this.logger = AILogger.getInstance();
    this.initializeDependencyRules();
    
    this.logger.info('DependencyResolver', 'Dependency resolver initialized', {
      ruleCount: Array.from(this.dependencyRules.values()).reduce((sum, rules) => sum + rules.length, 0)
    });
  }

  /**
   * Resolve dependencies for a set of components
   */
  public resolveDependencies(components: StrategyComponent[]): DependencyResolutionResult {
    const startTime = performance.now();
    
    try {
      this.logger.debug('DependencyResolver', 'Starting dependency resolution', {
        componentCount: components.length,
        componentTypes: this.getComponentTypeCounts(components)
      });

      // Create dependency graph
      const graph = this.buildDependencyGraph(components);
      
      // Check for cycles
      const cycleCheck = this.detectCycles(graph);
      if (cycleCheck.hasCycles) {
        throw new AIError(
          AIErrorType.VALIDATION_FAILED,
          'Circular dependencies detected in strategy components',
          { cycles: cycleCheck.cycles }
        );
      }

      // Calculate execution order
      const executionOrder = this.calculateExecutionOrder(graph);
      
      // Validate dependencies
      const validation = this.validateDependencies(graph, components);

      const processingTime = performance.now() - startTime;
      
      this.logger.info('DependencyResolver', 'Dependency resolution completed', {
        componentCount: components.length,
        dependencyCount: graph.edges.length,
        levels: graph.levels.length,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        graph,
        executionOrder,
        warnings: validation.warnings,
        errors: validation.errors,
        suggestions: validation.suggestions
      };

    } catch (error) {
      this.logger.error('DependencyResolver', 'Dependency resolution failed', { error, components });
      
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        AIErrorType.VALIDATION_FAILED,
        'Failed to resolve component dependencies',
        { originalError: error, components }
      );
    }
  }

  /**
   * Build dependency graph from components
   */
  private buildDependencyGraph(components: StrategyComponent[]): DependencyGraph {
    const nodes = new Map<string, DependencyNode>();
    const edges: DependencyEdge[] = [];

    // Create nodes
    for (const component of components) {
      nodes.set(component.id, {
        componentId: component.id,
        component,
        dependencies: [],
        dependents: [],
        level: -1,
        resolved: false
      });
    }

    // Create edges based on dependency rules
    for (const component of components) {
      const componentRules = this.dependencyRules.get(component.type) || [];
      
      for (const rule of componentRules) {
        const dependencies = this.findDependencies(component, components, rule);
        
        for (const dependency of dependencies) {
          const edge: DependencyEdge = {
            from: dependency.componentId,
            to: component.id,
            type: dependency.type,
            weight: dependency.weight,
            required: dependency.required
          };
          
          edges.push(edge);
          
          // Update node dependencies
          const fromNode = nodes.get(dependency.componentId);
          const toNode = nodes.get(component.id);
          
          if (fromNode && toNode) {
            toNode.dependencies.push(dependency.componentId);
            fromNode.dependents.push(component.id);
          }
        }
      }
    }

    // Calculate levels
    const levels = this.calculateLevels(nodes);
    
    // Determine execution order
    const executionOrder = this.topologicalSort(nodes, edges);

    return {
      nodes,
      edges,
      levels,
      hasCycles: false, // Will be set by cycle detection
      executionOrder
    };
  }

  /**
   * Find dependencies for a component based on rules
   */
  private findDependencies(
    component: StrategyComponent,
    allComponents: StrategyComponent[],
    rule: DependencyRule
  ): ComponentDependency[] {
    const dependencies: ComponentDependency[] = [];

    for (const targetType of rule.dependsOn) {
      const candidates = allComponents.filter(c => 
        c.type === targetType && c.id !== component.id
      );

      if (candidates.length === 0 && rule.required) {
        this.logger.warn('DependencyResolver', 'Required dependency not found', {
          component: component.id,
          requiredType: targetType,
          rule: rule.name
        });
        continue;
      }

      // Select best candidate based on priority and compatibility
      const bestCandidate = this.selectBestDependency(component, candidates, rule);
      
      if (bestCandidate) {
        dependencies.push({
          componentId: bestCandidate.id,
          type: rule.dependencyType,
          weight: rule.weight,
          required: rule.required
        });
      }
    }

    return dependencies;
  }

  /**
   * Select best dependency candidate
   */
  private selectBestDependency(
    component: StrategyComponent,
    candidates: StrategyComponent[],
    rule: DependencyRule
  ): StrategyComponent | null {
    if (candidates.length === 0) return null;
    if (candidates.length === 1) return candidates[0];

    // Score candidates based on compatibility
    const scoredCandidates = candidates.map(candidate => ({
      component: candidate,
      score: this.calculateCompatibilityScore(component, candidate, rule)
    }));

    // Sort by score (highest first)
    scoredCandidates.sort((a, b) => b.score - a.score);

    return scoredCandidates[0].component;
  }

  /**
   * Calculate compatibility score between components
   */
  private calculateCompatibilityScore(
    component: StrategyComponent,
    candidate: StrategyComponent,
    rule: DependencyRule
  ): number {
    let score = 0;

    // Base score from rule weight
    score += rule.weight * 10;

    // Priority bonus (higher priority components are preferred)
    score += candidate.priority * 2;

    // Type compatibility bonus
    if (this.areTypesCompatible(component.type, candidate.type)) {
      score += 5;
    }

    // Subtype compatibility bonus
    if (this.areSubtypesCompatible(component.subtype, candidate.subtype)) {
      score += 3;
    }

    // Parameter compatibility bonus
    const paramCompatibility = this.calculateParameterCompatibility(
      component.parameters,
      candidate.parameters
    );
    score += paramCompatibility * 2;

    return score;
  }

  /**
   * Calculate levels for topological ordering
   */
  private calculateLevels(nodes: Map<string, DependencyNode>): string[][] {
    const levels: string[][] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();

    // Find root nodes (no dependencies)
    const rootNodes = Array.from(nodes.values()).filter(node => 
      node.dependencies.length === 0
    );

    // Start with root nodes at level 0
    if (rootNodes.length > 0) {
      levels[0] = rootNodes.map(node => node.componentId);
      rootNodes.forEach(node => {
        node.level = 0;
        visited.add(node.componentId);
      });
    }

    // Calculate levels for remaining nodes
    let currentLevel = 0;
    while (visited.size < nodes.size && currentLevel < 100) { // Prevent infinite loops
      const nextLevel: string[] = [];
      
      for (const [nodeId, node] of nodes) {
        if (visited.has(nodeId)) continue;
        
        // Check if all dependencies are resolved
        const allDepsResolved = node.dependencies.every(depId => visited.has(depId));
        
        if (allDepsResolved) {
          nextLevel.push(nodeId);
          node.level = currentLevel + 1;
        }
      }

      if (nextLevel.length > 0) {
        levels[currentLevel + 1] = nextLevel;
        nextLevel.forEach(nodeId => visited.add(nodeId));
      }

      currentLevel++;
    }

    return levels;
  }

  /**
   * Topological sort for execution order
   */
  private topologicalSort(
    nodes: Map<string, DependencyNode>,
    edges: DependencyEdge[]
  ): string[] {
    const result: string[] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();

    const visit = (nodeId: string): void => {
      if (processing.has(nodeId)) {
        throw new AIError(
          AIErrorType.VALIDATION_FAILED,
          'Circular dependency detected',
          { nodeId, processingStack: Array.from(processing) }
        );
      }

      if (visited.has(nodeId)) return;

      processing.add(nodeId);
      
      const node = nodes.get(nodeId);
      if (node) {
        // Visit all dependencies first
        for (const depId of node.dependencies) {
          visit(depId);
        }
      }

      processing.delete(nodeId);
      visited.add(nodeId);
      result.push(nodeId);
    };

    // Visit all nodes
    for (const nodeId of nodes.keys()) {
      if (!visited.has(nodeId)) {
        visit(nodeId);
      }
    }

    return result;
  }

  /**
   * Detect cycles in dependency graph
   */
  private detectCycles(graph: DependencyGraph): { hasCycles: boolean; cycles: string[][] } {
    const visited = new Set<string>();
    const processing = new Set<string>();
    const cycles: string[][] = [];

    const detectCycle = (nodeId: string, path: string[]): boolean => {
      if (processing.has(nodeId)) {
        // Found cycle
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart).concat([nodeId]));
        return true;
      }

      if (visited.has(nodeId)) return false;

      processing.add(nodeId);
      path.push(nodeId);

      const node = graph.nodes.get(nodeId);
      if (node) {
        for (const depId of node.dependencies) {
          if (detectCycle(depId, [...path])) {
            return true;
          }
        }
      }

      processing.delete(nodeId);
      visited.add(nodeId);
      path.pop();

      return false;
    };

    let hasCycles = false;
    for (const nodeId of graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (detectCycle(nodeId, [])) {
          hasCycles = true;
        }
      }
    }

    graph.hasCycles = hasCycles;
    return { hasCycles, cycles };
  }

  /**
   * Calculate execution order considering priorities and dependencies
   */
  private calculateExecutionOrder(graph: DependencyGraph): string[] {
    const order: string[] = [];
    
    // Process levels in order
    for (const level of graph.levels) {
      // Sort within level by priority
      const sortedLevel = level.sort((a, b) => {
        const nodeA = graph.nodes.get(a);
        const nodeB = graph.nodes.get(b);
        
        if (!nodeA || !nodeB) return 0;
        
        return nodeA.component.priority - nodeB.component.priority;
      });
      
      order.push(...sortedLevel);
    }

    return order;
  }

  /**
   * Validate dependencies
   */
  private validateDependencies(
    graph: DependencyGraph,
    components: StrategyComponent[]
  ): { warnings: string[]; errors: string[]; suggestions: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Check for missing required dependencies
    for (const [nodeId, node] of graph.nodes) {
      const rules = this.dependencyRules.get(node.component.type) || [];
      
      for (const rule of rules) {
        if (rule.required) {
          const hasRequiredDep = node.dependencies.some(depId => {
            const depNode = graph.nodes.get(depId);
            return depNode && rule.dependsOn.includes(depNode.component.type);
          });

          if (!hasRequiredDep) {
            errors.push(`Component ${node.component.label} is missing required dependency: ${rule.dependsOn.join(', ')}`);
          }
        }
      }
    }

    // Check for orphaned components
    const orphanedComponents = Array.from(graph.nodes.values()).filter(node =>
      node.dependencies.length === 0 && node.dependents.length === 0 &&
      node.component.type !== ComponentType.DATA_SOURCE
    );

    for (const orphan of orphanedComponents) {
      warnings.push(`Component ${orphan.component.label} appears to be orphaned (no connections)`);
      suggestions.push(`Consider connecting ${orphan.component.label} to other components`);
    }

    // Check for performance issues
    const deepLevels = graph.levels.length;
    if (deepLevels > 10) {
      warnings.push(`Strategy has ${deepLevels} dependency levels, which may impact performance`);
      suggestions.push('Consider simplifying the strategy structure');
    }

    return { warnings, errors, suggestions };
  }

  // Helper methods

  private getComponentTypeCounts(components: StrategyComponent[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const component of components) {
      counts[component.type] = (counts[component.type] || 0) + 1;
    }

    return counts;
  }

  private areTypesCompatible(type1: ComponentType, type2: ComponentType): boolean {
    // Define compatibility matrix
    const compatibilityMatrix: Record<ComponentType, ComponentType[]> = {
      [ComponentType.DATA_SOURCE]: [ComponentType.INDICATOR, ComponentType.CONDITION],
      [ComponentType.INDICATOR]: [ComponentType.CONDITION, ComponentType.MATH],
      [ComponentType.CONDITION]: [ComponentType.ACTION, ComponentType.LOGIC],
      [ComponentType.ACTION]: [ComponentType.RISK_MANAGEMENT],
      [ComponentType.RISK_MANAGEMENT]: [],
      [ComponentType.TIMING]: [ComponentType.CONDITION, ComponentType.ACTION],
      [ComponentType.MATH]: [ComponentType.CONDITION, ComponentType.INDICATOR],
      [ComponentType.LOGIC]: [ComponentType.CONDITION, ComponentType.ACTION]
    };

    return compatibilityMatrix[type2]?.includes(type1) || false;
  }

  private areSubtypesCompatible(subtype1: string, subtype2: string): boolean {
    // Simple compatibility check - can be expanded
    return subtype1 === subtype2;
  }

  private calculateParameterCompatibility(
    params1: Record<string, unknown>,
    params2: Record<string, unknown>
  ): number {
    // Simple parameter compatibility score
    const keys1 = Object.keys(params1);
    const keys2 = Object.keys(params2);
    
    if (keys1.length === 0 && keys2.length === 0) return 1;
    if (keys1.length === 0 || keys2.length === 0) return 0.5;

    const commonKeys = keys1.filter(key => keys2.includes(key));
    return commonKeys.length / Math.max(keys1.length, keys2.length);
  }

  private initializeDependencyRules(): void {
    // Data Source rules
    this.dependencyRules.set(ComponentType.DATA_SOURCE, []);

    // Indicator rules
    this.dependencyRules.set(ComponentType.INDICATOR, [
      {
        name: 'indicator_data_dependency',
        dependsOn: [ComponentType.DATA_SOURCE],
        dependencyType: DependencyType.DATA_FLOW,
        weight: 1.0,
        required: true
      }
    ]);

    // Condition rules
    this.dependencyRules.set(ComponentType.CONDITION, [
      {
        name: 'condition_signal_dependency',
        dependsOn: [ComponentType.INDICATOR, ComponentType.DATA_SOURCE],
        dependencyType: DependencyType.SIGNAL_FLOW,
        weight: 0.9,
        required: true
      }
    ]);

    // Action rules
    this.dependencyRules.set(ComponentType.ACTION, [
      {
        name: 'action_trigger_dependency',
        dependsOn: [ComponentType.CONDITION],
        dependencyType: DependencyType.TRIGGER_FLOW,
        weight: 1.0,
        required: true
      }
    ]);

    // Risk Management rules
    this.dependencyRules.set(ComponentType.RISK_MANAGEMENT, [
      {
        name: 'risk_action_dependency',
        dependsOn: [ComponentType.ACTION],
        dependencyType: DependencyType.CONTROL_FLOW,
        weight: 0.8,
        required: false
      }
    ]);

    // Timing rules
    this.dependencyRules.set(ComponentType.TIMING, [
      {
        name: 'timing_condition_dependency',
        dependsOn: [ComponentType.CONDITION, ComponentType.ACTION],
        dependencyType: DependencyType.CONTROL_FLOW,
        weight: 0.6,
        required: false
      }
    ]);

    // Math rules
    this.dependencyRules.set(ComponentType.MATH, [
      {
        name: 'math_data_dependency',
        dependsOn: [ComponentType.INDICATOR, ComponentType.DATA_SOURCE],
        dependencyType: DependencyType.DATA_FLOW,
        weight: 0.7,
        required: true
      }
    ]);

    // Logic rules
    this.dependencyRules.set(ComponentType.LOGIC, [
      {
        name: 'logic_condition_dependency',
        dependsOn: [ComponentType.CONDITION],
        dependencyType: DependencyType.SIGNAL_FLOW,
        weight: 0.8,
        required: true
      }
    ]);
  }
}

// Supporting interfaces

interface DependencyRule {
  name: string;
  dependsOn: ComponentType[];
  dependencyType: DependencyType;
  weight: number;
  required: boolean;
}

interface ComponentDependency {
  componentId: string;
  type: DependencyType;
  weight: number;
  required: boolean;
}