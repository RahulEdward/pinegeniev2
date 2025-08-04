/**
 * Strategy Blueprint Generator
 * 
 * Converts parsed natural language intents into detailed strategy blueprints
 * that can be used to construct visual trading strategies.
 */

import { 
  TradingIntent, 
  StrategyType, 
  NLPResult 
} from '../types/nlp-types';

import { 
  StrategyBlueprint, 
  StrategyComponent, 
  StrategyFlow, 
  ComponentType, 
  FlowType, 
  ParameterSet, 
  RiskProfile,
  StrategyMetadata
} from '../types/strategy-types';

import { TradingPatterns, PatternMatchResult } from '../knowledge/patterns';
import { KnowledgeBase } from '../knowledge/knowledge-base';
import { AILogger } from '../core/logger';
import { AIError, AIErrorType } from '../core/error-handler';

export interface BlueprintGenerationOptions {
  includeRiskManagement?: boolean;
  optimizeLayout?: boolean;
  validateCompleteness?: boolean;
  maxComplexity?: 'beginner' | 'intermediate' | 'advanced';
  preferredTimeframe?: string;
  riskTolerance?: 'low' | 'medium' | 'high';
}

export interface BlueprintGenerationResult {
  blueprint: StrategyBlueprint;
  confidence: number;
  warnings: string[];
  suggestions: string[];
  missingComponents: string[];
  optimizations: string[];
}

export interface ComponentDependency {
  componentId: string;
  dependsOn: string[];
  dependencyType: 'data' | 'signal' | 'trigger' | 'validation';
  required: boolean;
}

export class BlueprintGenerator {
  private patterns: TradingPatterns;
  private knowledgeBase: KnowledgeBase;
  private logger: AILogger;

  // Component generation rules
  private componentRules: Map<StrategyType, ComponentGenerationRule[]> = new Map();
  
  // Dependency resolution cache
  private dependencyCache: Map<string, ComponentDependency[]> = new Map();

  constructor() {
    this.patterns = new TradingPatterns();
    this.knowledgeBase = new KnowledgeBase();
    this.logger = AILogger.getInstance();
    
    this.initializeComponentRules();
    
    this.logger.info('BlueprintGenerator', 'Blueprint generator initialized', {
      supportedStrategyTypes: Array.from(this.componentRules.keys()),
      totalRules: Array.from(this.componentRules.values()).reduce((sum, rules) => sum + rules.length, 0)
    });
  }

  /**
   * Generate strategy blueprint from trading intent
   */
  public async generateBlueprint(
    intent: TradingIntent,
    options: BlueprintGenerationOptions = {}
  ): Promise<BlueprintGenerationResult> {
    const startTime = performance.now();
    
    try {
      this.logger.debug('BlueprintGenerator', 'Starting blueprint generation', {
        strategyType: intent.strategyType,
        indicators: intent.indicators,
        confidence: intent.confidence,
        options
      });

      // Find matching patterns
      const patternMatches = this.patterns.findMatches(
        [], // keywords will be extracted from intent
        intent.indicators,
        intent.conditions,
        {
          strategyTypes: [intent.strategyType],
          minConfidence: 0.6
        }
      );

      if (patternMatches.length === 0) {
        throw new AIError(
          AIErrorType.INSUFFICIENT_INFORMATION,
          'No matching patterns found for the given intent',
          { intent, availablePatterns: this.patterns.getAllPatterns().length }
        );
      }

      const bestPattern = patternMatches[0];
      
      // Generate base components
      const components = await this.generateComponents(intent, bestPattern, options);
      
      // Resolve dependencies
      const dependencies = this.resolveDependencies(components);
      
      // Generate flow connections
      const flows = this.generateFlows(components, dependencies);
      
      // Generate parameters
      const parameters = this.generateParameters(components, intent);
      
      // Generate risk profile
      const riskProfile = this.generateRiskProfile(intent, options);
      
      // Create blueprint
      const blueprint: StrategyBlueprint = {
        id: this.generateBlueprintId(),
        name: this.generateBlueprintName(intent, bestPattern),
        description: this.generateBlueprintDescription(intent, bestPattern),
        components,
        flow: flows,
        parameters,
        riskProfile,
        metadata: this.generateMetadata(intent, bestPattern, options)
      };

      // Validate and optimize
      const validationResult = this.validateBlueprint(blueprint);
      const optimizedBlueprint = options.optimizeLayout ? 
        this.optimizeBlueprint(blueprint) : blueprint;

      const processingTime = performance.now() - startTime;
      
      this.logger.info('BlueprintGenerator', 'Blueprint generation completed', {
        blueprintId: blueprint.id,
        componentCount: components.length,
        flowCount: flows.length,
        confidence: bestPattern.confidence,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        blueprint: optimizedBlueprint,
        confidence: bestPattern.confidence,
        warnings: validationResult.warnings,
        suggestions: validationResult.suggestions,
        missingComponents: validationResult.missingComponents,
        optimizations: validationResult.optimizations
      };

    } catch (error) {
      this.logger.error('BlueprintGenerator', 'Blueprint generation failed', { error, intent });
      
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        AIErrorType.STRATEGY_GENERATION_FAILED,
        'Failed to generate strategy blueprint',
        { originalError: error, intent }
      );
    }
  }

