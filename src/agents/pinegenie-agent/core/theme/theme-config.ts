/**
 * Theme Configuration System
 * Loads theme variables at runtime with validation, fallbacks, and user preferences
 */

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderHover: string;
  borderActive: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Chart colors
  chartBull: string;
  chartBear: string;
  chartVolume: string;
  chartGrid: string;
  
  // Agent specific colors
  agentMessage: string;
  userMessage: string;
  codeBackground: string;
  syntaxHighlight: string;
}

export interface ThemeConfig {
  name: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
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
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export interface UserThemePreferences {
  preferredMode: 'light' | 'dark' | 'system';
  customColors?: Partial<ThemeColors>;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  highContrast: boolean;
}

/**
 * Theme Configuration Manager
 */
export class ThemeConfigManager {
  private currentTheme: ThemeConfig;
  private userPreferences: UserThemePreferences;
  private themes: Map<string, ThemeConfig>;
  private cssVariables: Map<string, string>;
  private observers: Array<(theme: ThemeConfig) => void>;

  constructor() {
    this.themes = new Map();
    this.cssVariables = new Map();
    this.observers = [];
    
    this.userPreferences = {
      preferredMode: 'system',
      fontSize: 'medium',
      reducedMotion: false,
      highContrast: false
    };

    this.initializeThemes();
    this.currentTheme = this.themes.get('dark')!;
    this.loadUserPreferences();
    this.applySystemTheme();
    this.setupSystemThemeListener();
  }

  /**
   * Initialize built-in themes
   */
  private initializeThemes(): void {
    // Dark theme
    const darkTheme: ThemeConfig = {
      name: 'dark',
      mode: 'dark',
      colors: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        
        secondary: '#6366f1',
        secondaryHover: '#4f46e5',
        secondaryActive: '#4338ca',
        
        background: '#0f172a',
        backgroundSecondary: '#1e293b',
        backgroundTertiary: '#334155',
        
        surface: '#1e293b',
        surfaceHover: '#334155',
        surfaceActive: '#475569',
        
        textPrimary: '#f8fafc',
        textSecondary: '#cbd5e1',
        textTertiary: '#94a3b8',
        textInverse: '#0f172a',
        
        border: '#334155',
        borderHover: '#475569',
        borderActive: '#64748b',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        chartBull: '#10b981',
        chartBear: '#ef4444',
        chartVolume: '#6366f1',
        chartGrid: '#334155',
        
        agentMessage: '#1e293b',
        userMessage: '#3b82f6',
        codeBackground: '#0f172a',
        syntaxHighlight: '#6366f1'
      },
      fonts: {
        primary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        secondary: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        mono: 'JetBrains Mono, Consolas, Monaco, monospace'
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
        lg: '0.75rem',
        full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      animations: {
        fast: '150ms ease-in-out',
        normal: '300ms ease-in-out',
        slow: '500ms ease-in-out'
      }
    };

    // Light theme
    const lightTheme: ThemeConfig = {
      ...darkTheme,
      name: 'light',
      mode: 'light',
      colors: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        primaryActive: '#1d4ed8',
        
        secondary: '#6366f1',
        secondaryHover: '#4f46e5',
        secondaryActive: '#4338ca',
        
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        backgroundTertiary: '#f1f5f9',
        
        surface: '#ffffff',
        surfaceHover: '#f8fafc',
        surfaceActive: '#f1f5f9',
        
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textTertiary: '#64748b',
        textInverse: '#ffffff',
        
        border: '#e2e8f0',
        borderHover: '#cbd5e1',
        borderActive: '#94a3b8',
        
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
        
        chartBull: '#10b981',
        chartBear: '#ef4444',
        chartVolume: '#6366f1',
        chartGrid: '#e2e8f0',
        
        agentMessage: '#f8fafc',
        userMessage: '#3b82f6',
        codeBackground: '#f8fafc',
        syntaxHighlight: '#6366f1'
      }
    };

    this.themes.set('dark', darkTheme);
    this.themes.set('light', lightTheme);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemeConfig {
    return this.currentTheme;
  }

  /**
   * Set theme by name
   */
  setTheme(themeName: string): void {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }

    this.currentTheme = theme;
    this.applyTheme();
    this.notifyObservers();
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme = this.currentTheme.mode === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    this.userPreferences.preferredMode = newTheme;
    this.saveUserPreferences();
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(): void {
    const root = document.documentElement;
    
    // Apply color variables
    Object.entries(this.currentTheme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
      this.cssVariables.set(cssVar, value);
    });

    // Apply font variables
    Object.entries(this.currentTheme.fonts).forEach(([key, value]) => {
      const cssVar = `--font-${key}`;
      root.style.setProperty(cssVar, value);
      this.cssVariables.set(cssVar, value);
    });

    // Apply spacing variables
    Object.entries(this.currentTheme.spacing).forEach(([key, value]) => {
      const cssVar = `--spacing-${key}`;
      root.style.setProperty(cssVar, value);
      this.cssVariables.set(cssVar, value);
    });

    // Apply border radius variables
    Object.entries(this.currentTheme.borderRadius).forEach(([key, value]) => {
      const cssVar = `--radius-${key}`;
      root.style.setProperty(cssVar, value);
      this.cssVariables.set(cssVar, value);
    });

    // Apply shadow variables
    Object.entries(this.currentTheme.shadows).forEach(([key, value]) => {
      const cssVar = `--shadow-${key}`;
      root.style.setProperty(cssVar, value);
      this.cssVariables.set(cssVar, value);
    });

