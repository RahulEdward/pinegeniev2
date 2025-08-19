'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with proper error handling
const Canvas = dynamic(() => import('./ui/Canvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading Strategy Builder...</p>
        </div>
      </div>
    )
  }
);

export default function BuilderPage() {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    
    // Force scroll fix for builder page
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    
    // Override any CSS that blocks scroll
    const style = document.createElement('style');
    style.innerHTML = `
      .h-screen { height: auto !important; min-height: 100vh !important; }
      body, html { overflow: auto !important; height: auto !important; }
    `;
    document.head.appendChild(style);
    
    return () => {
      const existingStyle = document.head.querySelector('style');
      if (existingStyle && existingStyle.innerHTML.includes('h-screen')) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // Server-side render with basic styles
  if (!isClient) {
    return (
      <div className="w-full h-screen">
        <Canvas />
      </div>
    );
  }

  // Client-side render with scroll styles
  return (
    <div className="w-full" style={{ height: 'auto', minHeight: '100vh', overflow: 'visible' }}>
      <Canvas />
    </div>
  );
}