  /**
   * Generate components from intent and pattern
   */
  private async generateComponents(
    intent: TradingIntent,
    pattern: PatternMatchResult,
    options: BlueprintGenerationOptions
  ): Promise<StrategyComponent[]> {
    const components: StrategyComponent[] = [];
    let componentIndex = 0;

    // Always start with data source
    components.push(this.createDataSourceComponent(intent, componentIndex++));

    // Add indicators
    for (const indicatorName of intent.indicators) {
      const indicator = this.knowledgeBase.getIndicatorByName(indicatorName);
      if (indicator) {
        components.push(this.createIndicatorComponent(indicator, componentIndex++));
      }
    }

    // Add conditions
    for (const conditionName of intent.conditions) {
      components.push(this.createConditionComponent(conditionName, componentIndex++));
    }

    // Add actions
    for (const actionName of intent.actions) {
      components.push(this.createActionComponent(actionName, componentIndex++));
    }

    // Add risk management if requested or missing
    if (options.includeRiskManagement !== false) {
      const riskComponents = this.generateRiskManagementComponents(intent, componentIndex);
      components.push(...riskComponents);
      componentIndex += riskComponents.length;
    }

    // Add timing components if needed
    if (intent.timeframe) {
      components.push(this.createTimingComponent(intent.timeframe, componentIndex++));
    }

    return components;
  }

  /**
   * Resolve component dependencies
   */
  private resolveDependencies(components: StrategyComponent[]): ComponentDependency[] {
    const dependencies: ComponentDependency[] = [];
    
    for (const component of components) {
      const componentDeps = this.getComponentDependencies(component, components);
      dependencies.push(...componentDeps);
    }

    // Sort by dependency order
    return this.sortDependencies(dependencies);
  }

  /**
   * Generate flow connections between components
   */
  private generateFlows(
    components: StrategyComponent[],
    dependencies: ComponentDependency[]
  ): StrategyFlow[] {
    const flows: StrategyFlow[] = [];

    for (const dependency of dependencies) {
      for (const dependsOnId of dependency.dependsOn) {
        flows.push({
          from: dependsOnId,
          to: dependency.componentId,
          type: this.mapDependencyTypeToFlowType(dependency.dependencyType),
          weight: dependency.required ? 1.0 : 0.5
        });
      }
    }

    return flows;
  }

  /**
   * Generate parameters for all components
   */
  private generateParameters(
    components: StrategyComponent[],
    intent: TradingIntent
  ): ParameterSet {
    const parameters: ParameterSet = {};

    for (const component of components) {
      parameters[component.id] = this.generateComponentParameters(component, intent);
    }

    return parameters;
  }

