import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  ThemeProvider,
  useTheme,
  getSystemTheme,
  getStoredTheme,
  applyThemeClass,
  THEME_STORAGE_KEY,
} from '@/lib/theme';

function createMatchMediaMock(matches: boolean) {
  let currentMatches = matches;
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];

  return vi.fn().mockImplementation((query: string) => ({
    matches: currentMatches,
    media: query,
    onchange: null,
    addListener: vi.fn((fn) => listeners.push(fn)),
    removeListener: vi.fn((fn) => {
      const idx = listeners.indexOf(fn);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    addEventListener: vi.fn((event: string, fn: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') listeners.push(fn);
    }),
    removeEventListener: vi.fn((event: string, fn: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const idx = listeners.indexOf(fn);
        if (idx !== -1) listeners.splice(idx, 1);
      }
    }),
    dispatchEvent: vi.fn((event: Event) => {
      listeners.forEach((listener) => listener(event as unknown as MediaQueryListEvent));
      return true;
    }),
    _setMatches(newMatches: boolean) {
      currentMatches = newMatches;
      const event = { matches: newMatches, media: query } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  }));
}

const ThemeConsumer: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="resolved-theme">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
};

describe('Theming Engine (src/lib/theme.tsx)', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  it('initializes to system theme mode and resolves light when system is light', () => {
    window.matchMedia = createMatchMediaMock(false);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('initializes to system theme mode and resolves dark when system is dark', () => {
    window.matchMedia = createMatchMediaMock(true);
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('loads explicit dark theme from localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    window.matchMedia = createMatchMediaMock(false);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('loads explicit light theme from localStorage even if system preference is dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    window.matchMedia = createMatchMediaMock(true);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('switches between themes on setTheme and writes to localStorage', async () => {
    const user = userEvent.setup();
    window.matchMedia = createMatchMediaMock(false);

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    const darkBtn = screen.getByRole('button', { name: 'Set Dark' });
    await user.click(darkBtn);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const lightBtn = screen.getByRole('button', { name: 'Set Light' });
    await user.click(lightBtn);

    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reacts dynamically to system prefers-color-scheme changes when in system mode', () => {
    const mm = createMatchMediaMock(false);
    window.matchMedia = mm;

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    act(() => {
      const instance = mm.mock.results[0]?.value;
      instance._setMatches(true);
    });

    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('gracefully falls back when useTheme() is called outside ThemeProvider without throwing', async () => {
    const user = userEvent.setup();
    window.matchMedia = createMatchMediaMock(false);

    // Render directly without ThemeProvider wrapper
    render(<ThemeConsumer />);

    expect(screen.getByTestId('current-theme')).toBeInTheDocument();
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');

    const darkBtn = screen.getByRole('button', { name: 'Set Dark' });
    await user.click(darkBtn);

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('getSystemTheme and applyThemeClass utility functions work standalone', () => {
    window.matchMedia = createMatchMediaMock(true);
    expect(getSystemTheme()).toBe('dark');

    applyThemeClass('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    applyThemeClass('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('synchronizes nested ThemeProviders and prevents stale outer matchMedia overrides', async () => {
    const user = userEvent.setup();
    const mm = createMatchMediaMock(false);
    window.matchMedia = mm;

    render(
      <ThemeProvider>
        <div data-testid="outer">
          <ThemeConsumer />
        </div>
        <ThemeProvider>
          <div data-testid="inner">
            <ThemeConsumer />
          </div>
        </ThemeProvider>
      </ThemeProvider>
    );

    const innerDarkBtn = screen.getAllByRole('button', { name: 'Set Dark' })[1];
    await user.click(innerDarkBtn);

    const themeSpans = screen.getAllByTestId('current-theme');
    expect(themeSpans[0]).toHaveTextContent('dark');
    expect(themeSpans[1]).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // OS switches to light while explicit 'dark' is active -> must stay dark
    act(() => {
      const instance = mm.mock.results[0]?.value;
      instance._setMatches(false);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('configures Tailwind v4 class-based dark variant and color-scheme in src/index.css', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf-8');

    expect(css).toMatch(/@custom-variant\s+dark\s+\(&:where\(\.dark,\s*\.dark\s*\*\)\);/);
    expect(css).toContain('color-scheme: light;');
    expect(css).toContain('color-scheme: dark;');
    expect(css).not.toContain('color-scheme: light dark;');
  });
});
