export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: string;
  borderRadius: 'sm' | 'md' | 'lg' | 'xl';
  animation: boolean;
  fontFamily: 'default' | 'serif' | 'mono';
}

export const defaultThemeConfig: ThemeConfig = {
  mode: 'system',
  primaryColor: 'blue',
  borderRadius: 'md',
  animation: true,
  fontFamily: 'default',
};

export function getThemeFromLocalStorage(): ThemeConfig {
  if (typeof window === 'undefined') {
    return defaultThemeConfig;
  }

  try {
    const storedTheme = localStorage.getItem('theme-config');
    if (storedTheme) {
      return JSON.parse(storedTheme) as ThemeConfig;
    }
  } catch (error) {
    console.error('Error reading theme from localStorage:', error);
  }

  return defaultThemeConfig;
}

export function saveThemeToLocalStorage(theme: ThemeConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('theme-config', JSON.stringify(theme));
  } catch (error) {
    console.error('Error saving theme to localStorage:', error);
  }
}

export function applyTheme(theme: ThemeConfig): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Apply theme mode
  const isDark = 
    theme.mode === 'dark' || 
    (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(isDark ? 'dark' : 'light');

  // Apply primary color
  document.documentElement.style.setProperty('--color-primary', `var(--color-${theme.primaryColor}-500)`);
  
  // Apply border radius
  document.documentElement.style.setProperty('--border-radius', `var(--radius-${theme.borderRadius})`);
  
  // Apply animations
  document.documentElement.classList.toggle('reduce-motion', !theme.animation);
  
  // Apply font family
  document.documentElement.style.setProperty('--font-family', `var(--font-${theme.fontFamily})`);
}

export function initializeTheme(): void {
  const theme = getThemeFromLocalStorage();
  applyTheme(theme);
  
  // Listen for system theme changes if using system theme
  if (theme.mode === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => applyTheme(theme));
  }
}