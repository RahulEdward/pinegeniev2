/**
 * Custom Template Generator
 * 
 * Generates AI-powered custom templates from successful strategies,
 * user patterns, and market analysis.
 */

import type { 
  AITemplate, 
  TemplateComponent,
  TemplateParameterSet,
  AITemplateMetadata,
  TemplateBacktestResults
} from '../types/template-types';
import { 
  TemplateCategory, 
  DifficultyLevel
} from '../types/template-types';

export interface StrategyAnalysis {
  nodes: StrategyNode[];
  connections: StrategyConnection[];
  performance: PerformanceMetrics;
  riskProfile: RiskProfile;
  marketConditions: string[];
  timeframe: string;
}

export interface StrategyNode {
  id: string;
  type: string;
  label: string;
  parameters: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface StrategyConnection {
  id: string;
  source: string;
  target: string;
  type: string;
}

export interface PerformanceMetrics {
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgTradeReturn: number;
  volatility: number;
}

export interface RiskProfile {
  level: 'low' | 'medium' | 'high';
  hasStopLoss: boolean;
  hasTakeProfit: boolean;
  positionSizing: 'fixed' | 'percentage' | 'dynamic';
  maxRiskPerTrade: number;
}

export interface TemplateGenerationConfig {
  enableCommunitySharing: boolean;
  enablePerformanceTracking: boolean;
  enableAutoOptimization: boolean;
  minPerformanceThreshold: number;
  maxComplexityLevel: number;
}

export interface GenerationCriteria {
  category?: TemplateCategory;
  difficulty?: DifficultyLevel;
  minPerformance?: number;
  maxComplexity?: number;
  requiredComponents?: string[];
  excludedComponents?: string[];
  targetMarkets?: string[];
  targetTimeframes?: string[];
}

export class CustomTemplateGenerator {
  private readonly config: TemplateGenerationConfig;
  private readonly templateDatabase = new Map<string, AITemplate>();
  private readonly performanceTracker = new Map<string, PerformanceMetrics[]>();

  constructor(config: Partial<TemplateGenerationConfig> = {}) {
    this.config = {
      enableCommunitySharing: true,
      enablePerformanceTracking: true,
      enableAutoOptimization: true,
      minPerformanceThreshold: 0.1, // 10% minimum return
      maxComplexityLevel: 80,
      ...config
    };
  }

  /**
   * Generates a custom template from a successful strategy
   */
  async generateFromStrategy(
    strategyAnalysis: StrategyAnalysis,
    metadata: Partial<AITemplateMetadata> = {}
  ): Promise<AITemplate> {
    // Validate strategy performance
    if (!this.meetsPerformanceThreshold(strategyAnalysis.performance)) {
      throw new Error('Strategy does not meet minimum performance threshold');
    }

    // Analyze strategy complexity
    const complexity = this.calculateStrategyComplexity(strategyAnalysis);
    if (complexity > this.config.maxComplexityLevel) {
      throw new Error('Strategy is too complex for template generation');
    }

    // Generate template ID
    const templateId = this.generateTemplateId(strategyAnalysis);

    // Extract components and parameters
    const components = this.extractComponents(strategyAnalysis);
    const parameters = this.extractParameters(strategyAnalysis);

    // Determine category and difficulty
    const category = this.categorizeStrategy(strategyAnalysis);
    const difficulty = this.assessDifficulty(complexity, strategyAnalysis);

    // Generate educational content
    const educationalContent = this.generateEducationalContent(strategyAnalysis);

    // Create template
    const template: AITemplate = {
      id: templateId,
      name: (metadata as any).name || this.generateTemplateName(strategyAnalysis),
      description: (metadata as any).description || this.generateDescription(strategyAnalysis),
      category,
      difficulty,
      components,
      parameters,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        author: metadata.author || 'AI Generated',
        tags: this.generateTags(strategyAnalysis),
        usageCount: 0,
        rating: 0,
        aiGenerated: true,
        backtestResults: this.convertToBacktestResults(strategyAnalysis.performance),
        educationalContent,
        ...metadata
      }
    };

    // Store template
    this.templateDatabase.set(templateId, template);

    // Track performance if enabled
    if (this.config.enablePerformanceTracking) {
      this.trackTemplatePerformance(templateId, strategyAnalysis.performance);
    }

    return template;
  }

