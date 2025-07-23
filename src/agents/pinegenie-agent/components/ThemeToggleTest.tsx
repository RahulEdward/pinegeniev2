/**
 * Theme Toggle Test Component
 * 
 * Simple component to test theme toggle functionality
 */

'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAgentColors } from '../hooks/useAgentTheme';
import { AgentThemeProvider, useAgentThemeContext } from './AgentThemeProvider';

function ThemeToggleTestContent() {
  const colors = useAgentColors();
  const { toggleTheme, isDark } = useAgentThemeContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="p-4">
        <div className="animate-pulse bg-gray-200 h-10 w-32 rounded"></div>
      </div>
    );
  }

  return (
    <div 
      className="p-8 min-h-screen transition-colors duration-300"
      style={{ 
        backgroundColor: colors.background,
        color: colors.text.primary 
      }}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Theme Toggle Test</h1>
        
        <div 
          className="p-4 rounded-lg mb-4"
          style={{ 
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`
          }}
        >
          <p className="mb-2">Current theme: <strong>{isDark ? 'Dark' : 'Light'}</strong></p>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            Click the button below to toggle between light and dark themes.
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
          style={{
            backgroundColor: colors.primary,
            color: colors.text.inverse,
            borderColor: colors.border
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primaryHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary;
          }}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          Toggle to {isDark ? 'Light' : 'Dark'} Mode
        </button>

        <div className="mt-6 space-y-2">
          <div 
            className="p-3 rounded"
            style={{ backgroundColor: colors.status.successBg }}
          >
            <span style={{ color: colors.status.success }}>✓ Success color</span>
          </div>
          <div 
            className="p-3 rounded"
            style={{ backgroundColor: colors.status.warningBg }}
          >
            <span style={{ color: colors.status.warning }}>⚠ Warning color</span>
          </div>
          <div 
            className="p-3 rounded"
            style={{ backgroundColor: colors.status.errorBg }}
          >
            <span style={{ color: colors.status.error }}>✗ Error color</span>
          </div>
          <div 
            className="p-3 rounded"
            style={{ backgroundColor: colors.status.infoBg }}
          >
            <span style={{ color: colors.status.info }}>ℹ Info color</span>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Chat Colors Preview</h3>
          <div className="space-y-2">
            <div 
              className="p-3 rounded-lg max-w-xs"
              style={{ 
                backgroundColor: colors.chat.userBubble,
                color: colors.chat.userBubbleText 
              }}
            >
              User message bubble
            </div>
            <div 
              className="p-3 rounded-lg max-w-xs"
              style={{ 
                backgroundColor: colors.chat.agentBubble,
                color: colors.chat.agentBubbleText 
              }}
            >
              Agent message bubble
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ThemeToggleTest() {
  return (
    <AgentThemeProvider>
      <ThemeToggleTestContent />
    </AgentThemeProvider>
  );
}