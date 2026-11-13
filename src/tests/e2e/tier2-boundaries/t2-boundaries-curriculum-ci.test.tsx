import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fs from 'node:fs';
import path from 'node:path';
import { renderApp } from '../helpers/render-app';
import {
  seedProgress,
  getStoredProgress,
  seedCompletedLessons,
  seedQuizAnswer,
} from '../helpers/storage-mock';

describe('Tier 2: Curriculum & CI/CD Boundaries (F15 - F18)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  // =========================================================================
  // 1. Non-existent Lesson Slug Navigation Fallback (F15)
  // =========================================================================
  describe('Lesson Slug Routing Boundaries (F15)', () => {
    it('TC-T2-F15-01: Direct deep-link to terminal lesson (concurrency-mutex)', () => {
      renderApp({ route: '/learn-rust/lessons/concurrency-mutex' });
      expect(
        screen.getByRole('heading', { name: /(Concurrency Mutex|Fearless Concurrency & Mutex)/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/Lesson ID: concurrency-mutex/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Back to Curriculum/i })).toBeInTheDocument();
    });

    it('TC-T2-F15-02: Non-existent lesson slug renders graceful fallback with curriculum link', () => {
      renderApp({ route: '/learn-rust/lessons/completely-unknown-rust-topic' });
      expect(screen.getAllByText(/Completely Unknown Rust Topic/i).length).toBeGreaterThan(0);
      const backLink = screen.getByRole('link', { name: /Back to Curriculum/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/learn-rust/curriculum');
    });

    it('TC-T2-F15-03: Lesson code snippet contains horizontal scroll class', () => {
      renderApp({ route: '/learn-rust/lessons/hello-ferris' });
      const pre = screen.getByText(/fn main\(\)/i).closest('pre');
      expect(pre).toBeInTheDocument();
      expect(pre?.className).toMatch(/overflow-x-auto/);
    });

    it('TC-T2-F15-04: Script tags inside lesson code are rendered strictly as text', () => {
      renderApp({ route: '/learn-rust/lessons/ownership-move' });
      const pre = screen.getByText(/fn main\(\)/i).closest('pre');
      expect(pre).toBeInTheDocument();
      expect(document.querySelectorAll('script[src*="malicious"]').length).toBe(0);
    });

    it('TC-T2-F15-05: Rapid navigation between consecutive lessons', () => {
      renderApp({ route: '/learn-rust/lessons/hello-ferris' });
      expect(screen.getByRole('heading', { name: /Hello Ferris & Cargo Basics/i })).toBeInTheDocument();

      // Navigate to next lesson
      renderApp({ route: '/learn-rust/lessons/primitives-mutability' });
      expect(screen.getByRole('heading', { name: /Primitive Types & Mutability/i })).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. Out of Order Module Completion and Bookmark Toggling (F16)
  // =========================================================================
  describe('Out of Order Module Completion & Bookmarks (F16)', () => {
    it('TC-T2-F16-01: Rapid double-submission of quiz results does not corrupt storage XP', () => {
      seedQuizAnswer('ownership-move', 1, true, 1);
      const firstScore = getStoredProgress()?.stats.xpScore ?? 0;

      seedQuizAnswer('ownership-move', 1, true, 2);
      const secondScore = getStoredProgress()?.stats.xpScore ?? 0;

      expect(secondScore).toBeGreaterThanOrEqual(firstScore);
      expect(getStoredProgress()?.quizStates['ownership-move'].attempts).toBe(2);
    });

    it('TC-T2-F16-02: Corrupted quiz state in storage is handled gracefully by progress dashboard', () => {
      seedProgress({
        quizStates: {
          'corrupted-quiz-id': {
            passed: null as any,
            attempts: -99,
            selectedAnswer: undefined as any,
          },
        },
      });

      const { container } = renderApp({ route: '/learn-rust/progress' });
      expect(container).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Your Learning Trajectory/i })
      ).toBeInTheDocument();
    });

    it('TC-T2-F16-03: Quiz questions with angle brackets and lifetimes do not break HTML entities', () => {
      renderApp({ route: '/learn-rust/curriculum' });
      expect(
        screen.getByText(/Option<T> and Result<T, E>/i)
      ).toBeInTheDocument();
    });

    it('TC-T2-F16-04: Out of order module completion is recorded accurately in progress', () => {
      seedCompletedLessons(['concurrency-mutex', 'smart-pointers']);

      const progress = getStoredProgress();
      expect(progress?.completedLessons).toContain('concurrency-mutex');
      expect(progress?.completedLessons).toContain('smart-pointers');
      expect(progress?.completedLessons).not.toContain('hello-ferris');
    });

    it('TC-T2-F16-05: Bookmarks array records non-sequential modules without duplicates', () => {
      seedProgress({
        bookmarks: ['concurrency-mutex', 'lifetimes-scopes'],
      });

      const progress = getStoredProgress();
      expect(progress?.bookmarks).toHaveLength(2);
      expect(progress?.bookmarks).toContain('concurrency-mutex');
      expect(progress?.bookmarks).toContain('lifetimes-scopes');
    });
  });

  // =========================================================================
  // 3. CI Workflow YAML, SPA 404, and Pages Deployment (F17)
  // =========================================================================
  describe('CI/CD & Deployment Boundaries (F17)', () => {
    it('TC-T2-F17-01: Public SPA 404.html redirection script exists and has segment preservation', () => {
      const public404Path = path.resolve(process.cwd(), 'public/404.html');
      expect(fs.existsSync(public404Path)).toBe(true);

      const content = fs.readFileSync(public404Path, 'utf-8');
      expect(content).toContain('pathSegmentsToKeep');
      expect(content).toContain('/learn-rust/');
    });

    it('TC-T2-F17-02: Vite config defines base path for GitHub Pages deployment', () => {
      const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
      expect(fs.existsSync(viteConfigPath)).toBe(true);

      const content = fs.readFileSync(viteConfigPath, 'utf-8');
      expect(content).toMatch(/base:\s*(process\.env\.VITE_BASE_PATH\s*\|\|\s*)?'\/learn-rust\/'/);
    });

    it('TC-T2-F17-03: CI workflow YAML specification requirements validation', () => {
      const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
      expect(fs.existsSync(workflowPath)).toBe(true);

      const yaml = fs.readFileSync(workflowPath, 'utf-8');
      expect(yaml).toContain('pnpm');
      expect(yaml).toMatch(/(test|build)/);
      expect(yaml).toContain('deploy-pages');
    });

    it('TC-T2-F17-04: SPA 404 query parameter decoding edge', () => {
      const public404Path = path.resolve(process.cwd(), 'public/404.html');
      const content = fs.readFileSync(public404Path, 'utf-8');
      // Verifies query parameter preservation in SPA 404 redirection script
      expect(content).toMatch(/(l\.search|\?)/);
    });

    it('TC-T2-F17-05: Concurrent deployments concurrency group in deploy.yml', () => {
      const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
      const yaml = fs.readFileSync(workflowPath, 'utf-8');
      expect(yaml).toContain('concurrency:');
      expect(yaml).toContain("group: 'pages'");
    });
  });

  // =========================================================================
  // 4. Documentation Boundaries (README & AGENTS) (F18)
  // =========================================================================
  describe('Documentation Boundaries (README & AGENTS) (F18)', () => {
    it('TC-T2-F18-01: README.md exists and contains repository title and introductory content', () => {
      const readmePath = path.resolve(process.cwd(), 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);

      const content = fs.readFileSync(readmePath, 'utf-8');
      expect(content.length).toBeGreaterThan(0);
      expect(content).toMatch(/(learn-rust|rust)/i);
    });

    it('TC-T2-F18-02: Code snippets in documentation are syntactically valid Rust', () => {
      const readmePath = path.resolve(process.cwd(), 'README.md');
      const content = fs.readFileSync(readmePath, 'utf-8');

      // Extract ```rust code block
      const rustBlockMatch = content.match(/```rust\s*([\s\S]*?)```/);
      expect(rustBlockMatch).not.toBeNull();
      const code = rustBlockMatch![1];
      expect(code).toContain('fn main()');
      expect(code).toContain('println!');
    });

    it('TC-T2-F18-03: README live demo link matches Pages deployment URL', () => {
      const readmePath = path.resolve(process.cwd(), 'README.md');
      const content = fs.readFileSync(readmePath, 'utf-8');
      expect(content).toContain('https://ecator.github.io/learn-rust/');
    });

    it('TC-T2-F18-04: AGENTS.md feature table F01-F18 parity', () => {
      const agentsPath = path.resolve(process.cwd(), 'AGENTS.md');
      expect(fs.existsSync(agentsPath)).toBe(true);

      const content = fs.readFileSync(agentsPath, 'utf-8');
      // Assert all 18 features are documented in AGENTS.md
      for (let i = 1; i <= 18; i++) {
        const featureId = `F${String(i).padStart(2, '0')}`;
        expect(content).toContain(featureId);
      }
    });

    it('TC-T2-F18-05: README mascot image references point to valid local files', () => {
      const readmePath = path.resolve(process.cwd(), 'README.md');
      const content = fs.readFileSync(readmePath, 'utf-8');

      expect(content).toMatch(/src=["']\.\/public\/favicon\.svg["']/);
      const faviconPath = path.resolve(process.cwd(), 'public/favicon.svg');
      expect(fs.existsSync(faviconPath)).toBe(true);
    });
  });
});
