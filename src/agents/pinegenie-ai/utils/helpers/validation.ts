/**
 * Validation Helpers
 * Utility functions for validating AI system inputs and outputs
 */

import { TradingIntent, StrategyBlueprint, StrategyComponent, ParameterSet } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export interface ValidationRule<T> {
  name: string;
  validate: (input: T) => ValidationResult;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Validate trading intent structure and content
 */
export function validateTradingIntent(intent: TradingIntent): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Check required fields
  if (!intent.strategyType) {
    result.errors.push('Strategy type is required');
    result.isValid = false;
  }

  if (!intent.indicators || intent.indicators.length === 0) {
    result.warnings.push('No indicators specified - strategy may be incomplete');
  }

  if (!intent.conditions || intent.conditions.length === 0) {
    result.warnings.push('No conditions specified - strategy may not have entry/exit logic');
  }

  if (!intent.actions || intent.actions.length === 0) {
    result.errors.push('No actions specified - strategy cannot execute trades');
    result.isValid = false;
  }

  // Check confidence level
  if (intent.confidence < 0.3) {
    result.warnings.push('Low confidence in intent interpretation - consider providing more specific details');
  }

  // Validate strategy type
  const validStrategyTypes = ['trend-following', 'mean-reversion', 'breakout', 'scalping', 'custom'];
  if (!validStrategyTypes.includes(intent.strategyType)) {
    result.errors.push(`Invalid strategy type: ${intent.strategyType}`);
    result.isValid = false;
  }

  // Check for common indicator combinations
  if (intent.indicators.includes('rsi') && intent.indicators.includes('stochastic')) {
    result.warnings.push('RSI and Stochastic are both momentum oscillators - consider using only one');
  }

  // Check for risk management
  if (!intent.riskManagement || intent.riskManagement.length === 0) {
    result.suggestions.push('Consider adding risk management components like stop-loss or position sizing');
  }

  // Validate timeframe if specified
  if (intent.timeframe) {
    const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
    if (!validTimeframes.includes(intent.timeframe)) {
      result.warnings.push(`Unusual timeframe: ${intent.timeframe} - ensure it's supported`);
    }
  }

  return result;
}

/**
 * Validate strategy blueprint structure and completeness
 */
export function validateStrategyBlueprint(blueprint: StrategyBlueprint): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Check required fields
  if (!blueprint.id) {
    result.errors.push('Blueprint ID is required');
    result.isValid = false;
  }

  if (!blueprint.name) {
    result.errors.push('Blueprint name is required');
    result.isValid = false;
  }

  if (!blueprint.components || blueprint.components.length === 0) {
    result.errors.push('Blueprint must have at least one component');
    result.isValid = false;
  }

  // Validate components
  const componentTypes = new Set<string>();
  let hasDataSource = false;
  let hasCondition = false;
  let hasAction = false;

  blueprint.components.forEach((component, index) => {
    const componentResult = validateStrategyComponent(component);
    if (!componentResult.isValid) {
      result.errors.push(`Component ${index}: ${componentResult.errors.join(', ')}`);
      result.isValid = false;
    }
    result.warnings.push(...componentResult.warnings.map(w => `Component ${index}: ${w}`));

    componentTypes.add(component.type);
    if (component.type === 'data-source') hasDataSource = true;
    if (component.type === 'condition') hasCondition = true;
    if (component.type === 'action') hasAction = true;
  });

  // Check for essential component types
  if (!hasDataSource) {
    result.errors.push('Strategy must have at least one data source');
    result.isValid = false;
  }

  if (!hasCondition) {
    result.warnings.push('Strategy has no conditions - may execute trades without proper signals');
  }

  if (!hasAction) {
    result.errors.push('Strategy must have at least one action (buy/sell)');
    result.isValid = false;
  }

  // Check for risk management
  const hasRiskManagement = blueprint.components.some(c => c.type === 'risk');
  if (!hasRiskManagement) {
    result.suggestions.push('Consider adding risk management components (stop-loss, take-profit)');
  }

  // Validate flow connections
  if (blueprint.flow && blueprint.flow.length > 0) {
    const flowResult = validateStrategyFlow(blueprint.flow, blueprint.components);
    if (!flowResult.isValid) {
      result.errors.push(...flowResult.errors);
      result.isValid = false;
    }
    result.warnings.push(...flowResult.warnings);
  }

  // Check parameter consistency
  const paramResult = validateParameterSet(blueprint.parameters);
  if (!paramResult.isValid) {
    result.errors.push(...paramResult.errors);
    result.isValid = false;
  }
  result.warnings.push(...paramResult.warnings);

  return result;
}

