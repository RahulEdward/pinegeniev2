/**
 * Trading Vocabulary Database
 * 
 * Comprehensive vocabulary for trading terminology, indicators,
 * actions, and conditions used in natural language processing.
 */

import { TokenType, EntityType } from '../../types/nlp-types';

export interface VocabularyEntry {
  term: string;
  tokenType: TokenType;
  entityType?: EntityType;
  synonyms: string[];
  category: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface VocabularyDatabase {
  indicators: VocabularyEntry[];
  actions: VocabularyEntry[];
  conditions: VocabularyEntry[];
  parameters: VocabularyEntry[];
  timeframes: VocabularyEntry[];
  operators: VocabularyEntry[];
  modifiers: VocabularyEntry[];
}

export const TRADING_VOCABULARY: VocabularyDatabase = {
  // Technical Indicators
  indicators: [
    {
      term: 'rsi',
      tokenType: TokenType.INDICATOR,
      entityType: EntityType.INDICATOR_NAME,
      synonyms: ['relative strength index', 'relative strength', 'rsi indicator'],
      category: 'oscillator',
      confidence: 0.95,
      metadata: { defaultPeriod: 14, range: [0, 100] }
    },
    {
      term: 'sma',
      tokenType: TokenType.INDICATOR,
      entityType: EntityType.INDICATOR_NAME,
      synonyms: ['simple moving average', 'moving average', 'ma', 'average'],
      category: 'trend',
      confidence: 0.9,
      metadata: { defaultPeriod: 20 }
    },
    {
      term: 'ema',
      tokenType: TokenType.INDICATOR,
      entityType: EntityType.INDICATOR_NAME,
      synonyms: ['exponential moving average', 'exponential average', 'exp moving average'],
      category: 'trend',
      confidence: 0.9,
      metadata: { defaultPeriod: 20 }
    },
    {
      term: 'macd',
      tokenType: TokenType.INDICATOR,
      entityType: EntityType.INDICATOR_NAME,
      synonyms: ['moving average convergence divergence', 'macd indicator'],
      category: 'momentum',
      confidence: 0.95,
      metadata: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }
    },
    {
      term: 'bollinger bands',
      tokenType: TokenType.INDICATOR,
      entityType: EntityType.INDICATOR_NAME,
      synonyms: ['bb', 'bollinger', 'bands', 'bollinger band'],
      category: 'volatility',
      confidence: 0.9,
      metadata: { defaultPeriod: 20, stdDev: 2 }
    },
    {
      term: 'stochastic',
      tokenType: TokenType.INDICATOR,
      entityType: EntityType.INDICATOR_NAME,
      synonyms: ['stoch', 'stochastic oscillator', 'stochastic indicator'],
      category: 'oscillator',
      confidence: 0.9,
      metadata: { kPeriod: 14, dPeriod: 3 }
    },
    {
      term: 'atr',
      tokenType: TokenType.INDICATOR,
      entityType: EntityType.INDICATOR_NAME,
      synonyms: ['average true range', 'true range'],
      category: 'volatility',
      confidence: 0.9,
      metadata: { defaultPeriod: 14 }
    }
  ],

  // Trading Actions
  actions: [
    {
      term: 'buy',
      tokenType: TokenType.ACTION,
      synonyms: ['purchase', 'long', 'go long', 'enter long', 'buy signal'],
      category: 'entry',
      confidence: 0.95
    },
    {
      term: 'sell',
      tokenType: TokenType.ACTION,
      synonyms: ['short', 'go short', 'enter short', 'sell signal'],
      category: 'entry',
      confidence: 0.95
    },
    {
      term: 'close',
      tokenType: TokenType.ACTION,
      synonyms: ['exit', 'close position', 'take profit', 'stop out'],
      category: 'exit',
      confidence: 0.9
    },
    {
      term: 'hold',
      tokenType: TokenType.ACTION,
      synonyms: ['wait', 'stay', 'maintain position', 'do nothing'],
      category: 'neutral',
      confidence: 0.8
    }
  ],

