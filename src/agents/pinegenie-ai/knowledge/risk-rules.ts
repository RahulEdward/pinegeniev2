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
  type: 'position_sizing' | 'stop_loss' | 'diversification' | 'timing' | 'strategy_adjustment' | 'risk_reward' | 'component_addition';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  implementation: string;
  expectedImpact: string;
  nodeType?: string; // For component addition recommendations
  parameters?: Record<string, unknown>; // Suggested node parameters
}

export interface PositionSizingParameters {
  accountBalance: number;
  riskPerTrade: number; // percentage
  stopLossDistance: number; // percentage
  volatility: number; // ATR or similar
  confidence: number; // 0-1
  correlationFactor: number; // 0-1
}

export interface RiskRewardRatio {
  ratio: number; // e.g., 2.0 for 2:1 risk-reward
  riskAmount: number;
  rewardAmount: number;
  probability: number; // 0-1
  expectedValue: number;
  recommendation: 'excellent' | 'good' | 'acceptable' | 'poor' | 'unacceptable';
}

export interface StrategyRiskProfile {
  strategyType: StrategyType;
  baseRiskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  requiredComponents: string[]; // Required node types for risk management
  recommendedComponents: string[]; // Recommended additional components
  riskFactors: string[]; // Known risk factors for this strategy type
  mitigationStrategies: string[]; // Ways to reduce risk
  optimalRiskReward: number; // Optimal risk-reward ratio for this strategy
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

export const STRATEGY_RISK_PROFILES: Record<StrategyType, StrategyRiskProfile> = {
  [StrategyType.TREND_FOLLOWING]: {
    strategyType: StrategyType.TREND_FOLLOWING,
    baseRiskLevel: 'medium',
    requiredComponents: ['data_source', 'trend_indicator', 'entry_condition', 'exit_condition', 'stop_loss'],
    recommendedComponents: ['take_profit', 'position_sizing', 'trend_filter', 'volume_confirmation'],
    riskFactors: ['trend_reversal', 'whipsaws', 'late_entries', 'extended_drawdowns'],
    mitigationStrategies: ['multiple_timeframe_confirmation', 'volume_validation', 'proper_stop_placement', 'position_sizing'],
    optimalRiskReward: 2.5
  },
  [StrategyType.MEAN_REVERSION]: {
    strategyType: StrategyType.MEAN_REVERSION,
    baseRiskLevel: 'high',
    requiredComponents: ['data_source', 'oscillator', 'overbought_condition', 'oversold_condition', 'stop_loss'],
    recommendedComponents: ['take_profit', 'trend_filter', 'volume_confirmation', 'time_filter'],
    riskFactors: ['trending_markets', 'false_reversals', 'extended_moves', 'low_liquidity'],
    mitigationStrategies: ['trend_filtering', 'multiple_confirmation', 'tight_stops', 'time_based_exits'],
    optimalRiskReward: 1.8
  },
  [StrategyType.BREAKOUT]: {
    strategyType: StrategyType.BREAKOUT,
    baseRiskLevel: 'high',
    requiredComponents: ['data_source', 'support_resistance', 'breakout_condition', 'volume_confirmation', 'stop_loss'],
    recommendedComponents: ['take_profit', 'false_breakout_filter', 'momentum_confirmation', 'time_filter'],
    riskFactors: ['false_breakouts', 'low_volume_breaks', 'immediate_reversals', 'gap_risk'],
    mitigationStrategies: ['volume_confirmation', 'momentum_validation', 'proper_stop_placement', 'position_scaling'],
    optimalRiskReward: 3.0
  },
  [StrategyType.MOMENTUM]: {
    strategyType: StrategyType.MOMENTUM,
    baseRiskLevel: 'medium',
    requiredComponents: ['data_source', 'momentum_indicator', 'entry_condition', 'exit_condition', 'stop_loss'],
    recommendedComponents: ['take_profit', 'trend_confirmation', 'volume_validation', 'overbought_protection'],
    riskFactors: ['momentum_exhaustion', 'sudden_reversals', 'overextension', 'news_events'],
    mitigationStrategies: ['momentum_divergence_check', 'profit_taking_levels', 'trailing_stops', 'position_scaling'],
    optimalRiskReward: 2.2
  },
  [StrategyType.SCALPING]: {
    strategyType: StrategyType.SCALPING,
    baseRiskLevel: 'very_high',
    requiredComponents: ['data_source', 'fast_indicator', 'entry_condition', 'quick_exit', 'tight_stop'],
    recommendedComponents: ['spread_filter', 'time_filter', 'volume_filter', 'news_filter'],
    riskFactors: ['spread_widening', 'slippage', 'execution_delays', 'overtrading'],
    mitigationStrategies: ['tight_risk_control', 'execution_optimization', 'spread_monitoring', 'session_filtering'],
    optimalRiskReward: 1.2
  },
  [StrategyType.ARBITRAGE]: {
    strategyType: StrategyType.ARBITRAGE,
    baseRiskLevel: 'low',
    requiredComponents: ['data_source', 'price_comparison', 'execution_speed', 'risk_limits'],
    recommendedComponents: ['latency_monitoring', 'spread_filter', 'position_sizing', 'execution_optimization'],
    riskFactors: ['execution_delays', 'spread_compression', 'liquidity_gaps', 'technology_failures'],
    mitigationStrategies: ['fast_execution', 'spread_monitoring', 'redundant_systems', 'position_limits'],
    optimalRiskReward: 1.1
  },
  [StrategyType.CUSTOM]: {
    strategyType: StrategyType.CUSTOM,
    baseRiskLevel: 'medium',
    requiredComponents: ['data_source', 'entry_condition', 'exit_condition', 'stop_loss'],
    recommendedComponents: ['take_profit', 'position_sizing', 'risk_management', 'validation'],
    riskFactors: ['unknown_behavior', 'untested_logic', 'parameter_sensitivity', 'market_regime_changes'],
    mitigationStrategies: ['thorough_backtesting', 'gradual_position_sizing', 'continuous_monitoring', 'regular_review'],
    optimalRiskReward: 2.0
  }
};

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
   * Calculate risk-reward ratio for a strategy
   */
  public calculateRiskRewardRatio(
    entryPrice: number,
    stopLoss: number,
    takeProfit: number,
    probability?: number
  ): RiskRewardRatio {
    const riskAmount = Math.abs(entryPrice - stopLoss);
    const rewardAmount = Math.abs(takeProfit - entryPrice);
    const ratio = rewardAmount / riskAmount;
    
    const estimatedProbability = probability || this.estimateProbability(ratio);
    const expectedValue = (rewardAmount * estimatedProbability) - (riskAmount * (1 - estimatedProbability));
    
    let recommendation: RiskRewardRatio['recommendation'];
    if (ratio >= 3.0) recommendation = 'excellent';
    else if (ratio >= 2.0) recommendation = 'good';
    else if (ratio >= 1.5) recommendation = 'acceptable';
    else if (ratio >= 1.0) recommendation = 'poor';
    else recommendation = 'unacceptable';

    this.logger.debug('RiskManagementEngine', 'Risk-reward ratio calculated', {
      ratio: ratio.toFixed(2),
      riskAmount: riskAmount.toFixed(4),
      rewardAmount: rewardAmount.toFixed(4),
      recommendation
    });

    return {
      ratio,
      riskAmount,
      rewardAmount,
      probability: estimatedProbability,
      expectedValue,
      recommendation
    };
  }

