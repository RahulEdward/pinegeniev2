/**
 * Unified Trading Patterns System
 * 
 * Combines all trading pattern databases into a unified system
 * for pattern recognition and matching.
 */

import { 
  TREND_FOLLOWING_PATTERNS, 
  TrendFollowingPatternMatcher,
  type TrendFollowingPattern 
} from './patterns/trend-following';

import { 
  MEAN_REVERSION_PATTERNS, 
  MeanReversionPatternMatcher,
  type MeanReversionPattern 
} from './patterns/mean-reversion';

import { 
  BREAKOUT_PATTERNS, 
  BreakoutPatternMatcher,
  type BreakoutPattern 
} from './patterns/breakout';

import { StrategyType } from '../types/nlp-types';
import { AILogger } from '../core/logger';

export type UnifiedTradingPattern = TrendFollowingPattern | MeanReversionPattern | BreakoutPattern;

export interface PatternMatchResult {
  pattern: UnifiedTradingPattern;
  confidence: number;
  matchedKeywords: string[];
  matchedIndicators: string[];
  strategyType: StrategyType;
}

export interface PatternSearchOptions {
  strategyTypes?: StrategyType[];
  difficulty?: ('beginner' | 'intermediate' | 'advanced')[];
  riskLevel?: ('low' | 'medium' | 'high')[];
  timeframes?: string[];
  marketConditions?: string[];
  minSuccessRate?: number;
  minConfidence?: number;
}

export class TradingPatterns {
  private trendFollowingMatcher: TrendFollowingPatternMatcher;
  private meanReversionMatcher: MeanReversionPatternMatcher;
  private breakoutMatcher: BreakoutPatternMatcher;
  private logger: AILogger;

  // Pattern caching for performance
  private patternCache: Map<string, PatternMatchResult[]> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.trendFollowingMatcher = new TrendFollowingPatternMatcher();
    this.meanReversionMatcher = new MeanReversionPatternMatcher();
    this.breakoutMatcher = new BreakoutPatternMatcher();
    this.logger = AILogger.getInstance();