    // Apply animation variables
    Object.entries(this.currentTheme.animations).forEach(([key, value]) => {
      const cssVar = `--animation-${key}`;
      root.style.setProperty(cssVar, value);
      this.cssVariables.set(cssVar, value);
    });

    // Apply theme mode class
    root.classList.remove('light', 'dark');
    root.classList.add(this.currentTheme.mode);
  }

  /**
   * Get CSS variable value
   */
  getCSSVariable(name: string): string | undefined {
    return this.cssVariables.get(name);
  }

  /**
   * Update user preferences
   */
  updateUserPreferences(preferences: Partial<UserThemePreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...preferences };
    this.saveUserPreferences();
    this.applyUserPreferences();
  }

  /**
   * Apply user preferences
   */
  private applyUserPreferences(): void {
    const root = document.documentElement;

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizeMap[this.userPreferences.fontSize]);

    // Apply reduced motion
    if (this.userPreferences.reducedMotion) {
      root.style.setProperty('--animation-fast', '0ms');
      root.style.setProperty('--animation-normal', '0ms');
      root.style.setProperty('--animation-slow', '0ms');
    }

    // Apply high contrast
    if (this.userPreferences.highContrast) {
      this.applyHighContrastMode();
    }

    // Apply custom colors
    if (this.userPreferences.customColors) {
      Object.entries(this.userPreferences.customColors).forEach(([key, value]) => {
        if (value) {
          const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
          root.style.setProperty(cssVar, value);
        }
      });
    }
  }

  /**
   * Apply high contrast mode
   */
  private applyHighContrastMode(): void {
    const root = document.documentElement;
    
    if (this.currentTheme.mode === 'dark') {
      root.style.setProperty('--color-text-primary', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#ffffff');
      root.style.setProperty('--color-border', '#ffffff');
    } else {
      root.style.setProperty('--color-text-primary', '#000000');
      root.style.setProperty('--color-text-secondary', '#000000');
      root.style.setProperty('--color-border', '#000000');
    }
  }

  /**
   * Apply system theme detection
   */
  private applySystemTheme(): void {
    if (this.userPreferences.preferredMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    } else {
      this.setTheme(this.userPreferences.preferredMode);
    }
  }

  /**
   * Setup system theme change listener
   */
  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (this.userPreferences.preferredMode === 'system') {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Load user preferences from localStorage
   */
  private loadUserPreferences(): void {
    try {
      const stored = localStorage.getItem('pinegenie-theme-preferences');
      if (stored) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load theme preferences:', error);
    }
  }

  /**
   * Save user preferences to localStorage
   */
  private saveUserPreferences(): void {
    try {
      localStorage.setItem('pinegenie-theme-preferences', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.warn('Failed to save theme preferences:', error);
    }
  }

  /**
   * Add theme change observer
   */
  addObserver(callback: (theme: ThemeConfig) => void): void {
    this.observers.push(callback);
  }

  /**
   * Remove theme change observer
   */
  removeObserver(callback: (theme: ThemeConfig) => void): void {
    const index = this.observers.indexOf(callback);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  /**
   * Notify observers of theme change
   */
  private notifyObservers(): void {
    this.observers.forEach(callback => {
      try {
        callback(this.currentTheme);
      } catch (error) {
        console.error('Theme observer error:', error);
      }
    });
  }

  /**
   * Validate theme configuration
   */
  validateTheme(theme: ThemeConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required properties
    if (!theme.name) errors.push('Theme name is required');
    if (!theme.mode || !['light', 'dark'].includes(theme.mode)) {
      errors.push('Theme mode must be "light" or "dark"');
    }

    // Validate colors
    const requiredColors = [
      'primary', 'background', 'surface', 'textPrimary', 'border',
      'success', 'warning', 'error', 'info'
    ];
    
    requiredColors.forEach(color => {
      if (!theme.colors[color as keyof ThemeColors]) {
        errors.push(`Required color "${color}" is missing`);
      }
    });

    // Validate color format (basic hex check)
    Object.entries(theme.colors).forEach(([key, value]) => {
      if (value && !value.match(/^#[0-9A-Fa-f]{6}$/)) {
        errors.push(`Color "${key}" must be a valid hex color`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create custom theme
   */
  createCustomTheme(name: string, baseTheme: string, customizations: Partial<ThemeConfig>): void {
    const base = this.themes.get(baseTheme);
    if (!base) {
      throw new Error(`Base theme '${baseTheme}' not found`);
    }

    const customTheme: ThemeConfig = {
      ...base,
      ...customizations,
      name,
      colors: { ...base.colors, ...customizations.colors }
    };

    const validation = this.validateTheme(customTheme);
    if (!validation.isValid) {
      throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
    }

    this.themes.set(name, customTheme);
  }

  /**
   * Export theme as JSON
   */
  exportTheme(themeName: string): string {
    const theme = this.themes.get(themeName);
    if (!theme) {
      throw new Error(`Theme '${themeName}' not found`);
    }

    return JSON.stringify(theme, null, 2);
  }

  /**
   * Import theme from JSON
   */
  importTheme(jsonData: string): void {
    try {
      const theme = JSON.parse(jsonData) as ThemeConfig;
      const validation = this.validateTheme(theme);
      
      if (!validation.isValid) {
        throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
      }

      this.themes.set(theme.name, theme);
    } catch (error) {
      throw new Error(`Failed to import theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get available themes
   */
  getAvailableThemes(): string[] {
    return Array.from(this.themes.keys());
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): UserThemePreferences {
    return { ...this.userPreferences };
  }
}

// Export singleton instance
export const themeConfigManager = new ThemeConfigManager();