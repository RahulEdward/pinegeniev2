import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeColors {
  bg: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    glass: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
  };
  border: {
    primary: string;
    secondary: string;
    accent: string;
  };
  accent: {
    blue: string;
    purple: string;
    green: string;
    orange: string;
    red: string;
    indigo: string;
  };
}

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const colors: ThemeColors = isDark
    ? {
        bg: {
          primary: 'from-slate-900 via-slate-800 to-slate-900',
          secondary: 'bg-slate-800/80',
          tertiary: 'bg-slate-700/50',
          card: 'bg-slate-800/30',
          glass: 'bg-slate-800/80 backdrop-blur-xl',
        },
        text: {
          primary: 'text-white',
          secondary: 'text-slate-300',
          tertiary: 'text-slate-400',
          muted: 'text-slate-500',
        },
        border: {
          primary: 'border-slate-700/50',
          secondary: 'border-slate-600/30',
          accent: 'border-blue-500/50',
        },
        accent: {
          blue: 'from-blue-500 to-cyan-500',
          purple: 'from-purple-500 to-pink-500',
          green: 'from-green-500 to-emerald-500',
          orange: 'from-amber-500 to-orange-500',
          red: 'from-red-500 to-pink-500',
          indigo: 'from-indigo-500 to-purple-500',
        },
      }
    : {
        bg: {
          primary: 'from-gray-50 via-white to-gray-50',
          secondary: 'bg-white/90',
          tertiary: 'bg-gray-100/80',
          card: 'bg-white/60',
          glass: 'bg-white/80 backdrop-blur-xl',
        },
        text: {
          primary: 'text-gray-900',
          secondary: 'text-gray-700',
          tertiary: 'text-gray-600',
          muted: 'text-gray-500',
        },
        border: {
          primary: 'border-gray-200',
          secondary: 'border-gray-300/50',
          accent: 'border-blue-400/50',
        },
        accent: {
          blue: 'from-blue-400 to-cyan-400',
          purple: 'from-purple-400 to-pink-400',
          green: 'from-green-400 to-emerald-400',
          orange: 'from-amber-400 to-orange-400',
          red: 'from-red-400 to-pink-400',
          indigo: 'from-indigo-400 to-purple-400',
        },
      };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}; 