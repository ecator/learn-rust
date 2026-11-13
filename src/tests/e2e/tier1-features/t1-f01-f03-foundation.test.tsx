import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';

describe('Tier 1: Foundation (F01 - F03)', () => {
  // ==========================================
  // F01: Project Scaffolding
  // ==========================================
  describe('F01: Project Scaffolding', () => {
    it('TC-T1-F01-01: Root Application Mount', () => {
      const { container } = renderApp({ route: '/learn-rust/' });
      expect(container).toBeInTheDocument();
      const header = screen.getByRole('banner');
      const main = screen.getByRole('main');
      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
    });

    it('TC-T1-F01-02: Tailwind CSS Layout Classes Initialization', () => {
      const { container } = renderApp({ route: '/learn-rust/' });
      const rootDiv = container.firstElementChild as HTMLElement;
      expect(rootDiv).toBeInTheDocument();
      expect(rootDiv.className).toMatch(/min-h-screen/);
      expect(rootDiv.className).toMatch(/bg-/);
      expect(rootDiv.className).toMatch(/text-/);
    });

    it('TC-T1-F01-03: TypeScript Strict Mode Type Safety', () => {
      // Verifies that components render and properties are defined without undefined crashes
      const { container } = renderApp({ route: '/learn-rust/' });
      const brandHeading = screen.getByRole('heading', { level: 1 });
      expect(brandHeading).toBeInTheDocument();
      expect(typeof brandHeading.textContent).toBe('string');
      expect(container.querySelectorAll('*').length).toBeGreaterThan(10);
    });

    it('TC-T1-F01-04: Asset Link Verification', () => {
      renderApp({ route: '/learn-rust/' });
      // Brand icon or mascot SVG present in the header
      const header = screen.getByRole('banner');
      const svgs = header.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
      const homeLink = screen.getByRole('link', { name: /Learn Rust Home/i });
      expect(homeLink).toBeInTheDocument();
    });

    it('TC-T1-F01-05: Route Error / NotFound UI Fallback with Return Home Action', async () => {
      const user = userEvent.setup();
      renderApp({
        route: '/learn-rust/invalid-crashed-route',
      });

      // 404 Error UI is displayed
      expect(screen.getByText(/Error 404: Dangling Pointer/i)).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Oops! Page Has Gone Out of Scope/i })).toBeInTheDocument();

      // Return home action button is present and functional
      const homeAction = screen.getByRole('link', { name: /Return to Safety \(Home\)/i });
      expect(homeAction).toBeInTheDocument();

      await user.click(homeAction);
      expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/(Master Rust|Learn Rust)/i);
    });
  });

  // ==========================================
  // F02: React Router Setup
  // ==========================================
  describe('F02: React Router Setup', () => {
    it('TC-T1-F02-01: Base Path Recognition (/learn-rust/)', () => {
      renderApp({ route: '/learn-rust/' });
      const heroHeading = screen.getByRole('heading', { level: 1 });
      expect(heroHeading).toBeInTheDocument();
      expect(heroHeading).toHaveTextContent(/(Master Rust|Learn Rust)/i);
    });

    it('TC-T1-F02-02: Direct Navigation to Curriculum (/learn-rust/curriculum)', async () => {
      renderApp({ route: '/learn-rust/curriculum' });
      const curriculumHeading = await screen.findByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i });
      expect(curriculumHeading).toBeInTheDocument();
    });

    it('TC-T1-F02-03: Lesson Route Parameter Matching (/learn-rust/lessons/:slug)', async () => {
      renderApp({ route: '/learn-rust/lessons/hello-ferris' });
      const lessonTitle = await screen.findByRole('heading', { name: /Hello Ferris & Cargo Basics/i });
      expect(lessonTitle).toBeInTheDocument();
    });

    it('TC-T1-F02-04: Visualizer Gallery Route (/learn-rust/visualizers)', async () => {
      renderApp({ route: '/learn-rust/visualizers' });
      const heading = await screen.findByRole('heading', { name: /(6 Core Rust Concept Simulators|Visualizers)/i });
      expect(heading).toBeInTheDocument();
    });

    it('TC-T1-F02-05: Client-Side 404 Fallback Route (/learn-rust/non-existent-route)', async () => {
      renderApp({ route: '/learn-rust/non-existent-route-1234' });
      const notFoundHeading = await screen.findByRole('heading', { name: /(Oops! Page Has Gone Out of Scope|Page Not Found|404)/i });
      expect(notFoundHeading).toBeInTheDocument();
      const returnHomeBtn = screen.getByRole('link', { name: /Return to Safety/i });
      expect(returnHomeBtn).toBeInTheDocument();
    });
  });

  // ==========================================
  // F03: Vitest Test Infrastructure
  // ==========================================
  describe('F03: Vitest Test Infrastructure', () => {
    it('TC-T1-F03-01: Happy-DOM Environment Validation', () => {
      expect(typeof window).toBe('object');
      expect(typeof document).toBe('object');
      expect(typeof navigator).toBe('object');
      const div = document.createElement('div');
      div.id = 'vitest-test-element';
      document.body.appendChild(div);
      expect(document.getElementById('vitest-test-element')).toBe(div);
      document.body.removeChild(div);
    });

    it('TC-T1-F03-02: UserEvent User Interaction Dispatch', async () => {
      const user = userEvent.setup();
      renderApp({ route: '/learn-rust/' });
      // Find theme toggle button and click
      const themeBtn = screen.getByRole('button', { name: /Switch to (dark|light) theme/i });
      expect(themeBtn).toBeInTheDocument();
      await user.click(themeBtn);
      // Verify click listener executed and updated theme attribute or storage
      expect(localStorage.getItem('learn_rust_theme')).toMatch(/dark|light/);
    });

    it('TC-T1-F03-03: Asynchronous Render Timing & waitFor', async () => {
      renderApp({ route: '/learn-rust/curriculum' });
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i })).toBeInTheDocument();
      });
    });

    it('TC-T1-F03-04: Mock Cleanup Integrity', () => {
      const setItemSpy = vi.spyOn(localStorage, 'setItem');
      localStorage.setItem('temp_key', 'temp_val');
      expect(setItemSpy).toHaveBeenCalledWith('temp_key', 'temp_val');
      setItemSpy.mockRestore();
    });

    it('TC-T1-F03-05: Jest-DOM Custom Matchers Support', () => {
      renderApp({ route: '/learn-rust/' });
      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
      expect(main).toBeVisible();
      expect(main).toHaveClass('flex-1');
    });
  });
});
