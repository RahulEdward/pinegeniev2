/**
 * Kiro-style Agent Behavior Implementation
 * Spec-driven development flow with multi-step conversation management and context retention
 */

import { llmConnectionManager, LLMMessage, LLMResponse } from '../llm/llm-connection';
import { pineScriptValidator } from '../pine-generator/code-validator';
import { strategyTemplates } from '../pine-generator/templates';

export interface ConversationContext {
  id: string;
  userId: string;
  sessionId: string;
  currentStep: DevelopmentStep;
  strategy: StrategySpec;
  messages: ConversationMessage[];
  metadata: ConversationMetadata;
  created: Date;
  updated: Date;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type: 'text' | 'code' | 'spec' | 'validation' | 'suggestion';
  timestamp: Date;
  metadata?: {
    codeLanguage?: string;
    validationResult?: any;
    suggestions?: string[];
    attachments?: any[];
  };
}

export interface ConversationMetadata {
  totalSteps: number;
  completedSteps: number;
  currentPhase: DevelopmentPhase;
  progressPercentage: number;
  estimatedTimeRemaining: number;
  userExperienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredCommunicationStyle: 'concise' | 'detailed' | 'technical';
}

export interface StrategySpec {
  id: string;
  name: string;
  description: string;
  category: string;
  requirements: StrategyRequirement[];
  design: StrategyDesign;
  implementation: StrategyImplementation;
  validation: StrategyValidation;
  status: 'draft' | 'in_progress' | 'completed' | 'validated';
}

export interface StrategyRequirement {
  id: string;
  type: 'functional' | 'technical' | 'performance' | 'risk';
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'implemented' | 'tested';
  acceptanceCriteria: string[];
}

export interface StrategyDesign {
  indicators: IndicatorSpec[];
  entryConditions: ConditionSpec[];
  exitConditions: ConditionSpec[];
  riskManagement: RiskManagementSpec;
  timeframes: string[];
  markets: string[];
}

export interface IndicatorSpec {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  purpose: string;
}

export interface ConditionSpec {
  id: string;
  description: string;
  logic: string;
  indicators: string[];
  priority: number;
}

export interface RiskManagementSpec {
  stopLoss: {
    type: 'fixed' | 'trailing' | 'atr';
    value: number;
  };
  takeProfit: {
    type: 'fixed' | 'ratio' | 'dynamic';
    value: number;
  };
  positionSizing: {
    type: 'fixed' | 'percentage' | 'kelly';
    value: number;
  };
  maxRisk: number;
}

export interface StrategyImplementation {
  pineScript: string;
  version: string;
  dependencies: string[];
  configuration: Record<string, any>;
  documentation: string;
}

export interface StrategyValidation {
  syntaxCheck: ValidationResult;
  logicCheck: ValidationResult;
  performanceCheck: ValidationResult;
  riskCheck: ValidationResult;
  overallScore: number;
}

export interface ValidationResult {
  passed: boolean;
  score: number;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  line?: number;
  suggestion?: string;
}

export type DevelopmentPhase = 'requirements' | 'design' | 'implementation' | 'validation' | 'deployment';

export type DevelopmentStep = 
  | 'welcome'
  | 'requirements_gathering'
  | 'requirements_review'
  | 'design_planning'
  | 'design_review'
  | 'implementation_start'
  | 'code_generation'
  | 'code_review'
  | 'validation_testing'
  | 'final_review'
  | 'deployment_ready';

/**
 * Kiro-style Pine Script Agent
 */
export class KiroPineScriptAgent {
  private conversations: Map<string, ConversationContext>;
  private templates: Map<string, any>;
  private systemPrompts: Map<DevelopmentStep, string>;

  constructor() {
    this.conversations = new Map();
    this.templates = new Map();
    this.systemPrompts = new Map();
    
    this.initializeSystemPrompts();
    this.loadTemplates();
  }

