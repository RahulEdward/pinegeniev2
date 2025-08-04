/**
 * Template Customizer
 * 
 * Provides advanced customization capabilities for AI templates,
 * including parameter tuning, component modification, and optimization.
 */

import type {
  AITemplate,
  TemplateParameter,
  TemplateParameterSet,
  ParameterCustomization,
  CustomizationPreferences,
  AISuggestion
} from '../types/template-types';

export interface CustomizationSession {
  id: string;
  templateId: string;
  userId?: string;
  customizations: ParameterCustomization[];
  preferences: CustomizationPreferences;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'saved' | 'applied';
}

export interface CustomizationRule {
  id: string;
  name: string;
  description: string;
  condition: (template: AITemplate, preferences: CustomizationPreferences) => boolean;
  apply: (template: AITemplate, preferences: CustomizationPreferences) => ParameterCustomization[];
  priority: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class TemplateCustomizer {
  private readonly customizationRules: CustomizationRule[] = [];
  private readonly activeSessions = new Map<string, CustomizationSession>();

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Starts a new customization session
   */
  startCustomizationSession(
    templateId: string,
    preferences: CustomizationPreferences,
    userId?: string
  ): CustomizationSession {
    const sessionId = this.generateSessionId();
    
    const session: CustomizationSession = {
      id: sessionId,
      templateId,
      userId,
      customizations: [],
      preferences,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    this.activeSessions.set(sessionId, session);
    return session;
  }

  /**
   * Applies AI-powered customizations to a template
   */
  async customizeTemplate(
    template: AITemplate,
    preferences: CustomizationPreferences,
    sessionId?: string
  ): Promise<{
    customizedTemplate: AITemplate;
    customizations: ParameterCustomization[];
    suggestions: AISuggestion[];
  }> {
    // Apply customization rules
    const customizations = this.applyCustomizationRules(template, preferences);
    
    // Generate AI suggestions
    const suggestions = await this.generateCustomizationSuggestions(template, preferences);
    
    // Apply customizations to template
    const customizedTemplate = this.applyCustomizations(template, customizations);
    
    // Update session if provided
    if (sessionId) {
      this.updateSession(sessionId, customizations);
    }

    return {
      customizedTemplate,
      customizations,
      suggestions
    };
  }

  /**
   * Validates template customizations
   */
  validateCustomizations(
    template: AITemplate,
    customizations: ParameterCustomization[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate each customization
    customizations.forEach(customization => {
      const validation = this.validateSingleCustomization(template, customization);
      errors.push(...validation.errors);
      warnings.push(...validation.warnings);
      suggestions.push(...validation.suggestions);
    });

    // Check for conflicts between customizations
    const conflicts = this.detectCustomizationConflicts(customizations);
    errors.push(...conflicts);

    // Validate overall template integrity
    const integrityCheck = this.validateTemplateIntegrity(template, customizations);
    errors.push(...integrityCheck.errors);
    warnings.push(...integrityCheck.warnings);

    return {
      isValid: errors.length === 0,
      errors: Array.from(new Set(errors)),
      warnings: Array.from(new Set(warnings)),
      suggestions: Array.from(new Set(suggestions))
    };
  }

  /**
   * Optimizes template parameters for specific market conditions
   */
  optimizeForMarketConditions(
    template: AITemplate,
    marketConditions: string[],
    timeframe: string
  ): ParameterCustomization[] {
    const optimizations: ParameterCustomization[] = [];

    // Iterate through all parameters
    Object.entries(template.parameters).forEach(([componentId, componentParams]) => {
      Object.entries(componentParams).forEach(([paramName, param]) => {
        if (param.aiOptimizable) {
          const optimizedValue = this.optimizeParameter(
            param,
            marketConditions,
            timeframe,
            template.category
          );

          if (optimizedValue !== param.value) {
            optimizations.push({
              componentId,
              parameterName: paramName,
              originalValue: param.value,
              customValue: optimizedValue,
              reasoning: `Optimized for ${marketConditions.join(', ')} conditions on ${timeframe} timeframe`
            });
          }
        }
      });
    });

    return optimizations;
  }

  /**
   * Creates a template variant with specific characteristics
   */
  createTemplateVariant(
    template: AITemplate,
    variantType: 'conservative' | 'aggressive' | 'balanced',
    name?: string
  ): AITemplate {
    const variant = JSON.parse(JSON.stringify(template)); // Deep clone
    
    // Update metadata
    variant.id = `${template.id}-${variantType}`;
    variant.name = name || `${template.name} (${variantType})`;
    variant.metadata.createdAt = new Date();
    variant.metadata.version = '1.0.0-variant';

    // Apply variant-specific modifications
    const modifications = this.getVariantModifications(variantType);
    variant.parameters = this.applyVariantModifications(variant.parameters, modifications);

    return variant;
  }

  /**
   * Compares two template configurations
   */
  compareTemplates(
    template1: AITemplate,
    template2: AITemplate
  ): {
    differences: ParameterCustomization[];
    similarities: string[];
    recommendations: string[];
  } {
    const differences: ParameterCustomization[] = [];
    const similarities: string[] = [];
    const recommendations: string[] = [];

    // Compare parameters
    Object.keys(template1.parameters).forEach(componentId => {
      const params1 = template1.parameters[componentId];
      const params2 = template2.parameters[componentId];

      if (!params2) {
        recommendations.push(`Component ${componentId} exists only in first template`);
        return;
      }

      Object.keys(params1).forEach(paramName => {
        const param1 = params1[paramName];
        const param2 = params2[paramName];

        if (!param2) {
          recommendations.push(`Parameter ${paramName} exists only in first template`);
          return;
        }

        if (param1.value !== param2.value) {
          differences.push({
            componentId,
            parameterName: paramName,
            originalValue: param1.value,
            customValue: param2.value,
            reasoning: 'Different values between templates'
          });
        } else {
          similarities.push(`${componentId}.${paramName}: ${param1.value}`);
        }
      });
    });

    // Generate recommendations based on differences
    if (differences.length > 10) {
      recommendations.push('Templates are significantly different - consider creating separate strategies');
    } else if (differences.length < 3) {
      recommendations.push('Templates are very similar - consider merging or using variants');
    }

    return { differences, similarities, recommendations };
  }

  /**
   * Gets customization session
   */
  getSession(sessionId: string): CustomizationSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Saves customization session
   */
  saveSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    session.status = 'saved';
    session.updatedAt = new Date();
    return true;
  }

  /**
   * Lists all active sessions for a user
   */
  getUserSessions(userId: string): CustomizationSession[] {
    return Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId);
  }

  // Private helper methods

  private initializeDefaultRules(): void {
    // Risk tolerance rules
    this.customizationRules.push({
      id: 'risk-tolerance-low',
      name: 'Low Risk Tolerance',
      description: 'Adjusts parameters for conservative trading',
      condition: (template, preferences) => preferences.riskTolerance === 'low',
      apply: (template, preferences) => this.applyLowRiskAdjustments(template),
      priority: 10
    });

    this.customizationRules.push({
      id: 'risk-tolerance-high',
      name: 'High Risk Tolerance',
      description: 'Adjusts parameters for aggressive trading',
      condition: (template, preferences) => preferences.riskTolerance === 'high',
      apply: (template, preferences) => this.applyHighRiskAdjustments(template),
      priority: 10
    });

    // Timeframe optimization rules
    this.customizationRules.push({
      id: 'short-timeframe-optimization',
      name: 'Short Timeframe Optimization',
      description: 'Optimizes parameters for short timeframes',
      condition: (template, preferences) => ['1m', '5m', '15m'].includes(preferences.timeframe),
      apply: (template, preferences) => this.applyShortTimeframeOptimization(template, preferences.timeframe),
      priority: 8
    });

    this.customizationRules.push({
      id: 'long-timeframe-optimization',
      name: 'Long Timeframe Optimization',
      description: 'Optimizes parameters for long timeframes',
      condition: (template, preferences) => ['4h', '1d', '1w'].includes(preferences.timeframe),
      apply: (template, preferences) => this.applyLongTimeframeOptimization(template, preferences.timeframe),
      priority: 8
    });

    // Indicator preference rules
    this.customizationRules.push({
      id: 'preferred-indicators',
      name: 'Preferred Indicators',
      description: 'Adjusts parameters for preferred indicators',
      condition: (template, preferences) => preferences.preferredIndicators.length > 0,
      apply: (template, preferences) => this.applyIndicatorPreferences(template, preferences.preferredIndicators),
      priority: 6
    });
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private applyCustomizationRules(
    template: AITemplate,
    preferences: CustomizationPreferences
  ): ParameterCustomization[] {
    const allCustomizations: ParameterCustomization[] = [];

    // Sort rules by priority
    const applicableRules = this.customizationRules
      .filter(rule => rule.condition(template, preferences))
      .sort((a, b) => b.priority - a.priority);

    // Apply each rule
    applicableRules.forEach(rule => {
      const ruleCustomizations = rule.apply(template, preferences);
      allCustomizations.push(...ruleCustomizations);
    });

    // Remove duplicates and conflicts
    return this.resolveCustomizationConflicts(allCustomizations);
  }

  private async generateCustomizationSuggestions(
    template: AITemplate,
    preferences: CustomizationPreferences
  ): Promise<AISuggestion[]> {
    const suggestions: AISuggestion[] = [];

    // Analyze template performance potential
    if (template.metadata.backtestResults) {
      const backtest = template.metadata.backtestResults;
      
      if (backtest.sharpeRatio < 1.0) {
        suggestions.push({
          id: 'improve-sharpe-ratio',
          type: 'parameter',
          description: 'Consider adjusting risk parameters to improve risk-adjusted returns',
          reasoning: `Current Sharpe ratio is ${backtest.sharpeRatio.toFixed(2)}, which could be improved`,
          confidence: 0.8,
          impact: 'medium',
          autoApply: false
        });
      }

      if (backtest.maxDrawdown > 0.15) {
        suggestions.push({
          id: 'reduce-drawdown',
          type: 'parameter',
          description: 'Add or tighten stop-loss parameters to reduce maximum drawdown',
          reasoning: `Current max drawdown is ${(backtest.maxDrawdown * 100).toFixed(1)}%`,
          confidence: 0.9,
          impact: 'high',
          autoApply: false
        });
      }
    }

    // Suggest based on preferences
    if (preferences.tradingStyle === 'conservative' && template.difficulty === 'advanced') {
      suggestions.push({
        id: 'simplify-strategy',
        type: 'structure',
        description: 'Consider using a simpler version of this strategy',
        reasoning: 'Your conservative trading style may benefit from less complex strategies',
        confidence: 0.7,
        impact: 'medium',
        autoApply: false
      });
    }

    return suggestions;
  }

  private applyCustomizations(
    template: AITemplate,
    customizations: ParameterCustomization[]
  ): AITemplate {
    const customized = JSON.parse(JSON.stringify(template)); // Deep clone

    customizations.forEach(customization => {
      const componentParams = customized.parameters[customization.componentId];
      if (componentParams && componentParams[customization.parameterName]) {
        componentParams[customization.parameterName].value = customization.customValue;
      }
    });

    // Update metadata
    customized.metadata.updatedAt = new Date();
    customized.id = `${template.id}-customized-${Date.now()}`;

    return customized;
  }

  private updateSession(sessionId: string, customizations: ParameterCustomization[]): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.customizations = customizations;
      session.updatedAt = new Date();
    }
  }

