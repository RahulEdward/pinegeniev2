// AI Service for real AI model integration
import OpenAI from 'openai';

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
        console.log('Using OpenAI API...');
        return await this.generateOpenAIResponse(messages, modelId);
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

  private generateDirectCodeResponse(messages: ChatMessage[]): AIResponse {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Analyze user input and generate appropriate code immediately
    let codeResponse = '';

    // Enhanced keyword detection for better code generation
    if (lastMessage.includes('rsi') || lastMessage.includes('relative strength') || lastMessage.includes('oversold') || lastMessage.includes('overbought')) {
      codeResponse = `\`\`\`pinescript
//@version=6
strategy("RSI Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Input parameters
rsiLength = input.int(14, title="RSI Length", minval=1)
oversoldLevel = input.int(30, title="Oversold Level", minval=1, maxval=50)
overboughtLevel = input.int(70, title="Overbought Level", minval=50, maxval=99)
stopLossPercent = input.float(2.0, title="Stop Loss %", minval=0.1, maxval=10.0)
takeProfitPercent = input.float(4.0, title="Take Profit %", minval=0.1, maxval=20.0)

// Calculate RSI
rsiValue = ta.rsi(close, rsiLength)

// Trading conditions
longCondition = ta.crossover(rsiValue, oversoldLevel)
shortCondition = ta.crossunder(rsiValue, overboughtLevel)

// Execute trades
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=close * (1 - stopLossPercent/100), limit=close * (1 + takeProfitPercent/100))

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=close * (1 + stopLossPercent/100), limit=close * (1 - takeProfitPercent/100))

// Plot RSI
plot(rsiValue, title="RSI", color=color.blue, linewidth=2)
hline(overboughtLevel, title="Overbought", color=color.red, linestyle=hline.style_dashed)
hline(oversoldLevel, title="Oversold", color=color.green, linestyle=hline.style_dashed)

// Plot signals
plotshape(longCondition, title="Buy Signal", location=location.belowbar, style=shape.labelup, color=color.green, text="BUY")
plotshape(shortCondition, title="Sell Signal", location=location.abovebar, style=shape.labeldown, color=color.red, text="SELL")
\`\`\`

**RSI Mean Reversion Strategy** - Buy oversold, sell overbought with 2% SL and 4% TP.`;

    } else if (lastMessage.includes('macd') || lastMessage.includes('crossover') || lastMessage.includes('histogram') || lastMessage.includes('signal line')) {
      codeResponse = `\`\`\`pinescript
//@version=6
strategy("MACD Crossover Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=15)

// MACD Parameters
fastLength = input.int(12, title="Fast Length", minval=1)
slowLength = input.int(26, title="Slow Length", minval=1)
signalLength = input.int(9, title="Signal Length", minval=1)
stopLossPercent = input.float(3.0, title="Stop Loss %", minval=0.1, maxval=10.0)
takeProfitPercent = input.float(6.0, title="Take Profit %", minval=0.1, maxval=20.0)

// Calculate MACD
[macdLine, signalLine, histogramLine] = ta.macd(close, fastLength, slowLength, signalLength)

// Trading Conditions
bullishCrossover = ta.crossover(macdLine, signalLine)
bearishCrossover = ta.crossunder(macdLine, signalLine)

// Execute Trades
if bullishCrossover
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", 
                  stop=close * (1 - stopLossPercent/100), 
                  limit=close * (1 + takeProfitPercent/100))

if bearishCrossover
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", 
                  stop=close * (1 + stopLossPercent/100), 
                  limit=close * (1 - takeProfitPercent/100))

// Plot MACD
plot(macdLine, title="MACD Line", color=color.blue, linewidth=2)
plot(signalLine, title="Signal Line", color=color.red, linewidth=2)
plot(histogramLine, title="Histogram", color=color.gray, style=plot.style_histogram)
hline(0, title="Zero Line", color=color.black, linestyle=hline.style_solid)

// Plot signals
plotshape(bullishCrossover, title="Buy Signal", location=location.belowbar, style=shape.labelup, color=color.green, text="BUY")
plotshape(bearishCrossover, title="Sell Signal", location=location.abovebar, style=shape.labeldown, color=color.red, text="SELL")
\`\`\`

**MACD Crossover Strategy** - Trend following with 3% SL and 6% TP.`;

    } else if (lastMessage.includes('bollinger') || lastMessage.includes('bands') || lastMessage.includes('squeeze')) {
      codeResponse = `\`\`\`pinescript
//@version=6
strategy("Bollinger Bands Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Bollinger Bands Parameters
length = input.int(20, title="BB Length", minval=1)
mult = input.float(2.0, title="BB Multiplier", minval=0.1, maxval=5.0)
stopLossPercent = input.float(2.5, title="Stop Loss %", minval=0.1, maxval=10.0)
takeProfitPercent = input.float(5.0, title="Take Profit %", minval=0.1, maxval=20.0)

// Calculate Bollinger Bands
basis = ta.sma(close, length)
dev = mult * ta.stdev(close, length)
upper = basis + dev
lower = basis - dev

// Trading Conditions
longCondition = ta.crossover(close, lower)
shortCondition = ta.crossunder(close, upper)

// Execute Trades
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=close * (1 - stopLossPercent/100), limit=close * (1 + takeProfitPercent/100))

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=close * (1 + stopLossPercent/100), limit=close * (1 - takeProfitPercent/100))

// Plot Bollinger Bands
plot(basis, title="Middle Band", color=color.blue, linewidth=2)
plot(upper, title="Upper Band", color=color.red, linewidth=1)
plot(lower, title="Lower Band", color=color.green, linewidth=1)
fill(plot(upper), plot(lower), color=color.gray, transp=90)

// Plot signals
plotshape(longCondition, title="Buy Signal", location=location.belowbar, style=shape.labelup, color=color.green, text="BUY")
plotshape(shortCondition, title="Sell Signal", location=location.abovebar, style=shape.labeldown, color=color.red, text="SELL")
\`\`\`

**Bollinger Bands Mean Reversion** - Buy at lower band, sell at upper band.`;

    } else if (lastMessage.includes('moving average') || lastMessage.includes('sma') || lastMessage.includes('ema')) {
      codeResponse = `\`\`\`pinescript
//@version=6
strategy("Moving Average Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=12)

// MA Parameters
shortMA = input.int(10, title="Short MA Period", minval=1)
longMA = input.int(30, title="Long MA Period", minval=1)
maType = input.string("EMA", title="MA Type", options=["SMA", "EMA"])
stopLossPercent = input.float(2.0, title="Stop Loss %", minval=0.1, maxval=10.0)
takeProfitPercent = input.float(4.0, title="Take Profit %", minval=0.1, maxval=20.0)

// Calculate Moving Averages
shortMAValue = maType == "EMA" ? ta.ema(close, shortMA) : ta.sma(close, shortMA)
longMAValue = maType == "EMA" ? ta.ema(close, longMA) : ta.sma(close, longMA)

// Trading Conditions
longCondition = ta.crossover(shortMAValue, longMAValue) and close > longMAValue
shortCondition = ta.crossunder(shortMAValue, longMAValue) and close < longMAValue

// Execute Trades
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=close * (1 - stopLossPercent/100), limit=close * (1 + takeProfitPercent/100))

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=close * (1 + stopLossPercent/100), limit=close * (1 - takeProfitPercent/100))

// Plot MAs
plot(shortMAValue, title="Short MA", color=color.blue, linewidth=2)
plot(longMAValue, title="Long MA", color=color.red, linewidth=2)

// Plot signals
plotshape(longCondition, title="Buy Signal", location=location.belowbar, style=shape.labelup, color=color.green, text="BUY")
plotshape(shortCondition, title="Sell Signal", location=location.abovebar, style=shape.labeldown, color=color.red, text="SELL")
\`\`\`

**Moving Average Crossover** - Classic trend following with MA confirmation.`;

    } else {
      // Default strategy for any other input
      codeResponse = `\`\`\`pinescript
//@version=6
strategy("Simple Trading Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=10)

// Input Parameters
fastLength = input.int(9, title="Fast EMA Length", minval=1)
slowLength = input.int(21, title="Slow EMA Length", minval=1)
stopLossPercent = input.float(2.0, title="Stop Loss %", minval=0.1, maxval=10.0)
takeProfitPercent = input.float(4.0, title="Take Profit %", minval=0.1, maxval=20.0)

// Calculate EMAs
fastEMA = ta.ema(close, fastLength)
slowEMA = ta.ema(close, slowLength)

// Trading Conditions
longCondition = ta.crossover(fastEMA, slowEMA)
shortCondition = ta.crossunder(fastEMA, slowEMA)

// Execute Trades
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", stop=close * (1 - stopLossPercent/100), limit=close * (1 + takeProfitPercent/100))

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", stop=close * (1 + stopLossPercent/100), limit=close * (1 - takeProfitPercent/100))

// Plot EMAs
plot(fastEMA, title="Fast EMA", color=color.blue, linewidth=2)
plot(slowEMA, title="Slow EMA", color=color.red, linewidth=2)

// Plot Signals
plotshape(longCondition, title="Buy Signal", location=location.belowbar, style=shape.labelup, color=color.green, text="BUY")
plotshape(shortCondition, title="Sell Signal", location=location.abovebar, style=shape.labeldown, color=color.red, text="SELL")
\`\`\`

**EMA Crossover Strategy** - Fast EMA crosses slow EMA with 2% SL and 4% TP.`;
    }

    return {
      content: codeResponse,
      model: 'pine-genie-direct',
      usage: {
        promptTokens: messages.reduce((acc, msg) => acc + msg.content.length, 0),
        completionTokens: codeResponse.length,
        totalTokens: messages.reduce((acc, msg) => acc + msg.content.length, 0) + codeResponse.length,
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