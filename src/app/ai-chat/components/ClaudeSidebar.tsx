'use client';

import React from 'react';
import { useClaudeLayoutStore } from '../stores/claude-layout-store';
import ChatHistoryList, { Conversation } from './ChatHistoryList';
import UserProfileSection, { UserProfile, UserSettings } from './UserProfileSection';
import { availableModels } from './ModelSelector';

interface ClaudeSidebarProps {
  className?: string;
  conversations?: Conversation[];
  onSelectConversation?: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  onNewChat?: () => void;
  user?: UserProfile;
  settings?: UserSettings;
  onUpdateSettings?: (settings: Partial<UserSettings>) => void;
  onSignOut?: () => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

/**
 * ClaudeSidebar component with collapse functionality
 * Implements collapsible sidebar with smooth CSS animations,
 * navigation icons with tooltips, and proper accessibility
 */
export default function ClaudeSidebar({ 
  className = '',
  conversations = [],
  onSelectConversation = () => {},
  onDeleteConversation = () => {},
  onNewChat = () => {},
  user = {
    id: 'default-user',
    name: 'Pine Genie User',
    email: 'user@pinegenie.com',
    initials: 'PU'
  },
  settings = {
    theme: 'dark',
    fontSize: 14,
    autoOpenCodePanel: true,
    sidebarCollapsed: false,
    notifications: true,
    autoSave: true,
    language: 'en'
  },
  onUpdateSettings = () => {},
  onSignOut = () => {},
  selectedModel = 'pine-genie',
  onModelChange = () => {}
}: ClaudeSidebarProps) {
  const {
    sidebarCollapsed,
    toggleSidebar,
    currentConversation,
    isMobile,
    isTablet,
    isDesktop
  } = useClaudeLayoutStore();

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleSidebar();
    }
  };

  return (
    <aside 
      className={`claude-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${className}`}
      data-testid="claude-sidebar"
      role="navigation"
      aria-label="Main navigation sidebar"
    >
      {/* Sidebar Header with Toggle Button */}
      <div className="sidebar-header">
        <button
          className="sidebar-toggle-btn"
          onClick={toggleSidebar}
          onKeyDown={handleKeyDown}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          data-testid="sidebar-toggle-button"
        >
          <svg 
            className="toggle-icon" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            aria-hidden="true"
          >
            {sidebarCollapsed ? (
              // Expand icon (chevron right)
              <path d="M9 18l6-6-6-6" />
            ) : (
              // Collapse icon (chevron left)
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
        
        {/* Logo/Title - only visible when expanded */}
        {!sidebarCollapsed && (
          <div className="sidebar-logo">
            <h2 className="sidebar-title">Pine Genie</h2>
          </div>
        )}
      </div>

      {/* Model Selector Section */}
      {!sidebarCollapsed && (
        <div className="model-selector-sidebar">
          <div className="model-selector-header">
            <span className="model-selector-label">AI Model</span>
          </div>
          <select 
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value)}
            className="model-select-dropdown"
          >
            {availableModels.map(model => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.tier === 'free' ? 'Free' : 'Paid'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navigation Icons */}
      <nav className="sidebar-nav" role="navigation" aria-label="Sidebar navigation">
        <ul className="nav-list">
          {/* New Chat Button */}
          <li className="nav-item">
            <button
              className="nav-button new-chat-btn"
              onClick={onNewChat}
              aria-label="Start new chat"
              title="Start new chat"
              data-testid="new-chat-button"
            >
              <svg 
                className="nav-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {!sidebarCollapsed && <span className="nav-text">New Chat</span>}
            </button>
          </li>



          {/* Spec Planning */}
          <li className="nav-item">
            <button
              className="nav-button"
              aria-label="Spec planning"
              title="Spec planning"
              data-testid="spec-planning-button"
            >
              <svg 
                className="nav-icon" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              {!sidebarCollapsed && <span className="nav-text">Spec Planning</span>}
            </button>
          </li>


        </ul>
      </nav>

      {/* Sidebar Content Area - Chat History */}
      <div className="sidebar-content">
        {!sidebarCollapsed && (
          <ChatHistoryList
            conversations={conversations}
            currentConversationId={currentConversation}
            onSelectConversation={onSelectConversation}
            onDeleteConversation={onDeleteConversation}
            onNewChat={onNewChat}
          />
        )}
      </div>

      {/* Sidebar Footer - User Profile Section */}
      <UserProfileSection
        user={user}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        onSignOut={onSignOut}
      />
    </aside>
  );
}