  private validateSingleCustomization(
    template: AITemplate,
    customization: ParameterCustomization
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    const componentParams = template.parameters[customization.componentId];
    if (!componentParams) {
      errors.push(`Component ${customization.componentId} not found in template`);
      return { isValid: false, errors, warnings, suggestions };
    }

    const parameter = componentParams[customization.parameterName];
    if (!parameter) {
      errors.push(`Parameter ${customization.parameterName} not found in component ${customization.componentId}`);
      return { isValid: false, errors, warnings, suggestions };
    }

    // Validate parameter type
    if (typeof customization.customValue !== typeof parameter.value) {
      errors.push(`Type mismatch for ${customization.parameterName}: expected ${typeof parameter.value}, got ${typeof customization.customValue}`);
    }

    // Validate parameter range
    if (parameter.range && typeof customization.customValue === 'number') {
      const [min, max] = parameter.range;
      if (customization.customValue < min || customization.customValue > max) {
        errors.push(`Value ${customization.customValue} for ${customization.parameterName} is outside valid range [${min}, ${max}]`);
      }
    }

    // Validate parameter options
    if (parameter.options && !parameter.options.includes(customization.customValue)) {
      errors.push(`Value ${customization.customValue} for ${customization.parameterName} is not in allowed options: ${parameter.options.join(', ')}`);
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  private detectCustomizationConflicts(customizations: ParameterCustomization[]): string[] {
    const conflicts: string[] = [];
    const parameterMap = new Map<string, ParameterCustomization[]>();

    // Group customizations by parameter
    customizations.forEach(customization => {
      const key = `${customization.componentId}.${customization.parameterName}`;
      if (!parameterMap.has(key)) {
        parameterMap.set(key, []);
      }
      parameterMap.get(key)!.push(customization);
    });

    // Check for conflicts
    parameterMap.forEach((paramCustomizations, key) => {
      if (paramCustomizations.length > 1) {
        const values = paramCustomizations.map(c => c.customValue);
        const uniqueValues = new Set(values);
        if (uniqueValues.size > 1) {
          conflicts.push(`Conflicting values for parameter ${key}: ${Array.from(uniqueValues).join(', ')}`);
        }
      }
    });

    return conflicts;
  }

  private validateTemplateIntegrity(
    template: AITemplate,
    customizations: ParameterCustomization[]
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check if customizations maintain template functionality
    const criticalParameters = this.identifyCriticalParameters(template);
    const customizedCriticalParams = customizations.filter(c => 
      criticalParameters.includes(`${c.componentId}.${c.parameterName}`)
    );

    if (customizedCriticalParams.length > 0) {
      warnings.push('Modifying critical parameters may affect strategy performance');
    }

    // Check for parameter dependencies
    const dependencies = this.analyzeParameterDependencies(template);
    customizations.forEach(customization => {
      const paramKey = `${customization.componentId}.${customization.parameterName}`;
      const dependentParams = dependencies.get(paramKey);
      
      if (dependentParams && dependentParams.length > 0) {
        suggestions.push(`Consider also adjusting dependent parameters: ${dependentParams.join(', ')}`);
      }
    });

    return { isValid: errors.length === 0, errors, warnings, suggestions };
  }

  private optimizeParameter(
    parameter: TemplateParameter,
    marketConditions: string[],
    timeframe: string,
    category: string
  ): unknown {
    if (parameter.type === 'int' || parameter.type === 'float') {
      const currentValue = parameter.value as number;
      let multiplier = 1.0;

      // Adjust based on timeframe
      if (['1m', '5m'].includes(timeframe)) {
        multiplier *= 0.7; // Shorter periods for fast timeframes
      } else if (['4h', '1d'].includes(timeframe)) {
        multiplier *= 1.3; // Longer periods for slow timeframes
      }

      // Adjust based on market conditions
      if (marketConditions.includes('volatile')) {
        multiplier *= 0.8; // More responsive in volatile markets
      } else if (marketConditions.includes('trending')) {
        multiplier *= 1.2; // Less responsive in trending markets
      }

      const optimizedValue = Math.round(currentValue * multiplier);
      
      // Ensure within range if specified
      if (parameter.range) {
        const [min, max] = parameter.range;
        return Math.max(min, Math.min(max, optimizedValue));
      }

      return optimizedValue;
    }

    return parameter.value;
  }

  private getVariantModifications(variantType: 'conservative' | 'aggressive' | 'balanced'): Record<string, number> {
    switch (variantType) {
      case 'conservative':
        return {
          riskMultiplier: 0.7,
          periodMultiplier: 1.3,
          thresholdMultiplier: 0.8
        };
      case 'aggressive':
        return {
          riskMultiplier: 1.5,
          periodMultiplier: 0.7,
          thresholdMultiplier: 1.2
        };
      case 'balanced':
      default:
        return {
          riskMultiplier: 1.0,
          periodMultiplier: 1.0,
          thresholdMultiplier: 1.0
        };
    }
  }

  private applyVariantModifications(
    parameters: TemplateParameterSet,
    modifications: Record<string, number>
  ): TemplateParameterSet {
    const modified = JSON.parse(JSON.stringify(parameters)); // Deep clone

    Object.values(modified).forEach(componentParams => {
      Object.values(componentParams).forEach(param => {
        if (param.type === 'int' || param.type === 'float') {
          const currentValue = param.value as number;
          
          // Apply appropriate modification based on parameter name
          if (param.description.toLowerCase().includes('risk')) {
            param.value = Math.round(currentValue * modifications.riskMultiplier);
          } else if (param.description.toLowerCase().includes('period')) {
            param.value = Math.round(currentValue * modifications.periodMultiplier);
          } else if (param.description.toLowerCase().includes('threshold')) {
            param.value = currentValue * modifications.thresholdMultiplier;
          }

          // Ensure within range
          if (param.range) {
            const [min, max] = param.range;
            param.value = Math.max(min, Math.min(max, param.value as number));
          }
        }
      });
    });

    return modified;
  }

  private resolveCustomizationConflicts(customizations: ParameterCustomization[]): ParameterCustomization[] {
    const resolved: ParameterCustomization[] = [];
    const parameterMap = new Map<string, ParameterCustomization>();

    // Keep only the last customization for each parameter
    customizations.forEach(customization => {
      const key = `${customization.componentId}.${customization.parameterName}`;
      parameterMap.set(key, customization);
    });

    return Array.from(parameterMap.values());
  }

  private applyLowRiskAdjustments(template: AITemplate): ParameterCustomization[] {
    const adjustments: ParameterCustomization[] = [];

    Object.entries(template.parameters).forEach(([componentId, componentParams]) => {
      Object.entries(componentParams).forEach(([paramName, param]) => {
        if (param.type === 'float' && param.description.toLowerCase().includes('risk')) {
          adjustments.push({
            componentId,
            parameterName: paramName,
            originalValue: param.value,
            customValue: (param.value as number) * 0.7,
            reasoning: 'Reduced for low risk tolerance'
          });
        }
      });
    });

    return adjustments;
  }

  private applyHighRiskAdjustments(template: AITemplate): ParameterCustomization[] {
    const adjustments: ParameterCustomization[] = [];

    Object.entries(template.parameters).forEach(([componentId, componentParams]) => {
      Object.entries(componentParams).forEach(([paramName, param]) => {
        if (param.type === 'float' && param.description.toLowerCase().includes('risk')) {
          adjustments.push({
            componentId,
            parameterName: paramName,
            originalValue: param.value,
            customValue: (param.value as number) * 1.5,
            reasoning: 'Increased for high risk tolerance'
          });
        }
      });
    });

    return adjustments;
  }

  private applyShortTimeframeOptimization(template: AITemplate, timeframe: string): ParameterCustomization[] {
    const adjustments: ParameterCustomization[] = [];

    Object.entries(template.parameters).forEach(([componentId, componentParams]) => {
      Object.entries(componentParams).forEach(([paramName, param]) => {
        if (param.type === 'int' && param.description.toLowerCase().includes('period')) {
          const multiplier = timeframe === '1m' ? 0.5 : timeframe === '5m' ? 0.7 : 0.8;
          adjustments.push({
            componentId,
            parameterName: paramName,
            originalValue: param.value,
            customValue: Math.max(1, Math.round((param.value as number) * multiplier)),
            reasoning: `Optimized for ${timeframe} timeframe`
          });
        }
      });
    });

    return adjustments;
  }

  private applyLongTimeframeOptimization(template: AITemplate, timeframe: string): ParameterCustomization[] {
    const adjustments: ParameterCustomization[] = [];

    Object.entries(template.parameters).forEach(([componentId, componentParams]) => {
      Object.entries(componentParams).forEach(([paramName, param]) => {
        if (param.type === 'int' && param.description.toLowerCase().includes('period')) {
          const multiplier = timeframe === '1d' ? 1.5 : timeframe === '1w' ? 2.0 : 1.3;
          adjustments.push({
            componentId,
            parameterName: paramName,
            originalValue: param.value,
            customValue: Math.round((param.value as number) * multiplier),
            reasoning: `Optimized for ${timeframe} timeframe`
          });
        }
      });
    });

    return adjustments;
  }

  private applyIndicatorPreferences(template: AITemplate, preferredIndicators: string[]): ParameterCustomization[] {
    // This is a simplified implementation
    // In practice, this would analyze the template structure and adjust parameters
    // based on the preferred indicators
    return [];
  }

  private identifyCriticalParameters(template: AITemplate): string[] {
    const critical: string[] = [];

    Object.entries(template.parameters).forEach(([componentId, componentParams]) => {
      Object.entries(componentParams).forEach(([paramName, param]) => {
        // Parameters that significantly affect strategy behavior
        if (param.description.toLowerCase().includes('threshold') ||
            param.description.toLowerCase().includes('signal') ||
            param.description.toLowerCase().includes('entry') ||
            param.description.toLowerCase().includes('exit')) {
          critical.push(`${componentId}.${paramName}`);
        }
      });
    });

    return critical;
  }

  private analyzeParameterDependencies(template: AITemplate): Map<string, string[]> {
    const dependencies = new Map<string, string[]>();

    // This is a simplified implementation
    // In practice, this would analyze parameter relationships more thoroughly
    Object.entries(template.parameters).forEach(([componentId, componentParams]) => {
      Object.keys(componentParams).forEach(paramName => {
        const paramKey = `${componentId}.${paramName}`;
        
        // Example: period parameters often depend on each other
        if (paramName.includes('fast') || paramName.includes('slow')) {
          const relatedParams = Object.keys(componentParams)
            .filter(p => p !== paramName && (p.includes('fast') || p.includes('slow')))
            .map(p => `${componentId}.${p}`);
          
          if (relatedParams.length > 0) {
            dependencies.set(paramKey, relatedParams);
          }
        }
      });
    });

    return dependencies;
  }
}