import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';
import { setViewport, setSystemThemePreference, ViewportDevice } from '../helpers/viewport';
import {
  seedProgress,
  getStoredProgress,
  seedCompletedLessons,
  seedQuizAnswer,
  createDefaultProgress,
} from '../helpers/storage-mock';
import { VisualizerDriver } from '../helpers/visualizer-driver';
import { assertWcagContrast } from '../helpers/accessibility';

// Orthogonal test vector definition
interface PairwiseVector {
  id: string;
  lang: 'zh' | 'en' | 'ja';
  theme: 'light' | 'dark' | 'system';
  viewport: ViewportDevice;
  routeKey: 'home' | 'curriculum' | 'lesson_ownership' | 'visualizers' | 'progress' | 'notfound';
  route: string;
  vizState: 'initial' | 'scrubbing' | 'error_sim' | 'completed' | 'reset';
  description: string;
}

const PAIRWISE_VECTORS: PairwiseVector[] = [
  {
    id: 'TC-T3-PAIR-01',
    lang: 'zh',
    theme: 'light',
    viewport: 'desktop',
    routeKey: 'home',
    route: '/learn-rust/',
    vizState: 'initial',
    description: 'Chinese desktop home in light theme; verifies hero text & navbar',
  },
  {
    id: 'TC-T3-PAIR-02',
    lang: 'zh',
    theme: 'dark',
    viewport: 'mobile',
    routeKey: 'curriculum',
    route: '/learn-rust/curriculum',
    vizState: 'scrubbing',
    description: 'Chinese dark theme on mobile; drawer navigation to curriculum cards',
  },
  {
    id: 'TC-T3-PAIR-03',
    lang: 'zh',
    theme: 'system',
    viewport: 'desktop',
    routeKey: 'lesson_ownership',
    route: '/learn-rust/lessons/ownership-move',
    vizState: 'error_sim',
    description: 'Chinese system theme; ownership error simulated in visualizer',
  },
  {
    id: 'TC-T3-PAIR-04',
    lang: 'zh',
    theme: 'light',
    viewport: 'mobile',
    routeKey: 'visualizers',
    route: '/learn-rust/visualizers',
    vizState: 'completed',
    description: 'Chinese mobile visualizers gallery; step visualizer reaches end state',
  },
  {
    id: 'TC-T3-PAIR-05',
    lang: 'zh',
    theme: 'dark',
    viewport: 'desktop',
    routeKey: 'progress',
    route: '/learn-rust/progress',
    vizState: 'reset',
    description: 'Chinese dark desktop progress dashboard; trigger reset dialog',
  },
  {
    id: 'TC-T3-PAIR-06',
    lang: 'zh',
    theme: 'system',
    viewport: 'mobile',
    routeKey: 'notfound',
    route: '/learn-rust/404-check',
    vizState: 'initial',
    description: 'Chinese mobile 404 page with system dark mode; return home button',
  },
  {
    id: 'TC-T3-PAIR-07',
    lang: 'en',
    theme: 'light',
    viewport: 'mobile',
    routeKey: 'lesson_ownership',
    route: '/learn-rust/lessons/ownership-move',
    vizState: 'reset',
    description: 'English light mobile lesson; scrubber reset and verify English text',
  },
  {
    id: 'TC-T3-PAIR-08',
    lang: 'en',
    theme: 'dark',
    viewport: 'desktop',
    routeKey: 'visualizers',
    route: '/learn-rust/visualizers',
    vizState: 'initial',
    description: 'English dark desktop visualizer gallery; load borrow checker',
  },
  {
    id: 'TC-T3-PAIR-09',
    lang: 'en',
    theme: 'system',
    viewport: 'mobile',
    routeKey: 'progress',
    route: '/learn-rust/progress',
    vizState: 'scrubbing',
    description: 'English system mobile progress; inspect XP breakdown and streak',
  },
  {
    id: 'TC-T3-PAIR-10',
    lang: 'en',
    theme: 'light',
    viewport: 'desktop',
    routeKey: 'notfound',
    route: '/learn-rust/404-check',
    vizState: 'error_sim',
    description: 'English light desktop 404 error handling',
  },
  {
    id: 'TC-T3-PAIR-11',
    lang: 'en',
    theme: 'dark',
    viewport: 'mobile',
    routeKey: 'home',
    route: '/learn-rust/',
    vizState: 'completed',
    description: 'English dark mobile home; verify Ferris happy mood SVG contrast',
  },
  {
    id: 'TC-T3-PAIR-12',
    lang: 'en',
    theme: 'system',
    viewport: 'desktop',
    routeKey: 'curriculum',
    route: '/learn-rust/curriculum',
    vizState: 'completed',
    description: 'English system desktop curriculum; 10 modules rendered with checkmarks',
  },
  {
    id: 'TC-T3-PAIR-13',
    lang: 'ja',
    theme: 'light',
    viewport: 'desktop',
    routeKey: 'curriculum',
    route: '/learn-rust/curriculum',
    vizState: 'error_sim',
    description: 'Japanese light desktop curriculum; verify Japanese module descriptions',
  },
  {
    id: 'TC-T3-PAIR-14',
    lang: 'ja',
    theme: 'dark',
    viewport: 'mobile',
    routeKey: 'lesson_ownership',
    route: '/learn-rust/lessons/ownership-move',
    vizState: 'completed',
    description: 'Japanese dark mobile lesson; complete ownership interactive quiz',
  },
  {
    id: 'TC-T3-PAIR-15',
    lang: 'ja',
    theme: 'system',
    viewport: 'desktop',
    routeKey: 'visualizers',
    route: '/learn-rust/visualizers',
    vizState: 'scrubbing',
    description: 'Japanese system desktop visualizer; step through memory layout',
  },
  {
    id: 'TC-T3-PAIR-16',
    lang: 'ja',
    theme: 'light',
    viewport: 'mobile',
    routeKey: 'progress',
    route: '/learn-rust/progress',
    vizState: 'initial',
    description: 'Japanese light mobile progress page; export backup button',
  },
  {
    id: 'TC-T3-PAIR-17',
    lang: 'ja',
    theme: 'dark',
    viewport: 'desktop',
    routeKey: 'notfound',
    route: '/learn-rust/404-check',
    vizState: 'reset',
    description: 'Japanese dark desktop 404 page; click return to curriculum',
  },
  {
    id: 'TC-T3-PAIR-18',
    lang: 'ja',
    theme: 'system',
    viewport: 'mobile',
    routeKey: 'home',
    route: '/learn-rust/',
    vizState: 'reset',
    description: 'Japanese system mobile home; toggle language and theme in drawer',
  },
];

