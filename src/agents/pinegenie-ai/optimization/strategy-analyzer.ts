/**
 * Strategy Analyzer
 * 
 * Analyzes existing strategies on the canvas to identify gaps,
 * improvements, and compatibility issues.
 */

import type { BuilderNode, BuilderEdge } from '../../../app/builder/builder-state';
import type { 
  RiskAssessment, 
  RiskLevel, 
  RiskFactor, 
  RiskFactorType, 
  RiskRecommendation,
  ImpactLevel 
} from '../types/optimization-types';
import type { StrategyBlueprint, ComponentType } from '../types/strategy-types';

export interface StrategyAnalysis {
  completeness: CompletenessAnalysis;
  gaps: StrategyGap[];
  improvements: ImprovementSuggestion[];
  compatibility: CompatibilityAnalysis;
  riskAssessment: RiskAssessment;
  performance: PerformanceAnalysis;
  metadata: AnalysisMetadata;
}

export interface CompletenessAnalysis {
  score: number; // 0-100
  missingComponents: ComponentType[];
  requiredConnections: ConnectionRequirement[];
  criticalIssues: string[];
  warnings: string[];
}

export interface StrategyGap {
  id: string;
  type: 'missing-component' | 'missing-connection' | 'invalid-parameter' | 'logic-error';
  severity: ImpactLevel;
  description: string;
  recommendation: string;
  autoFixable: boolean;
  suggestedNodes?: Partial<BuilderNode>[];
  suggestedConnections?: Partial<BuilderEdge>[];
}

export interface ImprovementSuggestion {
  id: string;
  category: 'performance' | 'risk' | 'logic' | 'structure';
  title: string;
  description: string;
  impact: ImpactLevel;
  effort: 'low' | 'medium' | 'high';
  implementation: string;
  expectedBenefit: string;
}

export interface CompatibilityAnalysis {
  nodeCompatibility: NodeCompatibility[];
  connectionValidation: ConnectionValidation[];
  parameterConflicts: ParameterConflict[];
  overallCompatibility: number; // 0-100
}

export interface NodeCompatibility {
  nodeId: string;
  compatible: boolean;
  issues: string[];
  suggestions: string[];
}

export interface ConnectionValidation {
  edgeId: string;
  valid: boolean;
  issues: string[];
  dataFlowCorrect: boolean;
}

export interface ParameterConflict {
  nodeId: string;
  parameter: string;
  issue: string;
  suggestedValue: unknown;
}

export interface ConnectionRequirement {
  from: string;
  to: string;
  type: 'required' | 'recommended' | 'optional';
  reason: string;
}

export interface PerformanceAnalysis {
  complexity: number; // 0-100
  efficiency: number; // 0-100
  bottlenecks: string[];
  optimizationOpportunities: string[];
}

export interface AnalysisMetadata {
  analyzedAt: Date;
  processingTime: number;
  confidence: number;
  version: string;
}

export class StrategyAnalyzer {
  private readonly REQUIRED_COMPONENTS = [
    ComponentType.DATA_SOURCE,
    ComponentType.CONDITION,
    ComponentType.ACTION
  ];

  private readonly RECOMMENDED_COMPONENTS = [
    ComponentType.RISK_MANAGEMENT,
    ComponentType.INDICATOR
  ];