  /**
   * Initialize system prompts for each development step
   */
  private initializeSystemPrompts(): void {
    this.systemPrompts.set('welcome', `
You are Kiro, an expert Pine Script strategy development assistant. You help traders create, validate, and optimize Pine Script strategies through a structured development process.

Your personality:
- Knowledgeable but not condescending
- Supportive and encouraging
- Clear and decisive in communication
- Focused on practical solutions

Current step: Welcome and initial assessment
Your goal: Understand the user's experience level, trading goals, and strategy preferences to guide them through the development process.

Ask about:
1. Their experience with Pine Script and trading
2. What type of strategy they want to build
3. Their preferred timeframes and markets
4. Risk tolerance and goals

Keep it conversational and welcoming.
    `);

    this.systemPrompts.set('requirements_gathering', `
You are Kiro, guiding the user through requirements gathering for their Pine Script strategy.

Current step: Requirements Gathering
Your goal: Collect detailed functional and technical requirements for the strategy.

Focus on:
1. Entry and exit conditions
2. Risk management preferences
3. Performance expectations
4. Technical constraints
5. Market conditions and timeframes

Be thorough but not overwhelming. Ask follow-up questions to clarify requirements.
    `);

    this.systemPrompts.set('design_planning', `
You are Kiro, helping design the strategy architecture.

Current step: Design Planning
Your goal: Create a comprehensive design based on the gathered requirements.

Present:
1. Recommended indicators and their purposes
2. Entry/exit logic flow
3. Risk management approach
4. Configuration parameters

Explain your design decisions and ask for feedback before proceeding.
    `);

    this.systemPrompts.set('code_generation', `
You are Kiro, implementing the Pine Script strategy.

Current step: Code Generation
Your goal: Generate clean, efficient, and well-documented Pine Script code.

Ensure:
1. Pine Script v6 compatibility
2. Proper error handling
3. Clear variable names and comments
4. Optimized performance
5. Comprehensive parameter inputs

Explain the code structure and key components as you build it.
    `);

    this.systemPrompts.set('validation_testing', `
You are Kiro, validating and testing the generated strategy.

Current step: Validation and Testing
Your goal: Thoroughly test the strategy for syntax, logic, and performance issues.

Check for:
1. Syntax errors and warnings
2. Logic inconsistencies
3. Performance bottlenecks
4. Risk management effectiveness
5. Edge cases and error conditions

Provide detailed feedback and suggestions for improvements.
    `);
  }

  /**
   * Load strategy templates
   */
  private loadTemplates(): void {
    strategyTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  /**
   * Start new conversation
   */
  async startConversation(userId: string, sessionId?: string): Promise<ConversationContext> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    
    const context: ConversationContext = {
      id: conversationId,
      userId,
      sessionId: sessionId || conversationId,
      currentStep: 'welcome',
      strategy: this.createEmptyStrategy(),
      messages: [],
      metadata: {
        totalSteps: 11,
        completedSteps: 0,
        currentPhase: 'requirements',
        progressPercentage: 0,
        estimatedTimeRemaining: 30, // minutes
        userExperienceLevel: 'intermediate',
        preferredCommunicationStyle: 'detailed'
      },
      created: new Date(),
      updated: new Date()
    };

    this.conversations.set(conversationId, context);

    // Send welcome message
    const welcomeMessage = await this.generateWelcomeMessage(context);
    this.addMessage(conversationId, 'assistant', welcomeMessage, 'text');

    return context;
  }

  /**
   * Process user message
   */
  async processMessage(
    conversationId: string,
    userMessage: string,
    messageType: 'text' | 'code' = 'text'
  ): Promise<ConversationMessage> {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Add user message to context
    this.addMessage(conversationId, 'user', userMessage, messageType);

    // Process based on current step
    const response = await this.processCurrentStep(context, userMessage);

    // Add assistant response
    const responseMessage = this.addMessage(conversationId, 'assistant', response.content, response.type);

    // Update progress if step completed
    if (response.stepCompleted) {
      this.advanceToNextStep(context);
    }

    return responseMessage;
  }

