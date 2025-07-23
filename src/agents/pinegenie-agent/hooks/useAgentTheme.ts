/**
 * React Hook for Agent Theme Integration
 * 
 * Provides easy access to theme adapter functionality in React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  themeAdapter, 
  AgentTheme, 
  ThemeChangeEvent, 
  ValidationResult 
} from '../config/theme-adapter';

export interface UseAgentThemeReturn {
  theme: AgentTheme | null;
  isLoading: boolean;
  validation: ValidationResult | null;
  isDark: boolean;
  refreshTheme: () => void;
  isAccessible: boolean;
  warnings: string[];
}

/**
 * Hook to access and manage agent theme
 */
export function useAgentTheme(): UseAgentThemeReturn {
  const [theme, setTheme] = useState<AgentTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = () => {
      try {
        const initialTheme = themeAdapter.initializeTheme();
        setTheme(initialTheme);
        
        const validationResult = themeAdapter.validateColorConsistency();
        setValidation(validationResult);
        
        setIsDark(document.documentElement.classList.contains('dark'));
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize agent theme:', error);
        setIsLoading(false);
      }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeTheme);
    } else {
      initializeTheme();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initializeTheme);
    };
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: ThemeChangeEvent) => {
      setTheme(event.colors);
      setIsDark(event.theme === 'dark');
      
      // Re-validate accessibility
      const validationResult = themeAdapter.validateColorConsistency();
      setValidation(validationResult);
    };

    themeAdapter.addThemeChangeListener(handleThemeChange);

    return () => {
      themeAdapter.removeThemeChangeListener(handleThemeChange);
    };
  }, []);

  // Refresh theme manually
  const refreshTheme = useCallback(() => {
    try {
      const refreshedTheme = themeAdapter.initializeTheme();
      setTheme(refreshedTheme);
      
      const validationResult = themeAdapter.validateColorConsistency();
      setValidation(validationResult);
      
      setIsDark(document.documentElement.classList.contains('dark'));
    } catch (error) {
      console.error('Failed to refresh agent theme:', error);
    }
  }, []);

  return {
    theme,
    isLoading,
    validation,
    isDark,
    refreshTheme,
    isAccessible: validation?.isValid ?? false,
    warnings: validation?.warnings ?? [],
  };
}

/**
 * Hook to get specific theme colors with fallbacks
 */
export function useAgentColors() {
  const { theme, isDark } = useAgentTheme();

  return {
    // Primary colors
    primary: theme?.colors.primary ?? '#0ea5e9',
    primaryHover: theme?.colors.primaryHover ?? '#0284c7',
    primaryActive: theme?.colors.primaryActive ?? '#0369a1',
    
    // Secondary colors
    secondary: theme?.colors.secondary ?? '#64748b',
    secondaryHover: theme?.colors.secondaryHover ?? '#475569',
    
    // Background and surface
    background: theme?.colors.background ?? (isDark ? '#0a0a0a' : '#ffffff'),
    surface: theme?.colors.surface ?? (isDark ? '#0f172a' : '#f8fafc'),
    surfaceHover: theme?.colors.surfaceHover ?? (isDark ? '#1e293b' : '#f1f5f9'),
    
    // Borders
    border: theme?.colors.border ?? (isDark ? '#334155' : '#e2e8f0'),
    borderHover: theme?.colors.borderHover ?? (isDark ? '#475569' : '#cbd5e1'),
    
    // Text colors
    text: {
      primary: theme?.colors.text.primary ?? (isDark ? '#ededed' : '#171717'),
      secondary: theme?.colors.text.secondary ?? (isDark ? '#cbd5e1' : '#475569'),
      muted: theme?.colors.text.muted ?? (isDark ? '#94a3b8' : '#64748b'),
      inverse: theme?.colors.text.inverse ?? (isDark ? '#171717' : '#ededed'),
    },
    
    // Status colors
    status: {
      success: theme?.colors.status.success ?? '#22c55e',
      successBg: theme?.colors.status.successBg ?? (isDark ? '#14532d' : '#f0fdf4'),
      warning: theme?.colors.status.warning ?? '#f59e0b',
      warningBg: theme?.colors.status.warningBg ?? (isDark ? '#78350f' : '#fffbeb'),
      error: theme?.colors.status.error ?? '#ef4444',
      errorBg: theme?.colors.status.errorBg ?? (isDark ? '#7f1d1d' : '#fef2f2'),
      info: theme?.colors.status.info ?? '#0ea5e9',
      infoBg: theme?.colors.status.infoBg ?? (isDark ? '#0c4a6e' : '#f0f9ff'),
    },
    
    // Chat specific colors
    chat: {
      userBubble: theme?.colors.chat.userBubble ?? '#0ea5e9',
      userBubbleText: theme?.colors.chat.userBubbleText ?? '#ffffff',
      agentBubble: theme?.colors.chat.agentBubble ?? (isDark ? '#1e293b' : '#f1f5f9'),
      agentBubbleText: theme?.colors.chat.agentBubbleText ?? (isDark ? '#ededed' : '#171717'),
      inputBg: theme?.colors.chat.inputBg ?? (isDark ? '#0f172a' : '#ffffff'),
      inputBorder: theme?.colors.chat.inputBorder ?? (isDark ? '#334155' : '#cbd5e1'),
      inputText: theme?.colors.chat.inputText ?? (isDark ? '#ededed' : '#171717'),
      inputPlaceholder: theme?.colors.chat.inputPlaceholder ?? (isDark ? '#94a3b8' : '#64748b'),
    },
    
    // Utility
    isDark,
    theme,
  };
}