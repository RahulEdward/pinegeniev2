/**
 * Strategy Validation Engine
 * 
 * Validates strategy blueprints, components, and connections to ensure
 * correctness, completeness, and adherence to trading best practices.
 */

import { 
  StrategyBlueprint, 
  StrategyComponent, 
  ComponentType, 
  StrategyFlow, 
  FlowType,
  RiskProfile 
} from '../types/strategy-types';

import { BuilderNode, BuilderEdge } from '../types/builder-types';
import { ComponentNodeMapping } from './node-mapper';
import { ConnectionMapping } from './connection-logic';
import { AILogger } from '../core/logger';
import { AIError, AIErrorType } from '../core/error-handler';

export interface ValidationOptions {
  strictMode?: boolean;
  checkBestPractices?: boolean;
  validateRiskManagement?: boolean;
  checkPerformance?: boolean;
  allowExperimental?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  score: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  bestPractices: BestPracticeCheck[];
  performance: PerformanceMetrics;
}

export interface ValidationError {
  id: string;
  type: ValidationErrorType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  component?: string;
  connection?: string;
  suggestion?: string;
  fixable: boolean;
}

export interface ValidationWarning {
  id: string;
  type: ValidationWarningType;
  message: string;
  component?: string;
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface ValidationSuggestion {
  id: string;
  type: ValidationSuggestionType;
  message: string;
  benefit: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BestPracticeCheck {
  practice: string;
  compliant: boolean;
  description: string;
  importance: 'critical' | 'important' | 'recommended';
  suggestion?: string;
}

export interface PerformanceMetrics {
  complexity: number;
  latency: number;
  memoryUsage: number;
  executionTime: number;
  scalability: number;
  maintainability: number;
}

export enum ValidationErrorType {
  MISSING_COMPONENT = 'missing_component',
  INVALID_CONNECTION = 'invalid_connection',
  CIRCULAR_DEPENDENCY = 'circular_dependency',
  INCOMPATIBLE_TYPES = 'incompatible_types',
  INVALID_PARAMETERS = 'invalid_parameters',
  MISSING_RISK_MANAGEMENT = 'missing_risk_management',
  LOGIC_ERROR = 'logic_error'
}

export enum ValidationWarningType {
  SUBOPTIMAL_CONFIGURATION = 'suboptimal_configuration',
  PERFORMANCE_CONCERN = 'performance_concern',
  MAINTAINABILITY_ISSUE = 'maintainability_issue',
  BEST_PRACTICE_VIOLATION = 'best_practice_violation',
  POTENTIAL_RISK = 'potential_risk'
}

export enum ValidationSuggestionType {
  OPTIMIZATION = 'optimization',
  ENHANCEMENT = 'enhancement',
  SIMPLIFICATION = 'simplification',
  RISK_IMPROVEMENT = 'risk_improvement',
  PERFORMANCE_BOOST = 'performance_boost'
}

export class ValidationEngine {
  private logger: AILogger;
  
  // Validation rules
  private componentRules: Map<ComponentType, ComponentValidationRule[]> = new Map();
  private connectionRules: Map<string, ConnectionValidationRule[]> = new Map();
  private bestPracticeRules: BestPracticeRule[] = [];
  
  // Performance thresholds
  private performanceThresholds = {
    maxComplexity: 100,
    maxLatency: 1000, // ms
    maxMemoryUsage: 100, // MB
    maxExecutionTime: 5000, // ms
    minScalability: 0.7,
    minMaintainability: 0.6
  };

  constructor() {
    this.logger = AILogger.getInstance();
    
    this.initializeValidationRules();
    this.initializeBestPracticeRules();
    
    this.logger.info('ValidationEngine', 'Validation engine initialized', {
      componentRules: Array.from(this.componentRules.values()).reduce((sum, rules) => sum + rules.length, 0),
      connectionRules: Array.from(this.connectionRules.values()).reduce((sum, rules) => sum + rules.length, 0),
      bestPracticeRules: this.bestPracticeRules.length
    });
  }

  /**
   * Validate complete strategy blueprint
   */
  public validateStrategy(
    blueprint: StrategyBlueprint,
    mappings?: ComponentNodeMapping[],
    connections?: ConnectionMapping[],
    options: ValidationOptions = {}
  ): ValidationResult {
    const startTime = performance.now();
    
    try {
      this.logger.debug('ValidationEngine', 'Starting strategy validation', {
        blueprintId: blueprint.id,
        componentCount: blueprint.components.length,
        flowCount: blueprint.flow.length,
        options
      });

      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      const suggestions: ValidationSuggestion[] = [];
      const bestPractices: BestPracticeCheck[] = [];

      // Validate components
      const componentValidation = this.validateComponents(blueprint.components, options);
      errors.push(...componentValidation.errors);
      warnings.push(...componentValidation.warnings);
      suggestions.push(...componentValidation.suggestions);

      // Validate flows/connections
      const flowValidation = this.validateFlows(blueprint.flow, blueprint.components, options);
      errors.push(...flowValidation.errors);
      warnings.push(...flowValidation.warnings);
      suggestions.push(...flowValidation.suggestions);

      // Validate strategy structure
      const structureValidation = this.validateStrategyStructure(blueprint, options);
      errors.push(...structureValidation.errors);
      warnings.push(...structureValidation.warnings);
      suggestions.push(...structureValidation.suggestions);

      // Validate risk management
      if (options.validateRiskManagement !== false) {
        const riskValidation = this.validateRiskManagement(blueprint, options);
        errors.push(...riskValidation.errors);
        warnings.push(...riskValidation.warnings);
        suggestions.push(...riskValidation.suggestions);
      }

      // Check best practices
      if (options.checkBestPractices !== false) {
        bestPractices.push(...this.checkBestPractices(blueprint, options));
      }

      // Calculate performance metrics
      const performance = options.checkPerformance !== false ? 
        this.calculatePerformanceMetrics(blueprint, mappings, connections) :
        this.getDefaultPerformanceMetrics();

      // Calculate overall score
      const score = this.calculateValidationScore(errors, warnings, suggestions, bestPractices, performance);

      const processingTime = performance.now() - startTime;
      
      this.logger.info('ValidationEngine', 'Strategy validation completed', {
        blueprintId: blueprint.id,
        isValid: errors.filter(e => e.severity === 'critical').length === 0,
        score,
        errorCount: errors.length,
        warningCount: warnings.length,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        isValid: errors.filter(e => e.severity === 'critical').length === 0,
        score,
        errors,
        warnings,
        suggestions,
        bestPractices,
        performance
      };

    } catch (error) {
      this.logger.error('ValidationEngine', 'Strategy validation failed', { error, blueprint });
      
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        AIErrorType.VALIDATION_FAILED,
        'Failed to validate strategy',
        { originalError: error, blueprint }
      );
    }
  }

  /**
   * Validate strategy components
   */
  private validateComponents(
    components: StrategyComponent[],
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check for required component types
    const requiredTypes = [ComponentType.DATA_SOURCE, ComponentType.ACTION];
    for (const requiredType of requiredTypes) {
      const hasType = components.some(c => c.type === requiredType);
      if (!hasType) {
        errors.push({
          id: `missing_${requiredType}`,
          type: ValidationErrorType.MISSING_COMPONENT,
          severity: 'critical',
          message: `Missing required component type: ${requiredType}`,
          suggestion: `Add a ${requiredType} component to complete the strategy`,
          fixable: true
        });
      }
    }

    // Validate individual components
    for (const component of components) {
      const componentValidation = this.validateComponent(component, options);
      errors.push(...componentValidation.errors);
      warnings.push(...componentValidation.warnings);
      suggestions.push(...componentValidation.suggestions);
    }

    // Check for component balance
    const balanceCheck = this.checkComponentBalance(components);
    warnings.push(...balanceCheck.warnings);
    suggestions.push(...balanceCheck.suggestions);

    return { errors, warnings, suggestions };
  }

  /**
   * Validate individual component
   */
  private validateComponent(
    component: StrategyComponent,
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    const rules = this.componentRules.get(component.type) || [];
    
    for (const rule of rules) {
      const ruleResult = rule.validate(component, options);
      
      if (!ruleResult.isValid) {
        errors.push({
          id: `${component.id}_${rule.name}`,
          type: ruleResult.errorType || ValidationErrorType.INVALID_PARAMETERS,
          severity: ruleResult.severity || 'medium',
          message: ruleResult.message,
          component: component.id,
          suggestion: ruleResult.suggestion,
          fixable: ruleResult.fixable || false
        });
      }

      if (ruleResult.warnings) {
        warnings.push(...ruleResult.warnings.map(w => ({
          id: `${component.id}_${rule.name}_warning`,
          type: ValidationWarningType.SUBOPTIMAL_CONFIGURATION,
          message: w,
          component: component.id,
          impact: 'medium' as const,
          recommendation: ruleResult.suggestion || 'Review component configuration'
        })));
      }

      if (ruleResult.suggestions) {
        suggestions.push(...ruleResult.suggestions.map(s => ({
          id: `${component.id}_${rule.name}_suggestion`,
          type: ValidationSuggestionType.OPTIMIZATION,
          message: s,
          benefit: 'Improved component performance',
          implementation: 'Adjust component parameters',
          priority: 'medium' as const
        })));
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate strategy flows
   */
  private validateFlows(
    flows: StrategyFlow[],
    components: StrategyComponent[],
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies(flows);
    for (const cycle of circularDeps) {
      errors.push({
        id: `circular_dependency_${cycle.join('_')}`,
        type: ValidationErrorType.CIRCULAR_DEPENDENCY,
        severity: 'critical',
        message: `Circular dependency detected: ${cycle.join(' -> ')}`,
        suggestion: 'Remove or restructure connections to eliminate circular dependencies',
        fixable: true
      });
    }

    // Validate individual flows
    for (const flow of flows) {
      const flowValidation = this.validateFlow(flow, components, options);
      errors.push(...flowValidation.errors);
      warnings.push(...flowValidation.warnings);
      suggestions.push(...flowValidation.suggestions);
    }

    // Check flow connectivity
    const connectivityCheck = this.checkFlowConnectivity(flows, components);
    warnings.push(...connectivityCheck.warnings);
    suggestions.push(...connectivityCheck.suggestions);

    return { errors, warnings, suggestions };
  }

  /**
   * Validate individual flow
   */
  private validateFlow(
    flow: StrategyFlow,
    components: StrategyComponent[],
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    const sourceComponent = components.find(c => c.id === flow.from);
    const targetComponent = components.find(c => c.id === flow.to);

    if (!sourceComponent) {
      errors.push({
        id: `invalid_flow_source_${flow.from}`,
        type: ValidationErrorType.INVALID_CONNECTION,
        severity: 'high',
        message: `Flow source component not found: ${flow.from}`,
        suggestion: 'Remove invalid flow or add missing component',
        fixable: true
      });
    }

    if (!targetComponent) {
      errors.push({
        id: `invalid_flow_target_${flow.to}`,
        type: ValidationErrorType.INVALID_CONNECTION,
        severity: 'high',
        message: `Flow target component not found: ${flow.to}`,
        suggestion: 'Remove invalid flow or add missing component',
        fixable: true
      });
    }

    if (sourceComponent && targetComponent) {
      // Check type compatibility
      const compatibility = this.checkTypeCompatibility(sourceComponent.type, targetComponent.type);
      if (!compatibility.compatible) {
        errors.push({
          id: `incompatible_flow_${flow.from}_${flow.to}`,
          type: ValidationErrorType.INCOMPATIBLE_TYPES,
          severity: 'high',
          message: `Incompatible component types in flow: ${sourceComponent.type} -> ${targetComponent.type}`,
          suggestion: compatibility.suggestion,
          fixable: false
        });
      }
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Validate strategy structure
   */
  private validateStrategyStructure(
    blueprint: StrategyBlueprint,
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check for orphaned components
    const orphanedComponents = this.findOrphanedComponents(blueprint.components, blueprint.flow);
    for (const orphan of orphanedComponents) {
      warnings.push({
        id: `orphaned_component_${orphan.id}`,
        type: ValidationWarningType.MAINTAINABILITY_ISSUE,
        message: `Component ${orphan.label} appears to be orphaned (no connections)`,
        component: orphan.id,
        impact: 'medium',
        recommendation: 'Connect component to strategy flow or remove if unnecessary'
      });
    }

    // Check strategy completeness
    const completenessCheck = this.checkStrategyCompleteness(blueprint);
    errors.push(...completenessCheck.errors);
    warnings.push(...completenessCheck.warnings);
    suggestions.push(...completenessCheck.suggestions);

    return { errors, warnings, suggestions };
  }

  /**
   * Validate risk management
   */
  private validateRiskManagement(
    blueprint: StrategyBlueprint,
    options: ValidationOptions
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    const hasRiskComponents = blueprint.components.some(c => c.type === ComponentType.RISK_MANAGEMENT);
    
    if (!hasRiskComponents) {
      if (options.strictMode) {
        errors.push({
          id: 'missing_risk_management',
          type: ValidationErrorType.MISSING_RISK_MANAGEMENT,
          severity: 'high',
          message: 'Strategy lacks risk management components',
          suggestion: 'Add stop-loss and take-profit components',
          fixable: true
        });
      } else {
        warnings.push({
          id: 'no_risk_management',
          type: ValidationWarningType.POTENTIAL_RISK,
          message: 'Strategy does not include explicit risk management',
          impact: 'high',
          recommendation: 'Consider adding stop-loss and take-profit components'
        });
      }
    }

    // Validate risk profile
    if (blueprint.riskProfile) {
      const riskValidation = this.validateRiskProfile(blueprint.riskProfile);
      warnings.push(...riskValidation.warnings);
      suggestions.push(...riskValidation.suggestions);
    }

    return { errors, warnings, suggestions };
  }

  /**
   * Check best practices
   */
  private checkBestPractices(
    blueprint: StrategyBlueprint,
    options: ValidationOptions
  ): BestPracticeCheck[] {
    const checks: BestPracticeCheck[] = [];

    for (const rule of this.bestPracticeRules) {
      const result = rule.check(blueprint, options);
      checks.push(result);
    }

    return checks;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(
    blueprint: StrategyBlueprint,
    mappings?: ComponentNodeMapping[],
    connections?: ConnectionMapping[]
  ): PerformanceMetrics {
    const complexity = this.calculateComplexity(blueprint);
    const latency = this.calculateLatency(blueprint, connections);
    const memoryUsage = this.calculateMemoryUsage(blueprint);
    const executionTime = this.calculateExecutionTime(blueprint);
    const scalability = this.calculateScalability(blueprint);
    const maintainability = this.calculateMaintainability(blueprint);

    return {
      complexity,
      latency,
      memoryUsage,
      executionTime,
      scalability,
      maintainability
    };
  }

  /**
   * Calculate validation score
   */
  private calculateValidationScore(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: ValidationSuggestion[],
    bestPractices: BestPracticeCheck[],
    performance: PerformanceMetrics
  ): number {
    let score = 100; // Start with perfect score

    // Deduct points for errors
    for (const error of errors) {
      switch (error.severity) {
        case 'critical':
          score -= 25;
          break;
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    // Deduct points for warnings
    for (const warning of warnings) {
      switch (warning.impact) {
        case 'high':
          score -= 8;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    // Deduct points for best practice violations
    const violations = bestPractices.filter(bp => !bp.compliant);
    for (const violation of violations) {
      switch (violation.importance) {
        case 'critical':
          score -= 15;
          break;
        case 'important':
          score -= 10;
          break;
        case 'recommended':
          score -= 5;
          break;
      }
    }

    // Adjust for performance
    if (performance.complexity > this.performanceThresholds.maxComplexity) {
      score -= 10;
    }
    if (performance.latency > this.performanceThresholds.maxLatency) {
      score -= 10;
    }
    if (performance.scalability < this.performanceThresholds.minScalability) {
      score -= 10;
    }
    if (performance.maintainability < this.performanceThresholds.minMaintainability) {
      score -= 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  // Helper methods

  private detectCircularDependencies(flows: StrategyFlow[]): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const processing = new Set<string>();

    const detectCycle = (nodeId: string, path: string[]): boolean => {
      if (processing.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        cycles.push(path.slice(cycleStart).concat([nodeId]));
        return true;
      }

      if (visited.has(nodeId)) return false;

      processing.add(nodeId);
      path.push(nodeId);

      const outgoingFlows = flows.filter(f => f.from === nodeId);
      for (const flow of outgoingFlows) {
        if (detectCycle(flow.to, [...path])) {
          return true;
        }
      }

      processing.delete(nodeId);
      visited.add(nodeId);
      path.pop();

      return false;
    };

    const allNodes = new Set([...flows.map(f => f.from), ...flows.map(f => f.to)]);
    for (const nodeId of allNodes) {
      if (!visited.has(nodeId)) {
        detectCycle(nodeId, []);
      }
    }

    return cycles;
  }

  private checkTypeCompatibility(
    sourceType: ComponentType,
    targetType: ComponentType
  ): { compatible: boolean; suggestion: string } {
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

    const compatibleTargets = compatibilityMatrix[sourceType] || [];
    const compatible = compatibleTargets.includes(targetType);

    return {
      compatible,
      suggestion: compatible ? 
        'Types are compatible' : 
        `Consider connecting ${sourceType} to ${compatibleTargets.join(' or ')}`
    };
  }

  private findOrphanedComponents(
    components: StrategyComponent[],
    flows: StrategyFlow[]
  ): StrategyComponent[] {
    const connectedComponents = new Set([
      ...flows.map(f => f.from),
      ...flows.map(f => f.to)
    ]);

    return components.filter(c => 
      !connectedComponents.has(c.id) && 
      c.type !== ComponentType.DATA_SOURCE // Data sources can be standalone
    );
  }

  private checkStrategyCompleteness(
    blueprint: StrategyBlueprint
  ): { errors: ValidationError[]; warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check for entry and exit logic
    const hasEntryLogic = blueprint.components.some(c => 
      c.type === ComponentType.CONDITION && 
      c.subtype.includes('entry')
    );

    const hasExitLogic = blueprint.components.some(c => 
      c.type === ComponentType.CONDITION && 
      c.subtype.includes('exit')
    );

    if (!hasEntryLogic) {
      warnings.push({
        id: 'missing_entry_logic',
        type: ValidationWarningType.BEST_PRACTICE_VIOLATION,
        message: 'Strategy lacks explicit entry logic',
        impact: 'medium',
        recommendation: 'Add entry conditions to define when to enter trades'
      });
    }

    if (!hasExitLogic) {
      warnings.push({
        id: 'missing_exit_logic',
        type: ValidationWarningType.BEST_PRACTICE_VIOLATION,
        message: 'Strategy lacks explicit exit logic',
        impact: 'medium',
        recommendation: 'Add exit conditions to define when to close trades'
      });
    }

    return { errors, warnings, suggestions };
  }

  private checkComponentBalance(
    components: StrategyComponent[]
  ): { warnings: ValidationWarning[]; suggestions: ValidationSuggestion[] } {
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    const typeCounts = new Map<ComponentType, number>();
    for (const component of components) {
      typeCounts.set(component.type, (typeCounts.get(component.type) || 0) + 1);
    }

    // Check for too many indicators
    const indicatorCount = typeCounts.get(ComponentType.INDICATOR) || 0;
    if (indicatorCount > 5) {
      warnings.push({
        id: 'too_many_indicators',
        type: ValidationWarningType.PERFORMANCE_CONCERN,
        message: `Strategy has ${indicatorCount} indicators, which may impact performance`,
        impact: 'medium',
        recommendation: 'Consider reducing the number of indicators for better performance'
      });
    }

    return { warnings, suggestions };
  }

  private validateRiskProfile(riskProfile: RiskProfile): {
    warnings: ValidationWarning[];
    suggestions: ValidationSuggestion[];
  } {
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    if (riskProfile.maxRisk > 5) {
      warnings.push({
        id: 'high_risk_profile',
        type: ValidationWarningType.POTENTIAL_RISK,
        message: `Risk profile allows for ${riskProfile.maxRisk}% risk per trade`,
        impact: 'high',
        recommendation: 'Consider reducing maximum risk per trade to 2-3%'
      });
    }

    if (!riskProfile.stopLoss) {
      suggestions.push({
        id: 'add_stop_loss',
        type: ValidationSuggestionType.RISK_IMPROVEMENT,
        message: 'Risk profile lacks stop-loss configuration',
        benefit: 'Better risk management and capital preservation',
        implementation: 'Add stop-loss percentage to risk profile',
        priority: 'high'
      });
    }

    return { warnings, suggestions };
  }

  private calculateComplexity(blueprint: StrategyBlueprint): number {
    return blueprint.components.length * 2 + blueprint.flow.length;
  }

  private calculateLatency(blueprint: StrategyBlueprint, connections?: ConnectionMapping[]): number {
    // Simple latency calculation based on component count and connections
    return blueprint.components.length * 10 + blueprint.flow.length * 5;
  }

  private calculateMemoryUsage(blueprint: StrategyBlueprint): number {
    // Estimate memory usage based on components
    return blueprint.components.length * 0.5; // MB per component
  }

  private calculateExecutionTime(blueprint: StrategyBlueprint): number {
    // Estimate execution time based on complexity
    return blueprint.components.length * 50 + blueprint.flow.length * 25; // ms
  }

  private calculateScalability(blueprint: StrategyBlueprint): number {
    // Simple scalability score (0-1)
    const complexity = this.calculateComplexity(blueprint);
    return Math.max(0, 1 - (complexity / 200));
  }

  private calculateMaintainability(blueprint: StrategyBlueprint): number {
    // Simple maintainability score (0-1)
    const componentTypes = new Set(blueprint.components.map(c => c.type)).size;
    const avgConnections = blueprint.flow.length / blueprint.components.length;
    
    return Math.max(0, 1 - (avgConnections / 5) - (componentTypes / 10));
  }

  private getDefaultPerformanceMetrics(): PerformanceMetrics {
    return {
      complexity: 0,
      latency: 0,
      memoryUsage: 0,
      executionTime: 0,
      scalability: 1.0,
      maintainability: 1.0
    };
  }

  private initializeValidationRules(): void {
    // Initialize component validation rules
    this.componentRules.set(ComponentType.DATA_SOURCE, [
      {
        name: 'valid_symbol',
        validate: (component, options) => ({
          isValid: !!component.parameters.symbol,
          message: 'Data source must have a valid symbol',
          suggestion: 'Set a valid trading symbol (e.g., BTCUSDT)',
          fixable: true
        })
      }
    ]);

    // Add more rules for other component types...
  }

  private initializeBestPracticeRules(): void {
    this.bestPracticeRules = [
      {
        name: 'has_risk_management',
        check: (blueprint, options) => ({
          practice: 'Risk Management',
          compliant: blueprint.components.some(c => c.type === ComponentType.RISK_MANAGEMENT),
          description: 'Strategy should include risk management components',
          importance: 'critical',
          suggestion: 'Add stop-loss and take-profit components'
        })
      },
      {
        name: 'reasonable_complexity',
        check: (blueprint, options) => ({
          practice: 'Reasonable Complexity',
          compliant: blueprint.components.length <= 15,
          description: 'Strategy should not be overly complex',
          importance: 'important',
          suggestion: 'Consider simplifying the strategy by reducing components'
        })
      }
    ];
  }
}

// Supporting interfaces

interface ComponentValidationRule {
  name: string;
  validate: (component: StrategyComponent, options: ValidationOptions) => {
    isValid: boolean;
    message: string;
    suggestion?: string;
    fixable?: boolean;
    severity?: 'critical' | 'high' | 'medium' | 'low';
    errorType?: ValidationErrorType;
    warnings?: string[];
    suggestions?: string[];
  };
}

interface ConnectionValidationRule {
  name: string;
  validate: (connection: any, options: ValidationOptions) => {
    isValid: boolean;
    message: string;
    suggestion?: string;
  };
}

interface BestPracticeRule {
  name: string;
  check: (blueprint: StrategyBlueprint, options: ValidationOptions) => BestPracticeCheck;
}