    this.logger.info('TradingPatterns', 'Pattern system initialized', {
      trendFollowingPatterns: TREND_FOLLOWING_PATTERNS.length,
      meanReversionPatterns: MEAN_REVERSION_PATTERNS.length,
      breakoutPatterns: BREAKOUT_PATTERNS.length,
      totalPatterns: this.getTotalPatternCount()
    });
  }

  /**
   * Find matching patterns across all strategy types
   */
  public findMatches(
    keywords: string[],
    indicators: string[],
    conditions: string[],
    options: PatternSearchOptions = {}
  ): PatternMatchResult[] {
    const cacheKey = this.generateCacheKey(keywords, indicators, conditions, options);
    
    // Check cache first
    if (this.patternCache.has(cacheKey)) {
      const cached = this.patternCache.get(cacheKey)!;
      this.logger.debug('TradingPatterns', 'Returning cached pattern matches', {
        cacheKey: cacheKey.substring(0, 50) + '...',
        matchCount: cached.length
      });
      return cached;
    }

    const startTime = performance.now();
    const allMatches: PatternMatchResult[] = [];

    // Search trend following patterns
    if (!options.strategyTypes || options.strategyTypes.includes(StrategyType.TREND_FOLLOWING)) {
      const trendMatches = this.trendFollowingMatcher.findMatches(keywords, indicators, conditions);
      trendMatches.forEach(match => {
        allMatches.push({
          ...match,
          strategyType: StrategyType.TREND_FOLLOWING
        });
      });
    }

    // Search mean reversion patterns
    if (!options.strategyTypes || options.strategyTypes.includes(StrategyType.MEAN_REVERSION)) {
      const meanReversionMatches = this.meanReversionMatcher.findMatches(keywords, indicators, conditions);
      meanReversionMatches.forEach(match => {
        allMatches.push({
          ...match,
          strategyType: StrategyType.MEAN_REVERSION
        });
      });
    }

    // Search breakout patterns
    if (!options.strategyTypes || options.strategyTypes.includes(StrategyType.BREAKOUT)) {
      const breakoutMatches = this.breakoutMatcher.findMatches(keywords, indicators, conditions);
      breakoutMatches.forEach(match => {
        allMatches.push({
          ...match,
          strategyType: StrategyType.BREAKOUT
        });
      });
    }

    // Apply filters
    let filteredMatches = this.applyFilters(allMatches, options);

    // Sort by confidence
    filteredMatches.sort((a, b) => b.confidence - a.confidence);

    // Apply confidence threshold
    if (options.minConfidence) {
      filteredMatches = filteredMatches.filter(match => match.confidence >= options.minConfidence!);
    }

    // Cache results
    this.patternCache.set(cacheKey, filteredMatches);
    setTimeout(() => {
      this.patternCache.delete(cacheKey);
    }, this.cacheTimeout);

    const processingTime = performance.now() - startTime;
    
    this.logger.debug('TradingPatterns', 'Pattern matching completed', {
      totalMatches: allMatches.length,
      filteredMatches: filteredMatches.length,
      processingTime: `${processingTime.toFixed(2)}ms`,
      topMatch: filteredMatches[0]?.pattern.name || 'none'
    });

    return filteredMatches;
  }

  /**
   * Get patterns by strategy type
   */
  public getPatternsByStrategyType(strategyType: StrategyType): UnifiedTradingPattern[] {
    switch (strategyType) {
      case StrategyType.TREND_FOLLOWING:
        return this.trendFollowingMatcher.getAllPatterns();
      case StrategyType.MEAN_REVERSION:
        return this.meanReversionMatcher.getAllPatterns();
      case StrategyType.BREAKOUT:
        return this.breakoutMatcher.getAllPatterns();
      default:
        return [];
    }
  }

  /**
   * Get patterns by difficulty level
   */
  public getPatternsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): UnifiedTradingPattern[] {
    const allPatterns = this.getAllPatterns();
    return allPatterns.filter(pattern => pattern.difficulty === difficulty);
  }

  /**
   * Get patterns by risk level
   */
  public getPatternsByRisk(riskLevel: 'low' | 'medium' | 'high'): UnifiedTradingPattern[] {
    const allPatterns = this.getAllPatterns();
    return allPatterns.filter(pattern => pattern.riskLevel === riskLevel);
  }

  /**
   * Get patterns suitable for timeframe
   */
  public getPatternsByTimeframe(timeframe: string): UnifiedTradingPattern[] {
    const allPatterns = this.getAllPatterns();
    return allPatterns.filter(pattern => pattern.timeframes.includes(timeframe));
  }

  /**
   * Get patterns by market condition
   */
  public getPatternsByMarketCondition(condition: string): UnifiedTradingPattern[] {
    const allPatterns = this.getAllPatterns();
    return allPatterns.filter(pattern => 
      pattern.marketConditions.some(mc => 
        mc.toLowerCase().includes(condition.toLowerCase())
      )
    );
  }

  /**
   * Get pattern recommendations based on user preferences
   */
  public getRecommendations(
    userPreferences: {
      experienceLevel: 'beginner' | 'intermediate' | 'advanced';
      riskTolerance: 'low' | 'medium' | 'high';
      preferredTimeframes: string[];
      favoriteIndicators: string[];
    }
  ): UnifiedTradingPattern[] {
    let recommendations = this.getPatternsByDifficulty(userPreferences.experienceLevel);

    // Filter by risk tolerance
    recommendations = recommendations.filter(pattern => {
      const riskLevels = ['low', 'medium', 'high'];
      const userRiskIndex = riskLevels.indexOf(userPreferences.riskTolerance);
      const patternRiskIndex = riskLevels.indexOf(pattern.riskLevel);
      return patternRiskIndex <= userRiskIndex;
    });

    // Prefer patterns that match user's timeframes
    if (userPreferences.preferredTimeframes.length > 0) {
      recommendations = recommendations.filter(pattern =>
        pattern.timeframes.some(tf => userPreferences.preferredTimeframes.includes(tf))
      );
    }

    // Boost patterns that use user's favorite indicators
    if (userPreferences.favoriteIndicators.length > 0) {
      recommendations = recommendations.filter(pattern =>
        pattern.indicators.some(indicator =>
          userPreferences.favoriteIndicators.some(fav =>
            indicator.toLowerCase().includes(fav.toLowerCase())
          )
        )
      );
    }

    // Sort by success rate
    recommendations.sort((a, b) => b.successRate - a.successRate);

    return recommendations.slice(0, 10); // Top 10 recommendations
  }

  /**
   * Get all patterns
   */
  public getAllPatterns(): UnifiedTradingPattern[] {
    return [
      ...this.trendFollowingMatcher.getAllPatterns(),
      ...this.meanReversionMatcher.getAllPatterns(),
      ...this.breakoutMatcher.getAllPatterns()
    ];
  }

  /**
   * Get pattern statistics
   */
  public getStatistics(): {
    totalPatterns: number;
    patternsByType: Record<string, number>;
    patternsByDifficulty: Record<string, number>;
    patternsByRisk: Record<string, number>;
    averageSuccessRate: number;
    cacheSize: number;
  } {
    const allPatterns = this.getAllPatterns();
    
    const patternsByType: Record<string, number> = {
      'trend-following': TREND_FOLLOWING_PATTERNS.length,
      'mean-reversion': MEAN_REVERSION_PATTERNS.length,
      'breakout': BREAKOUT_PATTERNS.length
    };

    const patternsByDifficulty: Record<string, number> = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    const patternsByRisk: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0
    };

    let totalSuccessRate = 0;

    allPatterns.forEach(pattern => {
      patternsByDifficulty[pattern.difficulty]++;
      patternsByRisk[pattern.riskLevel]++;
      totalSuccessRate += pattern.successRate;
    });

    return {
      totalPatterns: allPatterns.length,
      patternsByType,
      patternsByDifficulty,
      patternsByRisk,
      averageSuccessRate: totalSuccessRate / allPatterns.length,
      cacheSize: this.patternCache.size
    };
  }

  /**
   * Clear pattern cache
   */
  public clearCache(): void {
    this.patternCache.clear();
    this.logger.debug('TradingPatterns', 'Pattern cache cleared');
  }

  // Private helper methods

  private applyFilters(matches: PatternMatchResult[], options: PatternSearchOptions): PatternMatchResult[] {
    let filtered = matches;

    if (options.difficulty) {
      filtered = filtered.filter(match => 
        options.difficulty!.includes(match.pattern.difficulty)
      );
    }

    if (options.riskLevel) {
      filtered = filtered.filter(match => 
        options.riskLevel!.includes(match.pattern.riskLevel)
      );
    }

    if (options.timeframes) {
      filtered = filtered.filter(match =>
        match.pattern.timeframes.some(tf => options.timeframes!.includes(tf))
      );
    }

    if (options.marketConditions) {
      filtered = filtered.filter(match =>
        match.pattern.marketConditions.some(mc =>
          options.marketConditions!.some(omc =>
            mc.toLowerCase().includes(omc.toLowerCase())
          )
        )
      );
    }

    if (options.minSuccessRate) {
      filtered = filtered.filter(match => 
        match.pattern.successRate >= options.minSuccessRate!
      );
    }

    return filtered;
  }

  private generateCacheKey(
    keywords: string[],
    indicators: string[],
    conditions: string[],
    options: PatternSearchOptions
  ): string {
    const keyData = {
      keywords: keywords.sort(),
      indicators: indicators.sort(),
      conditions: conditions.sort(),
      options
    };
    
    return JSON.stringify(keyData);
  }

  private getTotalPatternCount(): number {
    return TREND_FOLLOWING_PATTERNS.length + 
           MEAN_REVERSION_PATTERNS.length + 
           BREAKOUT_PATTERNS.length;
  }
}