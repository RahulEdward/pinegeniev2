/**
 * Improvement Suggester
 * 
 * Analyzes strategies and suggests specific improvements for better performance,
 * risk management, and overall strategy quality.
 */

import type { BuilderNode, BuilderEdge } from '../../../app/builder/builder-state';
import type { ImpactLevel } from '../types/optimization-types';

export interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  category: ImprovementCategory;
  priority: ImprovementPriority;
  impact: ImpactLevel;
  effort: EffortLevel;
  implementation: ImplementationGuide;
  expectedBenefit: string;
  riskFactors: string[];
  prerequisites: string[];
  confidence: number;
}

export interface ImplementationGuide {
  steps: ImplementationStep[];
  estimatedTime: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  requiredKnowledge: string[];
}

export interface ImplementationStep {
  stepNumber: number;
  action: string;
  description: string;
  nodeChanges?: NodeChange[];
  parameterChanges?: ParameterChange[];
}

export interface NodeChange {
  action: 'add' | 'remove' | 'modify';
  nodeType: string;
  nodeId?: string;
  configuration: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface ParameterChange {
  nodeId: string;
  parameter: string;
  oldValue: unknown;
  newValue: unknown;
  reasoning: string;
}

export enum ImprovementCategory {
  PERFORMANCE = 'performance',
  RISK_MANAGEMENT = 'risk-management',
  SIGNAL_QUALITY = 'signal-quality',
  STRUCTURE = 'structure',
  PARAMETERS = 'parameters',
  ROBUSTNESS = 'robustness'
}

export enum ImprovementPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum EffortLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export class ImprovementSuggester {
  /**
   * Generate comprehensive improvement suggestions for a strategy
   */
  generateImprovements(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // Analyze different aspects of the strategy
    suggestions.push(...this.analyzeRiskManagement(nodes, edges));
    suggestions.push(...this.analyzeSignalQuality(nodes, edges));
    suggestions.push(...this.analyzeStructure(nodes, edges));
    suggestions.push(...this.analyzeParameters(nodes, edges));
    suggestions.push(...this.analyzePerformance(nodes, edges));
    suggestions.push(...this.analyzeRobustness(nodes, edges));

    // Sort by priority and impact
    return suggestions.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      
      const aPriorityScore = priorityOrder[a.priority];
      const bPriorityScore = priorityOrder[b.priority];
      
      if (aPriorityScore !== bPriorityScore) {
        return bPriorityScore - aPriorityScore;
      }
      
      const aImpactScore = impactOrder[a.impact];
      const bImpactScore = impactOrder[b.impact];
      
      return bImpactScore - aImpactScore;
    });
  }

  /**
   * Analyze risk management aspects
   */
  private analyzeRiskManagement(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];
    const riskNodes = nodes.filter(node => node.data.type === 'risk');
    const actionNodes = nodes.filter(node => node.data.type === 'action');

    // Missing risk management
    if (riskNodes.length === 0 && actionNodes.length > 0) {
      suggestions.push({
        id: 'add-risk-management',
        title: 'Add Risk Management',
        description: 'Your strategy lacks proper risk management components like stop-loss and take-profit',
        category: ImprovementCategory.RISK_MANAGEMENT,
        priority: ImprovementPriority.CRITICAL,
        impact: ImpactLevel.HIGH,
        effort: EffortLevel.LOW,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Add Stop Loss Node',
              description: 'Add a stop-loss node to limit potential losses',
              nodeChanges: [{
                action: 'add',
                nodeType: 'risk',
                configuration: {
                  type: 'stop-loss',
                  stopLoss: 2,
                  maxRisk: 1
                },
                position: { x: 500, y: 200 }
              }]
            },
            {
              stepNumber: 2,
              action: 'Add Take Profit Node',
              description: 'Add a take-profit node to secure gains',
              nodeChanges: [{
                action: 'add',
                nodeType: 'risk',
                configuration: {
                  type: 'take-profit',
                  takeProfit: 4,
                  riskRewardRatio: 2
                },
                position: { x: 500, y: 300 }
              }]
            },
            {
              stepNumber: 3,
              action: 'Connect Risk Nodes',
              description: 'Connect risk management nodes to your trading actions'
            }
          ],
          estimatedTime: 5,
          difficulty: 'easy',
          requiredKnowledge: ['risk-management', 'stop-loss', 'take-profit']
        },
        expectedBenefit: 'Significantly reduced risk of large losses and better capital preservation',
        riskFactors: [],
        prerequisites: ['At least one trading action node'],
        confidence: 0.95
      });
    }

    // Inadequate position sizing
    const hasPositionSizing = actionNodes.some(node => 
      node.data.config?.quantity && 
      typeof node.data.config.quantity === 'string' && 
      node.data.config.quantity !== '100%'
    );

    if (!hasPositionSizing && actionNodes.length > 0) {
      suggestions.push({
        id: 'improve-position-sizing',
        title: 'Implement Dynamic Position Sizing',
        description: 'Using fixed position sizes may not be optimal for varying market conditions',
        category: ImprovementCategory.RISK_MANAGEMENT,
        priority: ImprovementPriority.HIGH,
        impact: ImpactLevel.MEDIUM,
        effort: EffortLevel.MEDIUM,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Modify Action Nodes',
              description: 'Update trading actions to use percentage-based position sizing',
              parameterChanges: actionNodes.map(node => ({
                nodeId: node.id,
                parameter: 'quantity',
                oldValue: node.data.config?.quantity || '100%',
                newValue: '25%',
                reasoning: 'Reduce position size to manage risk better'
              }))
            },
            {
              stepNumber: 2,
              action: 'Add Position Sizing Logic',
              description: 'Consider adding volatility-based position sizing'
            }
          ],
          estimatedTime: 10,
          difficulty: 'medium',
          requiredKnowledge: ['position-sizing', 'risk-management', 'volatility']
        },
        expectedBenefit: 'Better risk-adjusted returns and reduced portfolio volatility',
        riskFactors: ['May reduce absolute returns in favorable conditions'],
        prerequisites: ['Trading action nodes'],
        confidence: 0.8
      });
    }

    return suggestions;
  }

  /**
   * Analyze signal quality aspects
   */
  private analyzeSignalQuality(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];
    const indicators = nodes.filter(node => node.data.type === 'indicator');
    const conditions = nodes.filter(node => node.data.type === 'condition');

    // Single indicator strategy
    if (indicators.length === 1 && conditions.length > 0) {
      suggestions.push({
        id: 'add-confirmation-indicator',
        title: 'Add Confirmation Indicator',
        description: 'Single-indicator strategies often produce false signals. Adding a confirmation indicator can improve signal quality',
        category: ImprovementCategory.SIGNAL_QUALITY,
        priority: ImprovementPriority.MEDIUM,
        impact: ImpactLevel.MEDIUM,
        effort: EffortLevel.LOW,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Choose Complementary Indicator',
              description: 'Select an indicator that complements your existing one (e.g., RSI with moving average)',
              nodeChanges: [{
                action: 'add',
                nodeType: 'indicator',
                configuration: {
                  indicatorId: 'sma',
                  parameters: { period: 20 }
                },
                position: { x: indicators[0].position.x, y: indicators[0].position.y + 100 }
              }]
            },
            {
              stepNumber: 2,
              action: 'Add Confirmation Condition',
              description: 'Create a condition that requires both indicators to agree',
              nodeChanges: [{
                action: 'add',
                nodeType: 'condition',
                configuration: {
                  operator: 'and',
                  description: 'Both indicators must confirm'
                }
              }]
            }
          ],
          estimatedTime: 8,
          difficulty: 'easy',
          requiredKnowledge: ['technical-indicators', 'signal-confirmation']
        },
        expectedBenefit: 'Reduced false signals and improved win rate',
        riskFactors: ['May reduce number of trading opportunities'],
        prerequisites: ['At least one indicator and one condition'],
        confidence: 0.75
      });
    }

    // No trend filter
    const hasTrendFilter = indicators.some(node => 
      node.data.config?.indicatorId === 'sma' || 
      node.data.config?.indicatorId === 'ema'
    );

    if (!hasTrendFilter && indicators.length > 0) {
      suggestions.push({
        id: 'add-trend-filter',
        title: 'Add Trend Filter',
        description: 'Trading with the trend typically improves strategy performance',
        category: ImprovementCategory.SIGNAL_QUALITY,
        priority: ImprovementPriority.MEDIUM,
        impact: ImpactLevel.MEDIUM,
        effort: EffortLevel.LOW,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Add Moving Average',
              description: 'Add a longer-period moving average to identify trend direction',
              nodeChanges: [{
                action: 'add',
                nodeType: 'indicator',
                configuration: {
                  indicatorId: 'sma',
                  parameters: { period: 50 }
                }
              }]
            },
            {
              stepNumber: 2,
              action: 'Add Trend Condition',
              description: 'Only take trades in the direction of the trend'
            }
          ],
          estimatedTime: 6,
          difficulty: 'easy',
          requiredKnowledge: ['trend-analysis', 'moving-averages']
        },
        expectedBenefit: 'Higher win rate by trading with the trend',
        riskFactors: ['May miss counter-trend opportunities'],
        prerequisites: ['Existing indicators'],
        confidence: 0.7
      });
    }

    return suggestions;
  }

  /**
   * Analyze strategy structure
   */
  private analyzeStructure(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // Check for orphaned nodes
    const connectedNodeIds = new Set([
      ...edges.map(edge => edge.source),
      ...edges.map(edge => edge.target)
    ]);
    const orphanedNodes = nodes.filter(node => !connectedNodeIds.has(node.id));

    if (orphanedNodes.length > 0) {
      suggestions.push({
        id: 'remove-orphaned-nodes',
        title: 'Remove Disconnected Nodes',
        description: `${orphanedNodes.length} nodes are not connected to your strategy flow`,
        category: ImprovementCategory.STRUCTURE,
        priority: ImprovementPriority.LOW,
        impact: ImpactLevel.LOW,
        effort: EffortLevel.LOW,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Review Disconnected Nodes',
              description: 'Check if disconnected nodes serve a purpose'
            },
            {
              stepNumber: 2,
              action: 'Remove or Connect',
              description: 'Either connect the nodes to your strategy or remove them',
              nodeChanges: orphanedNodes.map(node => ({
                action: 'remove' as const,
                nodeType: node.data.type,
                nodeId: node.id,
                configuration: {}
              }))
            }
          ],
          estimatedTime: 3,
          difficulty: 'easy',
          requiredKnowledge: ['strategy-flow']
        },
        expectedBenefit: 'Cleaner strategy structure and reduced complexity',
        riskFactors: [],
        prerequisites: [],
        confidence: 0.9
      });
    }

    // Check for overly complex structure
    if (nodes.length > 15) {
      suggestions.push({
        id: 'simplify-strategy',
        title: 'Simplify Strategy Structure',
        description: 'Your strategy has many components which may lead to over-optimization',
        category: ImprovementCategory.STRUCTURE,
        priority: ImprovementPriority.MEDIUM,
        impact: ImpactLevel.MEDIUM,
        effort: EffortLevel.HIGH,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Identify Core Components',
              description: 'Determine which components are essential for your strategy'
            },
            {
              stepNumber: 2,
              action: 'Remove Redundant Elements',
              description: 'Remove indicators or conditions that provide similar information'
            },
            {
              stepNumber: 3,
              action: 'Test Simplified Version',
              description: 'Backtest the simplified strategy to ensure performance is maintained'
            }
          ],
          estimatedTime: 30,
          difficulty: 'hard',
          requiredKnowledge: ['strategy-design', 'backtesting', 'over-optimization']
        },
        expectedBenefit: 'More robust strategy with better out-of-sample performance',
        riskFactors: ['May reduce in-sample performance'],
        prerequisites: ['Backtesting capability'],
        confidence: 0.6
      });
    }

    return suggestions;
  }

  /**
   * Analyze parameter optimization opportunities
   */
  private analyzeParameters(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];
    const parametricNodes = nodes.filter(node => 
      node.data.config?.parameters && 
      Object.keys(node.data.config.parameters).length > 0
    );

    if (parametricNodes.length > 0) {
      // Check for default parameters
      const hasDefaultParams = parametricNodes.some(node => {
        const params = node.data.config?.parameters as Record<string, unknown>;
        if (node.data.config?.indicatorId === 'rsi') {
          return params.period === 14; // Default RSI period
        }
        if (node.data.config?.indicatorId === 'sma') {
          return params.period === 20; // Default SMA period
        }
        return false;
      });

      if (hasDefaultParams) {
        suggestions.push({
          id: 'optimize-parameters',
          title: 'Optimize Indicator Parameters',
          description: 'Your strategy uses default parameters which may not be optimal for current market conditions',
          category: ImprovementCategory.PARAMETERS,
          priority: ImprovementPriority.MEDIUM,
          impact: ImpactLevel.MEDIUM,
          effort: EffortLevel.MEDIUM,
          implementation: {
            steps: [
              {
                stepNumber: 1,
                action: 'Run Parameter Optimization',
                description: 'Use the built-in parameter optimizer to find better values'
              },
              {
                stepNumber: 2,
                action: 'Test Parameter Ranges',
                description: 'Test different parameter values to find optimal settings'
              },
              {
                stepNumber: 3,
                action: 'Validate Results',
                description: 'Ensure optimized parameters work on out-of-sample data'
              }
            ],
            estimatedTime: 20,
            difficulty: 'medium',
            requiredKnowledge: ['parameter-optimization', 'backtesting']
          },
          expectedBenefit: 'Improved strategy performance through better parameter selection',
          riskFactors: ['Risk of over-optimization to historical data'],
          prerequisites: ['Historical data for backtesting'],
          confidence: 0.7
        });
      }

      // Check for extreme parameters
      const extremeParams = this.findExtremeParameters(parametricNodes);
      if (extremeParams.length > 0) {
        suggestions.push({
          id: 'review-extreme-parameters',
          title: 'Review Extreme Parameter Values',
          description: 'Some parameters have extreme values that may not be robust',
          category: ImprovementCategory.PARAMETERS,
          priority: ImprovementPriority.LOW,
          impact: ImpactLevel.LOW,
          effort: EffortLevel.LOW,
          implementation: {
            steps: [
              {
                stepNumber: 1,
                action: 'Review Parameter Values',
                description: 'Check if extreme parameter values are justified'
              },
              {
                stepNumber: 2,
                action: 'Test Alternative Values',
                description: 'Try more moderate parameter values'
              }
            ],
            estimatedTime: 10,
            difficulty: 'easy',
            requiredKnowledge: ['parameter-selection']
          },
          expectedBenefit: 'More robust strategy performance',
          riskFactors: [],
          prerequisites: [],
          confidence: 0.6
        });
      }
    }

    return suggestions;
  }

  /**
   * Analyze performance optimization opportunities
   */
  private analyzePerformance(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // Check for missing time filters
    const timeFilters = nodes.filter(node => node.data.type === 'timing');
    if (timeFilters.length === 0) {
      suggestions.push({
        id: 'add-time-filter',
        title: 'Add Trading Time Filter',
        description: 'Restricting trading to specific hours can improve performance and reduce slippage',
        category: ImprovementCategory.PERFORMANCE,
        priority: ImprovementPriority.LOW,
        impact: ImpactLevel.LOW,
        effort: EffortLevel.LOW,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Add Time Filter Node',
              description: 'Add a timing node to restrict trading hours',
              nodeChanges: [{
                action: 'add',
                nodeType: 'timing',
                configuration: {
                  startTime: '09:00',
                  endTime: '16:00',
                  timezone: 'UTC'
                }
              }]
            },
            {
              stepNumber: 2,
              action: 'Connect to Conditions',
              description: 'Connect the time filter to your entry conditions'
            }
          ],
          estimatedTime: 5,
          difficulty: 'easy',
          requiredKnowledge: ['market-hours', 'time-filters']
        },
        expectedBenefit: 'Reduced slippage and improved execution quality',
        riskFactors: ['May reduce number of trading opportunities'],
        prerequisites: ['Entry conditions'],
        confidence: 0.6
      });
    }

    // Check for missing volume analysis
    const hasVolumeAnalysis = nodes.some(node => 
      node.data.config?.parameters && 
      'volume' in (node.data.config.parameters as Record<string, unknown>)
    );

    if (!hasVolumeAnalysis) {
      suggestions.push({
        id: 'add-volume-analysis',
        title: 'Consider Volume Analysis',
        description: 'Volume can provide additional confirmation for your trading signals',
        category: ImprovementCategory.PERFORMANCE,
        priority: ImprovementPriority.LOW,
        impact: ImpactLevel.LOW,
        effort: EffortLevel.MEDIUM,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Add Volume Indicator',
              description: 'Add a volume-based indicator or condition'
            },
            {
              stepNumber: 2,
              action: 'Create Volume Confirmation',
              description: 'Use volume to confirm your existing signals'
            }
          ],
          estimatedTime: 15,
          difficulty: 'medium',
          requiredKnowledge: ['volume-analysis', 'market-structure']
        },
        expectedBenefit: 'Better signal quality through volume confirmation',
        riskFactors: ['Increased strategy complexity'],
        prerequisites: ['Understanding of volume analysis'],
        confidence: 0.5
      });
    }

    return suggestions;
  }

  /**
   * Analyze strategy robustness
   */
  private analyzeRobustness(nodes: BuilderNode[], edges: BuilderEdge[]): ImprovementSuggestion[] {
    const suggestions: ImprovementSuggestion[] = [];

    // Check for single point of failure
    const criticalNodes = this.identifyCriticalNodes(nodes, edges);
    if (criticalNodes.length > 0) {
      suggestions.push({
        id: 'reduce-single-points-of-failure',
        title: 'Reduce Single Points of Failure',
        description: 'Your strategy relies heavily on a few critical components',
        category: ImprovementCategory.ROBUSTNESS,
        priority: ImprovementPriority.MEDIUM,
        impact: ImpactLevel.MEDIUM,
        effort: EffortLevel.HIGH,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Identify Critical Dependencies',
              description: 'Review which components are essential for strategy function'
            },
            {
              stepNumber: 2,
              action: 'Add Redundancy',
              description: 'Create alternative paths or backup signals'
            },
            {
              stepNumber: 3,
              action: 'Test Failure Scenarios',
              description: 'Test how strategy performs when critical components fail'
            }
          ],
          estimatedTime: 45,
          difficulty: 'hard',
          requiredKnowledge: ['system-design', 'robustness', 'failure-analysis']
        },
        expectedBenefit: 'More resilient strategy that performs better in various market conditions',
        riskFactors: ['Increased complexity'],
        prerequisites: ['Advanced strategy design knowledge'],
        confidence: 0.6
      });
    }

    // Check for market regime adaptability
    const hasRegimeDetection = nodes.some(node => 
      node.data.type === 'condition' && 
      node.data.config?.operator === 'regime_change'
    );

    if (!hasRegimeDetection && nodes.length > 5) {
      suggestions.push({
        id: 'add-regime-detection',
        title: 'Add Market Regime Detection',
        description: 'Adapting to different market conditions can improve robustness',
        category: ImprovementCategory.ROBUSTNESS,
        priority: ImprovementPriority.LOW,
        impact: ImpactLevel.MEDIUM,
        effort: EffortLevel.HIGH,
        implementation: {
          steps: [
            {
              stepNumber: 1,
              action: 'Implement Regime Detection',
              description: 'Add logic to detect trending vs ranging markets'
            },
            {
              stepNumber: 2,
              action: 'Adapt Strategy Parameters',
              description: 'Adjust strategy behavior based on market regime'
            }
          ],
          estimatedTime: 60,
          difficulty: 'hard',
          requiredKnowledge: ['market-regimes', 'adaptive-strategies', 'advanced-indicators']
        },
        expectedBenefit: 'Better performance across different market conditions',
        riskFactors: ['Significantly increased complexity', 'Risk of over-optimization'],
        prerequisites: ['Advanced trading knowledge'],
        confidence: 0.4
      });
    }

    return suggestions;
  }

  // Helper methods

  private findExtremeParameters(nodes: BuilderNode[]): Array<{nodeId: string, parameter: string, value: unknown}> {
    const extremeParams: Array<{nodeId: string, parameter: string, value: unknown}> = [];

    for (const node of nodes) {
      if (node.data.config?.parameters) {
        const params = node.data.config.parameters as Record<string, unknown>;
        
        // Check RSI parameters
        if (node.data.config.indicatorId === 'rsi') {
          if (typeof params.period === 'number' && (params.period < 5 || params.period > 50)) {
            extremeParams.push({
              nodeId: node.id,
              parameter: 'period',
              value: params.period
            });
          }
        }

        // Check SMA parameters
        if (node.data.config.indicatorId === 'sma') {
          if (typeof params.period === 'number' && (params.period < 5 || params.period > 200)) {
            extremeParams.push({
              nodeId: node.id,
              parameter: 'period',
              value: params.period
            });
          }
        }
      }
    }

    return extremeParams;
  }

  private identifyCriticalNodes(nodes: BuilderNode[], edges: BuilderEdge[]): BuilderNode[] {
    const criticalNodes: BuilderNode[] = [];
    
    // Nodes with many incoming or outgoing connections are critical
    const connectionCounts = new Map<string, number>();
    
    for (const edge of edges) {
      connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
      connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
    }

    for (const node of nodes) {
      const connections = connectionCounts.get(node.id) || 0;
      if (connections > 3) { // Arbitrary threshold for "critical"
        criticalNodes.push(node);
      }
    }

    return criticalNodes;
  }
}