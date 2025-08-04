/**
 * PineGenie AI Assistant Component for Strategy Builder
 * 
 * Enhanced AI assistant using the professional chat UI components
 * from the ai-chat system for a consistent user experience.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap, X } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import AIMessage from '../../ai-chat/components/AIMessage';
import UserMessage from '../../ai-chat/components/UserMessage';
import '../../ai-chat/styles/claude-interface.css';
// Simplified AI system for demonstration
// import { strategyInterpreter } from '../../../agents/pinegenie-ai/interpreter';
// import { NaturalLanguageProcessor } from '../../../agents/pinegenie-ai/nlp/natural-language-processor';
import { N8nNodeData } from './N8nNode';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onStrategyGenerated: (nodes: N8nNodeData[], connections: any[]) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isGenerating?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  onStrategyGenerated
}) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm **PineGenie AI**, your intelligent trading strategy assistant. I can help you create professional Pine Script strategies through natural language.\n\n**What I can do:**\n• Transform your trading ideas into visual strategy components\n• Generate complete Pine Script code ready for TradingView\n• Create strategies with proper risk management\n• Optimize indicator parameters and logic\n\n**Try these examples:**\n• *\"Create an RSI mean reversion strategy\"*\n• *\"Build a moving average crossover with SMAs\"*\n• *\"Make a Bollinger Bands breakout strategy\"*\n• *\"Design a MACD signal strategy\"*\n\nDescribe your trading strategy in plain English, and I'll build it visually on your canvas!",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const nlpProcessor = new NaturalLanguageProcessor();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: 'Analyzing your strategy request...',
      timestamp: new Date(),
      isGenerating: true
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Simulate AI processing with a simple demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update thinking message
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? { ...msg, content: 'Generating visual strategy...' }
          : msg
      ));

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate demo strategy based on keywords
      const { nodes, connections, strategyName } = generateDemoStrategy(userMessage.content);

      // Remove thinking message and add success message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      const successMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: `✅ **PineGenie AI Strategy Generated!**\n\nI've created a **${strategyName}** with:\n• ${nodes.length} visual components\n• ${connections.length} logical connections\n• Ready for Pine Script generation\n\n**Your strategy is now on the canvas!** You can:\n• **Modify components** - Adjust parameters and settings\n• **Add connections** - Create additional logic flows\n• **Generate Pine Script** - Export ready-to-use code\n• **Test & optimize** - Refine your strategy\n\n🚀 **PineGenie AI** makes Pine Script development intuitive and powerful!`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, successMessage]);

      // Add strategy to canvas
      onStrategyGenerated(nodes, connections);

    } catch (error) {
      // Remove thinking message and add error message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      const errorMessage: ChatMessage = {
        id: (Date.now() + 3).toString(),
        type: 'ai',
        content: `❌ **PineGenie AI couldn't process that request.**\n\n${error instanceof Error ? error.message : 'Unknown error occurred'}\n\n**Try these proven strategies:**\n• *\"Create an RSI mean reversion strategy\"*\n• *\"Build a moving average crossover\"*\n• *\"Make a simple trend following strategy\"*\n\n**💡 Tip:** Be specific about indicators, entry/exit conditions, and timeframes for best results.\n\n🤖 **PineGenie AI** is continuously learning to understand more trading concepts!`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateDemoStrategy = (userInput: string): {
    nodes: N8nNodeData[];
    connections: any[];
    strategyName: string;
  } => {
    const input = userInput.toLowerCase();
    let nodes: N8nNodeData[] = [];
    let connections: any[] = [];
    let strategyName = 'Demo Strategy';

    // Generate different strategies based on keywords
    if (input.includes('rsi')) {
      strategyName = 'RSI Mean Reversion Strategy';
      nodes = [
        {
          id: 'data_1',
          type: 'data',
          label: 'Market Data',
          description: 'BTCUSDT 1h data',
          props: { symbol: 'BTCUSDT', timeframe: '1h' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'rsi_1',
          type: 'indicator',
          label: 'RSI (14)',
          description: 'Relative Strength Index',
          props: { indicatorId: 'rsi', length: 14, source: 'close' },
          position: { x: 350, y: 100 }
        },
        {
          id: 'buy_condition',
          type: 'condition',
          label: 'RSI < 30',
          description: 'Buy when oversold',
          props: { operator: 'less_than', value: 30 },
          position: { x: 600, y: 50 }
        },
        {
          id: 'sell_condition',
          type: 'condition',
          label: 'RSI > 70',
          description: 'Sell when overbought',
          props: { operator: 'greater_than', value: 70 },
          position: { x: 600, y: 150 }
        },
        {
          id: 'buy_action',
          type: 'action',
          label: 'Buy Order',
          description: 'Execute buy order',
          props: { orderType: 'market', quantity: '25%' },
          position: { x: 850, y: 50 }
        },
        {
          id: 'sell_action',
          type: 'action',
          label: 'Sell Order',
          description: 'Execute sell order',
          props: { orderType: 'market', quantity: '100%' },
          position: { x: 850, y: 150 }
        }
      ];
      connections = [
        { id: 'conn_1', source: 'data_1', target: 'rsi_1' },
        { id: 'conn_2', source: 'rsi_1', target: 'buy_condition' },
        { id: 'conn_3', source: 'rsi_1', target: 'sell_condition' },
        { id: 'conn_4', source: 'buy_condition', target: 'buy_action' },
        { id: 'conn_5', source: 'sell_condition', target: 'sell_action' }
      ];
    } else if (input.includes('moving average') || input.includes('ma') || input.includes('sma')) {
      strategyName = 'Moving Average Crossover Strategy';
      nodes = [
        {
          id: 'data_1',
          type: 'data',
          label: 'Market Data',
          description: 'BTCUSDT 1h data',
          props: { symbol: 'BTCUSDT', timeframe: '1h' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'sma_fast',
          type: 'indicator',
          label: 'SMA (10)',
          description: 'Fast moving average',
          props: { indicatorId: 'sma', length: 10, source: 'close' },
          position: { x: 350, y: 50 }
        },
        {
          id: 'sma_slow',
          type: 'indicator',
          label: 'SMA (20)',
          description: 'Slow moving average',
          props: { indicatorId: 'sma', length: 20, source: 'close' },
          position: { x: 350, y: 150 }
        },
        {
          id: 'crossover_up',
          type: 'condition',
          label: 'MA Crossover Up',
          description: 'Fast MA crosses above slow MA',
          props: { type: 'crossover_up' },
          position: { x: 600, y: 50 }
        },
        {
          id: 'crossover_down',
          type: 'condition',
          label: 'MA Crossover Down',
          description: 'Fast MA crosses below slow MA',
          props: { type: 'crossover_down' },
          position: { x: 600, y: 150 }
        },
        {
          id: 'buy_action',
          type: 'action',
          label: 'Buy Order',
          description: 'Execute buy order',
          props: { orderType: 'market', quantity: '50%' },
          position: { x: 850, y: 50 }
        },
        {
          id: 'sell_action',
          type: 'action',
          label: 'Sell Order',
          description: 'Execute sell order',
          props: { orderType: 'market', quantity: '100%' },
          position: { x: 850, y: 150 }
        }
      ];
      connections = [
        { id: 'conn_1', source: 'data_1', target: 'sma_fast' },
        { id: 'conn_2', source: 'data_1', target: 'sma_slow' },
        { id: 'conn_3', source: 'sma_fast', target: 'crossover_up' },
        { id: 'conn_4', source: 'sma_slow', target: 'crossover_up' },
        { id: 'conn_5', source: 'sma_fast', target: 'crossover_down' },
        { id: 'conn_6', source: 'sma_slow', target: 'crossover_down' },
        { id: 'conn_7', source: 'crossover_up', target: 'buy_action' },
        { id: 'conn_8', source: 'crossover_down', target: 'sell_action' }
      ];
    } else {
      // Default simple strategy
      strategyName = 'Simple Demo Strategy';
      nodes = [
        {
          id: 'data_1',
          type: 'data',
          label: 'Market Data',
          description: 'BTCUSDT 1h data',
          props: { symbol: 'BTCUSDT', timeframe: '1h' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'indicator_1',
          type: 'indicator',
          label: 'SMA (20)',
          description: 'Simple moving average',
          props: { indicatorId: 'sma', length: 20, source: 'close' },
          position: { x: 350, y: 100 }
        },
        {
          id: 'condition_1',
          type: 'condition',
          label: 'Entry Condition',
          description: 'Entry condition',
          props: {},
          position: { x: 600, y: 100 }
        },
        {
          id: 'action_1',
          type: 'action',
          label: 'Trade Action',
          description: 'Execute trade',
          props: {},
          position: { x: 850, y: 100 }
        }
      ];
      connections = [
        { id: 'conn_1', source: 'data_1', target: 'indicator_1' },
        { id: 'conn_2', source: 'indicator_1', target: 'condition_1' },
        { id: 'conn_3', source: 'condition_1', target: 'action_1' }
      ];
    }

    return { nodes, connections, strategyName };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${colors.bg.primary} ${colors.border.primary} border rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`${colors.bg.secondary} ${colors.border.primary} border-b px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-gradient-to-r ${colors.accent.blue} rounded-xl`}>
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`font-semibold ${colors.text.primary}`}>PineGenie AI</h3>
              <p className={`text-sm ${colors.text.tertiary}`}>Intelligent Pine Script Strategy Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${colors.text.tertiary} hover:${colors.text.primary} rounded-lg transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            message.type === 'ai' ? (
              <AIMessage
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
                isLoading={message.isGenerating}
              />
            ) : (
              <UserMessage
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
              />
            )
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`${colors.bg.secondary} ${colors.border.primary} border-t p-4`}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your Pine Script strategy... (e.g., 'Create an RSI strategy with 30/70 levels')"
                className={`w-full ${colors.bg.primary} ${colors.border.secondary} border rounded-xl px-4 py-3 ${colors.text.primary} placeholder-${colors.text.tertiary} resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                rows={2}
                disabled={isProcessing}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isProcessing}
              className={`px-4 py-3 bg-gradient-to-r ${colors.accent.blue} text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2`}
            >
              {isProcessing ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className={`flex items-center gap-2 ${colors.text.tertiary}`}>
              <Zap className="w-3 h-3" />
              <span>Powered by PineGenie AI</span>
            </div>
            <div className={`${colors.text.tertiary}`}>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;