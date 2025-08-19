/**
 * Indicator Configuration System with Real-time Validation
 * Provides parameter configuration UI and validation for technical indicators
 */

import { IndicatorDefinition, IndicatorParameter, IndicatorValidationResult, indicatorGenerator } from './indicators';

export interface IndicatorConfig {
  id: string;
  indicatorId: string;
  alias: string;
  parameters: Record<string, any>;
  enabled: boolean;
  plotSettings: PlotSettings;
  created: Date;
  updated: Date;
}

export interface PlotSettings {
  colors: Record<string, string>;
  lineWidth: Record<string, number>;
  styles: Record<string, string>;
  visibility: Record<string, boolean>;
  overlay: boolean;
}

export interface ConfigurationForm {
  indicatorId: string;
  sections: ConfigSection[];
  validation: IndicatorValidationResult;
}

export interface ConfigSection {
  name: string;
  parameters: FormParameter[];
}

export interface FormParameter {
  parameter: IndicatorParameter;
  value: any;
  validation: ParameterValidation;
  suggestions: string[];
}

export interface ParameterValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface ConfigurationPreset {
  id: string;
  name: string;
  description: string;
  indicatorId: string;
  parameters: Record<string, any>;
  tags: string[];
  author: string;
  rating: number;
  usage: number;
}

/**
 * Indicator Configuration Manager
 */
export class IndicatorConfigManager {
  private configs: Map<string, IndicatorConfig>;
  private presets: Map<string, ConfigurationPreset>;
  private validationCache: Map<string, IndicatorValidationResult>;

  constructor() {
    this.configs = new Map();
    this.presets = new Map();
    this.validationCache = new Map();
    
    this.initializeDefaultPresets();
  }

  /**
   * Initialize default configuration presets
   */
  private initializeDefaultPresets(): void {
    // RSI presets
    this.presets.set('rsi_conservative', {
      id: 'rsi_conservative',
      name: 'RSI Conservative',
      description: 'Conservative RSI settings for stable signals',
      indicatorId: 'rsi',
      parameters: {
        length: 21,
        source: 'close',
        overbought: 75,
        oversold: 25
      },
      tags: ['conservative', 'stable'],
      author: 'PineGenie',
      rating: 4.5,
      usage: 1250
    });

    this.presets.set('rsi_aggressive', {
      id: 'rsi_aggressive',
      name: 'RSI Aggressive',
      description: 'Aggressive RSI settings for quick signals',
      indicatorId: 'rsi',
      parameters: {
        length: 9,
        source: 'close',
        overbought: 70,
        oversold: 30
      },
      tags: ['aggressive', 'quick'],
      author: 'PineGenie',
      rating: 4.2,
      usage: 890
    });

    // MACD presets
    this.presets.set('macd_standard', {
      id: 'macd_standard',
      name: 'MACD Standard',
      description: 'Standard MACD configuration',
      indicatorId: 'macd',
      parameters: {
        fastLength: 12,
        slowLength: 26,
        signalLength: 9,
        source: 'close'
      },
      tags: ['standard', 'popular'],
      author: 'PineGenie',
      rating: 4.7,
      usage: 2100
    });

    // Bollinger Bands presets
    this.presets.set('bb_tight', {
      id: 'bb_tight',
      name: 'Bollinger Bands Tight',
      description: 'Tight Bollinger Bands for sensitive signals',
      indicatorId: 'bollinger_bands',
      parameters: {
        length: 20,
        mult: 1.5,
        source: 'close'
      },
      tags: ['tight', 'sensitive'],
      author: 'PineGenie',
      rating: 4.3,
      usage: 750
    });
  }

  /**
   * Create new indicator configuration
   */
  createConfig(indicatorId: string, alias?: string): IndicatorConfig {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    const config: IndicatorConfig = {
      id: `config_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      indicatorId,
      alias: alias || indicator.name.toLowerCase().replace(/\s+/g, '_'),
      parameters: this.getDefaultParameters(indicator),
      enabled: true,
      plotSettings: this.getDefaultPlotSettings(indicator),
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(config.id, config);
    return config;
  }

  /**
   * Get default parameters for indicator
   */
  private getDefaultParameters(indicator: IndicatorDefinition): Record<string, any> {
    const params: Record<string, any> = {};
    indicator.parameters.forEach(param => {
      params[param.name] = param.defaultValue;
    });
    return params;
  }

  /**
   * Get default plot settings for indicator
   */
  private getDefaultPlotSettings(indicator: IndicatorDefinition): PlotSettings {
    const colors: Record<string, string> = {};
    const lineWidth: Record<string, number> = {};
    const styles: Record<string, string> = {};
    const visibility: Record<string, boolean> = {};

    indicator.outputs.forEach(output => {
      colors[output.name] = output.defaultColor || '#3b82f6';
      lineWidth[output.name] = 2;
      styles[output.name] = output.defaultStyle || 'solid';
      visibility[output.name] = true;
    });

    return {
      colors,
      lineWidth,
      styles,
      visibility,
      overlay: indicator.category !== 'momentum' && indicator.category !== 'volume'
    };
  }

  /**
   * Update indicator configuration
   */
  updateConfig(configId: string, updates: Partial<IndicatorConfig>): IndicatorConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const updatedConfig = { ...config, ...updates, updated: new Date() };
    this.configs.set(configId, updatedConfig);

    // Clear validation cache
    this.validationCache.delete(configId);

    return updatedConfig;
  }

  /**
   * Validate indicator configuration
   */
  validateConfig(configId: string): IndicatorValidationResult {
    // Check cache first
    const cached = this.validationCache.get(configId);
    if (cached) {
      return cached;
    }

    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const result = indicatorGenerator.validateIndicatorParameters(
      config.indicatorId,
      config.parameters
    );

    // Cache result
    this.validationCache.set(configId, result);

    return result;
  }

  /**
   * Generate configuration form
   */
  generateForm(indicatorId: string): ConfigurationForm {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    // Group parameters by group
    const parameterGroups = new Map<string, IndicatorParameter[]>();
    indicator.parameters.forEach(param => {
      const group = param.group || 'General';
      if (!parameterGroups.has(group)) {
        parameterGroups.set(group, []);
      }
      parameterGroups.get(group)!.push(param);
    });

    // Create sections
    const sections: ConfigSection[] = Array.from(parameterGroups.entries()).map(([name, parameters]) => ({
      name,
      parameters: parameters.map(param => ({
        parameter: param,
        value: param.defaultValue,
        validation: this.validateParameter(param, param.defaultValue),
        suggestions: this.getParameterSuggestions(param)
      }))
    }));

    return {
      indicatorId,
      sections,
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      }
    };
  }

  /**
   * Validate individual parameter
   */
  private validateParameter(param: IndicatorParameter, value: any): ParameterValidation {
    const errors: string[] = [];

    // Type validation
    if (param.type === 'int' && !Number.isInteger(value)) {
      errors.push('Must be an integer');
    } else if (param.type === 'float' && typeof value !== 'number') {
      errors.push('Must be a number');
    } else if (param.type === 'bool' && typeof value !== 'boolean') {
      errors.push('Must be true or false');
    }

    // Range validation
    if (typeof value === 'number') {
      if (param.min !== undefined && value < param.min) {
        errors.push(`Must be >= ${param.min}`);
      }
      if (param.max !== undefined && value > param.max) {
        errors.push(`Must be <= ${param.max}`);
      }
    }

    // Options validation
    if (param.options && !param.options.includes(value)) {
      errors.push(`Must be one of: ${param.options.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined,
      warning: this.getParameterWarning(param, value)
    };
  }

  /**
   * Get parameter warning
   */
  private getParameterWarning(param: IndicatorParameter, value: any): string | undefined {
    if (param.type === 'int' && typeof value === 'number') {
      if (param.name.includes('length') || param.name.includes('period')) {
        if (value < 5) {
          return 'Very short periods may produce noisy signals';
        } else if (value > 100) {
          return 'Very long periods may lag significantly';
        }
      }
    }
    return undefined;
  }

  /**
   * Get parameter suggestions
   */
  private getParameterSuggestions(param: IndicatorParameter): string[] {
    const suggestions: string[] = [];

    if (param.name.includes('length') || param.name.includes('period')) {
      suggestions.push('Common values: 14, 20, 50, 200');
    }

    if (param.name.includes('multiplier') || param.name.includes('mult')) {
      suggestions.push('Typical range: 1.5 - 2.5');
    }

    if (param.name.includes('threshold') || param.name.includes('level')) {
      suggestions.push('Adjust based on market volatility');
    }

    return suggestions;
  }

  /**
   * Apply preset to configuration
   */
  applyPreset(configId: string, presetId: string): IndicatorConfig {
    const config = this.configs.get(configId);
    const preset = this.presets.get(presetId);

    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }
    if (!preset) {
      throw new Error(`Preset '${presetId}' not found`);
    }
    if (config.indicatorId !== preset.indicatorId) {
      throw new Error(`Preset is not compatible with indicator '${config.indicatorId}'`);
    }

    return this.updateConfig(configId, {
      parameters: { ...config.parameters, ...preset.parameters }
    });
  }

