/**
 * Template Integration System
 * 
 * Provides AI-enhanced template functionality while safely integrating
 * with the existing template system without any modifications.
 */

// Template Integration
export { TemplateIntegrator } from './template-integrator';
export type {
  TemplateIntegrationConfig,
  TemplateAnalysis,
  TemplateSuitability,
  PerformanceExpectation,
  TemplateImprovement
} from './template-integrator';

// Custom Template Generation
export { CustomTemplateGenerator } from './custom-generator';
export type {
  StrategyAnalysis,
  StrategyNode,
  StrategyConnection,
  PerformanceMetrics,
  RiskProfile,
  TemplateGenerationConfig,
  GenerationCriteria
} from './custom-generator';

// Template Customization
export { TemplateCustomizer } from './template-customizer';
export type {
  CustomizationSession,
  CustomizationRule,
  ValidationResult
} from './template-customizer';

// Template Suggestions
export { TemplateSuggestionEngine } from './suggestion-engine';
export type {
  UserProfile,
  MarketContext,
  SuggestionContext,
  TemplateSuggestion,
  SuggestionEngineConfig
} from './suggestion-engine';

// Re-export template types for convenience
export type {
  AITemplate,
  TemplateCustomization,
  AISuggestion,
  TemplateSearchCriteria,
  TemplateSearchResult,
  TemplateCategory,
  DifficultyLevel,
  TemplateComponent,
  TemplateParameterSet,
  TemplateParameters,
  TemplateParameter,
  AITemplateMetadata,
  TemplateBacktestResults,
  TemplateEducationalContent,
  ParameterCustomization,
  CustomizationPreferences
} from '../types/template-types';