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
    try {
      // Get theme from localStorage (using the main app's theme key)
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || storedTheme === 'light') {
        setMode(storedTheme);
      } else {
        // Check if dark mode is active
        const isDark = document.documentElement.classList.contains('dark');
        setMode(isDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  }, []);

  // Toggle theme function
  function setThemeMode(newMode: ThemeMode) {
    try {
      setMode(newMode);
      
      // Apply theme immediately
      if (newMode === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else if (newMode === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        localStorage.setItem('theme', 'light');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
        localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }

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