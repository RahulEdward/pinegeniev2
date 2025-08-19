'use client';

import React, { useState, useMemo } from 'react';
import { useClaudeLayoutStore } from '../stores/claude-layout-store';

// Types for conversation management
export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  category: 'trend-following' | 'mean-reversion' | 'breakout' | 'momentum' | 'scalping' | 'custom';
  hasSpec: boolean;
  messageCount: number;
}

interface ChatHistoryListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onNewChat: () => void;
  className?: string;
}

// Category configuration for folder organization
const CATEGORY_CONFIG = {
  'trend-following': {
    name: 'Trend Following',
    icon: '📈',
    color: '#00d4aa'
  },
  'mean-reversion': {
    name: 'Mean Reversion',
    icon: '🔄',
    color: '#ff6b35'
  },
  'breakout': {
    name: 'Breakout',
    icon: '💥',
    color: '#ffb800'
  },
  'momentum': {
    name: 'Momentum',
    icon: '🚀',
    color: '#0066cc'
  },
  'scalping': {
    name: 'Scalping',
    icon: '⚡',
    color: '#ff4757'
  },
  'custom': {
    name: 'Custom',
    icon: '🛠️',
    color: '#808080'
  }
};

/**
 * ChatHistoryList component with conversation titles, search functionality,
 * and folder organization by strategy categories
 */
export default function ChatHistoryList({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onNewChat,
  className = ''
}: ChatHistoryListProps) {
  const { sidebarCollapsed } = useClaudeLayoutStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['trend-following', 'mean-reversion', 'breakout', 'momentum', 'scalping', 'custom'])
  );

  // Close all menus when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menus = document.querySelectorAll('.conversation-menu');
      menus.forEach(menu => {
        const menuElement = menu as HTMLElement;
        const button = menuElement.previousElementSibling as HTMLElement;
        if (!menuElement.contains(event.target as Node) && !button.contains(event.target as Node)) {
          menuElement.style.display = 'none';
        }
      });
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.title.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query) ||
      CATEGORY_CONFIG[conv.category].name.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  // Group conversations by category
  const conversationsByCategory = useMemo(() => {
    const grouped: Record<string, Conversation[]> = {};
    
    // Initialize all categories
    Object.keys(CATEGORY_CONFIG).forEach(category => {
      grouped[category] = [];
    });
    
    // Group filtered conversations
    filteredConversations.forEach(conv => {
      grouped[conv.category].push(conv);
    });
    
    // Sort conversations within each category by timestamp (newest first)
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    });
    
    return grouped;
  }, [filteredConversations]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // Format timestamp for display - using consistent format to avoid hydration issues
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = timestamp.getHours().toString().padStart(2, '0');
      const minutes = timestamp.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      const month = (timestamp.getMonth() + 1).toString().padStart(2, '0');
      const day = timestamp.getDate().toString().padStart(2, '0');
      const year = timestamp.getFullYear();
      return `${month}/${day}/${year}`;
    }
  };

  // Handle conversation deletion with confirmation
  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      onDeleteConversation(conversationId);
    }
  };

  if (sidebarCollapsed) {
    return null; // Hide chat history when sidebar is collapsed
  }

  return (
    <div className={`chat-history-list ${className}`} data-testid="chat-history-list">
      {/* Search Input */}
      <div className="search-container">
        <div className="search-input-wrapper">
          <svg 
            className="search-icon" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            data-testid="search-input"
            aria-label="Search conversations"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
              aria-label="Clear search"
              data-testid="clear-search-button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Conversation Categories */}
      <div className="conversation-categories">
        {Object.entries(CATEGORY_CONFIG).map(([categoryKey, categoryConfig]) => {
          const categoryConversations = conversationsByCategory[categoryKey];
          const isExpanded = expandedCategories.has(categoryKey);
          const hasConversations = categoryConversations.length > 0;

          if (!hasConversations && !searchQuery) {
            return null; // Hide empty categories when not searching
          }

          return (
            <div key={categoryKey} className="category-section">
              {/* Category Header */}
              <button
                className={`category-header ${isExpanded ? 'expanded' : ''}`}
                onClick={() => toggleCategory(categoryKey)}
                data-testid={`category-${categoryKey}`}
                aria-expanded={isExpanded}
                aria-label={`${categoryConfig.name} category`}
              >
                <div className="category-info">
                  <span className="category-icon" role="img" aria-hidden="true">
                    {categoryConfig.icon}
                  </span>
                  <span className="category-name">{categoryConfig.name}</span>
                  <span className="conversation-count">({categoryConversations.length})</span>
                </div>
                <svg 
                  className={`expand-icon ${isExpanded ? 'expanded' : ''}`}
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </button>

              {/* Category Conversations */}
              {isExpanded && (
                <div className="category-conversations">
                  {categoryConversations.length === 0 ? (
                    <div className="empty-category">
                      <p className="empty-text">No conversations yet</p>
                    </div>
                  ) : (
                    categoryConversations.map(conversation => (
                      <div
                        key={conversation.id}
                        className={`conversation-item ${
                          conversation.id === currentConversationId ? 'active' : ''
                        }`}
                        onClick={() => onSelectConversation(conversation.id)}
                        data-testid={`conversation-${conversation.id}`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            onSelectConversation(conversation.id);
                          }
                        }}
                      >
                        <div className="conversation-content">
                          <div className="conversation-header">
                            <h4 className="conversation-title">{conversation.title}</h4>
                            {conversation.hasSpec && (
                              <span 
                                className="spec-badge" 
                                title="Has spec planning"
                                aria-label="Has spec planning"
                              >
                                📋
                              </span>
                            )}
                          </div>
                          <p className="conversation-preview">{conversation.lastMessage}</p>
                          <div className="conversation-meta">
                            <span className="timestamp">{formatTimestamp(conversation.timestamp)}</span>
                            <span className="message-count">{conversation.messageCount} messages</span>
                          </div>
                        </div>
                        <div className="conversation-actions">
                          <button
                            className="conversation-menu-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle menu for this conversation
                              const menu = e.currentTarget.nextElementSibling as HTMLElement;
                              if (menu) {
                                menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                              }
                            }}
                            aria-label={`More options for ${conversation.title}`}
                            title="More options"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                          <div className="conversation-menu" style={{ display: 'none' }}>
                            <button
                              className="menu-item delete-item"
                              onClick={(e) => handleDeleteConversation(e, conversation.id)}
                              data-testid={`delete-conversation-${conversation.id}`}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3,6 5,6 21,6" />
                                <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6" />
                              </svg>
                              Delete Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredConversations.length === 0 && (
        <div className="empty-state">
          {searchQuery ? (
            <div className="no-results">
              <p className="empty-title">No conversations found</p>
              <p className="empty-description">
                Try adjusting your search terms or{' '}
                <button 
                  className="clear-search-link" 
                  onClick={() => setSearchQuery('')}
                  data-testid="clear-search-link"
                >
                  clear the search
                </button>
              </p>
            </div>
          ) : (
            <div className="no-conversations">
              <p className="empty-title">No conversations yet</p>
              <p className="empty-description">
                Use the &quot;New Chat&quot; button above to start building your trading strategies
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}