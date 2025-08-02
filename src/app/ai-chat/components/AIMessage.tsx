'use client';

import React from 'react';

interface AIMessageProps {
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

/**
 * AIMessage component for displaying AI messages (left-aligned)
 */
export default function AIMessage({ content, timestamp, isLoading }: AIMessageProps) {
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="ai-message" data-testid="ai-message">
      <div className="message-avatar ai-avatar">
        <div className="avatar-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
      </div>
      <div className="message-content">
        <div className="message-bubble ai-bubble">
          {isLoading ? (
            <div className="typing-indicator-container">
              <div className="typing-text">Pine Genie is thinking</div>
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          ) : (
            <div className="message-text" dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
          )}
        </div>
        {!isLoading && (
          <div className="message-timestamp">
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Format message content - REMOVE CODE BLOCKS, show only text
 */
function formatContent(content: string): string {
  if (!content) return '';
  
  // Remove code blocks completely and replace with text reference
  let formatted = content
    // Remove code blocks and replace with reference
    .replace(/```[\s\S]*?```/g, '[Code generated - view in right panel]')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n/g, '<br>');
  
  return formatted;
}