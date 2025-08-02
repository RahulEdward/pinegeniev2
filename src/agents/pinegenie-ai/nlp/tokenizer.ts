/**
 * Trading Text Tokenizer
 * 
 * Tokenizes natural language trading requests into meaningful tokens
 * using trading-specific vocabulary and patterns.
 */

import { Token, TokenType, Entity, EntityType } from '../types/nlp-types';
import { VocabularyMatcher, TRADING_VOCABULARY } from './vocabulary/trading-vocabulary';
import { AILogger } from '../core/logger';

export interface TokenizerOptions {
  preserveCase: boolean;
  includePositions: boolean;
  minTokenLength: number;
  maxTokenLength: number;
  enableFuzzyMatching: boolean;
}

export interface TokenizationResult {
  tokens: Token[];
  entities: Entity[];
  originalText: string;
  processingTime: number;
  confidence: number;
}

export class Tokenizer {
  private vocabularyMatcher: VocabularyMatcher;
  private logger: AILogger;
  private options: TokenizerOptions;

  // Common patterns for trading text
  private readonly patterns = {
    number: /\b\d+(?:\.\d+)?\b/g,
    percentage: /\b\d+(?:\.\d+)?%\b/g,
    symbol: /\b[A-Z]{2,10}(?:USD[T]?|BTC|ETH)?\b/g,
    timeframe: /\b\d+[mhd]\b/gi,
    operator: /[><=!]+/g,
    punctuation: /[.,;:!?()[\]{}]/g,
    whitespace: /\s+/g
  };

  constructor(options: Partial<TokenizerOptions> = {}) {
    this.vocabularyMatcher = new VocabularyMatcher();
    this.logger = AILogger.getInstance();
    
    this.options = {
      preserveCase: false,
      includePositions: true,
      minTokenLength: 1,
      maxTokenLength: 50,
      enableFuzzyMatching: true,
      ...options
    };
  }

  /**
   * Tokenize a trading request into meaningful tokens
   */
  public tokenize(text: string): TokenizationResult {
    const startTime = performance.now();
    
    this.logger.debug('Tokenizer', 'Starting tokenization', { 
      textLength: text.length,
      preview: text.substring(0, 100) 
    });

    try {
      // Step 1: Preprocess text
      const preprocessedText = this.preprocessText(text);
      
      // Step 2: Extract basic tokens
      const rawTokens = this.extractRawTokens(preprocessedText);
      
      // Step 3: Classify tokens using vocabulary
      const classifiedTokens = this.classifyTokens(rawTokens, preprocessedText);
      
      // Step 4: Extract entities
      const entities = this.extractEntities(classifiedTokens, preprocessedText);
      
      // Step 5: Post-process and validate
      const finalTokens = this.postProcessTokens(classifiedTokens);
      
      const processingTime = performance.now() - startTime;
      const confidence = this.calculateConfidence(finalTokens);

      this.logger.debug('Tokenizer', 'Tokenization completed', {
        tokenCount: finalTokens.length,
        entityCount: entities.length,
        confidence,
        processingTime: `${processingTime.toFixed(2)}ms`
      });

      return {
        tokens: finalTokens,
        entities,
        originalText: text,
        processingTime,
        confidence
      };

    } catch (error) {
      this.logger.error('Tokenizer', 'Tokenization failed', { error, text });
      
      // Return minimal result on error
      return {
        tokens: [],
        entities: [],
        originalText: text,
        processingTime: performance.now() - startTime,
        confidence: 0
      };
    }
  }

