/**
 * Theme Script Component
 * 
 * SSR-safe theme initialization that prevents flash of unstyled content (FOUC).
 */

'use client';

import { useEffect, useState } from 'react';

const themeScript = `
(function() {
  try {
    if (typeof window === 'undefined') return;
    
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let shouldBeDark = false;
    
    if (storedTheme === 'dark') {
      shouldBeDark = true;
    } else if (storedTheme === 'light') {
      shouldBeDark = false;
    } else {
      // No stored preference, use system preference
      shouldBeDark = systemPrefersDark;
    }
    
    // Apply theme class immediately
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(shouldBeDark ? 'dark' : 'light');
    
    // Store the preference
    try {
      localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');
    } catch (e) {
      // localStorage might not be available
    }
  } catch (error) {
    console.warn('Failed to initialize theme:', error);
    // Fallback to light theme
    try {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
    } catch (e) {
      // Ignore if document is not available
    }
  }
})();
`;

export function ThemeScript() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Run the theme script immediately on client
    if (typeof window !== 'undefined') {
      const hasThemeClass = document.documentElement.classList.contains('dark') || 
                           document.documentElement.classList.contains('light');
      
      if (!hasThemeClass) {
        // Execute the theme script immediately
        try {
          const storedTheme = localStorage.getItem('theme');
          const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          
          let shouldBeDark = false;
          
          if (storedTheme === 'dark') {
            shouldBeDark = true;
          } else if (storedTheme === 'light') {
            shouldBeDark = false;
          } else {
            shouldBeDark = systemPrefersDark;
          }
          
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(shouldBeDark ? 'dark' : 'light');
          localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');
        } catch (error) {
          console.warn('Failed to initialize theme:', error);
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add('light');
        }
      }
    }
  }, []);

  // Only render the script tag on the client side to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: themeScript,
      }}
    />
  );
}

export default ThemeScript;