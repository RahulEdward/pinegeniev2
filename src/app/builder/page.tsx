'use client';

import dynamic from 'next/dynamic';

// Dynamic import with proper SSR handling
const Canvas = dynamic(() => import('./ui'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-300">Loading Strategy Builder...</p>
      </div>
    </div>
  )
});

export default function BuilderPage() {
  return (
    <div className="w-full h-screen">
      <Canvas />
    </div>
  );
}
