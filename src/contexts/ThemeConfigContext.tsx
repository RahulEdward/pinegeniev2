'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  ThemeConfig, 
  ThemeMode, 
  defaultThemeConfig, 
  getThemeFromLocalStorage, 
  saveThemeToLocalStorage, 
  applyTheme 
} from '@/lib/theme-config';

interface ThemeConfigContextType {
  theme: ThemeConfig;
  setThemeMode: (mode: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  setBorderRadius: (radius: ThemeConfig['borderRadius']) => void;
  setAnimation: (enabled: boolean) => void;
  setFontFamily: (font: ThemeConfig['fontFamily']) => void;
  resetTheme: () => void;
}

const ThemeConfigContext = createContext<ThemeConfigContextType | undefined>(undefined);

export function ThemeConfigProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultThemeConfig);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme = getThemeFromLocalStorage();
    setTheme(storedTheme);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
      saveThemeToLocalStorage(theme);
    }
  }, [theme, mounted]);

  const setThemeMode = (mode: ThemeMode) => {
    setTheme(prev => ({ ...prev, mode }));
  };

  const setPrimaryColor = (color: string) => {
    setTheme(prev => ({ ...prev, primaryColor: color }));
  };

  const setBorderRadius = (borderRadius: ThemeConfig['borderRadius']) => {
    setTheme(prev => ({ ...prev, borderRadius }));
  };

  const setAnimation = (animation: boolean) => {
    setTheme(prev => ({ ...prev, animation }));
  };

  const setFontFamily = (fontFamily: ThemeConfig['fontFamily']) => {
    setTheme(prev => ({ ...prev, fontFamily }));
  };

  const resetTheme = () => {
    setTheme(defaultThemeConfig);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return (
    <ThemeConfigContext.Provider 
      value={{ 
        theme, 
        setThemeMode, 
        setPrimaryColor, 
        setBorderRadius, 
        setAnimation, 
        setFontFamily, 
        resetTheme 
      }}
    >
      {children}
    </ThemeConfigContext.Provider>
  );
}

export function useThemeConfig() {
  const context = useContext(ThemeConfigContext);
  if (context === undefined) {
    throw new Error('useThemeConfig must be used within a ThemeConfigProvider');
  }
  return context;
}