  /**
   * Preprocess text for better tokenization
   */
  private preprocessText(text: string): string {
    let processed = text;

    // Normalize whitespace
    processed = processed.replace(/\s+/g, ' ').trim();

    // Handle common contractions and abbreviations
    processed = processed.replace(/\bcan't\b/gi, 'cannot');
    processed = processed.replace(/\bwon't\b/gi, 'will not');
    processed = processed.replace(/\blet's\b/gi, 'let us');

    // Normalize case if not preserving
    if (!this.options.preserveCase) {
      processed = processed.toLowerCase();
    }

    // Add spaces around operators for better tokenization
    processed = processed.replace(/([><=!]+)/g, ' $1 ');

    // Normalize percentage signs
    processed = processed.replace(/(\d+)\s*%/g, '$1%');

    return processed;
  }

  /**
   * Extract raw tokens from preprocessed text
   */
  private extractRawTokens(text: string): Array<{ text: string; position: number }> {
    const tokens: Array<{ text: string; position: number }> = [];
    
    // Split by whitespace and punctuation, but keep track of positions
    const words = text.split(/(\s+|[.,;:!?()[\]{}])/);
    let position = 0;

    for (const word of words) {
      const trimmed = word.trim();
      
      if (trimmed.length >= this.options.minTokenLength && 
          trimmed.length <= this.options.maxTokenLength &&
          !/^\s*$/.test(trimmed) &&
          !/^[.,;:!?()[\]{}]+$/.test(trimmed)) {
        
        tokens.push({
          text: trimmed,
          position
        });
      }
      
      position += word.length;
    }

    return tokens;
  }

  /**
   * Classify tokens using trading vocabulary
   */
  private classifyTokens(rawTokens: Array<{ text: string; position: number }>, originalText: string): Token[] {
    const tokens: Token[] = [];

    for (const rawToken of rawTokens) {
      const token = this.classifyToken(rawToken.text, rawToken.position);
      tokens.push(token);
    }

    // Handle multi-word terms (like "moving average", "bollinger bands")
    const multiWordTokens = this.findMultiWordTokens(tokens, originalText);
    
    return this.mergeMultiWordTokens(tokens, multiWordTokens);
  }

  /**
   * Classify a single token
   */
  private classifyToken(text: string, position: number): Token {
    // Try vocabulary match first
    const vocabularyMatch = this.vocabularyMatcher.findMatch(text);
    
    if (vocabularyMatch) {
      return {
        text,
        type: vocabularyMatch.tokenType,
        position,
        confidence: vocabularyMatch.confidence,
        metadata: {
          category: vocabularyMatch.category,
          synonyms: vocabularyMatch.synonyms,
          ...vocabularyMatch.metadata
        }
      };
    }

    // Pattern-based classification
    const patternType = this.classifyByPattern(text);
    
    return {
      text,
      type: patternType.type,
      position,
      confidence: patternType.confidence,
      metadata: patternType.metadata
    };
  }

  /**
   * Classify token by patterns
   */
  private classifyByPattern(text: string): { type: TokenType; confidence: number; metadata?: Record<string, unknown> } {
    // Number pattern
    if (/^\d+(?:\.\d+)?$/.test(text)) {
      return {
        type: TokenType.NUMBER,
        confidence: 0.95,
        metadata: { value: parseFloat(text) }
      };
    }

    // Percentage pattern
    if (/^\d+(?:\.\d+)?%$/.test(text)) {
      return {
        type: TokenType.NUMBER,
        confidence: 0.95,
        metadata: { 
          value: parseFloat(text.replace('%', '')),
          unit: 'percentage'
        }
      };
    }

    // Symbol pattern (like BTCUSDT, EURUSD)
    if (/^[A-Z]{2,10}(?:USD[T]?|BTC|ETH)?$/i.test(text)) {
      return {
        type: TokenType.SYMBOL,
        confidence: 0.8,
        metadata: { symbol: text.toUpperCase() }
      };
    }

    // Timeframe pattern (like 1h, 5m, 1d)
    if (/^\d+[mhd]$/i.test(text)) {
      return {
        type: TokenType.TIMEFRAME,
        confidence: 0.9,
        metadata: { timeframe: text.toLowerCase() }
      };
    }

    // Operator pattern
    if (/^[><=!]+$/.test(text)) {
      return {
        type: TokenType.OPERATOR,
        confidence: 0.9,
        metadata: { operator: text }
      };
    }

    // Default to unknown
    return {
      type: TokenType.UNKNOWN,
      confidence: 0.1
    };
  }

  /**
   * Find multi-word terms in the token sequence
   */
  private findMultiWordTokens(tokens: Token[], originalText: string): Array<{ startIndex: number; endIndex: number; match: any }> {
    const multiWordMatches: Array<{ startIndex: number; endIndex: number; match: any }> = [];
    
    // Look for common multi-word trading terms
    const multiWordTerms = [
      'moving average',
      'bollinger bands',
      'relative strength index',
      'exponential moving average',
      'simple moving average',
      'stochastic oscillator',
      'average true range',
      'stop loss',
      'take profit'
    ];

    for (const term of multiWordTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(originalText)) !== null) {
        const vocabularyMatch = this.vocabularyMatcher.findMatch(term);
        
        if (vocabularyMatch) {
          // Find corresponding token indices
          const startIndex = this.findTokenIndexByPosition(tokens, match.index);
          const endIndex = this.findTokenIndexByPosition(tokens, match.index + match[0].length);
          
          if (startIndex !== -1 && endIndex !== -1) {
            multiWordMatches.push({
              startIndex,
              endIndex,
              match: vocabularyMatch
            });
          }
        }
      }
    }

    return multiWordMatches;
  }

  /**
   * Find token index by text position
   */
  private findTokenIndexByPosition(tokens: Token[], position: number): number {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].position <= position && 
          tokens[i].position + tokens[i].text.length > position) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Merge multi-word tokens
   */
  private mergeMultiWordTokens(tokens: Token[], multiWordMatches: Array<{ startIndex: number; endIndex: number; match: any }>): Token[] {
    // Sort matches by start index (descending) to avoid index shifting issues
    multiWordMatches.sort((a, b) => b.startIndex - a.startIndex);

    let mergedTokens = [...tokens];

    for (const match of multiWordMatches) {
      const tokensToMerge = mergedTokens.slice(match.startIndex, match.endIndex + 1);
      const mergedText = tokensToMerge.map(t => t.text).join(' ');
      
      const mergedToken: Token = {
        text: mergedText,
        type: match.match.tokenType,
        position: tokensToMerge[0].position,
        confidence: match.match.confidence,
        metadata: {
          category: match.match.category,
          synonyms: match.match.synonyms,
          multiWord: true,
          originalTokens: tokensToMerge.length,
          ...match.match.metadata
        }
      };

      // Replace the tokens with the merged token
      mergedTokens.splice(match.startIndex, match.endIndex - match.startIndex + 1, mergedToken);
    }

    return mergedTokens;
  }