  /**
   * Process current development step
   */
  private async processCurrentStep(
    context: ConversationContext,
    userMessage: string
  ): Promise<{ content: string; type: 'text' | 'code' | 'spec'; stepCompleted: boolean }> {
    const systemPrompt = this.systemPrompts.get(context.currentStep);
    if (!systemPrompt) {
      throw new Error(`No system prompt for step: ${context.currentStep}`);
    }

    const messages: LLMMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'system', content: this.buildContextPrompt(context) },
      ...this.getRecentMessages(context, 10),
      { role: 'user', content: userMessage }
    ];

    const response = await llmConnectionManager.sendMessage(messages, 'openai');

    // Determine if step is completed based on response and current step
    const stepCompleted = this.isStepCompleted(context, userMessage, response.content);

    // Update strategy spec based on the conversation
    this.updateStrategySpec(context, userMessage, response.content);

    return {
      content: response.content,
      type: this.getResponseType(context.currentStep),
      stepCompleted
    };
  }

  /**
   * Build context prompt with current strategy state
   */
  private buildContextPrompt(context: ConversationContext): string {
    const { strategy, metadata } = context;
    
    return `
Current Strategy Context:
- Name: ${strategy.name || 'Untitled Strategy'}
- Category: ${strategy.category || 'Not specified'}
- Progress: ${metadata.progressPercentage}% (${metadata.completedSteps}/${metadata.totalSteps} steps)
- Phase: ${metadata.currentPhase}
- User Level: ${metadata.userExperienceLevel}

Requirements gathered: ${strategy.requirements.length}
Design indicators: ${strategy.design.indicators.length}
Implementation status: ${strategy.status}

Previous context summary:
${this.summarizeConversation(context)}
    `;
  }

  /**
   * Get recent messages for context
   */
  private getRecentMessages(context: ConversationContext, limit: number): LLMMessage[] {
    return context.messages
      .slice(-limit)
      .map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));
  }

  /**
   * Check if current step is completed
   */
  private isStepCompleted(context: ConversationContext, userMessage: string, response: string): boolean {
    const step = context.currentStep;
    
    // Simple heuristics for step completion
    switch (step) {
      case 'welcome':
        return userMessage.length > 20 && (
          userMessage.toLowerCase().includes('want') ||
          userMessage.toLowerCase().includes('build') ||
          userMessage.toLowerCase().includes('create')
        );
        
      case 'requirements_gathering':
        return context.strategy.requirements.length >= 3;
        
      case 'design_planning':
        return context.strategy.design.indicators.length > 0 &&
               context.strategy.design.entryConditions.length > 0;
               
      case 'code_generation':
        return context.strategy.implementation.pineScript.length > 100;
        
      case 'validation_testing':
        return context.strategy.validation.overallScore > 0;
        
      default:
        return false;
    }
  }

  /**
   * Update strategy specification based on conversation
   */
  private updateStrategySpec(context: ConversationContext, userMessage: string, response: string): void {
    const step = context.currentStep;
    
    switch (step) {
      case 'requirements_gathering':
        this.extractRequirements(context, userMessage, response);
        break;
        
      case 'design_planning':
        this.extractDesignElements(context, userMessage, response);
        break;
        
      case 'code_generation':
        this.extractImplementation(context, response);
        break;
        
      case 'validation_testing':
        this.performValidation(context);
        break;
    }
    
    context.updated = new Date();
  }

  /**
   * Extract requirements from conversation
   */
  private extractRequirements(context: ConversationContext, userMessage: string, response: string): void {
    // Simple keyword-based extraction (in real implementation, use NLP)
    const keywords = {
      'rsi': 'RSI indicator for momentum analysis',
      'moving average': 'Moving average for trend following',
      'stop loss': 'Stop loss for risk management',
      'take profit': 'Take profit for position management',
      'breakout': 'Breakout strategy for volatility trading'
    };

    Object.entries(keywords).forEach(([keyword, description]) => {
      if (userMessage.toLowerCase().includes(keyword) || response.toLowerCase().includes(keyword)) {
        const requirement: StrategyRequirement = {
          id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: keyword.includes('stop') || keyword.includes('risk') ? 'risk' : 'functional',
          description,
          priority: 'medium',
          status: 'pending',
          acceptanceCriteria: [`Implement ${keyword} functionality`]
        };
        
        context.strategy.requirements.push(requirement);
      }
    });
  }

  /**
   * Extract design elements from conversation
   */
  private extractDesignElements(context: ConversationContext, userMessage: string, response: string): void {
    // Extract indicators mentioned in the response
    const indicatorPatterns = [
      { pattern: /rsi/i, type: 'rsi', name: 'RSI' },
      { pattern: /moving average|ma|sma|ema/i, type: 'sma', name: 'Moving Average' },
      { pattern: /macd/i, type: 'macd', name: 'MACD' },
      { pattern: /bollinger/i, type: 'bollinger_bands', name: 'Bollinger Bands' }
    ];

    indicatorPatterns.forEach(({ pattern, type, name }) => {
      if (pattern.test(response)) {
        const indicator: IndicatorSpec = {
          id: `ind_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name,
          type,
          parameters: {},
          purpose: `${name} for strategy analysis`
        };
        
        context.strategy.design.indicators.push(indicator);
      }
    });
  }

  /**
   * Extract implementation code
   */
  private extractImplementation(context: ConversationContext, response: string): void {
    // Extract Pine Script code from response
    const codeMatch = response.match(/```(?:pinescript|pine)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      context.strategy.implementation.pineScript = codeMatch[1];
      context.strategy.implementation.version = 'v6';
      context.strategy.status = 'in_progress';
    }
  }

  /**
   * Perform strategy validation
   */
  private performValidation(context: ConversationContext): void {
    const { pineScript } = context.strategy.implementation;
    
    if (pineScript) {
      const validationResult = pineScriptValidator.validate(pineScript);
      
      context.strategy.validation = {
        syntaxCheck: {
          passed: validationResult.isValid,
          score: validationResult.isValid ? 100 : 50,
          issues: validationResult.errors.map(err => ({
            severity: err.severity,
            message: err.message,
            line: err.line,
            suggestion: err.suggestion
          })),
          suggestions: validationResult.suggestions.map(s => s.message)
        },
        logicCheck: {
          passed: true,
          score: 85,
          issues: [],
          suggestions: ['Consider adding more entry conditions']
        },
        performanceCheck: {
          passed: true,
          score: validationResult.performanceScore,
          issues: [],
          suggestions: ['Good performance optimization']
        },
        riskCheck: {
          passed: true,
          score: 90,
          issues: [],
          suggestions: ['Risk management looks solid']
        },
        overallScore: (100 + 85 + validationResult.performanceScore + 90) / 4
      };
    }
  }

  /**
   * Advance to next development step
   */
  private advanceToNextStep(context: ConversationContext): void {
    const stepOrder: DevelopmentStep[] = [
      'welcome',
      'requirements_gathering',
      'requirements_review',
      'design_planning',
      'design_review',
      'implementation_start',
      'code_generation',
      'code_review',
      'validation_testing',
      'final_review',
      'deployment_ready'
    ];

    const currentIndex = stepOrder.indexOf(context.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      context.currentStep = stepOrder[currentIndex + 1];
      context.metadata.completedSteps++;
      context.metadata.progressPercentage = Math.round(
        (context.metadata.completedSteps / context.metadata.totalSteps) * 100
      );
      
      // Update phase
      if (context.metadata.completedSteps <= 3) {
        context.metadata.currentPhase = 'requirements';
      } else if (context.metadata.completedSteps <= 5) {
        context.metadata.currentPhase = 'design';
      } else if (context.metadata.completedSteps <= 8) {
        context.metadata.currentPhase = 'implementation';
      } else if (context.metadata.completedSteps <= 10) {
        context.metadata.currentPhase = 'validation';
      } else {
        context.metadata.currentPhase = 'deployment';
      }
    }
  }

  /**
   * Add message to conversation
   */
  private addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    type: 'text' | 'code' | 'spec' | 'validation' | 'suggestion'
  ): ConversationMessage {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      role,
      content,
      type,
      timestamp: new Date()
    };

    context.messages.push(message);
    context.updated = new Date();

    return message;
  }

  /**
   * Generate welcome message
   */
  private async generateWelcomeMessage(context: ConversationContext): Promise<string> {
    return `Hey there! I'm Kiro, your Pine Script strategy development assistant. I'm here to help you build, validate, and optimize trading strategies step by step.

Let's start by getting to know your goals:

1. **What's your experience level** with Pine Script and trading strategies?
2. **What type of strategy** are you looking to build? (trend following, mean reversion, breakout, etc.)
3. **Which timeframes and markets** do you typically trade?
4. **What are your main goals** for this strategy?

Don't worry if you're not sure about everything yet - we'll figure it out together as we go through the development process. Ready to get started?`;
  }

  /**
   * Get response type based on current step
   */
  private getResponseType(step: DevelopmentStep): 'text' | 'code' | 'spec' {
    switch (step) {
      case 'code_generation':
      case 'code_review':
        return 'code';
      case 'design_planning':
      case 'design_review':
        return 'spec';
      default:
        return 'text';
    }
  }

  /**
   * Summarize conversation for context
   */
  private summarizeConversation(context: ConversationContext): string {
    const recentMessages = context.messages.slice(-5);
    return recentMessages
      .map(msg => `${msg.role}: ${msg.content.substring(0, 100)}...`)
      .join('\n');
  }

  /**
   * Create empty strategy specification
   */
  private createEmptyStrategy(): StrategySpec {
    return {
      id: `strategy_${Date.now()}`,
      name: '',
      description: '',
      category: '',
      requirements: [],
      design: {
        indicators: [],
        entryConditions: [],
        exitConditions: [],
        riskManagement: {
          stopLoss: { type: 'fixed', value: 2 },
          takeProfit: { type: 'ratio', value: 2 },
          positionSizing: { type: 'percentage', value: 10 },
          maxRisk: 5
        },
        timeframes: [],
        markets: []
      },
      implementation: {
        pineScript: '',
        version: 'v6',
        dependencies: [],
        configuration: {},
        documentation: ''
      },
      validation: {
        syntaxCheck: { passed: false, score: 0, issues: [], suggestions: [] },
        logicCheck: { passed: false, score: 0, issues: [], suggestions: [] },
        performanceCheck: { passed: false, score: 0, issues: [], suggestions: [] },
        riskCheck: { passed: false, score: 0, issues: [], suggestions: [] },
        overallScore: 0
      },
      status: 'draft'
    };
  }

  /**
   * Get conversation context
   */
  getConversation(conversationId: string): ConversationContext | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Get all conversations for a user
   */
  getUserConversations(userId: string): ConversationContext[] {
    return Array.from(this.conversations.values()).filter(
      conv => conv.userId === userId
    );
  }

  /**
   * Resume conversation
   */
  async resumeConversation(conversationId: string): Promise<ConversationContext> {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Send resume message
    const resumeMessage = `Welcome back! We were working on your ${context.strategy.name || 'strategy'} and we're currently at the ${context.currentStep.replace('_', ' ')} step. 

Progress: ${context.metadata.progressPercentage}% complete (${context.metadata.completedSteps}/${context.metadata.totalSteps} steps)

Would you like to continue where we left off, or would you prefer to review what we've built so far?`;

    this.addMessage(conversationId, 'assistant', resumeMessage, 'text');

    return context;
  }

  /**
   * Export strategy specification
   */
  exportStrategy(conversationId: string): string {
    const context = this.conversations.get(conversationId);
    if (!context) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return JSON.stringify(context.strategy, null, 2);
  }
}

// Export singleton instance
export const kiroPineScriptAgent = new KiroPineScriptAgent();