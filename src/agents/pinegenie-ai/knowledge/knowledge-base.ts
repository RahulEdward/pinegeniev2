/**
 * Main Knowledge Base System
 * 
 * Unified system that combines trading patterns, indicators, and risk rules
 * into a comprehensive knowledge base for the AI system.
 */

import { TradingPatterns, type UnifiedTradingPattern, type PatternMatchResult } from './patterns';
import { 
  UnifiedIndicatorSystem, 
  type TechnicalIndicator, 
  type IndicatorSuggestion,
  type IndicatorAnalysis,
  type ParameterOptimization
} from './indicators';
import { RiskManagementEngine, type RiskAssessment, type RiskRule } from './risk-rules';
import { StrategyType } from '../types/nlp-types';
import { AILogger } from '../core/logger';

export interface KnowledgeQuery {
  keywords: string[];
  indicators?: string[];
  conditions?: string[];
  strategyType?: StrategyType;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  riskLevel?: 'low' | 'medium' | 'high';
  timeframe?: string;
  marketCondition?: string;
}

export interface KnowledgeResult {
  patterns: PatternMatchResult[];
  indicators: TechnicalIndicator[];
  riskAssessment?: RiskAssessment;
  recommendations: KnowledgeRecommendation[];
  confidence: number;
  processingTime: number;
}

export interface KnowledgeRecommendation {
  id: string;
  type: 'pattern' | 'indicator' | 'risk' | 'combination' | 'education';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  reasoning: string;
  implementation?: string;
  relatedConcepts?: string[];
}

export interface StrategyKnowledge {
  patterns: UnifiedTradingPattern[];
  indicators: TechnicalIndicator[];
  riskRules: RiskRule[];
  combinations: IndicatorCombination[];
  educationalContent: EducationalContent[];
}

export interface IndicatorCombination {
  id: string;
  name: string;
  indicators: string[];
  strategyTypes: StrategyType[];
  description: string;
  synergy: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  effectiveness: number; // 0-1
}

export interface EducationalContent {
  id: string;
  title: string;
  category: 'concept' | 'strategy' | 'indicator' | 'risk' | 'market';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  examples: string[];
  relatedTopics: string[];
  keyTakeaways: string[];
}

export class KnowledgeBase {
  private tradingPatterns: TradingPatterns;
  private indicatorSystem: UnifiedIndicatorSystem;
  private riskEngine: RiskManagementEngine;
  private logger: AILogger;

  // Knowledge caching for performance
  private queryCache: Map<string, KnowledgeResult> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes

  // Predefined indicator combinations
  private indicatorCombinations: IndicatorCombination[] = [
    {
      id: 'rsi_bollinger',
      name: 'RSI + Bollinger Bands',
      indicators: ['rsi', 'bollinger_bands'],
      strategyTypes: [StrategyType.MEAN_REVERSION],
      description: 'Combine RSI oversold/overbought with Bollinger Band extremes',
      synergy: 'RSI provides momentum confirmation while BB shows volatility extremes',
      difficulty: 'beginner',
      effectiveness: 0.75
    },
    {
      id: 'macd_ema',
      name: 'MACD + EMA',
      indicators: ['macd', 'ema'],
      strategyTypes: [StrategyType.TREND_FOLLOWING, StrategyType.MOMENTUM],
      description: 'Use MACD for momentum signals with EMA for trend confirmation',
      synergy: 'MACD provides momentum signals while EMA confirms trend direction',
      difficulty: 'intermediate',
      effectiveness: 0.80
    },
    {
      id: 'stochastic_sma',
      name: 'Stochastic + SMA',
      indicators: ['stochastic', 'sma'],
      strategyTypes: [StrategyType.MEAN_REVERSION, StrategyType.SCALPING],
      description: 'Stochastic for timing with SMA for trend filter',
      synergy: 'Stochastic provides precise entry timing while SMA filters trend',
      difficulty: 'intermediate',
      effectiveness: 0.70
    },
    {
      id: 'triple_ma',
      name: 'Triple Moving Average',
      indicators: ['sma', 'ema'],
      strategyTypes: [StrategyType.TREND_FOLLOWING],
      description: 'Use three different period moving averages for trend analysis',
      synergy: 'Multiple timeframes provide comprehensive trend analysis',
      difficulty: 'advanced',
      effectiveness: 0.78
    }
  ];