  /**
   * Extract entities from classified tokens
   */
  private extractEntities(tokens: Token[], originalText: string): Entity[] {
    const entities: Entity[] = [];

    for (const token of tokens) {
      const entity = this.tokenToEntity(token);
      if (entity) {
        entities.push(entity);
      }
    }

    return entities;
  }

  /**
   * Convert token to entity if applicable
   */
  private tokenToEntity(token: Token): Entity | null {
    let entityType: EntityType | null = null;
    let value: unknown = token.text;

    switch (token.type) {
      case TokenType.INDICATOR:
        entityType = EntityType.INDICATOR_NAME;
        break;
      case TokenType.NUMBER:
        entityType = EntityType.PARAMETER_VALUE;
        value = token.metadata?.value || parseFloat(token.text);
        break;
      case TokenType.TIMEFRAME:
        entityType = EntityType.TIMEFRAME;
        value = token.metadata?.timeframe || token.text;
        break;
      case TokenType.SYMBOL:
        entityType = EntityType.SYMBOL;
        value = token.metadata?.symbol || token.text;
        break;
      case TokenType.PARAMETER:
        if (token.text.includes('%')) {
          entityType = EntityType.PERCENTAGE;
          value = parseFloat(token.text.replace('%', ''));
        } else {
          entityType = EntityType.PARAMETER_VALUE;
        }
        break;
    }

    if (entityType) {
      return {
        text: token.text,
        type: entityType,
        value,
        confidence: token.confidence,
        startIndex: token.position,
        endIndex: token.position + token.text.length
      };
    }

    return null;
  }

  /**
   * Post-process tokens for final cleanup
   */
  private postProcessTokens(tokens: Token[]): Token[] {
    // Remove very low confidence tokens
    const filtered = tokens.filter(token => token.confidence > 0.1);

    // Sort by position
    filtered.sort((a, b) => a.position - b.position);

    return filtered;
  }

  /**
   * Calculate overall confidence score
   */
  private calculateConfidence(tokens: Token[]): number {
    if (tokens.length === 0) return 0;

    const totalConfidence = tokens.reduce((sum, token) => sum + token.confidence, 0);
    const averageConfidence = totalConfidence / tokens.length;

    // Boost confidence if we found trading-specific terms
    const tradingTerms = tokens.filter(token => 
      token.type === TokenType.INDICATOR || 
      token.type === TokenType.ACTION || 
      token.type === TokenType.CONDITION
    );

    const tradingTermBoost = Math.min(tradingTerms.length * 0.1, 0.3);

    return Math.min(averageConfidence + tradingTermBoost, 1.0);
  }

  /**
   * Get tokenizer statistics
   */
  public getStatistics(): {
    vocabularySize: number;
    supportedTokenTypes: TokenType[];
    supportedEntityTypes: EntityType[];
  } {
    return {
      vocabularySize: this.vocabularyMatcher.getAllTerms().length,
      supportedTokenTypes: Object.values(TokenType),
      supportedEntityTypes: Object.values(EntityType)
    };
  }
}