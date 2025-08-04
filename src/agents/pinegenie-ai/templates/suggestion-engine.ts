/**
 * Template Suggestion Engine
 * 
 * Provides intelligent template recommendations based on user behavior,
 * market conditions, and performance analysis.
 */

import type {
  AITemplate,
  CustomizationPreferences,
  AISuggestion,
  TemplateSearchCriteria
} from '../types/template-types';
import {
  TemplateCategory,
  DifficultyLevel
} from '../types/template-types';

export interface UserProfile {
  id: string;
  experienceLevel: DifficultyLevel;
  preferredCategories: TemplateCategory[];
  riskTolerance: 'low' | 'medium' | 'high';
  tradingStyle: 'conservative' | 'moderate' | 'aggressive';
  successfulTemplates: string[];
  failedTemplates: string[];
  averagePerformance: number;
  preferredTimeframes: string[];
  preferredMarkets: string[];
}

export interface MarketContext {
  currentConditions: string[];
  volatility: 'low' | 'medium' | 'high';
  trend: 'bullish' | 'bearish' | 'sideways';
  timeframe: string;
  marketType: 'stocks' | 'forex' | 'crypto' | 'commodities';
}

export interface SuggestionContext {
  userProfile: UserProfile;
  marketContext: MarketContext;
  currentStrategy?: AITemplate;
  recentPerformance?: number[];
  sessionHistory?: string[];
}

export interface TemplateSuggestion {
  template: AITemplate;
  score: number;
  reasoning: string[];
  confidence: number;
  category: 'recommended' | 'alternative' | 'experimental';
  customizations?: CustomizationPreferences;
}

export interface SuggestionEngineConfig {
  maxSuggestions: number;
  minConfidenceThreshold: number;
  enablePersonalization: boolean;
  enableMarketAdaptation: boolean;
  enablePerformanceTracking: boolean;
}

export class TemplateSuggestionEngine {
  private readonly config: SuggestionEngineConfig;
  private readonly templateDatabase = new Map<string, AITemplate>();
  private readonly userProfiles = new Map<string, UserProfile>();
  private readonly performanceHistory = new Map<string, number[]>();

  constructor(config: Partial<SuggestionEngineConfig> = {}) {
    this.config = {
      maxSuggestions: 10,
      minConfidenceThreshold: 0.6,
      enablePersonalization: true,
      enableMarketAdaptation: true,
      enablePerformanceTracking: true,
      ...config
    };
  }

  /**
   * Gets personalized template suggestions for a user
   */
  async getPersonalizedSuggestions(
    userId: string,
    context: Partial<SuggestionContext> = {}
  ): Promise<TemplateSuggestion[]> {
    const userProfile = this.getUserProfile(userId);
    const marketContext = context.marketContext || this.getCurrentMarketContext();
    
    const suggestionContext: SuggestionContext = {
      userProfile,
      marketContext,
      ...context
    };

    // Get base suggestions
    const suggestions = await this.generateSuggestions(suggestionContext);
    
    // Apply personalization if enabled
    if (this.config.enablePersonalization) {
      return this.personalizesuggestions(suggestions, userProfile);
    }

    return suggestions.slice(0, this.config.maxSuggestions);
  }

