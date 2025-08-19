'use client';

import React from 'react';

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

/**
 * UserMessage component for displaying user messages (right-aligned)
 */
export default function UserMessage({ content, timestamp }: UserMessageProps) {
  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <div className="user-message" data-testid="user-message">
      <div className="user-message-content">
        {content}
        <div className="user-message-timestamp">
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
}