import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { ThemeMode, ThemeConfig, ThemeContextType } from '../types/theme';

const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: '#3b82f6',
    secondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#22c55e',
    warning: '#fbbf24',
    error: '#f87171',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeConfig>(lightTheme);

  // Get system theme preference
  const getSystemTheme = (): ThemeMode => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Load theme from localStorage or use system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as ThemeMode;
    const initialTheme = savedTheme || getSystemTheme();
    setTheme(initialTheme);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme.mode);
  }, [theme.mode]);

  const setTheme = (mode: ThemeMode) => {
    const newTheme = mode === 'dark' ? darkTheme : lightTheme;
    setThemeState(newTheme);
    localStorage.setItem('theme', mode);
  };

  const toggleTheme = useCallback(() => {
    const newMode = theme.mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  }, [theme.mode]);

  const value: ThemeContextType = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}