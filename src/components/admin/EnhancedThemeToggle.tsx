'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

interface EnhancedThemeToggleProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function EnhancedThemeToggle({ variant = 'default', className = '' }: EnhancedThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    initializeTheme();
  }, []);

  // Initialize theme from localStorage or system preference
  const initializeTheme = () => {
    try {
      const storedTheme = localStorage.getItem('theme');
      const storedMode = localStorage.getItem('theme-mode');
      
      if (storedMode && ['light', 'dark', 'system'].includes(storedMode)) {
        setMode(storedMode as ThemeMode);
      } else if (storedTheme === 'dark' || storedTheme === 'light') {
        setMode(storedTheme);
        localStorage.setItem('theme-mode', storedTheme);
      } else {
        // Default to system
        setMode('system');
        localStorage.setItem('theme-mode', 'system');
      }
      
      // Apply the current theme
      applyTheme();
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  };

  // Apply theme based on current mode
  const applyTheme = () => {
    try {
      const currentMode = localStorage.getItem('theme-mode') || 'system';
      let isDark = false;

      if (currentMode === 'dark') {
        isDark = true;
      } else if (currentMode === 'light') {
        isDark = false;
      } else {
        // System preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      // Apply to document
      const root = document.documentElement;
      const body = document.body;
      
      if (isDark) {
        root.classList.remove('light');
        root.classList.add('dark');
        body.classList.remove('light');
        body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        body.classList.remove('dark');
        body.classList.add('light');
      }

      // Store the actual theme
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  // Toggle theme function
  function setThemeMode(newMode: ThemeMode) {
    try {
      setMode(newMode);
      localStorage.setItem('theme-mode', newMode);
      
      let isDark = false;
      
      if (newMode === 'dark') {
        isDark = true;
      } else if (newMode === 'light') {
        isDark = false;
      } else {
        // System preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      // Apply theme immediately
      const root = document.documentElement;
      const body = document.body;
      
      // Remove all theme classes first
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Add the correct theme class
      const themeClass = isDark ? 'dark' : 'light';
      root.classList.add(themeClass);
      body.classList.add(themeClass);
      
      // Store the actual theme
      localStorage.setItem('theme', themeClass);
      
      setIsOpen(false);
      
      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new Event('theme-changed'));
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
          title="Theme settings"
          type="button"
        >
          {mode === 'light' ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : mode === 'dark' ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                mode === 'light' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Sun className="w-4 h-4 mr-2" />
              Light
              {mode === 'light' && (
                <span className="ml-auto">✓</span>
              )}
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                mode === 'dark' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Moon className="w-4 h-4 mr-2" />
              Dark
              {mode === 'dark' && (
                <span className="ml-auto">✓</span>
              )}
            </button>
            <button
              onClick={() => setThemeMode('system')}
              className={`flex items-center w-full px-4 py-2 text-sm ${
                mode === 'system' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Monitor className="w-4 h-4 mr-2" />
              System
              {mode === 'system' && (
                <span className="ml-auto">✓</span>
              )}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <button
        onClick={() => setThemeMode('light')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          mode === 'light' 
            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <Sun className="w-5 h-5" />
        <span>Light</span>
      </button>
      
      <button
        onClick={() => setThemeMode('dark')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          mode === 'dark' 
            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <Moon className="w-5 h-5" />
        <span>Dark</span>
      </button>
      
      <button
        onClick={() => setThemeMode('system')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
          mode === 'system' 
            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        <Monitor className="w-5 h-5" />
        <span>System</span>
      </button>
    </div>
  );
}