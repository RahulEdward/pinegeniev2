'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    // This runs only on the client after hydration
    try {
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let currentTheme: string;
      if (storedTheme === 'dark' || storedTheme === 'light') {
        currentTheme = storedTheme;
      } else {
        currentTheme = prefersDark ? 'dark' : 'light';
      }
      
      // Apply the theme to the document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(currentTheme);
      
      // Save to localStorage if not already set
      if (!storedTheme) {
        localStorage.setItem('theme', currentTheme);
      }
    } catch (error) {
      console.error('Error initializing theme:', error);
    }
  }, []);

  return null; // This component doesn't render anything
}