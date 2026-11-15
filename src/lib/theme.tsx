import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

export const THEME_STORAGE_KEY = 'learn_rust_theme';
export const THEME_CHANGE_EVENT = 'learn_rust_theme_change';

export const THEME_OPTIONS: ReadonlyArray<{
  mode: ThemeMode;
  labelKey: string;
  toggleKey: string;
}> = [
  { mode: 'light', labelKey: 'nav.themeLight', toggleKey: 'nav.themeToggleLight' },
  { mode: 'dark', labelKey: 'nav.themeDark', toggleKey: 'nav.themeToggleDark' },
  { mode: 'system', labelKey: 'nav.themeSystem', toggleKey: 'nav.themeToggleSystem' },
];

interface ThemeChangeDetail {
  theme: ThemeMode;
  storageKey: string;
}

export function normalizeThemeMode(value: unknown, fallback: ThemeMode = 'system'): ThemeMode {
  if (value === 'light' || value === 'dark' || value === 'system') {
    return value;
  }
  return fallback;
}

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
export function getStoredTheme(storageKey: string = THEME_STORAGE_KEY): ThemeMode {
  if (typeof window === 'undefined') return 'system';
  try {
    return normalizeThemeMode(localStorage.getItem(storageKey), 'system');
  } catch {}
  return 'system';
}

export function resolveThemeMode(theme: ThemeMode, systemTheme: 'light' | 'dark' = getSystemTheme()): 'light' | 'dark' {
  if (theme === 'dark') return 'dark';
  if (theme === 'light') return 'light';
  return systemTheme;
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

function persistAndBroadcastTheme(theme: ThemeMode, storageKey: string) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch (e) {
    console.warn('Failed to save theme to localStorage', e);
  }
  applyThemeClass(resolveThemeMode(theme));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<ThemeChangeDetail>(THEME_CHANGE_EVENT, {
        detail: { theme, storageKey },
      })
    );
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

  // Synchronize across nested providers, standalone callers, and other browser tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleThemeEvent = (e: Event) => {
      const detail = (e as CustomEvent<ThemeChangeDetail>).detail;
      if (detail && detail.storageKey === storageKey) {
        const nextTheme = normalizeThemeMode(detail.theme, defaultTheme);
        setThemeState((prev) => (prev === nextTheme ? prev : nextTheme));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey || e.key === null) {
        const nextTheme = normalizeThemeMode(e.newValue, defaultTheme);
        setThemeState((prev) => (prev === nextTheme ? prev : nextTheme));
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [storageKey, defaultTheme]);

  const resolvedTheme: 'light' | 'dark' = useMemo(
    () => resolveThemeMode(theme, systemTheme),
    [theme, systemTheme]
  );

  // Sync class on documentElement
  useEffect(() => {
    applyThemeClass(resolvedTheme);
  }, [resolvedTheme]);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      const safeTheme = normalizeThemeMode(newTheme, 'system');
      setThemeState(safeTheme);
      persistAndBroadcastTheme(safeTheme, storageKey);
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
  const [fallbackTheme, setFallbackTheme] = useState<ThemeMode>(() => getStoredTheme());

  useEffect(() => {
    if (context || typeof window === 'undefined') return;

    const syncFromStorage = () => {
      setFallbackTheme(getStoredTheme());
    };

    const handleThemeEvent = (e: Event) => {
      const detail = (e as CustomEvent<ThemeChangeDetail>).detail;
      if (!detail || detail.storageKey === THEME_STORAGE_KEY) {
        setFallbackTheme(normalizeThemeMode(detail?.theme, getStoredTheme()));
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY || e.key === null) {
        syncFromStorage();
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeEvent);
      window.removeEventListener('storage', handleStorage);
    };
  }, [context]);

  const fallbackSetTheme = useCallback((newTheme: ThemeMode) => {
    const safeTheme = normalizeThemeMode(newTheme, 'system');
    setFallbackTheme(safeTheme);
    persistAndBroadcastTheme(safeTheme, THEME_STORAGE_KEY);
  }, []);

  if (context) {
    return context;
  }

  // Graceful fallback when called outside a provider
  const sysTheme = getSystemTheme();
  const fallbackResolved = resolveThemeMode(fallbackTheme, sysTheme);

  return {
    theme: fallbackTheme,
    resolvedTheme: fallbackResolved,
    setTheme: fallbackSetTheme,
  };
}
