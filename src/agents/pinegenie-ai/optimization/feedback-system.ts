/**
 * Real-time Feedback System
 * 
 * Provides real-time validation, suggestions, and warnings as users
 * build strategies manually, helping them avoid mistakes and learn best practices.
 */

import type { BuilderNode, BuilderEdge } from '../../../app/builder/builder-state';
import type { ImpactLevel } from '../types/optimization-types';

export interface FeedbackSystem {
  validateStrategy(nodes: BuilderNode[], edges: BuilderEdge[]): ValidationFeedback;
  getContextualSuggestions(
    selectedNode: BuilderNode | null, 
    nodes: BuilderNode[], 
    edges: BuilderEdge[]
  ): ContextualSuggestion[];
  getBestPracticeRecommendations(nodes: BuilderNode[], edges: BuilderEdge[]): BestPracticeRecommendation[];
  analyzePerformanceImpact(
    change: StrategyChange, 
    nodes: BuilderNode[], 
    edges: BuilderEdge[]
  ): PerformanceImpactAnalysis;
  getEducationalTips(context: EducationalContext): EducationalTip[];
}

export interface ValidationFeedback {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: ValidationSuggestion[];
  completeness: number; // 0-100
  confidence: number; // 0-1
}

export interface ValidationError {
  id: string;
  type: ErrorType;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  description: string;
  nodeId?: string;
  edgeId?: string;
  autoFixable: boolean;
  fixAction?: FixAction;
}

export interface ValidationWarning {
  id: string;
  type: WarningType;
  message: string;
  description: string;
  nodeId?: string;
  edgeId?: string;
  recommendation: string;
  impact: ImpactLevel;
}

export interface ValidationSuggestion {
  id: string;
  type: SuggestionType;
  message: string;
  description: string;
  benefit: string;
  implementation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ContextualSuggestion {
  id: string;
  title: string;
  description: string;
  category: SuggestionCategory;
  suggestedNodes?: Partial<BuilderNode>[];
  suggestedConnections?: Partial<BuilderEdge>[];
  reasoning: string;
  confidence: number;
  priority: number;
}

export interface BestPracticeRecommendation {
  id: string;
  title: string;
  description: string;
  category: BestPracticeCategory;
  importance: ImpactLevel;
  implementation: string;
  examples: string[];
  learnMoreUrl?: string;
}

export interface PerformanceImpactAnalysis {
  overallImpact: ImpactLevel;
  impactAreas: ImpactArea[];
  recommendations: string[];
  estimatedChange: EstimatedChange;
  riskFactors: string[];
}

export interface ImpactArea {
  area: 'performance' | 'risk' | 'complexity' | 'maintainability';
  impact: ImpactLevel;
  description: string;
  metrics: ImpactMetric[];
}

export interface ImpactMetric {
  name: string;
  currentValue: number;
  estimatedValue: number;
  change: number;
  unit: string;
}

export interface EstimatedChange {
  returnImpact: number; // percentage change
  riskImpact: number; // percentage change
  complexityImpact: number; // percentage change
  confidence: number; // 0-1
}

export interface EducationalTip {
  id: string;
  title: string;
  content: string;
  category: EducationalCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedConcepts: string[];
  examples?: string[];
}

export enum ErrorType {
  MISSING_DATA_SOURCE = 'missing-data-source',
  MISSING_ENTRY_CONDITION = 'missing-entry-condition',
  MISSING_EXIT_ACTION = 'missing-exit-action',
  CIRCULAR_DEPENDENCY = 'circular-dependency',
  INVALID_CONNECTION = 'invalid-connection',
  INVALID_PARAMETER = 'invalid-parameter',
  ORPHANED_NODE = 'orphaned-node',
  DUPLICATE_CONNECTION = 'duplicate-connection'
}

export enum WarningType {
  MISSING_RISK_MANAGEMENT = 'missing-risk-management',
  HIGH_COMPLEXITY = 'high-complexity',
  PARAMETER_OUT_OF_RANGE = 'parameter-out-of-range',
  POTENTIAL_OVERFITTING = 'potential-overfitting',
  INSUFFICIENT_DIVERSIFICATION = 'insufficient-diversification',
  POOR_SIGNAL_QUALITY = 'poor-signal-quality'
}

export enum SuggestionType {
  ADD_COMPONENT = 'add-component',
  OPTIMIZE_PARAMETER = 'optimize-parameter',
  IMPROVE_STRUCTURE = 'improve-structure',
  ENHANCE_RISK_MANAGEMENT = 'enhance-risk-management',
  SIMPLIFY_STRATEGY = 'simplify-strategy'
}

export enum SuggestionCategory {
  NEXT_STEP = 'next-step',
  IMPROVEMENT = 'improvement',
  RISK_MANAGEMENT = 'risk-management',
  OPTIMIZATION = 'optimization',
  EDUCATION = 'education'
}

export enum BestPracticeCategory {
  STRATEGY_DESIGN = 'strategy-design',
  RISK_MANAGEMENT = 'risk-management',
  PARAMETER_SELECTION = 'parameter-selection',
  BACKTESTING = 'backtesting',
  PORTFOLIO_MANAGEMENT = 'portfolio-management'
}

export enum EducationalCategory {
  TECHNICAL_ANALYSIS = 'technical-analysis',
  RISK_MANAGEMENT = 'risk-management',
  STRATEGY_DEVELOPMENT = 'strategy-development',
  MARKET_CONCEPTS = 'market-concepts',
  TRADING_PSYCHOLOGY = 'trading-psychology'
}

export interface StrategyChange {
  type: 'node-added' | 'node-removed' | 'node-modified' | 'edge-added' | 'edge-removed';
  nodeId?: string;
  edgeId?: string;
  oldValue?: unknown;
  newValue?: unknown;
}

export interface EducationalContext {
  currentNodes: BuilderNode[];
  selectedNode?: BuilderNode;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  focusArea?: string;
}

export interface FixAction {
  type: 'add-node' | 'remove-node' | 'modify-node' | 'add-edge' | 'remove-edge';
  description: string;
  parameters: Record<string, unknown>;
}

export class RealTimeFeedbackSystem implements FeedbackSystem {
  private readonly COMPLEXITY_THRESHOLD = 15; // Max recommended nodes
  private readonly MAX_INDICATORS = 8; // Max recommended indicators

