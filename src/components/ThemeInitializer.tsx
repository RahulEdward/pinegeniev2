'use client';

import { useEffect } from 'react';

export default function ThemeInitializer() {
  useEffect(() => {
    // Initialize theme immediately on client side
    if (typeof window !== 'undefined') {
      import('@/lib/theme-manager').then(({ getThemeManager }) => {
        getThemeManager();
      });
    }
  }, []);

  return null;
}