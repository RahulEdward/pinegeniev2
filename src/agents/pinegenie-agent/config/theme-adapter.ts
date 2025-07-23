/**
 * Theme Adapter System for Kiro-Style Pine Script Agent
 * 
 * This system extracts dashboard colors and maps them to agent components
 * while ensuring accessibility compliance and automatic theme updates.
 */

export interface DashboardColorPalette {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  danger: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  background: string;
  foreground: string;
}

export interface AgentTheme {
  colors: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderHover: string;
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    status: {
      success: string;
      successBg: string;
      warning: string;
      warningBg: string;
      error: string;
      errorBg: string;
      info: string;
      infoBg: string;
    };
    chat: {
      userBubble: string;
      userBubbleText: string;
      agentBubble: string;
      agentBubbleText: string;
      inputBg: string;
      inputBorder: string;
      inputText: string;
      inputPlaceholder: string;
    };
  };
  accessibility: {
    contrastRatios: Record<string, number>;
    isCompliant: boolean;
    warnings: string[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  contrastIssues: Array<{
    foreground: string;
    background: string;
    ratio: number;
    required: number;
    level: 'AA' | 'AAA';
  }>;
}

export interface ThemeChangeEvent {
  theme: 'light' | 'dark';
  colors: AgentTheme;
  timestamp: Date;
}

export type ThemeChangeListener = (event: ThemeChangeEvent) => void;

/**
 * Theme Adapter Class
 * 
 * Handles extraction of dashboard colors, mapping to agent theme,
 * validation for accessibility, and automatic theme updates.
 */
export class ThemeAdapter {
  private static instance: ThemeAdapter;
  private currentTheme: AgentTheme | null = null;
  private listeners: Set<ThemeChangeListener> = new Set();
  private observer: MutationObserver | null = null;
  private mediaQuery: MediaQueryList | null = null;

  private constructor() {
    this.initializeThemeDetection();
  }

  public static getInstance(): ThemeAdapter {
    if (!ThemeAdapter.instance) {
      ThemeAdapter.instance = new ThemeAdapter();
    }
    return ThemeAdapter.instance;
  }

  /**
   * Extract current dashboard color palette from CSS variables and Tailwind config
   * This matches your main app's exact theme structure
   */
  public extractDashboardColors(): DashboardColorPalette {
    const computedStyle = getComputedStyle(document.documentElement);
    
    // Extract CSS custom properties - these match your globals.css exactly
    const background = computedStyle.getPropertyValue('--background').trim() || 
      (this.isDarkMode() ? '#0a0a0a' : '#ffffff');
    const foreground = computedStyle.getPropertyValue('--foreground').trim() || 
      (this.isDarkMode() ? '#ededed' : '#171717');

    // Extract Tailwind color palette - these match your tailwind.config.js exactly
    const palette: DashboardColorPalette = {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Your main primary color
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49',
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b', // Your dark mode backgrounds
        900: '#0f172a',
        950: '#020617',
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
      },
      danger: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      background,
      foreground,
    };

    return palette;
  }

  /**
   * Map dashboard colors to agent theme - 100% matching your main app's theme
   */
  public mapToAgentTheme(colors: DashboardColorPalette): AgentTheme {
    const isDark = this.isDarkMode();
    
    const agentTheme: AgentTheme = {
      colors: {
        // Primary colors - exactly matching your app's primary blue
        primary: colors.primary[500], // #0ea5e9
        primaryHover: colors.primary[600], // #0284c7
        primaryActive: colors.primary[700], // #0369a1
        
        // Secondary colors - matching your slate theme
        secondary: colors.secondary[500], // #64748b
        secondaryHover: colors.secondary[600], // #475569
        
        // Accent color for highlights
        accent: colors.primary[400], // #38bdf8
        
        // Background and surface colors - exactly matching your app
        background: colors.background, // #0a0a0a dark, #ffffff light
        surface: isDark ? colors.secondary[800] : colors.secondary[50], // #1e293b dark, #f8fafc light
        surfaceHover: isDark ? colors.secondary[700] : colors.secondary[100], // #334155 dark, #f1f5f9 light
        
        // Border colors - matching your app's subtle borders
        border: isDark ? colors.secondary[700] : colors.secondary[200], // #334155 dark, #e2e8f0 light
        borderHover: isDark ? colors.secondary[600] : colors.secondary[300], // #475569 dark, #cbd5e1 light
        
        // Text colors - exactly matching your globals.css
        text: {
          primary: colors.foreground, // #ededed dark, #171717 light
          secondary: isDark ? colors.secondary[300] : colors.secondary[600], // #cbd5e1 dark, #475569 light
          muted: isDark ? colors.secondary[400] : colors.secondary[500], // #94a3b8 dark, #64748b light
          inverse: colors.background === '#0a0a0a' ? '#ffffff' : '#000000',
        },
        
        // Status colors - matching your tailwind config
        status: {
          success: colors.success[500], // #22c55e
          successBg: isDark ? colors.success[950] : colors.success[50],
          warning: colors.warning[500], // #f59e0b
          warningBg: isDark ? colors.warning[950] : colors.warning[50],
          error: colors.danger[500], // #ef4444
          errorBg: isDark ? colors.danger[950] : colors.danger[50],
          info: colors.primary[500], // #0ea5e9
          infoBg: isDark ? colors.primary[950] : colors.primary[50],
        },
        
        // Chat-specific colors - perfectly matching your app's style
        chat: {
          userBubble: colors.primary[500], // #0ea5e9 - your primary blue
          userBubbleText: '#ffffff',
          agentBubble: isDark ? colors.secondary[800] : colors.secondary[50], // #1e293b dark, #f8fafc light
          agentBubbleText: colors.foreground,
          inputBg: isDark ? colors.secondary[900] : '#ffffff', // #0f172a dark, #ffffff light
          inputBorder: isDark ? colors.secondary[700] : colors.secondary[300], // #334155 dark, #cbd5e1 light
          inputText: colors.foreground,
          inputPlaceholder: isDark ? colors.secondary[400] : colors.secondary[500], // #94a3b8 dark, #64748b light
        },
      },
      accessibility: {
        contrastRatios: {},
        isCompliant: false,
        warnings: [],
      },
    };

    // Calculate accessibility metrics
    agentTheme.accessibility = this.validateAccessibility(agentTheme);

    return agentTheme;
  }

  /**
   * Validate color accessibility compliance (WCAG 2.1 AA standards)
   */
  public validateColorConsistency(): ValidationResult {
    if (!this.currentTheme) {
      return {
        isValid: false,
        errors: ['No theme loaded'],
        warnings: [],
        contrastIssues: [],
      };
    }

    const accessibilityResult = this.validateAccessibility(this.currentTheme);
    
    return {
      isValid: accessibilityResult.isCompliant,
      errors: accessibilityResult.isCompliant ? [] : ['Theme has accessibility issues'],
      warnings: accessibilityResult.warnings,
      contrastIssues: accessibilityResult.contrastIssues,
    };
  }

  /**
   * Update theme variables in the DOM
   */
  public updateThemeVariables(theme: AgentTheme): void {
    const root = document.documentElement;
    
    // Set CSS custom properties for agent theme
    root.style.setProperty('--agent-primary', theme.colors.primary);
    root.style.setProperty('--agent-primary-hover', theme.colors.primaryHover);
    root.style.setProperty('--agent-primary-active', theme.colors.primaryActive);
    root.style.setProperty('--agent-secondary', theme.colors.secondary);
    root.style.setProperty('--agent-secondary-hover', theme.colors.secondaryHover);
    root.style.setProperty('--agent-accent', theme.colors.accent);
    root.style.setProperty('--agent-background', theme.colors.background);
    root.style.setProperty('--agent-surface', theme.colors.surface);
    root.style.setProperty('--agent-surface-hover', theme.colors.surfaceHover);
    root.style.setProperty('--agent-border', theme.colors.border);
    root.style.setProperty('--agent-border-hover', theme.colors.borderHover);
    
    // Text colors
    root.style.setProperty('--agent-text-primary', theme.colors.text.primary);
    root.style.setProperty('--agent-text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--agent-text-muted', theme.colors.text.muted);
    root.style.setProperty('--agent-text-inverse', theme.colors.text.inverse);
    
    // Status colors
    root.style.setProperty('--agent-success', theme.colors.status.success);
    root.style.setProperty('--agent-success-bg', theme.colors.status.successBg);
    root.style.setProperty('--agent-warning', theme.colors.status.warning);
    root.style.setProperty('--agent-warning-bg', theme.colors.status.warningBg);
    root.style.setProperty('--agent-error', theme.colors.status.error);
    root.style.setProperty('--agent-error-bg', theme.colors.status.errorBg);
    root.style.setProperty('--agent-info', theme.colors.status.info);
    root.style.setProperty('--agent-info-bg', theme.colors.status.infoBg);
    
    // Chat colors
    root.style.setProperty('--agent-chat-user-bubble', theme.colors.chat.userBubble);
    root.style.setProperty('--agent-chat-user-text', theme.colors.chat.userBubbleText);
    root.style.setProperty('--agent-chat-agent-bubble', theme.colors.chat.agentBubble);
    root.style.setProperty('--agent-chat-agent-text', theme.colors.chat.agentBubbleText);
    root.style.setProperty('--agent-chat-input-bg', theme.colors.chat.inputBg);
    root.style.setProperty('--agent-chat-input-border', theme.colors.chat.inputBorder);
    root.style.setProperty('--agent-chat-input-text', theme.colors.chat.inputText);
    root.style.setProperty('--agent-chat-input-placeholder', theme.colors.chat.inputPlaceholder);

    this.currentTheme = theme;
  }

  /**
   * Get current agent theme
   */
  public getCurrentTheme(): AgentTheme | null {
    return this.currentTheme;
  }

  /**
   * Initialize and return the current theme
   */
  public initializeTheme(): AgentTheme {
    const colors = this.extractDashboardColors();
    const theme = this.mapToAgentTheme(colors);
    this.updateThemeVariables(theme);
    return theme;
  }
  
  /**
   * Toggle between light and dark theme
   */
  public toggleTheme(): void {
    if (typeof window === 'undefined') return;
    
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    
    // Theme will be updated via the mutation observer
  }

  /**
   * Add theme change listener
   */
  public addThemeChangeListener(listener: ThemeChangeListener): void {
    this.listeners.add(listener);
  }

  /**
   * Remove theme change listener
   */
  public removeThemeChangeListener(listener: ThemeChangeListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of theme change
   */
  private notifyThemeChange(theme: 'light' | 'dark'): void {
    if (!this.currentTheme) return;

    const event: ThemeChangeEvent = {
      theme,
      colors: this.currentTheme,
      timestamp: new Date(),
    };

    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in theme change listener:', error);
      }
    });
  }

  /**
   * Initialize theme change detection
   */
  private initializeThemeDetection(): void {
    if (typeof window === 'undefined') return;

    // Initialize theme based on localStorage or system preference
    this.initializeInitialTheme();

    // Watch for class changes on document element (dark/light mode)
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          const theme = isDark ? 'dark' : 'light';
          
          // Re-initialize theme with new mode immediately
          const colors = this.extractDashboardColors();
          const agentTheme = this.mapToAgentTheme(colors);
          this.updateThemeVariables(agentTheme);
          this.notifyThemeChange(theme);
          
          // Update localStorage to persist theme preference
          localStorage.setItem('theme', theme);
        }
      });
    });

    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Watch for system theme changes
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', (e) => {
      // Only respond if no explicit theme is set
      const storedTheme = localStorage.getItem('theme');
      if (!storedTheme || storedTheme === 'system') {
        const theme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
      }
    });
  }

  /**
   * Initialize theme based on stored preference or system preference
   */
  private initializeInitialTheme(): void {
    try {
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      let shouldBeDark = false;
      
      if (storedTheme === 'dark') {
        shouldBeDark = true;
      } else if (storedTheme === 'light') {
        shouldBeDark = false;
      } else {
        // No stored preference, use system preference
        shouldBeDark = systemPrefersDark;
      }
      
      // Apply theme class
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(shouldBeDark ? 'dark' : 'light');
      
      // Store the preference
      localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');
    } catch (error) {
      console.warn('Failed to initialize theme:', error);
      // Fallback to light theme
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
    }
  }

  /**
   * Check if current mode is dark
   */
  private isDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(foreground: string, background: string): number {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Validate accessibility of theme colors
   */
  private validateAccessibility(theme: AgentTheme): {
    contrastRatios: Record<string, number>;
    isCompliant: boolean;
    warnings: string[];
    contrastIssues: Array<{
      foreground: string;
      background: string;
      ratio: number;
      required: number;
      level: 'AA' | 'AAA';
    }>;
  } {
    const contrastRatios: Record<string, number> = {};
    const warnings: string[] = [];
    const contrastIssues: Array<{
      foreground: string;
      background: string;
      ratio: number;
      required: number;
      level: 'AA' | 'AAA';
    }> = [];
    let isCompliant = true;

    // Define color pairs to check
    const colorPairs = [
      { name: 'primary-text', fg: theme.colors.text.inverse, bg: theme.colors.primary },
      { name: 'secondary-text', fg: theme.colors.text.primary, bg: theme.colors.secondary },
      { name: 'surface-text', fg: theme.colors.text.primary, bg: theme.colors.surface },
      { name: 'background-text', fg: theme.colors.text.primary, bg: theme.colors.background },
      { name: 'user-chat', fg: theme.colors.chat.userBubbleText, bg: theme.colors.chat.userBubble },
      { name: 'agent-chat', fg: theme.colors.chat.agentBubbleText, bg: theme.colors.chat.agentBubble },
      { name: 'success-text', fg: theme.colors.status.success, bg: theme.colors.status.successBg },
      { name: 'warning-text', fg: theme.colors.status.warning, bg: theme.colors.status.warningBg },
      { name: 'error-text', fg: theme.colors.status.error, bg: theme.colors.status.errorBg },
    ];

    colorPairs.forEach(({ name, fg, bg }) => {
      try {
        const ratio = this.calculateContrastRatio(fg, bg);
        contrastRatios[name] = ratio;

        // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
        if (ratio < 4.5) {
          isCompliant = false;
          warnings.push(`Low contrast ratio for ${name}: ${ratio.toFixed(2)}:1 (minimum 4.5:1)`);
          contrastIssues.push({
            foreground: fg,
            background: bg,
            ratio,
            required: 4.5,
            level: 'AA',
          });
        }
      } catch (error) {
        warnings.push(`Could not calculate contrast for ${name}: ${error}`);
      }
    });

    return {
      contrastRatios,
      isCompliant,
      warnings,
      contrastIssues,
    };
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', () => {});
      this.mediaQuery = null;
    }
    this.listeners.clear();
  }
}

// Export singleton instance
export const themeAdapter = ThemeAdapter.getInstance();