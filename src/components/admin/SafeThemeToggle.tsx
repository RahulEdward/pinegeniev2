'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface SafeThemeToggleProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function SafeThemeToggle({ variant = 'default', className = '' }: SafeThemeToggleProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMounted(true);
      try {
        // Get theme from localStorage or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : systemTheme;
        
        setTheme(initialTheme as 'light' | 'dark');
        applyTheme(initialTheme as 'light' | 'dark');
      } catch (error) {
        console.error('Error initializing theme:', error);
      }
    }
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (typeof window !== 'undefined' && document) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  const toggleTheme = () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      applyTheme(newTheme);
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`} />
      <button
        onClick={toggleTheme}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        role="switch"
        aria-checked={theme === 'dark'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-500' : 'text-gray-400'}`} />
    </div>
  );
}