/**
 * Validate individual strategy component
 */
export function validateStrategyComponent(component: StrategyComponent): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  // Check required fields
  if (!component.type) {
    result.errors.push('Component type is required');
    result.isValid = false;
  }

  if (!component.subtype) {
    result.errors.push('Component subtype is required');
    result.isValid = false;
  }

  // Validate component type
  const validTypes = ['data-source', 'indicator', 'condition', 'action', 'risk', 'timing'];
  if (!validTypes.includes(component.type)) {
    result.errors.push(`Invalid component type: ${component.type}`);
    result.isValid = false;
  }

  // Validate parameters
  if (!component.parameters) {
    result.warnings.push('Component has no parameters - may use default values');
  } else {
    const paramResult = validateComponentParameters(component);
    if (!paramResult.isValid) {
      result.errors.push(...paramResult.errors);
      result.isValid = false;
    }
    result.warnings.push(...paramResult.warnings);
  }

  // Check priority
  if (component.priority < 0 || component.priority > 100) {
    result.warnings.push('Component priority should be between 0 and 100');
  }

  // Validate dependencies
  if (component.dependencies && component.dependencies.length > 0) {
    component.dependencies.forEach(dep => {
      if (typeof dep !== 'string' || dep.trim() === '') {
        result.errors.push('Invalid dependency reference');
        result.isValid = false;
      }
    });
  }

  return result;
}

/**
 * Validate component parameters based on type
 */
function validateComponentParameters(component: StrategyComponent): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  const { type, subtype, parameters } = component;

  switch (type) {
    case 'indicator':
      result.errors.push(...validateIndicatorParameters(subtype, parameters));
      break;
    case 'condition':
      result.errors.push(...validateConditionParameters(subtype, parameters));
      break;
    case 'action':
      result.errors.push(...validateActionParameters(subtype, parameters));
      break;
    case 'risk':
      result.errors.push(...validateRiskParameters(subtype, parameters));
      break;
  }

  if (result.errors.length > 0) {
    result.isValid = false;
  }

  return result;
}

/**
 * Validate indicator parameters
 */
function validateIndicatorParameters(subtype: string, parameters: Record<string, unknown>): string[] {
  const errors: string[] = [];

  switch (subtype) {
    case 'rsi':
      if (!parameters.period || typeof parameters.period !== 'number' || parameters.period < 2) {
        errors.push('RSI period must be a number >= 2');
      }
      break;
    case 'sma':
    case 'ema':
      if (!parameters.period || typeof parameters.period !== 'number' || parameters.period < 1) {
        errors.push('Moving average period must be a number >= 1');
      }
      break;
    case 'macd':
      if (!parameters.fastPeriod || typeof parameters.fastPeriod !== 'number' || parameters.fastPeriod < 1) {
        errors.push('MACD fast period must be a number >= 1');
      }
      if (!parameters.slowPeriod || typeof parameters.slowPeriod !== 'number' || parameters.slowPeriod < 1) {
        errors.push('MACD slow period must be a number >= 1');
      }
      if (parameters.fastPeriod >= parameters.slowPeriod) {
        errors.push('MACD fast period must be less than slow period');
      }
      break;
  }

  return errors;
}

/**
 * Validate condition parameters
 */
function validateConditionParameters(subtype: string, parameters: Record<string, unknown>): string[] {
  const errors: string[] = [];

  switch (subtype) {
    case 'greater_than':
    case 'less_than':
    case 'equal_to':
      if (parameters.threshold === undefined || typeof parameters.threshold !== 'number') {
        errors.push('Comparison condition must have a numeric threshold');
      }
      break;
    case 'crosses_above':
    case 'crosses_below':
      if (!parameters.source1 || !parameters.source2) {
        errors.push('Crossover condition must have two data sources');
      }
      break;
  }

  return errors;
}

/**
 * Validate action parameters
 */
function validateActionParameters(subtype: string, parameters: Record<string, unknown>): string[] {
  const errors: string[] = [];

  switch (subtype) {
    case 'buy':
    case 'sell':
      if (parameters.quantity && (typeof parameters.quantity !== 'number' || parameters.quantity <= 0)) {
        errors.push('Trade quantity must be a positive number');
      }
      if (parameters.price && typeof parameters.price !== 'number') {
        errors.push('Trade price must be a number');
      }
      break;
  }

  return errors;
}

/**
 * Validate risk management parameters
 */
