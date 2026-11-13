import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routesConfig } from '../routesConfig';

describe('Adversarial Routing & Edge Cases', () => {
  const createRouter = (basename: string, initialEntry: string) => {
    return createMemoryRouter(routesConfig, {
      basename,
      initialEntries: [initialEntry],
    });
  };

  describe('1. Trailing Slash Handling', () => {
    it.each([
      ['/curriculum/', 'The Complete Rust Learning Path'],
      ['/visualizers/', '6 Core Rust Concept Simulators'],
      ['/progress/', 'Your Learning Trajectory'],
      ['/lesson/ownership-move/', 'Ownership & Move Semantics'],
      ['/lessons/ownership-move/', 'Ownership & Move Semantics'],
    ])('resolves trailing slash on %s cleanly without 404', (path, expectedText) => {
      const router = createRouter('/', path);
      render(<RouterProvider router={router} />);
      const matched = screen.getAllByText(new RegExp(expectedText, 'i'));
      expect(matched.length).toBeGreaterThan(0);
      expect(matched[0]).toBeInTheDocument();
      expect(screen.queryByText(/Error 404: Dangling Pointer/i)).not.toBeInTheDocument();
    });
  });

  describe('2. URL Encoding & Special Characters in Slugs', () => {
    it('handles encoded unicode slugs safely (e.g. Chinese %E7%AE%A1%E9%81%93)', () => {
      const router = createRouter('/', '/lesson/%E7%AE%A1%E9%81%93');
      render(<RouterProvider router={router} />);
      // Should not throw or crash React tree
      expect(screen.queryByText(/Error 404: Dangling Pointer/i)).not.toBeInTheDocument();
    });

    it('handles spaces encoded as %20 in slug', () => {
      const router = createRouter('/', '/lesson/hello%20world');
      render(<RouterProvider router={router} />);
      expect(screen.queryByText(/Error 404: Dangling Pointer/i)).not.toBeInTheDocument();
    });

    it('handles plus signs in slug', () => {
      const router = createRouter('/', '/lesson/trait+impl');
      render(<RouterProvider router={router} />);
      expect(screen.queryByText(/Error 404: Dangling Pointer/i)).not.toBeInTheDocument();
    });
  });

  describe('3. Deep Nested Paths & 404 Catch-All', () => {
    it.each([
      ['/curriculum/deep/nested/sub/path'],
      ['/lesson/a/b/c/d/e'],
      ['/visualizers/extra/trailing/segments'],
      ['/some/completely/unknown/nonexistent/dangling/pointer/path'],
      ['/learn-rust/unknown/deep/path'],
    ])('catches deep invalid path %s with 404 Dangling Pointer page', (deepPath) => {
      const router = createRouter('/', deepPath);
      render(<RouterProvider router={router} />);
      expect(screen.getByText(/Error 404: Dangling Pointer/i)).toBeInTheDocument();
      expect(screen.getByText(/Oops! Page Has Gone Out of Scope/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Return to Safety/i })).toBeInTheDocument();
    });
  });

  describe('4. Basename Robustness (/learn-rust/ vs / vs empty)', () => {
    it('resolves routes when basename is /learn-rust/', () => {
      const router = createRouter('/learn-rust/', '/learn-rust/curriculum');
      render(<RouterProvider router={router} />);
      expect(screen.getByText(/The Complete Rust Learning Path/i)).toBeInTheDocument();
    });

    it('resolves routes when basename is /learn-rust (no trailing slash)', () => {
      const router = createRouter('/learn-rust', '/learn-rust/curriculum');
      render(<RouterProvider router={router} />);
      expect(screen.getByText(/The Complete Rust Learning Path/i)).toBeInTheDocument();
    });

    it('resolves root home when basename is /learn-rust/', () => {
      const router = createRouter('/learn-rust/', '/learn-rust/');
      render(<RouterProvider router={router} />);
      expect(screen.getByText(/Master Rust with/i)).toBeInTheDocument();
    });

    it('resolves root home when basename is /', () => {
      const router = createRouter('/', '/');
      render(<RouterProvider router={router} />);
      expect(screen.getByText(/Master Rust with/i)).toBeInTheDocument();
    });
  });

  describe('5. GitHub Pages 404 & Index Redirection Logic Simulation', () => {
    function simulate404Redirect(urlStr: string, pathSegmentsToKeep = 1): string {
      const url = new URL(urlStr);
      const l = {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
      };
      // Logic from 404.html:
      const redirectedUrl =
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash;

      return redirectedUrl;
    }

    function simulateIndexRestoration(redirectedUrlStr: string): string {
      const url = new URL(redirectedUrlStr);
      const l = {
        pathname: url.pathname,
        search: url.search,
        hash: url.hash,
      };
      // Logic from index.html:
      if (l.search[1] === '/') {
        const decoded = l.search.slice(1).split('&').map((s) => s.replace(/~and~/g, '&')).join('?');
        const restored = l.pathname.slice(0, -1) + decoded + l.hash;
        return restored;
      }
      return l.pathname + l.search + l.hash;
    }

    it('correctly rounds-trips simple route: /learn-rust/curriculum', () => {
      const orig = 'https://ecator.github.io/learn-rust/curriculum';
      const redirected = simulate404Redirect(orig, 1);
      expect(redirected).toBe('https://ecator.github.io/learn-rust/?/curriculum');
      const restored = simulateIndexRestoration(redirected);
      expect(restored).toBe('/learn-rust/curriculum');
    });

    it('correctly round-trips deep route with params: /learn-rust/lesson/ownership-move?ref=sidebar&step=2#section-quiz', () => {
      const orig = 'https://ecator.github.io/learn-rust/lesson/ownership-move?ref=sidebar&step=2#section-quiz';
      const redirected = simulate404Redirect(orig, 1);
      expect(redirected).toBe('https://ecator.github.io/learn-rust/?/lesson/ownership-move&ref=sidebar~and~step=2#section-quiz');
      const restored = simulateIndexRestoration(redirected);
      expect(restored).toBe('/learn-rust/lesson/ownership-move?ref=sidebar&step=2#section-quiz');
    });

    it('correctly preserves multiple query params with multiple & and = signs', () => {
      const orig = 'https://ecator.github.io/learn-rust/progress?filter=completed&sort=asc&page=1&lang=zh';
      const redirected = simulate404Redirect(orig, 1);
      const restored = simulateIndexRestoration(redirected);
      expect(restored).toBe('/learn-rust/progress?filter=completed&sort=asc&page=1&lang=zh');
    });

    it('does not corrupt normal root URLs without 404 query redirect (e.g. /learn-rust/?foo=bar)', () => {
      const rootUrl = 'https://ecator.github.io/learn-rust/?foo=bar';
      const restored = simulateIndexRestoration(rootUrl);
      expect(restored).toBe('/learn-rust/?foo=bar');
    });
  });
});
