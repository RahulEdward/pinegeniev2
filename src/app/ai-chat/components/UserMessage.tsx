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
      <div className="message-content">
        <div className="message-bubble user-bubble">
          <p className="message-text">{content}</p>
        </div>
        <div className="message-timestamp">
          {formatTime(timestamp)}
        </div>
      </div>
      <div className="message-avatar user-avatar">
        <div className="avatar-circle">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>
    </div>
  );
}