import { 
  AIResponse, 
  AIAction, 
  ActionType, 
  ConversationContext, 
  StrategyPreview,
  ResponseMetadata 
} from '../../types/chat-types';

/**
 * AI Response Generation Service
 * Processes user messages and generates appropriate AI responses with actions
 * Enhanced with formatting, suggestions, confirmations, and clarification support
 */
export class ResponseGenerator {
  private responseTemplates: Map<string, ResponseTemplate>;
  private suggestionEngine: SuggestionEngine;
  private confirmationHandler: ConfirmationHandler;
  private clarificationEngine: ClarificationEngine;

  constructor() {
    this.responseTemplates = new Map();
    this.suggestionEngine = new SuggestionEngine();
    this.confirmationHandler = new ConfirmationHandler();
    this.clarificationEngine = new ClarificationEngine();
    this.initializeResponseTemplates();
  }

  /**
   * Generate AI response for user message with enhanced formatting and suggestions
   */
  async generateResponse(
    message: string, 
    context?: ConversationContext
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Check if this is a confirmation response
      if (this.confirmationHandler.isConfirmationResponse(message)) {
        return await this.handleConfirmationResponse(message, context);
      }

      // Check if this is a clarification response
      if (this.clarificationEngine.isClarificationResponse(message, context)) {
        return await this.handleClarificationResponse(message, context);
      }

      // Enhanced pattern matching with confidence scoring
      const intentAnalysis = this.analyzeUserIntent(message, context);
      
      // Enhanced pattern matching with confidence scoring
      
      // Generate response based on intent with proper formatting
      let response: AIResponse;
      
      switch (intentAnalysis.primaryIntent) {
        case 'rsi-strategy':
          response = await this.generateRSIStrategyResponse(message, context);
          break;
        case 'macd-strategy':
          response = await this.generateMACDStrategyResponse(message, context);
          break;
        case 'bollinger-strategy':
          response = await this.generateBollingerStrategyResponse(message, context);
          break;
        case 'help-request':
          response = await this.generateHelpResponse(message, context);
          break;
        case 'strategy-analysis':
          response = await this.generateAnalysisResponse(message, context);
          break;
        case 'optimization-request':
          response = await this.generateOptimizationResponse(message, context);
          break;
        case 'ambiguous':
          response = await this.generateClarificationResponse(message, context);
          break;
        default:
          response = await this.generateCustomResponse(message, context);
      }

      // Enhance response with metadata and suggestions
      response = this.enhanceResponse(response, intentAnalysis, context, Date.now() - startTime);
      
      return response;

    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.generateErrorResponse(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Generate response for RSI strategy requests with enhanced formatting
   */
  private async generateRSIStrategyResponse(
    message: string,
    context?: ConversationContext
  ): Promise<AIResponse> {
    const strategyPreview: StrategyPreview = {
      id: `rsi-strategy-${Date.now()}`,
      name: 'RSI Mean Reversion Strategy',
      description: 'A strategy that buys when RSI is oversold (below 30) and sells when overbought (above 70)',
      components: [
        { type: 'data-source', label: 'Market Data', description: 'BTCUSDT 1h timeframe', essential: true },
        { type: 'indicator', label: 'RSI (14)', description: 'Relative Strength Index with 14 period', essential: true },
        { type: 'condition', label: 'Oversold Check', description: 'RSI < 30 for buy signal', essential: true },
        { type: 'condition', label: 'Overbought Check', description: 'RSI > 70 for sell signal', essential: true },
        { type: 'action', label: 'Buy Order', description: 'Market buy when oversold', essential: true },
        { type: 'action', label: 'Sell Order', description: 'Market sell when overbought', essential: true },
        { type: 'risk', label: 'Stop Loss', description: '2% stop loss protection', essential: false }
      ],
      estimatedComplexity: 'medium',
      estimatedTime: 45,
      riskLevel: 'medium'
    };

    const actions: AIAction[] = [
      {
        id: 'build-rsi-strategy',
        type: ActionType.BUILD_STRATEGY,
        label: 'Build RSI Strategy',
        description: 'Automatically build this RSI strategy on the canvas',
        payload: { strategyType: 'rsi' },
        primary: true,
        destructive: false
      },
      {
        id: 'explain-rsi',
        type: ActionType.EXPLAIN_CONCEPT,
        label: 'Explain RSI',
        description: 'Learn how RSI indicator works',
        payload: { concept: 'rsi' }
      },
      {
        id: 'customize-rsi',
        type: ActionType.MODIFY_STRATEGY,
        label: 'Customize Parameters',
        description: 'Adjust RSI periods and thresholds',
        payload: { strategyType: 'rsi', action: 'customize' }
      }
    ];

    return {
      message: `🎯 **RSI Mean Reversion Strategy**\n\nPerfect choice! I've designed a comprehensive RSI strategy that's ideal for capturing market reversals.\n\n**📊 Strategy Logic:**\n• **Buy Signal:** When RSI drops below 30 (oversold condition)\n• **Sell Signal:** When RSI rises above 70 (overbought condition)\n• **Risk Management:** 2% stop loss to protect your capital\n\n**🔧 Key Components:**\n✅ Market Data (BTCUSDT 1h)\n✅ RSI Indicator (14-period)\n✅ Oversold/Overbought Conditions\n✅ Buy/Sell Orders\n✅ Stop Loss Protection\n\n**📈 Performance Expectations:**\n• **Complexity:** Medium\n• **Build Time:** ~45 seconds\n• **Risk Level:** Medium\n• **Best For:** Ranging markets\n\n**💡 Why This Works:**\nRSI identifies when an asset is oversold (likely to bounce up) or overbought (likely to pull back). This strategy capitalizes on these natural market corrections.\n\nReady to build this strategy?`,
      actions,
      strategyPreview,
      suggestions: [
        'Add volume confirmation for stronger signals',
        'Include trend filter to avoid counter-trend trades',
        'Optimize RSI parameters for different timeframes'
      ],
      needsConfirmation: true
    };
  }

  /**
   * Generate response for MACD strategy requests with enhanced formatting
   */
  private async generateMACDStrategyResponse(
    message: string,
    context?: ConversationContext
  ): Promise<AIResponse> {
    const strategyPreview: StrategyPreview = {
      id: `macd-strategy-${Date.now()}`,
      name: 'MACD Crossover Strategy',
      description: 'A trend-following strategy that uses MACD line crossovers to generate buy and sell signals',
      components: [
        { type: 'data-source', label: 'Market Data', description: 'BTCUSDT 1h timeframe', essential: true },
        { type: 'indicator', label: 'MACD (12,26,9)', description: 'MACD with standard parameters', essential: true },
        { type: 'condition', label: 'Bullish Crossover', description: 'MACD line crosses above signal line', essential: true },
        { type: 'condition', label: 'Bearish Crossover', description: 'MACD line crosses below signal line', essential: true },
        { type: 'action', label: 'Buy Order', description: 'Market buy on bullish crossover', essential: true },
        { type: 'action', label: 'Sell Order', description: 'Market sell on bearish crossover', essential: true },
        { type: 'risk', label: 'Stop Loss', description: '3% stop loss protection', essential: false }
      ],
      estimatedComplexity: 'medium',
      estimatedTime: 50,
      riskLevel: 'medium'
    };

    const actions: AIAction[] = [
      {
        id: 'build-macd-strategy',
        type: ActionType.BUILD_STRATEGY,
        label: 'Build MACD Strategy',
        description: 'Automatically build this MACD strategy on the canvas',
        payload: { strategyType: 'macd' },
        primary: true,
        destructive: false
      },
      {
        id: 'explain-macd',
        type: ActionType.EXPLAIN_CONCEPT,
        label: 'Explain MACD',
        description: 'Learn how MACD indicator works',
        payload: { concept: 'macd' }
      },
      {
        id: 'add-histogram',
        type: ActionType.MODIFY_STRATEGY,
        label: 'Add Histogram Confirmation',
        description: 'Include MACD histogram for stronger signals',
        payload: { strategyType: 'macd', enhancement: 'histogram' }
      }
    ];

    return {
      message: `📈 **MACD Crossover Strategy**\n\nExcellent choice for trend following! This strategy captures momentum shifts using one of the most reliable indicators.\n\n**🎯 Strategy Logic:**\n• **Buy Signal:** MACD line crosses above signal line (bullish momentum)\n• **Sell Signal:** MACD line crosses below signal line (bearish momentum)\n• **Risk Management:** 3% stop loss for trend protection\n\n**🔧 Key Components:**\n✅ Market Data (BTCUSDT 1h)\n✅ MACD Indicator (12,26,9)\n✅ Crossover Detection\n✅ Buy/Sell Orders\n✅ Stop Loss Protection\n\n**📊 Performance Expectations:**\n• **Complexity:** Medium\n• **Build Time:** ~50 seconds\n• **Risk Level:** Medium\n• **Best For:** Trending markets\n\n**💡 Why This Works:**\nMACD crossovers are excellent for catching the beginning of new trends. The strategy enters positions early in trend changes and rides the momentum.\n\n**🚀 Pro Tips:**\n• Works best in trending markets\n• Consider adding histogram confirmation\n• Avoid in choppy, sideways markets\n\nReady to build this momentum-catching strategy?`,
      actions,
      strategyPreview,
      suggestions: [
        'Add histogram confirmation for stronger signals',
        'Include trend filter to avoid false signals',
        'Optimize MACD parameters for your timeframe'
      ],
      needsConfirmation: true
    };
  }

  /**
   * Generate response for Bollinger Bands strategy requests with enhanced formatting
   */
  private async generateBollingerStrategyResponse(
    message: string,
    context?: ConversationContext
  ): Promise<AIResponse> {
    const strategyPreview: StrategyPreview = {
      id: `bollinger-strategy-${Date.now()}`,
      name: 'Bollinger Bands Breakout Strategy',
      description: 'A volatility-based strategy that trades breakouts from Bollinger Bands',
      components: [
        { type: 'data-source', label: 'Market Data', description: 'BTCUSDT 1h timeframe', essential: true },
        { type: 'indicator', label: 'Bollinger Bands (20,2)', description: 'BB with 20 period and 2 std dev', essential: true },
        { type: 'condition', label: 'Upper Band Breakout', description: 'Price breaks above upper band', essential: true },
        { type: 'condition', label: 'Lower Band Breakout', description: 'Price breaks below lower band', essential: true },
        { type: 'action', label: 'Buy Order', description: 'Buy on upper band breakout', essential: true },
        { type: 'action', label: 'Sell Order', description: 'Sell on lower band breakout', essential: true },
        { type: 'risk', label: 'Stop Loss', description: '2.5% stop loss protection', essential: false }
      ],
      estimatedComplexity: 'high',
      estimatedTime: 60,
      riskLevel: 'high'
    };

    const actions: AIAction[] = [
      {
        id: 'build-bollinger-strategy',
        type: ActionType.BUILD_STRATEGY,
        label: 'Build Bollinger Strategy',
        description: 'Automatically build this Bollinger Bands strategy on the canvas',
        payload: { strategyType: 'bollinger' },
        primary: true,
        destructive: false
      },
      {
        id: 'explain-bollinger',
        type: ActionType.EXPLAIN_CONCEPT,
        label: 'Explain Bollinger Bands',
        description: 'Learn how Bollinger Bands work',
        payload: { concept: 'bollinger' }
      },
      {
        id: 'add-squeeze',
        type: ActionType.MODIFY_STRATEGY,
        label: 'Add Squeeze Detection',
        description: 'Include Bollinger Band squeeze for better timing',
        payload: { strategyType: 'bollinger', enhancement: 'squeeze' }
      }
    ];

    return {
      message: `⚡ **Bollinger Bands Breakout Strategy**\n\nBrilliant choice for volatility trading! This advanced strategy captures explosive price movements when volatility expands.\n\n**🎯 Strategy Logic:**\n• **Buy Signal:** Price breaks above upper Bollinger Band (bullish breakout)\n• **Sell Signal:** Price breaks below lower Bollinger Band (bearish breakout)\n• **Risk Management:** 2.5% stop loss for volatility protection\n\n**🔧 Key Components:**\n✅ Market Data (BTCUSDT 1h)\n✅ Bollinger Bands (20-period, 2 std dev)\n✅ Breakout Detection\n✅ Buy/Sell Orders\n✅ Stop Loss Protection\n\n**📊 Performance Expectations:**\n• **Complexity:** High\n• **Build Time:** ~60 seconds\n• **Risk Level:** High\n• **Best For:** Volatile, trending markets\n\n**💡 Why This Works:**\nBollinger Bands expand during high volatility and contract during low volatility. Breakouts from the bands often signal the start of strong price movements.\n\n**⚠️ Important Notes:**\n• Higher risk due to volatility-based signals\n• Best in trending markets with clear breakouts\n• Consider adding volume confirmation\n• Watch for false breakouts in choppy markets\n\n**🚀 Pro Enhancement Ideas:**\n• Add squeeze detection for better entry timing\n• Include volume confirmation to filter false signals\n• Use multiple timeframe analysis\n\nReady to build this advanced volatility strategy?`,
      actions,
      strategyPreview,
      suggestions: [
        'Add volume confirmation to reduce false breakouts',
        'Include squeeze detection for optimal entry timing',
        'Add mean reversion signals for counter-trend opportunities'
      ],
      needsConfirmation: true
    };
  }

  /**
   * Generate response for custom/unclear requests with enhanced clarification
   */
  private async generateCustomResponse(
    message: string,
    context?: ConversationContext
  ): Promise<AIResponse> {
    // Analyze the message for any recognizable elements
    const lowerMessage = message.toLowerCase();
    const hasIndicatorMention = /\b(rsi|macd|bollinger|sma|ema|stochastic)\b/.test(lowerMessage);
    const hasStrategyMention = /\b(strategy|trading|buy|sell|signal)\b/.test(lowerMessage);
    const hasTimeframeMention = /\b(1m|5m|15m|1h|4h|1d|daily|hourly)\b/.test(lowerMessage);

    let responseMessage = `🤔 **I'd love to help you build that strategy!**\n\n`;
    
    if (hasIndicatorMention || hasStrategyMention) {
      responseMessage += `I can see you're interested in creating a trading strategy. To build the perfect strategy for your needs, I need a bit more information:\n\n`;
    } else {
      responseMessage += `I'm here to help you create amazing trading strategies! To get started, I need to understand what you're looking for:\n\n`;
    }

    const clarificationQuestions = [
      "**Strategy Type:** Are you looking for trend-following, mean-reversion, breakout, or scalping?",
      "**Indicators:** Which technical indicators would you like to use? (RSI, MACD, Bollinger Bands, etc.)",
      "**Timeframe:** What timeframe will you be trading? (1m, 5m, 1h, 1d, etc.)",
      "**Risk Level:** What's your risk tolerance? (Conservative, Moderate, Aggressive)"
    ];

    responseMessage += clarificationQuestions.join('\n') + '\n\n';
    responseMessage += `**💡 Or try one of these popular requests:**`;

    const actions: AIAction[] = [
      {
        id: 'show-examples',
        type: ActionType.SHOW_TEMPLATE,
        label: 'Browse Examples',
        description: 'See popular strategy templates',
        payload: { showExamples: true }
      },
      {
        id: 'explain-basics',
        type: ActionType.EXPLAIN_CONCEPT,
        label: 'Strategy Basics',
        description: 'Learn about trading strategy fundamentals',
        payload: { concept: 'strategy-basics' }
      },
      {
        id: 'quick-rsi',
        type: ActionType.BUILD_STRATEGY,
        label: 'Quick RSI Strategy',
        description: 'Build a simple RSI mean reversion strategy',
        payload: { strategyType: 'rsi', quickStart: true }
      }
    ];

    const suggestions = [
      "Create a RSI strategy that buys when RSI is below 30",
      "Build a MACD crossover strategy with 2% stop loss",
      "Make a Bollinger Bands breakout strategy for volatile markets",
      "Show me beginner-friendly strategy templates"
    ];

    // Add context-aware suggestions
    if (hasIndicatorMention) {
      if (lowerMessage.includes('rsi')) {
        suggestions.unshift("Build a RSI mean reversion strategy with your preferred settings");
      } else if (lowerMessage.includes('macd')) {
        suggestions.unshift("Create a MACD crossover strategy with custom parameters");
      } else if (lowerMessage.includes('bollinger')) {
        suggestions.unshift("Design a Bollinger Bands strategy with your risk preferences");
      }
    }

    return {
      message: responseMessage,
      actions,
      suggestions,
      needsConfirmation: false
    };
  }

  /**
   * Generate help response with enhanced formatting
   */
  private async generateHelpResponse(
    message: string,
    context?: ConversationContext
  ): Promise<AIResponse> {
    const actions: AIAction[] = [
      {
        id: 'show-templates',
        type: ActionType.SHOW_TEMPLATE,
        label: 'Browse Templates',
        description: 'Explore pre-built strategy templates',
        payload: { showAll: true }
      },
      {
        id: 'explain-concepts',
        type: ActionType.EXPLAIN_CONCEPT,
        label: 'Learn Concepts',
        description: 'Understand trading strategy concepts',
        payload: { concept: 'overview' }
      },
      {
        id: 'quick-start',
        type: ActionType.BUILD_STRATEGY,
        label: 'Quick Start',
        description: 'Build a simple RSI strategy to get started',
        payload: { strategyType: 'rsi', quickStart: true }
      }
    ];

    return {
      message: `👋 **Welcome to PineGenie AI!**\n\nI'm your intelligent trading strategy assistant, here to help you build professional-grade strategies without any coding knowledge!\n\n**🚀 What I Can Do:**\n• **Build Custom Strategies:** Just describe what you want in plain English\n• **Optimize Existing Strategies:** Improve performance and reduce risk\n• **Explain Trading Concepts:** Learn indicators, patterns, and best practices\n• **Suggest Improvements:** Get real-time feedback and enhancement ideas\n• **Analyze Your Strategies:** Comprehensive analysis and recommendations\n\n**💡 Getting Started Examples:**\n• "Create a RSI strategy that buys when oversold"\n• "Build a MACD crossover with stop loss"\n• "Make a Bollinger Bands breakout strategy"\n• "Analyze my current strategy"\n• "Optimize my strategy parameters"\n\n**🎯 Popular Strategy Types:**\n• **Mean Reversion:** RSI, Stochastic (buy low, sell high)\n• **Trend Following:** MACD, Moving Averages (ride the trend)\n• **Breakout:** Bollinger Bands, Support/Resistance (catch explosive moves)\n• **Scalping:** Quick in-and-out trades with tight stops\n\n**🛡️ Risk Management:**\nEvery strategy I build includes proper risk management with stop losses, position sizing, and risk/reward optimization.\n\nWhat type of strategy would you like to create today?`,
      actions,
      suggestions: [
        "Create a beginner-friendly RSI strategy",
        "Show me trending strategy templates",
        "Explain the difference between trend following and mean reversion",
        "What's the best strategy for volatile markets?"
      ]
    };
  }

  /**
   * Generate error response with helpful recovery options
   */
  private generateErrorResponse(errorMessage: string): AIResponse {
    // Categorize error types for better responses
    const isParsingError = errorMessage.toLowerCase().includes('parse') || errorMessage.toLowerCase().includes('understand');
    const isConnectionError = errorMessage.toLowerCase().includes('connection') || errorMessage.toLowerCase().includes('network');
    const isValidationError = errorMessage.toLowerCase().includes('validation') || errorMessage.toLowerCase().includes('invalid');

    let responseMessage = `❌ **Oops! Something went wrong**\n\n`;
    let suggestions: string[] = [];
    
    if (isParsingError || errorMessage.toLowerCase().includes('parsing failed')) {
      responseMessage += `I had trouble understanding your request. This might help:\n\n• Try using simpler language\n• Be more specific about the strategy type\n• Mention specific indicators you want to use\n\n**Example:** "Create a RSI strategy that buys when RSI is below 30"`;
      suggestions = [
        "Create a simple RSI mean reversion strategy",
        "Build a basic MACD crossover strategy",
        "Show me strategy examples to get started"
      ];
    } else if (isConnectionError) {
      responseMessage += `There was a connection issue. Don't worry, PineGenie AI works offline!\n\n• Try refreshing the page\n• Check your internet connection\n• The error was: ${errorMessage}`;
      suggestions = [
        "Try again with a simple strategy request",
        "Show me offline strategy templates",
        "Get help with PineGenie AI"
      ];
    } else if (isValidationError) {
      responseMessage += `There was an issue with the strategy validation:\n\n• The strategy might be too complex\n• Some parameters might be invalid\n• Error details: ${errorMessage}`;
      suggestions = [
        "Try a simpler strategy first",
        "Use a pre-built template",
        "Explain strategy validation rules"
      ];
    } else {
      responseMessage += `I encountered an unexpected error: ${errorMessage}\n\nDon't worry! Here are some things you can try:\n\n• Refresh the page and try again\n• Start with a simpler request\n• Use one of the suggested examples below`;
      suggestions = [
        "Create a basic RSI strategy",
        "Show me beginner-friendly templates",
        "Get help with using PineGenie AI"
      ];
    }

    const actions: AIAction[] = [
      {
        id: 'get-help',
        type: ActionType.EXPLAIN_CONCEPT,
        label: 'Get Help',
        description: 'Learn how to use PineGenie AI effectively',
        payload: { concept: 'help' }
      },
      {
        id: 'show-templates',
        type: ActionType.SHOW_TEMPLATE,
        label: 'Browse Templates',
        description: 'Start with a proven strategy template',
        payload: { showAll: true }
      },
      {
        id: 'try-simple',
        type: ActionType.BUILD_STRATEGY,
        label: 'Try Simple Strategy',
        description: 'Build a basic RSI strategy that always works',
        payload: { strategyType: 'rsi', simple: true }
      }
    ];

    return {
      message: responseMessage,
      actions,
      suggestions,
      metadata: {
        processingTime: 0,
        confidence: 0,
        sources: ['error-handler'],
        relatedTopics: ['troubleshooting', 'getting-started'],
        followUpQuestions: ['What type of strategy would you like to create?']
      }
    };
  }

  /**
   * Initialize response templates for consistent formatting
   */
  private initializeResponseTemplates(): void {
    this.responseTemplates.set('strategy-built', {
      title: '✅ Strategy Built Successfully',
      format: 'success',
      includeMetadata: true
    });

    this.responseTemplates.set('strategy-analysis', {
      title: '🔍 Strategy Analysis Complete',
      format: 'analysis',
      includeMetadata: true
    });

    this.responseTemplates.set('clarification-needed', {
      title: '❓ Need More Information',
      format: 'question',
      includeMetadata: false
    });

    this.responseTemplates.set('confirmation-required', {
      title: '⚠️ Confirmation Required',
      format: 'warning',
      includeMetadata: true
    });
  }

  /**
   * Analyze user intent with confidence scoring
   */
  private analyzeUserIntent(message: string, context?: ConversationContext): IntentAnalysis {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(/\s+/);
    
    // Direct keyword matching for strategy types - check specific indicators first
    if (lowerMessage.includes('rsi') || lowerMessage.includes('oversold') || lowerMessage.includes('overbought') || lowerMessage.includes('relative strength')) {
      return {
        primaryIntent: 'rsi-strategy',
        confidence: 0.9,
        keywords: words,
        hasContext: !!context?.currentStrategy,
        requiresClarification: false
      };
    }
    
    if (lowerMessage.includes('macd') || (lowerMessage.includes('crossover') && !lowerMessage.includes('help'))) {
      return {
        primaryIntent: 'macd-strategy',
        confidence: 0.9,
        keywords: words,
        hasContext: !!context?.currentStrategy,
        requiresClarification: false
      };
    }
    
    if (lowerMessage.includes('bollinger') || lowerMessage.includes('bands')) {
      return {
        primaryIntent: 'bollinger-strategy',
        confidence: 0.9,
        keywords: words,
        hasContext: !!context?.currentStrategy,
        requiresClarification: false
      };
    }
    
    // Check for optimization requests before help
    if ((lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('enhance')) && !lowerMessage.includes('help')) {
      return {
        primaryIntent: 'optimization-request',
        confidence: 0.9,
        keywords: words,
        hasContext: !!context?.currentStrategy,
        requiresClarification: false
      };
    }
    
    // Check for help requests - but only if no specific indicators mentioned
    if ((lowerMessage.includes('help') || lowerMessage.includes('what') || lowerMessage.includes('how')) && 
        !lowerMessage.includes('rsi') && !lowerMessage.includes('macd') && !lowerMessage.includes('bollinger')) {
      return {
        primaryIntent: 'help-request',
        confidence: 0.9,
        keywords: words,
        hasContext: !!context?.currentStrategy,
        requiresClarification: false
      };
    }

    let bestMatch = { intent: 'ambiguous', confidence: 0 };

    // Special handling for analysis requests with context
    if (context?.currentStrategy && (lowerMessage.includes('analyze') || lowerMessage.includes('review'))) {
      bestMatch = { intent: 'strategy-analysis', confidence: 0.9 };
    }

    return {
      primaryIntent: bestMatch.intent,
      confidence: bestMatch.confidence,
      keywords: words,
      hasContext: !!context?.currentStrategy,
      requiresClarification: bestMatch.confidence < 0.1
    };
  }

  /**
   * Handle confirmation responses (yes/no/cancel)
   */
  private async handleConfirmationResponse(
    message: string, 
    context?: ConversationContext
  ): Promise<AIResponse> {
    const confirmation = this.confirmationHandler.parseConfirmation(message);
    
    if (confirmation.confirmed && context?.pendingActions?.length) {
      const action = context.pendingActions[0];
      return {
        message: `✅ **Action Confirmed**\n\nProceeding with: ${action.description}\n\nI'll start building your strategy now. This should take about ${this.formatTime(60)} seconds.`,
        actions: [action],
        metadata: {
          processingTime: 0,
          confidence: 1.0,
          sources: ['user-confirmation'],
          relatedTopics: [],
          followUpQuestions: []
        }
      };
    } else if (confirmation.cancelled) {
      return {
        message: `❌ **Action Cancelled**\n\nNo problem! What would you like to do instead?`,
        suggestions: [
          "Show me different strategy options",
          "Explain how trading strategies work",
          "Help me understand risk management"
        ]
      };
    } else {
      return await this.generateClarificationResponse(message, context);
    }
  }

  /**
   * Handle clarification responses
   */
  private async handleClarificationResponse(
    message: string, 
    context?: ConversationContext
  ): Promise<AIResponse> {
    const clarification = this.clarificationEngine.processClarification(message, context);
    
    if (clarification.isComplete) {
      // We have enough information to proceed
      return await this.generateResponse(clarification.reconstructedIntent, context);
    } else {
      // Need more clarification
      return {
        message: `📝 **Got it!** ${clarification.acknowledgment}\n\n${clarification.nextQuestion}`,
        suggestions: clarification.suggestions,
        metadata: {
          processingTime: 0,
          confidence: 0.7,
          sources: ['clarification-engine'],
          relatedTopics: clarification.relatedTopics,
          followUpQuestions: [clarification.nextQuestion]
        }
      };
    }
  }

  /**
   * Generate clarification response for ambiguous requests
   */
  private async generateClarificationResponse(
    message: string, 
    context?: ConversationContext
  ): Promise<AIResponse> {
    const clarificationNeeded = this.clarificationEngine.identifyMissingInfo(message, context);
    
    return {
      message: `🤔 **I'd love to help you build that strategy!**\n\nTo create the perfect strategy for your needs, I need a bit more information:\n\n${clarificationNeeded.questions.map((q, i) => `**${i + 1}.** ${q}`).join('\n')}`,
      suggestions: clarificationNeeded.suggestions,
      metadata: {
        processingTime: 0,
        confidence: 0.5,
        sources: ['clarification-engine'],
        relatedTopics: clarificationNeeded.relatedTopics,
        followUpQuestions: clarificationNeeded.questions
      }
    };
  }

  /**
   * Generate analysis response for existing strategies
   */
  private async generateAnalysisResponse(
    message: string, 
    context?: ConversationContext
  ): Promise<AIResponse> {
    if (!context?.currentStrategy) {
      return {
        message: `🔍 **Strategy Analysis**\n\nI'd be happy to analyze your strategy! However, I don't see any strategy currently loaded on your canvas.\n\nPlease load a strategy or build one first, then I can provide detailed analysis and improvement suggestions.`,
        actions: [
          {
            id: 'load-strategy',
            type: ActionType.SHOW_TEMPLATE,
            label: 'Load Strategy',
            description: 'Load an existing strategy to analyze',
            payload: { action: 'load' }
          }
        ],
        suggestions: [
          "Build a simple RSI strategy first",
          "Show me strategy templates",
          "Explain what makes a good strategy"
        ]
      };
    }

    // Mock analysis for demonstration
    return {
      message: `🔍 **Strategy Analysis Complete**\n\n**Current Strategy:** ${context.currentStrategy}\n\n**Strengths:**\n• Clear entry/exit signals\n• Proper risk management\n• Good indicator selection\n\n**Improvement Opportunities:**\n• Add volume confirmation\n• Consider trend filter\n• Optimize parameters for current market\n\n**Risk Assessment:** Medium\n**Complexity:** Intermediate`,
      actions: [
        {
          id: 'optimize-strategy',
          type: ActionType.OPTIMIZE_PARAMETERS,
          label: 'Optimize Parameters',
          description: 'Automatically optimize strategy parameters',
          payload: { strategyId: context.currentStrategy },
          primary: true
        },
        {
          id: 'add-improvements',
          type: ActionType.MODIFY_STRATEGY,
          label: 'Add Improvements',
          description: 'Add suggested improvements to strategy',
          payload: { improvements: ['volume-filter', 'trend-filter'] }
        }
      ],
      suggestions: [
        "Optimize parameters for better performance",
        "Add volume confirmation filter",
        "Explain the suggested improvements"
      ]
    };
  }

  /**
   * Generate optimization response
   */
  private async generateOptimizationResponse(
    message: string, 
    context?: ConversationContext
  ): Promise<AIResponse> {
    return {
      message: `⚡ **Strategy Optimization**\n\nI can help optimize your strategy in several ways:\n\n**Parameter Optimization:**\n• Fine-tune indicator periods\n• Adjust entry/exit thresholds\n• Optimize risk management levels\n\n**Structure Optimization:**\n• Add confirmation signals\n• Improve entry/exit logic\n• Enhance risk management\n\nWhat aspect would you like to focus on?`,
      actions: [
        {
          id: 'optimize-parameters',
          type: ActionType.OPTIMIZE_PARAMETERS,
          label: 'Optimize Parameters',
          description: 'Automatically optimize all parameters',
          payload: { type: 'parameters' },
          primary: true
        },
        {
          id: 'optimize-structure',
          type: ActionType.MODIFY_STRATEGY,
          label: 'Improve Structure',
          description: 'Add confirmation signals and improve logic',
          payload: { type: 'structure' }
        }
      ],
      suggestions: [
        "Optimize parameters for current market conditions",
        "Add volume confirmation to reduce false signals",
        "Explain optimization techniques"
      ]
    };
  }

  /**
   * Enhance response with metadata and contextual suggestions
   */
  private enhanceResponse(
    response: AIResponse, 
    intentAnalysis: IntentAnalysis, 
    context?: ConversationContext,
    processingTime: number = 0
  ): AIResponse {
    // Add metadata
    response.metadata = {
      processingTime,
      confidence: intentAnalysis.confidence,
      sources: ['response-generator', 'intent-analysis'],
      relatedTopics: this.suggestionEngine.getRelatedTopics(intentAnalysis.primaryIntent),
      followUpQuestions: this.suggestionEngine.generateFollowUpQuestions(intentAnalysis.primaryIntent, context)
    };

    // Enhance suggestions if not already present
    if (!response.suggestions || response.suggestions.length === 0) {
      response.suggestions = this.suggestionEngine.generateContextualSuggestions(
        intentAnalysis.primaryIntent, 
        context
      );
    }

    // Add confirmation requirement for destructive actions
    if (response.actions?.some(action => this.confirmationHandler.requiresConfirmation(action))) {
      response.needsConfirmation = true;
      response.message += `\n\n⚠️ **Please confirm:** This action will modify your current strategy. Type "yes" to proceed or "no" to cancel.`;
    }

    return response;
  }

  // Helper methods
  private formatTime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
}

// Helper interfaces and classes
interface ResponseTemplate {
  title: string;
  format: 'success' | 'error' | 'warning' | 'info' | 'question' | 'analysis';
  includeMetadata: boolean;
}

interface IntentAnalysis {
  primaryIntent: string;
  confidence: number;
  keywords: string[];
  hasContext: boolean;
  requiresClarification: boolean;
}

/**
 * Suggestion Engine for generating contextual suggestions
 */
class SuggestionEngine {
  generateContextualSuggestions(intent: string, context?: ConversationContext): string[] {
    const baseSuggestions = {
      'rsi-strategy': [
        "Add volume confirmation to reduce false signals",
        "Optimize RSI periods for different timeframes",
        "Include trend filter for better accuracy"
      ],
      'macd-strategy': [
        "Add histogram confirmation for stronger signals",
        "Include trend filter to avoid counter-trend trades",
        "Optimize MACD parameters for your timeframe"
      ],
      'bollinger-strategy': [
        "Add volume confirmation for breakouts",
        "Use squeeze detection for better timing",
        "Include reversion signals for mean reversion"
      ],
      'help-request': [
        "What indicators should I use for trend following?",
        "How do I add risk management to my strategy?",
        "Show me some beginner-friendly strategy templates"
      ],
      'strategy-analysis': [
        "Optimize parameters for better performance",
        "Add confirmation signals to reduce false positives",
        "Explain the analysis results in detail"
      ]
    };

    return baseSuggestions[intent] || [
      "Create a RSI strategy that buys when RSI is below 30",
      "Build a MACD crossover strategy with stop loss",
      "Show me some strategy examples"
    ];
  }

  getRelatedTopics(intent: string): string[] {
    const topics = {
      'rsi-strategy': ['technical-analysis', 'mean-reversion', 'oscillators'],
      'macd-strategy': ['trend-following', 'momentum', 'crossover-signals'],
      'bollinger-strategy': ['volatility', 'breakout-trading', 'mean-reversion'],
      'help-request': ['strategy-basics', 'technical-indicators', 'risk-management'],
      'strategy-analysis': ['backtesting', 'optimization', 'performance-metrics']
    };

    return topics[intent] || ['trading-strategies', 'technical-analysis'];
  }

  generateFollowUpQuestions(intent: string, context?: ConversationContext): string[] {
    const questions = {
      'rsi-strategy': [
        "Would you like to add volume confirmation?",
        "What timeframe are you planning to trade?",
        "Should I include trend filtering?"
      ],
      'macd-strategy': [
        "Would you like histogram confirmation?",
        "Should I add a trend filter?",
        "What's your preferred risk level?"
      ],
      'bollinger-strategy': [
        "Should I add volume confirmation?",
        "Would you like squeeze detection?",
        "What's your risk tolerance?"
      ]
    };

    return questions[intent] || [
      "Would you like me to explain any part of this strategy?",
      "Should I optimize the parameters?",
      "Would you like to see similar strategies?"
    ];
  }
}

/**
 * Confirmation Handler for managing user confirmations
 */
class ConfirmationHandler {
  isConfirmationResponse(message: string): boolean {
    const lowerMessage = message.toLowerCase().trim();
    const confirmationWords = ['yes', 'y', 'ok', 'okay', 'confirm', 'proceed', 'go ahead', 'do it'];
    const cancellationWords = ['no', 'n', 'cancel', 'stop', 'abort', 'nevermind', 'never mind'];
    
    return confirmationWords.some(word => lowerMessage === word || lowerMessage.includes(word)) ||
           cancellationWords.some(word => lowerMessage === word || lowerMessage.includes(word));
  }

  parseConfirmation(message: string): { confirmed: boolean; cancelled: boolean; uncertain: boolean } {
    const lowerMessage = message.toLowerCase().trim();
    const confirmationWords = ['yes', 'y', 'ok', 'okay', 'confirm', 'proceed', 'go ahead', 'do it'];
    const cancellationWords = ['no', 'n', 'cancel', 'stop', 'abort', 'nevermind', 'never mind'];
    
    const isConfirmed = confirmationWords.some(word => lowerMessage === word || lowerMessage.includes(word));
    const isCancelled = cancellationWords.some(word => lowerMessage === word || lowerMessage.includes(word));
    
    return {
      confirmed: isConfirmed && !isCancelled,
      cancelled: isCancelled && !isConfirmed,
      uncertain: !isConfirmed && !isCancelled
    };
  }

  requiresConfirmation(action: AIAction): boolean {
    const destructiveActions = [
      ActionType.BUILD_STRATEGY,
      ActionType.MODIFY_STRATEGY,
      ActionType.OPTIMIZE_PARAMETERS
    ];
    
    return destructiveActions.includes(action.type) || action.destructive === true;
  }
}

/**
 * Clarification Engine for handling ambiguous requests
 */
class ClarificationEngine {
  isClarificationResponse(message: string, context?: ConversationContext): boolean {
    return !!(context?.pendingActions?.length && 
             context.pendingActions.some(action => action.type === ActionType.EXPLAIN_CONCEPT));
  }

  processClarification(message: string, context?: ConversationContext): ClarificationResult {
    // Simple implementation - in a real system this would be more sophisticated
    const lowerMessage = message.toLowerCase();
    
    // Check if user provided strategy type
    if (lowerMessage.includes('rsi') || lowerMessage.includes('macd') || lowerMessage.includes('bollinger')) {
      return {
        isComplete: true,
        acknowledgment: "Perfect! I understand you want to create that type of strategy.",
        reconstructedIntent: message,
        nextQuestion: "",
        suggestions: [],
        relatedTopics: []
      };
    }

    return {
      isComplete: false,
      acknowledgment: "Thanks for that information!",
      nextQuestion: "What type of indicators would you like to use? (RSI, MACD, Bollinger Bands, etc.)",
      suggestions: ["RSI for mean reversion", "MACD for trend following", "Bollinger Bands for breakouts"],
      relatedTopics: ['technical-indicators', 'strategy-types']
    };
  }

  identifyMissingInfo(message: string, context?: ConversationContext): ClarificationNeeded {
    return {
      questions: [
        "What type of trading strategy are you looking for? (trend-following, mean-reversion, breakout, etc.)",
        "Which indicators would you like to use? (RSI, MACD, Bollinger Bands, etc.)",
        "What timeframe are you planning to trade on? (1m, 5m, 1h, 1d, etc.)",
        "What's your risk tolerance level? (low, medium, high)"
      ],
      suggestions: [
        "Create a RSI mean reversion strategy",
        "Build a MACD trend following strategy",
        "Make a Bollinger Bands breakout strategy"
      ],
      relatedTopics: ['strategy-types', 'technical-indicators', 'risk-management']
    };
  }
}

interface ClarificationResult {
  isComplete: boolean;
  acknowledgment: string;
  reconstructedIntent: string;
  nextQuestion: string;
  suggestions: string[];
  relatedTopics: string[];
}

interface ClarificationNeeded {
  questions: string[];
  suggestions: string[];
  relatedTopics: string[];
}