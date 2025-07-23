'use client';

import { useState } from 'react';

const DEFAULT_CODE = `// Pine Script RSI Strategy
//@version=5
strategy("RSI Strategy", overlay=true)

// Input parameters
rsiLength = input.int(14, "RSI Length", minval=1)
rsiOverbought = input.int(70, "RSI Overbought Level", minval=50, maxval=100)
rsiOversold = input.int(30, "RSI Oversold Level", minval=0, maxval=50)
useStopLoss = input.bool(true, "Use Stop Loss")
stopLossPercent = input.float(2.0, "Stop Loss %", minval=0.1, step=0.1)

// Calculate RSI
rsiValue = ta.rsi(close, rsiLength)

// Strategy logic
longCondition = ta.crossover(rsiValue, rsiOversold)
shortCondition = ta.crossunder(rsiValue, rsiOverbought)

// Execute trades
if (longCondition)
    strategy.entry("RSI Long", strategy.long)
    
if (shortCondition)
    strategy.entry("RSI Short", strategy.short)

// Apply stop loss if enabled
if (useStopLoss)
    strategy.exit("SL Long", "RSI Long", loss=stopLossPercent/100 * close)
    strategy.exit("SL Short", "RSI Short", loss=stopLossPercent/100 * close)

// Plot RSI
hline(rsiOverbought, "Overbought", color=color.red)
hline(rsiOversold, "Oversold", color=color.green)
plot(rsiValue, "RSI", color=color.blue)`;

export default function SimpleCodeEditor() {
  const [code, setCode] = useState(DEFAULT_CODE);
  
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Pine Script Editor</h2>
      </div>
      <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <pre className="text-sm font-mono h-full overflow-auto">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}