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
      <div className="ai-message-content">
        {isLoading ? (
          <div className="typing-indicator-content">
            <span>Pine Genie is thinking</span>
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        ) : (
          <>
            <div dangerouslySetInnerHTML={{ __html: formatContent(content) }} />
            <div className="ai-message-timestamp">
              {formatTime(timestamp)}
            </div>
          </>
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