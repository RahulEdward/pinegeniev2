/**
 * Template Integrator
 * 
 * Safely integrates with the existing template system without modification.
 * Provides AI-enhanced template functionality while preserving all existing features.
 */

import type { 
  StrategyTemplate, 
  StrategyParameter, 
  TemplateSearchOptions 
} from '../../../agents/pinegenie-agent/core/pine-generator/templates';
import type { 
  AITemplate, 
  TemplateCustomization, 
  AISuggestion,
  TemplateSearchCriteria,
  TemplateSearchResult,
  ParameterCustomization,
  CustomizationPreferences,
  TemplateComponent,
  TemplateParameterSet,
  TemplateParameters,
  TemplateEducationalContent
} from '../types/template-types';
import { 
  TemplateCategory,
  DifficultyLevel
} from '../types/template-types';

export interface TemplateIntegrationConfig {
  enableAIEnhancements: boolean;
  enableCustomSuggestions: boolean;
  enableParameterOptimization: boolean;
  maxSuggestions: number;
  confidenceThreshold: number;
}

export interface TemplateAnalysis {
  complexity: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  suitability: TemplateSuitability;
  improvements: TemplateImprovement[];
  educationalValue: number; // 0-100
}

export interface TemplateSuitability {
  beginnerFriendly: boolean;
  marketConditions: string[];
  timeframes: string[];
  riskProfile: string;
  expectedPerformance: PerformanceExpectation;
}

export interface PerformanceExpectation {
  estimatedReturn: number;
  estimatedVolatility: number;
  maxDrawdownEstimate: number;
  winRateEstimate: number;
  confidence: number;
}

export interface TemplateImprovement {
  id: string;
  type: 'parameter' | 'structure' | 'risk-management' | 'signal-quality';
  description: string;
  implementation: string;
  expectedBenefit: string;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number;
}

export class TemplateIntegrator {
  private readonly config: TemplateIntegrationConfig;
  private readonly templateCache = new Map<string, AITemplate>();
  private readonly analysisCache = new Map<string, TemplateAnalysis>();

  constructor(config: Partial<TemplateIntegrationConfig> = {}) {
    this.config = {
      enableAIEnhancements: true,
      enableCustomSuggestions: true,
      enableParameterOptimization: true,
      maxSuggestions: 5,
      confidenceThreshold: 0.7,
      ...config
    };
  }

  /**
   * Safely reads from existing template system without modification
   */
  async getExistingTemplates(): Promise<StrategyTemplate[]> {
    try {
      // Import existing templates dynamically to avoid circular dependencies
      const { strategyTemplates } = await import('../../../agents/pinegenie-agent/core/pine-generator/templates');
      return strategyTemplates;
    } catch (error) {
      console.error('Failed to load existing templates:', error);
      return [];
    }
  }

  /**
   * Analyzes existing template for AI enhancement opportunities
   */
  async analyzeTemplate(templateId: string): Promise<TemplateAnalysis> {
    // Check cache first
    if (this.analysisCache.has(templateId)) {
      return this.analysisCache.get(templateId)!;
    }

    const existingTemplates = await this.getExistingTemplates();
    const template = existingTemplates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const analysis = this.performTemplateAnalysis(template);
    this.analysisCache.set(templateId, analysis);
    
    return analysis;
  }