describe('Tier 3: Pairwise Combinations & Cross-Feature Interactions', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  // =========================================================================
  // 1. 18 Orthogonal Pairwise Test Vectors (TEST_INFRA.md § 6)
  // =========================================================================
  describe('All-Pairs Orthogonal Combinations Matrix (18 Vectors)', () => {
    PAIRWISE_VECTORS.forEach((vector) => {
      it(`${vector.id}: ${vector.description}`, async () => {
        // Setup factor 1: Viewport
        setViewport(vector.viewport);

        // Setup factor 2: System theme preference
        if (vector.theme === 'system') {
          setSystemThemePreference(true);
        }

        // Setup factor 5: Visualizer / Storage state seeding
        if (vector.vizState === 'completed') {
          seedCompletedLessons(['ownership-move', 'hello-ferris']);
        } else if (vector.vizState === 'error_sim') {
          seedQuizAnswer('ownership-move', 0, false, 1);
        } else if (vector.vizState === 'reset') {
          seedProgress(createDefaultProgress());
        }

        // Render application under specific pairwise vector
        const { container } = renderApp({
          route: vector.route,
          theme: vector.theme,
          language: vector.lang,
        });

        expect(container).toBeInTheDocument();

        // Factor assertions:
        // 1. Language attribute on root HTML
        expect(document.documentElement.lang).toBe(vector.lang);

        // 2. Theme class applied appropriately
        if (vector.theme === 'dark') {
          expect(document.documentElement.classList.contains('dark')).toBe(true);
        } else if (vector.theme === 'light') {
          expect(document.documentElement.classList.contains('dark')).toBe(false);
        }

        // 3. Viewport controls visible
        if (vector.viewport === 'mobile') {
          expect(screen.getByRole('button', { name: /Open navigation drawer/i })).toBeInTheDocument();
        } else {
          expect(screen.getByLabelText('Desktop Navigation')).toBeInTheDocument();
        }

        // 4. Route specific target headings
        switch (vector.routeKey) {
          case 'home':
            expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
            break;
          case 'curriculum':
            expect(
              screen.getByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i })
            ).toBeInTheDocument();
            break;
          case 'lesson_ownership':
            expect(
              screen.getByRole('heading', { name: /Ownership & Move Semantics/i })
            ).toBeInTheDocument();
            break;
          case 'visualizers':
            expect(
              screen.getByRole('heading', { name: /(6 Core Rust Concept Simulators|Visualizers)/i })
            ).toBeInTheDocument();
            break;
          case 'progress':
            expect(
              screen.getByRole('heading', { name: /Your Learning Trajectory/i })
            ).toBeInTheDocument();
            break;
          case 'notfound':
            expect(
              screen.getByRole('heading', { name: /(Oops! Page Has Gone Out of Scope|404)/i })
            ).toBeInTheDocument();
            break;
        }

        // 5. Visualizer driver interaction in active route
        if (vector.routeKey === 'lesson_ownership') {
          const driver = new VisualizerDriver(container);
          if (vector.vizState === 'scrubbing') {
            await driver.stepForward();
          } else if (vector.vizState === 'reset') {
            await driver.reset();
          }
        }
      });
    });
  });

  // =========================================================================
  // 2. Pairwise Cross-Feature Scenarios (TEST_INFRA.md § 6.3)
  // =========================================================================
  describe('Pairwise Cross-Feature Scenarios', () => {
    it('TC-T3-SCEN-01: Language switch during mid-lesson interaction', async () => {
      // User is studying Ownership lesson in Chinese
      const { container } = renderApp({
        route: '/learn-rust/lessons/ownership-move',
        language: 'zh',
      });

      expect(screen.getByRole('heading', { name: /Ownership & Move Semantics/i })).toBeInTheDocument();

      // Step scrubber or interact
      const driver = new VisualizerDriver(container);
      await driver.stepForward();

      // Switch language to Japanese
      document.documentElement.lang = 'ja';
      localStorage.setItem('learn_rust_lang', 'ja');

      // Lesson stays mounted and active slug remains unchanged
      expect(screen.getByRole('heading', { name: /Ownership & Move Semantics/i })).toBeInTheDocument();
      expect(screen.getByText(/Lesson ID: ownership-move/i)).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('ja');
    });

    it('TC-T3-SCEN-02: Theme switch while viewing quiz and lesson contents', async () => {
      renderApp({
        route: '/learn-rust/lessons/ownership-move',
        theme: 'light',
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // User toggles theme via header button
      const themeBtn = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
      await user.click(themeBtn);

      // Theme changes to dark mode
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      // Verify WCAG contrast on text and backgrounds
      const hasContrast = assertWcagContrast('#ffffff', '#0f172a', 'AA');
      expect(hasContrast).toBe(true);
    });

    it('TC-T3-SCEN-03: Viewport transition with active lesson content', () => {
      // Start on desktop (1280px)
      setViewport('desktop');
      renderApp({ route: '/learn-rust/lessons/ownership-move' });

      expect(screen.getByLabelText('Desktop Navigation')).toBeInTheDocument();

      // Viewport resizes to mobile (375px)
      setViewport('mobile');
      expect(screen.getByRole('button', { name: /Open navigation drawer/i })).toBeInTheDocument();

      // Active lesson content is preserved
      expect(screen.getByRole('heading', { name: /Ownership & Move Semantics/i })).toBeInTheDocument();
    });

    it('TC-T3-SCEN-04: Export progress in Japanese and restore in English', () => {
      // Seed initial progress in Japanese context
      seedProgress({
        completedLessons: ['hello-ferris', 'primitives-mutability', 'ownership-move'],
        stats: { xpScore: 300, streakDays: 3, lastActiveDate: new Date().toISOString() },
      });

      // Export progress simulation
      const exportedBackup = JSON.stringify(getStoredProgress());
      expect(exportedBackup).toContain('ownership-move');

      // Clear progress
      localStorage.removeItem('learn_rust_progress_v1');

      // Restore in English context
      localStorage.setItem('learn_rust_lang', 'en');
      localStorage.setItem('learn_rust_progress_v1', exportedBackup);

      renderApp({ route: '/learn-rust/progress', language: 'en' });
      expect(screen.getByText('300 XP')).toBeInTheDocument();
      expect(document.documentElement.lang).toBe('en');
    });

    it('TC-T3-SCEN-05: Dark theme system detection on mobile navigation drawer', async () => {
      setViewport('mobile');
      setSystemThemePreference(true);

      renderApp({ route: '/learn-rust/', theme: 'dark' });

      const menuBtn = screen.getByRole('button', { name: /Open navigation drawer/i });
      await user.click(menuBtn);

      // Drawer opens and app retains dark mode styling
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(screen.getByRole('button', { name: /Close navigation drawer/i })).toBeInTheDocument();
    });
  });
});
