'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function SimpleThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize on mount
  useEffect(() => {
    setMounted(true);
    // Check if dark mode is active
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Toggle theme function
  function toggle() {
    if (isDark) {
      // Switch to light mode
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      // Switch to dark mode
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      type="button"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  );
}