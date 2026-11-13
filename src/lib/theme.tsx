import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

export const THEME_STORAGE_KEY = 'learn_rust_theme';

/**
 * Checks system dark mode preference via matchMedia
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Reads stored theme preference from localStorage
 */
export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored as ThemeMode;
    }
  } catch {}
  return 'system';
}

/**
 * Toggles the 'dark' CSS class on document.documentElement
 */
export function applyThemeClass(resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'system',
  storageKey = THEME_STORAGE_KEY,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored as ThemeMode;
      }
    } catch {}
    return defaultTheme;
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => getSystemTheme());

  // Listen to prefers-color-scheme media query changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const resolvedTheme: 'light' | 'dark' = useMemo(() => {
    if (theme === 'dark') return 'dark';
    if (theme === 'light') return 'light';
    return systemTheme;
  }, [theme, systemTheme]);

  // Sync class on documentElement
  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      const safeTheme: ThemeMode =
        newTheme === 'light' || newTheme === 'dark' || newTheme === 'system'
          ? newTheme
          : 'system';
      setThemeState(safeTheme);
      try {
        localStorage.setItem(storageKey, safeTheme);
      } catch (e) {
        console.warn('Failed to save theme to localStorage', e);
      }
    },
    [storageKey]
  );

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * useTheme hook with safe fallback for isolated usage outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context) {
    return context;
  }

  // Graceful fallback when called outside a provider
  let domIsDark = false;
  if (typeof document !== 'undefined') {
    domIsDark = document.documentElement.classList.contains('dark');
  }

  const storedTheme = getStoredTheme();
  const sysTheme = getSystemTheme();
  let fallbackResolved: 'light' | 'dark' = domIsDark ? 'dark' : sysTheme;
  if (storedTheme === 'dark') fallbackResolved = 'dark';
  else if (storedTheme === 'light') fallbackResolved = 'light';
  else if (storedTheme === 'system') fallbackResolved = sysTheme;

  return {
    theme: storedTheme,
    resolvedTheme: fallbackResolved,
    setTheme: (newTheme: ThemeMode) => {
      const safeTheme: ThemeMode =
        newTheme === 'light' || newTheme === 'dark' || newTheme === 'system'
          ? newTheme
          : 'system';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
      } catch {}
      const targetResolved = safeTheme === 'system' ? getSystemTheme() : safeTheme;
      applyThemeClass(targetResolved);
    },
  };
}