  /**
   * Analyze the current canvas state for completeness and improvements
   */
  async analyzeStrategy(nodes: BuilderNode[], edges: BuilderEdge[]): Promise<StrategyAnalysis> {
    const startTime = performance.now();

    try {
      // Perform comprehensive analysis
      const completeness = this.analyzeCompleteness(nodes, edges);
      const gaps = this.identifyGaps(nodes, edges);
      const improvements = this.suggestImprovements(nodes, edges);
      const compatibility = this.analyzeCompatibility(nodes, edges);
      const riskAssessment = this.assessRisk(nodes, edges);
      const performance = this.analyzePerformance(nodes, edges);

      const processingTime = performance.now() - startTime;

      return {
        completeness,
        gaps,
        improvements,
        compatibility,
        riskAssessment,
        performance,
        metadata: {
          analyzedAt: new Date(),
          processingTime,
          confidence: this.calculateOverallConfidence(completeness, compatibility),
          version: '1.0.0'
        }
      };
    } catch (error) {
      console.error('Strategy analysis failed:', error);
      throw new Error(`Strategy analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze strategy completeness
   */
  private analyzeCompleteness(nodes: BuilderNode[], edges: BuilderEdge[]): CompletenessAnalysis {
    const nodeTypes = new Set(nodes.map(node => node.data.type as ComponentType));
    const missingComponents: ComponentType[] = [];
    const criticalIssues: string[] = [];
    const warnings: string[] = [];

    // Check for required components
    for (const requiredType of this.REQUIRED_COMPONENTS) {
      if (!nodeTypes.has(requiredType)) {
        missingComponents.push(requiredType);
        criticalIssues.push(`Missing required component: ${requiredType}`);
      }
    }

    // Check for recommended components
    for (const recommendedType of this.RECOMMENDED_COMPONENTS) {
      if (!nodeTypes.has(recommendedType)) {
        warnings.push(`Missing recommended component: ${recommendedType}`);
      }
    }

    // Analyze required connections
    const requiredConnections = this.identifyRequiredConnections(nodes);
    const existingConnections = new Set(edges.map(edge => `${edge.source}-${edge.target}`));

    for (const connection of requiredConnections) {
      const connectionKey = `${connection.from}-${connection.to}`;
      if (!existingConnections.has(connectionKey) && connection.type === 'required') {
        criticalIssues.push(`Missing required connection: ${connection.from} → ${connection.to}`);
      }
    }

    // Calculate completeness score
    const totalRequirements = this.REQUIRED_COMPONENTS.length + requiredConnections.filter(c => c.type === 'required').length;
    const metRequirements = totalRequirements - criticalIssues.length;
    const score = Math.max(0, Math.round((metRequirements / totalRequirements) * 100));

    return {
      score,
      missingComponents,
      requiredConnections,
      criticalIssues,
      warnings
    };
  }

  /**
   * Identify strategy gaps and issues
   */
  private identifyGaps(nodes: BuilderNode[], edges: BuilderEdge[]): StrategyGap[] {
    const gaps: StrategyGap[] = [];

    // Check for missing data sources
    const dataSources = nodes.filter(node => node.data.type === 'data-source');
    if (dataSources.length === 0) {
      gaps.push({
        id: 'missing-data-source',
        type: 'missing-component',
        severity: ImpactLevel.CRITICAL,
        description: 'Strategy lacks a data source for market data',
        recommendation: 'Add a Market Data node to provide price information',
        autoFixable: true,
        suggestedNodes: [{
          type: 'data-source',
          data: {
            id: 'suggested-data-source',
            type: 'data-source',
            label: 'Market Data',
            description: 'Real-time market price data',
            config: {
              symbol: 'BTCUSDT',
              timeframe: '1h',
              source: 'binance'
            }
          },
          position: { x: 100, y: 100 }
        }]
      });
    }

    // Check for missing entry conditions
    const conditions = nodes.filter(node => node.data.type === 'condition');
    if (conditions.length === 0) {
      gaps.push({
        id: 'missing-entry-condition',
        type: 'missing-component',
        severity: ImpactLevel.HIGH,
        description: 'Strategy lacks entry conditions for trade signals',
        recommendation: 'Add condition nodes to define when to enter trades',
        autoFixable: true,
        suggestedNodes: [{
          type: 'condition',
          data: {
            id: 'suggested-condition',
            type: 'condition',
            label: 'Entry Condition',
            description: 'Define when to enter trades',
            config: {
              operator: 'greater_than',
              threshold: 0
            }
          },
          position: { x: 300, y: 150 }
        }]
      });
    }

    // Check for missing actions
    const actions = nodes.filter(node => node.data.type === 'action');
    if (actions.length === 0) {
      gaps.push({
        id: 'missing-actions',
        type: 'missing-component',
        severity: ImpactLevel.CRITICAL,
        description: 'Strategy lacks action nodes to execute trades',
        recommendation: 'Add buy/sell action nodes to execute trading decisions',
        autoFixable: true,
        suggestedNodes: [{
          type: 'action',
          data: {
            id: 'suggested-buy-action',
            type: 'action',
            label: 'Buy Order',
            description: 'Execute buy order',
            config: {
              orderType: 'market',
              quantity: '25%'
            }
          },
          position: { x: 500, y: 100 }
        }]
      });
    }

    // Check for missing risk management
    const riskNodes = nodes.filter(node => node.data.type === 'risk');
    if (riskNodes.length === 0) {
      gaps.push({
        id: 'missing-risk-management',
        type: 'missing-component',
        severity: ImpactLevel.HIGH,
        description: 'Strategy lacks risk management components',
        recommendation: 'Add stop-loss and take-profit nodes to manage risk',
        autoFixable: true,
        suggestedNodes: [{
          type: 'risk',
          data: {
            id: 'suggested-stop-loss',
            type: 'risk',
            label: 'Stop Loss',
            description: 'Risk management with stop loss',
            config: {
              stopLoss: 2,
              maxRisk: 1
            }
          },
          position: { x: 500, y: 200 }
        }]
      });
    }

    // Check for orphaned nodes (nodes without connections)
    const connectedNodeIds = new Set([
      ...edges.map(edge => edge.source),
      ...edges.map(edge => edge.target)
    ]);

    const orphanedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));
    for (const orphan of orphanedNodes) {
      gaps.push({
        id: `orphaned-node-${orphan.id}`,
        type: 'missing-connection',
        severity: ImpactLevel.MEDIUM,
        description: `Node "${orphan.data.label}" is not connected to the strategy flow`,
        recommendation: 'Connect this node to other components or remove it',
        autoFixable: false
      });
    }

    return gaps;
  }

  /**
   * Suggest improvements for the strategy
   */
  private suggestImprovements(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const improvements: ImprovementSuggestion[] = [];

    // Suggest adding indicators for better signal quality
    const indicators = nodes.filter(node => node.data.type === 'indicator');
    if (indicators.length < 2) {
      improvements.push({
        id: 'add-confirmation-indicator',
        category: 'logic',
        title: 'Add Confirmation Indicator',
        description: 'Adding a second indicator can improve signal reliability and reduce false signals',
        impact: ImpactLevel.MEDIUM,
        effort: 'low',
        implementation: 'Add an RSI or MACD indicator to confirm entry signals',
        expectedBenefit: 'Reduced false signals and improved win rate'
      });
    }

    // Suggest parameter optimization
    const parametricNodes = nodes.filter(node => 
      node.data.config && Object.keys(node.data.config).length > 0
    );
    if (parametricNodes.length > 0) {
      improvements.push({
        id: 'optimize-parameters',
        category: 'performance',
        title: 'Optimize Parameters',
        description: 'Current parameters may not be optimal for current market conditions',
        impact: ImpactLevel.HIGH,
        effort: 'medium',
        implementation: 'Run parameter optimization to find better values',
        expectedBenefit: 'Improved strategy performance and profitability'
      });
    }

    // Suggest adding time filters
    const timeFilters = nodes.filter(node => node.data.type === 'timing');
    if (timeFilters.length === 0) {
      improvements.push({
        id: 'add-time-filter',
        category: 'risk',
        title: 'Add Time Filter',
        description: 'Restricting trading to specific hours can improve performance',
        impact: ImpactLevel.MEDIUM,
        effort: 'low',
        implementation: 'Add a time filter to trade only during high-volume hours',
        expectedBenefit: 'Reduced slippage and improved execution quality'
      });
    }

    // Suggest position sizing improvements
    const actions = nodes.filter(node => node.data.type === 'action');
    const hasPositionSizing = actions.some(action => 
      action.data.config?.quantity && action.data.config.quantity !== '100%'
    );
    if (!hasPositionSizing) {
      improvements.push({
        id: 'improve-position-sizing',
        category: 'risk',
        title: 'Implement Dynamic Position Sizing',
        description: 'Fixed position sizes may not be optimal for all market conditions',
        impact: ImpactLevel.HIGH,
        effort: 'medium',
        implementation: 'Use volatility-based or risk-based position sizing',
        expectedBenefit: 'Better risk management and improved risk-adjusted returns'
      });
    }

    return improvements;
  }

  /**
   * Analyze node and connection compatibility
   */
  private analyzeCompatibility(nodes: BuilderNode[], edges: BuilderEdge[]): CompatibilityAnalysis {
    const nodeCompatibility: NodeCompatibility[] = [];
    const connectionValidation: ConnectionValidation[] = [];
    const parameterConflicts: ParameterConflict[] = [];

    // Analyze each node for compatibility
    for (const node of nodes) {
      const compatibility = this.analyzeNodeCompatibility(node, nodes, edges);
      nodeCompatibility.push(compatibility);
    }

    // Validate each connection
    for (const edge of edges) {
      const validation = this.validateConnection(edge, nodes);
      connectionValidation.push(validation);
    }

    // Check for parameter conflicts
    const conflicts = this.identifyParameterConflicts(nodes);
    parameterConflicts.push(...conflicts);

    // Calculate overall compatibility score
    const compatibleNodes = nodeCompatibility.filter(n => n.compatible).length;
    const validConnections = connectionValidation.filter(c => c.valid).length;
    const totalItems = nodeCompatibility.length + connectionValidation.length;
    const compatibleItems = compatibleNodes + validConnections;
    const overallCompatibility = totalItems > 0 ? Math.round((compatibleItems / totalItems) * 100) : 100;

    return {
      nodeCompatibility,
      connectionValidation,
      parameterConflicts,
      overallCompatibility
    };
  }

  /**
   * Assess risk factors in the strategy
   */
  private assessRisk(nodes: BuilderNode[], edges: BuilderEdge[]): RiskAssessment {
    const riskFactors: RiskFactor[] = [];
    const recommendations: RiskRecommendation[] = [];

    // Check for over-optimization risk
    const indicators = nodes.filter(node => node.data.type === 'indicator');
    if (indicators.length > 5) {
      riskFactors.push({
        id: 'over-optimization',
        type: RiskFactorType.OVER_OPTIMIZATION,
        description: 'Strategy uses too many indicators, which may lead to over-optimization',
        severity: ImpactLevel.MEDIUM,
        likelihood: 0.7,
        impact: 0.6,
        mitigation: 'Reduce the number of indicators and focus on the most effective ones'
      });
    }

    // Check for insufficient risk management
    const riskNodes = nodes.filter(node => node.data.type === 'risk');
    if (riskNodes.length === 0) {
      riskFactors.push({
        id: 'insufficient-risk-management',
        type: RiskFactorType.POOR_RISK_REWARD,
        description: 'Strategy lacks proper risk management components',
        severity: ImpactLevel.HIGH,
        likelihood: 0.9,
        impact: 0.8,
        mitigation: 'Add stop-loss and take-profit nodes'
      });

      recommendations.push({
        id: 'add-risk-management',
        description: 'Add stop-loss and take-profit nodes to manage downside risk',
        priority: 'high',
        implementation: 'Create risk management nodes with appropriate stop-loss and take-profit levels',
        expectedImpact: ImpactLevel.HIGH
      });
    }

    // Check for excessive complexity
    const totalNodes = nodes.length;
    if (totalNodes > 15) {
      riskFactors.push({
        id: 'excessive-complexity',
        type: RiskFactorType.OVER_OPTIMIZATION,
        description: 'Strategy is overly complex with too many components',
        severity: ImpactLevel.MEDIUM,
        likelihood: 0.6,
        impact: 0.5,
        mitigation: 'Simplify the strategy by removing non-essential components'
      });
    }

    // Calculate overall risk score
    const totalRisk = riskFactors.reduce((sum, factor) => 
      sum + (factor.likelihood * factor.impact * this.getSeverityWeight(factor.severity)), 0
    );
    const maxPossibleRisk = riskFactors.length * 1.0 * 1.0 * 1.0; // max likelihood * max impact * max severity weight
    const riskScore = maxPossibleRisk > 0 ? Math.round((totalRisk / maxPossibleRisk) * 100) : 0;

    // Determine overall risk level
    let overallRisk: RiskLevel;
    if (riskScore < 20) overallRisk = RiskLevel.VERY_LOW;
    else if (riskScore < 40) overallRisk = RiskLevel.LOW;
    else if (riskScore < 60) overallRisk = RiskLevel.MEDIUM;
    else if (riskScore < 80) overallRisk = RiskLevel.HIGH;
    else overallRisk = RiskLevel.VERY_HIGH;

    return {
      overallRisk,
      riskFactors,
      recommendations,
      score: Math.max(0, 100 - riskScore), // Invert score so higher is better
      metadata: {
        assessmentDate: new Date(),
        marketConditions: 'normal',
        timeframe: '1h',
        confidence: 0.85
      }
    };
  }

  /**
   * Analyze strategy performance characteristics
   */
  private analyzePerformance(nodes: BuilderNode[], edges: BuilderEdge[]): PerformanceAnalysis {
    const complexity = this.calculateComplexity(nodes, edges);
    const efficiency = this.calculateEfficiency(nodes, edges);
    const bottlenecks = this.identifyBottlenecks(nodes, edges);
    const optimizationOpportunities = this.identifyOptimizationOpportunities(nodes, edges);

    return {
      complexity,
      efficiency,
      bottlenecks,
      optimizationOpportunities
    };
  }

  // Helper methods

  private identifyRequiredConnections(nodes: BuilderNode[]): ConnectionRequirement[] {
    const requirements: ConnectionRequirement[] = [];
    
    // Data sources should connect to indicators or conditions
    const dataSources = nodes.filter(node => node.data.type === 'data-source');
    const indicators = nodes.filter(node => node.data.type === 'indicator');
    const conditions = nodes.filter(node => node.data.type === 'condition');

    for (const dataSource of dataSources) {
      if (indicators.length > 0) {
        requirements.push({
          from: dataSource.id,
          to: indicators[0].id,
          type: 'required',
          reason: 'Data source must feed into indicators or conditions'
        });
      } else if (conditions.length > 0) {
        requirements.push({
          from: dataSource.id,
          to: conditions[0].id,
          type: 'required',
          reason: 'Data source must feed into conditions'
        });
      }
    }

    // Conditions should connect to actions
    const actions = nodes.filter(node => node.data.type === 'action');
    for (const condition of conditions) {
      if (actions.length > 0) {
        requirements.push({
          from: condition.id,
          to: actions[0].id,
          type: 'required',
          reason: 'Conditions must trigger actions'
        });
      }
    }

    return requirements;
  }

  private analyzeNodeCompatibility(node: BuilderNode, allNodes: BuilderNode[], edges: BuilderEdge[]): NodeCompatibility {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check if node has required parameters
    if (node.data.type === 'indicator' && !node.data.config?.parameters) {
      issues.push('Indicator missing required parameters');
      suggestions.push('Configure indicator parameters for proper functionality');
    }

    // Check if node is properly connected
    const hasIncoming = edges.some(edge => edge.target === node.id);
    const hasOutgoing = edges.some(edge => edge.source === node.id);

    if (node.data.type === 'data-source' && !hasOutgoing) {
      issues.push('Data source not connected to any consumers');
      suggestions.push('Connect data source to indicators or conditions');
    }

    if (node.data.type === 'action' && !hasIncoming) {
      issues.push('Action node not connected to any triggers');
      suggestions.push('Connect conditions or signals to this action');
    }

    return {
      nodeId: node.id,
      compatible: issues.length === 0,
      issues,
      suggestions
    };
  }

  private validateConnection(edge: BuilderEdge, nodes: BuilderNode[]): ConnectionValidation {
    const issues: string[] = [];
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      issues.push('Connection references non-existent nodes');
      return {
        edgeId: edge.id,
        valid: false,
        issues,
        dataFlowCorrect: false
      };
    }

    // Check data flow logic
    const dataFlowCorrect = this.isValidDataFlow(sourceNode.data.type, targetNode.data.type);
    if (!dataFlowCorrect) {
      issues.push(`Invalid data flow: ${sourceNode.data.type} → ${targetNode.data.type}`);
    }

    return {
      edgeId: edge.id,
      valid: issues.length === 0,
      issues,
      dataFlowCorrect
    };
  }

  private identifyParameterConflicts(nodes: BuilderNode[]): ParameterConflict[] {
    const conflicts: ParameterConflict[] = [];

    for (const node of nodes) {
      if (node.data.config) {
        // Check for invalid parameter values
        if (node.data.type === 'indicator' && node.data.config.parameters) {
          const params = node.data.config.parameters as Record<string, unknown>;
          
          // Check RSI parameters
          if (node.data.config.indicatorId === 'rsi') {
            if (typeof params.period === 'number' && (params.period < 1 || params.period > 100)) {
              conflicts.push({
                nodeId: node.id,
                parameter: 'period',
                issue: 'RSI period should be between 1 and 100',
                suggestedValue: 14
              });
            }
          }

          // Check SMA parameters
          if (node.data.config.indicatorId === 'sma') {
            if (typeof params.period === 'number' && (params.period < 1 || params.period > 200)) {
              conflicts.push({
                nodeId: node.id,
                parameter: 'period',
                issue: 'SMA period should be between 1 and 200',
                suggestedValue: 20
              });
            }
          }
        }
      }
    }

    return conflicts;
  }

  private calculateComplexity(nodes: BuilderNode[], edges: BuilderEdge[]): number {
    // Complexity based on number of nodes, edges, and parameter count
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const parameterCount = nodes.reduce((sum, node) => {
      const config = node.data.config;
      return sum + (config ? Object.keys(config).length : 0);
    }, 0);

    // Normalize to 0-100 scale
    const rawComplexity = (nodeCount * 2) + (edgeCount * 1.5) + (parameterCount * 0.5);
    return Math.min(100, Math.round(rawComplexity));
  }

  private calculateEfficiency(nodes: BuilderNode[], edges: BuilderEdge[]): number {
    // Efficiency based on node utilization and connection optimization
    const totalNodes = nodes.length;
    const connectedNodes = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target)
    ]).size;

    const utilizationRatio = totalNodes > 0 ? connectedNodes / totalNodes : 1;
    const redundancyPenalty = this.calculateRedundancyPenalty(nodes);
    
    const efficiency = (utilizationRatio * 100) - redundancyPenalty;
    return Math.max(0, Math.round(efficiency));
  }

  private identifyBottlenecks(nodes: BuilderNode[], edges: BuilderEdge[]): string[] {
    const bottlenecks: string[] = [];

    // Find nodes with too many incoming connections
    const incomingCounts = new Map<string, number>();
    edges.forEach(edge => {
      incomingCounts.set(edge.target, (incomingCounts.get(edge.target) || 0) + 1);
    });

    for (const [nodeId, count] of incomingCounts) {
      if (count > 5) {
        const node = nodes.find(n => n.id === nodeId);
        bottlenecks.push(`Node "${node?.data.label}" has too many inputs (${count})`);
      }
    }

    // Find complex indicator chains
    const indicatorNodes = nodes.filter(n => n.data.type === 'indicator');
    if (indicatorNodes.length > 8) {
      bottlenecks.push('Too many indicators may slow down strategy execution');
    }

    return bottlenecks;
  }

  private identifyOptimizationOpportunities(nodes: BuilderNode[], edges: BuilderEdge[]): string[] {
    const opportunities: string[] = [];

    // Check for unused nodes
    const connectedNodeIds = new Set([
      ...edges.map(e => e.source),
      ...edges.map(e => e.target)
    ]);
    const unusedNodes = nodes.filter(n => !connectedNodeIds.has(n.id));
    if (unusedNodes.length > 0) {
      opportunities.push(`Remove ${unusedNodes.length} unused nodes to improve performance`);
    }

    // Check for redundant indicators
    const indicatorTypes = nodes
      .filter(n => n.data.type === 'indicator')
      .map(n => n.data.config?.indicatorId)
      .filter(Boolean);
    const uniqueIndicators = new Set(indicatorTypes);
    if (indicatorTypes.length > uniqueIndicators.size) {
      opportunities.push('Consolidate duplicate indicators to reduce complexity');
    }

    // Check for parameter optimization opportunities
    const parametricNodes = nodes.filter(n => 
      n.data.config && Object.keys(n.data.config).length > 0
    );
    if (parametricNodes.length > 0) {
      opportunities.push('Run parameter optimization to improve strategy performance');
    }

    return opportunities;
  }

  private calculateRedundancyPenalty(nodes: BuilderNode[]): number {
    // Penalty for redundant or duplicate functionality
    const nodeTypes = nodes.map(n => n.data.type);
    const uniqueTypes = new Set(nodeTypes);
    const redundancy = nodeTypes.length - uniqueTypes.size;
    return Math.min(50, redundancy * 5); // Max 50% penalty
  }

  private isValidDataFlow(sourceType: string, targetType: string): boolean {
    const validFlows: Record<string, string[]> = {
      'data-source': ['indicator', 'condition', 'math'],
      'indicator': ['condition', 'math', 'action'],
      'condition': ['action', 'logic'],
      'math': ['condition', 'action', 'math'],
      'logic': ['action', 'condition'],
      'timing': ['condition', 'action']
    };

    return validFlows[sourceType]?.includes(targetType) || false;
  }

  private getSeverityWeight(severity: ImpactLevel): number {
    switch (severity) {
      case ImpactLevel.LOW: return 0.25;
      case ImpactLevel.MEDIUM: return 0.5;
      case ImpactLevel.HIGH: return 0.75;
      case ImpactLevel.CRITICAL: return 1.0;
      default: return 0.5;
    }
  }

  private calculateOverallConfidence(
    completeness: CompletenessAnalysis, 
    compatibility: CompatibilityAnalysis
  ): number {
    const completenessWeight = 0.6;
    const compatibilityWeight = 0.4;
    
    const completenessScore = completeness.score / 100;
    const compatibilityScore = compatibility.overallCompatibility / 100;
    
    return Math.round(
      (completenessScore * completenessWeight + compatibilityScore * compatibilityWeight) * 100
    ) / 100;
  }
}