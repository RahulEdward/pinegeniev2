'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useSubscription } from '@/hooks/useSubscription';
import { Crown, Sparkles } from 'lucide-react';

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
  const { subscription, checkAIChatAccess } = useSubscription();

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
      {/* Free Plan Notice for Builder */}
      {!checkAIChatAccess() && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-gradient-to-r from-blue-500/90 to-purple-500/90 backdrop-blur-xl border border-blue-400/30 rounded-xl p-4 text-white shadow-2xl">
            <div className="flex items-center space-x-3 mb-2">
              <Crown className="h-5 w-5 text-yellow-300" />
              <span className="font-semibold text-sm">Free Plan Active</span>
            </div>
            <p className="text-xs text-blue-100 mb-3">
              ✅ Visual builder access<br/>
              ✅ Save 1 strategy<br/>
              ❌ No AI assistant
            </p>
            <button
              onClick={() => window.open('/billing', '_blank')}
              className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center space-x-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Upgrade for AI</span>
            </button>
          </div>
        </div>
      )}
      <Canvas />
    </div>
  );
}
