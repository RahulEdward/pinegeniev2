'use client';

import React from 'react';
import { ChatMessage, MessageType } from '../../types/chat-types';
import { User, Bot, AlertCircle, CheckCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
  className?: string;
}

/**
 * Message bubble component with role-based styling and code highlighting
 * Supports user messages, AI responses, system messages, and error messages
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  className = ''
}) => {
  const isUser = message.type === MessageType.USER_INPUT;
  const isError = message.type === MessageType.ERROR_MESSAGE;
  const isSystem = message.type === MessageType.SYSTEM_MESSAGE;
  const isActionResult = message.type === MessageType.ACTION_RESULT;

  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Detect and highlight code blocks
  const formatContent = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/);
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Multi-line code block
        const code = part.slice(3, -3);
        const lines = code.split('\n');
        const language = lines[0].trim();
        const codeContent = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="code-block">
            {language && (
              <div className="code-header">
                <span className="code-language">{language}</span>
                <button
                  className="copy-code-btn"
                  onClick={() => navigator.clipboard.writeText(codeContent)}
                  title="Copy code"
                >
                  Copy
                </button>
              </div>
            )}
            <pre className="code-content">
              <code>{codeContent}</code>
            </pre>
          </div>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        // Inline code
        return (
          <code key={index} className="inline-code">
            {part.slice(1, -1)}
          </code>
        );
      } else {
        // Regular text with line breaks
        return (
          <span key={index}>
            {part.split('\n').map((line, lineIndex, lines) => (
              <React.Fragment key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        );
      }
    });
  };

  // Get appropriate icon for message type
  const getMessageIcon = () => {
    if (isUser) return <User size={16} />;
    if (isError) return <AlertCircle size={16} />;
    if (isActionResult) return <CheckCircle size={16} />;
    return <Bot size={16} />;
  };

  // Get message type label
  const getMessageLabel = () => {
    if (isUser) return 'You';
    if (isError) return 'Error';
    if (isSystem) return 'System';
    if (isActionResult) return 'Action';
    return 'PineGenie AI';
  };

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'ai'} ${isError ? 'error' : ''} ${isSystem ? 'system' : ''} ${isActionResult ? 'action' : ''} ${className}`}>
      <div className="message-header">
        <div className="message-sender">
          <div className="sender-icon">
            {getMessageIcon()}
          </div>
          <span className="sender-name">{getMessageLabel()}</span>
        </div>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>
      
      <div className="message-content">
        {formatContent(message.content)}
      </div>

      {/* Show confidence score for AI responses */}
      {!isUser && message.metadata?.confidence && (
        <div className="message-metadata">
          <div className="confidence-indicator">
            <span className="confidence-label">Confidence:</span>
            <div className="confidence-bar">
              <div 
                className="confidence-fill"
                style={{ width: `${message.metadata.confidence * 100}%` }}
              />
            </div>
            <span className="confidence-value">
              {Math.round(message.metadata.confidence * 100)}%
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .message-bubble {
          max-width: 80%;
          margin-bottom: 16px;
          animation: slideIn 0.3s ease-out;
        }

        .message-bubble.user {
          align-self: flex-end;
          margin-left: auto;
        }

        .message-bubble.ai {
          align-self: flex-start;
          margin-right: auto;
        }

        .message-bubble.error {
          border-left: 4px solid #dc2626;
        }

        .message-bubble.system {
          align-self: center;
          max-width: 90%;
          opacity: 0.8;
        }

        .message-bubble.action {
          border-left: 4px solid #059669;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 12px;
          color: var(--text-secondary, #6b7280);
        }

        .message-sender {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sender-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg-secondary, #f9fafb);
        }

        .user .sender-icon {
          background: var(--primary-color, #3b82f6);
          color: white;
        }

        .error .sender-icon {
          background: #dc2626;
          color: white;
        }

        .action .sender-icon {
          background: #059669;
          color: white;
        }

        .sender-name {
          font-weight: 500;
          color: var(--text-primary, #111827);
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
        }

        .message-content {
          padding: 12px 16px;
          background: var(--bg-secondary, #f9fafb);
          border-radius: 16px;
          color: var(--text-primary, #111827);
          line-height: 1.5;
          word-wrap: break-word;
        }

        .user .message-content {
          background: var(--primary-color, #3b82f6);
          color: white;
        }

        .error .message-content {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .system .message-content {
          background: #f0f9ff;
          color: #0369a1;
          border: 1px solid #bae6fd;
          text-align: center;
          font-style: italic;
        }

        .action .message-content {
          background: #f0fdf4;
          color: #059669;
          border: 1px solid #bbf7d0;
        }

        .code-block {
          margin: 12px 0;
          border-radius: 8px;
          overflow: hidden;
          background: var(--code-bg, #1f2937);
          border: 1px solid var(--border-color, #374151);
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: var(--code-header-bg, #374151);
          border-bottom: 1px solid var(--border-color, #4b5563);
        }

        .code-language {
          font-size: 12px;
          color: var(--text-secondary, #d1d5db);
          font-weight: 500;
        }

        .copy-code-btn {
          background: transparent;
          border: 1px solid var(--border-color, #4b5563);
          color: var(--text-secondary, #d1d5db);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .copy-code-btn:hover {
          background: var(--bg-hover, #4b5563);
          color: var(--text-primary, #f9fafb);
        }

        .code-content {
          padding: 12px;
          margin: 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.4;
          color: var(--code-text, #f9fafb);
          background: transparent;
        }

        .code-content code {
          background: transparent;
          padding: 0;
          border-radius: 0;
          font-family: inherit;
        }

        .inline-code {
          background: var(--inline-code-bg, #f3f4f6);
          color: var(--inline-code-text, #1f2937);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
        }

        .user .inline-code {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .message-metadata {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid var(--border-color, #e5e7eb);
        }

        .confidence-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-secondary, #6b7280);
        }

        .confidence-label {
          font-weight: 500;
        }

        .confidence-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-secondary, #f3f4f6);
          border-radius: 2px;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #059669 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .confidence-value {
          font-weight: 500;
          min-width: 35px;
          text-align: right;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .message-bubble {
            --bg-secondary: #374151;
            --text-primary: #f9fafb;
            --text-secondary: #d1d5db;
            --border-color: #4b5563;
            --primary-color: #3b82f6;
            --code-bg: #1f2937;
            --code-header-bg: #374151;
            --code-text: #f9fafb;
            --inline-code-bg: #374151;
            --inline-code-text: #f9fafb;
            --bg-hover: #4b5563;
          }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .message-bubble {
            max-width: 95%;
          }
          
          .message-content {
            padding: 10px 12px;
          }
          
          .code-content {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};