function validateRiskParameters(subtype: string, parameters: Record<string, unknown>): string[] {
  const errors: string[] = [];

  switch (subtype) {
    case 'stop_loss':
    case 'take_profit':
      if (!parameters.percentage && !parameters.price) {
        errors.push('Stop loss/take profit must specify either percentage or price');
      }
      if (parameters.percentage && (typeof parameters.percentage !== 'number' || parameters.percentage <= 0)) {
        errors.push('Stop loss/take profit percentage must be a positive number');
      }
      break;
    case 'position_sizing':
      if (!parameters.method) {
        errors.push('Position sizing must specify a method');
      }
      if (parameters.riskPercentage && (typeof parameters.riskPercentage !== 'number' || parameters.riskPercentage <= 0 || parameters.riskPercentage > 100)) {
        errors.push('Risk percentage must be between 0 and 100');
      }
      break;
  }

  return errors;
}

/**
 * Validate strategy flow connections
 */
function validateStrategyFlow(flow: any[], components: StrategyComponent[]): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  const componentIds = new Set(components.map((c, i) => i.toString()));

  flow.forEach((connection, index) => {
    if (!connection.from || !connection.to) {
      result.errors.push(`Flow connection ${index} must have 'from' and 'to' properties`);
      result.isValid = false;
    }

    if (!componentIds.has(connection.from.toString())) {
      result.errors.push(`Flow connection ${index} references invalid 'from' component: ${connection.from}`);
      result.isValid = false;
    }

    if (!componentIds.has(connection.to.toString())) {
      result.errors.push(`Flow connection ${index} references invalid 'to' component: ${connection.to}`);
      result.isValid = false;
    }
  });

  return result;
}

/**
 * Validate parameter set
 */
export function validateParameterSet(parameters: ParameterSet): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!parameters || Object.keys(parameters).length === 0) {
    result.warnings.push('Parameter set is empty - using default values');
    return result;
  }

  Object.entries(parameters).forEach(([key, value]) => {
    if (key.trim() === '') {
      result.errors.push('Parameter key cannot be empty');
      result.isValid = false;
    }

    if (value === null || value === undefined) {
      result.warnings.push(`Parameter '${key}' has null/undefined value`);
    }

    // Validate numeric parameters
    if (typeof value === 'number') {
      if (!isFinite(value)) {
        result.errors.push(`Parameter '${key}' must be a finite number`);
        result.isValid = false;
      }
      if (value < 0 && key.includes('period')) {
        result.errors.push(`Parameter '${key}' period cannot be negative`);
        result.isValid = false;
      }
    }
  });

  return result;
}

/**
 * Validate natural language input
 */
export function validateNaturalLanguageInput(input: string): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  if (!input || input.trim() === '') {
    result.errors.push('Input cannot be empty');
    result.isValid = false;
    return result;
  }

  if (input.length < 5) {
    result.warnings.push('Input is very short - consider providing more details');
  }

  if (input.length > 1000) {
    result.warnings.push('Input is very long - consider breaking it into smaller requests');
  }

  // Check for potentially harmful content
  const harmfulPatterns = [
    /delete|drop|truncate/i,
    /script|javascript|eval/i,
    /<script|<iframe|<object/i
  ];

  harmfulPatterns.forEach(pattern => {
    if (pattern.test(input)) {
      result.errors.push('Input contains potentially harmful content');
      result.isValid = false;
    }
  });

  // Check for trading-related keywords
  const tradingKeywords = [
    'buy', 'sell', 'trade', 'strategy', 'indicator', 'rsi', 'macd', 'sma', 'ema',
    'bollinger', 'stochastic', 'trend', 'breakout', 'reversal', 'support', 'resistance'
  ];

  const hasTrading = tradingKeywords.some(keyword => 
    input.toLowerCase().includes(keyword)
  );

  if (!hasTrading) {
    result.suggestions.push('Consider including trading-specific terms like indicators, conditions, or actions');
  }

  return result;
}

/**
 * Create validation rule
 */
export function createValidationRule<T>(
  name: string,
  validateFn: (input: T) => ValidationResult,
  severity: 'error' | 'warning' | 'info' = 'error'
): ValidationRule<T> {
  return {
    name,
    validate: validateFn,
    severity
  };
}

/**
 * Apply multiple validation rules
 */
export function applyValidationRules<T>(
  input: T,
  rules: ValidationRule<T>[]
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    suggestions: []
  };

  rules.forEach(rule => {
    const ruleResult = rule.validate(input);
    
    if (!ruleResult.isValid && rule.severity === 'error') {
      result.isValid = false;
    }

    result.errors.push(...ruleResult.errors);
    result.warnings.push(...ruleResult.warnings);
    result.suggestions.push(...ruleResult.suggestions);
  });

  return result;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}