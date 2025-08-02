/**
 * Template System Type Definitions
 */

export interface AITemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  difficulty: DifficultyLevel;
  components: TemplateComponent[];
  parameters: TemplateParameterSet;
  metadata: AITemplateMetadata;
}

export enum TemplateCategory {
  TREND_FOLLOWING = 'trend-following',
  MEAN_REVERSION = 'mean-reversion',
  BREAKOUT = 'breakout',
  MOMENTUM = 'momentum',
  SCALPING = 'scalping',
  ARBITRAGE = 'arbitrage',
  RISK_MANAGEMENT = 'risk-management',
  CUSTOM = 'custom',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export interface TemplateComponent {
  id: string;
  type: string;
  label: string;
  description: string;
  required: boolean;
  defaultParameters: Record<string, unknown>;
  constraints?: ComponentConstraints;
}

export interface ComponentConstraints {
  minConnections?: number;
  maxConnections?: number;
  allowedConnections?: string[];
  position?: PositionConstraint;
}

export interface PositionConstraint {
  x?: { min?: number; max?: number; preferred?: number };
  y?: { min?: number; max?: number; preferred?: number };
  relativeTo?: string;
}

export interface TemplateParameterSet {
  [componentId: string]: TemplateParameters;
}

export interface TemplateParameters {
  [parameterName: string]: TemplateParameter;
}

export interface TemplateParameter {
  value: unknown;
  type: 'int' | 'float' | 'bool' | 'string' | 'source' | 'color';
  range?: [number, number];
  options?: unknown[];
  description: string;
  customizable: boolean;
  aiOptimizable: boolean;
}

export interface AITemplateMetadata {
  createdAt: Date;
  updatedAt: Date;
  version: string;
  author: string;
  tags: string[];
  usageCount: number;
  rating: number; // 0-5
  aiGenerated: boolean;
  backtestResults?: TemplateBacktestResults;
  educationalContent?: TemplateEducationalContent;
}

export interface TemplateBacktestResults {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  period: {
    start: Date;
    end: Date;
  };
  marketConditions: string[];
}

export interface TemplateEducationalContent {
  overview: string;
  keyConceptsExplained: string[];
  whenToUse: string[];
  whenNotToUse: string[];
  commonMistakes: string[];
  optimizationTips: string[];
  relatedStrategies: string[];
}

export interface TemplateCustomization {
  templateId: string;
  customizations: ParameterCustomization[];
  userPreferences: CustomizationPreferences;
  aiSuggestions: AISuggestion[];
}

export interface ParameterCustomization {
  componentId: string;
  parameterName: string;
  originalValue: unknown;
  customValue: unknown;
  reasoning?: string;
}

export interface CustomizationPreferences {
  riskTolerance: 'low' | 'medium' | 'high';
  timeframe: string;
  tradingStyle: 'conservative' | 'moderate' | 'aggressive';
  preferredIndicators: string[];
  avoidedIndicators: string[];
}

export interface AISuggestion {
  id: string;
  type: 'parameter' | 'component' | 'structure';
  description: string;
  reasoning: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  autoApply: boolean;
}

export interface TemplateSearchCriteria {
  category?: TemplateCategory;
  difficulty?: DifficultyLevel;
  tags?: string[];
  minRating?: number;
  maxComplexity?: number;
  timeframes?: string[];
  indicators?: string[];
}

export interface TemplateSearchResult {
  templates: AITemplate[];
  totalCount: number;
  searchTime: number;
  suggestions: string[];
}