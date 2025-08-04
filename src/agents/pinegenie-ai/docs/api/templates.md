# Template Integration API

The Template Integration module provides seamless integration with existing PineGenie templates, AI-powered template generation, and intelligent template suggestions. It extends the template system without modifying existing functionality.

## 📋 **Table of Contents**

- [Core Classes](#core-classes)
- [Interfaces](#interfaces)
- [Methods](#methods)
- [Usage Examples](#usage-examples)
- [Template Generation](#template-generation)
- [Integration Patterns](#integration-patterns)

## 🏗 **Core Classes**

### `TemplateIntegrator`

Main class for integrating with existing template system and providing AI enhancements.

```typescript
class TemplateIntegrator {
  constructor(config?: TemplateIntegratorConfig);
  
  // Template integration
  async loadExistingTemplates(): Promise<StrategyTemplate[]>;
  async enhanceTemplate(template: StrategyTemplate): Promise<EnhancedTemplate>;
  async customizeTemplate(template: StrategyTemplate, customizations: TemplateCustomization[]): Promise<CustomizedTemplate>;
  
  // AI-powered suggestions
  async suggestTemplates(userRequest: string): Promise<TemplateSuggestion[]>;
  async suggestCustomizations(template: StrategyTemplate, userProfile: UserProfile): Promise<CustomizationSuggestion[]>;
  
  // Template validation
  async validateTemplate(template: StrategyTemplate): Promise<TemplateValidationResult>;
  async validateCustomization(customization: TemplateCustomization): Promise<CustomizationValidationResult>;
  
  // Template management
  async saveCustomTemplate(template: CustomTemplate): Promise<string>;
  async shareTemplate(templateId: string, shareOptions: ShareOptions): Promise<ShareResult>;
  async importTemplate(templateData: TemplateData): Promise<ImportResult>;
}
```

### `CustomGenerator`

Generates custom templates from successful strategies and user patterns.

```typescript
class CustomGenerator {
  constructor(config?: GeneratorConfig);
  
  // Template generation
  async generateFromStrategy(strategy: Strategy): Promise<GeneratedTemplate>;
  async generateFromUserPatterns(userId: string, patterns: UserPattern[]): Promise<PersonalizedTemplate>;
  async generateVariations(baseTemplate: StrategyTemplate, variationCount: number): Promise<TemplateVariation[]>;
  
  // Pattern analysis
  async analyzeSuccessfulStrategies(strategies: Strategy[]): Promise<StrategyPattern[]>;
  async identifyCommonPatterns(templates: StrategyTemplate[]): Promise<CommonPattern[]>;
  
  // Template optimization
  async optimizeTemplate(template: StrategyTemplate, objective: OptimizationObjective): Promise<OptimizedTemplate>;
  async validateGeneratedTemplate(template: GeneratedTemplate): Promise<ValidationResult>;
  
  // Community features
  async generateCommunityTemplate(contributions: CommunityContribution[]): Promise<CommunityTemplate>;
  async rankTemplatesByPopularity(templates: StrategyTemplate[]): Promise<RankedTemplate[]>;
}
```

### `TemplateCustomizer`

Handles template customization and parameter adjustment.

```typescript
class TemplateCustomizer {
  constructor(config?: CustomizerConfig);
  
  // Customization operations
  async applyCustomizations(template: StrategyTemplate, customizations: TemplateCustomization[]): Promise<CustomizedTemplate>;
  async previewCustomization(template: StrategyTemplate, customization: TemplateCustomization): Promise<CustomizationPreview>;
  
  // Parameter management
  async adjustParameters(template: StrategyTemplate, adjustments: ParameterAdjustment[]): Promise<AdjustedTemplate>;
  async suggestParameterRanges(template: StrategyTemplate): Promise<ParameterRange[]>;
  
  // Component modification
  async addComponent(template: StrategyTemplate, component: TemplateComponent): Promise<ModifiedTemplate>;
  async removeComponent(template: StrategyTemplate, componentId: string): Promise<ModifiedTemplate>;
  async replaceComponent(template: StrategyTemplate, oldComponentId: string, newComponent: TemplateComponent): Promise<ModifiedTemplate>;
  
  // Validation and testing
  async validateCustomization(customization: TemplateCustomization): Promise<ValidationResult>;
  async testCustomizedTemplate(template: CustomizedTemplate, testData: MarketData[]): Promise<TestResult>;
}
```

### `SuggestionEngine`

Provides intelligent template suggestions based on user input and context.

```typescript
class SuggestionEngine {
  constructor(knowledgeBase?: TemplateKnowledgeBase);
  
  // Suggestion generation
  async suggestTemplatesForRequest(request: string, context?: SuggestionContext): Promise<TemplateSuggestion[]>;
  async suggestSimilarTemplates(template: StrategyTemplate): Promise<SimilarTemplate[]>;
  async suggestImprovements(template: StrategyTemplate): Promise<ImprovementSuggestion[]>;
  
  // Personalization
  async personalizeRecommendations(userId: string, preferences: UserPreferences): Promise<PersonalizedSuggestion[]>;
  async adaptToUserBehavior(userId: string, interactions: TemplateInteraction[]): Promise<void>;
  
  // Context-aware suggestions
  async suggestForMarketConditions(conditions: MarketCondition[]): Promise<ConditionalSuggestion[]>;
  async suggestForTimeframe(timeframe: string): Promise<TimeframeSuggestion[]>;
  async suggestForRiskProfile(riskProfile: RiskProfile): Promise<RiskBasedSuggestion[]>;
  
  // Learning and improvement
  async updateSuggestionModel(feedback: SuggestionFeedback[]): Promise<void>;
  async analyzeSuggestionEffectiveness(): Promise<EffectivenessReport>;
}
```

## 🔧 **Interfaces**

### Core Types

```typescript
interface EnhancedTemplate extends StrategyTemplate {
  aiEnhancements: AIEnhancement[];
  customizationOptions: CustomizationOption[];
  suggestedParameters: SuggestedParameter[];
  performanceMetrics: TemplatePerformanceMetrics;
  usageAnalytics: TemplateUsageAnalytics;
  relatedTemplates: RelatedTemplate[];
}

interface TemplateCustomization {
  id: string;
  type: CustomizationType;
  targetComponent?: string;
  targetParameter?: string;
  value: any;
  reason: string;
  impact: CustomizationImpact;
  reversible: boolean;
}

interface TemplateSuggestion {
  template: StrategyTemplate;
  relevanceScore: number;
  matchingCriteria: string[];
  customizationSuggestions: CustomizationSuggestion[];
  explanation: string;
  pros: string[];
  cons: string[];
  difficulty: TemplateDifficulty;
  estimatedPerformance: PerformanceEstimate;
}

interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  components: TemplateComponent[];
  parameters: TemplateParameter[];
  sourceStrategies: string[];
  generationMethod: GenerationMethod;
  confidence: number;
  validation: ValidationResult;
  metadata: GenerationMetadata;
}
```

### Configuration Types

```typescript
interface TemplateIntegratorConfig {
  enableAIEnhancements: boolean;
  enableCustomization: boolean;
  enableSuggestions: boolean;
  cacheTemplates: boolean;
  maxSuggestions: number;
  suggestionThreshold: number;
  customizationLimits: CustomizationLimits;
  integrationMode: IntegrationMode;
}

interface GeneratorConfig {
  generationAlgorithm: GenerationAlgorithm;
  minStrategyCount: number;
  confidenceThreshold: number;
  enableVariations: boolean;
  maxVariations: number;
  communityFeatures: boolean;
  qualityFilters: QualityFilter[];
}

interface CustomizerConfig {
  allowedCustomizations: CustomizationType[];
  parameterConstraints: ParameterConstraint[];
  validationRules: ValidationRule[];
  previewMode: boolean;
  backupOriginal: boolean;
  maxCustomizations: number;
}
```

### Template Types

```typescript
enum CustomizationType {
  PARAMETER_ADJUSTMENT = 'parameter-adjustment',
  COMPONENT_ADDITION = 'component-addition',
  COMPONENT_REMOVAL = 'component-removal',
  COMPONENT_REPLACEMENT = 'component-replacement',
  LOGIC_MODIFICATION = 'logic-modification',
  RISK_ADJUSTMENT = 'risk-adjustment'
}

enum TemplateDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

enum GenerationMethod {
  PATTERN_ANALYSIS = 'pattern-analysis',
  GENETIC_PROGRAMMING = 'genetic-programming',
  NEURAL_NETWORK = 'neural-network',
  RULE_BASED = 'rule-based',
  HYBRID = 'hybrid'
}
```

## 📖 **Methods**

### `suggestTemplates(userRequest: string): Promise<TemplateSuggestion[]>`

Suggests relevant templates based on user request using AI analysis.

**Parameters:**
- `userRequest` (string): User's strategy request or description

**Returns:**
- `Promise<TemplateSuggestion[]>`: Array of relevant template suggestions

**Example:**
```typescript
const templateIntegrator = new TemplateIntegrator({
  enableAIEnhancements: true,
  enableSuggestions: true,
  maxSuggestions: 5
});

const userRequest = "I want a strategy that uses RSI and MACD for swing trading";
const suggestions = await templateIntegrator.suggestTemplates(userRequest);

suggestions.forEach((suggestion, index) => {
  console.log(`\n${index + 1}. ${suggestion.template.name}`);
  console.log(`   Relevance: ${(suggestion.relevanceScore * 100).toFixed(1)}%`);
  console.log(`   Difficulty: ${suggestion.difficulty}`);
  console.log(`   Description: ${suggestion.template.description}`);
  console.log(`   Explanation: ${suggestion.explanation}`);
  
  if (suggestion.pros.length > 0) {
    console.log(`   Pros: ${suggestion.pros.join(', ')}`);
  }
  
  if (suggestion.cons.length > 0) {
    console.log(`   Cons: ${suggestion.cons.join(', ')}`);
  }
  
  if (suggestion.customizationSuggestions.length > 0) {
    console.log(`   Suggested customizations:`);
    suggestion.customizationSuggestions.forEach(custom => {
      console.log(`     • ${custom.description}`);
    });
  }
});
```

### `customizeTemplate(template: StrategyTemplate, customizations: TemplateCustomization[]): Promise<CustomizedTemplate>`

Applies customizations to an existing template.

**Parameters:**
- `template` (StrategyTemplate): Base template to customize
- `customizations` (TemplateCustomization[]): Array of customizations to apply

**Returns:**
- `Promise<CustomizedTemplate>`: Customized template with applied changes

**Example:**
```typescript
const templateCustomizer = new TemplateCustomizer({
  allowedCustomizations: [
    CustomizationType.PARAMETER_ADJUSTMENT,
    CustomizationType.COMPONENT_ADDITION,
    CustomizationType.RISK_ADJUSTMENT
  ],
  previewMode: true
});

// Load base template
const baseTemplate = await templateIntegrator.loadExistingTemplates()
  .then(templates => templates.find(t => t.name === 'RSI Oversold/Overbought'));

// Define customizations
const customizations: TemplateCustomization[] = [
  {
    id: 'rsi-period-adjustment',
    type: CustomizationType.PARAMETER_ADJUSTMENT,
    targetParameter: 'rsi.period',
    value: 21,
    reason: 'Adjust RSI period for better sensitivity',
    impact: CustomizationImpact.MODERATE,
    reversible: true
  },
  {
    id: 'add-stop-loss',
    type: CustomizationType.COMPONENT_ADDITION,
    value: {
      type: 'risk-management',
      subtype: 'stop-loss',
      parameters: { percentage: 2.0 }
    },
    reason: 'Add stop loss for better risk management',
    impact: CustomizationImpact.HIGH,
    reversible: true
  },
  {
    id: 'adjust-thresholds',
    type: CustomizationType.PARAMETER_ADJUSTMENT,
    targetParameter: 'rsi.oversold',
    value: 25,
    reason: 'More conservative oversold threshold',
    impact: CustomizationImpact.LOW,
    reversible: true
  }
];

// Preview customizations first
for (const customization of customizations) {
  const preview = await templateCustomizer.previewCustomization(baseTemplate, customization);
  console.log(`Preview: ${customization.reason}`);
  console.log(`Expected impact: ${preview.expectedImpact}`);
  console.log(`Potential issues: ${preview.warnings.join(', ')}`);
}

// Apply customizations
const customizedTemplate = await templateCustomizer.applyCustomizations(baseTemplate, customizations);

console.log(`\nCustomized Template: ${customizedTemplate.name}`);
console.log(`Base template: ${baseTemplate.name}`);
console.log(`Applied customizations: ${customizations.length}`);
console.log(`Customization summary:`);
customizedTemplate.appliedCustomizations.forEach(custom => {
  console.log(`  • ${custom.description} (${custom.impact} impact)`);
});
```

### `generateFromStrategy(strategy: Strategy): Promise<GeneratedTemplate>`

Generates a reusable template from a successful strategy.

**Parameters:**
- `strategy` (Strategy): Strategy to convert into a template

**Returns:**
- `Promise<GeneratedTemplate>`: Generated template with parameterized components

**Example:**
```typescript
const customGenerator = new CustomGenerator({
  generationAlgorithm: GenerationAlgorithm.PATTERN_ANALYSIS,
  confidenceThreshold: 0.8,
  enableVariations: true
});

// Load a successful strategy
const successfulStrategy = await loadStrategy('my-profitable-rsi-strategy');

// Generate template from strategy
const generatedTemplate = await customGenerator.generateFromStrategy(successfulStrategy);

console.log(`Generated Template: ${generatedTemplate.name}`);
console.log(`Description: ${generatedTemplate.description}`);
console.log(`Category: ${generatedTemplate.category}`);
console.log(`Confidence: ${(generatedTemplate.confidence * 100).toFixed(1)}%`);
console.log(`Generation method: ${generatedTemplate.generationMethod}`);

console.log(`\nComponents (${generatedTemplate.components.length}):`);
generatedTemplate.components.forEach(component => {
  console.log(`  • ${component.label} (${component.type})`);
});

console.log(`\nParameters (${generatedTemplate.parameters.length}):`);
generatedTemplate.parameters.forEach(param => {
  console.log(`  • ${param.name}: ${param.defaultValue} (${param.type})`);
  console.log(`    Range: ${param.minValue} - ${param.maxValue}`);
  console.log(`    Description: ${param.description}`);
});

// Validate the generated template
if (generatedTemplate.validation.valid) {
  console.log(`\n✅ Template validation passed`);
  
  // Save the template
  const templateId = await templateIntegrator.saveCustomTemplate({
    ...generatedTemplate,
    isPublic: true,
    tags: ['ai-generated', 'rsi', 'profitable']
  });
  
  console.log(`Template saved with ID: ${templateId}`);
} else {
  console.log(`\n❌ Template validation failed:`);
  generatedTemplate.validation.errors.forEach(error => {
    console.log(`  • ${error.message}`);
  });
}
```

## 💡 **Usage Examples**

### Smart Template Recommendation System

```typescript
import { TemplateIntegrator, SuggestionEngine } from '@/agents/pinegenie-ai/templates';

const createSmartRecommendationSystem = (userId: string) => {
  const templateIntegrator = new TemplateIntegrator({
    enableAIEnhancements: true,
    enableSuggestions: true,
    maxSuggestions: 10
  });

  const suggestionEngine = new SuggestionEngine();

  const recommendTemplates = async (userRequest: string, context?: any) => {
    try {
      // Get user preferences and history
      const userPreferences = await getUserPreferences(userId);
      const userHistory = await getUserTemplateHistory(userId);
      
      // Generate suggestions based on request
      const suggestions = await templateIntegrator.suggestTemplates(userRequest);
      
      // Personalize recommendations
      const personalizedSuggestions = await suggestionEngine.personalizeRecommendations(
        userId,
        userPreferences
      );
      
      // Combine and rank suggestions
      const combinedSuggestions = combineAndRankSuggestions(
        suggestions,
        personalizedSuggestions,
        userHistory
      );
      
      // Enhance suggestions with AI insights
      const enhancedSuggestions = await Promise.all(
        combinedSuggestions.map(async (suggestion) => {
          const enhancement = await templateIntegrator.enhanceTemplate(suggestion.template);
          const customizations = await suggestionEngine.suggestImprovements(suggestion.template);
          
          return {
            ...suggestion,
            enhancement,
            customizations,
            aiInsights: generateAIInsights(suggestion.template, userPreferences)
          };
        })
      );
      
      return enhancedSuggestions;
    } catch (error) {
      console.error('Template recommendation failed:', error);
      throw error;
    }
  };

  const combineAndRankSuggestions = (
    suggestions: TemplateSuggestion[],
    personalizedSuggestions: PersonalizedSuggestion[],
    userHistory: TemplateUsageHistory[]
  ) => {
    // Combine suggestions
    const combined = [...suggestions];
    
    // Add personalized suggestions
    personalizedSuggestions.forEach(personal => {
      const existing = combined.find(s => s.template.id === personal.templateId);
      if (existing) {
        existing.relevanceScore += personal.personalizedScore * 0.3;
      } else {
        combined.push({
          template: personal.template,
          relevanceScore: personal.personalizedScore,
          matchingCriteria: personal.reasons,
          customizationSuggestions: [],
          explanation: personal.explanation,
          pros: personal.benefits,
          cons: [],
          difficulty: personal.difficulty,
          estimatedPerformance: personal.expectedPerformance
        });
      }
    });
    
    // Boost score for previously successful templates
    userHistory.forEach(history => {
      const suggestion = combined.find(s => s.template.id === history.templateId);
      if (suggestion && history.performance > 0.7) {
        suggestion.relevanceScore += 0.2; // Boost successful templates
      }
    });
    
    // Sort by relevance score
    return combined.sort((a, b) => b.relevanceScore - a.relevanceScore);
  };

  const generateAIInsights = (template: StrategyTemplate, preferences: UserPreferences) => {
    const insights = [];
    
    // Market condition insights
    if (template.category === 'trend-following' && preferences.preferredMarkets.includes('volatile')) {
      insights.push('This trend-following strategy works well in volatile markets like crypto');
    }
    
    // Risk insights
    if (template.riskLevel > preferences.riskTolerance) {
      insights.push('Consider adding additional risk management components');
    }
    
    // Timeframe insights
    if (template.recommendedTimeframes.includes(preferences.preferredTimeframe)) {
      insights.push(`Optimized for ${preferences.preferredTimeframe} timeframe trading`);
    }
    
    return insights;
  };

  return {
    recommendTemplates,
    updateUserPreferences: async (preferences: UserPreferences) => {
      await saveUserPreferences(userId, preferences);
    },
    trackTemplateUsage: async (templateId: string, performance: number) => {
      await trackTemplateUsage(userId, templateId, performance);
    }
  };
};

// Usage example
const recommendationSystem = createSmartRecommendationSystem('user123');

const handleUserRequest = async (request: string) => {
  const recommendations = await recommendationSystem.recommendTemplates(request);
  
  console.log(`Found ${recommendations.length} template recommendations:`);
  
  recommendations.slice(0, 5).forEach((rec, index) => {
    console.log(`\n${index + 1}. ${rec.template.name}`);
    console.log(`   Score: ${(rec.relevanceScore * 100).toFixed(1)}%`);
    console.log(`   ${rec.explanation}`);
    
    if (rec.aiInsights && rec.aiInsights.length > 0) {
      console.log(`   AI Insights:`);
      rec.aiInsights.forEach(insight => {
        console.log(`     💡 ${insight}`);
      });
    }
    
    if (rec.customizations && rec.customizations.length > 0) {
      console.log(`   Suggested improvements:`);
      rec.customizations.slice(0, 3).forEach(custom => {
        console.log(`     🔧 ${custom.description}`);
      });
    }
  });
};
```

### Advanced Template Generation Pipeline

```typescript
import { CustomGenerator, TemplateCustomizer, SuggestionEngine } from '@/agents/pinegenie-ai/templates';

const createTemplateGenerationPipeline = () => {
  const generator = new CustomGenerator({
    generationAlgorithm: GenerationAlgorithm.HYBRID,
    enableVariations: true,
    maxVariations: 5,
    communityFeatures: true
  });

  const customizer = new TemplateCustomizer();
  const suggestionEngine = new SuggestionEngine();

  const generateTemplateFromCommunityData = async (communityData: CommunityData) => {
    try {
      // Step 1: Analyze successful strategies from community
      const successfulStrategies = communityData.strategies.filter(s => s.performance > 0.8);
      const patterns = await generator.analyzeSuccessfulStrategies(successfulStrategies);
      
      console.log(`Analyzed ${successfulStrategies.length} successful strategies`);
      console.log(`Found ${patterns.length} common patterns`);
      
      // Step 2: Generate base templates from patterns
      const baseTemplates = await Promise.all(
        patterns.slice(0, 3).map(async (pattern) => {
          const template = await generator.generateFromUserPatterns('community', [pattern]);
          return template;
        })
      );
      
      console.log(`Generated ${baseTemplates.length} base templates`);
      
      // Step 3: Create variations of each template
      const allTemplates = [];
      for (const baseTemplate of baseTemplates) {
        const variations = await generator.generateVariations(baseTemplate, 3);
        allTemplates.push(baseTemplate, ...variations);
      }
      
      console.log(`Created ${allTemplates.length} total templates (including variations)`);
      
      // Step 4: Optimize each template
      const optimizedTemplates = await Promise.all(
        allTemplates.map(async (template) => {
          const optimized = await generator.optimizeTemplate(template, {
            name: 'Maximize Sharpe Ratio',
            type: ObjectiveType.MAXIMIZE,
            weight: 1.0,
            evaluator: (strategy, data) => calculateSharpeRatio(strategy, data)
          });
          return optimized;
        })
      );
      
      // Step 5: Validate and filter templates
      const validatedTemplates = [];
      for (const template of optimizedTemplates) {
        const validation = await generator.validateGeneratedTemplate(template);
        if (validation.valid && validation.score > 0.7) {
          validatedTemplates.push({
            ...template,
            validation
          });
        }
      }
      
      console.log(`${validatedTemplates.length} templates passed validation`);
      
      // Step 6: Rank templates by community potential
      const rankedTemplates = await generator.rankTemplatesByPopularity(validatedTemplates);
      
      // Step 7: Generate community template
      const communityTemplate = await generator.generateCommunityTemplate(
        communityData.contributions
      );
      
      return {
        individualTemplates: rankedTemplates,
        communityTemplate,
        generationStats: {
          totalStrategiesAnalyzed: successfulStrategies.length,
          patternsFound: patterns.length,
          templatesGenerated: allTemplates.length,
          templatesValidated: validatedTemplates.length,
          finalTemplates: rankedTemplates.length
        }
      };
    } catch (error) {
      console.error('Template generation pipeline failed:', error);
      throw error;
    }
  };

  const customizeTemplateForUser = async (
    template: StrategyTemplate,
    userId: string,
    userRequirements: UserRequirements
  ) => {
    try {
      // Get user-specific customization suggestions
      const userProfile = await getUserProfile(userId);
      const customizationSuggestions = await suggestionEngine.suggestCustomizations(
        template,
        userProfile
      );
      
      // Filter suggestions based on user requirements
      const relevantSuggestions = customizationSuggestions.filter(suggestion => {
        return matchesUserRequirements(suggestion, userRequirements);
      });
      
      // Convert suggestions to customizations
      const customizations: TemplateCustomization[] = relevantSuggestions.map(suggestion => ({
        id: generateId(),
        type: suggestion.type,
        targetComponent: suggestion.targetComponent,
        targetParameter: suggestion.targetParameter,
        value: suggestion.suggestedValue,
        reason: suggestion.reason,
        impact: suggestion.estimatedImpact,
        reversible: true
      }));
      
      // Apply customizations
      const customizedTemplate = await customizer.applyCustomizations(template, customizations);
      
      // Test the customized template
      const testData = await getHistoricalMarketData(userRequirements.symbol, userRequirements.timeframe);
      const testResult = await customizer.testCustomizedTemplate(customizedTemplate, testData);
      
      return {
        customizedTemplate,
        appliedCustomizations: customizations,
        testResult,
        userProfile
      };
    } catch (error) {
      console.error('Template customization failed:', error);
      throw error;
    }
  };

  const matchesUserRequirements = (suggestion: CustomizationSuggestion, requirements: UserRequirements): boolean => {
    // Check if suggestion aligns with user requirements
    if (requirements.riskTolerance === 'low' && suggestion.type === CustomizationType.RISK_ADJUSTMENT) {
      return suggestion.suggestedValue <= requirements.maxRisk;
    }
    
    if (requirements.preferredIndicators && suggestion.targetComponent) {
      return requirements.preferredIndicators.includes(suggestion.targetComponent);
    }
    
    return true;
  };

  return {
    generateTemplateFromCommunityData,
    customizeTemplateForUser,
    generateVariationsForTemplate: async (template: StrategyTemplate, count: number) => {
      return generator.generateVariations(template, count);
    },
    optimizeTemplateForObjective: async (template: StrategyTemplate, objective: OptimizationObjective) => {
      return generator.optimizeTemplate(template, objective);
    }
  };
};

// Usage example
const pipeline = createTemplateGenerationPipeline();

const runTemplateGeneration = async () => {
  // Simulate community data
  const communityData: CommunityData = {
    strategies: await loadCommunityStrategies(),
    contributions: await loadCommunityContributions(),
    feedback: await loadCommunityFeedback()
  };
  
  // Generate templates from community data
  const result = await pipeline.generateTemplateFromCommunityData(communityData);
  
  console.log('Template Generation Results:');
  console.log(`Generated ${result.individualTemplates.length} individual templates`);
  console.log(`Community template: ${result.communityTemplate.name}`);
  console.log('Generation stats:', result.generationStats);
  
  // Customize top template for a specific user
  const topTemplate = result.individualTemplates[0];
  const userRequirements: UserRequirements = {
    symbol: 'BTCUSDT',
    timeframe: '1h',
    riskTolerance: 'medium',
    maxRisk: 0.02,
    preferredIndicators: ['RSI', 'MACD']
  };
  
  const customizationResult = await pipeline.customizeTemplateForUser(
    topTemplate,
    'user123',
    userRequirements
  );
  
  console.log(`\nCustomized template for user:`);
  console.log(`Applied ${customizationResult.appliedCustomizations.length} customizations`);
  console.log(`Test performance: ${customizationResult.testResult.performance.toFixed(2)}%`);
};
```

## 🔗 **Integration Patterns**

### Safe Integration with Existing Templates

```typescript
// Always use existing template APIs without modification
import { getTemplates, getTemplateById } from '@/agents/pinegenie-agent/core/pine-generator/templates';

class SafeTemplateIntegration {
  private existingTemplates: StrategyTemplate[] = [];

  async loadExistingTemplates(): Promise<StrategyTemplate[]> {
    // Use existing template loading function
    this.existingTemplates = await getTemplates();
    return this.existingTemplates;
  }

  async enhanceExistingTemplate(templateId: string): Promise<EnhancedTemplate> {
    // Load template using existing API
    const template = await getTemplateById(templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Add AI enhancements without modifying original
    const enhancement: AIEnhancement = {
      suggestedParameters: await this.generateParameterSuggestions(template),
      performanceInsights: await this.analyzeTemplatePerformance(template),
      customizationOptions: await this.generateCustomizationOptions(template),
      relatedTemplates: await this.findRelatedTemplates(template)
    };

    return {
      ...template,
      aiEnhancements: [enhancement],
      customizationOptions: enhancement.customizationOptions,
      suggestedParameters: enhancement.suggestedParameters,
      performanceMetrics: enhancement.performanceInsights,
      usageAnalytics: await this.getTemplateUsageAnalytics(templateId),
      relatedTemplates: enhancement.relatedTemplates
    };
  }

  private async generateParameterSuggestions(template: StrategyTemplate): Promise<SuggestedParameter[]> {
    // Analyze template parameters and suggest optimizations
    return template.parameters.map(param => ({
      name: param.name,
      currentValue: param.value,
      suggestedValue: this.optimizeParameter(param),
      reason: `Optimized based on historical performance analysis`,
      confidence: 0.8
    }));
  }
}
```

---

**Next**: [Utilities and Helpers API](./utils.md)  
**Previous**: [Strategy Optimization API](./optimization.md)