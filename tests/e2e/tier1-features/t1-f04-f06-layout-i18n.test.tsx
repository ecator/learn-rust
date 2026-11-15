import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, within, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';
import { setViewport, setSystemThemePreference } from '../helpers/viewport';
import { createMatchMediaMock } from '../../setup';

describe('Tier 1: Layout, Theming & i18n (F04 - F06)', () => {
  const user = userEvent.setup();
  const originalScrollIntoViewDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollIntoView'
  );

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.lang = 'zh';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalScrollIntoViewDesc) {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoViewDesc);
    } else {
      delete (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    }
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

    it('TC-T1-F04-06: Sidebar Interactive Visualizers Links Scroll, Highlight & Clear', async () => {
      setViewport('desktop');
      const scrollIntoViewMock = vi.fn();
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: scrollIntoViewMock,
      });

      const { container } = renderApp({ route: '/learn-rust/visualizers', language: 'zh' });
      const sidebar = screen.getByRole('complementary', { name: /Curriculum Sidebar/i });

      const items = [
        { label: '所有权与移动', id: 'ownership' },
        { label: '借用检查与生命周期', id: 'borrow-checker' },
        { label: '内存布局与堆栈', id: 'memory-layout' },
        { label: 'Trait 分发机制', id: 'trait-dispatch' },
        { label: '并发与线程模型', id: 'concurrency' },
        { label: '错误处理与 Result', id: 'railway-errors' },
      ];

      for (const item of items) {
        scrollIntoViewMock.mockClear();
        const link = within(sidebar).getByRole('link', { name: item.label });
        await user.click(link);

        expect(link).toHaveAttribute('aria-current', 'location');
        const targetCard = container.querySelector(`#${item.id}`);
        expect(targetCard).toHaveAttribute('data-selected', 'true');
        expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(1);

        await waitFor(() => {
          expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
        });
        expect(scrollIntoViewMock.mock.instances[0]).toBe(targetCard);
      }

      // Clicking the already-active item again still scrolls to it
      scrollIntoViewMock.mockClear();
      await user.click(within(sidebar).getByRole('link', { name: '错误处理与 Result' }));
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
      });

      // Clicking "全部" resets selection and scrolls to top
      const allLink = within(sidebar).getByRole('link', { name: '全部' });
      await user.click(allLink);

      expect(container.querySelectorAll('[data-selected="true"]')).toHaveLength(0);
      await waitFor(() => {
        expect(window.scrollTo).toHaveBeenCalled();
      });
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

      const darkBtn = screen.getByRole('button', { name: /Switch to dark theme/i });
      await user.click(darkBtn);

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('learn_rust_theme')).toBe('dark');
      expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('TC-T1-F05-04: Manual Theme Switch to Light', async () => {
      window.matchMedia = createMatchMediaMock(true);
      renderApp({ route: '/learn-rust/', theme: 'dark' });
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      const lightBtn = screen.getByRole('button', { name: /Switch to light theme/i });
      await user.click(lightBtn);

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('learn_rust_theme')).toBe('light');
      expect(lightBtn).toHaveAttribute('aria-pressed', 'true');
    });

    it('TC-T1-F05-05: System Mode Dynamic Adaptation & Switch Back to Auto', async () => {
      window.matchMedia = createMatchMediaMock(false);
      renderApp({ route: '/learn-rust/', theme: 'dark' });
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      const autoBtn = screen.getByRole('button', { name: /Switch to auto theme/i });
      await user.click(autoBtn);

      expect(localStorage.getItem('learn_rust_theme')).toBe('system');
      expect(autoBtn).toHaveAttribute('aria-pressed', 'true');
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      act(() => {
        setSystemThemePreference(true);
      });
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