  /**
   * Suggests templates based on current market conditions
   */
  async getMarketBasedSuggestions(
    marketContext: MarketContext,
    userPreferences?: Partial<CustomizationPreferences>
  ): Promise<TemplateSuggestion[]> {
    const templates = Array.from(this.templateDatabase.values());
    const suggestions: TemplateSuggestion[] = [];

    for (const template of templates) {
      const score = this.calculateMarketFitScore(template, marketContext);
      
      if (score >= this.config.minConfidenceThreshold) {
        const reasoning = this.generateMarketReasoning(template, marketContext);
        
        suggestions.push({
          template,
          score,
          reasoning,
          confidence: score,
          category: this.categorizesuggestion(score),
          customizations: userPreferences as CustomizationPreferences
        });
      }
    }

    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxSuggestions);
  }

  /**
   * Suggests template improvements based on performance
   */
  async suggestImprovements(
    templateId: string,
    performanceData: number[]
  ): Promise<AISuggestion[]> {
    const template = this.templateDatabase.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const suggestions: AISuggestion[] = [];
    const avgPerformance = performanceData.reduce((sum, p) => sum + p, 0) / performanceData.length;
    const volatility = this.calculateVolatility(performanceData);

    // Performance-based suggestions
    if (avgPerformance < 0.05) { // Less than 5% return
      suggestions.push({
        id: `improve-returns-${templateId}`,
        type: 'parameter',
        description: 'Consider adjusting entry/exit parameters to improve returns',
        reasoning: `Average return is ${(avgPerformance * 100).toFixed(1)}%, which is below optimal`,
        confidence: 0.8,
        impact: 'high',
        autoApply: false
      });
    }

    if (volatility > 0.2) { // High volatility
      suggestions.push({
        id: `reduce-volatility-${templateId}`,
        type: 'parameter',
        description: 'Add risk management parameters to reduce volatility',
        reasoning: `Performance volatility is ${(volatility * 100).toFixed(1)}%, consider tighter risk controls`,
        confidence: 0.9,
        impact: 'medium',
        autoApply: false
      });
    }

    // Template-specific suggestions
    const categorysuggestions = this.getCategorySpecificSuggestions(template, performanceData);
    suggestions.push(...categorysuggestions);

    return suggestions.filter(s => s.confidence >= this.config.minConfidenceThreshold);
  }

  /**
   * Finds similar templates to a given template
   */
  findSimilarTemplates(
    templateId: string,
    maxResults: number = 5
  ): TemplateSuggestion[] {
    const template = this.templateDatabase.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const templates = Array.from(this.templateDatabase.values())
      .filter(t => t.id !== templateId);

    const similarities = templates.map(t => ({
      template: t,
      score: this.calculateTemplateSimilarity(template, t),
      reasoning: this.generateSimilarityReasoning(template, t),
      confidence: this.calculateTemplateSimilarity(template, t),
      category: 'alternative' as const
    }));

    return similarities
      .filter(s => s.score >= this.config.minConfidenceThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  /**
   * Updates user profile based on template usage and performance
   */
  updateUserProfile(
    userId: string,
    templateId: string,
    performance: number,
    wasSuccessful: boolean
  ): void {
    let profile = this.userProfiles.get(userId);
    
    if (!profile) {
      profile = this.createDefaultUserProfile(userId);
    }

    // Update template lists
    if (wasSuccessful) {
      if (!profile.successfulTemplates.includes(templateId)) {
        profile.successfulTemplates.push(templateId);
      }
      // Remove from failed list if it was there
      profile.failedTemplates = profile.failedTemplates.filter(id => id !== templateId);
    } else {
      if (!profile.failedTemplates.includes(templateId)) {
        profile.failedTemplates.push(templateId);
      }
    }

    // Update average performance
    const performanceHistory = this.performanceHistory.get(userId) || [];
    performanceHistory.push(performance);
    this.performanceHistory.set(userId, performanceHistory.slice(-20)); // Keep last 20 results

    profile.averagePerformance = performanceHistory.reduce((sum, p) => sum + p, 0) / performanceHistory.length;

    // Update preferred categories based on successful templates
    this.updatePreferredCategories(profile);

    this.userProfiles.set(userId, profile);
  }

  /**
   * Registers a new template in the suggestion engine
   */
  registerTemplate(template: AITemplate): void {
    this.templateDatabase.set(template.id, template);
  }

  /**
   * Gets user profile
   */
  getUserProfile(userId: string): UserProfile {
    return this.userProfiles.get(userId) || this.createDefaultUserProfile(userId);
  }

  // Private helper methods

  private async generateSuggestions(context: SuggestionContext): Promise<TemplateSuggestion[]> {
    const templates = Array.from(this.templateDatabase.values());
    const suggestions: TemplateSuggestion[] = [];

    for (const template of templates) {
      const score = this.calculateOverallScore(template, context);
      
      if (score >= this.config.minConfidenceThreshold) {
        const reasoning = this.generateReasoning(template, context);
        
        suggestions.push({
          template,
          score,
          reasoning,
          confidence: score,
          category: this.categorizesuggestion(score)
        });
      }
    }

    return suggestions.sort((a, b) => b.score - a.score);
  }

  private calculateOverallScore(template: AITemplate, context: SuggestionContext): number {
    let score = 0;
    let weightSum = 0;

    // User experience match (weight: 0.3)
    const experienceScore = this.calculateExperienceScore(template, context.userProfile);
    score += experienceScore * 0.3;
    weightSum += 0.3;

    // Market fit (weight: 0.4)
    if (this.config.enableMarketAdaptation) {
      const marketScore = this.calculateMarketFitScore(template, context.marketContext);
      score += marketScore * 0.4;
      weightSum += 0.4;
    }

    // Historical performance (weight: 0.2)
    if (this.config.enablePerformanceTracking) {
      const performanceScore = this.calculatePerformanceScore(template, context.userProfile);
      score += performanceScore * 0.2;
      weightSum += 0.2;
    }

    // Template quality (weight: 0.1)
    const qualityScore = this.calculateTemplateQuality(template);
    score += qualityScore * 0.1;
    weightSum += 0.1;

    return weightSum > 0 ? score / weightSum : 0;
  }

  private calculateExperienceScore(template: AITemplate, userProfile: UserProfile): number {
    let score = 0;

    // Difficulty match
    const difficultyLevels = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED, DifficultyLevel.EXPERT];
    const userLevelIndex = difficultyLevels.indexOf(userProfile.experienceLevel);
    const templateLevelIndex = difficultyLevels.indexOf(template.difficulty);
    
    const difficultyDiff = Math.abs(userLevelIndex - templateLevelIndex);
    score += Math.max(0, 1 - difficultyDiff * 0.3);

    // Category preference
    if (userProfile.preferredCategories.includes(template.category)) {
      score += 0.5;
    }

    // Success history
    if (userProfile.successfulTemplates.includes(template.id)) {
      score += 0.3;
    } else if (userProfile.failedTemplates.includes(template.id)) {
      score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateMarketFitScore(template: AITemplate, marketContext: MarketContext): number {
    let score = 0;

    // Category-market fit
    const categoryFit = this.getCategoryMarketFit(template.category, marketContext);
    score += categoryFit * 0.6;

    // Volatility match
    const volatilityFit = this.getVolatilityFit(template, marketContext.volatility);
    score += volatilityFit * 0.4;

    return Math.max(0, Math.min(1, score));
  }

  private calculatePerformanceScore(template: AITemplate, userProfile: UserProfile): number {
    if (!template.metadata.backtestResults) {
      return 0.5; // Neutral score for templates without backtest data
    }

    const backtest = template.metadata.backtestResults;
    let score = 0;

    // Return score
    const returnScore = Math.min(1, Math.max(0, backtest.totalReturn / 0.3)); // Normalize to 30% max
    score += returnScore * 0.4;

    // Sharpe ratio score
    const sharpeScore = Math.min(1, Math.max(0, backtest.sharpeRatio / 2)); // Normalize to 2.0 max
    score += sharpeScore * 0.3;

    // Drawdown score (inverted - lower is better)
    const drawdownScore = Math.max(0, 1 - backtest.maxDrawdown / 0.3); // Normalize to 30% max
    score += drawdownScore * 0.3;

    return score;
  }

  private calculateTemplateQuality(template: AITemplate): number {
    let score = 0;

    // Rating score
    score += (template.metadata.rating / 5) * 0.4;

    // Usage count (normalized)
    const usageScore = Math.min(1, template.metadata.usageCount / 1000);
    score += usageScore * 0.3;

    // Educational content availability
    if (template.metadata.educationalContent) {
      score += 0.3;
    }

    return score;
  }

  private personalizesuggestions(
    suggestions: TemplateSuggestion[],
    userProfile: UserProfile
  ): TemplateSuggestion[] {
    return suggestions.map(suggestion => {
      // Adjust score based on user preferences
      let adjustedScore = suggestion.score;

      // Boost score for preferred categories
      if (userProfile.preferredCategories.includes(suggestion.template.category)) {
        adjustedScore *= 1.2;
      }

      // Boost score for successful template patterns
      const similarSuccessful = userProfile.successfulTemplates.filter(templateId => {
        const successfulTemplate = this.templateDatabase.get(templateId);
        return successfulTemplate && successfulTemplate.category === suggestion.template.category;
      });

      if (similarSuccessful.length > 0) {
        adjustedScore *= 1.1;
      }

      return {
        ...suggestion,
        score: Math.min(1, adjustedScore)
      };
    }).sort((a, b) => b.score - a.score);
  }

  private generateReasoning(template: AITemplate, context: SuggestionContext): string[] {
    const reasoning: string[] = [];

    // Experience level reasoning
    if (template.difficulty === context.userProfile.experienceLevel) {
      reasoning.push(`Matches your ${context.userProfile.experienceLevel} experience level`);
    }

    // Category preference reasoning
    if (context.userProfile.preferredCategories.includes(template.category)) {
      reasoning.push(`Aligns with your preference for ${template.category} strategies`);
    }

    // Market condition reasoning
    const marketReasoning = this.generateMarketReasoning(template, context.marketContext);
    reasoning.push(...marketReasoning);

    // Performance reasoning
    if (template.metadata.backtestResults) {
      const backtest = template.metadata.backtestResults;
      if (backtest.totalReturn > 0.15) {
        reasoning.push(`Strong historical performance (${(backtest.totalReturn * 100).toFixed(1)}% return)`);
      }
      if (backtest.sharpeRatio > 1.5) {
        reasoning.push(`Excellent risk-adjusted returns (Sharpe: ${backtest.sharpeRatio.toFixed(2)})`);
      }
    }

    return reasoning;
  }

  private generateMarketReasoning(template: AITemplate, marketContext: MarketContext): string[] {
    const reasoning: string[] = [];

    // Category-specific market reasoning
    switch (template.category) {
      case TemplateCategory.TREND_FOLLOWING:
        if (marketContext.trend !== 'sideways') {
          reasoning.push(`Ideal for current ${marketContext.trend} market trend`);
        }
        break;
      case TemplateCategory.MEAN_REVERSION:
        if (marketContext.trend === 'sideways') {
          reasoning.push('Perfect for current ranging market conditions');
        }
        break;
      case TemplateCategory.BREAKOUT:
        if (marketContext.volatility === 'high') {
          reasoning.push('Excellent for current high volatility environment');
        }
        break;
    }

    // Volatility reasoning
    if (marketContext.volatility === 'low' && template.category === TemplateCategory.SCALPING) {
      reasoning.push('May be challenging in current low volatility environment');
    }

    return reasoning;
  }

  private generateSimilarityReasoning(template1: AITemplate, template2: AITemplate): string[] {
    const reasoning: string[] = [];

    if (template1.category === template2.category) {
      reasoning.push(`Both are ${template1.category} strategies`);
    }

    if (template1.difficulty === template2.difficulty) {
      reasoning.push(`Similar complexity level (${template1.difficulty})`);
    }

    // Compare components
    const commonComponents = template1.components.filter(c1 => 
      template2.components.some(c2 => c2.type === c1.type)
    );

    if (commonComponents.length > 0) {
      reasoning.push(`Share common components: ${commonComponents.map(c => c.type).join(', ')}`);
    }

    return reasoning;
  }

  private categorizesuggestion(score: number): 'recommended' | 'alternative' | 'experimental' {
    if (score >= 0.8) return 'recommended';
    if (score >= 0.6) return 'alternative';
    return 'experimental';
  }

  private getCategorySpecificSuggestions(template: AITemplate, performanceData: number[]): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    const avgPerformance = performanceData.reduce((sum, p) => sum + p, 0) / performanceData.length;

    switch (template.category) {
      case TemplateCategory.TREND_FOLLOWING:
        if (avgPerformance < 0.1) {
          suggestions.push({
            id: `trend-filter-${template.id}`,
            type: 'component',
            description: 'Add trend strength filter to improve signal quality',
            reasoning: 'Trend-following strategies benefit from trend strength confirmation',
            confidence: 0.8,
            impact: 'medium',
            autoApply: false
          });
        }
        break;

      case TemplateCategory.MEAN_REVERSION:
        if (this.calculateVolatility(performanceData) > 0.15) {
          suggestions.push({
            id: `volatility-filter-${template.id}`,
            type: 'parameter',
            description: 'Add volatility filter to avoid trading in trending markets',
            reasoning: 'Mean reversion works best in stable, ranging conditions',
            confidence: 0.9,
            impact: 'high',
            autoApply: false
          });
        }
        break;
    }

    return suggestions;
  }

  private calculateTemplateSimilarity(template1: AITemplate, template2: AITemplate): number {
    let similarity = 0;

    // Category similarity
    if (template1.category === template2.category) {
      similarity += 0.4;
    }

    // Difficulty similarity
    const difficultyLevels = [DifficultyLevel.BEGINNER, DifficultyLevel.INTERMEDIATE, DifficultyLevel.ADVANCED, DifficultyLevel.EXPERT];
    const diff1Index = difficultyLevels.indexOf(template1.difficulty);
    const diff2Index = difficultyLevels.indexOf(template2.difficulty);
    const difficultyDiff = Math.abs(diff1Index - diff2Index);
    similarity += Math.max(0, 0.3 - difficultyDiff * 0.1);

    // Component similarity
    const components1 = new Set(template1.components.map(c => c.type));
    const components2 = new Set(template2.components.map(c => c.type));
    const commonComponents = new Set(Array.from(components1).filter(x => components2.has(x)));
    const componentSimilarity = commonComponents.size / Math.max(components1.size, components2.size);
    similarity += componentSimilarity * 0.3;

    return Math.min(1, similarity);
  }

  private calculateVolatility(data: number[]): number {
    if (data.length < 2) return 0;

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    return Math.sqrt(variance);
  }

  private getCurrentMarketContext(): MarketContext {
    // This would typically fetch real market data
    // For now, return a default context
    return {
      currentConditions: ['normal'],
      volatility: 'medium',
      trend: 'sideways',
      timeframe: '1h',
      marketType: 'crypto'
    };
  }

  private createDefaultUserProfile(userId: string): UserProfile {
    return {
      id: userId,
      experienceLevel: DifficultyLevel.BEGINNER,
      preferredCategories: [],
      riskTolerance: 'medium',
      tradingStyle: 'moderate',
      successfulTemplates: [],
      failedTemplates: [],
      averagePerformance: 0,
      preferredTimeframes: ['1h', '4h'],
      preferredMarkets: ['crypto']
    };
  }

  private updatePreferredCategories(profile: UserProfile): void {
    const categoryCount = new Map<TemplateCategory, number>();

    // Count successful templates by category
    profile.successfulTemplates.forEach(templateId => {
      const template = this.templateDatabase.get(templateId);
      if (template) {
        const count = categoryCount.get(template.category) || 0;
        categoryCount.set(template.category, count + 1);
      }
    });

    // Update preferred categories based on success
    profile.preferredCategories = Array.from(categoryCount.entries())
      .filter(([, count]) => count >= 2) // At least 2 successful templates
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3) // Top 3 categories
      .map(([category]) => category);
  }

  private getCategoryMarketFit(category: TemplateCategory, marketContext: MarketContext): number {
    const fits = {
      [TemplateCategory.TREND_FOLLOWING]: {
        bullish: 0.9,
        bearish: 0.9,
        sideways: 0.3
      },
      [TemplateCategory.MEAN_REVERSION]: {
        bullish: 0.4,
        bearish: 0.4,
        sideways: 0.9
      },
      [TemplateCategory.BREAKOUT]: {
        bullish: 0.8,
        bearish: 0.8,
        sideways: 0.6
      },
      [TemplateCategory.MOMENTUM]: {
        bullish: 0.9,
        bearish: 0.7,
        sideways: 0.4
      },
      [TemplateCategory.SCALPING]: {
        bullish: 0.7,
        bearish: 0.7,
        sideways: 0.8
      }
    };

    return fits[category]?.[marketContext.trend] || 0.5;
  }

  private getVolatilityFit(template: AITemplate, volatility: 'low' | 'medium' | 'high'): number {
    const volatilityFits = {
      [TemplateCategory.SCALPING]: { low: 0.3, medium: 0.8, high: 0.9 },
      [TemplateCategory.BREAKOUT]: { low: 0.4, medium: 0.7, high: 0.9 },
      [TemplateCategory.MEAN_REVERSION]: { low: 0.8, medium: 0.9, high: 0.5 },
      [TemplateCategory.TREND_FOLLOWING]: { low: 0.6, medium: 0.8, high: 0.7 },
      [TemplateCategory.MOMENTUM]: { low: 0.5, medium: 0.8, high: 0.8 }
    };

    return volatilityFits[template.category]?.[volatility] || 0.6;
  }
}