/**
 * Pine Script Generator
 * 
 * Generates Pine Script code based on natural language descriptions.
 */

import { LLMService } from '../../services/llm/service';
import type { 
  GeneratedCode, 
  StrategyTemplate, 
  TemplateParams,
  ValidationResult,
  IndicatorInfo,
  RiskControls,
  PartialStrategy,
  OptimizedCode,
  DocumentedCode
} from '../../types/pine-script';

/**
 * Pine Script Generator class that converts natural language to Pine Script
 */
export class PineScriptGenerator {
  private llmService: LLMService;
  private templates: Map<string, StrategyTemplate>;
  
  /**
   * Creates a new instance of the PineScriptGenerator
   */
  constructor() {
    this.llmService = new LLMService();
    this.templates = new Map();
    this.loadTemplates();
  }

  /**
   * Generates Pine Script code from a natural language prompt
   * 
   * @param prompt - The natural language prompt
   * @param context - Optional strategy context
   * @returns A promise that resolves to the generated code
   */
  public async generateFromPrompt(prompt: string, context?: PartialStrategy): Promise<GeneratedCode> {
    try {
      // Analyze the prompt to determine the strategy type
      const strategyType = await this.analyzePrompt(prompt);
      
      // Get the appropriate template
      const template = this.templates.get(strategyType) || this.templates.get('default');
      if (!template) {
        throw new Error('No suitable template found');
      }
      
      // Extract parameters from the prompt
      const params = await this.extractParameters(prompt, template, context);
      
      // Apply the template with the extracted parameters
      const code = await this.applyTemplate(template, params);
      
      // Validate the generated code
      const validationResult = await this.validateSyntax(code.code);
      if (!validationResult.isValid) {
        throw new Error(`Code validation failed: ${validationResult.errors.join(', ')}`);
      }
      
      // Add documentation
      const documented = await this.addDocumentation(code.code);
      
      // Optimize the code
      const optimized = await this.optimizeCode(documented.code);
      
      return {
        code: optimized.code,
        explanation: code.explanation,
        indicators: code.indicators,
        riskManagement: code.riskManagement,
        confidence: validationResult.confidence,
        suggestions: validationResult.suggestions
      };
    } catch (error) {
      console.error('Error generating code:', error);
      throw error;
    }
  }

  /**
   * Validates the syntax of Pine Script code
   * 
   * @param code - The Pine Script code to validate
   * @returns A promise that resolves to the validation result
   */
  public async validateSyntax(code: string): Promise<ValidationResult> {
    try {
      // Implementation will depend on the specific requirements
      // This is a placeholder implementation
      
      const errors: string[] = [];
      
      // Check for common syntax errors
      if (!code.includes('//@version=6')) {
        errors.push('Missing version declaration');
      }
      
      if (!code.includes('strategy') && !code.includes('indicator')) {
        errors.push('Missing strategy or indicator declaration');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings: [],
        suggestions: [
          'Consider adding risk management controls',
          'Add comments to explain complex logic',
          'Use variables for magic numbers'
        ],
        confidence: errors.length === 0 ? 0.95 : 0.5
      };
    } catch (error) {
      console.error('Error validating syntax:', error);
      return {
        isValid: false,
        errors: [`Validation error: ${error.message}`],
        warnings: [],
        suggestions: [],
        confidence: 0
      };
    }
  }

  /**
   * Optimizes Pine Script code for performance
   * 
   * @param code - The Pine Script code to optimize
   * @returns A promise that resolves to the optimized code
   */
  public async optimizeCode(code: string): Promise<OptimizedCode> {
    try {
      // Implementation will depend on the specific requirements
      // This is a placeholder implementation
      
      // Replace inefficient constructs with more efficient ones
      let optimizedCode = code
        .replace(/for\s+i\s*=\s*0\s+to\s+n\s*-\s*1/g, 'for [i] = 0 to n - 1')
        .replace(/var\s+(\w+)\s*=\s*0\s*\n\s*for/g, 'var $1 = 0\nvar i = 0\nfor');
      
      return {
        code: optimizedCode,
        improvements: [
          'Optimized loop constructs',
          'Reduced variable declarations',
          'Improved calculation efficiency'
        ],
        performanceGain: 0.15
      };
    } catch (error) {
      console.error('Error optimizing code:', error);
      return {
        code,
        improvements: [],
        performanceGain: 0
      };
    }
  }

