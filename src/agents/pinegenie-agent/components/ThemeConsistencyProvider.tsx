'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { themeAdapter } from '../config/theme-adapter';

/**
 * Theme Consistency Provider
 * Ensures 100% consistency with main app theme
 */

interface AppThemeColors {
  // Exact colors from your main app
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    glass: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };
  accent: {
    blue: string;
    purple: string;
    green: string;
    orange: string;
    red: string;
    indigo: string;
  };
}

interface ThemeConsistencyContextType {
  isDark: boolean;
  colors: AppThemeColors;
  toggleTheme: () => void;
  cssVars: Record<string, string>;
}

const ThemeConsistencyContext = createContext<ThemeConsistencyContextType | undefined>(undefined);

interface ThemeConsistencyProviderProps {
  children: React.ReactNode;
}

export function ThemeConsistencyProvider({ children }: ThemeConsistencyProviderProps) {
  const [isDark, setIsDark] = useState<boolean>(false);

  // Initialize theme detection - SSR safe
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTheme = () => {
      const darkMode = document.documentElement.classList.contains('dark') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDark(darkMode);
    };

    // Initial check
    checkTheme();

    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Watch for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      // Only respond if no explicit theme is set
      try {
        const storedTheme = localStorage.getItem('theme');
        if (!storedTheme || storedTheme === 'system') {
          const theme = e.matches ? 'dark' : 'light';
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(theme);
        }
      } catch (error) {
        console.warn('Failed to handle media query change:', error);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  const toggleTheme = () => {
    if (typeof window === 'undefined') return;
    
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    try {
      if (newTheme) {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
    } catch (error) {
      console.warn('Failed to toggle theme:', error);
    }
  };

  // Colors that exactly match your main app's theme structure
  const colors: AppThemeColors = {
    bg: {
      primary: isDark ? '#0a0a0a' : '#ffffff', // Exact match to your globals.css
      secondary: isDark ? '#1e293b' : '#f8fafc', // slate-800 : slate-50
      tertiary: isDark ? '#334155' : '#f1f5f9', // slate-700 : slate-100
      card: isDark ? '#1e293b' : '#ffffff', // Card backgrounds
      glass: isDark ? '#1e293b' : '#ffffff', // Glass effect backgrounds
    },
    text: {
      primary: isDark ? '#ededed' : '#171717', // Exact match to your globals.css
      secondary: isDark ? '#cbd5e1' : '#475569', // slate-300 : slate-600
      tertiary: isDark ? '#94a3b8' : '#64748b', // slate-400 : slate-500
      muted: isDark ? '#64748b' : '#94a3b8', // Muted text
    },
    border: {
      primary: isDark ? '#334155' : '#e2e8f0', // slate-700 : slate-200
      secondary: isDark ? '#475569' : '#cbd5e1', // slate-600 : slate-300
      accent: '#0ea5e9', // Your primary blue
    },
    accent: {
      blue: '#0ea5e9', // Your primary blue
      purple: '#8b5cf6', // purple-500
      green: '#22c55e', // green-500
      orange: '#f59e0b', // amber-500
      red: '#ef4444', // red-500
      indigo: '#6366f1', // indigo-500
    },
  };

  // CSS variables for consistent styling
  const cssVars: Record<string, string> = {
    '--app-bg-primary': colors.bg.primary,
    '--app-bg-secondary': colors.bg.secondary,
    '--app-bg-tertiary': colors.bg.tertiary,
    '--app-bg-card': colors.bg.card,
    '--app-text-primary': colors.text.primary,
    '--app-text-secondary': colors.text.secondary,
    '--app-text-tertiary': colors.text.tertiary,
    '--app-text-muted': colors.text.muted,
    '--app-border-primary': colors.border.primary,
    '--app-border-secondary': colors.border.secondary,
    '--app-accent-blue': colors.accent.blue,
    '--app-accent-purple': colors.accent.purple,
    '--app-accent-green': colors.accent.green,
    '--app-accent-orange': colors.accent.orange,
    '--app-accent-red': colors.accent.red,
  };

  // Apply CSS variables to document
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, [isDark]);

  const contextValue: ThemeConsistencyContextType = {
    isDark,
    colors,
    toggleTheme,
    cssVars,
  };

  return (
    <ThemeConsistencyContext.Provider value={contextValue}>
      {children}
    </ThemeConsistencyContext.Provider>
  );
}

export function useThemeConsistency(): ThemeConsistencyContextType {
  const context = useContext(ThemeConsistencyContext);
  if (context === undefined) {
    throw new Error('useThemeConsistency must be used within a ThemeConsistencyProvider');
  }
  return context;
}

/**
 * Hook for getting consistent button styles
 */
export function useConsistentButtonStyles() {
  const { colors, isDark } = useThemeConsistency();
  
  return {
    primary: {
      backgroundColor: colors.accent.blue,
      color: '#ffffff',
      border: 'none',
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#0284c7', // primary-600
        transform: 'translateY(-1px)',
      },
      ':active': {
        backgroundColor: '#0369a1', // primary-700
        transform: 'translateY(0)',
      },
    },
    secondary: {
      backgroundColor: colors.bg.secondary,
      color: colors.text.primary,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '0.5rem',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: colors.bg.tertiary,
        borderColor: colors.border.secondary,
      },
    },
  };
}

/**
 * Hook for getting consistent card styles
 */
export function useConsistentCardStyles() {
  const { colors, isDark } = useThemeConsistency();
  
  return {
    base: {
      backgroundColor: colors.bg.card,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '0.75rem',
      padding: '1.5rem',
      boxShadow: isDark 
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.2s ease',
    },
    hover: {
      borderColor: colors.border.secondary,
      transform: 'translateY(-2px)',
      boxShadow: isDark
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  };
}

/**
 * Hook for getting consistent input styles
 */
export function useConsistentInputStyles() {
  const { colors } = useThemeConsistency();
  
  return {
    base: {
      backgroundColor: colors.bg.primary,
      color: colors.text.primary,
      border: `1px solid ${colors.border.primary}`,
      borderRadius: '0.5rem',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'all 0.2s ease',
      '::placeholder': {
        color: colors.text.muted,
      },
    },
    focus: {
      borderColor: colors.accent.blue,
      boxShadow: `0 0 0 3px ${colors.accent.blue}20`,
    },
  };
}