  // Trading Conditions
  conditions: [
    {
      term: 'oversold',
      tokenType: TokenType.CONDITION,
      synonyms: ['below threshold', 'low', 'undervalued'],
      category: 'level',
      confidence: 0.9,
      metadata: { typicalThreshold: 30 }
    },
    {
      term: 'overbought',
      tokenType: TokenType.CONDITION,
      synonyms: ['above threshold', 'high', 'overvalued'],
      category: 'level',
      confidence: 0.9,
      metadata: { typicalThreshold: 70 }
    },
    {
      term: 'crossover',
      tokenType: TokenType.CONDITION,
      synonyms: ['crosses above', 'breaks above', 'goes above'],
      category: 'cross',
      confidence: 0.95
    },
    {
      term: 'crossunder',
      tokenType: TokenType.CONDITION,
      synonyms: ['crosses below', 'breaks below', 'goes below'],
      category: 'cross',
      confidence: 0.95
    },
    {
      term: 'rising',
      tokenType: TokenType.CONDITION,
      synonyms: ['increasing', 'going up', 'upward', 'bullish'],
      category: 'trend',
      confidence: 0.8
    },
    {
      term: 'falling',
      tokenType: TokenType.CONDITION,
      synonyms: ['decreasing', 'going down', 'downward', 'bearish'],
      category: 'trend',
      confidence: 0.8
    }
  ],

  // Parameters and Values
  parameters: [
    {
      term: 'period',
      tokenType: TokenType.PARAMETER,
      entityType: EntityType.PARAMETER_VALUE,
      synonyms: ['length', 'window', 'lookback', 'days'],
      category: 'numeric',
      confidence: 0.9
    },
    {
      term: 'threshold',
      tokenType: TokenType.PARAMETER,
      entityType: EntityType.THRESHOLD,
      synonyms: ['level', 'limit', 'boundary', 'value'],
      category: 'numeric',
      confidence: 0.9
    },
    {
      term: 'stop loss',
      tokenType: TokenType.PARAMETER,
      synonyms: ['sl', 'stop', 'max loss', 'risk limit'],
      category: 'risk',
      confidence: 0.95
    },
    {
      term: 'take profit',
      tokenType: TokenType.PARAMETER,
      synonyms: ['tp', 'profit target', 'target', 'profit limit'],
      category: 'risk',
      confidence: 0.95
    }
  ],

  // Timeframes
  timeframes: [
    {
      term: '1m',
      tokenType: TokenType.TIMEFRAME,
      entityType: EntityType.TIMEFRAME,
      synonyms: ['1 minute', '1min', 'one minute'],
      category: 'timeframe',
      confidence: 0.95
    },
    {
      term: '5m',
      tokenType: TokenType.TIMEFRAME,
      entityType: EntityType.TIMEFRAME,
      synonyms: ['5 minutes', '5min', 'five minutes'],
      category: 'timeframe',
      confidence: 0.95
    },
    {
      term: '15m',
      tokenType: TokenType.TIMEFRAME,
      entityType: EntityType.TIMEFRAME,
      synonyms: ['15 minutes', '15min', 'fifteen minutes'],
      category: 'timeframe',
      confidence: 0.95
    },
    {
      term: '1h',
      tokenType: TokenType.TIMEFRAME,
      entityType: EntityType.TIMEFRAME,
      synonyms: ['1 hour', '1hr', 'hourly', 'one hour'],
      category: 'timeframe',
      confidence: 0.95
    },
    {
      term: '4h',
      tokenType: TokenType.TIMEFRAME,
      entityType: EntityType.TIMEFRAME,
      synonyms: ['4 hours', '4hr', 'four hours'],
      category: 'timeframe',
      confidence: 0.95
    },
    {
      term: '1d',
      tokenType: TokenType.TIMEFRAME,
      entityType: EntityType.TIMEFRAME,
      synonyms: ['1 day', 'daily', 'day', 'one day'],
      category: 'timeframe',
      confidence: 0.95
    }
  ],

  // Operators and Comparisons
  operators: [
    {
      term: 'greater than',
      tokenType: TokenType.OPERATOR,
      synonyms: ['>', 'above', 'higher than', 'more than', 'over'],
      category: 'comparison',
      confidence: 0.9
    },
    {
      term: 'less than',
      tokenType: TokenType.OPERATOR,
      synonyms: ['<', 'below', 'lower than', 'under', 'beneath'],
      category: 'comparison',
      confidence: 0.9
    },
    {
      term: 'equal to',
      tokenType: TokenType.OPERATOR,
      synonyms: ['=', '==', 'equals', 'is', 'at'],
      category: 'comparison',
      confidence: 0.9
    },
    {
      term: 'and',
      tokenType: TokenType.OPERATOR,
      synonyms: ['&', '&&', 'also', 'plus', 'with'],
      category: 'logical',
      confidence: 0.95
    },
    {
      term: 'or',
      tokenType: TokenType.OPERATOR,
      synonyms: ['|', '||', 'either', 'alternatively'],
      category: 'logical',
      confidence: 0.95
    }
  ],

