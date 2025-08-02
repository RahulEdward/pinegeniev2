/**
 * Context Engine
 * 
 * Manages conversation context and memory for multi-turn interactions,
 * enabling the AI to understand references and maintain conversation state.
 */

import { AIContext, ContextEntry, UserPreferences } from '../types/ai-interfaces';
import { TradingIntent, StrategyParameters } from '../types/nlp-types';
import { AILogger } from '../core/logger';

export interface ContextState {
  currentStrategy?: string;
  activeIndicators: string[];
  mentionedParameters: Record<string, unknown>;
  conversationFlow: ConversationFlow;
  userIntent: IntentHistory[];
  references: ReferenceMap;
}

export interface ConversationFlow {
  phase: 'greeting' | 'requirement_gathering' | 'strategy_building' | 'optimization' | 'completion';
  lastAction: string;
  nextSuggestedActions: string[];
  completedSteps: string[];
}

export interface IntentHistory {
  timestamp: Date;
  intent: TradingIntent;
  parameters: StrategyParameters;
  confidence: number;
  resolved: boolean;
}

export interface ReferenceMap {
  pronouns: Map<string, string>; // "it" -> "RSI indicator"
  implicitReferences: Map<string, string>; // "the strategy" -> "current_strategy_id"
  contextualMentions: Map<string, ContextualMention>;
}

export interface ContextualMention {
  entity: string;
  type: 'indicator' | 'parameter' | 'strategy' | 'condition' | 'action';
  lastMentioned: Date;
  frequency: number;
  confidence: number;
}

export interface ContextUpdateOptions {
  preserveHistory: boolean;
  maxHistorySize: number;
  enableReferenceResolution: boolean;
  trackUserPreferences: boolean;
}

export class ContextEngine {
  private contexts: Map<string, AIContext> = new Map();
  private logger: AILogger;
  private options: ContextUpdateOptions;

  constructor(options: Partial<ContextUpdateOptions> = {}) {
    this.logger = AILogger.getInstance();
    
    this.options = {
      preserveHistory: true,
      maxHistorySize: 100,
      enableReferenceResolution: true,
      trackUserPreferences: true,
      ...options
    };
  }

  /**
   * Create or get conversation context
   */
  public getContext(conversationId: string, userId?: string): AIContext {
    if (!this.contexts.has(conversationId)) {
      const newContext: AIContext = {
        conversationId,
        userId,
        sessionId: this.generateSessionId(),
        history: [],
        preferences: this.getDefaultPreferences(),
        currentStrategy: undefined
      };
      
      this.contexts.set(conversationId, newContext);
      
      this.logger.debug('ContextEngine', 'Created new conversation context', {
        conversationId,
        userId
      });
    }

    return this.contexts.get(conversationId)!;
  }

  /**
   * Update context with new user input
   */
  public updateContextWithInput(
    conversationId: string,
    userInput: string,
    intent: TradingIntent,
    parameters: StrategyParameters
  ): AIContext {
    const context = this.getContext(conversationId);
    
    // Add to history
    const contextEntry: ContextEntry = {
      timestamp: new Date(),
      type: 'user_input',
      content: userInput,
      metadata: {
        intent,
        parameters,
        confidence: intent.confidence
      }
    };

    context.history.push(contextEntry);

    // Update current strategy if mentioned
    if (intent.strategyType) {
      context.currentStrategy = intent.strategyType;
    }

    // Update references and context state
    this.updateReferences(context, userInput, intent, parameters);
    this.updateConversationFlow(context, intent);
    this.updateUserPreferences(context, intent, parameters);

    // Maintain history size
    if (context.history.length > this.options.maxHistorySize) {
      context.history = context.history.slice(-this.options.maxHistorySize);
    }

    this.logger.debug('ContextEngine', 'Updated context with user input', {
      conversationId,
      historySize: context.history.length,
      currentStrategy: context.currentStrategy
    });

    return context;
  }

