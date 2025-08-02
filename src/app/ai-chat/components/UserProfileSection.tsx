'use client';

import React, { useState } from 'react';
import { useClaudeLayoutStore } from '../stores/claude-layout-store';

// Types for user profile and settings
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  fontSize: number;
  autoOpenCodePanel: boolean;
  sidebarCollapsed: boolean;
  notifications: boolean;
  autoSave: boolean;
  language: string;
}

interface UserProfileSectionProps {
  user: UserProfile;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onSignOut: () => void;
  className?: string;
}

/**
 * UserProfileSection component with settings panel and user profile display
 * Implements theme and preference controls with user avatar and basic info
 */
export default function UserProfileSection({
  user,
  settings,
  onUpdateSettings,
  onSignOut,
  className = ''
}: UserProfileSectionProps) {
  const { sidebarCollapsed, toggleTheme, setFontSize, setAutoOpenCodePanel } = useClaudeLayoutStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Handle settings changes
  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    onUpdateSettings({ [key]: value });
    
    // Update layout store for immediate UI changes
    switch (key) {
      case 'theme':
        if (value !== 'auto') {
          toggleTheme();
        }
        break;
      case 'fontSize':
        setFontSize(value);
        break;
      case 'autoOpenCodePanel':
        setAutoOpenCodePanel(value);
        break;
    }
  };

  // Generate avatar initials if no avatar image
  const getAvatarContent = () => {
    if (user.avatar) {
      return <img src={user.avatar} alt={user.name} className="avatar-image" />;
    }
    return <span className="avatar-initials">{user.initials}</span>;
  };

  // Handle sign out with confirmation
  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      onSignOut();
    }
  };

  if (sidebarCollapsed) {
    return (
      <div className={`user-profile-section collapsed ${className}`} data-testid="user-profile-section">
        {/* Collapsed Settings Button */}
        <button
          className="nav-button footer-button"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
          title="Settings"
          data-testid="settings-button"
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
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
          </svg>
        </button>

        {/* Collapsed Profile Button */}
        <button
          className="nav-button footer-button profile-button"
          onClick={() => setShowProfile(!showProfile)}
          aria-label={`User profile: ${user.name}`}
          title={`User profile: ${user.name}`}
          data-testid="profile-button"
        >
          <div className="avatar-small">
            {getAvatarContent()}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`user-profile-section expanded ${className}`} data-testid="user-profile-section">
      {/* Settings Panel */}
      <div className="settings-section">
        <button
          className="section-header"
          onClick={() => setShowSettings(!showSettings)}
          aria-expanded={showSettings}
          data-testid="settings-toggle"
        >
          <div className="header-content">
            <svg 
              className="section-icon" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" />
            </svg>
            <span className="section-title">Settings</span>
          </div>
          <svg 
            className={`expand-icon ${showSettings ? 'expanded' : ''}`}
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

        {showSettings && (
          <div className="settings-panel" data-testid="settings-panel">
            {/* Theme Setting */}
            <div className="setting-item">
              <label className="setting-label" htmlFor="theme-select">
                Theme
              </label>
              <select
                id="theme-select"
                className="setting-select"
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                data-testid="theme-select"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            {/* Font Size Setting */}
            <div className="setting-item">
              <label className="setting-label" htmlFor="font-size-range">
                Font Size: {settings.fontSize}px
              </label>
              <input
                id="font-size-range"
                type="range"
                className="setting-range"
                min="12"
                max="20"
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
                data-testid="font-size-range"
              />
            </div>

            {/* Auto Open Code Panel */}
            <div className="setting-item">
              <label className="setting-checkbox-label">
                <input
                  type="checkbox"
                  className="setting-checkbox"
                  checked={settings.autoOpenCodePanel}
                  onChange={(e) => handleSettingChange('autoOpenCodePanel', e.target.checked)}
                  data-testid="auto-open-code-panel-checkbox"
                />
                <span className="checkbox-text">Auto-open code panel</span>
              </label>
            </div>

            {/* Notifications */}
            <div className="setting-item">
              <label className="setting-checkbox-label">
                <input
                  type="checkbox"
                  className="setting-checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  data-testid="notifications-checkbox"
                />
                <span className="checkbox-text">Enable notifications</span>
              </label>
            </div>

            {/* Auto Save */}
            <div className="setting-item">
              <label className="setting-checkbox-label">
                <input
                  type="checkbox"
                  className="setting-checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  data-testid="auto-save-checkbox"
                />
                <span className="checkbox-text">Auto-save conversations</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="profile-section">
        <button
          className="profile-header"
          onClick={() => setShowProfile(!showProfile)}
          aria-expanded={showProfile}
          data-testid="profile-toggle"
        >
          <div className="profile-info">
            <div className="avatar">
              {getAvatarContent()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
          </div>
          <svg 
            className={`expand-icon ${showProfile ? 'expanded' : ''}`}
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

        {showProfile && (
          <div className="profile-panel" data-testid="profile-panel">
            <div className="profile-actions">
              <button
                className="profile-action-btn"
                onClick={() => {/* Handle edit profile */}}
                data-testid="edit-profile-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </button>

              <button
                className="profile-action-btn"
                onClick={() => {/* Handle account settings */}}
                data-testid="account-settings-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Account Settings
              </button>

              <button
                className="profile-action-btn help-btn"
                onClick={() => {/* Handle help */}}
                data-testid="help-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <point cx="12" cy="17" />
                </svg>
                Help & Support
              </button>

              <div className="profile-divider" />

              <button
                className="profile-action-btn sign-out-btn"
                onClick={handleSignOut}
                data-testid="sign-out-button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}