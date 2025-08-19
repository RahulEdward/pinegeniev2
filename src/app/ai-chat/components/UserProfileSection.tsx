'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
      return <Image src={user.avatar} alt={user.name} className="avatar-image" width={32} height={32} />;
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
        {/* Settings button removed */}

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
      {/* Settings Panel removed */}

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

              {/* Account Settings button removed */}

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