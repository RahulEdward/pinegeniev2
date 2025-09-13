/**
 * Enhanced PineGenie AI Assistant Component for Strategy Builder
 * 
 * Features:
 * - Multiple AI model support (ChatGPT-4, GPT-3.5, PineGenie AI)
 * - Real-time strategy generation
 * - Visual component creation
 * - Pine Script code generation
 * - Subscription-based access control
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap, X, Crown, Lock, Settings, ChevronDown } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useSubscription } from '@/hooks/useSubscription';
import { FeatureAccessGate } from '@/components/subscription';
import { N8nNodeData } from './N8nNode';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  tier: 'free' | 'paid';
  description: string;
  maxTokens: number;
}

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
  model?: string;
  strategy?: {
    name: string;
    nodes: N8nNodeData[];
    connections: any[];
    pineScript?: string;
  };
  suggestions?: string[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onClose,
  onStrategyGenerated
}) => {
  const { colors } = useTheme();
  const { checkAIChatAccess, isFreePlan, loading } = useSubscription();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! I'm **PineGenie AI**, your intelligent trading strategy assistant powered by advanced AI models. I can help you create professional Pine Script strategies through natural language.\n\n**🚀 Enhanced Capabilities:**\n• **Multi-Model Support**: Choose from ChatGPT-4, GPT-3.5, or PineGenie AI\n• **Visual Strategy Building**: Transform ideas into interactive components\n• **Complete Pine Script Generation**: Ready-to-use TradingView code\n• **Real-time Strategy Analysis**: Intelligent optimization suggestions\n\n**💡 Try these examples:**\n• *\"Create an RSI mean reversion strategy with 30/70 levels\"*\n• *\"Build a MACD crossover strategy with stop loss\"*\n• *\"Make a Bollinger Bands squeeze breakout strategy\"*\n• *\"Design a multi-timeframe trend following system\"*\n\n**🎯 Pro Tip**: Be specific about entry/exit rules, risk management, and timeframes for best results!\n\nSelect your preferred AI model and describe your trading strategy!",
      timestamp: new Date(),
      model: 'PineGenie AI'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showModelSelector) {
        setShowModelSelector(false);
      }
    };

    if (showModelSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModelSelector]);

  // Load available AI models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const response = await fetch('/api/builder/ai-assistant');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAvailableModels(data.models);
          }
        }
      } catch (error) {
        console.error('Failed to load AI models:', error);
        // Fallback models
        setAvailableModels([
          {
            id: 'pine-genie',
            name: 'PineGenie AI',
            provider: 'Custom',
            tier: 'free',
            description: 'Specialized Pine Script AI assistant',
            maxTokens: 4096
          }
        ]);
      }
    };

    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

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
      content: `🤖 **${availableModels.find(m => m.id === selectedModel)?.name || 'AI'}** is analyzing your strategy request...`,
      timestamp: new Date(),
      isGenerating: true,
      model: selectedModel
    };

    setMessages(prev => [...prev, thinkingMessage]);

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages
        .filter(msg => msg.type === 'user' || (msg.type === 'ai' && !msg.isGenerating))
        .map(msg => ({
          role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.content
        }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: userMessage.content
      });

      // Call the enhanced AI API
      const response = await fetch('/api/builder/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          modelId: selectedModel,
          context: {
            currentNodes: [], // Could be passed from parent component
            currentConnections: [],
            strategyType: 'general'
          }
        })
      });

      const data = await response.json();

      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      if (data.success && data.response) {
        const aiResponse = data.response;
        
        // Create AI response message
        const aiMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: aiResponse.message,
          timestamp: new Date(),
          model: data.model,
          strategy: aiResponse.strategy,
          suggestions: aiResponse.suggestions
        };

        setMessages(prev => [...prev, aiMessage]);

        // If strategy was generated, add it to canvas
        if (aiResponse.strategy && aiResponse.strategy.nodes) {
          onStrategyGenerated(aiResponse.strategy.nodes, aiResponse.strategy.connections || []);
        }

      } else {
        // Handle API error with fallback
        const fallbackResponse = data.fallback || {
          message: "I'm having trouble processing your request. Please try again with a simpler description.",
          suggestions: ["Try using specific indicator names", "Describe entry and exit conditions clearly"]
        };

        const errorMessage: ChatMessage = {
          id: (Date.now() + 3).toString(),
          type: 'ai',
          content: `⚠️ **Connection Issue**\n\n${fallbackResponse.message}`,
          timestamp: new Date(),
          model: selectedModel,
          suggestions: fallbackResponse.suggestions
        };

        setMessages(prev => [...prev, errorMessage]);
      }

    } catch (error) {
      // Remove thinking message and add error message
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));

      console.error('AI Assistant Error:', error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 4).toString(),
        type: 'ai',
        content: `❌ **Network Error**\n\nUnable to connect to AI service. Please check your connection and try again.\n\n**Quick Fallback Strategies:**\n• Use the manual component library in the sidebar\n• Try the Pine Script templates\n• Check the strategy examples in the documentation\n\n💡 **Tip**: The AI assistant works best with a stable internet connection.`,
        timestamp: new Date(),
        model: selectedModel
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

  if (!isOpen) return null;

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

  // Show upgrade prompt for free users
  if (!hasAIAccess) {
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
                  <span>Upgrade to Pro - ₹24.99/month</span>
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
              <p className={`text-sm ${colors.text.tertiary}`}>Enhanced with Multiple AI Models</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className={`flex items-center gap-2 px-3 py-2 ${colors.bg.tertiary} ${colors.border.secondary} border rounded-lg ${colors.text.secondary} hover:${colors.text.primary} transition-colors`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {availableModels.find(m => m.id === selectedModel)?.name || 'Select Model'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showModelSelector && (
                <div className={`absolute top-full right-0 mt-2 w-64 ${colors.bg.primary} ${colors.border.primary} border rounded-xl shadow-2xl z-10 overflow-hidden`}>
                  <div className={`px-4 py-3 ${colors.bg.secondary} ${colors.border.primary} border-b`}>
                    <h4 className={`font-semibold ${colors.text.primary} text-sm`}>Select AI Model</h4>
                    <p className={`text-xs ${colors.text.tertiary} mt-1`}>Choose your preferred AI assistant</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {availableModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelSelector(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:${colors.bg.tertiary} transition-colors ${
                          selectedModel === model.id ? `${colors.bg.tertiary}` : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-medium ${colors.text.primary} text-sm`}>
                              {model.name}
                            </div>
                            <div className={`text-xs ${colors.text.tertiary} mt-1`}>
                              {model.description}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              model.tier === 'free' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {model.tier}
                            </span>
                            {selectedModel === model.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 ${colors.text.tertiary} hover:${colors.text.primary} rounded-lg transition-colors`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'ai' ? (
                <div>
                  {/* AI Message */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-2 bg-gradient-to-r ${colors.accent.blue} rounded-lg flex-shrink-0`}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`${colors.bg.secondary} rounded-2xl p-4 ${colors.text.primary}`}>
                        {message.isGenerating ? (
                          <div className="flex items-center gap-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className={colors.text.secondary}>{message.content}</span>
                          </div>
                        ) : (
                          <div 
                            className="prose prose-sm max-w-none"
                            style={{ color: '#e6edf3' }}
                            dangerouslySetInnerHTML={{ 
                              __html: message.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/\n/g, '<br>')
                            }} 
                          />
                        )}
                      </div>
                      <div className={`text-xs ${colors.text.tertiary} mt-1 ml-4`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Model and Strategy Info */}
                  {message.model && !message.isGenerating && (
                    <div className={`ml-12 mb-2 flex items-center gap-4 text-xs ${colors.text.tertiary}`}>
                      <div className="flex items-center gap-1">
                        <Bot className="w-3 h-3" />
                        <span>Generated by {message.model}</span>
                      </div>
                      {message.strategy && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Strategy: {message.strategy.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className={`ml-12 mt-3 p-3 ${colors.bg.tertiary} rounded-lg`}>
                      <div className={`text-sm font-medium ${colors.text.primary} mb-2`}>💡 Suggestions:</div>
                      <ul className={`text-sm ${colors.text.secondary} space-y-1`}>
                        {message.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                /* User Message */
                <div className="flex items-start gap-3 mb-4 justify-end">
                  <div className="flex-1 min-w-0 flex justify-end">
                    <div className="max-w-[80%]">
                      <div className={`bg-gradient-to-r ${colors.accent.blue} rounded-2xl p-4 text-white`}>
                        <div style={{ color: 'white' }}>
                          {message.content}
                        </div>
                      </div>
                      <div className={`text-xs ${colors.text.tertiary} mt-1 mr-4 text-right`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className={`p-2 ${colors.bg.tertiary} rounded-lg flex-shrink-0`}>
                    <User className="w-4 h-4" />
                  </div>
                </div>
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
          
          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${colors.text.tertiary}`}>
                <Zap className="w-3 h-3" />
                <span>Using {availableModels.find(m => m.id === selectedModel)?.name || 'AI Model'}</span>
              </div>
              <div className={`${colors.text.tertiary}`}>
                Press Enter to send, Shift+Enter for new line
              </div>
            </div>
            <div className={`flex items-center gap-2 ${colors.text.tertiary}`}>
              <span>{availableModels.length} models available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;