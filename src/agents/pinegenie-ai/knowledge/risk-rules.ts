/**
 * Risk Management Rule Engine
 * 
 * Comprehensive system for risk management rules, position sizing,
 * and risk assessment for different trading strategies.
 */

import { StrategyType } from '../types/nlp-types';
import { AILogger } from '../core/logger';

export interface RiskRule {
  id: string;
  name: string;
  description: string;
  category: 'position_sizing' | 'stop_loss' | 'take_profit' | 'exposure' | 'correlation' | 'drawdown';
  applicableStrategies: StrategyType[];
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  conditions: RiskCondition[];
  actions: RiskAction[];
  priority: number; // 1-10, higher = more important
  enabled: boolean;
}

export interface RiskCondition {
  type: 'account_balance' | 'position_size' | 'drawdown' | 'volatility' | 'correlation' | 'time' | 'market_condition';
  operator: 'greater_than' | 'less_than' | 'equal_to' | 'between' | 'not_equal_to';
  value: number | string | [number, number];
  description: string;
}

export interface RiskAction {
  type: 'limit_position_size' | 'set_stop_loss' | 'set_take_profit' | 'reduce_exposure' | 'close_positions' | 'alert' | 'block_trades';
  parameters: Record<string, unknown>;
  description: string;
}

export interface RiskAssessment {
  overallRisk: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  riskScore: number; // 0-100
  riskFactors: RiskFactor[];
  recommendations: RiskRecommendation[];
  appliedRules: string[];
  warnings: string[];
}

export interface RiskFactor {
  id: string;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: number; // 0-100
  description: string;
  mitigation?: string;
}

export interface RiskRecommendation {
  id: string;
  type: 'position_sizing' | 'stop_loss' | 'diversification' | 'timing' | 'strategy_adjustment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  implementation: string;
  expectedImpact: string;
}

export interface PositionSizingParameters {
  accountBalance: number;
  riskPerTrade: number; // percentage
  stopLossDistance: number; // percentage
  volatility: number; // ATR or similar
  confidence: number; // 0-1
  correlationFactor: number; // 0-1
}

