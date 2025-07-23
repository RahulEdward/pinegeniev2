'use client';

import { useState, useRef, useEffect } from 'react';
import { ThemeConsistencyProvider, useThemeConsistency } from '@/agents/pinegenie-agent/components/ThemeConsistencyProvider';

function SimpleChatContent() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m PineGenie AI, your Pine Script assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Use consistent theme colors
  const { colors, isDark } = useThemeConsistency();
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    };
    
    textarea.addEventListener('input', adjustHeight);
    return () => textarea.removeEventListener('input', adjustHeight);
  }, []);
  
  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Send message
  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    // Simulate AI response
    setTimeout(() => {
      let responseContent = '';
      
      if (input.toLowerCase().includes('rsi')) {
        responseContent = 'I\'ve generated an RSI strategy for you. You can see it in the code editor on the right.';
      } else if (input.toLowerCase().includes('macd')) {
        responseContent = 'I\'ve created a MACD crossover strategy. Check the code editor for the implementation.';
      } else if (input.toLowerCase().includes('moving average') || input.toLowerCase().includes('ma')) {
        responseContent = 'I\'ve implemented a Moving Average Crossover strategy. The code is available in the editor.';
      } else {
        responseContent = 'I\'ve created a Pine Script strategy based on your request. You can view and edit it in the code editor.';
      }
      
      const aiMessage = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };
  
  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.accent.blue }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                  <path d="M12 8V4H8"></path>
                  <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                  <path d="M2 14h2"></path>
                  <path d="M20 14h2"></path>
                  <path d="M15 13v2"></path>
                  <path d="M9 13v2"></path>
                </svg>
              </div>
            )}
            
            <div 
              className="max-w-[70%] rounded-lg p-3"
              style={{
                backgroundColor: message.role === 'user' 
                  ? colors.accent.blue 
                  : colors.bg.secondary,
                color: message.role === 'user' 
                  ? '#ffffff' 
                  : colors.text.primary
              }}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p 
                className="text-xs mt-1"
                style={{
                  color: message.role === 'user' 
                    ? '#ffffff' 
                    : colors.text.muted
                }}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
            
            {message.role === 'user' && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.secondary }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: colors.text.inverse }}>
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: colors.border }}
      >
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Pine Script strategies, indicators, or trading concepts..."
            className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1"
            style={{
              backgroundColor: colors.chat.inputBg,
              borderColor: colors.chat.inputBorder,
              color: colors.chat.inputText,
              '--placeholder-color': colors.chat.inputPlaceholder
            }}
            rows={1}
          ></textarea>
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
            style={{
              backgroundColor: colors.primary,
              color: colors.text.inverse
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = colors.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary;
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple Chat with Theme Consistency Provider
 */
export default function SimpleChat() {
  return (
    <ThemeConsistencyProvider>
      <SimpleChatContent />
    </ThemeConsistencyProvider>
  );
}