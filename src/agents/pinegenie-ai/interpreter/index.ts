/**
 * Strategy Interpreter Module
 * 
 * Main entry point for the strategy interpretation engine that converts
 * natural language intents into executable visual trading strategies.
 */

export { 
  BlueprintGenerator,
  type BlueprintGenerationOptions,
  type BlueprintGenerationResult,
  type ComponentDependency
} from './blueprint-generator';

export {
  DependencyResolver,
  type DependencyNode,
  type DependencyGraph,
  type DependencyEdge,
  type DependencyResolutionResult,
  DependencyType
} from './dependency-resolver';

export {
  NodeMapper,
  type NodeMappingOptions,
  type NodeMappingResult,
  type ComponentNodeMapping,
  type LayoutInfo
} from './node-mapper';

export {
  ConnectionLogic,
  type ConnectionGenerationOptions,
  type ConnectionGenerationResult,
  type ConnectionMapping,
  type DataFlowInfo,
  ConnectionType,
  DataType,
  SignalType
} from './connection-logic';

export {
  ValidationEngine,
  type ValidationOptions,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type ValidationSuggestion,
  type BestPracticeCheck,
  type PerformanceMetrics,
  ValidationErrorType,
  ValidationWarningType,
  ValidationSuggestionType
} from './validation-engine';

/**
 * Main Strategy Interpreter Class
 * 
 * Orchestrates the entire process of converting natural language trading
 * intents into complete visual strategies with proper validation.
 */

import { TradingIntent, NLPResult } from '../types/nlp-types';
import { StrategyBlueprint } from '../types/strategy-types';
import { BuilderNode, BuilderEdge } from '../types/builder-types';
import { AILogger } from '../core/logger';
import { AIError, AIErrorType } from '../core/error-handler';

import { BlueprintGenerator, BlueprintGenerationOptions, BlueprintGenerationResult } from './blueprint-generator';
import { DependencyResolver, DependencyResolutionResult } from './dependency-resolver';
import { NodeMapper, NodeMappingOptions, NodeMappingResult } from './node-mapper';
import { ConnectionLogic, ConnectionGenerationOptions, ConnectionGenerationResult } from './connection-logic';
import { ValidationEngine, ValidationOptions, ValidationResult } from './validation-engine';

export interface StrategyInterpretationOptions {
  blueprint?: BlueprintGenerationOptions;
  nodeMapping?: NodeMappingOptions;
  connections?: ConnectionGenerationOptions;
  validation?: ValidationOptions;
  skipValidation?: boolean;
}

export interface StrategyInterpretationResult {
  blueprint: StrategyBlueprint;
  nodes: BuilderNode[];
  edges: BuilderEdge[];
  validation: ValidationResult;
  metadata: InterpretationMetadata;
  warnings: string[];
  suggestions: string[];
}

export interface InterpretationMetadata {
  processingTime: number;
  confidence: number;
  complexity: number;
  componentCount: number;
  connectionCount: number;
  validationScore: number;
  generatedAt: Date;
}

export class StrategyInterpreter {
  private blueprintGenerator: BlueprintGenerator;
  private dependencyResolver: DependencyResolver;
  private nodeMapper: NodeMapper;
  private connectionLogic: ConnectionLogic;
  private validationEngine: ValidationEngine;
  private logger: AILogger;

  constructor() {
    this.blueprintGenerator = new BlueprintGenerator();
    this.dependencyResolver = new DependencyResolver();
    this.nodeMapper = new NodeMapper();
    this.connectionLogic = new ConnectionLogic();
    this.validationEngine = new ValidationEngine();
    this.logger = AILogger.getInstance();

    this.logger.info('StrategyInterpreter', 'Strategy interpreter initialized', {
      modules: ['BlueprintGenerator', 'DependencyResolver', 'NodeMapper', 'ConnectionLogic', 'ValidationEngine']
    });
  }

