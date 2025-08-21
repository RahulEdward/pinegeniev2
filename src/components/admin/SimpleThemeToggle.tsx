'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

interface SimpleThemeToggleProps {
  className?: string;
}

export default function SimpleThemeToggle({ className = '' }: SimpleThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    
    // Check current theme
    const currentTheme = localStorage.getItem('theme');
    const isCurrentlyDark = currentTheme === 'dark' || 
      (!currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setIsDark(isCurrentlyDark);
    
    // Apply theme if not already applied
    applyTheme(isCurrentlyDark);
  }, []);

  const applyTheme = (dark: boolean) => {
    try {
      const root = document.documentElement;
      const body = document.body;
      
      console.log('Applying theme:', dark ? 'dark' : 'light');
      
      // Force remove all theme classes
      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');
      
      // Force add new theme class
      const themeClass = dark ? 'dark' : 'light';
      root.classList.add(themeClass);
      body.classList.add(themeClass);
      
      // Also set data attribute for additional targeting
      root.setAttribute('data-theme', themeClass);
      body.setAttribute('data-theme', themeClass);
      
      // Store in localStorage
      localStorage.setItem('theme', themeClass);
      localStorage.setItem('theme-mode', themeClass);
      
      console.log('Theme applied. Root classes:', root.className);
      console.log('Body classes:', body.className);
      
      // Force a style recalculation
      root.style.colorScheme = dark ? 'dark' : 'light';
      
    } catch (error) {
      console.error('Error applying theme:', error);
    }
  };

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
    
    // Dispatch event for other components
    window.dispatchEvent(new Event('theme-changed'));
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-lg bg-gray-200 animate-pulse ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
        isDark 
          ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      } ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}