  // Modifiers and Qualifiers
  modifiers: [
    {
      term: 'when',
      tokenType: TokenType.MODIFIER,
      synonyms: ['if', 'whenever', 'once', 'as soon as'],
      category: 'conditional',
      confidence: 0.9
    },
    {
      term: 'then',
      tokenType: TokenType.MODIFIER,
      synonyms: ['do', 'execute', 'perform', 'trigger'],
      category: 'action',
      confidence: 0.9
    },
    {
      term: 'with',
      tokenType: TokenType.MODIFIER,
      synonyms: ['using', 'having', 'set to', 'configured as'],
      category: 'parameter',
      confidence: 0.8
    },
    {
      term: 'strategy',
      tokenType: TokenType.MODIFIER,
      synonyms: ['system', 'method', 'approach', 'plan'],
      category: 'general',
      confidence: 0.8
    },
    {
      term: 'create',
      tokenType: TokenType.MODIFIER,
      synonyms: ['build', 'make', 'generate', 'develop', 'design'],
      category: 'action',
      confidence: 0.9
    }
  ]
};

export class VocabularyMatcher {
  private vocabularyMap: Map<string, VocabularyEntry>;
  private synonymMap: Map<string, VocabularyEntry>;

  constructor() {
    this.vocabularyMap = new Map();
    this.synonymMap = new Map();
    this.buildMaps();
  }

  private buildMaps(): void {
    // Build vocabulary maps for fast lookup
    Object.values(TRADING_VOCABULARY).forEach(category => {
      category.forEach(entry => {
        // Add main term
        this.vocabularyMap.set(entry.term.toLowerCase(), entry);
        
        // Add synonyms
        entry.synonyms.forEach(synonym => {
          this.synonymMap.set(synonym.toLowerCase(), entry);
        });
      });
    });
  }

  public findMatch(term: string): VocabularyEntry | null {
    const normalizedTerm = term.toLowerCase().trim();
    
    // Try exact match first
    const exactMatch = this.vocabularyMap.get(normalizedTerm);
    if (exactMatch) {
      return exactMatch;
    }

    // Try synonym match
    const synonymMatch = this.synonymMap.get(normalizedTerm);
    if (synonymMatch) {
      return synonymMatch;
    }

    // Try partial matches for multi-word terms
    for (const [key, entry] of this.synonymMap.entries()) {
      if (key.includes(normalizedTerm) || normalizedTerm.includes(key)) {
        // Calculate confidence based on match quality
        const matchQuality = Math.min(key.length, normalizedTerm.length) / 
                           Math.max(key.length, normalizedTerm.length);
        
        if (matchQuality > 0.7) {
          return {
            ...entry,
            confidence: entry.confidence * matchQuality
          };
        }
      }
    }

    return null;
  }

  public findByCategory(category: string): VocabularyEntry[] {
    const results: VocabularyEntry[] = [];
    
    Object.values(TRADING_VOCABULARY).forEach(categoryEntries => {
      categoryEntries.forEach(entry => {
        if (entry.category === category) {
          results.push(entry);
        }
      });
    });

    return results;
  }

  public findByTokenType(tokenType: TokenType): VocabularyEntry[] {
    const results: VocabularyEntry[] = [];
    
    Object.values(TRADING_VOCABULARY).forEach(categoryEntries => {
      categoryEntries.forEach(entry => {
        if (entry.tokenType === tokenType) {
          results.push(entry);
        }
      });
    });

    return results;
  }

  public getAllTerms(): string[] {
    const terms: string[] = [];
    
    // Add main terms
    this.vocabularyMap.forEach((entry, term) => {
      terms.push(term);
    });

    // Add synonyms
    this.synonymMap.forEach((entry, synonym) => {
      terms.push(synonym);
    });

    return [...new Set(terms)]; // Remove duplicates
  }
}