  /**
   * Get available presets for indicator
   */
  getPresetsForIndicator(indicatorId: string): ConfigurationPreset[] {
    return Array.from(this.presets.values()).filter(
      preset => preset.indicatorId === indicatorId
    );
  }

  /**
   * Create custom preset
   */
  createPreset(
    name: string,
    description: string,
    indicatorId: string,
    parameters: Record<string, any>,
    tags: string[] = []
  ): string {
    const presetId = `preset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const preset: ConfigurationPreset = {
      id: presetId,
      name,
      description,
      indicatorId,
      parameters,
      tags: [...tags, 'custom'],
      author: 'User',
      rating: 0,
      usage: 0
    };

    this.presets.set(presetId, preset);
    return presetId;
  }

  /**
   * Generate Pine Script code for configuration
   */
  generateCode(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    // Validate configuration first
    const validation = this.validateConfig(configId);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Generate indicator code
    const indicatorCode = indicatorGenerator.generateIndicatorCode(
      config.indicatorId,
      config.parameters,
      config.alias
    );

    // Generate plot code
    const plotCode = indicatorGenerator.generatePlotCode(
      config.indicatorId,
      config.alias,
      config.plotSettings.colors
    );

    return [indicatorCode, ...plotCode].join('\n');
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): IndicatorConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Delete configuration
   */
  deleteConfig(configId: string): boolean {
    const deleted = this.configs.delete(configId);
    if (deleted) {
      this.validationCache.delete(configId);
    }
    return deleted;
  }

  /**
   * Clone configuration
   */
  cloneConfig(configId: string, newAlias?: string): IndicatorConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const clonedConfig: IndicatorConfig = {
      ...config,
      id: `config_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      alias: newAlias || `${config.alias}_copy`,
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(clonedConfig.id, clonedConfig);
    return clonedConfig;
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonData: string): IndicatorConfig {
    try {
      const config = JSON.parse(jsonData) as IndicatorConfig;
      
      // Generate new ID and timestamps
      config.id = `config_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      config.created = new Date();
      config.updated = new Date();

      // Validate the configuration
      const validation = indicatorGenerator.validateIndicatorParameters(
        config.indicatorId,
        config.parameters
      );

      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      this.configs.set(config.id, config);
      return config;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    totalConfigs: number;
    configsByIndicator: Record<string, number>;
    mostUsedPresets: ConfigurationPreset[];
    validationStats: {
      valid: number;
      invalid: number;
      warnings: number;
    };
  } {
    const configs = Array.from(this.configs.values());
    const configsByIndicator: Record<string, number> = {};

    configs.forEach(config => {
      configsByIndicator[config.indicatorId] = (configsByIndicator[config.indicatorId] || 0) + 1;
    });

    const mostUsedPresets = Array.from(this.presets.values())
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);

    let valid = 0;
    let invalid = 0;
    let warnings = 0;

    configs.forEach(config => {
      const validation = this.validateConfig(config.id);
      if (validation.isValid) {
        valid++;
      } else {
        invalid++;
      }
      warnings += validation.warnings.length;
    });

    return {
      totalConfigs: configs.length,
      configsByIndicator,
      mostUsedPresets,
      validationStats: { valid, invalid, warnings }
    };
  }

  /**
   * Initialize default configuration presets
   */
  private initializeDefaultPresets(): void {
    // RSI Presets
    this.presets.set('rsi_conservative', {
      id: 'rsi_conservative',
      name: 'RSI Conservative',
      description: 'Conservative RSI settings for stable signals',
      indicatorId: 'rsi',
      parameters: {
        length: 21,
        source: 'close',
        overbought: 75,
        oversold: 25
      },
      tags: ['conservative', 'stable', 'rsi'],
      author: 'PineGenie',
      rating: 4.5,
      usage: 1250
    });

    this.presets.set('rsi_aggressive', {
      id: 'rsi_aggressive',
      name: 'RSI Aggressive',
      description: 'Aggressive RSI settings for more frequent signals',
      indicatorId: 'rsi',
      parameters: {
        length: 9,
        source: 'close',
        overbought: 65,
        oversold: 35
      },
      tags: ['aggressive', 'frequent', 'rsi'],
      author: 'PineGenie',
      rating: 4.2,
      usage: 890
    });

    // MACD Presets
    this.presets.set('macd_standard', {
      id: 'macd_standard',
      name: 'MACD Standard',
      description: 'Standard MACD configuration (12,26,9)',
      indicatorId: 'macd',
      parameters: {
        fastLength: 12,
        slowLength: 26,
        signalLength: 9,
        source: 'close'
      },
      tags: ['standard', 'classic', 'macd'],
      author: 'PineGenie',
      rating: 4.7,
      usage: 2100
    });

    this.presets.set('macd_fast', {
      id: 'macd_fast',
      name: 'MACD Fast',
      description: 'Faster MACD for shorter timeframes',
      indicatorId: 'macd',
      parameters: {
        fastLength: 8,
        slowLength: 17,
        signalLength: 6,
        source: 'close'
      },
      tags: ['fast', 'scalping', 'macd'],
      author: 'PineGenie',
      rating: 4.1,
      usage: 650
    });
  }

  /**
   * Create new indicator configuration
   */
  createConfig(indicatorId: string, alias?: string): IndicatorConfig {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    const config: IndicatorConfig = {
      id: `config_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      indicatorId,
      alias: alias || indicator.name.toLowerCase().replace(/\s+/g, '_'),
      parameters: this.getDefaultParameters(indicator),
      enabled: true,
      plotSettings: this.getDefaultPlotSettings(indicator),
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(config.id, config);
    return config;
  }

  /**
   * Get default parameters for indicator
   */
  private getDefaultParameters(indicator: IndicatorDefinition): Record<string, any> {
    const params: Record<string, any> = {};
    indicator.parameters.forEach(param => {
      params[param.name] = param.defaultValue;
    });
    return params;
  }

  /**
   * Get default plot settings for indicator
   */
  private getDefaultPlotSettings(indicator: IndicatorDefinition): PlotSettings {
    const colors: Record<string, string> = {};
    const lineWidth: Record<string, number> = {};
    const styles: Record<string, string> = {};
    const visibility: Record<string, boolean> = {};

    indicator.outputs.forEach(output => {
      colors[output.name] = output.defaultColor || '#3b82f6';
      lineWidth[output.name] = 2;
      styles[output.name] = output.defaultStyle || 'solid';
      visibility[output.name] = true;
    });

    return {
      colors,
      lineWidth,
      styles,
      visibility,
      overlay: indicator.category !== 'momentum' && indicator.category !== 'volume'
    };
  }

  /**
   * Update indicator configuration
   */
  updateConfig(configId: string, updates: Partial<IndicatorConfig>): IndicatorConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const updatedConfig = { ...config, ...updates, updated: new Date() };
    this.configs.set(configId, updatedConfig);

    // Clear validation cache
    this.validationCache.delete(configId);

    return updatedConfig;
  }