  /**
   * Interpret trading intent into complete visual strategy
   */
  public async interpretStrategy(
    intent: TradingIntent,
    options: StrategyInterpretationOptions = {}
  ): Promise<StrategyInterpretationResult> {
    const startTime = performance.now();

    try {
      this.logger.info('StrategyInterpreter', 'Starting strategy interpretation', {
        strategyType: intent.strategyType,
        indicators: intent.indicators,
        confidence: intent.confidence,
        options
      });

      // Step 1: Generate strategy blueprint
      this.logger.debug('StrategyInterpreter', 'Generating strategy blueprint');
      const blueprintResult = await this.blueprintGenerator.generateBlueprint(
        intent,
        options.blueprint || {}
      );

      // Step 2: Resolve component dependencies
      this.logger.debug('StrategyInterpreter', 'Resolving component dependencies');
      const dependencyResult = this.dependencyResolver.resolveDependencies(
        blueprintResult.blueprint.components
      );

      // Step 3: Map components to visual nodes
      this.logger.debug('StrategyInterpreter', 'Mapping components to nodes');
      const nodeMappingResult = this.nodeMapper.mapComponentsToNodes(
        blueprintResult.blueprint.components,
        blueprintResult.blueprint,
        options.nodeMapping || {}
      );

      // Step 4: Generate connections between nodes
      this.logger.debug('StrategyInterpreter', 'Generating node connections');
      const connectionResult = this.connectionLogic.generateConnections(
        nodeMappingResult.mappings,
        blueprintResult.blueprint,
        dependencyResult.graph,
        options.connections || {}
      );

      // Step 5: Validate the complete strategy
      let validationResult: ValidationResult;
      if (options.skipValidation) {
        validationResult = {
          isValid: true,
          score: 100,
          errors: [],
          warnings: [],
          suggestions: [],
          bestPractices: [],
          performance: {
            complexity: 0,
            latency: 0,
            memoryUsage: 0,
            executionTime: 0,
            scalability: 1.0,
            maintainability: 1.0
          }
        };
      } else {
        this.logger.debug('StrategyInterpreter', 'Validating strategy');
        validationResult = this.validationEngine.validateStrategy(
          blueprintResult.blueprint,
          nodeMappingResult.mappings,
          connectionResult.connectionMap,
          options.validation || {}
        );
      }

      // Compile results
      const processingTime = performance.now() - startTime;
      
      const metadata: InterpretationMetadata = {
        processingTime,
        confidence: this.calculateOverallConfidence(
          blueprintResult.confidence,
          nodeMappingResult.mappings,
          connectionResult.connectionMap,
          validationResult.score
        ),
        complexity: validationResult.performance.complexity,
        componentCount: blueprintResult.blueprint.components.length,
        connectionCount: connectionResult.connections.length,
        validationScore: validationResult.score,
        generatedAt: new Date()
      };

      // Collect all warnings and suggestions
      const warnings = [
        ...blueprintResult.warnings,
        ...nodeMappingResult.warnings,
        ...connectionResult.warnings,
        ...validationResult.warnings.map(w => w.message)
      ];

      const suggestions = [
        ...blueprintResult.suggestions,
        ...nodeMappingResult.suggestions,
        ...connectionResult.suggestions,
        ...validationResult.suggestions.map(s => s.message)
      ];

      this.logger.info('StrategyInterpreter', 'Strategy interpretation completed', {
        processingTime: `${processingTime.toFixed(2)}ms`,
        confidence: metadata.confidence,
        validationScore: validationResult.score,
        isValid: validationResult.isValid,
        componentCount: metadata.componentCount,
        connectionCount: metadata.connectionCount
      });

      return {
        blueprint: blueprintResult.blueprint,
        nodes: nodeMappingResult.nodes,
        edges: connectionResult.connections,
        validation: validationResult,
        metadata,
        warnings,
        suggestions
      };

    } catch (error) {
      this.logger.error('StrategyInterpreter', 'Strategy interpretation failed', { error, intent });
      
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        AIErrorType.STRATEGY_INTERPRETATION_FAILED,
        'Failed to interpret trading strategy',
        { originalError: error, intent }
      );
    }
  }

  /**
   * Interpret strategy from NLP result
   */
  public async interpretFromNLP(
    nlpResult: NLPResult,
    options: StrategyInterpretationOptions = {}
  ): Promise<StrategyInterpretationResult> {
    return this.interpretStrategy(nlpResult.tradingIntent, options);
  }

  /**
   * Re-validate existing strategy
   */
  public validateExistingStrategy(
    blueprint: StrategyBlueprint,
    nodes: BuilderNode[],
    edges: BuilderEdge[],
    options: ValidationOptions = {}
  ): ValidationResult {
    try {
      this.logger.debug('StrategyInterpreter', 'Validating existing strategy', {
        blueprintId: blueprint.id,
        nodeCount: nodes.length,
        edgeCount: edges.length
      });

      return this.validationEngine.validateStrategy(blueprint, undefined, undefined, options);

    } catch (error) {
      this.logger.error('StrategyInterpreter', 'Strategy validation failed', { error, blueprint });
      
      if (error instanceof AIError) {
        throw error;
      }
      
      throw new AIError(
        AIErrorType.VALIDATION_FAILED,
        'Failed to validate existing strategy',
        { originalError: error, blueprint }
      );
    }
  }

  /**
   * Get interpretation statistics
   */
  public getStatistics(): {
    totalInterpretations: number;
    averageProcessingTime: number;
    averageConfidence: number;
    averageValidationScore: number;
    successRate: number;
  } {
    // This would be implemented with actual statistics tracking
    return {
      totalInterpretations: 0,
      averageProcessingTime: 0,
      averageConfidence: 0,
      averageValidationScore: 0,
      successRate: 0
    };
  }

  /**
   * Clear internal caches
   */
  public clearCaches(): void {
    this.logger.debug('StrategyInterpreter', 'Clearing internal caches');
    // Clear caches in sub-modules if they have any
  }

  // Private helper methods

  private calculateOverallConfidence(
    blueprintConfidence: number,
    nodeMappings: any[],
    connectionMappings: any[],
    validationScore: number
  ): number {
    const mappingConfidence = nodeMappings.length > 0 ?
      nodeMappings.reduce((sum, m) => sum + m.mappingConfidence, 0) / nodeMappings.length :
      1.0;

    const connectionConfidence = connectionMappings.length > 0 ?
      connectionMappings.reduce((sum, c) => sum + c.confidence, 0) / connectionMappings.length :
      1.0;

    const validationConfidence = validationScore / 100;

    // Weighted average of all confidence scores
    return (
      blueprintConfidence * 0.3 +
      mappingConfidence * 0.25 +
      connectionConfidence * 0.25 +
      validationConfidence * 0.2
    );
  }
}

// Export the main interpreter instance
export const strategyInterpreter = new StrategyInterpreter();