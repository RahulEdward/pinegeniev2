'use client';

import { useEffect } from 'react';

export default function ThemeScript() {
  useEffect(() => {
    // This code only runs on the client
    try {
      const storedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let currentTheme: string;
      if (storedTheme === 'dark' || storedTheme === 'light') {
        currentTheme = storedTheme;
      } else {
        currentTheme = prefersDark ? 'dark' : 'light';
      }
      
      // Save the theme to localStorage if it's not already set
      if (!storedTheme) {
        localStorage.setItem('theme', currentTheme);
      }
      
      // Apply the theme to the document
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(currentTheme);
    } catch (e) {
      console.error('Error setting theme:', e);
    }
  }, []);
  
  return null;
}