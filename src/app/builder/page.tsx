'use client';

import dynamic from 'next/dynamic';

// Use dynamic import to avoid SSR issues with ThemeProvider
const CanvasWithTheme = dynamic(() => import('./ui/Canvas'), { ssr: false });

export default function BuilderPage() {
  return <CanvasWithTheme />;
}