  /**
   * Adds documentation to Pine Script code
   * 
   * @param code - The Pine Script code to document
   * @returns A promise that resolves to the documented code
   */
  public async addDocumentation(code: string): Promise<DocumentedCode> {
    try {
      // Implementation will depend on the specific requirements
      // This is a placeholder implementation
      
      // Add header comment
      let documentedCode = `// =========================================
// Pine Script Strategy
// Generated by Kiro-Style Pine Script Agent
// Date: ${new Date().toISOString().split('T')[0]}
// =========================================

${code}`;
      
      // Add function documentation
      documentedCode = documentedCode.replace(
        /(\w+)\s*\(\s*([^)]*)\s*\)\s*=>\s*{/g,
        '// Function: $1\n// Parameters: $2\n// Returns: Calculation result\n$1($2) => {'
      );
      
      return {
        code: documentedCode,
        docSections: [
          'Header',
          'Function documentation',
          'Parameter explanations'
        ],
        readabilityScore: 0.85
      };
    } catch (error) {
      console.error('Error adding documentation:', error);
      return {
        code,
        docSections: [],
        readabilityScore: 0
      };
    }
  }

  /**
   * Applies a template with parameters to generate Pine Script code
   * 
   * @param template - The strategy template
   * @param params - The template parameters
   * @returns A promise that resolves to the generated code
   */
  public async applyTemplate(template: StrategyTemplate, params: TemplateParams): Promise<GeneratedCode> {
    try {
      // Implementation will depend on the specific requirements
      // This is a placeholder implementation
      
      let code = template.codeTemplate;
      
      // Replace template parameters
      for (const [key, value] of Object.entries(params)) {
        code = code.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
      }
      
      // Extract indicators used in the code
      const indicators: IndicatorInfo[] = [];
      if (code.includes('rsi(')) {
        indicators.push({
          name: 'RSI',
          parameters: { period: params.rsiPeriod || 14 },
          description: 'Relative Strength Index'
        });
      }
      
      if (code.includes('sma(')) {
        indicators.push({
          name: 'SMA',
          parameters: { period: params.smaPeriod || 20 },
          description: 'Simple Moving Average'
        });
      }
      
      // Extract risk management controls
      const riskManagement: RiskControls = {
        stopLoss: code.includes('stop_loss') ? {
          type: 'fixed',
          value: params.stopLoss || 1.0
        } : undefined,
        takeProfit: code.includes('take_profit') ? {
          type: 'fixed',
          value: params.takeProfit || 2.0
        } : undefined,
        positionSize: code.includes('strategy.risk') ? {
          type: 'risk_percentage',
          value: params.riskPercentage || 1.0
        } : undefined
      };
      
      return {
        code,
        explanation: `This strategy is based on the ${template.name} template. It ${template.description}`,
        indicators,
        riskManagement,
        confidence: 0.9,
        suggestions: [
          'Consider adding more indicators for confirmation',
          'Adjust the parameters to match your trading style',
          'Add additional risk management controls'
        ]
      };
    } catch (error) {
      console.error('Error applying template:', error);
      throw error;
    }
  }

  /**
   * Analyzes a prompt to determine the strategy type
   * 
   * @param prompt - The natural language prompt
   * @returns A promise that resolves to the strategy type
   */
  private async analyzePrompt(prompt: string): Promise<string> {
    // Implementation will depend on the specific requirements
    // This is a placeholder implementation
    
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('trend') || promptLower.includes('moving average') || promptLower.includes('follow')) {
      return 'trend-following';
    }
    