  /**
   * Generates multiple template variations from a base strategy
   */
  async generateVariations(
    baseStrategy: StrategyAnalysis,
    variationCount: number = 3
  ): Promise<AITemplate[]> {
    const variations: AITemplate[] = [];
    
    for (let i = 0; i < variationCount; i++) {
      const modifiedStrategy = this.createStrategyVariation(baseStrategy, i);
      const variation = await this.generateFromStrategy(modifiedStrategy, {
        name: `${this.generateTemplateName(baseStrategy)} - Variation ${i + 1}`,
        version: `1.${i + 1}.0`
      } as Partial<AITemplateMetadata>);
      
      variations.push(variation);
    }

    return variations;
  }

  /**
   * Optimizes existing custom template based on performance data
   */
  async optimizeTemplate(
    templateId: string,
    performanceData: PerformanceMetrics[]
  ): Promise<AITemplate> {
    if (!this.config.enableAutoOptimization) {
      throw new Error('Auto-optimization is disabled');
    }

    const template = this.templateDatabase.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    // Analyze performance trends
    const optimizations = this.analyzePerformanceTrends(performanceData);
    
    // Apply optimizations
    const optimizedTemplate = this.applyOptimizations(template, optimizations);
    
    // Update template
    optimizedTemplate.metadata.updatedAt = new Date();
    optimizedTemplate.metadata.version = this.incrementVersion(template.metadata.version);
    
    this.templateDatabase.set(templateId, optimizedTemplate);
    
    return optimizedTemplate;
  }

  /**
   * Searches for similar templates in the database
   */
  findSimilarTemplates(
    strategy: StrategyAnalysis,
    maxResults: number = 5
  ): AITemplate[] {
    const templates = Array.from(this.templateDatabase.values());
    
    // Calculate similarity scores
    const similarities = templates.map(template => ({
      template,
      score: this.calculateSimilarityScore(strategy, template)
    }));

    // Sort by similarity and return top results
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(item => item.template);
  }

  /**
   * Gets template performance statistics
   */
  getTemplatePerformance(templateId: string): PerformanceMetrics[] {
    return this.performanceTracker.get(templateId) || [];
  }

  /**
   * Lists all custom templates with filtering
   */
  listCustomTemplates(criteria: GenerationCriteria = {}): AITemplate[] {
    let templates = Array.from(this.templateDatabase.values());

    // Apply filters
    if (criteria.category) {
      templates = templates.filter(t => t.category === criteria.category);
    }

    if (criteria.difficulty) {
      templates = templates.filter(t => t.difficulty === criteria.difficulty);
    }

    if (criteria.minPerformance && criteria.minPerformance > 0) {
      templates = templates.filter(t => {
        const backtest = t.metadata.backtestResults;
        return backtest && backtest.totalReturn >= criteria.minPerformance;
      });
    }

    if (criteria.maxComplexity) {
      templates = templates.filter(t => {
        const complexity = this.calculateTemplateComplexity(t);
        return complexity <= criteria.maxComplexity;
      });
    }

    return templates.sort((a, b) => b.metadata.rating - a.metadata.rating);
  }

  // Private helper methods

  private meetsPerformanceThreshold(performance: PerformanceMetrics): boolean {
    return performance.totalReturn >= this.config.minPerformanceThreshold &&
           performance.sharpeRatio > 0.5 &&
           performance.maxDrawdown < 0.3; // Max 30% drawdown
  }

  private calculateStrategyComplexity(strategy: StrategyAnalysis): number {
    let complexity = 0;
    
    // Base complexity from node count
    complexity += strategy.nodes.length * 5;
    
    // Add complexity for connections
    complexity += strategy.connections.length * 3;
    
    // Add complexity for advanced node types
    strategy.nodes.forEach(node => {
      if (node.type.includes('advanced') || node.type.includes('custom')) {
        complexity += 10;
      }
      
      // Add complexity for parameter count
      complexity += Object.keys(node.parameters).length * 2;
    });

    return Math.min(complexity, 100);
  }

  private generateTemplateId(strategy: StrategyAnalysis): string {
    const hash = this.hashStrategy(strategy);
    const timestamp = Date.now().toString(36);
    return `custom-${hash}-${timestamp}`;
  }

  private hashStrategy(strategy: StrategyAnalysis): string {
    const nodeTypes = strategy.nodes.map(n => n.type).sort().join('-');
    const connectionCount = strategy.connections.length;
    return btoa(`${nodeTypes}-${connectionCount}`).slice(0, 8);
  }