  /**
   * Update context with AI response
   */
  public updateContextWithResponse(
    conversationId: string,
    response: string,
    actions?: string[]
  ): AIContext {
    const context = this.getContext(conversationId);
    
    const contextEntry: ContextEntry = {
      timestamp: new Date(),
      type: 'ai_response',
      content: response,
      metadata: {
        actions: actions || []
      }
    };

    context.history.push(contextEntry);

    this.logger.debug('ContextEngine', 'Updated context with AI response', {
      conversationId,
      responseLength: response.length,
      actions: actions?.length || 0
    });

    return context;
  }

  /**
   * Resolve references in user input
   */
  public resolveReferences(
    conversationId: string,
    userInput: string
  ): string {
    if (!this.options.enableReferenceResolution) {
      return userInput;
    }

    const context = this.getContext(conversationId);
    let resolvedInput = userInput;

    // Resolve pronouns
    resolvedInput = this.resolvePronouns(resolvedInput, context);
    
    // Resolve implicit references
    resolvedInput = this.resolveImplicitReferences(resolvedInput, context);
    
    // Resolve contextual mentions
    resolvedInput = this.resolveContextualMentions(resolvedInput, context);

    if (resolvedInput !== userInput) {
      this.logger.debug('ContextEngine', 'Resolved references in user input', {
        original: userInput,
        resolved: resolvedInput
      });
    }

    return resolvedInput;
  }

  /**
   * Get conversation summary
   */
  public getConversationSummary(conversationId: string): {
    totalMessages: number;
    strategiesDiscussed: string[];
    indicatorsUsed: string[];
    parametersSet: Record<string, unknown>;
    conversationPhase: string;
    lastActivity: Date;
  } {
    const context = this.getContext(conversationId);
    
    const strategiesDiscussed = new Set<string>();
    const indicatorsUsed = new Set<string>();
    const parametersSet: Record<string, unknown> = {};
    let lastActivity = new Date(0);

    // Analyze conversation history
    for (const entry of context.history) {
      if (entry.timestamp > lastActivity) {
        lastActivity = entry.timestamp;
      }

      if (entry.metadata?.intent) {
        const intent = entry.metadata.intent as TradingIntent;
        strategiesDiscussed.add(intent.strategyType);
        intent.indicators.forEach(indicator => indicatorsUsed.add(indicator));
      }

      if (entry.metadata?.parameters) {
        const params = entry.metadata.parameters as StrategyParameters;
        Object.assign(parametersSet, params);
      }
    }

    return {
      totalMessages: context.history.length,
      strategiesDiscussed: Array.from(strategiesDiscussed),
      indicatorsUsed: Array.from(indicatorsUsed),
      parametersSet,
      conversationPhase: this.getCurrentPhase(context),
      lastActivity
    };
  }

  /**
   * Get contextual suggestions
   */
  public getContextualSuggestions(conversationId: string): string[] {
    const context = this.getContext(conversationId);
    const suggestions: string[] = [];

    const phase = this.getCurrentPhase(context);
    
    switch (phase) {
      case 'greeting':
        suggestions.push(
          'What type of trading strategy would you like to create?',
          'Tell me about your trading goals and risk tolerance',
          'Which indicators are you familiar with?'
        );
        break;
        
      case 'requirement_gathering':
        suggestions.push(
          'What timeframe do you want to trade on?',
          'Do you prefer trend-following or mean-reversion strategies?',
          'What\'s your risk tolerance level?'
        );
        break;
        
      case 'strategy_building':
        if (context.currentStrategy) {
          suggestions.push(
            `Let's add risk management to your ${context.currentStrategy} strategy`,
            'Would you like to optimize the parameters?',
            'Should we add confirmation indicators?'
          );
        }
        break;
        
      case 'optimization':
        suggestions.push(
          'Would you like to backtest this strategy?',
          'Let\'s fine-tune the parameters',
          'Should we add more exit conditions?'
        );
        break;
        
      case 'completion':
        suggestions.push(
          'Would you like to create another strategy?',
          'Let\'s save this strategy as a template',
          'Any questions about how this strategy works?'
        );
        break;
    }

    // Add context-specific suggestions
    this.addContextSpecificSuggestions(context, suggestions);

    return suggestions;
  }

