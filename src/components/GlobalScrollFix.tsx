'use client';

import { useEffect } from 'react';

export default function GlobalScrollFix() {
  useEffect(() => {
    // Force scroll on page load
    const forceScroll = () => {
      // Force scroll on html and body
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      
      // Remove any scroll-blocking styles from all elements
      const allElements = document.querySelectorAll('*');
      allElements.forEach((element) => {
        const el = element as HTMLElement;
        const computedStyle = window.getComputedStyle(el);
        
        // Fix overflow hidden
        if (computedStyle.overflow === 'hidden' || el.style.overflow === 'hidden') {
          el.style.overflow = 'auto';
        }
        
        // Fix height 100vh
        if (el.style.height === '100vh') {
          el.style.height = 'auto';
          el.style.minHeight = '100vh';
        }
        
        // Fix max-height 100vh
        if (el.style.maxHeight === '100vh') {
          el.style.maxHeight = 'none';
        }
      });
    };

    // Run immediately
    forceScroll();
    
    // Run after a delay to catch dynamically loaded content
    setTimeout(forceScroll, 100);
    setTimeout(forceScroll, 500);
    setTimeout(forceScroll, 1000);
    
    // Run on window resize
    window.addEventListener('resize', forceScroll);
    
    // Run on route changes (for Next.js)
    const observer = new MutationObserver(forceScroll);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => {
      window.removeEventListener('resize', forceScroll);
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}