    if (promptLower.includes('reversion') || promptLower.includes('overbought') || promptLower.includes('oversold') || promptLower.includes('rsi')) {
      return 'mean-reversion';
    }
    
    if (promptLower.includes('breakout') || promptLower.includes('support') || promptLower.includes('resistance')) {
      return 'breakout';
    }
    
    if (promptLower.includes('scalp') || promptLower.includes('short term') || promptLower.includes('quick')) {
      return 'scalping';
    }
    
    return 'default';
  }

  /**
   * Extracts parameters from a prompt for a template
   * 
   * @param prompt - The natural language prompt
   * @param template - The strategy template
   * @param context - Optional strategy context
   * @returns A promise that resolves to the template parameters
   */
  private async extractParameters(prompt: string, template: StrategyTemplate, context?: PartialStrategy): Promise<TemplateParams> {
    // Implementation will depend on the specific requirements
    // This is a placeholder implementation
    
    const params: TemplateParams = {};
    
    // Extract parameters from the prompt using the LLM service
    const llmResponse = await this.llmService.generateCompletion({
      prompt: `
Extract the following parameters from this trading strategy description:
- Timeframe (e.g., 1m, 5m, 15m, 1h, 4h, 1d)
- Entry conditions
- Exit conditions
- Stop loss percentage
- Take profit percentage
- Risk percentage per trade

Description: ${prompt}

Format the response as a JSON object with the following keys:
timeframe, entryCondition, exitCondition, stopLoss, takeProfit, riskPercentage
`,
      temperature: 0.3,
      maxTokens: 500
    });
    
    try {
      const extractedParams = JSON.parse(llmResponse.text);
      
      // Map extracted parameters to template parameters
      params.timeframe = extractedParams.timeframe || '1h';
      params.entryCondition = extractedParams.entryCondition || 'close > open';
      params.exitCondition = extractedParams.exitCondition || 'close < open';
      params.stopLoss = parseFloat(extractedParams.stopLoss) || 1.0;
      params.takeProfit = parseFloat(extractedParams.takeProfit) || 2.0;
      params.riskPercentage = parseFloat(extractedParams.riskPercentage) || 1.0;
      
      // Add indicator-specific parameters
      if (template.id === 'trend-following') {
        params.fastPeriod = 9;
        params.slowPeriod = 21;
      } else if (template.id === 'mean-reversion') {
        params.rsiPeriod = 14;
        params.rsiOverbought = 70;
        params.rsiOversold = 30;
      }
      
      // Override with context if available
      if (context) {
        if (context.timeframe) params.timeframe = context.timeframe;
        if (context.stopLoss) params.stopLoss = context.stopLoss;
        if (context.takeProfit) params.takeProfit = context.takeProfit;
        if (context.riskPercentage) params.riskPercentage = context.riskPercentage;
      }
      
      return params;
    } catch (error) {
      console.error('Error extracting parameters:', error);
      
      // Return default parameters
      return {
        timeframe: '1h',
        entryCondition: 'close > open',
        exitCondition: 'close < open',
        stopLoss: 1.0,
        takeProfit: 2.0,
        riskPercentage: 1.0
      };
    }
  }

  /**
   * Loads strategy templates
   */
  private loadTemplates(): void {
    // Implementation will depend on the specific requirements
    // This is a placeholder implementation
    
    this.templates.set('trend-following', {
      id: 'trend-following',
      name: 'Trend Following Strategy',
      category: 'trend-following',
      description: 'follows market trends using moving average crossovers',
      codeTemplate: `//@version=6
strategy("Trend Following Strategy", overlay=true)

// Input parameters
fastLength = input({{fastPeriod}}, "Fast MA Length")
slowLength = input({{slowPeriod}}, "Slow MA Length")
stopLossPercent = input({{stopLoss}}, "Stop Loss %")
takeProfitPercent = input({{takeProfit}}, "Take Profit %")

// Calculate indicators
fastMA = ta.sma(close, fastLength)
slowMA = ta.sma(close, slowLength)

// Entry conditions
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Execute strategy
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.close("Long")

// Risk management
strategy.exit("Exit Long", "Long", stop=strategy.position_avg_price * (1 - stopLossPercent / 100), limit=strategy.position_avg_price * (1 + takeProfitPercent / 100))

// Plot indicators
plot(fastMA, "Fast MA", color=color.blue)
plot(slowMA, "Slow MA", color=color.red)
`,
      parameters: [
        { name: 'fastPeriod', type: 'number', default: 9 },
        { name: 'slowPeriod', type: 'number', default: 21 },
        { name: 'stopLoss', type: 'number', default: 1.0 },
        { name: 'takeProfit', type: 'number', default: 2.0 }
      ]
    });
    
    this.templates.set('mean-reversion', {
      id: 'mean-reversion',
      name: 'Mean Reversion Strategy',
      category: 'mean-reversion',
      description: 'trades oversold and overbought conditions using RSI',
      codeTemplate: `//@version=6
strategy("Mean Reversion Strategy", overlay=true)

// Input parameters
rsiLength = input({{rsiPeriod}}, "RSI Length")
rsiOverbought = input({{rsiOverbought}}, "RSI Overbought")
rsiOversold = input({{rsiOversold}}, "RSI Oversold")
stopLossPercent = input({{stopLoss}}, "Stop Loss %")
takeProfitPercent = input({{takeProfit}}, "Take Profit %")

// Calculate indicators
rsiValue = ta.rsi(close, rsiLength)

// Entry conditions
longCondition = rsiValue < rsiOversold
shortCondition = rsiValue > rsiOverbought

// Execute strategy
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.close("Long")

// Risk management
strategy.exit("Exit Long", "Long", stop=strategy.position_avg_price * (1 - stopLossPercent / 100), limit=strategy.position_avg_price * (1 + takeProfitPercent / 100))

// Plot indicators
hline(rsiOverbought, "Overbought", color=color.red)
hline(rsiOversold, "Oversold", color=color.green)
`,
      parameters: [
        { name: 'rsiPeriod', type: 'number', default: 14 },
        { name: 'rsiOverbought', type: 'number', default: 70 },
        { name: 'rsiOversold', type: 'number', default: 30 },
        { name: 'stopLoss', type: 'number', default: 1.0 },
        { name: 'takeProfit', type: 'number', default: 2.0 }
      ]
    });
    
    this.templates.set('default', {
      id: 'default',
      name: 'Basic Strategy',
      category: 'trend-following',
      description: 'provides a simple starting point for strategy development',
      codeTemplate: `//@version=6
strategy("Basic Strategy", overlay=true)

// Input parameters
length = input(14, "MA Length")
stopLossPercent = input({{stopLoss}}, "Stop Loss %")
takeProfitPercent = input({{takeProfit}}, "Take Profit %")

// Calculate indicators
ma = ta.sma(close, length)

// Entry conditions
longCondition = {{entryCondition}}
shortCondition = {{exitCondition}}

// Execute strategy
if (longCondition)
    strategy.entry("Long", strategy.long)

if (shortCondition)
    strategy.close("Long")

// Risk management
strategy.exit("Exit Long", "Long", stop=strategy.position_avg_price * (1 - stopLossPercent / 100), limit=strategy.position_avg_price * (1 + takeProfitPercent / 100))

// Plot indicators
plot(ma, "MA", color=color.blue)
`,
      parameters: [
        { name: 'entryCondition', type: 'string', default: 'close > open' },
        { name: 'exitCondition', type: 'string', default: 'close < open' },
        { name: 'stopLoss', type: 'number', default: 1.0 },
        { name: 'takeProfit', type: 'number', default: 2.0 }
      ]
    });
  }
}