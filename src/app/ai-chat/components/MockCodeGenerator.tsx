'use client';

import { useEffect } from 'react';
import { dispatchCodeGenerated } from '../utils/chat-code-bridge';

// This component is just for demo purposes to simulate code generation
export default function MockCodeGenerator() {
  useEffect(() => {
    // Immediately generate code when component mounts
    setTimeout(() => {
      dispatchCodeGenerated({
        code: generateDefaultStrategy(),
        title: 'Welcome Strategy',
        description: 'Default Pine Script strategy'
      });
    }, 1000);
    
    // Listen for messages that might contain code generation requests
    const handleMessageObserver = () => {
      const messages = document.querySelectorAll('.message-bubble, [class*="message"], [class*="chat-message"]');
      
      if (messages.length > 0) {
        // Get the last message
        const lastMessage = messages[messages.length - 1];
        
        // Check if it's a user message (try different class patterns)
        if (
          lastMessage.classList.contains('justify-end') || 
          lastMessage.classList.contains('user-message') ||
          lastMessage.textContent?.includes('user')
        ) {
          const messageText = lastMessage.textContent?.toLowerCase() || '';
          
          // Check if the message contains keywords related to code generation
          // More permissive check - almost any message will trigger code generation
          if (
            messageText.length > 5 || // Any message with some content
            messageText.includes('hi') ||
            messageText.includes('hello')
          ) {
            // Wait a bit to simulate AI processing
            setTimeout(() => {
              // Generate mock Pine Script code based on the message
              let mockCode = '';
              
              if (messageText.includes('rsi')) {
                mockCode = generateRsiStrategy();
              } else if (messageText.includes('macd')) {
                mockCode = generateMacdStrategy();
              } else if (messageText.includes('moving average') || messageText.includes('ma')) {
                mockCode = generateMovingAverageStrategy();
              } else if (messageText.includes('bollinger')) {
                mockCode = generateBollingerStrategy();
              } else {
                mockCode = generateDefaultStrategy();
              }
              
              // Dispatch the code generated event
              dispatchCodeGenerated({
                code: mockCode,
                title: 'Generated Pine Script Strategy',
                description: 'Based on your request'
              });
            }, 1000);
          }
        }
      }
    };
    
    // Set up a mutation observer to watch for new messages
    const observer = new MutationObserver(handleMessageObserver);
    
    // Start observing the chat container
    const chatContainer = document.querySelector('.flex-1.overflow-y-auto');
    if (chatContainer) {
      observer.observe(chatContainer, { childList: true, subtree: true });
    }
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null;
}

// Mock strategy generators
function generateRsiStrategy() {
  return `//@version=5
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
}

function generateMacdStrategy() {
  return `//@version=5
strategy("MACD Crossover Strategy", overlay=true)

// Input parameters
fastLength = input.int(12, "Fast Length", minval=1)
slowLength = input.int(26, "Slow Length", minval=1)
signalLength = input.int(9, "Signal Length", minval=1)
useTrailingStop = input.bool(true, "Use Trailing Stop")
trailPercent = input.float(1.5, "Trailing Stop %", minval=0.1, step=0.1)

// Calculate MACD
[macdLine, signalLine, histLine] = ta.macd(close, fastLength, slowLength, signalLength)

// Strategy logic
longCondition = ta.crossover(macdLine, signalLine)
shortCondition = ta.crossunder(macdLine, signalLine)

// Execute trades
if (longCondition)
    strategy.entry("MACD Long", strategy.long)
    
if (shortCondition)
    strategy.entry("MACD Short", strategy.short)

// Apply trailing stop if enabled
if (useTrailingStop)
    strategy.exit("TS Long", "MACD Long", trail_points=close * trailPercent/100)
    strategy.exit("TS Short", "MACD Short", trail_points=close * trailPercent/100)

// Plot MACD
plot(macdLine, "MACD Line", color=color.blue)
plot(signalLine, "Signal Line", color=color.orange)
plot(histLine, "Histogram", color=histLine >= 0 ? color.green : color.red, style=plot.style_histogram)`;
}

function generateMovingAverageStrategy() {
  return `//@version=5
strategy("Moving Average Crossover Strategy", overlay=true)

// Input parameters
fastMA = input.int(9, "Fast MA Length", minval=1)
slowMA = input.int(21, "Slow MA Length", minval=1)
maType = input.string("EMA", "MA Type", options=["SMA", "EMA", "WMA"])
takeProfitPercent = input.float(3.0, "Take Profit %", minval=0.1, step=0.1)
stopLossPercent = input.float(2.0, "Stop Loss %", minval=0.1, step=0.1)

// Calculate moving averages based on selected type
fastMAValue = maType == "SMA" ? ta.sma(close, fastMA) : 
              maType == "EMA" ? ta.ema(close, fastMA) : 
              ta.wma(close, fastMA)
              
slowMAValue = maType == "SMA" ? ta.sma(close, slowMA) : 
              maType == "EMA" ? ta.ema(close, slowMA) : 
              ta.wma(close, slowMA)

// Strategy logic
longCondition = ta.crossover(fastMAValue, slowMAValue)
shortCondition = ta.crossunder(fastMAValue, slowMAValue)

// Execute trades with take profit and stop loss
if (longCondition)
    strategy.entry("MA Long", strategy.long)
    strategy.exit("TP/SL Long", "MA Long", profit=takeProfitPercent/100 * close, loss=stopLossPercent/100 * close)
    
if (shortCondition)
    strategy.entry("MA Short", strategy.short)
    strategy.exit("TP/SL Short", "MA Short", profit=takeProfitPercent/100 * close, loss=stopLossPercent/100 * close)

// Plot moving averages
plot(fastMAValue, "Fast MA", color=color.blue)
plot(slowMAValue, "Slow MA", color=color.red)`;
}

function generateBollingerStrategy() {
  return `//@version=5
strategy("Bollinger Bands Strategy", overlay=true)

// Input parameters
bbLength = input.int(20, "BB Length", minval=1)
bbMult = input.float(2.0, "BB Multiplier", minval=0.1, step=0.1)
useRSIFilter = input.bool(true, "Use RSI Filter")
rsiLength = input.int(14, "RSI Length", minval=1)
rsiThreshold = input.int(50, "RSI Threshold", minval=1, maxval=100)

// Calculate Bollinger Bands
[middle, upper, lower] = ta.bb(close, bbLength, bbMult)

// Calculate RSI if filter is enabled
rsiValue = useRSIFilter ? ta.rsi(close, rsiLength) : 50

// Strategy logic
longCondition = close < lower and (not useRSIFilter or rsiValue < rsiThreshold)
shortCondition = close > upper and (not useRSIFilter or rsiValue > rsiThreshold)

// Execute trades
if (longCondition)
    strategy.entry("BB Long", strategy.long)
    
if (shortCondition)
    strategy.entry("BB Short", strategy.short)

// Plot Bollinger Bands
plot(middle, "Middle Band", color=color.yellow)
plot(upper, "Upper Band", color=color.red)
plot(lower, "Lower Band", color=color.green)

// Plot RSI if filter is enabled
if useRSIFilter
    plot(rsiValue, "RSI", color=color.purple)`;
}

function generateDefaultStrategy() {
  return `//@version=5
strategy("PineGenie Strategy", overlay=true)

// Input parameters
fastLength = input.int(12, "Fast Length", minval=1)
slowLength = input.int(26, "Slow Length", minval=1)
signalLength = input.int(9, "Signal Length", minval=1)
rsiLength = input.int(14, "RSI Length", minval=1)
rsiThreshold = input.int(50, "RSI Threshold", minval=1, maxval=100)

// Calculate indicators
[macdLine, signalLine, histLine] = ta.macd(close, fastLength, slowLength, signalLength)
rsiValue = ta.rsi(close, rsiLength)

// Strategy logic
longCondition = ta.crossover(macdLine, signalLine) and rsiValue < rsiThreshold
shortCondition = ta.crossunder(macdLine, signalLine) and rsiValue > rsiThreshold

// Execute trades
if (longCondition)
    strategy.entry("Long", strategy.long)
    
if (shortCondition)
    strategy.entry("Short", strategy.short)

// Apply take profit and stop loss
strategy.exit("TP/SL Long", "Long", profit=3.0/100 * close, loss=2.0/100 * close)
strategy.exit("TP/SL Short", "Short", profit=3.0/100 * close, loss=2.0/100 * close)

// Plot indicators
plot(macdLine, "MACD Line", color=color.blue)
plot(signalLine, "Signal Line", color=color.orange)
plot(histLine, "Histogram", color=histLine >= 0 ? color.green : color.red, style=plot.style_histogram)`;
}