  /**
   * Suggests template customizations based on user preferences
   */
  async suggestCustomizations(
    templateId: string, 
    userPreferences: CustomizationPreferences
  ): Promise<AISuggestion[]> {
    if (!this.config.enableCustomSuggestions) {
      return [];
    }

    const analysis = await this.analyzeTemplate(templateId);
    const suggestions: AISuggestion[] = [];

    // Risk tolerance adjustments
    if (userPreferences.riskTolerance === 'low' && analysis.riskLevel === 'high') {
      suggestions.push({
        id: `risk-reduction-${templateId}`,
        type: 'parameter',
        description: 'Reduce position size and add tighter stop losses for lower risk',
        reasoning: 'Your risk tolerance is low, but this template has high risk characteristics',
        confidence: 0.9,
        impact: 'high',
        autoApply: false
      });
    }

    // Timeframe optimization
    if (userPreferences.timeframe && analysis.suitability.timeframes.length > 0) {
      const isOptimalTimeframe = analysis.suitability.timeframes.includes(userPreferences.timeframe);
      if (!isOptimalTimeframe) {
        suggestions.push({
          id: `timeframe-optimization-${templateId}`,
          type: 'parameter',
          description: `Optimize parameters for ${userPreferences.timeframe} timeframe`,
          reasoning: 'Template parameters may need adjustment for your preferred timeframe',
          confidence: 0.8,
          impact: 'medium',
          autoApply: false
        });
      }
    }

    // Indicator preferences
    if (userPreferences.preferredIndicators.length > 0) {
      suggestions.push({
        id: `indicator-enhancement-${templateId}`,
        type: 'component',
        description: 'Add preferred indicators to enhance signal quality',
        reasoning: 'Your preferred indicators could improve this strategy',
        confidence: 0.7,
        impact: 'medium',
        autoApply: false
      });
    }

    return suggestions.filter(s => s.confidence >= this.config.confidenceThreshold)
                     .slice(0, this.config.maxSuggestions);
  }

  /**
   * Optimizes template parameters using AI
   */
  async optimizeParameters(
    templateId: string,
    marketConditions: string[] = [],
    timeframe: string = '1h'
  ): Promise<ParameterCustomization[]> {
    if (!this.config.enableParameterOptimization) {
      return [];
    }

    const existingTemplates = await this.getExistingTemplates();
    const template = existingTemplates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const optimizations: ParameterCustomization[] = [];

    // Optimize based on market conditions
    for (const param of template.parameters) {
      if (param.type === 'int' || param.type === 'float') {
        const optimizedValue = this.optimizeParameterValue(
          param, 
          marketConditions, 
          timeframe
        );
        
        if (optimizedValue !== param.defaultValue) {
          optimizations.push({
            componentId: templateId,
            parameterName: param.name,
            originalValue: param.defaultValue,
            customValue: optimizedValue,
            reasoning: `Optimized for ${marketConditions.join(', ')} market conditions on ${timeframe} timeframe`
          });
        }
      }
    }

    return optimizations;
  }

  /**
   * Searches templates with AI-enhanced filtering
   */
  async searchTemplates(criteria: TemplateSearchCriteria): Promise<TemplateSearchResult> {
    const startTime = Date.now();
    const existingTemplates = await this.getExistingTemplates();
    
    let filteredTemplates = existingTemplates;

    // Apply category filter
    if (criteria.category) {
      filteredTemplates = filteredTemplates.filter(t => 
        t.category === criteria.category
      );
    }

    // Apply difficulty filter
    if (criteria.difficulty) {
      filteredTemplates = filteredTemplates.filter(t => {
        const analysis = this.performTemplateAnalysis(t);
        return this.mapDifficultyLevel(analysis.complexity) === criteria.difficulty;
      });
    }

    // Apply rating filter
    if (criteria.minRating !== undefined) {
      filteredTemplates = filteredTemplates.filter(t => {
        // Since existing templates don't have ratings, we'll use a default
        return 4.0 >= criteria.minRating!;
      });
    }

    // Convert to AI templates
    const aiTemplates = await Promise.all(
      filteredTemplates.map(t => this.convertToAITemplate(t))
    );

    const searchTime = Date.now() - startTime;

    return {
      templates: aiTemplates,
      totalCount: aiTemplates.length,
      searchTime,
      suggestions: this.generateSearchSuggestions(criteria, aiTemplates)
    };
  }

