import { describe, it, expect, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp, initializeTheme } from '../helpers/render-app';
import { setViewport, setSystemThemePreference } from '../helpers/viewport';
import { createMatchMediaMock } from '../setup';

describe('Tier 1: Layout, Theming & i18n (F04 - F06)', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.lang = 'zh';
  });

  // ==========================================
  // F04: Navigation & Responsive Layout
  // ==========================================
  describe('F04: Navigation & Responsive Layout', () => {
    it('TC-T1-F04-01: Desktop Navigation Links Rendering', () => {
      setViewport('desktop');
      renderApp({ route: '/learn-rust/' });

      const desktopNav = screen.getByLabelText('Desktop Navigation');
      expect(desktopNav).toBeInTheDocument();

      expect(within(desktopNav).getByRole('link', { name: /Home/i })).toBeInTheDocument();
      expect(within(desktopNav).getByRole('link', { name: /Curriculum/i })).toBeInTheDocument();
      expect(within(desktopNav).getByRole('link', { name: /Visualizers/i })).toBeInTheDocument();
      expect(within(desktopNav).getByRole('link', { name: /Progress/i })).toBeInTheDocument();
    });

    it('TC-T1-F04-02: Header Navigation Click Transitions', async () => {
      setViewport('desktop');
      renderApp({ route: '/learn-rust/' });

      const desktopNav = screen.getByLabelText('Desktop Navigation');
      const visualizersLink = within(desktopNav).getByRole('link', { name: /Visualizers/i });
      await user.click(visualizersLink);

      const heading = await screen.findByRole('heading', {
        name: /(6 Core Rust Concept Simulators|Visualizers)/i,
      });
      expect(heading).toBeInTheDocument();
    });

    it('TC-T1-F04-03: Mobile Viewport Hamburger Menu Toggle', async () => {
      setViewport('mobile');
      renderApp({ route: '/learn-rust/' });

      const hamburgerBtn = screen.getByRole('button', { name: /Open navigation drawer/i });
      expect(hamburgerBtn).toBeInTheDocument();

      await user.click(hamburgerBtn);

      // Verify the drawer is open or close button appears
      const closeBtns = await screen.findAllByRole('button', {
        name: /Close navigation (drawer|sidebar)/i,
      });
      expect(closeBtns.length).toBeGreaterThan(0);
    });

    it('TC-T1-F04-04: Sidebar Curriculum Navigation in Lesson Page', async () => {
      setViewport('desktop');
      renderApp({ route: '/learn-rust/lesson/hello-ferris' });

      const sidebar = screen.getByRole('complementary', { name: /Curriculum Sidebar/i });
      expect(sidebar).toBeInTheDocument();

      const helloFerrisLink = within(sidebar).getByRole('link', { name: /Hello Ferris & Cargo/i });
      expect(helloFerrisLink).toBeInTheDocument();
      expect(helloFerrisLink.className).toMatch(/bg-\[#CE412B\]|text-\[#CE412B\]/);
    });

    it('TC-T1-F04-05: Breadcrumbs Trail Navigation', async () => {
      renderApp({ route: '/learn-rust/lessons/hello-ferris' });

      const breadcrumbNav = screen.getByRole('navigation', { name: /Breadcrumb/i });
      expect(breadcrumbNav).toBeInTheDocument();

      const curriculumLink = within(breadcrumbNav).getByRole('link', { name: /Curriculum/i });
      expect(curriculumLink).toBeInTheDocument();

      await user.click(curriculumLink);
      const curriculumHeading = await screen.findByRole('heading', {
        name: /(The Complete Rust Learning Path|Curriculum)/i,
      });
      expect(curriculumHeading).toBeInTheDocument();
    });
  });

  // ==========================================
  // F05: Theming Engine
  // ==========================================
  describe('F05: Theming Engine', () => {
    it('TC-T1-F05-01: Default Theme Follows System Preference (Dark)', () => {
      window.matchMedia = createMatchMediaMock(true);
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('TC-T1-F05-02: Default Theme Follows System Preference (Light)', () => {
      window.matchMedia = createMatchMediaMock(false);
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('TC-T1-F05-03: Manual Theme Switch to Dark', async () => {
      window.matchMedia = createMatchMediaMock(false);
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      const themeToggle = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
      await user.click(themeToggle);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('learn_rust_theme')).toBe('dark');
    });

    it('TC-T1-F05-04: Manual Theme Switch to Light', async () => {
      window.matchMedia = createMatchMediaMock(true);
      renderApp({ route: '/learn-rust/', theme: 'dark' });
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      const themeToggle = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
      await user.click(themeToggle);

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('learn_rust_theme')).toBe('light');
    });

    it('TC-T1-F05-05: System Mode Dynamic Adaptation', () => {
      localStorage.setItem('learn_rust_theme', 'system');
      window.matchMedia = createMatchMediaMock(false);
      initializeTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      setSystemThemePreference(true);
      initializeTheme();
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  // ==========================================
  // F06: Tri-lingual i18n System
  // ==========================================
  describe('F06: Tri-lingual i18n System', () => {
    it('TC-T1-F06-01: Auto-detection of Chinese (zh) from Browser', () => {
      Object.defineProperty(navigator, 'language', { value: 'zh-CN', configurable: true });
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.lang).toBe('zh');
    });

    it('TC-T1-F06-02: Auto-detection of English (en) from Browser', () => {
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.lang).toBe('en');
    });

    it('TC-T1-F06-03: Auto-detection of Japanese (ja) from Browser', () => {
      Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true });
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.lang).toBe('ja');
    });

    it('TC-T1-F06-04: Unknown Language Fallback to Chinese', () => {
      Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
      renderApp({ route: '/learn-rust/' });
      expect(document.documentElement.lang).toBe('zh');
    });

    it('TC-T1-F06-05: Manual Language Switcher Dropdown', async () => {
      renderApp({ route: '/learn-rust/', language: 'zh' });
      const langBtn = screen.getByRole('button', { name: /Change language/i });
      expect(langBtn).toBeInTheDocument();

      await user.click(langBtn);
      const stored = localStorage.getItem('learn_rust_lang');
      expect(stored).toMatch(/en|ja|zh/);
      expect(document.documentElement.lang).toBe(stored);
    });
  });
});
