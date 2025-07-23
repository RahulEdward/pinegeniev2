/**
 * Enhanced Chat Interface with Agent Theme Integration
 * 
 * This is an example of how to integrate the theme adapter system
 * with existing chat components.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAgentColors } from '@/agents/pinegenie-agent/hooks/useAgentTheme';
import { AgentThemeProvider } from '@/agents/pinegenie-agent/components/AgentThemeProvider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface EnhancedChatInterfaceProps {
  conversationId?: string;
}

function EnhancedChatInterfaceContent({ conversationId }: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use agent theme colors
  const colors = useAgentColors();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId: currentConversationId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentConversationId(data.conversationId);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div 
      className="flex flex-col h-full rounded-lg shadow-lg"
      style={{ backgroundColor: colors.surface }}
    >
      {/* Header with theme colors */}
      <div 
        className="flex items-center gap-3 p-4 border-b rounded-t-lg"
        style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }}
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.primary }}
        >
          <Bot className="w-5 h-5" style={{ color: colors.text.inverse }} />
        </div>
        <div>
          <h3 
            className="font-semibold"
            style={{ color: colors.text.primary }}
          >
            PineGenie AI
          </h3>
          <p 
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            Your TradingView strategy assistant
          </p>
        </div>
      </div>

      {/* Messages with theme-aware styling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot 
              className="w-12 h-12 mx-auto mb-4" 
              style={{ color: colors.text.muted }}
            />
            <h4 
              className="text-lg font-medium mb-2"
              style={{ color: colors.text.primary }}
            >
              Welcome to PineGenie AI
            </h4>
            <p 
              className="mb-4"
              style={{ color: colors.text.secondary }}
            >
              Ask me anything about TradingView strategies, Pine Script, or trading indicators!
            </p>
            <div 
              className="border rounded-lg p-4 max-w-md mx-auto"
              style={{ 
                backgroundColor: colors.status.warningBg,
                borderColor: colors.border 
              }}
            >
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: colors.status.warning }}
                ></div>
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.status.warning }}
                >
                  Demo Mode Active
                </span>
              </div>
              <p 
                className="text-xs mt-1"
                style={{ color: colors.status.warning }}
              >
                Connect API keys in admin panel for full AI functionality
              </p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                <Bot className="w-4 h-4" style={{ color: colors.text.inverse }} />
              </div>
            )}
            
            <div
              className="max-w-[70%] rounded-lg p-3"
              style={{
                backgroundColor: message.role === 'user' 
                  ? colors.chat.userBubble 
                  : colors.chat.agentBubble,
                color: message.role === 'user' 
                  ? colors.chat.userBubbleText 
                  : colors.chat.agentBubbleText
              }}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p 
                className="text-xs mt-1 opacity-70"
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.secondary }}
              >
                <User className="w-4 h-4" style={{ color: colors.text.inverse }} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: colors.primary }}
            >
              <Bot className="w-4 h-4" style={{ color: colors.text.inverse }} />
            </div>
            <div 
              className="rounded-lg p-3"
              style={{ backgroundColor: colors.chat.agentBubble }}
            >
              <div className="flex space-x-1">
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: colors.text.muted }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: colors.text.muted,
                    animationDelay: '0.1s' 
                  }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ 
                    backgroundColor: colors.text.muted,
                    animationDelay: '0.2s' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input with theme styling */}
      <div 
        className="p-4 border-t"
        style={{ borderColor: colors.border }}
      >
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Pine Script strategies, indicators, or trading concepts..."
            className="flex-1 resize-none rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 transition-colors"
            style={{
              backgroundColor: colors.chat.inputBg,
              borderColor: colors.chat.inputBorder,
              color: colors.chat.inputText,
              '--placeholder-color': colors.chat.inputPlaceholder,
            }}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={{
              backgroundColor: colors.primary,
              color: colors.text.inverse,
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim()) {
                e.currentTarget.style.backgroundColor = colors.primaryHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = colors.primary;
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Enhanced Chat Interface with Theme Provider
 */
export default function EnhancedChatInterface(props: EnhancedChatInterfaceProps) {
  return (
    <AgentThemeProvider
      enableAccessibilityWarnings={true}
      onThemeChange={(event) => {
        console.log('Chat theme updated:', event.theme);
      }}
    >
      <EnhancedChatInterfaceContent {...props} />
    </AgentThemeProvider>
  );
}