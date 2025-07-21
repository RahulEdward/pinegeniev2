import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Pine Script v6 focused AI responses
    const pineScriptResponse = generatePineScriptResponse(message, conversationHistory);

    return NextResponse.json({
      success: true,
      data: {
        response: pineScriptResponse,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generatePineScriptResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Pine Script v6 specific responses
  if (lowerMessage.includes('rsi') || lowerMessage.includes('relative strength')) {
    return `Here's a Pine Script v6 RSI indicator:

\`\`\`pinescript
//@version=6
indicator("RSI Indicator", shorttitle="RSI", overlay=false)

// Input parameters
rsiLength = input.int(14, title="RSI Length", minval=1)
rsiSource = input.source(close, title="RSI Source")
overbought = input.int(70, title="Overbought Level")
oversold = input.int(30, title="Oversold Level")

// Calculate RSI
rsiValue = ta.rsi(rsiSource, rsiLength)

// Plot RSI
plot(rsiValue, title="RSI", color=color.blue, linewidth=2)

// Plot levels
hline(overbought, title="Overbought", color=color.red, linestyle=hline.style_dashed)
hline(oversold, title="Oversold", color=color.green, linestyle=hline.style_dashed)
hline(50, title="Midline", color=color.gray, linestyle=hline.style_dotted)

// Background coloring
bgcolor(rsiValue > overbought ? color.new(color.red, 90) : rsiValue < oversold ? color.new(color.green, 90) : na)
\`\`\`

This RSI indicator includes:
• Customizable length and source
• Overbought/oversold levels
• Background coloring for signals
• Pine Script v6 syntax

Would you like me to explain any part or add more features?`;
  }

  if (lowerMessage.includes('moving average') || lowerMessage.includes('ma') || lowerMessage.includes('crossover')) {
    return `Here's a Pine Script v6 Moving Average Crossover strategy:

\`\`\`pinescript
//@version=6
strategy("MA Crossover Strategy", overlay=true, default_qty_type=strategy.percent_of_equity, default_qty_value=100)

// Input parameters
fastLength = input.int(9, title="Fast MA Length", minval=1)
slowLength = input.int(21, title="Slow MA Length", minval=1)
maType = input.string("SMA", title="MA Type", options=["SMA", "EMA"])

// Calculate moving averages
fastMA = maType == "SMA" ? ta.sma(close, fastLength) : ta.ema(close, fastLength)
slowMA = maType == "SMA" ? ta.sma(close, slowLength) : ta.ema(close, slowLength)

// Plot moving averages
plot(fastMA, title="Fast MA", color=color.blue, linewidth=2)
plot(slowMA, title="Slow MA", color=color.red, linewidth=2)

// Trading logic
longCondition = ta.crossover(fastMA, slowMA)
shortCondition = ta.crossunder(fastMA, slowMA)

// Execute trades
if longCondition
    strategy.entry("Long", strategy.long)
if shortCondition
    strategy.entry("Short", strategy.short)

// Plot signals
plotshape(longCondition, title="Buy Signal", location=location.belowbar, style=shape.labelup, color=color.green, text="BUY")
plotshape(shortCondition, title="Sell Signal", location=location.abovebar, style=shape.labeldown, color=color.red, text="SELL")
\`\`\`

This strategy features:
• Customizable MA lengths and types
• Buy/sell signals on crossovers
• Visual signal markers
• Full strategy backtesting

Need help with any modifications?`;
  }

  if (lowerMessage.includes('syntax') || lowerMessage.includes('v6') || lowerMessage.includes('version 6')) {
    return `Pine Script v6 Key Syntax Changes:

**1. Version Declaration:**
\`//@version=6\` (must be first line)

**2. New Functions:**
• \`ta.sma()\` instead of \`sma()\`
• \`ta.ema()\` instead of \`ema()\`
• \`ta.rsi()\` instead of \`rsi()\`
• \`ta.crossover()\` instead of \`crossover()\`

**3. Input Functions:**
• \`input.int()\` for integers
• \`input.float()\` for decimals
• \`input.string()\` for text
• \`input.bool()\` for true/false
• \`input.source()\` for price sources

**4. Color System:**
• \`color.new(color.blue, 50)\` for transparency
• \`color.rgb(255, 0, 0)\` for RGB colors

**5. Strategy Functions:**
• \`strategy.entry()\` for opening positions
• \`strategy.close()\` for closing positions
• \`strategy.exit()\` for stop loss/take profit

**Example v6 Structure:**
\`\`\`pinescript
//@version=6
indicator("My Indicator", overlay=true)

length = input.int(20, "Length")
source = input.source(close, "Source")
ma = ta.sma(source, length)

plot(ma, color=color.blue)
\`\`\`

What specific v6 feature would you like to learn more about?`;
  }

  if (lowerMessage.includes('debug') || lowerMessage.includes('error') || lowerMessage.includes('fix')) {
    return `Common Pine Script v6 Debugging Tips:

**1. Version Issues:**
• Always start with \`//@version=6\`
• Update old function names (sma → ta.sma)

**2. Common Errors:**
• **"Cannot call 'sma' with arguments"** → Use \`ta.sma()\`
• **"Undeclared identifier"** → Check variable names
• **"line 2: Syntax error"** → Missing //@version=6

**3. Debugging Techniques:**
\`\`\`pinescript
// Use plotchar for debugging values
plotchar(myVariable, "Debug", "●", location.top)

// Use bgcolor for condition testing
bgcolor(myCondition ? color.yellow : na)

// Use labels for complex debugging
if barstate.islast
    label.new(bar_index, high, str.tostring(myValue))
\`\`\`

**4. Performance Tips:**
• Avoid repainting with \`barstate.isconfirmed\`
• Use \`var\` for variables that don't change every bar
• Limit historical referencing with \`[]\`

**5. Testing Strategy:**
• Use \`strategy.backtesting\` for historical testing
• Check \`strategy.position_size\` for position info
• Monitor \`strategy.equity\` for performance

Share your specific error message and I'll help you fix it!`;
  }

  if (lowerMessage.includes('strategy') || lowerMessage.includes('trading')) {
    return `Pine Script v6 Strategy Development Guide:

**1. Basic Strategy Structure:**
\`\`\`pinescript
//@version=6
strategy("My Strategy", overlay=true, 
         default_qty_type=strategy.percent_of_equity, 
         default_qty_value=10)

// Your trading logic here
longCondition = close > ta.sma(close, 20)
shortCondition = close < ta.sma(close, 20)

if longCondition
    strategy.entry("Long", strategy.long)
if shortCondition
    strategy.entry("Short", strategy.short)
\`\`\`

**2. Risk Management:**
\`\`\`pinescript
// Stop Loss & Take Profit
strategy.exit("Exit Long", "Long", 
              stop=close * 0.95, 
              limit=close * 1.05)
\`\`\`

**3. Position Sizing:**
• \`strategy.percent_of_equity\` - Percentage of equity
• \`strategy.fixed\` - Fixed quantity
• \`strategy.cash\` - Fixed cash amount

**4. Strategy Testing:**
• Backtest on historical data
• Check drawdown and win rate
• Optimize parameters carefully

**5. Common Strategy Patterns:**
• Mean reversion
• Trend following  
• Breakout strategies
• Multi-timeframe analysis

What type of strategy are you looking to build?`;
  }

  // Default response for general queries
  return `I'm Pine Genie AI, specialized in Pine Script v6 development! 

I can help you with:

🔧 **Code Generation**
• Creating indicators and strategies
• Converting trading ideas to Pine Script
• Updating v4/v5 code to v6

📚 **Learning & Debugging**
• Explaining Pine Script concepts
• Fixing syntax errors
• Performance optimization

📈 **Trading Development**
• Strategy backtesting
• Risk management
• Signal generation

**Popular Topics:**
• RSI indicators
• Moving average strategies  
• Bollinger Bands
• MACD signals
• Custom alerts

Try asking me something like:
• "Create a Bollinger Bands indicator"
• "Help me debug this Pine Script error"
• "Convert my trading idea to Pine Script v6"
• "Explain Pine Script v6 syntax changes"

What would you like to work on today?`;
}