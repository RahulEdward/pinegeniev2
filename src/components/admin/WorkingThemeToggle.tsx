'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function WorkingThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if dark mode is currently active
    const currentTheme = document.documentElement.classList.contains('dark');
    setIsDark(currentTheme);
    
    // If no theme is set, check localStorage or default to light
    if (!document.documentElement.classList.contains('dark') && !document.documentElement.classList.contains('light')) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        setIsDark(true);
      } else {
        document.documentElement.classList.add('light');
        setIsDark(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    
    if (html.classList.contains('dark')) {
      // Switch to light
      html.classList.remove('dark');
      html.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      // Switch to dark
      html.classList.remove('light');
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
    
    // Force a repaint
    html.style.display = 'none';
    html.offsetHeight; // Trigger reflow
    html.style.display = '';
  };

  if (!mounted) {
    return <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />;
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg transition-all duration-200 
        ${isDark 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}