// AI Service for real AI model integration
import { color } from 'framer-motion';
import { text } from 'stream/consumers';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import style from 'styled-jsx/style';
import { title } from 'process';
import { text } from 'stream/consumers';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import style from 'styled-jsx/style';
import { title } from 'process';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import { title } from 'process';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import { title } from 'process';
import { title } from 'process';
import { title } from 'process';
import { title } from 'process';
import { title } from 'process';
import { title } from 'process';
import { text } from 'stream/consumers';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import style from 'styled-jsx/style';
import { title } from 'process';
import { text } from 'stream/consumers';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import style from 'styled-jsx/style';
import { title } from 'process';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import { title } from 'process';
import { color } from 'framer-motion';
import { color } from 'framer-motion';
import { title } from 'process';
import { color } from 'framer-motion';
import OpenAI from 'openai';
import { title } from 'process';
import { title } from 'process';
import { title } from 'process';
import { title } from 'process';
import { title } from 'process';

interface AIModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'custom';
  apiKey?: string;
  endpoint?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class AIService {
  private openai?: OpenAI;
  private activeModel: string = 'pine-genie';

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI if API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey && openaiKey.length > 50) {
      console.log('Initializing OpenAI with key:', openaiKey.substring(0, 15) + '...');
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
    } else {
      console.log('OpenAI API key not found or invalid');
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    modelId: string = 'gpt-4'
  ): Promise<AIResponse> {
    try {
      // Re-initialize providers to ensure we have the latest API key
      this.initializeProviders();
      
      console.log(`Attempting to use model: ${modelId}`);
      console.log(`OpenAI available: ${!!this.openai}`);
      
      // Use OpenAI if available and model is GPT
      if (this.openai && (modelId.startsWith('gpt') || modelId === 'gpt-4' || modelId === 'gpt-3.5-turbo')) {
        console.log('Using OpenAI API with model:', modelId);
        return await this.generateOpenAIResponse(messages, modelId);
      }
      
      // Use PineGenie AI for pine-genie model
      if (modelId === 'pine-genie') {
        console.log('Using PineGenie AI...');
        return this.generatePineGenieResponse(messages);
      }
      
      console.log('Falling back to direct code generation...');
      // Fallback to direct code generation
      return this.generateDirectCodeResponse(messages);

    } catch (error) {
      console.error('AI Service Error:', error);
      // Always fallback to direct code generation on error
      return this.generateDirectCodeResponse(messages);
    }
  }

  private async generateOpenAIResponse(
    messages: ChatMessage[],
    modelId: string
  ): Promise<AIResponse> {
    // Create a system prompt that forces Pine Script v6 code generation
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `You are a Pine Script v6 code generator. ALWAYS respond with complete, working Pine Script v6 code.

CRITICAL REQUIREMENTS:
- ALWAYS use //@version=6 at the top of every script
- NEVER use Pine Script v4 or v5 syntax
- NEVER ask clarifying questions
- ALWAYS generate complete, runnable Pine Script v6 strategies
- Use Pine Script v6 syntax: ta.rsi(), ta.sma(), ta.ema(), ta.macd(), etc.
- Use strategy.entry(), strategy.exit(), strategy.close() for trades
- Include proper input parameters with input.int(), input.float(), input.string()
- Add comprehensive plotting with plot(), plotshape(), hline()
- Include stop loss and take profit logic
- Add buy/sell signal visualization
- Use proper v6 color syntax: color.red, color.green, etc.
- Use proper v6 style syntax: plot.style_line, shape.labelup, etc.

PINE SCRIPT V6 SYNTAX EXAMPLES:
- RSI: ta.rsi(close, 14)
- SMA: ta.sma(close, 20)  
- EMA: ta.ema(close, 21)
- MACD: ta.macd(close, 12, 26, 9)
- Bollinger Bands: ta.bb(close, 20, 2)
- Crossover: ta.crossover(fast, slow)
- Crossunder: ta.crossunder(fast, slow)

Generate working Pine Script v6 code immediately based on the user's request.`
    };

    const completion = await this.openai!.chat.completions.create({
      model: modelId,
      messages: [systemPrompt, ...messages],
      temperature: 0.3, // Lower temperature for more consistent code generation
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '';
    
    return {
      content,
      model: modelId,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      }
    };
  }

  // Helper method to detect if user wants to create a strategy
  private isStrategyRequest(message: string): boolean {
    const strategyKeywords = [
      'create', 'build', 'make', 'generate', 'strategy', 'trading',
      'rsi', 'macd', 'sma', 'ema', 'bollinger', 'stochastic', 'atr',
      'buy', 'sell', 'entry', 'exit', 'signal', 'crossover', 'breakout',
      'indicator', 'oscillator', 'momentum', 'trend', 'volume'
    ];
    
    return strategyKeywords.some(keyword => message.includes(keyword));
  }

  // Generate PineGenie AI specific response
  private generatePineGenieResponse(messages: ChatMessage[]): AIResponse {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Check if this is a general conversation or strategy request
    const isStrategyRequest = this.isStrategyRequest(lastMessage);
    
    if (!isStrategyRequest) {
      // Handle general conversation with PineGenie personality
      return this.generatePineGenieConversation(lastMessage);
    }
    
    // Handle strategy requests with PineGenie approach
    return this.generatePineGenieStrategy(lastMessage);
  }

  // Generate conversational response for general chat
  private generateConversationalResponse(message: string): AIResponse {
    let response = '';
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      response = `Hello! I'm **PineGenie AI**, your Pine Script strategy assistant. 

I'm here to help you create professional trading strategies! Here's what I can do:

🚀 **Create Trading Strategies**
• RSI mean reversion strategies
• Moving average crossovers  
• MACD signal strategies
• Bollinger Bands breakouts
• Custom indicator combinations

💡 **Just tell me what you want to build:**
• "Create an RSI strategy with 30/70 levels"
• "Build a MACD crossover strategy"
• "Make a Bollinger Bands squeeze strategy"

What kind of trading strategy would you like to create today?`;
    } else if (message.includes('how are you') || message.includes('how do you do')) {
      response = `I'm doing great, thank you for asking! I'm **PineGenie AI** and I'm excited to help you build amazing trading strategies.

I specialize in:
• Converting your trading ideas into visual components
• Generating complete Pine Script v6 code
• Creating professional TradingView strategies

What trading strategy can I help you build today?`;
    } else if (message.includes('what can you do') || message.includes('help')) {
      response = `I'm **PineGenie AI**, your specialized Pine Script assistant! Here's what I can help you with:

🎯 **Strategy Creation**
• Transform your trading ideas into visual components
• Generate complete Pine Script v6 code ready for TradingView
• Create strategies with proper risk management

📊 **Supported Indicators**
• RSI, MACD, Bollinger Bands, Stochastic
• Moving Averages (SMA, EMA, WMA)
• Volume indicators, ATR, ADX, and more

💼 **Professional Features**
• Stop loss and take profit logic
• Entry/exit signal visualization
• Parameter optimization suggestions

Try saying: "Create a [indicator name] strategy" and I'll build it for you!`;
    } else if (message.includes('thank') || message.includes('thanks')) {
      response = `You're very welcome! I'm always happy to help you create amazing trading strategies.

If you need any more strategies or have questions about Pine Script, just let me know. I'm here to make your trading ideas come to life! 🚀`;
    } else {
      response = `I understand you're chatting with me! I'm **PineGenie AI**, specialized in creating Pine Script trading strategies.

While I love to chat, I'm most helpful when building trading strategies for you. Try asking me to:

• "Create an RSI strategy"
• "Build a moving average crossover"  
• "Make a MACD signal strategy"
• "Generate a Bollinger Bands strategy"

What kind of trading strategy would you like me to create?`;
    }

    return {
      content: response,
      model: 'pine-genie-chat',
      usage: {
        promptTokens: message.length,
        completionTokens: response.length,
        totalTokens: message.length + response.length,
      }
    };
  }

  // Helper method to extract trading intent from user message
  private extractTradingIntent(message: string): string[] {
    const keywords = [];
    const lowerMessage = message.toLowerCase();
    
    // Technical indicators
    if (lowerMessage.includes('rsi')) keywords.push('rsi');
    if (lowerMessage.includes('macd')) keywords.push('macd');
    if (lowerMessage.includes('bollinger')) keywords.push('bollinger');
    if (lowerMessage.includes('moving average') || lowerMessage.includes('ma')) keywords.push('ma');
    if (lowerMessage.includes('stochastic')) keywords.push('stochastic');
    
    // Trading actions
    if (lowerMessage.includes('buy') || lowerMessage.includes('long')) keywords.push('buy');
    if (lowerMessage.includes('sell') || lowerMessage.includes('short')) keywords.push('sell');
    if (lowerMessage.includes('strategy')) keywords.push('strategy');
    
    return keywords;
  }

  // PineGenie AI conversational responses
  private generatePineGenieConversation(message: string): AIResponse {
    let response = '';
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      response = `Hello! I'm **PineGenie AI (Free)** 👋

I'm your specialized Pine Script assistant, always available to help you create amazing trading strategies!

🚀 **What I can do:**
• Create visual trading strategies
• Generate Pine Script v6 code
• Help with indicator combinations
• Provide trading strategy advice

💡 **Try asking me:**
• "Create an RSI strategy"
• "Build a MACD crossover"
• "Make a Bollinger Bands strategy"

What trading strategy would you like to create today?`;
    } else if (message.includes('how are you')) {
      response = `I'm doing fantastic! I'm **PineGenie AI (Free)** and I'm excited to help you build profitable trading strategies! 🎯

As your free Pine Script assistant, I'm always ready to:
• Transform your trading ideas into code
• Create visual strategy components
• Generate professional Pine Script

What kind of strategy can I help you build?`;
    } else if (message.includes('what can you do') || message.includes('help')) {
      response = `I'm **PineGenie AI (Free)** - your specialized Pine Script assistant! 🤖

🎯 **My Specialties:**
• **Strategy Creation** - Turn ideas into visual components
• **Pine Script Generation** - Complete v6 code ready for TradingView
• **Indicator Combinations** - RSI, MACD, Bollinger Bands, and more
• **Risk Management** - Stop loss and take profit logic

📊 **Popular Strategies I Can Build:**
• RSI mean reversion strategies
• Moving average crossovers
• MACD signal strategies
• Bollinger Bands breakouts
• Volume-based strategies

Just tell me what you want to build and I'll create it for you!`;
    } else {
      response = `I'm **PineGenie AI (Free)** - your friendly Pine Script assistant! 😊

While I enjoy chatting, I'm most powerful when creating trading strategies for you. 

🚀 **Ready to build something amazing?**
Try saying: "Create a [strategy type] strategy" and I'll build it instantly!

What trading strategy would you like me to create?`;
    }

    return {
      content: response,
      model: 'pine-genie-free',
      usage: {
        promptTokens: message.length,
        completionTokens: response.length,
        totalTokens: message.length + response.length,
      }
    };
  }

  // PineGenie AI strategy generation
  private generatePineGenieStrategy(message: string): AIResponse {
    // Use the existing strategy generation logic but with PineGenie branding
    const result = this.generateDirectCodeResponse([{ role: 'user', content: message }]);
    
    // Add PineGenie branding to the response
    const enhancedContent = `✅ **PineGenie AI (Free) Strategy Generated!**

${result.content}

🎯 **Strategy created by PineGenie AI** - Your free Pine Script assistant!`;

    return {
      content: enhancedContent,
      model: 'pine-genie-free',
      usage: result.usage
    };
  }

  private generateDirectCodeResponse(messages: ChatMessage[]): AIResponse {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Check if this is a general conversation or strategy request
    const isStrategyRequest = this.isStrategyRequest(lastMessage);
    
    if (!isStrategyRequest) {
      // Handle general conversation
      return this.generateConversationalResponse(lastMessage);
    }
    
    // Generate visual strategy with nodes and connections
    let strategyResponse = '';

    // Enhanced keyword detection for visual strategy generation
    if (lastMessage.includes('rsi') || lastMessage.includes('relative strength') || lastMessage.includes('oversold') || lastMessage.includes('overbought')) {
      strategyResponse = JSON.stringify({
        "message": "I'll create an RSI mean reversion strategy for you!",
        "strategy": {
          "name": "RSI Mean Reversion Strategy",
          "nodes": [
            {
              "id": "data-1",
              "type": "data",
              "label": "Market Data",
              "description": "BTCUSDT 1h data",
              "config": {"symbol": "BTCUSDT", "timeframe": "1h", "source": "close"},
              "position": {"x": 100, "y": 100}
            },
            {
              "id": "rsi-1",
              "type": "indicator",
              "label": "RSI (14)",
              "description": "Relative Strength Index",
              "config": {"indicatorId": "rsi", "parameters": {"length": 14, "source": "close"}},
              "position": {"x": 350, "y": 100}
            },
            {
              "id": "buy-condition",
              "type": "condition",
              "label": "RSI < 30",
              "description": "Buy when oversold",
              "config": {"operator": "less_than", "threshold": 30},
              "position": {"x": 600, "y": 50}
            },
            {
              "id": "sell-condition",
              "type": "condition",
              "label": "RSI > 70",
              "description": "Sell when overbought",
              "config": {"operator": "greater_than", "threshold": 70},
              "position": {"x": 600, "y": 150}
            },
            {
              "id": "buy-action",
              "type": "action",
              "label": "Buy Order",
              "description": "Execute buy order",
              "config": {"orderType": "market", "quantity": "25%"},
              "position": {"x": 850, "y": 50}
            },
            {
              "id": "sell-action",
              "type": "action",
              "label": "Sell Order",
              "description": "Execute sell order",
              "config": {"orderType": "market", "quantity": "100%"},
              "position": {"x": 850, "y": 150}
            }
          ],
          "connections": [
            {"id": "conn-1", "source": "data-1", "target": "rsi-1"},
            {"id": "conn-2", "source": "rsi-1", "target": "buy-condition"},
            {"id": "conn-3", "source": "rsi-1", "target": "sell-condition"},
            {"id": "conn-4", "source": "buy-condition", "target": "buy-action"},
            {"id": "conn-5", "source": "sell-condition", "target": "sell-action"}
          ]
        },
        "suggestions": ["Add stop loss", "Add take profit", "Try different RSI levels"]
      });`;

    } else if (lastMessage.includes('macd') || lastMessage.includes('crossover') || lastMessage.includes('histogram') || lastMessage.includes('signal line')) {
      strategyResponse = JSON.stringify({
        "message": "I'll create a MACD crossover strategy for you!",
        "strategy": {
          "name": "MACD Crossover Strategy",
          "nodes": [
            {
              "id": "data-1",
              "type": "data",
              "label": "Market Data",
              "description": "BTCUSDT 1h data",
              "config": {"symbol": "BTCUSDT", "timeframe": "1h", "source": "close"},
              "position": {"x": 100, "y": 100}
            },
            {
              "id": "macd-1",
              "type": "indicator",
              "label": "MACD (12,26,9)",
              "description": "MACD Crossover",
              "config": {"indicatorId": "macd", "parameters": {"fastLength": 12, "slowLength": 26, "signalLength": 9}},
              "position": {"x": 350, "y": 100}
            },
            {
              "id": "bullish-cross",
              "type": "condition",
              "label": "Bullish Crossover",
              "description": "MACD crosses above signal",
              "config": {"operator": "crosses_above"},
              "position": {"x": 600, "y": 50}
            },
            {
              "id": "bearish-cross",
              "type": "condition",
              "label": "Bearish Crossover",
              "description": "MACD crosses below signal",
              "config": {"operator": "crosses_below"},
              "position": {"x": 600, "y": 150}
            },
            {
              "id": "buy-action",
              "type": "action",
              "label": "Buy Order",
              "description": "Execute buy order",
              "config": {"orderType": "market", "quantity": "50%"},
              "position": {"x": 850, "y": 50}
            },
            {
              "id": "sell-action",
              "type": "action",
              "label": "Sell Order",
              "description": "Execute sell order",
              "config": {"orderType": "market", "quantity": "100%"},
              "position": {"x": 850, "y": 150}
            }
          ],
          "connections": [
            {"id": "conn-1", "source": "data-1", "target": "macd-1"},
            {"id": "conn-2", "source": "macd-1", "target": "bullish-cross"},
            {"id": "conn-3", "source": "macd-1", "target": "bearish-cross"},
            {"id": "conn-4", "source": "bullish-cross", "target": "buy-action"},
            {"id": "conn-5", "source": "bearish-cross", "target": "sell-action"}
          ]
        },
        "suggestions": ["Add trend filter", "Add stop loss", "Try different timeframes"]
      });`;

    } else if (lastMessage.includes('bollinger') || lastMessage.includes('bands') || lastMessage.includes('squeeze')) {
      strategyResponse = JSON.stringify({
        "message": "I'll create a Bollinger Bands mean reversion strategy for you!",
        "strategy": {
          "name": "Bollinger Bands Strategy",
          "nodes": [
            {
              "id": "data-1",
              "type": "data",
              "label": "Market Data",
              "description": "BTCUSDT 1h data",
              "config": {"symbol": "BTCUSDT", "timeframe": "1h", "source": "close"},
              "position": {"x": 100, "y": 100}
            },
            {
              "id": "bb-1",
              "type": "indicator",
              "label": "Bollinger Bands (20,2)",
              "description": "Bollinger Bands",
              "config": {"indicatorId": "bollinger", "parameters": {"length": 20, "multiplier": 2}},
              "position": {"x": 350, "y": 100}
            },
            {
              "id": "lower-touch",
              "type": "condition",
              "label": "Touch Lower Band",
              "description": "Price touches lower band",
              "config": {"operator": "touches_lower"},
              "position": {"x": 600, "y": 50}
            },
            {
              "id": "upper-touch",
              "type": "condition",
              "label": "Touch Upper Band",
              "description": "Price touches upper band",
              "config": {"operator": "touches_upper"},
              "position": {"x": 600, "y": 150}
            },
            {
              "id": "buy-action",
              "type": "action",
              "label": "Buy Order",
              "description": "Execute buy order",
              "config": {"orderType": "market", "quantity": "30%"},
              "position": {"x": 850, "y": 50}
            },
            {
              "id": "sell-action",
              "type": "action",
              "label": "Sell Order",
              "description": "Execute sell order",
              "config": {"orderType": "market", "quantity": "100%"},
              "position": {"x": 850, "y": 150}
            }
          ],
          "connections": [
            {"id": "conn-1", "source": "data-1", "target": "bb-1"},
            {"id": "conn-2", "source": "bb-1", "target": "lower-touch"},
            {"id": "conn-3", "source": "bb-1", "target": "upper-touch"},
            {"id": "conn-4", "source": "lower-touch", "target": "buy-action"},
            {"id": "conn-5", "source": "upper-touch", "target": "sell-action"}
          ]
        },
        "suggestions": ["Add volume filter", "Add RSI confirmation", "Try different BB periods"]
      });`;

    } else if (lastMessage.includes('moving average') || lastMessage.includes('sma') || lastMessage.includes('ema')) {
      strategyResponse = JSON.stringify({
        "message": "I'll create a moving average crossover strategy for you!",
        "strategy": {
          "name": "Moving Average Crossover Strategy",
          "nodes": [
            {
              "id": "data-1",
              "type": "data",
              "label": "Market Data",
              "description": "BTCUSDT 1h data",
              "config": {"symbol": "BTCUSDT", "timeframe": "1h", "source": "close"},
              "position": {"x": 100, "y": 100}
            },
            {
              "id": "sma-fast",
              "type": "indicator",
              "label": "SMA (10)",
              "description": "Fast moving average",
              "config": {"indicatorId": "sma", "parameters": {"length": 10, "source": "close"}},
              "position": {"x": 350, "y": 50}
            },
            {
              "id": "sma-slow",
              "type": "indicator",
              "label": "SMA (20)",
              "description": "Slow moving average",
              "config": {"indicatorId": "sma", "parameters": {"length": 20, "source": "close"}},
              "position": {"x": 350, "y": 150}
            },
            {
              "id": "cross-up",
              "type": "condition",
              "label": "MA Cross Up",
              "description": "Fast MA crosses above slow MA",
              "config": {"operator": "crosses_above"},
              "position": {"x": 600, "y": 50}
            },
            {
              "id": "cross-down",
              "type": "condition",
              "label": "MA Cross Down",
              "description": "Fast MA crosses below slow MA",
              "config": {"operator": "crosses_below"},
              "position": {"x": 600, "y": 150}
            },
            {
              "id": "buy-action",
              "type": "action",
              "label": "Buy Order",
              "description": "Execute buy order",
              "config": {"orderType": "market", "quantity": "50%"},
              "position": {"x": 850, "y": 50}
            },
            {
              "id": "sell-action",
              "type": "action",
              "label": "Sell Order",
              "description": "Execute sell order",
              "config": {"orderType": "market", "quantity": "100%"},
              "position": {"x": 850, "y": 150}
            }
          ],
          "connections": [
            {"id": "conn-1", "source": "data-1", "target": "sma-fast"},
            {"id": "conn-2", "source": "data-1", "target": "sma-slow"},
            {"id": "conn-3", "source": "sma-fast", "target": "cross-up"},
            {"id": "conn-4", "source": "sma-slow", "target": "cross-up"},
            {"id": "conn-5", "source": "sma-fast", "target": "cross-down"},
            {"id": "conn-6", "source": "sma-slow", "target": "cross-down"},
            {"id": "conn-7", "source": "cross-up", "target": "buy-action"},
            {"id": "conn-8", "source": "cross-down", "target": "sell-action"}
          ]
        },
        "suggestions": ["Add trend confirmation", "Add stop loss", "Try EMA instead of SMA"]
      });`;
    }

    // Default strategy if no specific match
    if (!strategyResponse) {
      strategyResponse = JSON.stringify({
        "message": "I'll create a simple EMA crossover strategy for you!",
        "strategy": {
          "name": "Simple EMA Crossover Strategy",
          "nodes": [
            {
              "id": "data-1",
              "type": "data",
              "label": "Market Data",
              "description": "BTCUSDT 1h data",
              "config": {"symbol": "BTCUSDT", "timeframe": "1h", "source": "close"},
              "position": {"x": 100, "y": 100}
            },
            {
              "id": "ema-fast",
              "type": "indicator",
              "label": "EMA (9)",
              "description": "Fast EMA",
              "config": {"indicatorId": "ema", "parameters": {"length": 9, "source": "close"}},
              "position": {"x": 350, "y": 50}
            },
            {
              "id": "ema-slow",
              "type": "indicator",
              "label": "EMA (21)",
              "description": "Slow EMA",
              "config": {"indicatorId": "ema", "parameters": {"length": 21, "source": "close"}},
              "position": {"x": 350, "y": 150}
            },
            {
              "id": "cross-up",
              "type": "condition",
              "label": "EMA Cross Up",
              "description": "Fast EMA crosses above slow EMA",
              "config": {"operator": "crosses_above"},
              "position": {"x": 600, "y": 50}
            },
            {
              "id": "cross-down",
              "type": "condition",
              "label": "EMA Cross Down",
              "description": "Fast EMA crosses below slow EMA",
              "config": {"operator": "crosses_below"},
              "position": {"x": 600, "y": 150}
            },
            {
              "id": "buy-action",
              "type": "action",
              "label": "Buy Order",
              "description": "Execute buy order",
              "config": {"orderType": "market", "quantity": "25%"},
              "position": {"x": 850, "y": 50}
            },
            {
              "id": "sell-action",
              "type": "action",
              "label": "Sell Order",
              "description": "Execute sell order",
              "config": {"orderType": "market", "quantity": "100%"},
              "position": {"x": 850, "y": 150}
            }
          ],
          "connections": [
            {"id": "conn-1", "source": "data-1", "target": "ema-fast"},
            {"id": "conn-2", "source": "data-1", "target": "ema-slow"},
            {"id": "conn-3", "source": "ema-fast", "target": "cross-up"},
            {"id": "conn-4", "source": "ema-slow", "target": "cross-up"},
            {"id": "conn-5", "source": "ema-fast", "target": "cross-down"},
            {"id": "conn-6", "source": "ema-slow", "target": "cross-down"},
            {"id": "conn-7", "source": "cross-up", "target": "buy-action"},
            {"id": "conn-8", "source": "cross-down", "target": "sell-action"}
          ]
        },
        "suggestions": ["Add stop loss", "Add take profit", "Try different EMA periods"]
      });
    }

    return {
      content: strategyResponse,
      model: 'pine-genie-visual',
      usage: {
        promptTokens: messages.reduce((acc, msg) => acc + msg.content.length, 0),
        completionTokens: strategyResponse.length,
        totalTokens: messages.reduce((acc, msg) => acc + msg.content.length, 0) + strategyResponse.length,
      }
    };
  }

  // Get available models
  getAvailableModels(): AIModelConfig[] {
    const models: AIModelConfig[] = [
      {
        id: 'pine-genie',
        name: 'PineGenie AI - Direct Code Generator',
        provider: 'custom'
      }
    ];

    // Add OpenAI models if API key is available
    if (this.openai) {
      models.push(
        {
          id: 'gpt-4',
          name: 'GPT-4 - Advanced Code Generation',
          provider: 'openai'
        },
        {
          id: 'gpt-3.5-turbo',
          name: 'GPT-3.5 Turbo - Fast Code Generation',
          provider: 'openai'
        }
      );
    }

    return models;
  }

  // Method to test if OpenAI is properly configured
  async testOpenAIConnection(): Promise<boolean> {
    if (!this.openai) return false;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      return !!response.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }
}

// Export both class and singleton instance
export { AIService };
export const aiService = new AIService();