  /**
   * Generate risk profile
   */
  private generateRiskProfile(
    intent: TradingIntent,
    options: BlueprintGenerationOptions
  ): RiskProfile {
    const riskTolerance = options.riskTolerance || 'medium';
    
    const riskLevels = {
      low: { level: 'low' as const, maxRisk: 1, stopLoss: 2, takeProfit: 4 },
      medium: { level: 'medium' as const, maxRisk: 2, stopLoss: 3, takeProfit: 6 },
      high: { level: 'high' as const, maxRisk: 5, stopLoss: 5, takeProfit: 10 }
    };

    const baseProfile = riskLevels[riskTolerance];
    
    return {
      level: baseProfile.level,
      maxRisk: baseProfile.maxRisk,
      stopLoss: baseProfile.stopLoss,
      takeProfit: baseProfile.takeProfit,
      positionSize: this.calculatePositionSize(baseProfile.maxRisk),
      maxDrawdown: baseProfile.maxRisk * 3
    };
  }

  /**
   * Validate blueprint completeness and correctness
   */
  private validateBlueprint(blueprint: StrategyBlueprint): {
    warnings: string[];
    suggestions: string[];
    missingComponents: string[];
    optimizations: string[];
  } {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const missingComponents: string[] = [];
    const optimizations: string[] = [];

    // Check for required components
    const hasDataSource = blueprint.components.some(c => c.type === ComponentType.DATA_SOURCE);
    const hasIndicator = blueprint.components.some(c => c.type === ComponentType.INDICATOR);
    const hasCondition = blueprint.components.some(c => c.type === ComponentType.CONDITION);
    const hasAction = blueprint.components.some(c => c.type === ComponentType.ACTION);
    const hasRiskManagement = blueprint.components.some(c => c.type === ComponentType.RISK_MANAGEMENT);

    if (!hasDataSource) missingComponents.push('Data Source');
    if (!hasIndicator) missingComponents.push('Technical Indicator');
    if (!hasCondition) missingComponents.push('Entry/Exit Condition');
    if (!hasAction) missingComponents.push('Trading Action');
    if (!hasRiskManagement) {
      warnings.push('No risk management components found');
      suggestions.push('Consider adding stop-loss and take-profit components');
    }

    // Check flow connectivity
    const flowValidation = this.validateFlows(blueprint.flow, blueprint.components);
    warnings.push(...flowValidation.warnings);
    suggestions.push(...flowValidation.suggestions);

    // Check parameter completeness
    const paramValidation = this.validateParameters(blueprint.parameters, blueprint.components);
    warnings.push(...paramValidation.warnings);
    optimizations.push(...paramValidation.optimizations);

    return { warnings, suggestions, missingComponents, optimizations };
  }

  /**
   * Optimize blueprint layout and structure
   */
  private optimizeBlueprint(blueprint: StrategyBlueprint): StrategyBlueprint {
    // Create optimized copy
    const optimized = { ...blueprint };

    // Optimize component positions
    optimized.components = this.optimizeComponentPositions(blueprint.components, blueprint.flow);

    // Optimize flow connections
    optimized.flow = this.optimizeFlowConnections(blueprint.flow);

    // Optimize parameters
    optimized.parameters = this.optimizeParameters(blueprint.parameters);

    return optimized;
  }

  // Helper methods for component creation

  private createDataSourceComponent(intent: TradingIntent, index: number): StrategyComponent {
    return {
      id: `data_source_${index}`,
      type: ComponentType.DATA_SOURCE,
      subtype: 'market_data',
      label: 'Market Data',
      parameters: {
        symbol: intent.symbol || 'BTCUSDT',
        timeframe: intent.timeframe || '1h',
        source: 'binance'
      },
      priority: 1,
      dependencies: [],
      optional: false
    };
  }

