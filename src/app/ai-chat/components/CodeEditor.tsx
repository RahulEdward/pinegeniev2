'use client';

import { useState } from 'react';

interface CodeEditorProps {
  initialCode?: string;
}

export default function CodeEditor({ initialCode = '' }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode || `// Pine Script Strategy
//@version=5
strategy("PineGenie Strategy", overlay=true)

// Define inputs
fastLength = input(12, "Fast Length")
slowLength = input(26, "Slow Length")
signalLength = input(9, "Signal Length")

// Calculate indicators
[macdLine, signalLine, histLine] = ta.macd(close, fastLength, slowLength, signalLength)

// Define strategy logic
longCondition = ta.crossover(macdLine, signalLine)
shortCondition = ta.crossunder(macdLine, signalLine)

// Execute strategy
if (longCondition)
    strategy.entry("Long", strategy.long)
    
if (shortCondition)
    strategy.entry("Short", strategy.short)

// Plot indicators
plot(macdLine, "MACD Line", color=color.blue)
plot(signalLine, "Signal Line", color=color.orange)
plot(histLine, "Histogram", color=histLine >= 0 ? color.green : color.red, style=plot.style_histogram)`);

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