  /**
   * Validate the current strategy and provide comprehensive feedback
   */
  validateStrategy(nodes: BuilderNode[], edges: BuilderEdge[]): ValidationFeedback {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check for critical errors
    errors.push(...this.checkCriticalErrors(nodes, edges));
    
    // Check for warnings
    warnings.push(...this.checkWarnings(nodes, edges));
    
    // Generate suggestions
    suggestions.push(...this.generateSuggestions(nodes, edges));

    // Calculate completeness score
    const completeness = this.calculateCompleteness(nodes, edges);
    
    // Calculate confidence based on validation results
    const confidence = this.calculateValidationConfidence(errors, warnings, completeness);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      completeness,
      confidence
    };
  }

  /**
   * Get contextual suggestions based on current selection and strategy state
   */
  getContextualSuggestions(
    selectedNode: BuilderNode | null,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    if (selectedNode) {
      // Node-specific suggestions
      suggestions.push(...this.getNodeSpecificSuggestions(selectedNode, nodes, edges));
    } else {
      // General strategy suggestions
      suggestions.push(...this.getGeneralStrategySuggestions(nodes, edges));
    }

    // Sort by priority and confidence
    return suggestions.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.confidence - a.confidence;
    });
  }

  /**
   * Get best practice recommendations for the current strategy
   */
  getBestPracticeRecommendations(nodes: BuilderNode[], edges: BuilderEdge[]): BestPracticeRecommendation[] {
    const recommendations: BestPracticeRecommendation[] = [];

    // Strategy design best practices
    recommendations.push(...this.getStrategyDesignRecommendations(nodes, edges));
    
    // Risk management best practices
    recommendations.push(...this.getRiskManagementRecommendations(nodes, edges));
    
    // Parameter selection best practices
    recommendations.push(...this.getParameterRecommendations(nodes, edges));

    return recommendations.filter(rec => this.isRecommendationRelevant(rec, nodes, edges));
  }

  /**
   * Analyze the performance impact of a strategy change
   */
  analyzePerformanceImpact(
    change: StrategyChange,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): PerformanceImpactAnalysis {
    const impactAreas: ImpactArea[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];

    // Analyze impact by change type
    switch (change.type) {
      case 'node-added':
        return this.analyzeNodeAdditionImpact(change, nodes, edges);
      case 'node-removed':
        return this.analyzeNodeRemovalImpact(change, nodes, edges);
      case 'node-modified':
        return this.analyzeNodeModificationImpact(change, nodes, edges);
      case 'edge-added':
        return this.analyzeEdgeAdditionImpact(change, nodes, edges);
      case 'edge-removed':
        return this.analyzeEdgeRemovalImpact(change, nodes, edges);
      default:
        return this.createNeutralImpactAnalysis();
    }
  }

  /**
   * Get educational tips based on current context
   */
  getEducationalTips(context: EducationalContext): EducationalTip[] {
    const tips: EducationalTip[] = [];

    // Get tips based on user level
    tips.push(...this.getTipsForUserLevel(context.userLevel));
    
    // Get tips based on current nodes
    tips.push(...this.getTipsForCurrentStrategy(context.currentNodes));
    
    // Get tips based on selected node
    if (context.selectedNode) {
      tips.push(...this.getTipsForSelectedNode(context.selectedNode));
    }

    // Filter by focus area if specified
    if (context.focusArea) {
      return tips.filter(tip => 
        tip.category === context.focusArea || 
        tip.relatedConcepts.includes(context.focusArea)
      );
    }

    return tips.slice(0, 5); // Limit to 5 most relevant tips
  }

  // Private helper methods

  private checkCriticalErrors(nodes: BuilderNode[], edges: BuilderEdge[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for missing data source
    const dataSources = nodes.filter(node => node.data.type === 'data-source');
    if (dataSources.length === 0) {
      errors.push({
        id: 'missing-data-source',
        type: ErrorType.MISSING_DATA_SOURCE,
        severity: 'critical',
        message: 'Strategy requires a data source',
        description: 'Every strategy needs at least one data source to provide market data',
        autoFixable: true,
        fixAction: {
          type: 'add-node',
          description: 'Add a Market Data node',
          parameters: {
            type: 'data-source',
            label: 'Market Data',
            config: { symbol: 'BTCUSDT', timeframe: '1h' }
          }
        }
      });
    }

    // Check for missing entry conditions
    const conditions = nodes.filter(node => node.data.type === 'condition');
    if (conditions.length === 0) {
      errors.push({
        id: 'missing-entry-condition',
        type: ErrorType.MISSING_ENTRY_CONDITION,
        severity: 'critical',
        message: 'Strategy requires entry conditions',
        description: 'Define when to enter trades using condition nodes',
        autoFixable: true,
        fixAction: {
          type: 'add-node',
          description: 'Add an entry condition',
          parameters: {
            type: 'condition',
            label: 'Entry Condition',
            config: { operator: 'greater_than', threshold: 0 }
          }
        }
      });
    }

    // Check for missing actions
    const actions = nodes.filter(node => node.data.type === 'action');
    if (actions.length === 0) {
      errors.push({
        id: 'missing-exit-action',
        type: ErrorType.MISSING_EXIT_ACTION,
        severity: 'critical',
        message: 'Strategy requires action nodes',
        description: 'Add buy/sell actions to execute trades',
        autoFixable: true,
        fixAction: {
          type: 'add-node',
          description: 'Add a buy action',
          parameters: {
            type: 'action',
            label: 'Buy Order',
            config: { orderType: 'market', quantity: '25%' }
          }
        }
      });
    }

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies(nodes, edges);
    for (const cycle of circularDeps) {
      errors.push({
        id: `circular-dependency-${cycle.join('-')}`,
        type: ErrorType.CIRCULAR_DEPENDENCY,
        severity: 'high',
        message: 'Circular dependency detected',
        description: `Nodes ${cycle.join(' → ')} form a circular dependency`,
        autoFixable: false
      });
    }

    // Check for invalid connections
    for (const edge of edges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) {
        errors.push({
          id: `invalid-connection-${edge.id}`,
          type: ErrorType.INVALID_CONNECTION,
          severity: 'high',
          message: 'Invalid connection',
          description: 'Connection references non-existent nodes',
          edgeId: edge.id,
          autoFixable: true,
          fixAction: {
            type: 'remove-edge',
            description: 'Remove invalid connection',
            parameters: { edgeId: edge.id }
          }
        });
      } else if (!this.isValidConnection(sourceNode.data.type, targetNode.data.type)) {
        errors.push({
          id: `invalid-flow-${edge.id}`,
          type: ErrorType.INVALID_CONNECTION,
          severity: 'medium',
          message: 'Invalid data flow',
          description: `${sourceNode.data.type} cannot connect to ${targetNode.data.type}`,
          edgeId: edge.id,
          autoFixable: false
        });
      }
    }

    return errors;
  }

  private checkWarnings(nodes: BuilderNode[], edges: BuilderEdge[]): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for missing risk management
    const riskNodes = nodes.filter(node => node.data.type === 'risk');
    if (riskNodes.length === 0) {
      warnings.push({
        id: 'missing-risk-management',
        type: WarningType.MISSING_RISK_MANAGEMENT,
        message: 'No risk management detected',
        description: 'Strategy lacks stop-loss or take-profit components',
        recommendation: 'Add risk management nodes to protect against losses',
        impact: ImpactLevel.HIGH
      });
    }

    // Check for high complexity
    if (nodes.length > this.COMPLEXITY_THRESHOLD) {
      warnings.push({
        id: 'high-complexity',
        type: WarningType.HIGH_COMPLEXITY,
        message: 'Strategy is highly complex',
        description: `Strategy has ${nodes.length} nodes (recommended: <${this.COMPLEXITY_THRESHOLD})`,
        recommendation: 'Consider simplifying by removing non-essential components',
        impact: ImpactLevel.MEDIUM
      });
    }

    // Check for too many indicators
    const indicators = nodes.filter(node => node.data.type === 'indicator');
    if (indicators.length > this.MAX_INDICATORS) {
      warnings.push({
        id: 'potential-overfitting',
        type: WarningType.POTENTIAL_OVERFITTING,
        message: 'Too many indicators may cause overfitting',
        description: `Strategy uses ${indicators.length} indicators (recommended: <${this.MAX_INDICATORS})`,
        recommendation: 'Focus on the most effective indicators and remove redundant ones',
        impact: ImpactLevel.MEDIUM
      });
    }

    // Check for parameter issues
    for (const node of nodes) {
      const paramWarnings = this.checkParameterWarnings(node);
      warnings.push(...paramWarnings);
    }

    // Check for orphaned nodes
    const connectedNodeIds = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target)
    ]);
    
    const orphanedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
    for (const orphan of orphanedNodes) {
      warnings.push({
        id: `orphaned-${orphan.id}`,
        type: WarningType.POOR_SIGNAL_QUALITY,
        message: 'Disconnected node detected',
        description: `Node "${orphan.data.label}" is not connected to the strategy`,
        nodeId: orphan.id,
        recommendation: 'Connect this node or remove it if not needed',
        impact: ImpactLevel.LOW
      });
    }

    return warnings;
  }

  private generateSuggestions(nodes: BuilderNode[], edges: BuilderEdge[]): ValidationSuggestion[] {
    const suggestions: ValidationSuggestion[] = [];

    // Suggest adding confirmation indicators
    const indicators = nodes.filter(node => node.data.type === 'indicator');
    if (indicators.length === 1) {
      suggestions.push({
        id: 'add-confirmation-indicator',
        type: SuggestionType.ADD_COMPONENT,
        message: 'Consider adding a confirmation indicator',
        description: 'A second indicator can help filter false signals',
        benefit: 'Improved signal quality and reduced false positives',
        implementation: 'Add an RSI or MACD indicator to confirm entry signals',
        priority: 'medium'
      });
    }

    // Suggest parameter optimization
    const parametricNodes = nodes.filter(node => 
      node.data.config?.parameters && Object.keys(node.data.config.parameters).length > 0
    );
    if (parametricNodes.length > 0) {
      suggestions.push({
        id: 'optimize-parameters',
        type: SuggestionType.OPTIMIZE_PARAMETER,
        message: 'Parameters may benefit from optimization',
        description: 'Current parameters might not be optimal for market conditions',
        benefit: 'Potentially improved strategy performance',
        implementation: 'Use the parameter optimization tool to find better values',
        priority: 'high'
      });
    }

    // Suggest adding time filters
    const timeFilters = nodes.filter(node => node.data.type === 'timing');
    if (timeFilters.length === 0) {
      suggestions.push({
        id: 'add-time-filter',
        type: SuggestionType.ADD_COMPONENT,
        message: 'Consider adding time-based filters',
        description: 'Trading during specific hours can improve performance',
        benefit: 'Reduced slippage and better execution quality',
        implementation: 'Add a time filter to restrict trading to high-volume hours',
        priority: 'low'
      });
    }

    return suggestions;
  }

  private getNodeSpecificSuggestions(
    selectedNode: BuilderNode,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    switch (selectedNode.data.type) {
      case 'data-source':
        suggestions.push(...this.getDataSourceSuggestions(selectedNode, nodes, edges));
        break;
      case 'indicator':
        suggestions.push(...this.getIndicatorSuggestions(selectedNode, nodes, edges));
        break;
      case 'condition':
        suggestions.push(...this.getConditionSuggestions(selectedNode, nodes, edges));
        break;
      case 'action':
        suggestions.push(...this.getActionSuggestions(selectedNode, nodes, edges));
        break;
      case 'risk':
        suggestions.push(...this.getRiskSuggestions(selectedNode, nodes, edges));
        break;
    }

    return suggestions;
  }

  private getDataSourceSuggestions(
    node: BuilderNode,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    // Check if data source is connected
    const hasOutgoing = edges.some(edge => edge.source === node.id);
    if (!hasOutgoing) {
      suggestions.push({
        id: 'connect-data-source',
        title: 'Connect Data Source',
        description: 'This data source needs to be connected to indicators or conditions',
        category: SuggestionCategory.NEXT_STEP,
        reasoning: 'Data sources must feed into other components to be useful',
        confidence: 0.9,
        priority: 10
      });
    }

    // Suggest adding indicators
    const indicators = nodes.filter(n => n.data.type === 'indicator');
    if (indicators.length === 0) {
      suggestions.push({
        id: 'add-first-indicator',
        title: 'Add Technical Indicator',
        description: 'Add an indicator like RSI or SMA to analyze the price data',
        category: SuggestionCategory.NEXT_STEP,
        suggestedNodes: [{
          type: 'indicator',
          data: {
            id: 'suggested-rsi',
            type: 'indicator',
            label: 'RSI (14)',
            config: {
              indicatorId: 'rsi',
              parameters: { period: 14 }
            }
          },
          position: { x: node.position.x + 200, y: node.position.y }
        }],
        reasoning: 'Technical indicators help identify trading opportunities',
        confidence: 0.8,
        priority: 8
      });
    }

    return suggestions;
  }

  private getIndicatorSuggestions(
    node: BuilderNode,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    // Check if indicator is connected to conditions
    const hasOutgoing = edges.some(edge => edge.source === node.id);
    if (!hasOutgoing) {
      suggestions.push({
        id: 'add-condition-for-indicator',
        title: 'Add Entry Condition',
        description: 'Create a condition to use this indicator for trade signals',
        category: SuggestionCategory.NEXT_STEP,
        suggestedNodes: [{
          type: 'condition',
          data: {
            id: 'suggested-condition',
            type: 'condition',
            label: 'Entry Condition',
            config: {
              operator: 'greater_than',
              threshold: 50
            }
          },
          position: { x: node.position.x + 200, y: node.position.y }
        }],
        reasoning: 'Indicators need conditions to generate trading signals',
        confidence: 0.85,
        priority: 9
      });
    }

    // Suggest parameter optimization
    if (node.data.config?.parameters) {
      suggestions.push({
        id: 'optimize-indicator-parameters',
        title: 'Optimize Parameters',
        description: 'Fine-tune this indicator\'s parameters for better performance',
        category: SuggestionCategory.OPTIMIZATION,
        reasoning: 'Default parameters may not be optimal for current market conditions',
        confidence: 0.7,
        priority: 5
      });
    }

    return suggestions;
  }

  private getConditionSuggestions(
    node: BuilderNode,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    // Check if condition is connected to actions
    const hasOutgoing = edges.some(edge => edge.source === node.id);
    if (!hasOutgoing) {
      suggestions.push({
        id: 'add-action-for-condition',
        title: 'Add Trading Action',
        description: 'Add a buy or sell action to execute when this condition is met',
        category: SuggestionCategory.NEXT_STEP,
        suggestedNodes: [{
          type: 'action',
          data: {
            id: 'suggested-buy-action',
            type: 'action',
            label: 'Buy Order',
            config: {
              orderType: 'market',
              quantity: '25%'
            }
          },
          position: { x: node.position.x + 200, y: node.position.y }
        }],
        reasoning: 'Conditions need actions to execute trades',
        confidence: 0.9,
        priority: 10
      });
    }

    // Suggest adding confirmation
    const incomingEdges = edges.filter(edge => edge.target === node.id);
    if (incomingEdges.length === 1) {
      suggestions.push({
        id: 'add-confirmation-condition',
        title: 'Add Confirmation Signal',
        description: 'Add another condition to confirm this signal and reduce false positives',
        category: SuggestionCategory.IMPROVEMENT,
        reasoning: 'Multiple confirmations improve signal reliability',
        confidence: 0.6,
        priority: 4
      });
    }

    return suggestions;
  }

  private getActionSuggestions(
    node: BuilderNode,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    // Check if action has incoming conditions
    const hasIncoming = edges.some(edge => edge.target === node.id);
    if (!hasIncoming) {
      suggestions.push({
        id: 'connect-condition-to-action',
        title: 'Connect Entry Condition',
        description: 'This action needs a condition to trigger it',
        category: SuggestionCategory.NEXT_STEP,
        reasoning: 'Actions should be triggered by conditions or signals',
        confidence: 0.9,
        priority: 10
      });
    }

    // Suggest adding risk management
    const riskNodes = nodes.filter(n => n.data.type === 'risk');
    if (riskNodes.length === 0 && node.data.config?.orderType !== 'stop') {
      suggestions.push({
        id: 'add-risk-management',
        title: 'Add Risk Management',
        description: 'Add stop-loss and take-profit to protect this position',
        category: SuggestionCategory.RISK_MANAGEMENT,
        suggestedNodes: [{
          type: 'risk',
          data: {
            id: 'suggested-stop-loss',
            type: 'risk',
            label: 'Stop Loss',
            config: {
              stopLoss: 2,
              maxRisk: 1
            }
          },
          position: { x: node.position.x, y: node.position.y + 100 }
        }],
        reasoning: 'Risk management is essential for protecting capital',
        confidence: 0.8,
        priority: 7
      });
    }

    return suggestions;
  }

  private getRiskSuggestions(
    node: BuilderNode,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    // Check if risk node is properly connected
    const hasIncoming = edges.some(edge => edge.target === node.id);
    if (!hasIncoming) {
      suggestions.push({
        id: 'connect-risk-to-action',
        title: 'Connect to Trading Action',
        description: 'Connect this risk management to a trading action',
        category: SuggestionCategory.NEXT_STEP,
        reasoning: 'Risk management should be connected to trading actions',
        confidence: 0.8,
        priority: 8
      });
    }

    // Suggest optimizing risk parameters
    if (node.data.config?.stopLoss || node.data.config?.takeProfit) {
      suggestions.push({
        id: 'optimize-risk-parameters',
        title: 'Optimize Risk Parameters',
        description: 'Fine-tune stop-loss and take-profit levels for better risk/reward',
        category: SuggestionCategory.OPTIMIZATION,
        reasoning: 'Optimal risk parameters improve risk-adjusted returns',
        confidence: 0.6,
        priority: 5
      });
    }

    return suggestions;
  }

  private getGeneralStrategySuggestions(
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): ContextualSuggestion[] {
    const suggestions: ContextualSuggestion[] = [];

    // Suggest next logical step based on current state
    const nodeTypes = new Set(nodes.map(n => n.data.type));

    if (!nodeTypes.has('data-source')) {
      suggestions.push({
        id: 'add-data-source',
        title: 'Start with Data Source',
        description: 'Add a market data source to begin building your strategy',
        category: SuggestionCategory.NEXT_STEP,
        reasoning: 'Every strategy needs market data as a foundation',
        confidence: 1.0,
        priority: 10
      });
    } else if (!nodeTypes.has('indicator')) {
      suggestions.push({
        id: 'add-indicator',
        title: 'Add Technical Indicator',
        description: 'Add an indicator to analyze the market data',
        category: SuggestionCategory.NEXT_STEP,
        reasoning: 'Indicators help identify trading opportunities',
        confidence: 0.9,
        priority: 9
      });
    } else if (!nodeTypes.has('condition')) {
      suggestions.push({
        id: 'add-condition',
        title: 'Add Entry Condition',
        description: 'Define when to enter trades with a condition node',
        category: SuggestionCategory.NEXT_STEP,
        reasoning: 'Conditions determine when trading signals are generated',
        confidence: 0.9,
        priority: 9
      });
    } else if (!nodeTypes.has('action')) {
      suggestions.push({
        id: 'add-action',
        title: 'Add Trading Action',
        description: 'Add buy/sell actions to execute your trading strategy',
        category: SuggestionCategory.NEXT_STEP,
        reasoning: 'Actions execute the actual trades',
        confidence: 0.9,
        priority: 9
      });
    }

    return suggestions;
  }

  private getStrategyDesignRecommendations(
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): BestPracticeRecommendation[] {
    const recommendations: BestPracticeRecommendation[] = [];

    recommendations.push({
      id: 'keep-it-simple',
      title: 'Keep Strategies Simple',
      description: 'Simple strategies are often more robust and easier to understand than complex ones',
      category: BestPracticeCategory.STRATEGY_DESIGN,
      importance: ImpactLevel.HIGH,
      implementation: 'Focus on 2-3 key indicators and clear entry/exit rules',
      examples: [
        'RSI oversold/overbought with moving average trend filter',
        'MACD crossover with volume confirmation',
        'Bollinger Bands squeeze with momentum confirmation'
      ]
    });

    recommendations.push({
      id: 'test-thoroughly',
      title: 'Test Before Trading',
      description: 'Always backtest your strategy on historical data before using real money',
      category: BestPracticeCategory.BACKTESTING,
      importance: ImpactLevel.CRITICAL,
      implementation: 'Use at least 2-3 years of historical data for backtesting',
      examples: [
        'Test on different market conditions (bull, bear, sideways)',
        'Validate on out-of-sample data',
        'Check performance across different timeframes'
      ]
    });

    return recommendations;
  }

  private getRiskManagementRecommendations(
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): BestPracticeRecommendation[] {
    const recommendations: BestPracticeRecommendation[] = [];

    const riskNodes = nodes.filter(n => n.data.type === 'risk');
    if (riskNodes.length === 0) {
      recommendations.push({
        id: 'always-use-stops',
        title: 'Always Use Stop Losses',
        description: 'Every trade should have a predefined maximum loss limit',
        category: BestPracticeCategory.RISK_MANAGEMENT,
        importance: ImpactLevel.CRITICAL,
        implementation: 'Set stop losses at 1-3% below entry price for most strategies',
        examples: [
          'Technical stop: Below recent support level',
          'Percentage stop: 2% below entry price',
          'ATR-based stop: 2x Average True Range below entry'
        ]
      });
    }

    recommendations.push({
      id: 'position-sizing',
      title: 'Use Proper Position Sizing',
      description: 'Never risk more than 1-2% of your account on a single trade',
      category: BestPracticeCategory.RISK_MANAGEMENT,
      importance: ImpactLevel.HIGH,
      implementation: 'Calculate position size based on stop loss distance and risk tolerance',
      examples: [
        'Fixed percentage: Always risk 1% of account',
        'Volatility-based: Adjust size based on market volatility',
        'Kelly criterion: Optimize based on win rate and average win/loss'
      ]
    });

    return recommendations;
  }

  private getParameterRecommendations(
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): BestPracticeRecommendation[] {
    const recommendations: BestPracticeRecommendation[] = [];

    const indicators = nodes.filter(n => n.data.type === 'indicator');
    if (indicators.length > 0) {
      recommendations.push({
        id: 'avoid-over-optimization',
        title: 'Avoid Over-Optimization',
        description: 'Don\'t optimize parameters too precisely to historical data',
        category: BestPracticeCategory.PARAMETER_SELECTION,
        importance: ImpactLevel.HIGH,
        implementation: 'Use round numbers and test parameter stability',
        examples: [
          'Use RSI 14 instead of RSI 13.7',
          'Test parameter ranges (RSI 10-20) not just single values',
          'Prefer parameters that work across different time periods'
        ]
      });
    }

    return recommendations;
  }

  private analyzeNodeAdditionImpact(
    change: StrategyChange,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): PerformanceImpactAnalysis {
    // Simulate adding a node and analyze impact
    const impactAreas: ImpactArea[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];

    // Complexity impact
    impactAreas.push({
      area: 'complexity',
      impact: ImpactLevel.LOW,
      description: 'Adding one node slightly increases strategy complexity',
      metrics: [{
        name: 'Node Count',
        currentValue: nodes.length,
        estimatedValue: nodes.length + 1,
        change: 1,
        unit: 'nodes'
      }]
    });

    // Performance impact depends on node type
    const nodeType = change.newValue as string;
    if (nodeType === 'indicator') {
      impactAreas.push({
        area: 'performance',
        impact: ImpactLevel.MEDIUM,
        description: 'Adding an indicator may improve signal quality',
        metrics: [{
          name: 'Signal Quality',
          currentValue: 70,
          estimatedValue: 75,
          change: 5,
          unit: '%'
        }]
      });
      recommendations.push('Connect the new indicator to conditions for best results');
    }

    return {
      overallImpact: ImpactLevel.LOW,
      impactAreas,
      recommendations,
      estimatedChange: {
        returnImpact: 2,
        riskImpact: -1,
        complexityImpact: 5,
        confidence: 0.6
      },
      riskFactors
    };
  }

  private analyzeNodeRemovalImpact(
    change: StrategyChange,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): PerformanceImpactAnalysis {
    const impactAreas: ImpactArea[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];

    // Find the node being removed
    const removedNode = nodes.find(n => n.id === change.nodeId);
    if (!removedNode) {
      return this.createNeutralImpactAnalysis();
    }

    // Check if removing critical components
    if (removedNode.data.type === 'risk') {
      riskFactors.push('Removing risk management increases strategy risk');
      impactAreas.push({
        area: 'risk',
        impact: ImpactLevel.HIGH,
        description: 'Removing risk management significantly increases risk',
        metrics: [{
          name: 'Risk Level',
          currentValue: 30,
          estimatedValue: 60,
          change: 30,
          unit: '%'
        }]
      });
    }

    return {
      overallImpact: ImpactLevel.MEDIUM,
      impactAreas,
      recommendations,
      estimatedChange: {
        returnImpact: -5,
        riskImpact: 15,
        complexityImpact: -5,
        confidence: 0.7
      },
      riskFactors
    };
  }

  private analyzeNodeModificationImpact(
    change: StrategyChange,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): PerformanceImpactAnalysis {
    return {
      overallImpact: ImpactLevel.LOW,
      impactAreas: [{
        area: 'performance',
        impact: ImpactLevel.LOW,
        description: 'Parameter changes may affect strategy performance',
        metrics: [{
          name: 'Performance',
          currentValue: 100,
          estimatedValue: 102,
          change: 2,
          unit: '%'
        }]
      }],
      recommendations: ['Monitor performance after parameter changes'],
      estimatedChange: {
        returnImpact: 1,
        riskImpact: 1,
        complexityImpact: 0,
        confidence: 0.4
      },
      riskFactors: []
    };
  }

  private analyzeEdgeAdditionImpact(
    change: StrategyChange,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): PerformanceImpactAnalysis {
    return {
      overallImpact: ImpactLevel.LOW,
      impactAreas: [{
        area: 'performance',
        impact: ImpactLevel.LOW,
        description: 'New connection may improve strategy flow',
        metrics: [{
          name: 'Connectivity',
          currentValue: edges.length,
          estimatedValue: edges.length + 1,
          change: 1,
          unit: 'connections'
        }]
      }],
      recommendations: ['Ensure the new connection follows logical data flow'],
      estimatedChange: {
        returnImpact: 1,
        riskImpact: 0,
        complexityImpact: 2,
        confidence: 0.5
      },
      riskFactors: []
    };
  }

  private analyzeEdgeRemovalImpact(
    change: StrategyChange,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): PerformanceImpactAnalysis {
    return {
      overallImpact: ImpactLevel.MEDIUM,
      impactAreas: [{
        area: 'performance',
        impact: ImpactLevel.MEDIUM,
        description: 'Removing connections may break strategy flow',
        metrics: [{
          name: 'Connectivity',
          currentValue: edges.length,
          estimatedValue: edges.length - 1,
          change: -1,
          unit: 'connections'
        }]
      }],
      recommendations: ['Verify that strategy still functions after removing connection'],
      estimatedChange: {
        returnImpact: -3,
        riskImpact: 5,
        complexityImpact: -2,
        confidence: 0.6
      },
      riskFactors: ['Broken connections may prevent strategy execution']
    };
  }

  private getTipsForUserLevel(userLevel: 'beginner' | 'intermediate' | 'advanced'): EducationalTip[] {
    const tips: EducationalTip[] = [];

    if (userLevel === 'beginner') {
      tips.push({
        id: 'start-simple',
        title: 'Start with Simple Strategies',
        content: 'Begin with basic strategies using 1-2 indicators. Complex strategies are harder to understand and often perform worse.',
        category: EducationalCategory.STRATEGY_DEVELOPMENT,
        difficulty: 'beginner',
        relatedConcepts: ['indicators', 'strategy-design'],
        examples: ['RSI oversold/overbought', 'Moving average crossover']
      });

      tips.push({
        id: 'understand-risk',
        title: 'Always Manage Risk',
        content: 'Never trade without stop losses. Risk management is more important than finding winning trades.',
        category: EducationalCategory.RISK_MANAGEMENT,
        difficulty: 'beginner',
        relatedConcepts: ['stop-loss', 'position-sizing']
      });
    }

    return tips;
  }

  private getTipsForCurrentStrategy(nodes: BuilderNode[]): EducationalTip[] {
    const tips: EducationalTip[] = [];
    const nodeTypes = new Set(nodes.map(n => n.data.type));

    if (nodeTypes.has('indicator')) {
      tips.push({
        id: 'indicator-combinations',
        title: 'Combining Indicators',
        content: 'Use different types of indicators together: trend-following (MA) with momentum (RSI) for better signals.',
        category: EducationalCategory.TECHNICAL_ANALYSIS,
        difficulty: 'intermediate',
        relatedConcepts: ['indicators', 'signal-quality']
      });
    }

    if (!nodeTypes.has('risk')) {
      tips.push({
        id: 'add-risk-management',
        title: 'Risk Management is Essential',
        content: 'Every strategy should include stop losses and position sizing to protect your capital.',
        category: EducationalCategory.RISK_MANAGEMENT,
        difficulty: 'beginner',
        relatedConcepts: ['stop-loss', 'take-profit', 'position-sizing']
      });
    }

    return tips;
  }

  private getTipsForSelectedNode(selectedNode: BuilderNode): EducationalTip[] {
    const tips: EducationalTip[] = [];

    switch (selectedNode.data.type) {
      case 'indicator':
        if (selectedNode.data.config?.indicatorId === 'rsi') {
          tips.push({
            id: 'rsi-usage',
            title: 'Using RSI Effectively',
            content: 'RSI above 70 suggests overbought conditions (potential sell), below 30 suggests oversold (potential buy). However, in strong trends, RSI can stay extreme for extended periods.',
            category: EducationalCategory.TECHNICAL_ANALYSIS,
            difficulty: 'beginner',
            relatedConcepts: ['rsi', 'overbought', 'oversold']
          });
        }
        break;

      case 'risk':
        tips.push({
          id: 'stop-loss-placement',
          title: 'Stop Loss Placement',
          content: 'Place stops below recent support (for longs) or above resistance (for shorts). Avoid placing stops at obvious levels where many other traders might have theirs.',
          category: EducationalCategory.RISK_MANAGEMENT,
          difficulty: 'intermediate',
          relatedConcepts: ['stop-loss', 'support', 'resistance']
        });
        break;
    }

    return tips;
  }

  // Utility methods

  private calculateCompleteness(nodes: BuilderNode[], edges: BuilderEdge[]): number {
    const requiredComponents = ['data-source', 'condition', 'action'];
    const presentComponents = new Set(nodes.map(n => n.data.type));
    
    const hasRequired = requiredComponents.every(type => presentComponents.has(type));
    const hasConnections = edges.length > 0;
    const hasRiskManagement = presentComponents.has('risk');
    
    let score = 0;
    if (hasRequired) score += 60;
    if (hasConnections) score += 20;
    if (hasRiskManagement) score += 20;
    
    return Math.min(100, score);
  }

  private calculateValidationConfidence(
    errors: ValidationError[],
    warnings: ValidationWarning[],
    completeness: number
  ): number {
    let confidence = 1.0;
    
    // Reduce confidence for errors
    confidence -= errors.length * 0.2;
    
    // Reduce confidence for warnings
    confidence -= warnings.length * 0.1;
    
    // Factor in completeness
    confidence *= (completeness / 100);
    
    return Math.max(0, Math.min(1, confidence));
  }

  private detectCircularDependencies(nodes: BuilderNode[], edges: BuilderEdge[]): string[][] {
    // Simplified cycle detection - in practice, would use proper graph algorithms
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart !== -1) {
          cycles.push(path.slice(cycleStart));
        }
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        dfs(edge.target, [...path, nodeId]);
      }

      recursionStack.delete(nodeId);
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    }

    return cycles;
  }

  private isValidConnection(sourceType: string, targetType: string): boolean {
    const validConnections: Record<string, string[]> = {
      'data-source': ['indicator', 'condition', 'math'],
      'indicator': ['condition', 'math', 'action'],
      'condition': ['action', 'logic'],
      'math': ['condition', 'action', 'math'],
      'logic': ['action', 'condition'],
      'timing': ['condition', 'action'],
      'risk': ['action']
    };

    return validConnections[sourceType]?.includes(targetType) || false;
  }

  private checkParameterWarnings(node: BuilderNode): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    if (node.data.config?.parameters) {
      const params = node.data.config.parameters as Record<string, unknown>;

      // Check RSI parameters
      if (node.data.config.indicatorId === 'rsi') {
        if (typeof params.period === 'number' && (params.period < 5 || params.period > 50)) {
          warnings.push({
            id: `rsi-period-${node.id}`,
            type: WarningType.PARAMETER_OUT_OF_RANGE,
            message: 'RSI period may be suboptimal',
            description: `RSI period of ${params.period} is outside typical range (5-50)`,
            nodeId: node.id,
            recommendation: 'Consider using RSI period between 10-20 for most strategies',
            impact: ImpactLevel.LOW
          });
        }
      }

      // Check SMA parameters
      if (node.data.config.indicatorId === 'sma') {
        if (typeof params.period === 'number' && params.period > 200) {
          warnings.push({
            id: `sma-period-${node.id}`,
            type: WarningType.PARAMETER_OUT_OF_RANGE,
            message: 'SMA period is very high',
            description: `SMA period of ${params.period} may be too slow for most strategies`,
            nodeId: node.id,
            recommendation: 'Consider using SMA period between 10-50 for active trading',
            impact: ImpactLevel.LOW
          });
        }
      }
    }

    return warnings;
  }

  private isRecommendationRelevant(
    recommendation: BestPracticeRecommendation,
    nodes: BuilderNode[],
    edges: BuilderEdge[]
  ): boolean {
    // Filter recommendations based on current strategy state
    const nodeTypes = new Set(nodes.map(n => n.data.type));

    // Always show critical recommendations
    if (recommendation.importance === ImpactLevel.CRITICAL) {
      return true;
    }

    // Show risk management recommendations if no risk nodes
    if (recommendation.category === BestPracticeCategory.RISK_MANAGEMENT) {
      return !nodeTypes.has('risk');
    }

    // Show parameter recommendations if strategy has indicators
    if (recommendation.category === BestPracticeCategory.PARAMETER_SELECTION) {
      return nodeTypes.has('indicator');
    }

    return true;
  }

  private createNeutralImpactAnalysis(): PerformanceImpactAnalysis {
    return {
      overallImpact: ImpactLevel.LOW,
      impactAreas: [],
      recommendations: [],
      estimatedChange: {
        returnImpact: 0,
        riskImpact: 0,
        complexityImpact: 0,
        confidence: 0.5
      },
      riskFactors: []
    };
  }
}