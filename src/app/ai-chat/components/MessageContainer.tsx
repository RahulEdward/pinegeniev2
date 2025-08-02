'use client';

import React from 'react';
import UserMessage from './UserMessage';
import AIMessage from './AIMessage';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
}

interface MessageContainerProps {
  messages: Message[];
  isLoading?: boolean;
  onSuggestedPrompt?: (prompt: string) => void;
}

/**
 * MessageContainer component that displays chat messages with proper alignment
 * User messages on the right, AI messages on the left
 * Enhanced with smooth scrolling and scroll position memory
 */
export default function MessageContainer({ messages, isLoading, onSuggestedPrompt }: MessageContainerProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = React.useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = React.useState(false);

  // Auto-scroll to bottom when new messages arrive (only if user isn't scrolling)
  React.useEffect(() => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, isUserScrolling]);

  // Handle scroll events to detect user scrolling
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      setShowScrollToBottom(!isAtBottom);
      
      // Reset user scrolling flag when they scroll to bottom
      if (isAtBottom) {
        setIsUserScrolling(false);
      } else {
        setIsUserScrolling(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
    setIsUserScrolling(false);
  };

  return (
    <div className="message-container" data-testid="message-container" ref={containerRef}>
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <div className="empty-chat-content">
              <div className="empty-chat-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="empty-chat-title">Welcome to Pine Genie AI</h3>
              <p className="empty-chat-description">
                I'm here to help you create, analyze, and optimize Pine Script trading strategies. 
                Ask me anything about technical indicators, strategy development, or Pine Script coding!
              </p>
              <div className="suggested-prompts">
                <button 
                  className="suggested-prompt"
                  onClick={() => onSuggestedPrompt?.("Generate trading strategy")}
                >
                  Generate trading strategy
                </button>
                <button 
                  className="suggested-prompt"
                  onClick={() => onSuggestedPrompt?.("Create custom indicator")}
                >
                  Create custom indicator
                </button>
                <button 
                  className="suggested-prompt"
                  onClick={() => onSuggestedPrompt?.("Analyze market patterns")}
                >
                  Analyze market patterns
                </button>
                <button 
                  className="suggested-prompt"
                  onClick={() => onSuggestedPrompt?.("Backtest my strategy")}
                >
                  Backtest my strategy
                </button>
                <button 
                  className="suggested-prompt"
                  onClick={() => onSuggestedPrompt?.("Optimize parameters")}
                >
                  Optimize parameters
                </button>
                <button 
                  className="suggested-prompt"
                  onClick={() => onSuggestedPrompt?.("Pine Script debugging")}
                >
                  Pine Script debugging
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div 
                key={message.id} 
                className={`message-wrapper ${index === messages.length - 1 ? 'latest-message' : ''}`}
              >
                {message.role === 'user' ? (
                  <UserMessage 
                    content={message.content}
                    timestamp={message.timestamp}
                  />
                ) : (
                  <AIMessage 
                    content={message.content}
                    timestamp={message.timestamp}
                    isLoading={message.isLoading}
                  />
                )}
              </div>
            ))}
            
            {/* Typing indicator for new AI response */}
            {isLoading && (
              <div className="message-wrapper typing-indicator">
                <AIMessage 
                  content=""
                  timestamp={new Date()}
                  isLoading={true}
                />
              </div>
            )}
          </>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <button 
          className="scroll-to-bottom-btn"
          onClick={scrollToBottom}
          title="Scroll to bottom"
          data-testid="scroll-to-bottom"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l3 3 3-3"/>
            <path d="M7 6l3 3 3-3"/>
          </svg>
        </button>
      )}
    </div>
  );
}