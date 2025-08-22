'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface SimpleAIChatProps {
  userId: string;
}

export default function SimpleAIChat({ userId }: SimpleAIChatProps) {
  const router = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4');

  // Clear chat history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This action cannot be undone.')) {
      setMessages([]);
      localStorage.removeItem(`chat-history-${userId}`);
    }
  };

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat-history-${userId}`, JSON.stringify(messages));
    }
  }, [messages, userId]);

  // Load messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem(`chat-history-${userId}`);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Error loading saved messages:', error);
      }
    }
  }, [userId]);

  const models = [
    { id: 'gpt-4', name: 'ChatGPT-4', description: '✅ WORKING - Best for complex strategies' },
    { id: 'gpt-3.5-turbo', name: 'ChatGPT-3.5', description: '✅ WORKING - Fast and efficient' },
    { id: 'pine-genie', name: 'PineGenie', description: 'Local fallback templates' }
  ];

  const extractPineScriptCode = (text: string): string => {
    const codeBlockRegex = /```(?:pinescript|pine)?\n?([\s\S]*?)```/gi;
    const matches = text.match(codeBlockRegex);
    
    if (matches && matches.length > 0) {
      return matches[0].replace(/```(?:pinescript|pine)?\n?/gi, '').replace(/```$/g, '').trim();
    }
    
    return '';
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      console.log(`🚀 Sending to ${selectedModel}:`, inputValue.trim());

      const response = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: inputValue.trim()
            }
          ],
          modelId: selectedModel
        })
      });

      console.log(`📡 Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`✅ Response from ${data.model}:`, data.content.substring(0, 100) + '...');

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('❌ Error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Create a temporary toast notification
      const toast = document.createElement('div');
      toast.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isDarkMode ? 'bg-green-800 text-green-100' : 'bg-green-100 text-green-800'
      }`;
      toast.textContent = '✅ Code copied to clipboard!';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    }).catch(() => {
      alert('Failed to copy code to clipboard');
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-gray-900'
    }`}>
      {/* Modern Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-sm transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-gray-900/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Dashboard
              </button>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">PG</span>
                </div>
                <h1 className="text-lg font-semibold">Pine Genie</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Model Selector */}
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className={`px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-600 text-gray-200' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>

              {/* Clear History */}
              <button
                onClick={clearHistory}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-400 hover:text-red-400 hover:bg-gray-800' 
                    : 'text-gray-500 hover:text-red-500 hover:bg-gray-100'
                }`}
                title="Clear chat history"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-yellow-400 hover:bg-gray-800' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                {isDarkMode ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold mb-3">How can I help you today?</h2>
                <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  I can help you create powerful trading strategies in PineScript
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                  <button
                    onClick={() => setInputValue('Create a RSI strategy with 30/70 levels')}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-blue-500 mb-2">📈</div>
                    <div className="font-medium mb-1">RSI Strategy</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Create a strategy with 30/70 levels
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setInputValue('Build a MACD crossover strategy')}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-green-500 mb-2">📊</div>
                    <div className="font-medium mb-1">MACD Crossover</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Build a crossover strategy
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setInputValue('Make a Bollinger Bands squeeze strategy')}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-105 ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-purple-500 mb-2">🎯</div>
                    <div className="font-medium mb-1">Bollinger Bands</div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Create a squeeze strategy
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">PG</span>
                      </div>
                    )}
                    
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white ml-auto'
                            : isDarkMode 
                              ? 'bg-gray-800 text-gray-100' 
                              : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      
                      {/* Code Block */}
                      {message.role === 'assistant' && extractPineScriptCode(message.content) && (
                        <div className={`mt-3 border rounded-xl overflow-hidden ${
                          isDarkMode ? 'border-gray-700' : 'border-gray-200'
                        }`}>
                          <div className={`flex items-center justify-between px-4 py-2 border-b ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-700' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <span className="text-sm font-medium">PineScript Code</span>
                            <button
                              onClick={() => copyToClipboard(extractPineScriptCode(message.content))}
                              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                                isDarkMode 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                              }`}
                            >
                              Copy
                            </button>
                          </div>
                          <pre className="p-4 text-sm overflow-x-auto bg-gray-900 text-green-400">
                            <code>{extractPineScriptCode(message.content)}</code>
                          </pre>
                        </div>
                      )}
                      
                      <div className={`text-xs mt-2 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      } ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">U</span>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">PG</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t px-4 py-4">
            <div className={`max-w-4xl mx-auto border rounded-2xl transition-colors ${
              isDarkMode ? 'border-gray-700' : 'border-gray-300'
            }`}>
              <div className="flex items-end gap-3 p-4">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Message Pine Genie..."
                  className={`flex-1 resize-none border-none outline-none bg-transparent text-base leading-6 ${
                    isDarkMode ? 'placeholder-gray-500' : 'placeholder-gray-400'
                  }`}
                  rows={1}
                  style={{ minHeight: '24px', maxHeight: '120px' }}
                  disabled={isLoading}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = target.scrollHeight + 'px';
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}