  private extractComponents(strategy: StrategyAnalysis): TemplateComponent[] {
    return strategy.nodes.map(node => ({
      id: node.id,
      type: node.type,
      label: node.label,
      description: `${node.type} component with optimized parameters`,
      required: this.isRequiredComponent(node, strategy),
      defaultParameters: node.parameters
    }));
  }

  private extractParameters(strategy: StrategyAnalysis): TemplateParameterSet {
    const parameterSet: TemplateParameterSet = {};
    
    strategy.nodes.forEach(node => {
      parameterSet[node.id] = {};
      
      Object.entries(node.parameters).forEach(([key, value]) => {
        parameterSet[node.id][key] = {
          value,
          type: this.inferParameterType(value),
          description: `Optimized ${key} parameter`,
          customizable: true,
          aiOptimizable: typeof value === 'number'
        };
      });
    });

    return parameterSet;
  }

  private categorizeStrategy(strategy: StrategyAnalysis): TemplateCategory {
    const nodeTypes = strategy.nodes.map(n => n.type.toLowerCase());
    
    if (nodeTypes.some(t => t.includes('ma') || t.includes('trend'))) {
      return TemplateCategory.TREND_FOLLOWING;
    }
    
    if (nodeTypes.some(t => t.includes('rsi') || t.includes('bollinger'))) {
      return TemplateCategory.MEAN_REVERSION;
    }
    
    if (nodeTypes.some(t => t.includes('breakout') || t.includes('volume'))) {
      return TemplateCategory.BREAKOUT;
    }
    
    if (nodeTypes.some(t => t.includes('momentum') || t.includes('macd'))) {
      return TemplateCategory.MOMENTUM;
    }

    return TemplateCategory.CUSTOM;
  }

  private assessDifficulty(complexity: number, strategy: StrategyAnalysis): DifficultyLevel {
    if (complexity < 25) return DifficultyLevel.BEGINNER;
    if (complexity < 50) return DifficultyLevel.INTERMEDIATE;
    if (complexity < 75) return DifficultyLevel.ADVANCED;
    return DifficultyLevel.EXPERT;
  }

  private generateTemplateName(strategy: StrategyAnalysis): string {
    const category = this.categorizeStrategy(strategy);
    const mainIndicators = this.extractMainIndicators(strategy);
    const timeframe = strategy.timeframe;
    
    return `${category} Strategy (${mainIndicators.join(' + ')}) - ${timeframe}`;
  }

  private generateDescription(strategy: StrategyAnalysis): string {
    const category = this.categorizeStrategy(strategy);
    const performance = strategy.performance;
    const riskLevel = strategy.riskProfile.level;
    
    return `AI-generated ${category} strategy with ${performance.totalReturn.toFixed(1)}% return, ` +
           `${performance.winRate.toFixed(1)}% win rate, and ${riskLevel} risk profile. ` +
           `Optimized for ${strategy.marketConditions.join(', ')} market conditions.`;
  }

  private generateTags(strategy: StrategyAnalysis): string[] {
    const tags = [
      this.categorizeStrategy(strategy),
      strategy.riskProfile.level + '-risk',
      strategy.timeframe,
      'ai-generated',
      'custom'
    ];

    // Add indicator-based tags
    strategy.nodes.forEach(node => {
      if (node.type.toLowerCase().includes('rsi')) tags.push('rsi');
      if (node.type.toLowerCase().includes('ma')) tags.push('moving-average');
      if (node.type.toLowerCase().includes('bollinger')) tags.push('bollinger-bands');
      if (node.type.toLowerCase().includes('macd')) tags.push('macd');
    });

    return Array.from(new Set(tags));
  }

  private generateEducationalContent(strategy: StrategyAnalysis) {
    const category = this.categorizeStrategy(strategy);
    const mainIndicators = this.extractMainIndicators(strategy);
    
    return {
      overview: `This AI-generated ${category} strategy combines ${mainIndicators.join(', ')} for optimal performance.`,
      keyConceptsExplained: this.getKeyConceptsForStrategy(strategy),
      whenToUse: this.getUsageConditions(strategy),
      whenNotToUse: this.getAvoidanceConditions(strategy),
      commonMistakes: this.getCommonMistakes(category),
      optimizationTips: this.getOptimizationTips(strategy),
      relatedStrategies: this.getRelatedStrategies(category)
    };
  }