export const RISK_MANAGEMENT_RULES: RiskRule[] = [
  {
    id: 'max_risk_per_trade',
    name: 'Maximum Risk Per Trade',
    description: 'Limit the maximum risk per individual trade',
    category: 'position_sizing',
    applicableStrategies: [StrategyType.TREND_FOLLOWING, StrategyType.MEAN_REVERSION, StrategyType.BREAKOUT, StrategyType.MOMENTUM, StrategyType.SCALPING],
    riskLevel: 'conservative',
    conditions: [
      {
        type: 'position_size',
        operator: 'greater_than',
        value: 2, // 2% of account
        description: 'Position risk exceeds 2% of account'
      }
    ],
    actions: [
      {
        type: 'limit_position_size',
        parameters: { maxRisk: 2 },
        description: 'Reduce position size to limit risk to 2%'
      }
    ],
    priority: 10,
    enabled: true
  },
  {
    id: 'stop_loss_mandatory',
    name: 'Mandatory Stop Loss',
    description: 'Ensure all positions have stop loss orders',
    category: 'stop_loss',
    applicableStrategies: [StrategyType.TREND_FOLLOWING, StrategyType.MEAN_REVERSION, StrategyType.BREAKOUT, StrategyType.MOMENTUM, StrategyType.SCALPING],
    riskLevel: 'conservative',
    conditions: [
      {
        type: 'position_size',
        operator: 'greater_than',
        value: 0,
        description: 'Any open position'
      }
    ],
    actions: [
      {
        type: 'set_stop_loss',
        parameters: { 
          method: 'atr_based',
          multiplier: 2,
          maxLoss: 3 // 3% max loss
        },
        description: 'Set stop loss based on ATR or 3% max loss'
      }
    ],
    priority: 9,
    enabled: true
  },
  {
    id: 'max_portfolio_exposure',
    name: 'Maximum Portfolio Exposure',
    description: 'Limit total portfolio exposure to prevent overleverage',
    category: 'exposure',
    applicableStrategies: [StrategyType.TREND_FOLLOWING, StrategyType.MEAN_REVERSION, StrategyType.BREAKOUT, StrategyType.MOMENTUM],
    riskLevel: 'moderate',
    conditions: [
      {
        type: 'position_size',
        operator: 'greater_than',
        value: 50, // 50% of account
        description: 'Total portfolio exposure exceeds 50%'
      }
    ],
    actions: [
      {
        type: 'reduce_exposure',
        parameters: { targetExposure: 50 },
        description: 'Reduce total exposure to 50% of account'
      }
    ],
    priority: 8,
    enabled: true
  },
  {
    id: 'correlation_limit',
    name: 'Correlation Limit',
    description: 'Prevent excessive correlation between positions',
    category: 'correlation',
    applicableStrategies: [StrategyType.TREND_FOLLOWING, StrategyType.MEAN_REVERSION, StrategyType.BREAKOUT],
    riskLevel: 'moderate',
    conditions: [
      {
        type: 'correlation',
        operator: 'greater_than',
        value: 0.7,
        description: 'Position correlation exceeds 70%'
      }
    ],
    actions: [
      {
        type: 'limit_position_size',
        parameters: { correlationAdjustment: 0.5 },
        description: 'Reduce position sizes for highly correlated trades'
      }
    ],
    priority: 7,
    enabled: true
  },
  {
    id: 'drawdown_protection',
    name: 'Drawdown Protection',
    description: 'Reduce risk during periods of high drawdown',
    category: 'drawdown',
    applicableStrategies: [StrategyType.TREND_FOLLOWING, StrategyType.MEAN_REVERSION, StrategyType.BREAKOUT, StrategyType.MOMENTUM, StrategyType.SCALPING],
    riskLevel: 'conservative',
    conditions: [
      {
        type: 'drawdown',
        operator: 'greater_than',
        value: 10, // 10% drawdown
        description: 'Account drawdown exceeds 10%'
      }
    ],
    actions: [
      {
        type: 'limit_position_size',
        parameters: { riskReduction: 0.5 },
        description: 'Reduce position sizes by 50% during drawdown'
      }
    ],
    priority: 9,
    enabled: true
  },
  {
    id: 'volatility_adjustment',
    name: 'Volatility-Based Position Sizing',
    description: 'Adjust position sizes based on market volatility',
    category: 'position_sizing',
    applicableStrategies: [StrategyType.TREND_FOLLOWING, StrategyType.BREAKOUT, StrategyType.MOMENTUM],
    riskLevel: 'moderate',
    conditions: [
      {
        type: 'volatility',
        operator: 'greater_than',
        value: 1.5, // 1.5x normal volatility
        description: 'Market volatility is elevated'
      }
    ],
    actions: [
      {
        type: 'limit_position_size',
        parameters: { volatilityAdjustment: true },
        description: 'Reduce position size based on volatility'
      }
    ],
    priority: 6,
    enabled: true
  },
  {
    id: 'scalping_time_limit',
    name: 'Scalping Time Limit',
    description: 'Limit scalping trades to specific time windows',
    category: 'time',
    applicableStrategies: [StrategyType.SCALPING],
    riskLevel: 'moderate',
    conditions: [
      {
        type: 'time',
        operator: 'between',
        value: ['09:30', '16:00'], // Market hours
        description: 'Outside of optimal scalping hours'
      }
    ],
    actions: [
      {
        type: 'block_trades',
        parameters: { reason: 'outside_optimal_hours' },
        description: 'Block scalping trades outside market hours'
      }
    ],
    priority: 5,
    enabled: true
  },
  {
    id: 'mean_reversion_trend_filter',
    name: 'Mean Reversion Trend Filter',
    description: 'Reduce mean reversion position sizes in strong trends',
    category: 'position_sizing',
    applicableStrategies: [StrategyType.MEAN_REVERSION],
    riskLevel: 'moderate',
    conditions: [
      {
        type: 'market_condition',
        operator: 'equal_to',
        value: 'strong_trend',
        description: 'Market is in a strong trending phase'
      }
    ],
    actions: [
      {
        type: 'limit_position_size',
        parameters: { trendAdjustment: 0.7 },
        description: 'Reduce mean reversion positions by 30% in trends'
      }
    ],
    priority: 6,
    enabled: true
  }
];

