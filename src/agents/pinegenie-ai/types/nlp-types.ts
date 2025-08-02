/**
 * Natural Language Processing Type Definitions
 */

export interface ParsedRequest {
  originalText: string;
  tokens: Token[];
  entities: Entity[];
  confidence: number;
  language?: string;
  processingTime?: number;
}

export interface Token {
  text: string;
  type: TokenType;
  position: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export enum TokenType {
  INDICATOR = 'indicator',
  ACTION = 'action',
  CONDITION = 'condition',
  PARAMETER = 'parameter',
  TIMEFRAME = 'timeframe',
  SYMBOL = 'symbol',
  NUMBER = 'number',
  OPERATOR = 'operator',
  MODIFIER = 'modifier',
  UNKNOWN = 'unknown',
}

export interface Entity {
  text: string;
  type: EntityType;
  value: unknown;
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export enum EntityType {
  INDICATOR_NAME = 'indicator_name',
  PARAMETER_VALUE = 'parameter_value',
  TIMEFRAME = 'timeframe',
  SYMBOL = 'symbol',
  THRESHOLD = 'threshold',
  PERCENTAGE = 'percentage',
  DURATION = 'duration',
}

export interface TradingIntent {
  strategyType: StrategyType;
  indicators: string[];
  conditions: string[];
  actions: string[];
  riskManagement: string[];
  timeframe?: string;
  symbol?: string;
  confidence: number;
  parameters?: Record<string, unknown>;
}

export enum StrategyType {
  TREND_FOLLOWING = 'trend-following',
  MEAN_REVERSION = 'mean-reversion',
  BREAKOUT = 'breakout',
  MOMENTUM = 'momentum',
  SCALPING = 'scalping',
  ARBITRAGE = 'arbitrage',
  CUSTOM = 'custom',
}

export interface StrategyParameters {
  [key: string]: ParameterValue;
}

export interface ParameterValue {
  value: unknown;
  type: 'number' | 'string' | 'boolean' | 'array';
  confidence: number;
  source: 'explicit' | 'inferred' | 'default';
}

export interface NLPResult {
  parsedRequest: ParsedRequest;
  tradingIntent: TradingIntent;
  parameters: StrategyParameters;
  suggestions?: string[];
  clarifications?: string[];
}