/**
 * Kiro-Enhanced Chat Interface
 * 
 * Enhanced version of the chat interface with Kiro-style design elements,
 * proper message threading, typing indicators, and smooth animations.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Mic, MicOff, Loader2, Check, X, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAgentColors } from '../hooks/useAgentTheme';
import { AgentThemeProvider } from '../components/AgentThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Message } from '../types/agent';
import { handleTextareaInput, initAutoResize } from '../utils/textarea-utils';
import WelcomeCards from './WelcomeCards';
import '../styles/chat-animations.css';
import '../styles/welcome-cards.css';

interface KiroEnhancedChatInterfaceProps {
  conversationId?: string;
  agentName?: string;
  agentDescription?: string;
  userName?: string;
  userHistory?: {
    strategies: number;
    conversations: number;
    lastStrategy?: string;
  };
}

// Message status types
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error';

// Extended message interface with status
interface ChatMessage extends Message {
  id: string;
  status: MessageStatus;
}

function KiroEnhancedChatInterfaceContent({ 
  conversationId,
  agentName = 'PineGenie AI',
  agentDescription = 'Your TradingView strategy assistant',
  userName,
  userHistory
}: KiroEnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(conversationId);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use agent theme colors
  const colors = useAgentColors();

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Initialize auto-resize for textarea
  useEffect(() => {
    initAutoResize(textareaRef);
  }, []);

  // Format timestamp to readable time
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send message function
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const messageId = Date.now().toString();
    
    // Create user message with 'sending' status
    const userMessage: ChatMessage = {
      id: messageId,
      role: 'user',
      content: input,
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Update message status to 'sent'
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'sent' } : msg
        )
      );

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

      // Update message status to 'delivered'
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'delivered' } : msg
        )
      );

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        status: 'delivered'
      };

      setMessages(prev => [...prev, assistantMessage]);
      setCurrentConversationId(data.conversationId);

      // Update user message status to 'read' after a short delay
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, status: 'read' } : msg
          )
        );
      }, 500);

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
      
      // Update message status to 'error'
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'error' } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (isListening) {
      // Stop listening logic would go here
      setIsListening(false);
      toast.success('Voice input stopped');
    } else {
      // Start listening logic would go here
      setIsListening(true);
      toast.success('Listening for voice input...');
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case 'sent':
        return <Check className="w-3 h-3" />;
      case 'delivered':
        return <Check className="w-3 h-3" />;
      case 'read':
        return <Check className="w-3 h-3" style={{ color: colors.primary }} />;
      case 'error':
        return <X className="w-3 h-3" style={{ color: colors.status.error }} />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // Render message bubble with proper styling and animations
  const renderMessageBubble = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex gap-3 mb-4 message-bubble ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isUser && (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 avatar-animation"
            style={{ backgroundColor: colors.primary }}
          >
            <Bot className="w-4 h-4" style={{ color: colors.text.inverse }} />
          </motion.div>
        )}
        
        <div className="flex flex-col max-w-[70%]">
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className={`rounded-2xl p-3 ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
            style={{
              backgroundColor: isUser 
                ? colors.chat.userBubble 
                : colors.chat.agentBubble,
              color: isUser 
                ? colors.chat.userBubbleText 
                : colors.chat.agentBubbleText,
              boxShadow: colors.isDark ? '0 1px 2px rgba(0,0,0,0.3)' : '0 1px 2px rgba(0,0,0,0.1)'
            }}
          >
            <p className="whitespace-pre-wrap text-sm">{message.content}</p>
          </motion.div>
          
          <div className={`flex items-center mt-1 text-xs ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span style={{ color: colors.text.muted }}>
              {formatTime(message.timestamp)}
            </span>
            
            {isUser && (
              <span className="ml-1 status-icon">
                {getMessageStatusIcon(message.status)}
              </span>
            )}
          </div>
        </div>

        {isUser && (
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 avatar-animation"
            style={{ backgroundColor: colors.secondary }}
          >
            <User className="w-4 h-4" style={{ color: colors.text.inverse }} />
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div 
      className="flex flex-col h-full rounded-lg shadow-lg overflow-hidden"
      style={{ 
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header with theme colors */}
      <div 
        className="flex items-center gap-3 p-4 border-b"
        style={{ 
          backgroundColor: colors.surface,
          borderColor: colors.border 
        }}
      >
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: colors.primary,
            boxShadow: colors.isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Bot className="w-6 h-6" style={{ color: colors.text.inverse }} />
        </div>
        <div>
          <h3 
            className="font-semibold text-lg"
            style={{ color: colors.text.primary }}
          >
            {agentName}
          </h3>
          <p 
            className="text-sm"
            style={{ color: colors.text.secondary }}
          >
            {agentDescription}
          </p>
        </div>
      </div>

      {/* Messages with theme-aware styling */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ backgroundColor: colors.background }}
      >
        {messages.length === 0 && (
          <div className="py-6 px-4 flex-1 flex items-center justify-center">
            <WelcomeCards 
              userName={userName}
              userHistory={userHistory}
              onCardClick={(prompt) => {
                setInput(prompt);
                // Focus the textarea
                if (textareaRef.current) {
                  textareaRef.current.focus();
                  // Trigger auto-resize
                  const event = new Event('input', { bubbles: true });
                  textareaRef.current.dispatchEvent(event);
                  
                  // Optionally auto-send the message after a short delay
                  // setTimeout(() => {
                  //   sendMessage();
                  // }, 500);
                }
              }}
            />
          </div>
        )}

        {messages.map((message) => renderMessageBubble(message))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 avatar-animation"
              style={{ backgroundColor: colors.primary }}
            >
              <Bot className="w-4 h-4" style={{ color: colors.text.inverse }} />
            </div>
            <div 
              className="rounded-2xl rounded-tl-sm p-3 max-w-[70%]"
              style={{ backgroundColor: colors.chat.agentBubble }}
            >
              <div className="flex space-x-2">
                <div 
                  className="w-2 h-2 rounded-full typing-dot"
                  style={{ backgroundColor: colors.text.muted }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full typing-dot"
                  style={{ backgroundColor: colors.text.muted }}
                ></div>
                <div 
                  className="w-2 h-2 rounded-full typing-dot"
                  style={{ backgroundColor: colors.text.muted }}
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
        style={{ 
          borderColor: colors.border,
          backgroundColor: colors.surface
        }}
      >
        <div className="flex gap-2 items-end">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                handleTextareaInput(e);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Pine Script strategies, indicators, or trading concepts..."
              className="w-full resize-none rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all auto-resize-textarea"
              style={{
                backgroundColor: colors.chat.inputBg,
                borderColor: colors.chat.inputBorder,
                color: colors.chat.inputText,
                minHeight: '50px',
                maxHeight: '150px',
                boxShadow: colors.isDark ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                '--placeholder-color': colors.chat.inputPlaceholder,
              }}
              rows={1}
              disabled={isLoading}
            />
            <AnimatePresence>
              {input.trim().length > 0 && (
                <div className="absolute right-2 bottom-2">
                  <span 
                    className="text-xs px-2 py-1 rounded-full char-counter"
                    style={{ 
                      backgroundColor: colors.surfaceHover,
                      color: colors.text.secondary
                    }}
                  >
                    {input.length} / 4000
                  </span>
                </div>
              )}
            </AnimatePresence>
          </div>
          
          <button
            onClick={toggleVoiceInput}
            className={`rounded-full p-3 focus:outline-none focus:ring-2 transition-colors button-hover ${isListening ? 'voice-active' : ''}`}
            style={{
              backgroundColor: isListening ? colors.status.error : colors.surfaceHover,
              color: isListening ? colors.text.inverse : colors.text.primary,
            }}
            title={isListening ? "Stop voice input" : "Start voice input"}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-full p-3 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors button-hover"
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
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Kiro-Enhanced Chat Interface with Theme Provider
 */
export default function KiroEnhancedChatInterface(props: KiroEnhancedChatInterfaceProps) {
  return (
    <AgentThemeProvider
      enableAccessibilityWarnings={true}
      onThemeChange={(event) => {
        console.log('Chat theme updated:', event.theme);
      }}
    >
      <KiroEnhancedChatInterfaceContent {...props} />
    </AgentThemeProvider>
  );
}