  /**
   * Clear conversation context
   */
  public clearContext(conversationId: string): void {
    this.contexts.delete(conversationId);
    
    this.logger.debug('ContextEngine', 'Cleared conversation context', {
      conversationId
    });
  }

  /**
   * Get all active conversations
   */
  public getActiveConversations(): string[] {
    return Array.from(this.contexts.keys());
  }

  // Private helper methods

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferredTimeframes: ['1h', '4h'],
      riskTolerance: 'medium',
      experienceLevel: 'intermediate',
      favoriteIndicators: [],
      defaultParameters: {}
    };
  }

  private updateReferences(
    context: AIContext,
    userInput: string,
    intent: TradingIntent,
    parameters: StrategyParameters
  ): void {
    // Update pronoun references
    if (intent.indicators.length > 0) {
      // "it" could refer to the last mentioned indicator
      const lastIndicator = intent.indicators[intent.indicators.length - 1];
      this.updatePronounReference(context, 'it', lastIndicator);
      this.updatePronounReference(context, 'that', lastIndicator);
    }

    // Update implicit references
    if (context.currentStrategy) {
      this.updateImplicitReference(context, 'the strategy', context.currentStrategy);
      this.updateImplicitReference(context, 'this strategy', context.currentStrategy);
    }

    // Update contextual mentions
    intent.indicators.forEach(indicator => {
      this.updateContextualMention(context, indicator, 'indicator');
    });

    Object.keys(parameters).forEach(param => {
      this.updateContextualMention(context, param, 'parameter');
    });
  }

  private updatePronounReference(context: AIContext, pronoun: string, reference: string): void {
    if (!context.currentStrategy) return;
    
    // This would be implemented with a proper reference tracking system
    // For now, we'll store it in metadata
    if (!context.history[context.history.length - 1]?.metadata) {
      return;
    }
    
    const metadata = context.history[context.history.length - 1].metadata!;
    if (!metadata.references) {
      metadata.references = {};
    }
    
    metadata.references[pronoun] = reference;
  }

  private updateImplicitReference(context: AIContext, phrase: string, reference: string): void {
    // Similar to pronoun references, store in metadata
    if (!context.history[context.history.length - 1]?.metadata) {
      return;
    }
    
    const metadata = context.history[context.history.length - 1].metadata!;
    if (!metadata.implicitReferences) {
      metadata.implicitReferences = {};
    }
    
    metadata.implicitReferences[phrase] = reference;
  }

  private updateContextualMention(
    context: AIContext,
    entity: string,
    type: 'indicator' | 'parameter' | 'strategy' | 'condition' | 'action'
  ): void {
    // Track frequency and recency of mentions
    if (!context.history[context.history.length - 1]?.metadata) {
      return;
    }
    
    const metadata = context.history[context.history.length - 1].metadata!;
    if (!metadata.contextualMentions) {
      metadata.contextualMentions = {};
    }
    
    if (!metadata.contextualMentions[entity]) {
      metadata.contextualMentions[entity] = {
        entity,
        type,
        lastMentioned: new Date(),
        frequency: 1,
        confidence: 0.8
      };
    } else {
      metadata.contextualMentions[entity].frequency++;
      metadata.contextualMentions[entity].lastMentioned = new Date();
    }
  }

  private updateConversationFlow(context: AIContext, intent: TradingIntent): void {
    // Determine conversation phase based on intent and history
    const currentPhase = this.getCurrentPhase(context);
    
    // This would implement more sophisticated flow tracking
    // For now, we'll store basic flow information in the last history entry
    if (context.history.length > 0) {
      const lastEntry = context.history[context.history.length - 1];
      if (!lastEntry.metadata) {
        lastEntry.metadata = {};
      }
      
      lastEntry.metadata.conversationPhase = currentPhase;
      lastEntry.metadata.intentType = intent.strategyType;
    }
  }

  private updateUserPreferences(
    context: AIContext,
    intent: TradingIntent,
    parameters: StrategyParameters
  ): void {
    if (!this.options.trackUserPreferences) return;

    // Update preferred indicators
    intent.indicators.forEach(indicator => {
      if (!context.preferences.favoriteIndicators.includes(indicator)) {
        context.preferences.favoriteIndicators.push(indicator);
      }
    });

    // Update preferred timeframe
    if (intent.timeframe && !context.preferences.preferredTimeframes.includes(intent.timeframe)) {
      context.preferences.preferredTimeframes.push(intent.timeframe);
    }

    // Update default parameters
    Object.entries(parameters).forEach(([key, paramValue]) => {
      context.preferences.defaultParameters[key] = paramValue.value;
    });

    // Infer risk tolerance from parameters
    if (parameters.stopLoss) {
      const stopLossValue = Number(parameters.stopLoss.value);
      if (stopLossValue <= 1.5) {
        context.preferences.riskTolerance = 'low';
      } else if (stopLossValue >= 3.0) {
        context.preferences.riskTolerance = 'high';
      } else {
        context.preferences.riskTolerance = 'medium';
      }
    }
  }

  private resolvePronouns(input: string, context: AIContext): string {
    let resolved = input;
    
    // Get recent references from history
    const recentEntries = context.history.slice(-5); // Last 5 entries
    
    for (const entry of recentEntries.reverse()) {
      if (entry.metadata?.references) {
        const references = entry.metadata.references as Record<string, string>;
        
        Object.entries(references).forEach(([pronoun, reference]) => {
          const regex = new RegExp(`\\b${pronoun}\\b`, 'gi');
          resolved = resolved.replace(regex, reference);
        });
      }
    }
    
    return resolved;
  }

  private resolveImplicitReferences(input: string, context: AIContext): string {
    let resolved = input;
    
    // Common implicit references
    if (context.currentStrategy) {
      resolved = resolved.replace(/\bthe strategy\b/gi, context.currentStrategy);
      resolved = resolved.replace(/\bthis strategy\b/gi, context.currentStrategy);
    }
    
    return resolved;
  }

  private resolveContextualMentions(input: string, context: AIContext): string {
    // This would implement more sophisticated contextual resolution
    // For now, return input as-is
    return input;
  }

  private getCurrentPhase(context: AIContext): string {
    if (context.history.length === 0) {
      return 'greeting';
    }

    const recentEntries = context.history.slice(-3);
    const hasStrategy = context.currentStrategy !== undefined;
    const hasParameters = recentEntries.some(entry => 
      entry.metadata?.parameters && Object.keys(entry.metadata.parameters).length > 0
    );

    if (!hasStrategy) {
      return 'requirement_gathering';
    } else if (hasStrategy && !hasParameters) {
      return 'strategy_building';
    } else if (hasStrategy && hasParameters) {
      return 'optimization';
    } else {
      return 'completion';
    }
  }

  private addContextSpecificSuggestions(context: AIContext, suggestions: string[]): void {
    // Add suggestions based on user preferences
    if (context.preferences.favoriteIndicators.length > 0) {
      const favoriteIndicator = context.preferences.favoriteIndicators[0];
      suggestions.push(`Would you like to use ${favoriteIndicator} in this strategy?`);
    }

    // Add suggestions based on conversation history
    const recentIndicators = new Set<string>();
    context.history.slice(-5).forEach(entry => {
      if (entry.metadata?.intent) {
        const intent = entry.metadata.intent as TradingIntent;
        intent.indicators.forEach(indicator => recentIndicators.add(indicator));
      }
    });

    if (recentIndicators.size > 0 && recentIndicators.size < 3) {
      suggestions.push('Would you like to add confirmation indicators?');
    }
  }
}