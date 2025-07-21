'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface StandaloneThemeToggleProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function StandaloneThemeToggle({ variant = 'default', className = '' }: StandaloneThemeToggleProps) {
  const [theme, setTheme] = useState<string>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    
    // Check for theme in localStorage or use system preference
    const storedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let currentTheme: string;
    if (storedTheme === 'dark' || storedTheme === 'light') {
      currentTheme = storedTheme;
    } else {
      currentTheme = prefersDark ? 'dark' : 'light';
    }
    
    setTheme(currentTheme);
    
    // Apply theme to document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Update state
    setTheme(newTheme);
    
    // Update DOM
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) return null;

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        type="button"
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
        type="button"
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