  private createIndicatorComponent(indicator: any, index: number): StrategyComponent {
    return {
      id: `indicator_${indicator.id}_${index}`,
      type: ComponentType.INDICATOR,
      subtype: indicator.id,
      label: indicator.name,
      parameters: indicator.defaultParams || {},
      priority: 2,
      dependencies: [`data_source_${index - 1}`], // Depends on data source
      optional: false
    };
  }

  private createConditionComponent(conditionName: string, index: number): StrategyComponent {
    return {
      id: `condition_${index}`,
      type: ComponentType.CONDITION,
      subtype: this.mapConditionNameToSubtype(conditionName),
      label: conditionName,
      parameters: {
        operator: 'greater_than',
        threshold: 0
      },
      priority: 3,
      dependencies: [], // Will be resolved later
      optional: false
    };
  }

  private createActionComponent(actionName: string, index: number): StrategyComponent {
    return {
      id: `action_${index}`,
      type: ComponentType.ACTION,
      subtype: this.mapActionNameToSubtype(actionName),
      label: actionName,
      parameters: {
        orderType: 'market',
        quantity: '25%'
      },
      priority: 4,
      dependencies: [], // Will be resolved later
      optional: false
    };
  }

  private generateRiskManagementComponents(intent: TradingIntent, startIndex: number): StrategyComponent[] {
    const components: StrategyComponent[] = [];

    // Add stop loss
    components.push({
      id: `risk_stop_loss_${startIndex}`,
      type: ComponentType.RISK_MANAGEMENT,
      subtype: 'stop_loss',
      label: 'Stop Loss',
      parameters: {
        stopLoss: 2,
        maxRisk: 1
      },
      priority: 5,
      dependencies: [],
      optional: false
    });

    // Add take profit
    components.push({
      id: `risk_take_profit_${startIndex + 1}`,
      type: ComponentType.RISK_MANAGEMENT,
      subtype: 'take_profit',
      label: 'Take Profit',
      parameters: {
        takeProfit: 5
      },
      priority: 5,
      dependencies: [],
      optional: false
    });

    return components;
  }

  private createTimingComponent(timeframe: string, index: number): StrategyComponent {
    return {
      id: `timing_${index}`,
      type: ComponentType.TIMING,
      subtype: 'time_filter',
      label: 'Time Filter',
      parameters: {
        startTime: '09:00',
        endTime: '16:00',
        timezone: 'UTC'
      },
      priority: 6,
      dependencies: [],
      optional: true
    };
  }

  // Helper methods for dependency resolution

  private getComponentDependencies(
    component: StrategyComponent,
    allComponents: StrategyComponent[]
  ): ComponentDependency[] {
    const dependencies: ComponentDependency[] = [];

    switch (component.type) {
      case ComponentType.INDICATOR:
        // Indicators depend on data sources
        const dataSources = allComponents.filter(c => c.type === ComponentType.DATA_SOURCE);
        if (dataSources.length > 0) {
          dependencies.push({
            componentId: component.id,
            dependsOn: [dataSources[0].id],
            dependencyType: 'data',
            required: true
          });
        }
        break;

      case ComponentType.CONDITION:
        // Conditions depend on indicators or data sources
        const indicators = allComponents.filter(c => c.type === ComponentType.INDICATOR);
        if (indicators.length > 0) {
          dependencies.push({
            componentId: component.id,
            dependsOn: [indicators[0].id],
            dependencyType: 'signal',
            required: true
          });
        }
        break;

      case ComponentType.ACTION:
        // Actions depend on conditions
        const conditions = allComponents.filter(c => c.type === ComponentType.CONDITION);
        if (conditions.length > 0) {
          dependencies.push({
            componentId: component.id,
            dependsOn: [conditions[0].id],
            dependencyType: 'trigger',
            required: true
          });
        }
        break;

      case ComponentType.RISK_MANAGEMENT:
        // Risk management depends on actions
        const actions = allComponents.filter(c => c.type === ComponentType.ACTION);
        if (actions.length > 0) {
          dependencies.push({
            componentId: component.id,
            dependsOn: [actions[0].id],
            dependencyType: 'validation',
            required: false
          });
        }
        break;
    }

    return dependencies;
  }