  /**
   * Converts existing template to AI-enhanced template
   */
  private async convertToAITemplate(template: StrategyTemplate): Promise<AITemplate> {
    const analysis = this.performTemplateAnalysis(template);
    
    return {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category as TemplateCategory,
      difficulty: this.mapDifficultyLevel(analysis.complexity),
      components: this.extractComponents(template),
      parameters: this.convertParameters(template),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        author: 'PineGenie',
        tags: this.extractTags(template),
        usageCount: 0,
        rating: 4.0, // Default rating for existing templates
        aiGenerated: false,
        educationalContent: this.generateEducationalContent(template, analysis)
      }
    };
  }

  /**
   * Performs comprehensive template analysis
   */
  private performTemplateAnalysis(template: StrategyTemplate): TemplateAnalysis {
    const complexity = this.calculateComplexity(template);
    const riskLevel = this.assessRiskLevel(template);
    
    return {
      complexity,
      riskLevel,
      suitability: {
        beginnerFriendly: complexity < 30,
        marketConditions: this.inferMarketConditions(template),
        timeframes: this.inferTimeframes(template),
        riskProfile: riskLevel,
        expectedPerformance: {
          estimatedReturn: this.estimateReturn(template),
          estimatedVolatility: this.estimateVolatility(template),
          maxDrawdownEstimate: this.estimateMaxDrawdown(template),
          winRateEstimate: this.estimateWinRate(template),
          confidence: 0.7
        }
      },
      improvements: this.identifyImprovements(template),
      educationalValue: this.calculateEducationalValue(template)
    };
  }

  private calculateComplexity(template: StrategyTemplate): number {
    let complexity = 0;
    
    // Base complexity from parameter count
    complexity += template.parameters.length * 5;
    
    // Add complexity for advanced parameters
    template.parameters.forEach(param => {
      if (param.type === 'source') complexity += 10;
      if (param.name.includes('period') && param.defaultValue > 50) complexity += 5;
    });
    
    // Template-specific complexity
    if (template.difficulty === 'advanced') complexity += 20;
    if (template.description.includes('MACD') || template.description.includes('Bollinger')) {
      complexity += 15;
    }
    
    return Math.min(complexity, 100);
  }

  private assessRiskLevel(template: StrategyTemplate): 'low' | 'medium' | 'high' {
    const hasStopLoss = template.parameters.some(p => 
      p.name.toLowerCase().includes('stop') || p.name.toLowerCase().includes('loss')
    );
    const hasTakeProfit = template.parameters.some(p => 
      p.name.toLowerCase().includes('take') || p.name.toLowerCase().includes('profit')
    );
    
    if (hasStopLoss && hasTakeProfit) return 'low';
    if (hasStopLoss || hasTakeProfit) return 'medium';
    return 'high';
  }

  private inferMarketConditions(template: StrategyTemplate): string[] {
    const conditions: string[] = [];
    
    if (template.category === 'trend-following') {
      conditions.push('trending', 'directional');
    } else if (template.category === 'mean-reversion') {
      conditions.push('ranging', 'sideways');
    } else if (template.category === 'breakout') {
      conditions.push('volatile', 'news-driven');
    }
    
    return conditions;
  }

  private inferTimeframes(template: StrategyTemplate): string[] {
    // Default timeframes based on strategy type
    if (template.category === 'scalping') return ['1m', '5m'];
    if (template.category === 'momentum') return ['15m', '1h'];
    return ['1h', '4h', '1d'];
  }

  private estimateReturn(template: StrategyTemplate): number {
    // Conservative estimates based on strategy type
    const baseReturns = {
      'trend-following': 15,
      'mean-reversion': 12,
      'breakout': 20,
      'momentum': 18,
      'scalping': 25
    };
    
    return baseReturns[template.category as keyof typeof baseReturns] || 10;
  }

  private estimateVolatility(template: StrategyTemplate): number {
    const baseVolatility = {
      'trend-following': 15,
      'mean-reversion': 10,
      'breakout': 25,
      'momentum': 20,
      'scalping': 30
    };
    
    return baseVolatility[template.category as keyof typeof baseVolatility] || 15;
  }

  private estimateMaxDrawdown(template: StrategyTemplate): number {
    const riskLevel = this.assessRiskLevel(template);
    const baseDrawdown = { low: 8, medium: 15, high: 25 };
    return baseDrawdown[riskLevel];
  }

  private estimateWinRate(template: StrategyTemplate): number {
    const baseWinRates = {
      'trend-following': 45,
      'mean-reversion': 65,
      'breakout': 40,
      'momentum': 50,
      'scalping': 55
    };
    
    return baseWinRates[template.category as keyof typeof baseWinRates] || 50;
  }

  private identifyImprovements(template: StrategyTemplate): TemplateImprovement[] {
    const improvements: TemplateImprovement[] = [];
    
    const hasStopLoss = template.parameters.some(p => 
      p.name.toLowerCase().includes('stop')
    );
    
    if (!hasStopLoss) {
      improvements.push({
        id: `add-stop-loss-${template.id}`,
        type: 'risk-management',
        description: 'Add stop loss protection',
        implementation: 'Add stop loss parameter and logic',
        expectedBenefit: 'Reduce maximum drawdown by 30-50%',
        difficulty: 'easy',
        priority: 9
      });
    }
    
    return improvements;
  }

  private calculateEducationalValue(template: StrategyTemplate): number {
    let value = 50; // Base value
    
    // Add value for clear parameter names
    const clearParams = template.parameters.filter(p => 
      p.description && p.description.length > 10
    );
    value += (clearParams.length / template.parameters.length) * 20;
    
    // Add value for risk management
    const hasRiskManagement = template.parameters.some(p => 
      p.name.toLowerCase().includes('stop') || p.name.toLowerCase().includes('risk')
    );
    if (hasRiskManagement) value += 15;
    
    // Add value for beginner-friendly complexity
    const complexity = this.calculateComplexity(template);
    if (complexity < 30) value += 15;
    
    return Math.min(value, 100);
  }

  private mapDifficultyLevel(complexity: number): DifficultyLevel {
    if (complexity < 25) return DifficultyLevel.BEGINNER;
    if (complexity < 50) return DifficultyLevel.INTERMEDIATE;
    if (complexity < 75) return DifficultyLevel.ADVANCED;
    return DifficultyLevel.EXPERT;
  }

  private extractComponents(template: StrategyTemplate): TemplateComponent[] {
    // Extract components from template structure
    // This is a simplified implementation
    return [{
      id: `${template.id}-main`,
      type: 'strategy',
      label: template.name,
      description: template.description,
      required: true,
      defaultParameters: template.parameters.reduce((acc, param) => {
        acc[param.name] = param.defaultValue;
        return acc;
      }, {} as Record<string, unknown>)
    }];
  }

  private convertParameters(template: StrategyTemplate): TemplateParameterSet {
    const parameterSet: TemplateParameterSet = {};
    
    parameterSet[template.id] = template.parameters.reduce((acc, param) => {
      acc[param.name] = {
        value: param.defaultValue,
        type: param.type,
        range: param.min !== undefined && param.max !== undefined ? [param.min, param.max] : undefined,
        options: param.options,
        description: param.description,
        customizable: true,
        aiOptimizable: param.type === 'int' || param.type === 'float'
      };
      return acc;
    }, {} as TemplateParameters);
    
    return parameterSet;
  }

  private extractTags(template: StrategyTemplate): string[] {
    const tags = [template.category, ...template.tags];
    
    // Add tags based on parameters
    template.parameters.forEach(param => {
      if (param.name.toLowerCase().includes('rsi')) tags.push('rsi');
      if (param.name.toLowerCase().includes('ma')) tags.push('moving-average');
      if (param.name.toLowerCase().includes('bollinger')) tags.push('bollinger-bands');
    });
    
    return Array.from(new Set(tags));
  }

  private generateEducationalContent(
    template: StrategyTemplate, 
    analysis: TemplateAnalysis
  ): TemplateEducationalContent {
    return {
      overview: `${template.name} is a ${template.category} strategy with ${analysis.complexity}% complexity.`,
      keyConceptsExplained: this.getKeyConceptsForCategory(template.category),
      whenToUse: analysis.suitability.marketConditions.map(condition => 
        `Use in ${condition} market conditions`
      ),
      whenNotToUse: this.getAvoidanceConditions(template.category),
      commonMistakes: this.getCommonMistakes(template.category),
      optimizationTips: analysis.improvements.map(imp => imp.description),
      relatedStrategies: this.getRelatedStrategies(template.category)
    };
  }

  private getKeyConceptsForCategory(category: string): string[] {
    const concepts = {
      'trend-following': ['Trend identification', 'Momentum', 'Moving averages'],
      'mean-reversion': ['Support and resistance', 'Overbought/oversold', 'RSI'],
      'breakout': ['Volatility', 'Volume confirmation', 'False breakouts'],
      'momentum': ['Price momentum', 'Volume analysis', 'Trend strength']
    };
    
    return concepts[category as keyof typeof concepts] || ['Technical analysis'];
  }

  private getAvoidanceConditions(category: string): string[] {
    const avoidance = {
      'trend-following': ['Avoid in choppy, sideways markets'],
      'mean-reversion': ['Avoid in strong trending markets'],
      'breakout': ['Avoid in low volatility periods'],
      'momentum': ['Avoid during market reversals']
    };
    
    return avoidance[category as keyof typeof avoidance] || ['Use with caution in all conditions'];
  }

  private getCommonMistakes(category: string): string[] {
    return [
      'Not using proper risk management',
      'Over-optimizing parameters',
      'Ignoring market context',
      'Not considering transaction costs'
    ];
  }

  private getRelatedStrategies(category: string): string[] {
    const related = {
      'trend-following': ['Moving Average Crossover', 'MACD Strategy'],
      'mean-reversion': ['RSI Strategy', 'Bollinger Bands'],
      'breakout': ['Support/Resistance Breakout', 'Volume Breakout'],
      'momentum': ['Price Momentum', 'Volume Momentum']
    };
    
    return related[category as keyof typeof related] || [];
  }

  private optimizeParameterValue(
    param: StrategyParameter,
    marketConditions: string[],
    timeframe: string
  ): unknown {
    // Simple optimization logic - in practice this would be more sophisticated
    if (param.type === 'int' && param.min !== undefined && param.max !== undefined) {
      const min = param.min;
      const max = param.max;
      const current = param.defaultValue as number;
      
      // Adjust based on timeframe
      if (timeframe === '1m' || timeframe === '5m') {
        // Shorter periods for faster timeframes
        return Math.max(min, Math.floor(current * 0.7));
      } else if (timeframe === '1d' || timeframe === '4h') {
        // Longer periods for slower timeframes
        return Math.min(max, Math.floor(current * 1.3));
      }
    }
    
    return param.defaultValue;
  }

  private generateSearchSuggestions(
    criteria: TemplateSearchCriteria,
    results: AITemplate[]
  ): string[] {
    const suggestions: string[] = [];
    
    if (results.length === 0) {
      suggestions.push('Try broadening your search criteria');
      suggestions.push('Consider different difficulty levels');
    } else if (results.length > 10) {
      suggestions.push('Try narrowing your search with more specific criteria');
    }
    
    // Suggest popular categories if none specified
    if (!criteria.category) {
      suggestions.push('Try searching for trend-following strategies');
      suggestions.push('Consider mean-reversion strategies for ranging markets');
    }
    
    return suggestions;
  }
}