  private convertToBacktestResults(performance: PerformanceMetrics): TemplateBacktestResults {
    return {
      totalReturn: performance.totalReturn,
      sharpeRatio: performance.sharpeRatio,
      maxDrawdown: performance.maxDrawdown,
      winRate: performance.winRate,
      profitFactor: performance.profitFactor,
      totalTrades: performance.totalTrades,
      period: {
        start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        end: new Date()
      },
      marketConditions: ['backtested']
    };
  }

  private trackTemplatePerformance(templateId: string, performance: PerformanceMetrics): void {
    const existing = this.performanceTracker.get(templateId) || [];
    existing.push(performance);
    this.performanceTracker.set(templateId, existing);
  }

  private createStrategyVariation(baseStrategy: StrategyAnalysis, variationIndex: number): StrategyAnalysis {
    const variation = JSON.parse(JSON.stringify(baseStrategy)); // Deep clone
    
    // Modify parameters slightly for variation
    variation.nodes.forEach(node => {
      Object.keys(node.parameters).forEach(key => {
        const value = node.parameters[key];
        if (typeof value === 'number') {
          const modifier = 1 + (variationIndex * 0.1 - 0.05); // ±5% variation
          node.parameters[key] = Math.round(value * modifier);
        }
      });
    });

    return variation;
  }

  private analyzePerformanceTrends(performanceData: PerformanceMetrics[]): Record<string, unknown> {
    // Simple trend analysis - in practice this would be more sophisticated
    const avgReturn = performanceData.reduce((sum, p) => sum + p.totalReturn, 0) / performanceData.length;
    const avgSharpe = performanceData.reduce((sum, p) => sum + p.sharpeRatio, 0) / performanceData.length;
    
    return {
      avgReturn,
      avgSharpe,
      trend: avgReturn > 0 ? 'improving' : 'declining'
    };
  }

  private applyOptimizations(template: AITemplate, optimizations: Record<string, unknown>): AITemplate {
    const optimized = JSON.parse(JSON.stringify(template)); // Deep clone
    
    // Apply optimizations based on trends
    // This is a simplified implementation
    if (optimizations.trend === 'declining') {
      // Adjust parameters to be more conservative
      Object.values(optimized.parameters).forEach(componentParams => {
        Object.values(componentParams).forEach(param => {
          if (param.type === 'int' || param.type === 'float') {
            if (typeof param.value === 'number' && param.value > 10) {
              param.value = Math.floor(param.value * 0.9); // Reduce by 10%
            }
          }
        });
      });
    }

    return optimized;
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private calculateSimilarityScore(strategy: StrategyAnalysis, template: AITemplate): number {
    let score = 0;
    
    // Compare node types
    const strategyNodeTypes = new Set(strategy.nodes?.map(n => n.type) || []);
    const templateNodeTypes = new Set(template.components.map(c => c.type));
    const commonNodeTypes = new Set(Array.from(strategyNodeTypes).filter(x => templateNodeTypes.has(x)));
    
    score += (commonNodeTypes.size / Math.max(strategyNodeTypes.size, templateNodeTypes.size)) * 50;
    
    // Compare category
    const strategyCategory = this.categorizeStrategy(strategy);
    if (strategyCategory === template.category) {
      score += 30;
    }
    
    // Compare complexity
    const strategyComplexity = this.calculateStrategyComplexity(strategy);
    const templateComplexity = this.calculateTemplateComplexity(template);
    const complexityDiff = Math.abs(strategyComplexity - templateComplexity);
    score += Math.max(0, 20 - complexityDiff);
    
    return score;
  }

  private calculateTemplateComplexity(template: AITemplate): number {
    let complexity = 0;
    complexity += template.components.length * 5;
    
    Object.values(template.parameters).forEach(componentParams => {
      complexity += Object.keys(componentParams).length * 2;
    });
    
    return Math.min(complexity, 100);
  }

  private isRequiredComponent(node: StrategyNode, strategy: StrategyAnalysis): boolean {
    // A component is required if removing it would break the strategy flow
    const incomingConnections = strategy.connections.filter(c => c.target === node.id);
    const outgoingConnections = strategy.connections.filter(c => c.source === node.id);
    
    return incomingConnections.length > 0 && outgoingConnections.length > 0;
  }

  private inferParameterType(value: unknown): 'int' | 'float' | 'bool' | 'string' | 'source' | 'color' {
    if (typeof value === 'boolean') return 'bool';
    if (typeof value === 'string') return 'string';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'int' : 'float';
    }
    return 'string';
  }

