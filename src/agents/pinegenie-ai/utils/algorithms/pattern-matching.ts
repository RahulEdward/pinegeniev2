/**
 * Pattern Matching Algorithms
 * Optimized algorithms for fast pattern recognition in trading strategies
 */

import { TradingPattern, TradingIntent, StrategyComponent } from '../../types';
import { patternCache } from '../performance/pattern-cache';

interface MatchResult {
  pattern: TradingPattern;
  confidence: number;
  matchedKeywords: string[];
  score: number;
}

interface PatternIndex {
  keywordIndex: Map<string, Set<string>>; // keyword -> pattern IDs
  categoryIndex: Map<string, Set<string>>; // category -> pattern IDs
  complexityIndex: Map<string, Set<string>>; // complexity -> pattern IDs
  indicatorIndex: Map<string, Set<string>>; // indicator -> pattern IDs
}

export class PatternMatcher {
  private patterns: Map<string, TradingPattern> = new Map();
  private index: PatternIndex;
  private synonyms: Map<string, string[]> = new Map();

  constructor() {
    this.index = {
      keywordIndex: new Map(),
      categoryIndex: new Map(),
      complexityIndex: new Map(),
      indicatorIndex: new Map()
    };
    
    this.initializeSynonyms();
  }

  /**
   * Initialize trading term synonyms for better matching
   */
  private initializeSynonyms(): void {
    this.synonyms.set('buy', ['long', 'purchase', 'enter', 'open']);
    this.synonyms.set('sell', ['short', 'exit', 'close', 'liquidate']);
    this.synonyms.set('trend', ['direction', 'momentum', 'movement']);
    this.synonyms.set('reversal', ['turnaround', 'change', 'flip']);
    this.synonyms.set('breakout', ['breakthrough', 'break', 'escape']);
    this.synonyms.set('support', ['floor', 'bottom', 'base']);
    this.synonyms.set('resistance', ['ceiling', 'top', 'barrier']);
    this.synonyms.set('oversold', ['undervalued', 'cheap', 'low']);
    this.synonyms.set('overbought', ['overvalued', 'expensive', 'high']);
    this.synonyms.set('crossover', ['cross', 'intersection', 'meeting']);
  }

  /**
   * Add patterns to the matcher and build indices
   */
  addPatterns(patterns: TradingPattern[]): void {
    patterns.forEach(pattern => {
      this.patterns.set(pattern.id, pattern);
      this.indexPattern(pattern);
    });
  }

