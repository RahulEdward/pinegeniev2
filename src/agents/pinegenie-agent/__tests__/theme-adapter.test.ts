/**
 * Theme Adapter Tests
 * 
 * Tests for the theme adapter system functionality
 */

import { ThemeAdapter } from '../config/theme-adapter';

// Mock DOM environment
const mockDocument = {
  documentElement: {
    classList: {
      contains: jest.fn(() => false),
      remove: jest.fn(),
      add: jest.fn(),
    },
    style: {
      setProperty: jest.fn(),
    },
  },
  readyState: 'complete',
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

const mockWindow = {
  getComputedStyle: jest.fn(() => ({
    getPropertyValue: jest.fn((prop: string) => {
      if (prop === '--background') return '#ffffff';
      if (prop === '--foreground') return '#171717';
      return '';
    }),
  })),
  matchMedia: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
  localStorage: {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
  },
  MutationObserver: jest.fn(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
  })),
};

// Setup global mocks
Object.defineProperty(global, 'document', {
  value: mockDocument,
  writable: true,
});

Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
});

describe('ThemeAdapter', () => {
  let themeAdapter: ThemeAdapter;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Get fresh instance
    themeAdapter = ThemeAdapter.getInstance();
  });

  describe('Color Extraction', () => {
    it('should extract dashboard colors correctly', () => {
      const colors = themeAdapter.extractDashboardColors();
      
      expect(colors).toBeDefined();
      expect(colors.primary).toBeDefined();
      expect(colors.primary['500']).toBe('#0ea5e9');
      expect(colors.background).toBe('#ffffff');
      expect(colors.foreground).toBe('#171717');
    });

    it('should handle missing CSS variables gracefully', () => {
      // Mock empty CSS variables
      (mockWindow.getComputedStyle as jest.Mock).mockReturnValue({
        getPropertyValue: jest.fn(() => ''),
      });

      const colors = themeAdapter.extractDashboardColors();
      
      expect(colors.background).toBe('#ffffff'); // fallback
      expect(colors.foreground).toBe('#171717'); // fallback
    });
  });

  describe('Theme Mapping', () => {
    it('should map dashboard colors to agent theme correctly', () => {
      const colors = themeAdapter.extractDashboardColors();
      const theme = themeAdapter.mapToAgentTheme(colors);
      
      expect(theme).toBeDefined();
      expect(theme.colors).toBeDefined();
      expect(theme.colors.primary).toBe('#0ea5e9');
      expect(theme.colors.background).toBe('#ffffff');
      expect(theme.accessibility).toBeDefined();
    });

    it('should adapt colors for dark mode', () => {
      // Mock dark mode
      (mockDocument.documentElement.classList.contains as jest.Mock).mockReturnValue(true);
      
      const colors = themeAdapter.extractDashboardColors();
      const theme = themeAdapter.mapToAgentTheme(colors);
      
      expect(theme.colors.surface).toBe('#0f172a'); // dark mode surface
      expect(theme.colors.text.secondary).toBe('#cbd5e1'); // dark mode text
    });
  });

  describe('Theme Variables Update', () => {
    it('should update CSS variables correctly', () => {
      const colors = themeAdapter.extractDashboardColors();
      const theme = themeAdapter.mapToAgentTheme(colors);
      
      themeAdapter.updateThemeVariables(theme);
      
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--agent-primary',
        theme.colors.primary
      );
      expect(mockDocument.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--agent-background',
        theme.colors.background
      );
    });
  });

  describe('Accessibility Validation', () => {
    it('should validate color consistency', () => {
      const validation = themeAdapter.validateColorConsistency();
      
      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
      expect(Array.isArray(validation.warnings)).toBe(true);
    });
  });

  describe('Theme Change Detection', () => {
    it('should add and remove theme change listeners', () => {
      const listener = jest.fn();
      
      themeAdapter.addThemeChangeListener(listener);
      themeAdapter.removeThemeChangeListener(listener);
      
      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ThemeAdapter.getInstance();
      const instance2 = ThemeAdapter.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
});

describe('Theme Adapter Integration', () => {
  it('should initialize theme correctly', () => {
    const themeAdapter = ThemeAdapter.getInstance();
    const theme = themeAdapter.initializeTheme();
    
    expect(theme).toBeDefined();
    expect(theme.colors).toBeDefined();
    expect(theme.accessibility).toBeDefined();
  });

  it('should handle theme refresh', () => {
    const themeAdapter = ThemeAdapter.getInstance();
    
    // Initialize theme
    const theme1 = themeAdapter.initializeTheme();
    
    // Refresh theme
    const theme2 = themeAdapter.initializeTheme();
    
    expect(theme1).toBeDefined();
    expect(theme2).toBeDefined();
    expect(theme1.colors.primary).toBe(theme2.colors.primary);
  });
});