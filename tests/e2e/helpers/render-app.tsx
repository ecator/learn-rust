import React from 'react';
import { render, RenderResult } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routesConfig } from '@/routes/routesConfig';

export interface RenderAppOptions {
  route?: string;
  initialEntries?: string[];
  initialIndex?: number;
  theme?: 'light' | 'dark' | 'system';
  language?: 'zh' | 'en' | 'ja';
  container?: HTMLElement;
}

/**
 * Normalizes route path ensuring the GitHub Pages base path '/learn-rust' is respected.
 */
function normalizeRoute(route: string): string {
  const sanitized = route.replace(/\/+/g, '/');
  if (sanitized.startsWith('/learn-rust')) {
    return sanitized;
  }
  const clean = sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
  return `/learn-rust${clean}`;
}

export function initializeTheme(): 'light' | 'dark' {
  try {
    const stored = localStorage.getItem('learn_rust_theme');
    const systemDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    const isDark = stored === 'dark' || (!stored && systemDark) || (stored === 'system' && systemDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
      return 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      return 'light';
    }
  } catch {
    return 'light';
  }
}

export function initializeLanguage(): 'zh' | 'en' | 'ja' {
  try {
    const stored = localStorage.getItem('learn_rust_lang');
    if (stored === 'zh' || stored === 'en' || stored === 'ja') {
      document.documentElement.lang = stored;
      return stored;
    }
    const navLang = (navigator.language || '').toLowerCase();
    let detected: 'zh' | 'en' | 'ja' = 'zh';
    if (navLang.startsWith('en')) detected = 'en';
    else if (navLang.startsWith('ja')) detected = 'ja';
    else detected = 'zh';
    document.documentElement.lang = detected;
    return detected;
  } catch {
    document.documentElement.lang = 'zh';
    return 'zh';
  }
}

export type RenderAppResult = RenderResult & {
  router: ReturnType<typeof createMemoryRouter>;
};

/**
 * Universal E2E Test App Renderer
 * Supports custom initial routes with basename='/learn-rust'
 */
export function renderApp(options: RenderAppOptions = {}): RenderAppResult {
  const {
    route = '/learn-rust/',
    initialEntries,
    initialIndex = 0,
    theme,
    language,
    container,
  } = options;

  if (theme) {
    localStorage.setItem('learn_rust_theme', theme);
  }
  initializeTheme();

  if (language) {
    localStorage.setItem('learn_rust_lang', language);
  }
  initializeLanguage();

  const entries = initialEntries
    ? initialEntries.map(normalizeRoute)
    : [normalizeRoute(route)];

  const router = createMemoryRouter(routesConfig, {
    basename: '/learn-rust',
    initialEntries: entries,
    initialIndex,
  });

  const renderResult = render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
    container ? { container } : undefined
  );

  return Object.assign(renderResult, { router });
}
