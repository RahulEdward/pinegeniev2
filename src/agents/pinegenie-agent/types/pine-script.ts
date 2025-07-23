/**
 * Pine Script Types
 * 
 * Type definitions for Pine Script generation and validation.
 */

/**
 * Generated code interface
 */
export interface GeneratedCode {
  /**
   * The generated Pine Script code
   */
  code: string;
  
  /**
   * Explanation of the generated code
   */
  explanation: string;
  
  /**
   * Information about indicators used in the code
   */
  indicators: IndicatorInfo[];
  
  /**
   * Risk management controls in the code
   */
  riskManagement: RiskControls;
  
  /**
   * Confidence score for the generated code
   */
  confidence: number;
  
  /**
   * Suggestions for improving the code
   */
  suggestions: string[];
}

/**
 * Strategy template interface
 */
export interface StrategyTemplate {
  /**
   * The template ID
   */
  id: string;
  
  /**
   * The template name
   */
  name: string;
  
  /**
   * The template category
   */
  category: 'trend-following' | 'mean-reversion' | 'breakout' | 'scalping';
  
  /**
   * The template description
   */
  description: string;
  
  /**
   * The code template with placeholders
   */
  codeTemplate: string;
  
  /**
   * The template parameters
   */
  parameters: TemplateParameter[];
}

/**
 * Template parameter interface
 */
export interface TemplateParameter {
  /**
   * The parameter name
   */
  name: string;
  
  /**
   * The parameter type
   */
  type: 'string' | 'number' | 'boolean';
  
  /**
   * The default value
   */
  default: any;
}

/**
 * Template parameters type
 */
export type TemplateParams = Record<string, any>;

/**
 * Validation result interface
 */
export interface ValidationResult {
  /**
   * Whether the code is valid
   */
  isValid: boolean;
  
  /**
   * Any errors found in the code
   */
  errors: string[];
  
  /**
   * Any warnings found in the code
   */
  warnings: string[];
  
  /**
   * Suggestions for improving the code
   */
  suggestions: string[];
  
  /**
   * Confidence score for the validation
   */
  confidence: number;
}

/**
 * Indicator information interface
 */
export interface IndicatorInfo {
  /**
   * The indicator name
   */
  name: string;
  
  /**
   * The indicator parameters
   */
  parameters: Record<string, any>;
  
  /**
   * The indicator description
   */
  description: string;
}

/**
 * Risk controls interface
 */
export interface RiskControls {
  /**
   * Stop loss configuration
   */
  stopLoss?: {
    /**
     * The stop loss type
     */
    type: 'fixed' | 'atr' | 'percentage';
    
    /**
     * The stop loss value
     */
    value: number;
  };
  
  /**
   * Take profit configuration
   */
  takeProfit?: {
    /**
     * The take profit type
     */
    type: 'fixed' | 'atr' | 'percentage';
    
    /**
     * The take profit value
     */
    value: number;
  };
  
  /**
   * Position size configuration
   */
  positionSize?: {
    /**
     * The position size type
     */
    type: 'fixed' | 'risk_percentage' | 'equity_percentage';
    
    /**
     * The position size value
     */
    value: number;
  };
}

/**
 * Optimized code interface
 */
export interface OptimizedCode {
  /**
   * The optimized code
   */
  code: string;
  
  /**
   * Improvements made during optimization
   */
  improvements: string[];
  
  /**
   * Estimated performance gain
   */
  performanceGain: number;
}

/**
 * Documented code interface
 */
export interface DocumentedCode {
  /**
   * The documented code
   */
  code: string;
  
  /**
   * Documentation sections added
   */
  docSections: string[];
  
  /**
   * Readability score
   */
  readabilityScore: number;
}

/**
 * Partial strategy interface
 */
export interface PartialStrategy {
  /**
   * The strategy name
   */
  name?: string;
  
  /**
   * The strategy timeframe
   */
  timeframe?: string;
  
  /**
   * The stop loss percentage
   */
  stopLoss?: number;
  
  /**
   * The take profit percentage
   */
  takeProfit?: number;
  
  /**
   * The risk percentage per trade
   */
  riskPercentage?: number;
  
  /**
   * The strategy parameters
   */
  parameters?: Record<string, any>;
}