  /**
   * Index a pattern for fast lookup
   */
  private indexPattern(pattern: TradingPattern): void {
    // Index by keywords
    pattern.keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      if (!this.index.keywordIndex.has(normalizedKeyword)) {
        this.index.keywordIndex.set(normalizedKeyword, new Set());
      }
      this.index.keywordIndex.get(normalizedKeyword)!.add(pattern.id);
    });

    // Index by category
    if (!this.index.categoryIndex.has(pattern.category)) {
      this.index.categoryIndex.set(pattern.category, new Set());
    }
    this.index.categoryIndex.get(pattern.category)!.add(pattern.id);

    // Index by complexity
    if (!this.index.complexityIndex.has(pattern.complexity)) {
      this.index.complexityIndex.set(pattern.complexity, new Set());
    }
    this.index.complexityIndex.get(pattern.complexity)!.add(pattern.id);

    // Index by indicators
    pattern.indicators.forEach(indicator => {
      const normalizedIndicator = indicator.toLowerCase();
      if (!this.index.indicatorIndex.has(normalizedIndicator)) {
        this.index.indicatorIndex.set(normalizedIndicator, new Set());
      }
      this.index.indicatorIndex.get(normalizedIndicator)!.add(pattern.id);
    });
  }

  /**
   * Find matching patterns for a trading intent
   */
  findMatches(intent: TradingIntent, maxResults = 10): MatchResult[] {
    const cacheKey = this.createCacheKey(intent);
    
    // Check cache first
    const cachedResult = patternCache.getSearchResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const candidates = this.getCandidatePatterns(intent);
    const matches: MatchResult[] = [];

    for (const patternId of candidates) {
      const pattern = this.patterns.get(patternId);
      if (!pattern) continue;

      const matchResult = this.calculateMatch(pattern, intent);
      if (matchResult.confidence > 0.1) { // Minimum confidence threshold
        matches.push(matchResult);
      }
    }

    // Sort by score (confidence * relevance)
    matches.sort((a, b) => b.score - a.score);
    
    // Limit results
    const results = matches.slice(0, maxResults);
    
    // Cache results
    patternCache.cacheSearchResult(cacheKey, results);
    
    return results;
  }

  /**
   * Get candidate patterns using indices
   */
  private getCandidatePatterns(intent: TradingIntent): Set<string> {
    const candidates = new Set<string>();

    // Get candidates by strategy type
    const categoryPatterns = this.index.categoryIndex.get(intent.strategyType);
    if (categoryPatterns) {
      categoryPatterns.forEach(id => candidates.add(id));
    }

    // Get candidates by indicators
    intent.indicators.forEach(indicator => {
      const indicatorPatterns = this.index.indicatorIndex.get(indicator.toLowerCase());
      if (indicatorPatterns) {
        indicatorPatterns.forEach(id => candidates.add(id));
      }
    });

    // Get candidates by keywords (extracted from conditions and actions)
    const allKeywords = [
      ...intent.conditions,
      ...intent.actions,
      ...intent.riskManagement
    ];

    allKeywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      const keywordPatterns = this.index.keywordIndex.get(normalizedKeyword);
      if (keywordPatterns) {
        keywordPatterns.forEach(id => candidates.add(id));
      }

      // Check synonyms
      this.synonyms.forEach((synonymList, baseWord) => {
        if (synonymList.includes(normalizedKeyword) || baseWord === normalizedKeyword) {
          const basePatterns = this.index.keywordIndex.get(baseWord);
          if (basePatterns) {
            basePatterns.forEach(id => candidates.add(id));
          }
          
          synonymList.forEach(synonym => {
            const synonymPatterns = this.index.keywordIndex.get(synonym);
            if (synonymPatterns) {
              synonymPatterns.forEach(id => candidates.add(id));
            }
          });
        }
      });
    });

    return candidates;
  }

  /**
   * Calculate match score between pattern and intent
   */
  private calculateMatch(pattern: TradingPattern, intent: TradingIntent): MatchResult {
    let score = 0;
    let confidence = 0;
    const matchedKeywords: string[] = [];

    // Strategy type match (high weight)
    if (pattern.category === intent.strategyType) {
      score += 50;
      confidence += 0.3;
    }

    // Indicator matches (medium weight)
    const indicatorMatches = pattern.indicators.filter(indicator =>
      intent.indicators.some(intentIndicator =>
        intentIndicator.toLowerCase() === indicator.toLowerCase()
      )
    );
    score += indicatorMatches.length * 20;
    confidence += indicatorMatches.length * 0.15;

    // Keyword matches (variable weight)
    const allIntentKeywords = [
      ...intent.conditions,
      ...intent.actions,
      ...intent.riskManagement
    ].map(k => k.toLowerCase());

    pattern.keywords.forEach(keyword => {
      const normalizedKeyword = keyword.toLowerCase();
      if (allIntentKeywords.includes(normalizedKeyword)) {
        matchedKeywords.push(keyword);
        score += 10;
        confidence += 0.05;
      }

      // Check for synonym matches
      this.synonyms.forEach((synonymList, baseWord) => {
        if (baseWord === normalizedKeyword || synonymList.includes(normalizedKeyword)) {
          const hasSynonymMatch = allIntentKeywords.some(intentKeyword =>
            baseWord === intentKeyword || synonymList.includes(intentKeyword)
          );
          if (hasSynonymMatch) {
            matchedKeywords.push(keyword);
            score += 5; // Lower score for synonym matches
            confidence += 0.02;
          }
        }
      });
    });

    // Timeframe compatibility (if specified)
    if (intent.timeframe) {
      // This would need more sophisticated logic based on pattern characteristics
      score += 5;
      confidence += 0.02;
    }

    // Normalize confidence to 0-1 range
    confidence = Math.min(confidence, 1.0);

    return {
      pattern,
      confidence,
      matchedKeywords,
      score
    };
  }

  /**
   * Create cache key for intent
   */
  private createCacheKey(intent: TradingIntent): string {
    const keyParts = [
      intent.strategyType,
      intent.indicators.sort().join(','),
      intent.conditions.sort().join(','),
      intent.actions.sort().join(','),
      intent.riskManagement.sort().join(','),
      intent.timeframe || ''
    ];
    return keyParts.join('|');
  }

  /**
   * Fuzzy string matching for partial matches
   */
  private fuzzyMatch(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null)
    );

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get pattern statistics
   */
  getStats(): {
    totalPatterns: number;
    indexSizes: {
      keywords: number;
      categories: number;
      complexities: number;
      indicators: number;
    };
  } {
    return {
      totalPatterns: this.patterns.size,
      indexSizes: {
        keywords: this.index.keywordIndex.size,
        categories: this.index.categoryIndex.size,
        complexities: this.index.complexityIndex.size,
        indicators: this.index.indicatorIndex.size
      }
    };
  }

  /**
   * Clear all patterns and indices
   */
  clear(): void {
    this.patterns.clear();
    this.index.keywordIndex.clear();
    this.index.categoryIndex.clear();
    this.index.complexityIndex.clear();
    this.index.indicatorIndex.clear();
  }
}

// Singleton instance
export const patternMatcher = new PatternMatcher();