  constructor() {
    this.tradingPatterns = new TradingPatterns();
    this.indicatorSystem = new UnifiedIndicatorSystem();
    this.riskEngine = new RiskManagementEngine();
    this.logger = AILogger.getInstance();

    this.logger.info('KnowledgeBase', 'Knowledge base system initialized', {
      patterns: this.tradingPatterns.getStatistics().totalPatterns,
      indicators: this.indicatorSystem.getComprehensiveStatistics().total,
      riskRules: this.riskEngine.getStatistics().totalRules,
      combinations: this.indicatorCombinations.length
    });
  }

  /**
   * Query the knowledge base with comprehensive search
   */
  public async query(query: KnowledgeQuery): Promise<KnowledgeResult> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(query);

    // Check cache first
    if (this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey)!;
      this.logger.debug('KnowledgeBase', 'Returning cached knowledge result', {
        cacheKey: cacheKey.substring(0, 50) + '...'
      });
      return cached;
    }

    this.logger.debug('KnowledgeBase', 'Processing knowledge query', {
      keywords: query.keywords,
      strategyType: query.strategyType,
      difficulty: query.difficulty
    });

    // Search patterns
    const patterns = this.tradingPatterns.findMatches(
      query.keywords,
      query.indicators || [],
      query.conditions || [],
      {
        strategyTypes: query.strategyType ? [query.strategyType] : undefined,
        difficulty: query.difficulty ? [query.difficulty] : undefined,
        timeframes: query.timeframe ? [query.timeframe] : undefined,
        minConfidence: 0.3
      }
    );

    // Search indicators
    const indicators = this.findRelevantIndicators(query);

    // Generate recommendations
    const recommendations = this.generateRecommendations(query, patterns, indicators);

    // Calculate overall confidence
    const confidence = this.calculateQueryConfidence(patterns, indicators, query);

    const processingTime = performance.now() - startTime;

    const result: KnowledgeResult = {
      patterns,
      indicators,
      recommendations,
      confidence,
      processingTime
    };

    // Cache result
    this.queryCache.set(cacheKey, result);
    setTimeout(() => {
      this.queryCache.delete(cacheKey);
    }, this.cacheTimeout);

    this.logger.debug('KnowledgeBase', 'Knowledge query completed', {
      patterns: patterns.length,
      indicators: indicators.length,
      recommendations: recommendations.length,
      confidence,
      processingTime: `${processingTime.toFixed(2)}ms`
    });

    return result;
  }

  /**
   * Get comprehensive strategy knowledge
   */
  public getStrategyKnowledge(strategyType: StrategyType): StrategyKnowledge {
    const patterns = this.tradingPatterns.getPatternsByStrategyType(strategyType);
    const indicators = this.getIndicatorsForStrategy(strategyType);
    const riskRules = this.riskEngine.getRulesForStrategy(strategyType);
    const combinations = this.getCombinationsForStrategy(strategyType);
    const educationalContent = this.getEducationalContent(strategyType);

    return {
      patterns,
      indicators,
      riskRules,
      combinations,
      educationalContent
    };
  }

  /**
   * Get indicator combinations
   */
  public getIndicatorCombinations(
    filters?: {
      strategyType?: StrategyType;
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      minEffectiveness?: number;
    }
  ): IndicatorCombination[] {
    let combinations = [...this.indicatorCombinations];

    if (filters?.strategyType) {
      combinations = combinations.filter(combo => 
        combo.strategyTypes.includes(filters.strategyType!)
      );
    }

    if (filters?.difficulty) {
      combinations = combinations.filter(combo => combo.difficulty === filters.difficulty);
    }

    if (filters?.minEffectiveness) {
      combinations = combinations.filter(combo => combo.effectiveness >= filters.minEffectiveness!);
    }

    return combinations.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * Get personalized recommendations
   */
  public getPersonalizedRecommendations(
    userProfile: {
      experienceLevel: 'beginner' | 'intermediate' | 'advanced';
      riskTolerance: 'low' | 'medium' | 'high';
      preferredTimeframes: string[];
      favoriteIndicators: string[];
      tradingGoals: string[];
    }
  ): KnowledgeRecommendation[] {
    const recommendations: KnowledgeRecommendation[] = [];

    // Pattern recommendations based on experience
    const suitablePatterns = this.tradingPatterns.getPatternsByDifficulty(userProfile.experienceLevel);
    if (suitablePatterns.length > 0) {
      const topPattern = suitablePatterns[0];
      recommendations.push({
        id: `pattern_${topPattern.id}`,
        type: 'pattern',
        priority: 'high',
        title: `Try ${topPattern.name}`,
        description: topPattern.description,
        reasoning: `Matches your ${userProfile.experienceLevel} experience level`,
        implementation: `Success rate: ${(topPattern.successRate * 100).toFixed(0)}%`,
        relatedConcepts: topPattern.variations
      });
    }

    // Indicator recommendations
    const suitableIndicators = this.indicatorDatabase.getIndicatorsByDifficulty(userProfile.experienceLevel);
    if (suitableIndicators.length > 0) {
      const topIndicator = suitableIndicators[0];
      recommendations.push({
        id: `indicator_${topIndicator.id}`,
        type: 'indicator',
        priority: 'medium',
        title: `Learn ${topIndicator.name}`,
        description: topIndicator.description,
        reasoning: `Popular ${userProfile.experienceLevel}-friendly indicator`,
        implementation: `Best timeframes: ${topIndicator.bestTimeframes.join(', ')}`,
        relatedConcepts: topIndicator.combinations
      });
    }

    // Combination recommendations
    const suitableCombinations = this.indicatorCombinations.filter(combo => 
      combo.difficulty === userProfile.experienceLevel
    );
    if (suitableCombinations.length > 0) {
      const topCombo = suitableCombinations[0];
      recommendations.push({
        id: `combo_${topCombo.id}`,
        type: 'combination',
        priority: 'medium',
        title: `Try ${topCombo.name} Combination`,
        description: topCombo.description,
        reasoning: topCombo.synergy,
        implementation: `Effectiveness: ${(topCombo.effectiveness * 100).toFixed(0)}%`
      });
    }

    // Risk management recommendations
    recommendations.push({
      id: 'risk_management',
      type: 'risk',
      priority: 'high',
      title: 'Implement Risk Management',
      description: 'Always use proper risk management techniques',
      reasoning: 'Essential for long-term trading success',
      implementation: 'Never risk more than 2% per trade, always use stop losses'
    });

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Search knowledge base
   */
  public search(searchTerm: string): {
    patterns: UnifiedTradingPattern[];
    indicators: TechnicalIndicator[];
    combinations: IndicatorCombination[];
  } {
    const keywords = searchTerm.toLowerCase().split(' ');

    // Search patterns
    const patternResults = this.tradingPatterns.findMatches(keywords, [], []);
    const patterns = patternResults.map(result => result.pattern);

    // Search indicators
    const indicators = this.indicatorSystem.searchAllIndicators(keywords);

    // Search combinations
    const combinations = this.indicatorCombinations.filter(combo =>
      keywords.some(keyword =>
        combo.name.toLowerCase().includes(keyword) ||
        combo.description.toLowerCase().includes(keyword)
      )
    );

    return { patterns, indicators, combinations };
  }

  /**
   * Get knowledge base statistics
   */
  public getStatistics(): {
    patterns: any;
    indicators: any;
    riskRules: any;
    combinations: number;
    cacheSize: number;
    totalQueries: number;
  } {
    return {
      patterns: this.tradingPatterns.getStatistics(),
      indicators: this.indicatorSystem.getComprehensiveStatistics(),
      riskRules: this.riskEngine.getStatistics(),
      combinations: this.indicatorCombinations.length,
      cacheSize: this.queryCache.size,
      totalQueries: this.queryCache.size // Simplified metric
    };
  }

  /**
   * Get indicator suggestions based on strategy type and context
   */
  public getIndicatorSuggestions(
    strategyType: string,
    existingIndicators: string[] = [],
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
    marketCondition?: string,
    timeframe?: string
  ): IndicatorSuggestion[] {
    return this.indicatorSystem.getTechnicalDatabase().getIndicatorSuggestions(
      strategyType,
      existingIndicators,
      userLevel,
      marketCondition,
      timeframe
    );
  }

  /**
   * Analyze indicator compatibility
   */
  public analyzeIndicatorCompatibility(indicatorIds: string[]): {
    compatible: Array<{ indicators: string[]; synergy: string; effectiveness: number }>;
    incompatible: Array<{ indicators: string[]; reason: string }>;
    suggestions: IndicatorSuggestion[];
  } {
    return this.indicatorSystem.getTechnicalDatabase().getCompatibilityAnalysis(indicatorIds);
  }

  /**
   * Get parameter optimization recommendations
   */
  public getParameterOptimizations(
    indicatorId: string,
    strategyType: string,
    marketCondition?: string,
    timeframe?: string,
    currentParameters?: Record<string, unknown>
  ): ParameterOptimization[] {
    return this.indicatorSystem.getTechnicalDatabase().getParameterOptimizations(
      indicatorId,
      strategyType,
      marketCondition,
      timeframe,
      currentParameters
    );
  }

  /**
   * Analyze indicator suitability for specific context
   */
  public analyzeIndicatorSuitability(
    indicatorId: string,
    context: {
      strategyType: string;
      marketCondition?: string;
      timeframe?: string;
      userLevel?: 'beginner' | 'intermediate' | 'advanced';
      existingIndicators?: string[];
    }
  ): IndicatorAnalysis {
    return this.indicatorSystem.getTechnicalDatabase().analyzeIndicatorSuitability(indicatorId, context);
  }

  /**
   * Get comprehensive indicator knowledge
   */
  public getIndicatorKnowledge(indicatorId: string): {
    indicator: TechnicalIndicator | null;
    compatibleIndicators: TechnicalIndicator[];
    useCaseExamples: string[];
    parameterGuidance: Array<{
      parameter: string;
      guidance: string;
      impact: string;
    }>;
  } {
    const indicator = this.indicatorSystem.getIndicator(indicatorId);
    if (!indicator) {
      return {
        indicator: null,
        compatibleIndicators: [],
        useCaseExamples: [],
        parameterGuidance: []
      };
    }

    const compatibleIndicators = this.indicatorSystem.getTechnicalDatabase().getCompatibleIndicators(indicatorId);
    
    const parameterGuidance = indicator.parameters.map(param => ({
      parameter: param.name,
      guidance: param.description,
      impact: param.impact
    }));

    return {
      indicator,
      compatibleIndicators,
      useCaseExamples: indicator.useCases,
      parameterGuidance
    };
  }

  /**
   * Get indicator system reference
   */
  public getIndicatorSystem(): UnifiedIndicatorSystem {
    return this.indicatorSystem;
  }

  /**
   * Clear knowledge base cache
   */
  public clearCache(): void {
    this.queryCache.clear();
    this.tradingPatterns.clearCache();
    this.logger.debug('KnowledgeBase', 'All caches cleared');
  }

  // Private helper methods

  private findRelevantIndicators(query: KnowledgeQuery): TechnicalIndicator[] {
    let indicators: TechnicalIndicator[] = [];

    // Search by keywords using unified system
    if (query.keywords.length > 0) {
      indicators = this.indicatorSystem.searchAllIndicators(query.keywords);
    }

    // Filter by difficulty
    if (query.difficulty) {
      indicators = indicators.filter(ind => ind.difficulty === query.difficulty);
    }

    // Filter by timeframe
    if (query.timeframe) {
      const timeframeIndicators = this.indicatorSystem.getTechnicalDatabase().getIndicatorsByTimeframe(query.timeframe);
      indicators = indicators.length > 0 
        ? indicators.filter(ind => timeframeIndicators.includes(ind))
        : timeframeIndicators;
    }

    // Filter by market condition
    if (query.marketCondition) {
      const conditionIndicators = this.indicatorSystem.getTechnicalDatabase().getIndicatorsByMarketCondition(query.marketCondition);
      indicators = indicators.length > 0
        ? indicators.filter(ind => conditionIndicators.includes(ind))
        : conditionIndicators;
    }

    // If no specific indicators found, get popular ones
    if (indicators.length === 0) {
      indicators = this.indicatorSystem.getTechnicalDatabase().getPopularIndicators(7).slice(0, 5);
    }

    return indicators.slice(0, 10); // Limit to top 10
  }

  private generateRecommendations(
    query: KnowledgeQuery,
    patterns: PatternMatchResult[],
    indicators: TechnicalIndicator[]
  ): KnowledgeRecommendation[] {
    const recommendations: KnowledgeRecommendation[] = [];

    // Pattern-based recommendations
    if (patterns.length > 0) {
      const topPattern = patterns[0];
      recommendations.push({
        id: `pattern_rec_${topPattern.pattern.id}`,
        type: 'pattern',
        priority: topPattern.confidence > 0.8 ? 'high' : 'medium',
        title: `Consider ${topPattern.pattern.name}`,
        description: topPattern.pattern.description,
        reasoning: `${(topPattern.confidence * 100).toFixed(0)}% match with your criteria`,
        implementation: `Success rate: ${(topPattern.pattern.successRate * 100).toFixed(0)}%`,
        relatedConcepts: topPattern.pattern.variations
      });
    }

    // Indicator-based recommendations
    if (indicators.length > 0) {
      const topIndicator = indicators[0];
      recommendations.push({
        id: `indicator_rec_${topIndicator.id}`,
        type: 'indicator',
        priority: 'medium',
        title: `Use ${topIndicator.name}`,
        description: topIndicator.description,
        reasoning: `Highly relevant for your search criteria`,
        implementation: `Best for: ${topIndicator.useCases.slice(0, 2).join(', ')}`,
        relatedConcepts: topIndicator.combinations
      });
    }

    // Combination recommendations
    const relevantCombinations = this.getRelevantCombinations(query, indicators);
    if (relevantCombinations.length > 0) {
      const topCombo = relevantCombinations[0];
      recommendations.push({
        id: `combo_rec_${topCombo.id}`,
        type: 'combination',
        priority: 'medium',
        title: `Try ${topCombo.name}`,
        description: topCombo.description,
        reasoning: topCombo.synergy,
        implementation: `Effectiveness: ${(topCombo.effectiveness * 100).toFixed(0)}%`
      });
    }

    // Educational recommendations
    if (query.difficulty === 'beginner') {
      recommendations.push({
        id: 'education_basics',
        type: 'education',
        priority: 'high',
        title: 'Learn Trading Basics',
        description: 'Start with fundamental concepts before advanced strategies',
        reasoning: 'Strong foundation is essential for trading success',
        implementation: 'Focus on risk management and simple indicators first'
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private getRelevantCombinations(query: KnowledgeQuery, indicators: TechnicalIndicator[]): IndicatorCombination[] {
    const indicatorIds = indicators.map(ind => ind.id);
    
    return this.indicatorCombinations.filter(combo =>
      combo.indicators.some(indId => indicatorIds.includes(indId)) ||
      (query.strategyType && combo.strategyTypes.includes(query.strategyType))
    );
  }

  private calculateQueryConfidence(
    patterns: PatternMatchResult[],
    indicators: TechnicalIndicator[],
    query: KnowledgeQuery
  ): number {
    let confidence = 0.5; // Base confidence

    // Boost for pattern matches
    if (patterns.length > 0) {
      const avgPatternConfidence = patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.length;
      confidence += avgPatternConfidence * 0.3;
    }

    // Boost for indicator matches
    if (indicators.length > 0) {
      confidence += Math.min(indicators.length * 0.1, 0.2);
    }

    // Boost for specific criteria
    if (query.strategyType) confidence += 0.1;
    if (query.difficulty) confidence += 0.05;
    if (query.timeframe) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  private getIndicatorsForStrategy(strategyType: StrategyType): TechnicalIndicator[] {
    const allIndicators = this.indicatorSystem.getAllIndicators();
    
    // Enhanced filtering based on strategy type characteristics
    switch (strategyType) {
      case StrategyType.TREND_FOLLOWING:
        return allIndicators.filter(ind => 
          ind.category === 'trend' || ind.id === 'macd' || ind.id === 'roc'
        );
      case StrategyType.MEAN_REVERSION:
        return allIndicators.filter(ind => 
          ind.category === 'oscillator' || ind.id === 'bollinger_bands' || ind.id === 'williams_r'
        );
      case StrategyType.BREAKOUT:
        return allIndicators.filter(ind => 
          ind.category === 'volatility' || ind.id === 'atr' || ind.id === 'cci'
        );
      case StrategyType.MOMENTUM:
        return allIndicators.filter(ind =>
          ind.category === 'momentum' || ind.id === 'rsi' || ind.id === 'macd'
        );
      case StrategyType.SCALPING:
        return allIndicators.filter(ind =>
          ind.id === 'stochastic' || ind.id === 'williams_r' || ind.id === 'ema'
        );
      default:
        return allIndicators.slice(0, 5);
    }
  }

  private getCombinationsForStrategy(strategyType: StrategyType): IndicatorCombination[] {
    return this.indicatorCombinations.filter(combo =>
      combo.strategyTypes.includes(strategyType)
    );
  }

  private getEducationalContent(strategyType: StrategyType): EducationalContent[] {
    // Placeholder for educational content - would be expanded in real implementation
    return [
      {
        id: `education_${strategyType}`,
        title: `${strategyType} Strategy Basics`,
        category: 'strategy',
        difficulty: 'beginner',
        content: `Learn the fundamentals of ${strategyType} strategies`,
        examples: ['Example 1', 'Example 2'],
        relatedTopics: ['risk management', 'technical analysis'],
        keyTakeaways: ['Key point 1', 'Key point 2']
      }
    ];
  }

  private generateCacheKey(query: KnowledgeQuery): string {
    return JSON.stringify({
      keywords: query.keywords.sort(),
      indicators: query.indicators?.sort(),
      conditions: query.conditions?.sort(),
      strategyType: query.strategyType,
      difficulty: query.difficulty,
      riskLevel: query.riskLevel,
      timeframe: query.timeframe,
      marketCondition: query.marketCondition
    });
  }
}