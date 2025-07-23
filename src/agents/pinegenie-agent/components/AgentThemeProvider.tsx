/**
 * Agent Theme Provider Component
 * 
 * Provides theme context to agent components and handles theme initialization
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  themeAdapter, 
  AgentTheme, 
  ThemeChangeEvent, 
  ValidationResult 
} from '../config/theme-adapter';

interface AgentThemeContextValue {
  theme: AgentTheme | null;
  isLoading: boolean;
  validation: ValidationResult | null;
  isDark: boolean;
  refreshTheme: () => void;
  toggleTheme: () => void;
  isAccessible: boolean;
  warnings: string[];
}

const AgentThemeContext = createContext<AgentThemeContextValue | null>(null);

interface AgentThemeProviderProps {
  children: React.ReactNode;
  enableAccessibilityWarnings?: boolean;
  onThemeChange?: (event: ThemeChangeEvent) => void;
  onAccessibilityIssue?: (warnings: string[]) => void;
}

/**
 * Provider component that initializes and manages agent theme
 */
export function AgentThemeProvider({ 
  children, 
  enableAccessibilityWarnings = true,
  onThemeChange,
  onAccessibilityIssue 
}: AgentThemeProviderProps) {
  const [theme, setTheme] = useState<AgentTheme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isDark, setIsDark] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Wait a bit for DOM to be fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const initialTheme = themeAdapter.initializeTheme();
        setTheme(initialTheme);
        
        const validationResult = themeAdapter.validateColorConsistency();
        setValidation(validationResult);
        
        setIsDark(document.documentElement.classList.contains('dark'));
        
        // Report accessibility issues if enabled
        if (enableAccessibilityWarnings && !validationResult.isValid) {
          console.warn('Agent theme accessibility issues:', validationResult.warnings);
          onAccessibilityIssue?.(validationResult.warnings);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize agent theme:', error);
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [enableAccessibilityWarnings, onAccessibilityIssue]);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = (event: ThemeChangeEvent) => {
      setTheme(event.colors);
      setIsDark(event.theme === 'dark');
      
      // Re-validate accessibility
      const validationResult = themeAdapter.validateColorConsistency();
      setValidation(validationResult);
      
      // Report accessibility issues if enabled
      if (enableAccessibilityWarnings && !validationResult.isValid) {
        console.warn('Agent theme accessibility issues after change:', validationResult.warnings);
        onAccessibilityIssue?.(validationResult.warnings);
      }
      
      // Call external handler
      onThemeChange?.(event);
    };

    themeAdapter.addThemeChangeListener(handleThemeChange);

    return () => {
      themeAdapter.removeThemeChangeListener(handleThemeChange);
    };
  }, [enableAccessibilityWarnings, onThemeChange, onAccessibilityIssue]);

  // Refresh theme manually
  const refreshTheme = () => {
    try {
      const refreshedTheme = themeAdapter.initializeTheme();
      setTheme(refreshedTheme);
      
      const validationResult = themeAdapter.validateColorConsistency();
      setValidation(validationResult);
      
      setIsDark(document.documentElement.classList.contains('dark'));
    } catch (error) {
      console.error('Failed to refresh agent theme:', error);
    }
  };
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    try {
      const isDarkMode = document.documentElement.classList.contains('dark');
      
      // Toggle theme class
      if (isDarkMode) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
      
      // Refresh theme
      setTimeout(() => {
        refreshTheme();
      }, 0);
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  const contextValue: AgentThemeContextValue = {
    theme,
    isLoading,
    validation,
    isDark,
    refreshTheme,
    toggleTheme,
    isAccessible: validation?.isValid ?? false,
    warnings: validation?.warnings ?? [],
  };

  return (
    <AgentThemeContext.Provider value={contextValue}>
      {children}
    </AgentThemeContext.Provider>
  );
}

/**
 * Hook to access agent theme context
 */
export function useAgentThemeContext(): AgentThemeContextValue {
  const context = useContext(AgentThemeContext);
  
  if (!context) {
    throw new Error('useAgentThemeContext must be used within an AgentThemeProvider');
  }
  
  return context;
}

/**
 * HOC to wrap components with theme provider
 */
export function withAgentTheme<P extends object>(
  Component: React.ComponentType<P>,
  providerProps?: Omit<AgentThemeProviderProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <AgentThemeProvider {...providerProps}>
      <Component {...props} />
    </AgentThemeProvider>
  );
  
  WrappedComponent.displayName = `withAgentTheme(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}