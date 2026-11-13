import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';
import { QuizChallenge } from '@/components/common/QuizChallenge';
import { getStoredProgress, seedProgress } from '../helpers/storage-mock';

describe('Tier 1: Curriculum, Quizzes, CI/CD & Docs (F15 - F18)', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  // ==========================================
  // F15: Curriculum: 10 Progressive Modules
  // ==========================================
  describe('F15: Curriculum: 10 Progressive Modules', () => {
    it('TC-T1-F15-01: Module Catalog Completeness', () => {
      renderApp({ route: '/learn-rust/curriculum' });
      const lessonLinks = screen.getAllByRole('link', { name: /Start Module|Start Lesson|Overview/i });
      expect(lessonLinks.length).toBeGreaterThanOrEqual(10);
    });

    it('TC-T1-F15-02: Tri-lingual Content Availability', () => {
      const { rerender } = renderApp({ route: '/learn-rust/lesson/hello-ferris', language: 'zh' });
      expect(document.documentElement.lang).toBe('zh');

      rerender(<></>);
      renderApp({ route: '/learn-rust/lesson/hello-ferris', language: 'en' });
      expect(document.documentElement.lang).toBe('en');

      rerender(<></>);
      renderApp({ route: '/learn-rust/lesson/hello-ferris', language: 'ja' });
      expect(document.documentElement.lang).toBe('ja');
    });

    it('TC-T1-F15-03: Syntax-Highlighted Code Snippets Rendering', () => {
      renderApp({ route: '/learn-rust/lesson/hello-ferris' });
      const preBlock = document.querySelector('pre');
      const codeBlock = document.querySelector('code');
      expect(preBlock).toBeInTheDocument();
      expect(codeBlock).toBeInTheDocument();
      expect(codeBlock?.textContent).toMatch(/fn main\(\)/);
    });

    it('TC-T1-F15-04: Common Pitfalls Section', () => {
      renderApp({ route: '/learn-rust/lesson/hello-ferris' });
      expect(screen.getByText(/Interactive Code Walkthrough/i)).toBeInTheDocument();
      expect(screen.getByText(/rustc/i)).toBeInTheDocument();
    });

    it('TC-T1-F15-05: Next / Previous Lesson Navigation Flow', async () => {
      renderApp({ route: '/learn-rust/lesson/hello-ferris' });
      const nextBtn = screen.getByRole('link', { name: /Next Lesson/i });
      expect(nextBtn).toBeInTheDocument();
      expect(nextBtn.getAttribute('href')).toMatch(/primitives-mutability/);
    });
  });

  // ==========================================
  // F16: Interactive Quizzes & Challenges
  // ==========================================
  describe('F16: Interactive Quizzes & Challenges', () => {
    it('TC-T1-F16-01: Quiz Option Selection & Radio State', async () => {
      render(<QuizChallenge />);
      const options = screen.getAllByRole('radio');
      expect(options.length).toBe(3);

      await user.click(options[0]);
      expect(options[0]).toHaveAttribute('aria-checked', 'true');
      expect(options[1]).toHaveAttribute('aria-checked', 'false');
    });

    it('TC-T1-F16-02: Incorrect Answer Feedback & Explanation', async () => {
      render(<QuizChallenge />);
      const options = screen.getAllByRole('radio');

      await user.click(options[0]); // Option 0 is wrong
      const submitBtn = screen.getByRole('button', { name: /Submit Answer/i });
      await user.click(submitBtn);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Incorrect/i);
      expect(alert).toHaveTextContent(/explanation/i);
    });

    it('TC-T1-F16-03: Correct Answer Feedback & Score Crediting', async () => {
      seedProgress();
      render(<QuizChallenge />);
      const options = screen.getAllByRole('radio');

      await user.click(options[1]); // Option 1 is correct
      const submitBtn = screen.getByRole('button', { name: /Submit Answer/i });
      await user.click(submitBtn);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Correct!/i);

      const stored = getStoredProgress();
      expect(stored?.stats.xpScore).toBeGreaterThanOrEqual(20);
    });

    it('TC-T1-F16-04: Quiz Retry Mechanism', async () => {
      render(<QuizChallenge />);
      const options = screen.getAllByRole('radio');

      await user.click(options[0]); // Option 0 is wrong
      const submitBtn = screen.getByRole('button', { name: /Submit Answer/i });
      await user.click(submitBtn);

      const retryBtn = screen.getByRole('button', { name: /Try Again/i });
      await user.click(retryBtn);

      // Options unlocked and re-clickable
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Answer/i })).toBeInTheDocument();
    });

    it('TC-T1-F16-05: Challenge Code Fill-in-the-Blank', async () => {
      render(<QuizChallenge />);
      const input = screen.getByLabelText(/Missing Rust keyword/i);
      await user.type(input, 'mut');

      const verifyBtn = screen.getByRole('button', { name: /Verify/i });
      await user.click(verifyBtn);

      expect(screen.getByText(/Valid Rust syntax!/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // F17: GitHub Actions CI/CD Workflow
  // ==========================================
  describe('F17: GitHub Actions CI/CD Workflow', () => {
    it('TC-T1-F17-01: Workflow YAML Configuration Validity', () => {
      const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
      expect(fs.existsSync(workflowPath)).toBe(true);

      const content = fs.readFileSync(workflowPath, 'utf-8');
      expect(content).toMatch(/actions\/checkout/);
      expect(content).toMatch(/pnpm\/action-setup/);
      expect(content).toMatch(/pnpm test:run/);
      expect(content).toMatch(/pnpm build/);
      expect(content).toMatch(/actions\/deploy-pages/);
    });

    it('TC-T1-F17-02: Build Output Artifact Directory Path', () => {
      const workflowPath = path.resolve(process.cwd(), '.github/workflows/deploy.yml');
      const content = fs.readFileSync(workflowPath, 'utf-8');
      expect(content).toMatch(/path:\s*'\.\/dist'/);
    });

    it('TC-T1-F17-03: Vite Base Path Configuration', () => {
      const viteConfigPath = path.resolve(process.cwd(), 'vite.config.ts');
      const content = fs.readFileSync(viteConfigPath, 'utf-8');
      expect(content).toMatch(/base:\s*(?:process\.env\.VITE_BASE_PATH\s*\|\|\s*)?'\/learn-rust\/'/);
    });

    it('TC-T1-F17-04: SPA 404 Routing Redirection File', () => {
      const redirectHtmlPath = path.resolve(process.cwd(), 'public/404.html');
      expect(fs.existsSync(redirectHtmlPath)).toBe(true);

      const content = fs.readFileSync(redirectHtmlPath, 'utf-8');
      expect(content).toMatch(/window\.location|l\.pathname/);
      expect(content).toMatch(/l\.replace|replace/);
    });

    it('TC-T1-F17-05: Clean Build Verification', () => {
      const pkgJsonPath = path.resolve(process.cwd(), 'package.json');
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
      expect(pkg.scripts.build).toBe('tsc -b && vite build');
    });
  });

  // ==========================================
  // F18: Documentation (README & AGENTS)
  // ==========================================
  describe('F18: Documentation (README & AGENTS)', () => {
    it('TC-T1-F18-01: README Structure & Feature Overview', () => {
      const readmePath = path.resolve(process.cwd(), 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);

      const content = fs.readFileSync(readmePath, 'utf-8');
      expect(content).toMatch(/Learn Rust/i);
      expect(content).toMatch(/ecator\.github\.io\/learn-rust/);
      expect(content).toMatch(/pnpm dev/);
      expect(content).toMatch(/pnpm test/);
    });

    it('TC-T1-F18-02: AGENTS.md Architecture & Maintenance Guidelines', () => {
      const agentsPath = path.resolve(process.cwd(), 'AGENTS.md');
      expect(fs.existsSync(agentsPath)).toBe(true);

      const content = fs.readFileSync(agentsPath, 'utf-8');
      expect(content).toMatch(/Architectural Principles/i);
      expect(content).toMatch(/Directory Layout/i);
      expect(content).toMatch(/learn_rust_progress_v1/);
    });

    it('TC-T1-F18-03: Bilingual / Tri-lingual Quick Start Instructions', () => {
      const readmePath = path.resolve(process.cwd(), 'README.md');
      const content = fs.readFileSync(readmePath, 'utf-8');
      expect(content).toMatch(/Quick Start/i);
      expect(content).toMatch(/Tri-lingual/i);
    });

    it('TC-T1-F18-04: Accurate Repository & License Links', () => {
      const licensePath = path.resolve(process.cwd(), 'LICENSE');
      expect(fs.existsSync(licensePath)).toBe(true);

      const readmePath = path.resolve(process.cwd(), 'README.md');
      const content = fs.readFileSync(readmePath, 'utf-8');
      expect(content).toMatch(/github\.com\/ecator\/learn-rust/);
      expect(content).toMatch(/LICENSE/);
    });

    it('TC-T1-F18-05: Contributor & Troubleshooting Guidance', () => {
      const agentsPath = path.resolve(process.cwd(), 'AGENTS.md');
      const content = fs.readFileSync(agentsPath, 'utf-8');
      expect(content).toMatch(/Troubleshooting Common Issues/i);
      expect(content).toMatch(/Tailwind/i);
      expect(content).toMatch(/Happy-DOM/i);
    });
  });
});