  private extractMainIndicators(strategy: StrategyAnalysis): string[] {
    const indicators: string[] = [];
    
    strategy.nodes.forEach(node => {
      if (node.type.toLowerCase().includes('rsi')) indicators.push('RSI');
      if (node.type.toLowerCase().includes('ma')) indicators.push('MA');
      if (node.type.toLowerCase().includes('bollinger')) indicators.push('Bollinger Bands');
      if (node.type.toLowerCase().includes('macd')) indicators.push('MACD');
    });

    return Array.from(new Set(indicators));
  }

  private getKeyConceptsForStrategy(strategy: StrategyAnalysis): string[] {
    const concepts = ['Technical Analysis', 'Risk Management'];
    const indicators = this.extractMainIndicators(strategy);
    
    indicators.forEach(indicator => {
      switch (indicator) {
        case 'RSI':
          concepts.push('Relative Strength Index', 'Overbought/Oversold');
          break;
        case 'MA':
          concepts.push('Moving Averages', 'Trend Following');
          break;
        case 'Bollinger Bands':
          concepts.push('Volatility', 'Mean Reversion');
          break;
        case 'MACD':
          concepts.push('Momentum', 'Signal Crossovers');
          break;
      }
    });

    return Array.from(new Set(concepts));
  }

  private getUsageConditions(strategy: StrategyAnalysis): string[] {
    const conditions = [`Use in ${strategy.marketConditions.join(', ')} markets`];
    const category = this.categorizeStrategy(strategy);
    
    switch (category) {
      case TemplateCategory.TREND_FOLLOWING:
        conditions.push('Best in trending markets', 'Avoid during consolidation');
        break;
      case TemplateCategory.MEAN_REVERSION:
        conditions.push('Ideal for ranging markets', 'Use when volatility is moderate');
        break;
      case TemplateCategory.BREAKOUT:
        conditions.push('Perfect for high volatility periods', 'Use with volume confirmation');
        break;
    }

    return conditions;
  }

  private getAvoidanceConditions(strategy: StrategyAnalysis): string[] {
    const category = this.categorizeStrategy(strategy);
    
    switch (category) {
      case TemplateCategory.TREND_FOLLOWING:
        return ['Avoid in sideways markets', 'Not suitable for high-frequency trading'];
      case TemplateCategory.MEAN_REVERSION:
        return ['Avoid in strong trending markets', 'Not ideal during news events'];
      case TemplateCategory.BREAKOUT:
        return ['Avoid in low volatility periods', 'Be cautious of false breakouts'];
      default:
        return ['Use with proper risk management', 'Test thoroughly before live trading'];
    }
  }

  private getCommonMistakes(category: TemplateCategory): string[] {
    return [
      'Over-optimizing parameters',
      'Ignoring market context',
      'Not using proper position sizing',
      'Failing to account for transaction costs'
    ];
  }

  private getOptimizationTips(strategy: StrategyAnalysis): string[] {
    const tips = ['Regular backtesting', 'Parameter sensitivity analysis'];
    
    if (strategy.riskProfile.level === 'high') {
      tips.push('Consider adding stop losses', 'Reduce position sizes');
    }
    
    if (strategy.performance.winRate < 50) {
      tips.push('Focus on improving entry signals', 'Consider trend filters');
    }

    return tips;
  }

  private getRelatedStrategies(category: TemplateCategory): string[] {
    const related = {
      [TemplateCategory.TREND_FOLLOWING]: ['Moving Average Crossover', 'Momentum Strategy'],
      [TemplateCategory.MEAN_REVERSION]: ['RSI Strategy', 'Bollinger Bands'],
      [TemplateCategory.BREAKOUT]: ['Volume Breakout', 'Support/Resistance'],
      [TemplateCategory.MOMENTUM]: ['MACD Strategy', 'Price Momentum'],
      [TemplateCategory.SCALPING]: ['Quick Scalp', 'Tick Scalping'],
      [TemplateCategory.ARBITRAGE]: ['Statistical Arbitrage', 'Pairs Trading'],
      [TemplateCategory.RISK_MANAGEMENT]: ['Portfolio Protection', 'Hedge Strategies'],
      [TemplateCategory.CUSTOM]: ['Hybrid Strategies', 'Multi-Timeframe']
    };

    return related[category] || [];
  }
}