  /**
   * Suggest risk management components for a strategy
   */
  public suggestRiskComponents(
    strategyType: StrategyType,
    existingComponents: string[]
  ): RiskRecommendation[] {
    const profile = STRATEGY_RISK_PROFILES[strategyType];
    const recommendations: RiskRecommendation[] = [];

    // Check for missing required components
    profile.requiredComponents.forEach(component => {
      if (!existingComponents.includes(component)) {
        recommendations.push({
          id: `missing_${component}`,
          type: 'component_addition',
          priority: 'critical',
          description: `Missing required component: ${component}`,
          implementation: `Add ${component} node to ensure proper risk management`,
          expectedImpact: 'Essential for strategy safety and compliance',
          nodeType: component,
          parameters: this.getDefaultParametersForComponent(component, strategyType)
        });
      }
    });

    // Check for missing recommended components
    profile.recommendedComponents.forEach(component => {
      if (!existingComponents.includes(component)) {
        recommendations.push({
          id: `recommended_${component}`,
          type: 'component_addition',
          priority: 'medium',
          description: `Recommended component: ${component}`,
          implementation: `Consider adding ${component} node to improve strategy performance`,
          expectedImpact: 'Enhances strategy robustness and performance',
          nodeType: component,
          parameters: this.getDefaultParametersForComponent(component, strategyType)
        });
      }
    });

    // Add strategy-specific risk management recommendations
    this.addStrategySpecificRecommendations(recommendations, strategyType, existingComponents);

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get risk profile for strategy type
   */
  public getStrategyRiskProfile(strategyType: StrategyType): StrategyRiskProfile {
    return STRATEGY_RISK_PROFILES[strategyType];
  }

  /**
   * Assess strategy completeness from risk perspective
   */
  public assessStrategyCompleteness(
    strategyType: StrategyType,
    components: string[]
  ): {
    completeness: number; // 0-100
    missingRequired: string[];
    missingRecommended: string[];
    riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    warnings: string[];
  } {
    const profile = STRATEGY_RISK_PROFILES[strategyType];
    
    const missingRequired = profile.requiredComponents.filter(
      component => !components.includes(component)
    );
    
    const missingRecommended = profile.recommendedComponents.filter(
      component => !components.includes(component)
    );

    // Calculate completeness score
    const requiredScore = ((profile.requiredComponents.length - missingRequired.length) / profile.requiredComponents.length) * 70;
    const recommendedScore = ((profile.recommendedComponents.length - missingRecommended.length) / profile.recommendedComponents.length) * 30;
    const completeness = Math.round(requiredScore + recommendedScore);

    // Determine risk level
    let riskLevel = profile.baseRiskLevel;
    if (missingRequired.length > 0) {
      // Increase risk level if required components are missing
      const riskLevels = ['very_low', 'low', 'medium', 'high', 'very_high'];
      const currentIndex = riskLevels.indexOf(riskLevel);
      const newIndex = Math.min(currentIndex + missingRequired.length, riskLevels.length - 1);
      riskLevel = riskLevels[newIndex] as any;
    }

    // Generate warnings
    const warnings: string[] = [];
    if (missingRequired.length > 0) {
      warnings.push(`Missing ${missingRequired.length} required risk management components`);
    }
    if (missingRecommended.length > 2) {
      warnings.push(`Strategy lacks several recommended components for optimal performance`);
    }
    if (completeness < 50) {
      warnings.push('Strategy completeness is below acceptable threshold');
    }

    this.logger.debug('RiskManagementEngine', 'Strategy completeness assessed', {
      strategyType,
      completeness,
      riskLevel,
      missingRequired: missingRequired.length,
      missingRecommended: missingRecommended.length
    });

    return {
      completeness,
      missingRequired,
      missingRecommended,
      riskLevel,
      warnings
    };
  }

  /**
   * Generate risk management warnings
   */
  public generateRiskWarnings(
    strategyType: StrategyType,
    parameters: any
  ): string[] {
    const warnings: string[] = [];
    const profile = STRATEGY_RISK_PROFILES[strategyType];

    // Check for strategy-specific risk factors
    profile.riskFactors.forEach(riskFactor => {
      const warning = this.checkRiskFactor(riskFactor, parameters, strategyType);
      if (warning) {
        warnings.push(warning);
      }
    });

    // Check position sizing
    if (parameters.proposedPositionSize > parameters.accountBalance * 0.1) {
      warnings.push('Position size exceeds 10% of account - consider reducing for better risk management');
    }

    // Check risk-reward ratio
    if (parameters.stopLoss && parameters.takeProfit && parameters.entryPrice) {
      const rrRatio = this.calculateRiskRewardRatio(
        parameters.entryPrice,
        parameters.stopLoss,
        parameters.takeProfit
      );
      
      if (rrRatio.recommendation === 'poor' || rrRatio.recommendation === 'unacceptable') {
        warnings.push(`Risk-reward ratio of ${rrRatio.ratio.toFixed(2)}:1 is ${rrRatio.recommendation} - consider adjusting targets`);
      }
    }

    // Check for missing stop loss
    if (!parameters.stopLoss) {
      warnings.push('No stop loss defined - this significantly increases risk exposure');
    }

    return warnings;
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
    let baseScore = 20; // Base low risk score

    if (riskFactors.length === 0) {
      return baseScore;
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

      const score = factor.impact * severityWeight;
      totalScore += score;
      totalWeight += severityWeight;
    });

    // Calculate weighted average and add to base score
    const weightedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const finalScore = baseScore + weightedScore;
    
    // Additional risk factors based on parameters
    let additionalRisk = 0;
    
    // High position size risk
    if (parameters.proposedPositionSize && parameters.accountBalance) {
      const positionRatio = parameters.proposedPositionSize / parameters.accountBalance;
      if (positionRatio > 0.2) additionalRisk += 30; // 20%+ of account
      else if (positionRatio > 0.1) additionalRisk += 20; // 10%+ of account
      else if (positionRatio > 0.05) additionalRisk += 10; // 5%+ of account
    }
    
    // High drawdown risk
    if (parameters.currentDrawdown && parameters.currentDrawdown > 10) {
      additionalRisk += 25;
    }
    
    // High volatility risk
    if (parameters.marketVolatility && parameters.marketVolatility > 2) {
      additionalRisk += 15;
    }
    
    // Cap at 100
    return Math.min(finalScore + additionalRisk, 100);
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

  private estimateProbability(riskRewardRatio: number): number {
    // Simple probability estimation based on risk-reward ratio
    // Higher risk-reward ratios typically have lower probability of success
    if (riskRewardRatio >= 3.0) return 0.35;
    if (riskRewardRatio >= 2.5) return 0.40;
    if (riskRewardRatio >= 2.0) return 0.45;
    if (riskRewardRatio >= 1.5) return 0.55;
    if (riskRewardRatio >= 1.0) return 0.65;
    return 0.75;
  }

  private getDefaultParametersForComponent(component: string, strategyType: StrategyType): Record<string, unknown> {
    const profile = STRATEGY_RISK_PROFILES[strategyType];
    
    switch (component) {
      case 'stop_loss':
        return {
          type: 'percentage',
          value: strategyType === StrategyType.SCALPING ? 0.5 : 2.0,
          method: 'atr_based'
        };
      case 'take_profit':
        return {
          type: 'risk_reward',
          ratio: profile.optimalRiskReward,
          method: 'fixed_ratio'
        };
      case 'position_sizing':
        return {
          method: 'fixed_percentage',
          riskPerTrade: strategyType === StrategyType.SCALPING ? 0.5 : 2.0,
          maxPositionSize: 10
        };
      case 'trend_filter':
        return {
          indicator: 'sma',
          period: 200,
          method: 'price_above_below'
        };
      case 'volume_confirmation':
        return {
          indicator: 'volume_sma',
          period: 20,
          threshold: 1.5
        };
      case 'time_filter':
        return {
          startTime: '09:30',
          endTime: '16:00',
          timezone: 'America/New_York'
        };
      default:
        return {};
    }
  }

  private addStrategySpecificRecommendations(
    recommendations: RiskRecommendation[],
    strategyType: StrategyType,
    existingComponents: string[]
  ): void {
    const profile = STRATEGY_RISK_PROFILES[strategyType];

    switch (strategyType) {
      case StrategyType.TREND_FOLLOWING:
        if (!existingComponents.includes('trend_filter')) {
          recommendations.push({
            id: 'trend_multiple_timeframe',
            type: 'strategy_adjustment',
            priority: 'high',
            description: 'Add multiple timeframe trend confirmation',
            implementation: 'Use higher timeframe trend filter to avoid counter-trend trades',
            expectedImpact: 'Reduces false signals and improves win rate',
            nodeType: 'trend_filter'
          });
        }
        break;

      case StrategyType.MEAN_REVERSION:
        if (!existingComponents.includes('trend_filter')) {
          recommendations.push({
            id: 'mean_reversion_trend_avoid',
            type: 'strategy_adjustment',
            priority: 'critical',
            description: 'Add trend filter to avoid mean reversion in strong trends',
            implementation: 'Disable mean reversion signals when price is far from major moving average',
            expectedImpact: 'Prevents trading against strong trends, reducing losses',
            nodeType: 'trend_filter'
          });
        }
        break;

      case StrategyType.BREAKOUT:
        if (!existingComponents.includes('volume_confirmation')) {
          recommendations.push({
            id: 'breakout_volume_confirm',
            type: 'strategy_adjustment',
            priority: 'high',
            description: 'Add volume confirmation for breakouts',
            implementation: 'Require above-average volume for valid breakout signals',
            expectedImpact: 'Filters out false breakouts, improving signal quality',
            nodeType: 'volume_confirmation'
          });
        }
        break;

      case StrategyType.SCALPING:
        if (!existingComponents.includes('spread_filter')) {
          recommendations.push({
            id: 'scalping_spread_filter',
            type: 'strategy_adjustment',
            priority: 'critical',
            description: 'Add spread filter for scalping',
            implementation: 'Block trades when spread is too wide relative to profit target',
            expectedImpact: 'Prevents trades with poor risk-reward due to execution costs',
            nodeType: 'spread_filter'
          });
        }
        break;
    }
  }

  private checkRiskFactor(riskFactor: string, parameters: any, strategyType: StrategyType): string | null {
    switch (riskFactor) {
      case 'trend_reversal':
        if (parameters.trendStrength && parameters.trendStrength < 0.3) {
          return 'Weak trend detected - increased risk of trend reversal';
        }
        break;
      case 'false_breakouts':
        if (parameters.volume && parameters.averageVolume && parameters.volume < parameters.averageVolume * 0.8) {
          return 'Low volume breakout detected - increased risk of false breakout';
        }
        break;
      case 'overextension':
        if (parameters.rsiValue && parameters.rsiValue > 80) {
          return 'Momentum indicator shows overextension - risk of reversal';
        }
        break;
      case 'spread_widening':
        if (parameters.currentSpread && parameters.averageSpread && parameters.currentSpread > parameters.averageSpread * 2) {
          return 'Spread is significantly wider than average - execution risk increased';
        }
        break;
      case 'low_liquidity':
        if (parameters.volume && parameters.averageVolume && parameters.volume < parameters.averageVolume * 0.5) {
          return 'Low liquidity conditions detected - increased slippage risk';
        }
        break;
    }
    return null;
  }
}