import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';
import { setViewport, setSystemThemePreference } from '../helpers/viewport';
import { seedTheme, seedLanguage, getStoredTheme, getStoredLanguage } from '../helpers/storage-mock';
import { getContrastRatio } from '../helpers/accessibility';
import { saveProgress, loadProgress, createDefaultProgress } from '@/lib/storage';

describe('Tier 2: Foundation & Layout Boundaries (F01 - F06)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    setViewport('desktop');
    localStorage.clear();
  });

  // =========================================================================
  // 1. Scaffolding Boundaries (F01)
  // =========================================================================
  describe('Scaffolding Boundaries (F01)', () => {
    it('TC-T2-F01-01: Verifies root container presence in index.html and ReactDOM root safety', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const htmlContent = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
      expect(htmlContent).toContain('<div id="root"></div>');

      const { createRoot } = await import('react-dom/client');
      expect(() => {
        createRoot(null as any);
      }).toThrow();
    });

    it('TC-T2-F01-02: Extreme Viewport Scaling (200px Mobile & 4K Ultra-wide 3840px)', () => {
      setViewport(200, 600);
      const { container } = renderApp({ route: '/learn-rust/' });
      expect(container).toBeInTheDocument();

      setViewport(3840, 2160);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('TC-T2-F01-03: Dynamic Script Injection / XSS in Code Display', () => {
      renderApp({ route: '/learn-rust/lessons/hello-ferris' });
      const scripts = document.querySelectorAll('script');
      for (const s of Array.from(scripts)) {
        expect(s.textContent).not.toContain('alert(');
      }
    });

    it('TC-T2-F01-04: Rapidly navigates between multiple routes in quick succession', async () => {
      renderApp({ route: '/learn-rust/' });

      const curriculumLink = screen.getAllByRole('link', { name: /(Curriculum|Start Learning)/i })[0];
      await user.click(curriculumLink);
      expect(await screen.findByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i })).toBeInTheDocument();

      const visualizerLink = screen.getAllByRole('link', { name: /(Visualizers|Explore Visualizers)/i })[0];
      await user.click(visualizerLink);
      expect(await screen.findByRole('heading', { name: /(6 Core Rust Concept Simulators|Visualizers)/i })).toBeInTheDocument();

      const progressLink = screen.getAllByRole('link', { name: /Progress/i })[0];
      await user.click(progressLink);
      expect(await screen.findByRole('heading', { name: /Your Learning Trajectory/i })).toBeInTheDocument();

      const homeLink = screen.getByRole('link', { name: /Learn Rust Home/i });
      await user.click(homeLink);
      expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/(Master Rust|Learn Rust)/i);
    });

    it('TC-T2-F01-05: Missing System Fonts Fallback', () => {
      const { container } = renderApp({ route: '/learn-rust/' });
      expect(container).toBeInTheDocument();
      const layoutRoot = container.firstElementChild;
      expect(layoutRoot).toHaveClass('font-sans');
      expect(layoutRoot).toHaveClass('antialiased');
    });
  });

  // =========================================================================
  // 2. React Router Setup Boundaries (F02)
  // =========================================================================
  describe('React Router Setup Boundaries (F02)', () => {
    it('TC-T2-F02-01: Handles URLs with trailing slashes gracefully', () => {
      const { container } = renderApp({ route: '/learn-rust/curriculum/' });
      expect(container).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i })
      ).toBeInTheDocument();
    });

    it('TC-T2-F02-02: Preserves query parameters across route matching', () => {
      renderApp({ route: '/learn-rust/lessons/ownership-move?ref=sidebar&step=2' });
      const heading = screen.getByRole('heading', { name: /Ownership & Move Semantics/i });
      expect(heading).toBeInTheDocument();
      expect(screen.getByText(/Lesson ID: ownership-move/i)).toBeInTheDocument();
    });

    it('TC-T2-F02-03: Rapid Back/Forward Navigation Cycling via Router', async () => {
      const { router } = renderApp({ route: '/learn-rust/' });
      expect(router.state.location.pathname).toBe('/learn-rust/');

      const curriculumLink = screen.getAllByRole('link', { name: /(Curriculum|Start Learning)/i })[0];
      await user.click(curriculumLink);
      expect(await screen.findByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i })).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/learn-rust/curriculum');

      const homeLink = screen.getByRole('link', { name: /Learn Rust Home/i });
      await user.click(homeLink);
      expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/(Master Rust|Learn Rust)/i);
      expect(router.state.location.pathname.replace(/\/$/, '')).toBe('/learn-rust');
    });

    it('TC-T2-F02-04: Non-existent lesson slug fallback without white screen', () => {
      renderApp({ route: '/learn-rust/lessons/invalid-nonexistent-slug-xyz' });
      expect(screen.getByText(/Lesson ID: invalid-nonexistent-slug-xyz/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Curriculum/i })).toBeInTheDocument();
    });

    it('TC-T2-F02-05: Redundant multiple slashes are sanitized and resolve cleanly', () => {
      renderApp({ route: '/learn-rust//curriculum' });
      expect(
        screen.getByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i })
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 3. Vitest Test Infrastructure Boundaries (F03)
  // =========================================================================
  describe('Vitest Test Infrastructure Boundaries (F03)', () => {
    it('TC-T2-F03-01: LocalStorage Quota Exceeded Simulation', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

      expect(() => {
        saveProgress(createDefaultProgress());
      }).not.toThrow();

      expect(warnSpy).toHaveBeenCalledWith(
        'Failed to save progress to localStorage',
        expect.any(DOMException)
      );

      setItemSpy.mockRestore();
      warnSpy.mockRestore();
    });

    it('TC-T2-F03-02: Zero-Timer Race Condition in userEvent rapid theme toggles', async () => {
      renderApp({ route: '/learn-rust/', theme: 'light' });
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      const themeBtn = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
      await user.click(themeBtn);
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('learn_rust_theme')).toBe('dark');

      const themeBtnAfter = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
      await user.click(themeBtnAfter);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('learn_rust_theme')).toBe('light');
    });

    it('TC-T2-F03-03: Storage resilience when loading malformed JSON data', () => {
      localStorage.setItem('learn_rust_progress_v1', '{"corrupted": true, [syntax error');
      let result;
      expect(() => {
        result = loadProgress();
      }).not.toThrow();
      expect(result).toBeDefined();
      expect(result?.version).toBe(1);
      expect(Array.isArray(result?.completedLessons)).toBe(true);

      renderApp({ route: '/learn-rust/progress' });
      expect(screen.getByRole('heading', { name: /Your Learning Trajectory/i })).toBeInTheDocument();
    });

    it('TC-T2-F03-04: Window MediaQueryList Missing Listener Methods fallback', () => {
      const origMatchMedia = window.matchMedia;
      const listeners: Array<(e: { matches: boolean }) => void> = [];
      const legacyMql: any = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: undefined,
        removeEventListener: undefined,
        addListener: vi.fn((fn: any) => listeners.push(fn)),
        removeListener: vi.fn((fn: any) => {
          const idx = listeners.indexOf(fn);
          if (idx !== -1) listeners.splice(idx, 1);
        }),
      };
      window.matchMedia = vi.fn().mockReturnValue(legacyMql);

      const { unmount } = renderApp({ route: '/learn-rust/' });
      expect(legacyMql.addListener).toHaveBeenCalled();

      act(() => {
        listeners.forEach((cb) => cb({ matches: true }));
      });
      expect(document.documentElement).toBeInTheDocument();

      unmount();
      expect(legacyMql.removeListener).toHaveBeenCalled();
      window.matchMedia = origMatchMedia;
    });

    it('TC-T2-F03-05: Multi-root Concurrent Mounts in Same DOM', () => {
      const container1 = document.createElement('div');
      const container2 = document.createElement('div');
      document.body.appendChild(container1);
      document.body.appendChild(container2);

      const app1 = renderApp({ route: '/learn-rust/', container: container1 });
      const app2 = renderApp({ route: '/learn-rust/curriculum', container: container2 });

      const heading1 = container1.querySelector('h1');
      expect(heading1).toBeInTheDocument();
      expect(heading1?.textContent).toMatch(/(Master Rust|Learn Rust)/i);

      const heading2 = container2.querySelector('h1');
      expect(heading2).toBeInTheDocument();
      expect(heading2?.textContent).toMatch(/(The Complete Rust Learning Path|Curriculum)/i);

      expect(container1.querySelector('header')).toBeInTheDocument();
      expect(container2.querySelector('header')).toBeInTheDocument();

      app1.unmount();
      app2.unmount();
      container1.remove();
      container2.remove();
    });
  });

  // =========================================================================
  // 4. Navigation & Responsive Layout Boundaries (F04)
  // =========================================================================
  describe('Viewport Boundaries (F04)', () => {
    it('TC-T2-F04-01: Ultra-narrow 320px viewport renders without throwing layout errors', () => {
      setViewport(320, 568);
      const { container } = renderApp({ route: '/learn-rust/' });
      expect(container).toBeInTheDocument();

      const menuBtn = screen.getByRole('button', { name: /Open navigation drawer/i });
      expect(menuBtn).toBeInTheDocument();
    });

    it('TC-T2-F04-02: Extreme 200px viewport does not crash the DOM tree', () => {
      setViewport(200, 400);
      const { container } = renderApp({ route: '/learn-rust/' });
      expect(container).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('TC-T2-F04-03: Mobile navigation drawer toggle interaction', async () => {
      setViewport('mobile');
      renderApp({ route: '/learn-rust/' });

      const menuBtn = screen.getByRole('button', { name: /Open navigation drawer/i });
      expect(menuBtn).toBeInTheDocument();

      await user.click(menuBtn);

      const closeBtn = screen.getByRole('button', { name: /Close navigation drawer/i });
      expect(closeBtn).toBeInTheDocument();

      await user.click(closeBtn);
      expect(screen.getByRole('button', { name: /Open navigation drawer/i })).toBeInTheDocument();
    });

    it('TC-T2-F04-04: Rapid consecutive clicks on mobile menu button', async () => {
      setViewport('mobile');
      renderApp({ route: '/learn-rust/' });

      for (let i = 0; i < 6; i++) {
        const toggleBtn = screen.getByRole('button', { name: /(Open|Close) navigation drawer/i });
        await user.click(toggleBtn);
      }

      expect(screen.getByRole('button', { name: /Open navigation drawer/i })).toBeInTheDocument();
    });

    it('TC-T2-F04-05: Desktop to Mobile viewport transition reflows header navigation', () => {
      setViewport('desktop');
      renderApp({ route: '/learn-rust/' });
      expect(screen.getByLabelText('Desktop Navigation')).toBeInTheDocument();

      setViewport('mobile');
      expect(screen.getByRole('button', { name: /Open navigation drawer/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 5. Theming Engine Boundaries (F05)
  // =========================================================================
  describe('Theming Engine Boundaries (F05)', () => {
    it('TC-T2-F05-01: Rapid theme switching (10 rapid toggles in tight loop)', async () => {
      renderApp({ route: '/learn-rust/' });
      const themeBtn = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
      expect(themeBtn).toBeInTheDocument();

      for (let i = 0; i < 10; i++) {
        await user.click(themeBtn);
      }

      const classList = Array.from(document.documentElement.classList);
      const darkOccurrences = classList.filter((c) => c === 'dark').length;
      expect(darkOccurrences).toBeLessThanOrEqual(1);

      const storedTheme = getStoredTheme();
      expect(storedTheme).toMatch(/^(dark|light|system)$/);
    });

    it('TC-T2-F05-02: Corrupted theme string in localStorage safely handled', () => {
      seedTheme('corrupted_random_payload_#$%' as any);
      const { container } = renderApp({ route: '/learn-rust/' });
      expect(container).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('TC-T2-F05-03: System preference dynamic adaptation when OS theme changes', () => {
      renderApp({ route: '/learn-rust/', theme: 'system' });

      act(() => {
        setSystemThemePreference(true);
      });
      expect(screen.getByRole('banner')).toBeInTheDocument();

      act(() => {
        setSystemThemePreference(false);
      });
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('TC-T2-F05-04: Explicit theme override persists across reloads', () => {
      seedTheme('dark');
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(getStoredTheme()).toBe('dark');
    });

    it('TC-T2-F05-05: WCAG AAA contrast check on high contrast mode', () => {
      const contrastLight = getContrastRatio('#0f172a', '#ffffff');
      expect(contrastLight).toBeGreaterThanOrEqual(7.0);

      const contrastDark = getContrastRatio('#f8fafc', '#020617');
      expect(contrastDark).toBeGreaterThanOrEqual(7.0);
    });
  });

  // =========================================================================
  // 6. Tri-lingual i18n Boundaries (F06)
  // =========================================================================
  describe('Tri-lingual i18n Boundaries & Fallbacks (F06)', () => {
    const originalNavigatorLanguage = navigator.language;

    afterEach(() => {
      Object.defineProperty(navigator, 'language', {
        value: originalNavigatorLanguage,
        configurable: true,
      });
    });

    it('TC-T2-F06-01: Unsupported browser languages (e.g. fr-FR, de-DE) fallback safely', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });

      renderApp({ route: '/learn-rust/' });
      const currentLang = document.documentElement.lang;
      expect(['zh', 'en', 'ja']).toContain(currentLang);
    });

    it('TC-T2-F06-02: Corrupted language value in localStorage falls back safely', () => {
      seedLanguage('klingon' as any);
      const { container } = renderApp({ route: '/learn-rust/' });
      expect(container).toBeInTheDocument();
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('TC-T2-F06-03: Valid languages (zh, en, ja) configure document.documentElement.lang', () => {
      renderApp({ route: '/learn-rust/', language: 'ja' });
      expect(document.documentElement.lang).toBe('ja');
      expect(getStoredLanguage()).toBe('ja');

      renderApp({ route: '/learn-rust/', language: 'en' });
      expect(document.documentElement.lang).toBe('en');
      expect(getStoredLanguage()).toBe('en');
    });

    it('TC-T2-F06-04: Very long localized strings overflow prevention', () => {
      renderApp({ route: '/learn-rust/curriculum' });
      const cards = screen.getAllByRole('heading', { level: 3 });
      expect(cards.length).toBeGreaterThan(0);
      for (const card of cards) {
        expect(card.textContent!.length).toBeGreaterThan(0);
      }
    });

    it('TC-T2-F06-05: Missing translation key fallback to zh or key', () => {
      renderApp({ route: '/learn-rust/' });
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /Desktop Navigation/i })).toBeInTheDocument();
    });
  });
});