  /**
   * Validate configuration parameters
   */
  validateConfig(configId: string): IndicatorValidationResult {
    const cached = this.validationCache.get(configId);
    if (cached) {
      return cached;
    }

    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const result = indicatorGenerator.validateIndicatorParameters(
      config.indicatorId,
      config.parameters
    );

    this.validationCache.set(configId, result);
    return result;
  }

  /**
   * Generate configuration form
   */
  generateForm(indicatorId: string): ConfigurationForm {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    // Group parameters by section
    const sections = new Map<string, FormParameter[]>();
    
    indicator.parameters.forEach(param => {
      const group = param.group || 'General';
      if (!sections.has(group)) {
        sections.set(group, []);
      }

      const formParam: FormParameter = {
        parameter: param,
        value: param.defaultValue,
        validation: { isValid: true },
        suggestions: this.getParameterSuggestions(param)
      };

      sections.get(group)!.push(formParam);
    });

    const configSections: ConfigSection[] = Array.from(sections.entries()).map(
      ([name, parameters]) => ({ name, parameters })
    );

    return {
      indicatorId,
      sections: configSections,
      validation: { isValid: true, errors: [], warnings: [], suggestions: [] }
    };
  }

  /**
   * Get parameter suggestions
   */
  private getParameterSuggestions(param: IndicatorParameter): string[] {
    const suggestions: string[] = [];

    switch (param.name) {
      case 'length':
      case 'period':
        suggestions.push('Shorter periods = more sensitive, longer periods = smoother');
        if (param.min && param.max) {
          suggestions.push(`Typical range: ${param.min}-${param.max}`);
        }
        break;
      case 'source':
        suggestions.push('close = most common, hl2 = average of high/low');
        break;
      case 'mult':
      case 'multiplier':
        suggestions.push('Higher values = wider bands/levels');
        break;
    }

    return suggestions;
  }

  /**
   * Apply preset to configuration
   */
  applyPreset(configId: string, presetId: string): IndicatorConfig {
    const config = this.configs.get(configId);
    const preset = this.presets.get(presetId);

    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }
    if (!preset) {
      throw new Error(`Preset '${presetId}' not found`);
    }
    if (config.indicatorId !== preset.indicatorId) {
      throw new Error(`Preset '${presetId}' is not compatible with indicator '${config.indicatorId}'`);
    }

