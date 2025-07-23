/**
 * Theme Configuration System for Pine Genie Agent
 * Provides runtime theme loading and validation
 */

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
}

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#8b5cf6',
    secondary: '#6b7280',
    accent: '#a855f7',
    background: '#0f0f0f',
    surface: '#1a1a1a',
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      muted: '#71717a'
    },
    border: '#27272a',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem'
  }
};

class ThemeConfigManager {
  private currentTheme: ThemeConfig = defaultTheme;
  private listeners: ((theme: ThemeConfig) => void)[] = [];

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    try {
      const savedTheme = localStorage.getItem('pine-genie-theme');
      if (savedTheme) {
        this.currentTheme = { ...defaultTheme, ...JSON.parse(savedTheme) };
      }
    } catch (error) {
      console.warn('Failed to load saved theme, using default:', error);
      this.currentTheme = defaultTheme;
    }
  }

  public getTheme(): ThemeConfig {
    return this.currentTheme;
  }

  public updateTheme(updates: Partial<ThemeConfig>): void {
    this.currentTheme = { ...this.currentTheme, ...updates };
    this.saveTheme();
    this.notifyListeners();
  }

  private saveTheme(): void {
    try {
      localStorage.setItem('pine-genie-theme', JSON.stringify(this.currentTheme));
    } catch (error) {
      console.warn('Failed to save theme:', error);
    }
  }

  public subscribe(listener: (theme: ThemeConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  public validateTheme(theme: Partial<ThemeConfig>): boolean {
    // Basic validation for required color properties
    if (theme.colors) {
      const requiredColors = ['primary', 'background', 'surface'];
      for (const color of requiredColors) {
        if (theme.colors[color as keyof typeof theme.colors] && 
            !this.isValidColor(theme.colors[color as keyof typeof theme.colors] as string)) {
          return false;
        }
      }
    }
    return true;
  }

  private isValidColor(color: string): boolean {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return colorRegex.test(color) || CSS.supports('color', color);
  }
}

export const themeConfig = new ThemeConfigManager();