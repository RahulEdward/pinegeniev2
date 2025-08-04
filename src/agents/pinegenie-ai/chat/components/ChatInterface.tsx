'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { ActionButtons } from './ActionButtons';
import { StrategyPreview } from './StrategyPreview';
import { useAIChat } from '../hooks/useAIChat';
import { useConversation } from '../hooks/useConversation';
import { ChatMessage, MessageType, AIAction } from '../../types/chat-types';
import { Send, Paperclip, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  className?: string;
  onStrategyGenerated?: (strategyId: string) => void;
  onActionExecuted?: (action: AIAction) => void;
}

/**
 * Main chat interface component for PineGenie AI
 * Provides conversational interface with message history, typing indicators,
 * and interactive action buttons
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  className = '',
  onStrategyGenerated,
  onActionExecuted
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    isLoading,
    error,
    clearError
  } = useAIChat();

  const {
    messages,
    addMessage,
    clearMessages,
    getConversationContext
  } = useConversation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Show typing indicator briefly
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    }
  };

  // Handle message sending
  const handleSendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isLoading) return;

    // Clear input immediately for better UX
    setInputValue('');
    
    // Add user message to conversation
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: MessageType.USER_INPUT,
      content,
      timestamp: new Date()
    };
    addMessage(userMessage);

    try {
      // Send to AI and get response
      const response = await sendMessage(content, getConversationContext());
      
      // Add AI response to conversation
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        type: MessageType.AI_RESPONSE,
        content: response.message,
        timestamp: new Date(),
        metadata: {
          confidence: response.metadata?.confidence,
          actions: response.actions,
          strategyId: response.strategyPreview?.id
        }
      };
      addMessage(aiMessage);

      // Handle strategy generation callback
      if (response.strategyPreview && onStrategyGenerated) {
        onStrategyGenerated(response.strategyPreview.id);
      }

    } catch (error) {
      // Add error message to conversation
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: MessageType.ERROR_MESSAGE,
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      addMessage(errorMessage);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle action button clicks
  const handleActionClick = async (action: AIAction) => {
    try {
      // Add action result message
      const actionMessage: ChatMessage = {
        id: `action-${Date.now()}`,
        type: MessageType.ACTION_RESULT,
        content: `Executing: ${action.label}`,
        timestamp: new Date(),
        metadata: {
          actions: [action]
        }
      };
      addMessage(actionMessage);

      // Execute action callback
      if (onActionExecuted) {
        onActionExecuted(action);
      }

      // Send action to AI for processing
      const response = await sendMessage(
        `Execute action: ${action.type}`,
        getConversationContext()
      );

      // Add AI response
      const aiMessage: ChatMessage = {
        id: `ai-action-${Date.now()}`,
        type: MessageType.AI_RESPONSE,
        content: response.message,
        timestamp: new Date(),
        metadata: {
          confidence: response.metadata?.confidence,
          actions: response.actions
        }
      };
      addMessage(aiMessage);

    } catch (error) {
      console.error('Error executing action:', error);
    }
  };

  // Handle file attachment (placeholder for future implementation)
  const handleFileAttach = () => {
    // TODO: Implement file attachment in future iterations
    console.log('File attachment not yet implemented');
  };

  return (
    <div className={`ai-chat-interface ${className}`}>
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-title">
          <h3>PineGenie AI Assistant</h3>
          <span className="chat-status">
            {isLoading ? 'Thinking...' : 'Ready to help'}
          </span>
        </div>
        <button
          onClick={clearMessages}
          className="clear-chat-btn"
          title="Clear conversation"
        >
          Clear
        </button>
      </div>

      {/* Messages Container */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-content">
              <h4>Welcome to PineGenie AI! 🤖</h4>
              <p>I can help you build trading strategies using natural language.</p>
              <div className="example-prompts">
                <p>Try asking me:</p>
                <button
                  onClick={() => setInputValue("Create a RSI strategy that buys when RSI is below 30")}
                  className="example-prompt"
                >
                  "Create a RSI strategy that buys when RSI is below 30"
                </button>
                <button
                  onClick={() => setInputValue("Build a MACD crossover strategy with stop loss")}
                  className="example-prompt"
                >
                  "Build a MACD crossover strategy with stop loss"
                </button>
                <button
                  onClick={() => setInputValue("Optimize my current strategy parameters")}
                  className="example-prompt"
                >
                  "Optimize my current strategy parameters"
                </button>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="message-wrapper">
              <MessageBubble message={message} />
              
              {/* Show action buttons for AI responses */}
              {message.type === MessageType.AI_RESPONSE && message.metadata?.actions && (
                <ActionButtons
                  actions={message.metadata.actions}
                  onActionClick={handleActionClick}
                />
              )}
              
              {/* Show strategy preview if available */}
              {message.metadata?.strategyId && (
                <StrategyPreview
                  strategyId={message.metadata.strategyId}
                  onPreviewClick={() => {
                    if (onStrategyGenerated) {
                      onStrategyGenerated(message.metadata!.strategyId!);
                    }
                  }}
                />
              )}
            </div>
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="loading-message">
            <div className="loading-bubble">
              <Loader2 className="loading-spinner" />
              <span>AI is thinking...</span>
            </div>
          </div>
        )}
        
        {/* Typing indicator */}
        {isTyping && !isLoading && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError} className="error-close">×</button>
          </div>
        )}
        
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Describe the trading strategy you want to build..."
            className="message-input"
            rows={1}
            disabled={isLoading}
          />
          
          <div className="input-actions">
            <button
              onClick={handleFileAttach}
              className="attach-btn"
              title="Attach file (coming soon)"
              disabled
            >
              <Paperclip size={18} />
            </button>
            
            <button
              onClick={handleSendMessage}
              className="send-btn"
              disabled={!inputValue.trim() || isLoading}
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ai-chat-interface {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--bg-primary, #ffffff);
          border-radius: 12px;
          border: 1px solid var(--border-color, #e5e7eb);
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color, #e5e7eb);
          background: var(--bg-secondary, #f9fafb);
        }

        .chat-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .chat-status {
          font-size: 12px;
          color: var(--text-secondary, #6b7280);
        }

        .clear-chat-btn {
          padding: 6px 12px;
          background: transparent;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 6px;
          color: var(--text-secondary, #6b7280);
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
        }

        .clear-chat-btn:hover {
          background: var(--bg-hover, #f3f4f6);
          color: var(--text-primary, #111827);
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .welcome-message {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          text-align: center;
        }

        .welcome-content h4 {
          margin: 0 0 8px 0;
          font-size: 18px;
          color: var(--text-primary, #111827);
        }

        .welcome-content p {
          margin: 0 0 20px 0;
          color: var(--text-secondary, #6b7280);
        }

        .example-prompts p {
          font-size: 14px;
          margin-bottom: 12px;
          color: var(--text-secondary, #6b7280);
        }

        .example-prompt {
          display: block;
          width: 100%;
          max-width: 400px;
          margin: 8px auto;
          padding: 12px 16px;
          background: var(--bg-secondary, #f9fafb);
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 8px;
          color: var(--text-primary, #111827);
          cursor: pointer;
          font-size: 14px;
          text-align: left;
          transition: all 0.2s;
        }

        .example-prompt:hover {
          background: var(--bg-hover, #f3f4f6);
          border-color: var(--border-hover, #d1d5db);
        }

        .message-wrapper {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loading-message {
          display: flex;
          justify-content: flex-start;
        }

        .loading-bubble {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 18px;
          color: var(--text-secondary, #6b7280);
          font-size: 14px;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .typing-indicator {
          display: flex;
          justify-content: flex-start;
        }

        .typing-dots {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 18px;
        }

        .typing-dots span {
          width: 6px;
          height: 6px;
          background: var(--text-secondary, #6b7280);
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .input-area {
          border-top: 1px solid var(--border-color, #e5e7eb);
          background: var(--bg-primary, #ffffff);
        }

        .error-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          background: #fef2f2;
          color: #dc2626;
          font-size: 14px;
          border-bottom: 1px solid #fecaca;
        }

        .error-close {
          background: none;
          border: none;
          color: #dc2626;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .input-container {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          padding: 16px 20px;
        }

        .message-input {
          flex: 1;
          min-height: 44px;
          max-height: 120px;
          padding: 12px 16px;
          border: 1px solid var(--border-color, #e5e7eb);
          border-radius: 22px;
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #111827);
          font-size: 14px;
          line-height: 1.4;
          resize: none;
          outline: none;
          transition: border-color 0.2s;
        }

        .message-input:focus {
          border-color: var(--primary-color, #3b82f6);
        }

        .message-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-actions {
          display: flex;
          gap: 8px;
        }

        .attach-btn, .send-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .attach-btn {
          background: var(--bg-secondary, #f9fafb);
          color: var(--text-secondary, #6b7280);
        }

        .attach-btn:hover:not(:disabled) {
          background: var(--bg-hover, #f3f4f6);
          color: var(--text-primary, #111827);
        }

        .attach-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .send-btn {
          background: var(--primary-color, #3b82f6);
          color: white;
        }

        .send-btn:hover:not(:disabled) {
          background: var(--primary-hover, #2563eb);
        }

        .send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .ai-chat-interface {
            --bg-primary: #1f2937;
            --bg-secondary: #374151;
            --bg-hover: #4b5563;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --border-color: #4b5563;
            --border-hover: #6b7280;
            --primary-color: #3b82f6;
            --primary-hover: #2563eb;
          }
        }
      `}</style>
    </div>
  );
};