/**
 * Natural Language Processing Module
 * 
 * This module handles parsing and understanding of natural language
 * trading requests from users.
 */

// Main NLP processor
export { NaturalLanguageProcessor } from './natural-language-processor';

// Individual components
export { Tokenizer } from './tokenizer';
export { IntentExtractor } from './intent-extractor';
export { ParameterExtractor } from './parameter-extractor';
export { ContextEngine } from './context-engine';

// Vocabulary and patterns
export { VocabularyMatcher, TRADING_VOCABULARY } from './vocabulary';
export { PatternMatcher, TRADING_PATTERNS } from './patterns';

// Types
export type { 
  ParsedRequest, 
  TradingIntent, 
  StrategyParameters,
  Token,
  Entity,
  NLPResult,
  TokenType,
  EntityType,
  StrategyType
} from '../types/nlp-types';

// Component-specific types
export type { TokenizationResult } from './tokenizer';
export type { IntentExtractionResult } from './intent-extractor';
export type { ParameterExtractionResult } from './parameter-extractor';
export type { VocabularyEntry, TradingPattern } from './vocabulary/trading-vocabulary';