export class RiskManagementEngine {
  private rules: Map<string, RiskRule>;
  private logger: AILogger;

  constructor() {
    this.rules = new Map();
    this.logger = AILogger.getInstance();
    this.initializeRules();
  }

  private initializeRules(): void {
    RISK_MANAGEMENT_RULES.forEach(rule => {
      this.rules.set(rule.id, rule);
    });

    this.logger.info('RiskManagementEngine', 'Risk management engine initialized', {
      totalRules: this.rules.size,
      enabledRules: Array.from(this.rules.values()).filter(rule => rule.enabled).length
    });
  }

  /**
   * Assess risk for a trading strategy
   */
  public assessRisk(
    strategyType: StrategyType,
    parameters: {
      accountBalance: number;
      proposedPositionSize: number;
      stopLossDistance?: number;
      currentDrawdown?: number;
      marketVolatility?: number;
      existingPositions?: number;
      correlationLevel?: number;
    }
  ): RiskAssessment {
    const startTime = performance.now();
    
    this.logger.debug('RiskManagementEngine', 'Starting risk assessment', {
      strategyType,
      accountBalance: parameters.accountBalance,
      proposedPositionSize: parameters.proposedPositionSize
    });

    const riskFactors: RiskFactor[] = [];
    const recommendations: RiskRecommendation[] = [];
    const appliedRules: string[] = [];
    const warnings: string[] = [];

    // Get applicable rules for this strategy type
    const applicableRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled && rule.applicableStrategies.includes(strategyType))
      .sort((a, b) => b.priority - a.priority);

    // Evaluate each rule
    for (const rule of applicableRules) {
      const ruleResult = this.evaluateRule(rule, parameters);
      
      if (ruleResult.triggered) {
        appliedRules.push(rule.id);
        
        if (ruleResult.riskFactor) {
          riskFactors.push(ruleResult.riskFactor);
        }
        
        if (ruleResult.recommendation) {
          recommendations.push(ruleResult.recommendation);
        }
        
        if (ruleResult.warning) {
          warnings.push(ruleResult.warning);
        }
      }
    }

    // Calculate overall risk score
    const riskScore = this.calculateRiskScore(riskFactors, parameters);
    const overallRisk = this.categorizeRisk(riskScore);

    // Add general recommendations if needed
    this.addGeneralRecommendations(recommendations, parameters, strategyType);

    const processingTime = performance.now() - startTime;
    
    this.logger.debug('RiskManagementEngine', 'Risk assessment completed', {
      overallRisk,
      riskScore,
      appliedRules: appliedRules.length,
      riskFactors: riskFactors.length,
      processingTime: `${processingTime.toFixed(2)}ms`
    });

