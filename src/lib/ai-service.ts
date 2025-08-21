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

export class AIService {
  private openai?: OpenAI;
  private activeModel: string = 'pine-genie';

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize OpenAI if API key is available
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openai = new OpenAI({
        apiKey: openaiKey,
      });
    }
  }

  async generateResponse(
    messages: ChatMessage[],
    modelId: string = 'pine-genie'
  ): Promise<AIResponse> {
    try {
      // ALWAYS use PineGenie for direct code generation
      // This bypasses all external AI models that might ask questions
      return this.generateDirectCodeResponse(messages);

    } catch (error) {
      console.error('AI Service Error:', error);
      return this.generateDirectCodeResponse(messages);
    }
  }

  private generateDirectCodeResponse(messages: ChatMessage[]): AIResponse {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Analyze user input and generate appropriate code immediately
    let codeResponse = '';

    if (lastMessage.includes('rsi') || lastMessage.includes('relative strength')) {
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

    } else if (lastMessage.includes('macd') || lastMessage.includes('crossover')) {
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

  // Get available models - simplified for direct code generation
  getAvailableModels(): AIModelConfig[] {
    return [
      {
        id: 'pine-genie',
        name: 'PineGenie AI - Direct Code Generator',
        provider: 'custom'
      }
    ];
  }
}

// Export singleton instance - Direct code generation only
export const aiService = new AIService();