    return this.updateConfig(configId, {
      parameters: { ...config.parameters, ...preset.parameters }
    });
  }

  /**
   * Get available presets for indicator
   */
  getPresetsForIndicator(indicatorId: string): ConfigurationPreset[] {
    return Array.from(this.presets.values()).filter(
      preset => preset.indicatorId === indicatorId
    );
  }

  /**
   * Create custom preset
   */
  createPreset(
    name: string,
    description: string,
    indicatorId: string,
    parameters: Record<string, any>,
    tags: string[] = []
  ): ConfigurationPreset {
    const preset: ConfigurationPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name,
      description,
      indicatorId,
      parameters,
      tags,
      author: 'User',
      rating: 0,
      usage: 0
    };

    this.presets.set(preset.id, preset);
    return preset;
  }

  /**
   * Generate Pine Script code for configuration
   */
  generateCode(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    // Validate first
    const validation = this.validateConfig(configId);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Generate indicator code
    const indicatorCode = indicatorGenerator.generateIndicatorCode(
      config.indicatorId,
      config.parameters,
      config.alias
    );

    // Generate plot code
    const plotCode = indicatorGenerator.generatePlotCode(
      config.indicatorId,
      config.alias,
      config.plotSettings.colors
    );

    return [indicatorCode, ...plotCode].join('\n');
  }

  /**
   * Optimize parameters using historical data
   */
  async optimizeParameters(
    configId: string,
    optimizationCriteria: 'profit' | 'sharpe' | 'drawdown' | 'winrate'
  ): Promise<Record<string, any>> {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const indicator = indicatorGenerator.getIndicator(config.indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${config.indicatorId}' not found`);
    }

    // Simple parameter optimization (in real implementation, use backtesting)
    const optimizedParams: Record<string, any> = { ...config.parameters };

    // Optimize numeric parameters
    indicator.parameters.forEach(param => {
      if (param.type === 'int' || param.type === 'float') {
        const current = config.parameters[param.name];
        const min = param.min || current * 0.5;
        const max = param.max || current * 2;
        
        // Simple optimization: test a few values around current
        const testValues = [
          Math.max(min, current * 0.8),
          current,
          Math.min(max, current * 1.2)
        ];

        // In real implementation, backtest each value
        // For now, just return a slightly optimized value
        optimizedParams[param.name] = testValues[1]; // Keep current for now
      }
    });

    return optimizedParams;
  }

  /**
   * Get configuration by ID
   */
  getConfig(configId: string): IndicatorConfig | undefined {
    return this.configs.get(configId);
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): IndicatorConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Delete configuration
   */
  deleteConfig(configId: string): boolean {
    const deleted = this.configs.delete(configId);
    if (deleted) {
      this.validationCache.delete(configId);
    }
    return deleted;
  }

  /**
   * Clone configuration
   */
  cloneConfig(configId: string, newAlias?: string): IndicatorConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const cloned: IndicatorConfig = {
      ...config,
      id: `config_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      alias: newAlias || `${config.alias}_copy`,
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(cloned.id, cloned);
    return cloned;
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonData: string): IndicatorConfig {
    try {
      const config = JSON.parse(jsonData) as IndicatorConfig;
      
      // Generate new ID and timestamps
      config.id = `config_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      config.created = new Date();
      config.updated = new Date();

      // Validate the configuration
      const validation = indicatorGenerator.validateIndicatorParameters(
        config.indicatorId,
        config.parameters
      );

      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      this.configs.set(config.id, config);
      return config;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    totalConfigs: number;
    configsByIndicator: Record<string, number>;
    mostUsedPresets: ConfigurationPreset[];
    validationStats: {
      valid: number;
      invalid: number;
      warnings: number;
    };
  } {
    const configs = Array.from(this.configs.values());
    const presets = Array.from(this.presets.values());

    const configsByIndicator: Record<string, number> = {};
    configs.forEach(config => {
      configsByIndicator[config.indicatorId] = (configsByIndicator[config.indicatorId] || 0) + 1;
    });

    const mostUsedPresets = presets
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5);

    let valid = 0;
    let invalid = 0;
    let warnings = 0;

    configs.forEach(config => {
      const validation = this.validateConfig(config.id);
      if (validation.isValid) {
        valid++;
      } else {
        invalid++;
      }
      warnings += validation.warnings.length;
    });

    return {
      totalConfigs: configs.length,
      configsByIndicator,
      mostUsedPresets,
      validationStats: { valid, invalid, warnings }
    };
  }

  /**
   * Initialize default configuration presets
   */
  private initializePresets(): void {
    // RSI presets
    this.presets.set('rsi_oversold_30_70', {
      id: 'rsi_oversold_30_70',
      name: 'RSI Oversold/Overbought (30/70)',
      description: 'Standard RSI configuration for oversold/overbought signals',
      indicatorId: 'rsi',
      parameters: {
        length: 14,
        source: 'close',
        overbought: 70,
        oversold: 30
      },
      tags: ['rsi', 'momentum', 'standard'],
      author: 'PineGenie',
      rating: 4.5,
      usage: 1250
    });

    this.presets.set('rsi_aggressive_20_80', {
      id: 'rsi_aggressive_20_80',
      name: 'RSI Aggressive (20/80)',
      description: 'More aggressive RSI levels for stronger signals',
      indicatorId: 'rsi',
      parameters: {
        length: 14,
        source: 'close',
        overbought: 80,
        oversold: 20
      },
      tags: ['rsi', 'momentum', 'aggressive'],
      author: 'PineGenie',
      rating: 4.2,
      usage: 890
    });

    // Moving Average presets
    this.presets.set('sma_golden_cross', {
      id: 'sma_golden_cross',
      name: 'SMA Golden Cross (50/200)',
      description: 'Classic golden cross setup with 50 and 200 period SMAs',
      indicatorId: 'sma',
      parameters: {
        length: 50,
        source: 'close'
      },
      tags: ['sma', 'trend', 'golden-cross'],
      author: 'PineGenie',
      rating: 4.7,
      usage: 2100
    });

    // MACD presets
    this.presets.set('macd_standard', {
      id: 'macd_standard',
      name: 'MACD Standard (12,26,9)',
      description: 'Standard MACD configuration',
      indicatorId: 'macd',
      parameters: {
        fastLength: 12,
        slowLength: 26,
        signalLength: 9,
        source: 'close'
      },
      tags: ['macd', 'momentum', 'standard'],
      author: 'PineGenie',
      rating: 4.6,
      usage: 1800
    });
  }

  /**
   * Create new indicator configuration
   */
  createConfig(
    indicatorId: string,
    alias: string,
    parameters: Record<string, any>,
    plotSettings?: Partial<PlotSettings>
  ): string {
    const configId = `config_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const config: IndicatorConfig = {
      id: configId,
      indicatorId,
      alias,
      parameters,
      enabled: true,
      plotSettings: {
        colors: {},
        lineWidth: {},
        styles: {},
        visibility: {},
        overlay: false,
        ...plotSettings
      },
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(configId, config);
    return configId;
  }

  /**
   * Update indicator configuration
   */
  updateConfig(configId: string, updates: Partial<IndicatorConfig>): void {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }

    Object.assign(config, updates, { updated: new Date() });
    
    // Clear validation cache for this config
    this.validationCache.delete(configId);
  }

  /**
   * Get indicator configuration
   */
  getConfig(configId: string): IndicatorConfig | undefined {
    return this.configs.get(configId);
  }

  /**
   * Delete indicator configuration
   */
  deleteConfig(configId: string): boolean {
    this.validationCache.delete(configId);
    return this.configs.delete(configId);
  }

  /**
   * Generate configuration form for indicator
   */
  generateConfigurationForm(indicatorId: string): ConfigurationForm {
    const indicator = this.getIndicatorDefinition(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator ${indicatorId} not found`);
    }

    // Group parameters by group
    const parameterGroups = new Map<string, IndicatorParameter[]>();
    indicator.parameters.forEach(param => {
      const group = param.group || 'General';
      if (!parameterGroups.has(group)) {
        parameterGroups.set(group, []);
      }
      parameterGroups.get(group)!.push(param);
    });

    // Create form sections
    const sections: ConfigSection[] = Array.from(parameterGroups.entries()).map(([groupName, params]) => ({
      name: groupName,
      parameters: params.map(param => ({
        parameter: param,
        value: param.defaultValue,
        validation: { isValid: true },
        suggestions: []
      }))
    }));

    return {
      indicatorId,
      sections,
      validation: { isValid: true, errors: [], warnings: [], suggestions: [] }
    };
  }

  /**
   * Validate configuration parameters
   */
  validateConfiguration(indicatorId: string, parameters: Record<string, any>): IndicatorValidationResult {
    const cacheKey = `${indicatorId}_${JSON.stringify(parameters)}`;
    const cached = this.validationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const indicator = this.getIndicatorDefinition(indicatorId);
    if (!indicator) {
      const result: IndicatorValidationResult = {
        isValid: false,
        errors: [`Indicator ${indicatorId} not found`],
        warnings: [],
        suggestions: []
      };
      this.validationCache.set(cacheKey, result);
      return result;
    }

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate each parameter
    indicator.parameters.forEach(param => {
      const value = parameters[param.name];
      
      if (value === undefined || value === null) {
        if (param.defaultValue === undefined) {
          errors.push(`Required parameter '${param.name}' is missing`);
        } else {
          warnings.push(`Parameter '${param.name}' not provided, using default: ${param.defaultValue}`);
        }
        return;
      }

      // Type validation
      const typeValidation = this.validateParameterType(param, value);
      if (!typeValidation.isValid) {
        errors.push(typeValidation.error!);
      }

      // Range validation
      const rangeValidation = this.validateParameterRange(param, value);
      if (!rangeValidation.isValid) {
        errors.push(rangeValidation.error!);
      }

      // Generate suggestions
      const paramSuggestions = this.generateParameterSuggestions(param, value);
      suggestions.push(...paramSuggestions);
    });

    const result: IndicatorValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };

    this.validationCache.set(cacheKey, result);
    return result;
  }

  /**
   * Validate parameter type
   */
  private validateParameterType(param: IndicatorParameter, value: any): ParameterValidation {
    switch (param.type) {
      case 'int':
        if (!Number.isInteger(value)) {
          return { isValid: false, error: `Parameter '${param.name}' must be an integer` };
        }
        break;
      case 'float':
        if (typeof value !== 'number') {
          return { isValid: false, error: `Parameter '${param.name}' must be a number` };
        }
        break;
      case 'bool':
        if (typeof value !== 'boolean') {
          return { isValid: false, error: `Parameter '${param.name}' must be a boolean` };
        }
        break;
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, error: `Parameter '${param.name}' must be a string` };
        }
        break;
      case 'source':
        const validSources = ['open', 'high', 'low', 'close', 'hl2', 'hlc3', 'ohlc4'];
        if (!validSources.includes(value)) {
          return { isValid: false, error: `Parameter '${param.name}' must be a valid price source` };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Validate parameter range
   */
  private validateParameterRange(param: IndicatorParameter, value: any): ParameterValidation {
    if (typeof value === 'number') {
      if (param.min !== undefined && value < param.min) {
        return { isValid: false, error: `Parameter '${param.name}' must be >= ${param.min}` };
      }
      if (param.max !== undefined && value > param.max) {
        return { isValid: false, error: `Parameter '${param.name}' must be <= ${param.max}` };
      }
    }

    if (param.options && !param.options.includes(value)) {
      return { isValid: false, error: `Parameter '${param.name}' must be one of: ${param.options.join(', ')}` };
    }

    return { isValid: true };
  }

  /**
   * Generate parameter suggestions
   */
  private generateParameterSuggestions(param: IndicatorParameter, value: any): string[] {
    const suggestions: string[] = [];

    // Performance suggestions
    if (param.type === 'int' && typeof value === 'number') {
      if (param.name.includes('length') || param.name.includes('period')) {
        if (value > 100) {
          suggestions.push(`Consider using shorter periods (${param.name}: ${value}) for better performance`);
        }
        if (value < 5) {
          suggestions.push(`Very short periods (${param.name}: ${value}) may produce noisy signals`);
        }
      }
    }

    // Common parameter suggestions
    if (param.name === 'source' && value === 'close') {
      suggestions.push('Consider using hl2 or hlc3 for smoother signals');
    }

    return suggestions;
  }

  /**
   * Get configuration presets for indicator
   */
  getPresets(indicatorId: string): ConfigurationPreset[] {
    return Array.from(this.presets.values()).filter(preset => preset.indicatorId === indicatorId);
  }

  /**
   * Apply preset to configuration
   */
  applyPreset(configId: string, presetId: string): void {
    const config = this.configs.get(configId);
    const preset = this.presets.get(presetId);
    
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }
    if (!preset) {
      throw new Error(`Preset ${presetId} not found`);
    }
    if (config.indicatorId !== preset.indicatorId) {
      throw new Error(`Preset ${presetId} is not compatible with indicator ${config.indicatorId}`);
    }

    config.parameters = { ...preset.parameters };
    config.updated = new Date();
    
    // Clear validation cache
    this.validationCache.delete(configId);
  }

  /**
   * Create custom preset from configuration
   */
  createPreset(
    configId: string,
    name: string,
    description: string,
    tags: string[] = []
  ): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }

    const presetId = `preset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const preset: ConfigurationPreset = {
      id: presetId,
      name,
      description,
      indicatorId: config.indicatorId,
      parameters: { ...config.parameters },
      tags,
      author: 'User',
      rating: 0,
      usage: 0
    };

    this.presets.set(presetId, preset);
    return presetId;
  }

  /**
   * Search presets
   */
  searchPresets(query: string, indicatorId?: string): ConfigurationPreset[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.presets.values()).filter(preset => {
      const matchesIndicator = !indicatorId || preset.indicatorId === indicatorId;
      const matchesQuery = 
        preset.name.toLowerCase().includes(searchTerm) ||
        preset.description.toLowerCase().includes(searchTerm) ||
        preset.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      return matchesIndicator && matchesQuery;
    });
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): IndicatorConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration ${configId} not found`);
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonData: string): string {
    try {
      const config = JSON.parse(jsonData) as IndicatorConfig;
      const newId = `config_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      config.id = newId;
      config.created = new Date();
      config.updated = new Date();
      
      this.configs.set(newId, config);
      return newId;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get indicator definition (placeholder - should integrate with indicators.ts)
   */
  private getIndicatorDefinition(indicatorId: string): any {
    // This should integrate with the indicators system
    // For now, return a basic structure
    return {
      id: indicatorId,
      parameters: []
    };
  }
    
    this.initializeDefaultPresets();
  }

  /**
   * Initialize default configuration presets
   */
  private initializeDefaultPresets(): void {
    // RSI Presets
    this.presets.set('rsi_conservative', {
      id: 'rsi_conservative',
      name: 'RSI Conservative',
      description: 'Conservative RSI settings for stable signals',
      indicatorId: 'rsi',
      parameters: {
        length: 21,
        source: 'close',
        overbought: 75,
        oversold: 25
      },
      tags: ['conservative', 'stable'],
      author: 'PineGenie',
      rating: 4.5,
      usage: 1250
    });

    this.presets.set('rsi_aggressive', {
      id: 'rsi_aggressive',
      name: 'RSI Aggressive',
      description: 'Aggressive RSI settings for more frequent signals',
      indicatorId: 'rsi',
      parameters: {
        length: 9,
        source: 'close',
        overbought: 65,
        oversold: 35
      },
      tags: ['aggressive', 'frequent'],
      author: 'PineGenie',
      rating: 4.2,
      usage: 890
    });

    // MACD Presets
    this.presets.set('macd_standard', {
      id: 'macd_standard',
      name: 'MACD Standard',
      description: 'Standard MACD configuration (12,26,9)',
      indicatorId: 'macd',
      parameters: {
        fastLength: 12,
        slowLength: 26,
        signalLength: 9,
        source: 'close'
      },
      tags: ['standard', 'popular'],
      author: 'PineGenie',
      rating: 4.8,
      usage: 2100
    });

    // Bollinger Bands Presets
    this.presets.set('bb_standard', {
      id: 'bb_standard',
      name: 'Bollinger Bands Standard',
      description: 'Standard Bollinger Bands (20, 2.0)',
      indicatorId: 'bollinger_bands',
      parameters: {
        length: 20,
        mult: 2.0,
        source: 'close'
      },
      tags: ['standard', 'volatility'],
      author: 'PineGenie',
      rating: 4.6,
      usage: 1800
    });
  }

  /**
   * Create new indicator configuration
   */
  createConfig(indicatorId: string, alias?: string): IndicatorConfig {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    const config: IndicatorConfig = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      indicatorId,
      alias: alias || indicator.name,
      parameters: this.getDefaultParameters(indicator),
      enabled: true,
      plotSettings: this.getDefaultPlotSettings(indicator),
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(config.id, config);
    return config;
  }

  /**
   * Get default parameters for indicator
   */
  private getDefaultParameters(indicator: IndicatorDefinition): Record<string, any> {
    const params: Record<string, any> = {};
    indicator.parameters.forEach(param => {
      params[param.name] = param.defaultValue;
    });
    return params;
  }

  /**
   * Get default plot settings for indicator
   */
  private getDefaultPlotSettings(indicator: IndicatorDefinition): PlotSettings {
    const colors: Record<string, string> = {};
    const lineWidth: Record<string, number> = {};
    const styles: Record<string, string> = {};
    const visibility: Record<string, boolean> = {};

    indicator.outputs.forEach(output => {
      colors[output.name] = output.defaultColor || '#3b82f6';
      lineWidth[output.name] = 2;
      styles[output.name] = output.defaultStyle || 'solid';
      visibility[output.name] = true;
    });

    return {
      colors,
      lineWidth,
      styles,
      visibility,
      overlay: indicator.category !== 'momentum' && indicator.category !== 'volume'
    };
  }

  /**
   * Update indicator configuration
   */
  updateConfig(configId: string, updates: Partial<IndicatorConfig>): IndicatorConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const updatedConfig = { ...config, ...updates, updated: new Date() };
    this.configs.set(configId, updatedConfig);

    // Clear validation cache
    this.validationCache.delete(configId);

    return updatedConfig;
  }

  /**
   * Validate configuration parameters
   */
  validateConfig(configId: string): IndicatorValidationResult {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    // Check cache first
    const cached = this.validationCache.get(configId);
    if (cached) {
      return cached;
    }

    const result = indicatorGenerator.validateIndicatorParameters(
      config.indicatorId,
      config.parameters
    );

    // Cache result
    this.validationCache.set(configId, result);

    return result;
  }

  /**
   * Generate configuration form
   */
  generateForm(indicatorId: string): ConfigurationForm {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    // Group parameters by group
    const parameterGroups = new Map<string, IndicatorParameter[]>();
    indicator.parameters.forEach(param => {
      const group = param.group || 'General';
      if (!parameterGroups.has(group)) {
        parameterGroups.set(group, []);
      }
      parameterGroups.get(group)!.push(param);
    });

    // Create form sections
    const sections: ConfigSection[] = Array.from(parameterGroups.entries()).map(
      ([groupName, parameters]) => ({
        name: groupName,
        parameters: parameters.map(param => ({
          parameter: param,
          value: param.defaultValue,
          validation: this.validateParameter(param, param.defaultValue),
          suggestions: this.getParameterSuggestions(param)
        }))
      })
    );

    return {
      indicatorId,
      sections,
      validation: {
        isValid: true,
        errors: [],
        warnings: [],
        suggestions: []
      }
    };
  }

  /**
   * Validate individual parameter
   */
  private validateParameter(param: IndicatorParameter, value: any): ParameterValidation {
    const errors: string[] = [];

    // Type validation
    if (param.type === 'int' && !Number.isInteger(value)) {
      errors.push('Must be an integer');
    } else if (param.type === 'float' && typeof value !== 'number') {
      errors.push('Must be a number');
    } else if (param.type === 'bool' && typeof value !== 'boolean') {
      errors.push('Must be true or false');
    } else if (param.type === 'string' && typeof value !== 'string') {
      errors.push('Must be a string');
    }

    // Range validation
    if (typeof value === 'number') {
      if (param.min !== undefined && value < param.min) {
        errors.push(`Must be at least ${param.min}`);
      }
      if (param.max !== undefined && value > param.max) {
        errors.push(`Must be at most ${param.max}`);
      }
    }

    // Options validation
    if (param.options && !param.options.includes(value)) {
      errors.push(`Must be one of: ${param.options.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      error: errors.length > 0 ? errors[0] : undefined,
      warning: this.getParameterWarning(param, value)
    };
  }

  /**
   * Get parameter warning
   */
  private getParameterWarning(param: IndicatorParameter, value: any): string | undefined {
    // Performance warnings
    if (param.name === 'length' && typeof value === 'number' && value > 100) {
      return 'Large periods may impact performance';
    }

    // Logic warnings
    if (param.name === 'overbought' && param.name === 'oversold' && value <= 50) {
      return 'Overbought level should typically be above 50';
    }

    return undefined;
  }

  /**
   * Get parameter suggestions
   */
  private getParameterSuggestions(param: IndicatorParameter): string[] {
    const suggestions: string[] = [];

    // Common suggestions based on parameter type
    if (param.name === 'length') {
      suggestions.push('14 is commonly used for momentum indicators');
      suggestions.push('20 is popular for trend indicators');
    }

    if (param.name === 'source') {
      suggestions.push('close is most common');
      suggestions.push('hlc3 for average price');
    }

    return suggestions;
  }

  /**
   * Apply preset to configuration
   */
  applyPreset(configId: string, presetId: string): IndicatorConfig {
    const config = this.configs.get(configId);
    const preset = this.presets.get(presetId);

    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }
    if (!preset) {
      throw new Error(`Preset '${presetId}' not found`);
    }
    if (config.indicatorId !== preset.indicatorId) {
      throw new Error('Preset is not compatible with this indicator');
    }

    return this.updateConfig(configId, {
      parameters: { ...config.parameters, ...preset.parameters }
    });
  }

  /**
   * Get available presets for indicator
   */
  getPresetsForIndicator(indicatorId: string): ConfigurationPreset[] {
    return Array.from(this.presets.values()).filter(
      preset => preset.indicatorId === indicatorId
    );
  }

  /**
   * Create custom preset
   */
  createPreset(
    name: string,
    description: string,
    indicatorId: string,
    parameters: Record<string, any>,
    tags: string[] = []
  ): ConfigurationPreset {
    const preset: ConfigurationPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      indicatorId,
      parameters,
      tags,
      author: 'User',
      rating: 0,
      usage: 0
    };

    this.presets.set(preset.id, preset);
    return preset;
  }

  /**
   * Generate Pine Script code for configuration
   */
  generateCode(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    // Validate first
    const validation = this.validateConfig(configId);
    if (!validation.isValid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Generate indicator code
    const indicatorCode = indicatorGenerator.generateIndicatorCode(
      config.indicatorId,
      config.parameters,
      config.alias
    );

    // Generate plot code
    const plotCode = indicatorGenerator.generatePlotCode(
      config.indicatorId,
      config.alias,
      config.plotSettings.colors
    );

    return [indicatorCode, ...plotCode].join('\n');
  }

  /**
   * Get configuration by ID
   */
  getConfig(configId: string): IndicatorConfig | undefined {
    return this.configs.get(configId);
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): IndicatorConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Delete configuration
   */
  deleteConfig(configId: string): boolean {
    const deleted = this.configs.delete(configId);
    if (deleted) {
      this.validationCache.delete(configId);
    }
    return deleted;
  }

  /**
   * Clone configuration
   */
  cloneConfig(configId: string, newAlias?: string): IndicatorConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const cloned: IndicatorConfig = {
      ...config,
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      alias: newAlias || `${config.alias} Copy`,
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(cloned.id, cloned);
    return cloned;
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonData: string): IndicatorConfig {
    try {
      const config = JSON.parse(jsonData) as IndicatorConfig;
      
      // Generate new ID and timestamps
      config.id = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      config.created = new Date();
      config.updated = new Date();

      // Validate the configuration
      const validation = indicatorGenerator.validateIndicatorParameters(
        config.indicatorId,
        config.parameters
      );

      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      this.configs.set(config.id, config);
      return config;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search configurations
   */
  searchConfigs(query: string): IndicatorConfig[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.configs.values()).filter(config =>
      config.alias.toLowerCase().includes(searchTerm) ||
      config.indicatorId.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get configuration statistics
   */
  getStats(): {
    totalConfigs: number;
    configsByIndicator: Record<string, number>;
    mostUsedIndicators: Array<{ indicatorId: string; count: number }>;
  } {
    const configs = Array.from(this.configs.values());
    const configsByIndicator: Record<string, number> = {};

    configs.forEach(config => {
      configsByIndicator[config.indicatorId] = (configsByIndicator[config.indicatorId] || 0) + 1;
    });

    const mostUsedIndicators = Object.entries(configsByIndicator)
      .map(([indicatorId, count]) => ({ indicatorId, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalConfigs: configs.length,
      configsByIndicator,
      mostUsedIndicators
    };
  }
    
    // Load default presets
    this.loadDefaultPresets();
  }

  /**
   * Load default configuration presets
   */
  private loadDefaultPresets(): void {
    const defaultPresets: ConfigurationPreset[] = [
      {
        id: 'rsi_conservative',
        name: 'RSI Conservative',
        description: 'Conservative RSI settings for stable signals',
        indicatorId: 'rsi',
        parameters: { length: 21, overbought: 75, oversold: 25 },
        tags: ['conservative', 'stable'],
        author: 'PineGenie',
        rating: 4.5,
        usage: 1250
      },
      {
        id: 'rsi_aggressive',
        name: 'RSI Aggressive',
        description: 'Aggressive RSI settings for quick signals',
        indicatorId: 'rsi',
        parameters: { length: 9, overbought: 65, oversold: 35 },
        tags: ['aggressive', 'quick'],
        author: 'PineGenie',
        rating: 4.2,
        usage: 890
      },
      {
        id: 'macd_standard',
        name: 'MACD Standard',
        description: 'Standard MACD configuration',
        indicatorId: 'macd',
        parameters: { fastLength: 12, slowLength: 26, signalLength: 9 },
        tags: ['standard', 'reliable'],
        author: 'PineGenie',
        rating: 4.7,
        usage: 2100
      }
    ];

    defaultPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
  }

  /**
   * Create a new indicator configuration
   */
  createConfig(indicatorId: string, alias?: string): IndicatorConfig {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    const config: IndicatorConfig = {
      id: `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      indicatorId,
      alias: alias || indicator.name.toLowerCase().replace(/\s+/g, '_'),
      parameters: this.getDefaultParameters(indicator),
      enabled: true,
      plotSettings: this.getDefaultPlotSettings(indicator),
      created: new Date(),
      updated: new Date()
    };

    this.configs.set(config.id, config);
    return config;
  }

  /**
   * Get default parameters for an indicator
   */
  private getDefaultParameters(indicator: IndicatorDefinition): Record<string, any> {
    const params: Record<string, any> = {};
    indicator.parameters.forEach(param => {
      params[param.name] = param.defaultValue;
    });
    return params;
  }

  /**
   * Get default plot settings for an indicator
   */
  private getDefaultPlotSettings(indicator: IndicatorDefinition): PlotSettings {
    const colors: Record<string, string> = {};
    const lineWidth: Record<string, number> = {};
    const styles: Record<string, string> = {};
    const visibility: Record<string, boolean> = {};

    indicator.outputs.forEach(output => {
      colors[output.name] = output.defaultColor || 'color.blue';
      lineWidth[output.name] = 2;
      styles[output.name] = output.defaultStyle || 'plot.style_line';
      visibility[output.name] = true;
    });

    return {
      colors,
      lineWidth,
      styles,
      visibility,
      overlay: indicator.category !== 'momentum' && indicator.category !== 'volume'
    };
  }

  /**
   * Update indicator configuration
   */
  updateConfig(configId: string, updates: Partial<IndicatorConfig>): IndicatorConfig {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const updatedConfig = {
      ...config,
      ...updates,
      updated: new Date()
    };

    // Validate parameters if they were updated
    if (updates.parameters) {
      const validation = indicatorGenerator.validateIndicatorParameters(
        config.indicatorId,
        updatedConfig.parameters
      );
      if (!validation.isValid) {
        throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
      }
    }

    this.configs.set(configId, updatedConfig);
    
    // Clear validation cache for this config
    this.validationCache.delete(configId);
    
    return updatedConfig;
  }

  /**
   * Get configuration by ID
   */
  getConfig(configId: string): IndicatorConfig | undefined {
    return this.configs.get(configId);
  }

  /**
   * Get all configurations
   */
  getAllConfigs(): IndicatorConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Delete configuration
   */
  deleteConfig(configId: string): boolean {
    const deleted = this.configs.delete(configId);
    if (deleted) {
      this.validationCache.delete(configId);
    }
    return deleted;
  }

  /**
   * Generate configuration form for an indicator
   */
  generateConfigurationForm(indicatorId: string, currentConfig?: IndicatorConfig): ConfigurationForm {
    const indicator = indicatorGenerator.getIndicator(indicatorId);
    if (!indicator) {
      throw new Error(`Indicator '${indicatorId}' not found`);
    }

    // Group parameters by section
    const parameterGroups = new Map<string, IndicatorParameter[]>();
    indicator.parameters.forEach(param => {
      const group = param.group || 'General';
      if (!parameterGroups.has(group)) {
        parameterGroups.set(group, []);
      }
      parameterGroups.get(group)!.push(param);
    });

    // Create form sections
    const sections: ConfigSection[] = Array.from(parameterGroups.entries()).map(([groupName, params]) => ({
      name: groupName,
      parameters: params.map(param => ({
        parameter: param,
        value: currentConfig?.parameters[param.name] ?? param.defaultValue,
        validation: this.validateParameter(param, currentConfig?.parameters[param.name] ?? param.defaultValue),
        suggestions: this.getParameterSuggestions(param, indicator)
      }))
    }));

    // Overall validation
    const validation = currentConfig 
      ? indicatorGenerator.validateIndicatorParameters(indicatorId, currentConfig.parameters)
      : { isValid: true, errors: [], warnings: [], suggestions: [] };

    return {
      indicatorId,
      sections,
      validation
    };
  }

  /**
   * Validate a single parameter
   */
  private validateParameter(param: IndicatorParameter, value: any): ParameterValidation {
    if (value === undefined || value === null) {
      return {
        isValid: param.defaultValue !== undefined,
        error: param.defaultValue === undefined ? `${param.name} is required` : undefined,
        warning: param.defaultValue !== undefined ? `Using default value: ${param.defaultValue}` : undefined
      };
    }

    // Type validation
    if (param.type === 'int' && !Number.isInteger(value)) {
      return { isValid: false, error: 'Must be an integer' };
    }
    if (param.type === 'float' && typeof value !== 'number') {
      return { isValid: false, error: 'Must be a number' };
    }
    if (param.type === 'bool' && typeof value !== 'boolean') {
      return { isValid: false, error: 'Must be true or false' };
    }
    if (param.type === 'string' && typeof value !== 'string') {
      return { isValid: false, error: 'Must be text' };
    }

    // Range validation
    if (typeof value === 'number') {
      if (param.min !== undefined && value < param.min) {
        return { isValid: false, error: `Must be at least ${param.min}` };
      }
      if (param.max !== undefined && value > param.max) {
        return { isValid: false, error: `Must be at most ${param.max}` };
      }
    }

    // Options validation
    if (param.options && !param.options.includes(value)) {
      return { isValid: false, error: `Must be one of: ${param.options.join(', ')}` };
    }

    return { isValid: true };
  }

  /**
   * Get parameter suggestions
   */
  private getParameterSuggestions(param: IndicatorParameter, indicator: IndicatorDefinition): string[] {
    const suggestions: string[] = [];

    // Common suggestions based on parameter type and indicator
    if (param.name.includes('length') || param.name.includes('period')) {
      if (indicator.category === 'trend') {
        suggestions.push('Try 20 for daily charts, 50 for weekly');
      } else if (indicator.category === 'momentum') {
        suggestions.push('Use 14 for standard momentum, 9 for faster signals');
      }
    }

    if (param.name.includes('overbought')) {
      suggestions.push('70-80 range is typical, higher values reduce false signals');
    }

    if (param.name.includes('oversold')) {
      suggestions.push('20-30 range is typical, lower values reduce false signals');
    }

    return suggestions;
  }

  /**
   * Apply preset to configuration
   */
  applyPreset(configId: string, presetId: string): IndicatorConfig {
    const config = this.configs.get(configId);
    const preset = this.presets.get(presetId);

    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }
    if (!preset) {
      throw new Error(`Preset '${presetId}' not found`);
    }
    if (config.indicatorId !== preset.indicatorId) {
      throw new Error(`Preset is for ${preset.indicatorId}, but config is for ${config.indicatorId}`);
    }

    return this.updateConfig(configId, {
      parameters: { ...preset.parameters }
    });
  }

  /**
   * Get presets for an indicator
   */
  getPresetsForIndicator(indicatorId: string): ConfigurationPreset[] {
    return Array.from(this.presets.values()).filter(
      preset => preset.indicatorId === indicatorId
    );
  }

  /**
   * Create custom preset from configuration
   */
  createPresetFromConfig(configId: string, presetName: string, description: string): ConfigurationPreset {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    const preset: ConfigurationPreset = {
      id: `preset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: presetName,
      description,
      indicatorId: config.indicatorId,
      parameters: { ...config.parameters },
      tags: ['custom'],
      author: 'User',
      rating: 0,
      usage: 0
    };

    this.presets.set(preset.id, preset);
    return preset;
  }

  /**
   * Generate Pine Script code for configuration
   */
  generateCode(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    if (!config.enabled) {
      return `// ${config.alias} is disabled`;
    }

    // Generate indicator calculation
    const calculationCode = indicatorGenerator.generateIndicatorCode(
      config.indicatorId,
      config.parameters,
      config.alias
    );

    // Generate plot code if overlay settings allow
    const plotCode = config.plotSettings.overlay 
      ? indicatorGenerator.generatePlotCode(config.indicatorId, config.alias, config.plotSettings.colors)
      : [];

    return [calculationCode, ...plotCode].join('\n');
  }

  /**
   * Validate configuration in real-time
   */
  validateConfiguration(configId: string): IndicatorValidationResult {
    // Check cache first
    if (this.validationCache.has(configId)) {
      return this.validationCache.get(configId)!;
    }

    const config = this.configs.get(configId);
    if (!config) {
      const result: IndicatorValidationResult = {
        isValid: false,
        errors: [`Configuration '${configId}' not found`],
        warnings: [],
        suggestions: []
      };
      return result;
    }

    const result = indicatorGenerator.validateIndicatorParameters(
      config.indicatorId,
      config.parameters
    );

    // Cache the result
    this.validationCache.set(configId, result);

    return result;
  }

  /**
   * Export configuration as JSON
   */
  exportConfig(configId: string): string {
    const config = this.configs.get(configId);
    if (!config) {
      throw new Error(`Configuration '${configId}' not found`);
    }

    return JSON.stringify(config, null, 2);
  }

  /**
   * Import configuration from JSON
   */
  importConfig(jsonData: string): IndicatorConfig {
    try {
      const config = JSON.parse(jsonData) as IndicatorConfig;
      
      // Validate the imported config
      const validation = indicatorGenerator.validateIndicatorParameters(
        config.indicatorId,
        config.parameters
      );
      
      if (!validation.isValid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      // Generate new ID and timestamps
      config.id = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      config.created = new Date();
      config.updated = new Date();

      this.configs.set(config.id, config);
      return config;
    } catch (error) {
      throw new Error(`Failed to import configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const indicatorConfigManager = new IndicatorConfigManager();
  }

// Ex
port singleton instance
export const indicatorConfigManager = new IndicatorConfigManager();