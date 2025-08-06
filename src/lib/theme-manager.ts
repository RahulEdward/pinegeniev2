// REAL Theme Manager - Actually changes the UI
'use client';

export type ThemeMode = 'light' | 'dark' | 'system';
export type PrimaryColor = 'blue' | 'green' | 'red' | 'purple' | 'pink' | 'orange' | 'teal' | 'indigo';
export type BorderRadius = 'sm' | 'md' | 'lg' | 'xl';
export type FontFamily = 'default' | 'serif' | 'mono';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: PrimaryColor;
  borderRadius: BorderRadius;
  fontFamily: FontFamily;
  animation: boolean;
}

const defaultConfig: ThemeConfig = {
  mode: 'system',
  primaryColor: 'blue',
  borderRadius: 'md',
  fontFamily: 'default',
  animation: true
};

class RealThemeManager {
  private config: ThemeConfig = defaultConfig;
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadConfig();
      this.applyTheme();
      this.setupSystemListener();
    }
  }

  private loadConfig(): void {
    try {
      const stored = localStorage.getItem('real-admin-theme');
      if (stored) {
        this.config = { ...defaultConfig, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load theme config:', error);
    }
  }

  private saveConfig(): void {
    try {
      localStorage.setItem('real-admin-theme', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save theme config:', error);
    }
  }

  private setupSystemListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (this.config.mode === 'system') {
        this.applyTheme();
      }
    });
  }

  private applyTheme(): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Apply theme mode
    this.applyThemeMode(root);

    // Apply primary color
    this.applyPrimaryColor(root);

    // Apply border radius
    this.applyBorderRadius(root);

    // Apply font family
    this.applyFontFamily(root);

    // Apply animations
    this.applyAnimations(root);

    // Notify listeners
    this.listeners.forEach(listener => listener());
  }

  private applyThemeMode(root: HTMLElement): void {
    let isDark = false;

    if (this.config.mode === 'dark') {
      isDark = true;
    } else if (this.config.mode === 'light') {
      isDark = false;
    } else {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Remove existing classes
    root.classList.remove('light', 'dark');
    document.body.classList.remove('light', 'dark');

    // Add new class
    const themeClass = isDark ? 'dark' : 'light';
    root.classList.add(themeClass);
    document.body.classList.add(themeClass);

    // Update main theme system
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  private applyPrimaryColor(root: HTMLElement): void {
    const colorMap: Record<PrimaryColor, { [key: string]: string }> = {
      blue: {
        '50': '#eff6ff',
        '100': '#dbeafe',
        '200': '#bfdbfe',
        '300': '#93c5fd',
        '400': '#60a5fa',
        '500': '#3b82f6',
        '600': '#2563eb',
        '700': '#1d4ed8',
        '800': '#1e40af',
        '900': '#1e3a8a'
      },
      green: {
        '50': '#f0fdf4',
        '100': '#dcfce7',
        '200': '#bbf7d0',
        '300': '#86efac',
        '400': '#4ade80',
        '500': '#22c55e',
        '600': '#16a34a',
        '700': '#15803d',
        '800': '#166534',
        '900': '#14532d'
      },
      red: {
        '50': '#fef2f2',
        '100': '#fee2e2',
        '200': '#fecaca',
        '300': '#fca5a5',
        '400': '#f87171',
        '500': '#ef4444',
        '600': '#dc2626',
        '700': '#b91c1c',
        '800': '#991b1b',
        '900': '#7f1d1d'
      },
      purple: {
        '50': '#faf5ff',
        '100': '#f3e8ff',
        '200': '#e9d5ff',
        '300': '#d8b4fe',
        '400': '#c084fc',
        '500': '#a855f7',
        '600': '#9333ea',
        '700': '#7c3aed',
        '800': '#6b21a8',
        '900': '#581c87'
      },
      pink: {
        '50': '#fdf2f8',
        '100': '#fce7f3',
        '200': '#fbcfe8',
        '300': '#f9a8d4',
        '400': '#f472b6',
        '500': '#ec4899',
        '600': '#db2777',
        '700': '#be185d',
        '800': '#9d174d',
        '900': '#831843'
      },
      orange: {
        '50': '#fff7ed',
        '100': '#ffedd5',
        '200': '#fed7aa',
        '300': '#fdba74',
        '400': '#fb923c',
        '500': '#f97316',
        '600': '#ea580c',
        '700': '#c2410c',
        '800': '#9a3412',
        '900': '#7c2d12'
      },
      teal: {
        '50': '#f0fdfa',
        '100': '#ccfbf1',
        '200': '#99f6e4',
        '300': '#5eead4',
        '400': '#2dd4bf',
        '500': '#14b8a6',
        '600': '#0d9488',
        '700': '#0f766e',
        '800': '#115e59',
        '900': '#134e4a'
      },
      indigo: {
        '50': '#eef2ff',
        '100': '#e0e7ff',
        '200': '#c7d2fe',
        '300': '#a5b4fc',
        '400': '#818cf8',
        '500': '#6366f1',
        '600': '#4f46e5',
        '700': '#4338ca',
        '800': '#3730a3',
        '900': '#312e81'
      }
    };

    const colors = colorMap[this.config.primaryColor];
    Object.entries(colors).forEach(([shade, value]) => {
      root.style.setProperty(`--theme-primary-${shade}`, value);
    });

    // Apply to common elements
    root.style.setProperty('--theme-primary', colors['500']);
  }

  private applyBorderRadius(root: HTMLElement): void {
    const radiusMap: Record<BorderRadius, string> = {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    };

    root.style.setProperty('--theme-border-radius', radiusMap[this.config.borderRadius]);
  }

  private applyFontFamily(root: HTMLElement): void {
    const fontMap: Record<FontFamily, string> = {
      default: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
      serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
    };

    root.style.setProperty('--theme-font-family', fontMap[this.config.fontFamily]);
    // Don't override body font-family to preserve Geist fonts
    // document.body.style.fontFamily = fontMap[this.config.fontFamily];
  }

  private applyAnimations(root: HTMLElement): void {
    if (this.config.animation) {
      root.classList.remove('no-animations');
      root.style.setProperty('--theme-transition-duration', '0.2s');
    } else {
      root.classList.add('no-animations');
      root.style.setProperty('--theme-transition-duration', '0s');
    }
  }

  // Public methods
  getConfig(): ThemeConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<ThemeConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfig();
    this.applyTheme();
  }

  resetConfig(): void {
    this.config = { ...defaultConfig };
    this.saveConfig();
    this.applyTheme();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// Create singleton instance
let themeManager: RealThemeManager | null = null;

export function getThemeManager(): RealThemeManager {
  if (!themeManager && typeof window !== 'undefined') {
    themeManager = new RealThemeManager();
  }
  return themeManager!;
}

// React hook
import { useState, useEffect } from 'react';

export function useRealTheme() {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const manager = getThemeManager();
    setConfig(manager.getConfig());

    const unsubscribe = manager.subscribe(() => {
      setConfig(manager.getConfig());
    });

    return unsubscribe;
  }, []);

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    if (typeof window !== 'undefined') {
      getThemeManager().updateConfig(updates);
    }
  };

  const resetConfig = () => {
    if (typeof window !== 'undefined') {
      getThemeManager().resetConfig();
    }
  };

  return {
    config,
    updateConfig,
    resetConfig
  };
}