    return {
      overallRisk,
      riskScore,
      riskFactors,
      recommendations,
      appliedRules,
      warnings
    };
  }

  /**
   * Calculate optimal position size
   */
  public calculatePositionSize(parameters: PositionSizingParameters): {
    recommendedSize: number;
    maxSize: number;
    reasoning: string[];
    adjustments: string[];
  } {
    const reasoning: string[] = [];
    const adjustments: string[] = [];

    // Base position size using Kelly Criterion simplified
    let baseSize = (parameters.riskPerTrade / 100) * parameters.accountBalance;
    reasoning.push(`Base size: ${parameters.riskPerTrade}% of account = $${baseSize.toFixed(2)}`);

    // Adjust for stop loss distance
    if (parameters.stopLossDistance > 0) {
      const stopAdjustedSize = baseSize / (parameters.stopLossDistance / 100);
      if (stopAdjustedSize < baseSize) {
        baseSize = stopAdjustedSize;
        adjustments.push(`Reduced for ${parameters.stopLossDistance}% stop loss`);
      }
    }

    // Adjust for volatility
    if (parameters.volatility > 1.5) {
      const volatilityAdjustment = 1 / Math.sqrt(parameters.volatility);
      baseSize *= volatilityAdjustment;
      adjustments.push(`Reduced by ${((1 - volatilityAdjustment) * 100).toFixed(1)}% for high volatility`);
    }

    // Adjust for confidence
    if (parameters.confidence < 0.8) {
      const confidenceAdjustment = parameters.confidence;
      baseSize *= confidenceAdjustment;
      adjustments.push(`Reduced by ${((1 - confidenceAdjustment) * 100).toFixed(1)}% for low confidence`);
    }

    // Adjust for correlation
    if (parameters.correlationFactor > 0.5) {
      const correlationAdjustment = 1 - (parameters.correlationFactor - 0.5);
      baseSize *= correlationAdjustment;
      adjustments.push(`Reduced by ${((1 - correlationAdjustment) * 100).toFixed(1)}% for correlation`);
    }

    // Set maximum size limits
    const maxSize = parameters.accountBalance * 0.1; // Never more than 10% of account
    const recommendedSize = Math.min(baseSize, maxSize);

    if (recommendedSize < baseSize) {
      adjustments.push(`Capped at 10% of account maximum`);
    }

    return {
      recommendedSize,
      maxSize,
      reasoning,
      adjustments
    };
  }

  /**
   * Get risk rules for strategy type
   */
  public getRulesForStrategy(strategyType: StrategyType): RiskRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.applicableStrategies.includes(strategyType))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Enable or disable a risk rule
   */
  public setRuleEnabled(ruleId: string, enabled: boolean): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      this.logger.info('RiskManagementEngine', `Rule ${enabled ? 'enabled' : 'disabled'}`, {
        ruleId,
        ruleName: rule.name
      });
      return true;
    }
    return false;
  }

  /**
   * Add custom risk rule
   */
  public addCustomRule(rule: RiskRule): void {
    this.rules.set(rule.id, rule);
    this.logger.info('RiskManagementEngine', 'Custom rule added', {
      ruleId: rule.id,
      ruleName: rule.name
    });
  }

  /**
   * Get risk management statistics
   */
  public getStatistics(): {
    totalRules: number;
    enabledRules: number;
    rulesByCategory: Record<string, number>;
    rulesByRiskLevel: Record<string, number>;
  } {
    const rules = Array.from(this.rules.values());
    const enabledRules = rules.filter(rule => rule.enabled);

    const rulesByCategory: Record<string, number> = {};
    const rulesByRiskLevel: Record<string, number> = {};

    rules.forEach(rule => {
      rulesByCategory[rule.category] = (rulesByCategory[rule.category] || 0) + 1;
      rulesByRiskLevel[rule.riskLevel] = (rulesByRiskLevel[rule.riskLevel] || 0) + 1;
    });

    return {
      totalRules: rules.length,
      enabledRules: enabledRules.length,
      rulesByCategory,
      rulesByRiskLevel
    };
  }

  // Private helper methods

  private evaluateRule(rule: RiskRule, parameters: any): {
    triggered: boolean;
    riskFactor?: RiskFactor;
    recommendation?: RiskRecommendation;
    warning?: string;
  } {
    // Check if rule conditions are met
    const conditionsMet = rule.conditions.every(condition => 
      this.evaluateCondition(condition, parameters)
    );

    if (!conditionsMet) {
      return { triggered: false };
    }

    // Rule is triggered, create risk factor and recommendation
    const riskFactor: RiskFactor = {
      id: rule.id,
      name: rule.name,
      severity: this.mapRiskLevelToSeverity(rule.riskLevel),
      impact: rule.priority * 10,
      description: rule.description,
      mitigation: rule.actions[0]?.description
    };

    const recommendation: RiskRecommendation = {
      id: `rec_${rule.id}`,
      type: rule.category as any,
      priority: rule.priority > 7 ? 'high' : rule.priority > 4 ? 'medium' : 'low',
      description: rule.description,
      implementation: rule.actions[0]?.description || 'Apply risk management action',
      expectedImpact: `Reduce risk by following ${rule.name}`
    };

    const warning = rule.priority > 8 ? `High priority risk rule triggered: ${rule.name}` : undefined;

    return {
      triggered: true,
      riskFactor,
      recommendation,
      warning
    };
  }

  private evaluateCondition(condition: RiskCondition, parameters: any): boolean {
    const value = this.getParameterValue(condition.type, parameters);
    
    if (value === undefined || value === null) {
      return false;
    }

    switch (condition.operator) {
      case 'greater_than':
        return Number(value) > Number(condition.value);
      case 'less_than':
        return Number(value) < Number(condition.value);
      case 'equal_to':
        return value === condition.value;
      case 'not_equal_to':
        return value !== condition.value;
      case 'between':
        if (Array.isArray(condition.value) && condition.value.length === 2) {
          const numValue = Number(value);
          return numValue >= condition.value[0] && numValue <= condition.value[1];
        }
        return false;
      default:
        return false;
    }
  }

  private getParameterValue(type: string, parameters: any): unknown {
    switch (type) {
      case 'account_balance':
        return parameters.accountBalance;
      case 'position_size':
        return parameters.proposedPositionSize;
      case 'drawdown':
        return parameters.currentDrawdown || 0;
      case 'volatility':
        return parameters.marketVolatility || 1;
      case 'correlation':
        return parameters.correlationLevel || 0;
      case 'time':
        return new Date().toTimeString().slice(0, 5); // HH:MM format
      case 'market_condition':
        return parameters.marketCondition || 'normal';
      default:
        return undefined;
    }
  }

  private calculateRiskScore(riskFactors: RiskFactor[], parameters: any): number {
    if (riskFactors.length === 0) {
      return 20; // Base low risk score
    }

    // Weight risk factors by severity and impact
    let totalScore = 0;
    let totalWeight = 0;

    riskFactors.forEach(factor => {
      const severityWeight = {
        low: 1,
        medium: 2,
        high: 3,
        critical: 4
      }[factor.severity];

      const score = (factor.impact * severityWeight) / 4;
      totalScore += score;
      totalWeight += severityWeight;
    });

    const averageScore = totalWeight > 0 ? totalScore / totalWeight : 20;
    
    // Cap at 100
    return Math.min(averageScore, 100);
  }

  private categorizeRisk(riskScore: number): 'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
    if (riskScore <= 20) return 'very_low';
    if (riskScore <= 40) return 'low';
    if (riskScore <= 60) return 'medium';
    if (riskScore <= 80) return 'high';
    return 'very_high';
  }

  private mapRiskLevelToSeverity(riskLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (riskLevel) {
      case 'conservative': return 'low';
      case 'moderate': return 'medium';
      case 'aggressive': return 'high';
      default: return 'medium';
    }
  }

  private addGeneralRecommendations(
    recommendations: RiskRecommendation[],
    parameters: any,
    strategyType: StrategyType
  ): void {
    // Add general recommendations based on strategy type and parameters
    if (parameters.stopLossDistance === undefined) {
      recommendations.push({
        id: 'general_stop_loss',
        type: 'stop_loss',
        priority: 'high',
        description: 'Add stop loss protection',
        implementation: 'Set stop loss at 2-3% below entry or based on ATR',
        expectedImpact: 'Limit maximum loss per trade'
      });
    }

    if (parameters.proposedPositionSize > parameters.accountBalance * 0.05) {
      recommendations.push({
        id: 'general_position_size',
        type: 'position_sizing',
        priority: 'medium',
        description: 'Consider reducing position size',
        implementation: 'Limit individual positions to 2-5% of account',
        expectedImpact: 'Reduce portfolio concentration risk'
      });
    }
  }
}