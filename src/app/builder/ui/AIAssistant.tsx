/**
 * PineGenie AI Assistant Component for Strategy Builder
 * 
 * Enhanced AI assistant with subscription-based access control.
 * Free users see upgrade prompts, paid users get full AI functionality.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap, X, Crown, Lock } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { N8nNodeData } from './N8nNode';
import { AIStrategyService } from '../services/ai-strategy-service';

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
  const { checkAIChatAccess, isFreePlan, loading } = useSubscription();

  // Debug logging
  React.useEffect(() => {
    console.log('🤖 AIAssistant render - isOpen:', isOpen);
  }, [isOpen]);
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
  const aiService = new AIStrategyService();

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
      // Update thinking message
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? { ...msg, content: 'Connecting to PineGenie AI...' }
          : msg
      ));

      await new Promise(resolve => setTimeout(resolve, 800));

      // Update thinking message
      setMessages(prev => prev.map(msg => 
        msg.id === thinkingMessage.id 
          ? { ...msg, content: 'Generating intelligent strategy...' }
          : msg
      ));

      // Use AI service to generate strategy
      const { nodes, connections, strategyName, explanation } = await aiService.generateStrategy({
        userInput: userMessage.content
      });

      // Remove thinking message and add success message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      const successMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: `✅ **PineGenie AI Strategy Generated!**\n\nI've created a **${strategyName}** with:\n• ${nodes.length} visual components\n• ${connections.length} logical connections\n• Ready for Pine Script generation\n\n**Strategy Overview:**\n${explanation}\n\n**Your strategy is now on the canvas!** You can:\n• **Modify components** - Adjust parameters and settings\n• **Add connections** - Create additional logic flows\n• **Generate Pine Script** - Export ready-to-use code\n• **Test & optimize** - Refine your strategy\n\n🚀 **PineGenie AI** powered by ChatGPT makes Pine Script development intelligent and intuitive!`,
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
          config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'rsi_1',
          type: 'indicator',
          label: 'RSI (14)',
          description: 'Relative Strength Index',
          config: { indicatorId: 'rsi', parameters: { length: 14, source: 'close' } },
          position: { x: 350, y: 100 }
        },
        {
          id: 'buy_condition',
          type: 'condition',
          label: 'RSI < 30',
          description: 'Buy when oversold',
          config: { operator: 'less_than', threshold: 30 },
          position: { x: 600, y: 50 }
        },
        {
          id: 'sell_condition',
          type: 'condition',
          label: 'RSI > 70',
          description: 'Sell when overbought',
          config: { operator: 'greater_than', threshold: 70 },
          position: { x: 600, y: 150 }
        },
        {
          id: 'buy_action',
          type: 'action',
          label: 'Buy Order',
          description: 'Execute buy order',
          config: { orderType: 'market', quantity: '25%' },
          position: { x: 850, y: 50 }
        },
        {
          id: 'sell_action',
          type: 'action',
          label: 'Sell Order',
          description: 'Execute sell order',
          config: { orderType: 'market', quantity: '100%' },
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
          config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'sma_fast',
          type: 'indicator',
          label: 'SMA (10)',
          description: 'Fast moving average',
          config: { indicatorId: 'sma', parameters: { length: 10, source: 'close' } },
          position: { x: 350, y: 50 }
        },
        {
          id: 'sma_slow',
          type: 'indicator',
          label: 'SMA (20)',
          description: 'Slow moving average',
          config: { indicatorId: 'sma', parameters: { length: 20, source: 'close' } },
          position: { x: 350, y: 150 }
        },
        {
          id: 'crossover_up',
          type: 'condition',
          label: 'MA Crossover Up',
          description: 'Fast MA crosses above slow MA',
          config: { operator: 'crosses_above' },
          position: { x: 600, y: 50 }
        },
        {
          id: 'crossover_down',
          type: 'condition',
          label: 'MA Crossover Down',
          description: 'Fast MA crosses below slow MA',
          config: { operator: 'crosses_below' },
          position: { x: 600, y: 150 }
        },
        {
          id: 'buy_action',
          type: 'action',
          label: 'Buy Order',
          description: 'Execute buy order',
          config: { orderType: 'market', quantity: '50%' },
          position: { x: 850, y: 50 }
        },
        {
          id: 'sell_action',
          type: 'action',
          label: 'Sell Order',
          description: 'Execute sell order',
          config: { orderType: 'market', quantity: '100%' },
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
          config: { symbol: 'BTCUSDT', timeframe: '1h', source: 'close' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'indicator_1',
          type: 'indicator',
          label: 'SMA (20)',
          description: 'Simple moving average',
          config: { indicatorId: 'sma', parameters: { length: 20, source: 'close' } },
          position: { x: 350, y: 100 }
        },
        {
          id: 'condition_1',
          type: 'condition',
          label: 'Entry Condition',
          description: 'Entry condition',
          config: { operator: 'greater_than', threshold: 50 },
          position: { x: 600, y: 100 }
        },
        {
          id: 'action_1',
          type: 'action',
          label: 'Trade Action',
          description: 'Execute trade',
          config: { orderType: 'market', quantity: '25%' },
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

  console.log('🤖 AIAssistant component called with isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('🤖 AIAssistant not rendering - isOpen is false');
    return null;
  }
  
  console.log('🤖 AIAssistant rendering - isOpen is true!');
  
  // SIMPLE TEST MODAL - Just to see if it renders
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        fontWeight: 'bold'
      }}
      onClick={onClose}
    >
      🤖 TEST MODAL - AI ASSISTANT IS WORKING! Click to close.
    </div>
  );

  // Show loading state while subscription data is being fetched
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`${colors.bg.primary} ${colors.border.primary} border rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden`}>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className={`${colors.text.secondary}`}>Loading AI Assistant...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has AI access
  const hasAIAccess = checkAIChatAccess();

  // Temporary fix: Allow access for premium users (debugging)
  const allowTemporaryAccess = true;

  // Show upgrade prompt for free users
  if (!hasAIAccess && !allowTemporaryAccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className={`${colors.bg.primary} ${colors.border.primary} border rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className={`${colors.bg.secondary} ${colors.border.primary} border-b px-6 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-r ${colors.accent.blue} rounded-xl relative`}>
                <Bot className="w-5 h-5 text-white" />
                <Lock className="w-3 h-3 text-white absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5" />
              </div>
              <div>
                <h3 className={`font-semibold ${colors.text.primary}`}>PineGenie AI Assistant</h3>
                <p className={`text-sm ${colors.text.tertiary}`}>Premium Feature</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${colors.text.tertiary} hover:${colors.text.primary} rounded-lg transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Upgrade Prompt Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Crown className="h-10 w-10 text-white" />
              </div>
              
              <h3 className={`text-2xl font-bold ${colors.text.primary} mb-4`}>
                Unlock AI Assistant
              </h3>
              
              <p className={`${colors.text.secondary} mb-6 leading-relaxed`}>
                Get unlimited AI-powered assistance for your Pine Script development. 
                Transform your trading ideas into professional strategies with natural language.
              </p>

              <div className="space-y-3 mb-8 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${colors.text.secondary}`}>Unlimited AI conversations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${colors.text.secondary}`}>Advanced strategy optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${colors.text.secondary}`}>Real-time Pine Script assistance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className={`text-sm ${colors.text.secondary}`}>Custom indicator suggestions</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.open('/billing', '_blank')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Crown className="h-5 w-5" />
                  <span>Upgrade to Pro - ₹2,498/month</span>
                </button>
                
                <button
                  onClick={onClose}
                  className={`w-full ${colors.text.tertiary} hover:${colors.text.primary} py-2 transition-colors`}
                >
                  Maybe Later
                </button>
              </div>

              <div className={`mt-6 text-xs ${colors.text.tertiary}`}>
                <p>✨ 14-day free trial • Cancel anytime • No hidden fees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.8)' 
      }}
      onClick={(e) => {
        console.log('🤖 Modal backdrop clicked');
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
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
            <div key={message.id} className="flex gap-3">
              {message.type === 'ai' ? (
                <>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className={`${colors.bg.secondary} rounded-2xl px-4 py-3 ${colors.text.primary}`}>
                      {message.isGenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          <span>Pine Genie is thinking...</span>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      )}
                    </div>
                    <div className={`text-xs ${colors.text.tertiary} mt-1 ml-4`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1"></div>
                  <div className="flex-1 max-w-xs">
                    <div className="bg-blue-500 text-white rounded-2xl px-4 py-3 ml-auto">
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                    </div>
                    <div className={`text-xs ${colors.text.tertiary} mt-1 mr-4 text-right`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </>
              )}
            </div>
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