  private sortDependencies(dependencies: ComponentDependency[]): ComponentDependency[] {
    // Simple topological sort based on dependency types
    const typeOrder = ['data', 'signal', 'trigger', 'validation'];
    
    return dependencies.sort((a, b) => {
      const aIndex = typeOrder.indexOf(a.dependencyType);
      const bIndex = typeOrder.indexOf(b.dependencyType);
      return aIndex - bIndex;
    });
  }

  // Utility methods

  private generateBlueprintId(): string {
    return `blueprint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBlueprintName(intent: TradingIntent, pattern: PatternMatchResult): string {
    return `${pattern.pattern.name} Strategy`;
  }

  private generateBlueprintDescription(intent: TradingIntent, pattern: PatternMatchResult): string {
    return `AI-generated ${intent.strategyType} strategy based on ${pattern.pattern.name} pattern`;
  }

  private generateMetadata(
    intent: TradingIntent,
    pattern: PatternMatchResult,
    options: BlueprintGenerationOptions
  ): StrategyMetadata {
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      author: 'PineGenie AI',
      tags: [intent.strategyType, ...intent.indicators],
      category: intent.strategyType,
      complexity: options.maxComplexity || 'intermediate'
    };
  }

  private generateComponentParameters(component: StrategyComponent, intent: TradingIntent): any {
    // This would be implemented based on component type and intent parameters
    return {};
  }

  private calculatePositionSize(maxRisk: number): number {
    // Simple position sizing based on risk
    return Math.min(100, Math.max(1, 100 / maxRisk));
  }

  private mapConditionNameToSubtype(conditionName: string): string {
    const mapping: Record<string, string> = {
      'greater than': 'greater_than',
      'less than': 'less_than',
      'crosses above': 'crosses_above',
      'crosses below': 'crosses_below',
      'equal to': 'equal_to'
    };
    
    return mapping[conditionName.toLowerCase()] || 'greater_than';
  }

  private mapActionNameToSubtype(actionName: string): string {
    const mapping: Record<string, string> = {
      'buy': 'buy_order',
      'sell': 'sell_order',
      'close': 'close_position'
    };
    
    return mapping[actionName.toLowerCase()] || 'buy_order';
  }

  private mapDependencyTypeToFlowType(dependencyType: string): FlowType {
    const mapping: Record<string, FlowType> = {
      'data': FlowType.DATA,
      'signal': FlowType.SIGNAL,
      'trigger': FlowType.TRIGGER,
      'validation': FlowType.CONTROL
    };
    
    return mapping[dependencyType] || FlowType.DATA;
  }

  private validateFlows(flows: StrategyFlow[], components: StrategyComponent[]): {
    warnings: string[];
    suggestions: string[];
  } {
    // Implementation for flow validation
    return { warnings: [], suggestions: [] };
  }

  private validateParameters(parameters: ParameterSet, components: StrategyComponent[]): {
    warnings: string[];
    optimizations: string[];
  } {
    // Implementation for parameter validation
    return { warnings: [], optimizations: [] };
  }

  private optimizeComponentPositions(
    components: StrategyComponent[],
    flows: StrategyFlow[]
  ): StrategyComponent[] {
    // Implementation for position optimization
    return components;
  }

  private optimizeFlowConnections(flows: StrategyFlow[]): StrategyFlow[] {
    // Implementation for flow optimization
    return flows;
  }

  private optimizeParameters(parameters: ParameterSet): ParameterSet {
    // Implementation for parameter optimization
    return parameters;
  }

  private initializeComponentRules(): void {
    // Initialize component generation rules for different strategy types
    // This would contain the logic for generating appropriate components
    // based on strategy type and patterns
  }
}

// Component generation rule interface
interface ComponentGenerationRule {
  strategyType: StrategyType;
  requiredComponents: ComponentType[];
  optionalComponents: ComponentType[];
  componentOrder: ComponentType[];
  defaultParameters: Record<string, unknown>;
}