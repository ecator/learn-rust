import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Footer } from '@/components/layout/Footer';

describe('Challenger 2: Adversarial Layout & Responsive Resilience', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.lang = 'zh';
    localStorage.clear();
  });

  describe('Header Resilience', () => {
    it('renders cleanly without onToggleSidebar provided (no hamburger button crash)', () => {
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );
      expect(screen.getByLabelText('Learn Rust Home')).toBeInTheDocument();
      // When onToggleSidebar is not provided, the hamburger button should not be rendered
      expect(screen.queryByLabelText(/navigation drawer/i)).not.toBeInTheDocument();
    });

    it('cycles languages repeatedly through zh -> en -> ja -> zh without error', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const langBtn = screen.getByLabelText(/Change language/i);
      expect(langBtn).toBeInTheDocument();

      // Cycle 6 times (2 full cycles)
      for (let i = 0; i < 6; i++) {
        await user.click(langBtn);
      }
      expect(['zh', 'en', 'ja']).toContain(document.documentElement.lang);
      expect(['zh', 'en', 'ja']).toContain(localStorage.getItem('learn_rust_lang'));
    });

    it('theme toggle handles rapid toggles and updates html class & localStorage', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      const themeBtn = screen.getByLabelText(/Switch to dark theme/i);
      for (let i = 0; i < 5; i++) {
        await user.click(screen.getByLabelText(/Switch to (dark|light) theme/i));
      }
      // After 5 clicks from light, should be dark
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(localStorage.getItem('learn_rust_theme')).toBe('dark');
    });
  });

  describe('Sidebar Resilience & Boundaries', () => {
    it('handles backdrop click when open to trigger onClose', () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <MemoryRouter>
          <Sidebar isOpen={true} onClose={onClose} />
        </MemoryRouter>
      );

      const backdrop = screen.getByRole('presentation');
      expect(backdrop).toBeInTheDocument();
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);

      // When closed, backdrop disappears
      rerender(
        <MemoryRouter>
          <Sidebar isOpen={false} onClose={onClose} />
        </MemoryRouter>
      );
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });

    it('navigating via a curriculum item triggers onClose in mobile drawer', () => {
      const onClose = vi.fn();
      render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={onClose} />
        </MemoryRouter>
      );

      const lessonLink = screen.getByText('1. Hello Ferris & Cargo');
      fireEvent.click(lessonLink);
      expect(onClose).toHaveBeenCalled();
    });

    it('navigating via visualizers link triggers onClose in mobile drawer', () => {
      const onClose = vi.fn();
      render(
        <MemoryRouter initialEntries={['/']}>
          <Sidebar isOpen={true} onClose={onClose} />
        </MemoryRouter>
      );

      const visLink = screen.getByText('Ownership & Move');
      fireEvent.click(visLink);
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Breadcrumbs Stress & Edge Cases', () => {
    it('returns null on root path /', () => {
      const { container } = render(
        <MemoryRouter initialEntries={['/']}>
          <Breadcrumbs />
        </MemoryRouter>
      );
      expect(container.firstChild).toBeNull();
    });

    it('handles deeply nested arbitrary paths without crashing', () => {
      render(
        <MemoryRouter initialEntries={['/deep/nested/path/to/resource']}>
          <Breadcrumbs />
        </MemoryRouter>
      );
      const nav = screen.getByLabelText('Breadcrumb');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveTextContent('Home');
      expect(nav).toHaveTextContent('Deep');
      expect(nav).toHaveTextContent('Nested');
      expect(nav).toHaveTextContent('Path');
      expect(nav).toHaveTextContent('To');
      expect(nav).toHaveTextContent('Resource');
    });

    it('correctly maps lesson/:slug to Curriculum breadcrumb without duplicate', () => {
      render(
        <MemoryRouter initialEntries={['/lesson/concurrency-mutex']}>
          <Breadcrumbs />
        </MemoryRouter>
      );
      const nav = screen.getByLabelText('Breadcrumb');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveTextContent('Home');
      expect(nav).toHaveTextContent('Curriculum');
      expect(nav).toHaveTextContent('Concurrency Mutex');
    });

    it('handles single segment paths cleanly', () => {
      render(
        <MemoryRouter initialEntries={['/curriculum']}>
          <Breadcrumbs />
        </MemoryRouter>
      );
      const nav = screen.getByLabelText('Breadcrumb');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveTextContent('Home');
      expect(nav).toHaveTextContent('Curriculum');
    });
  });

  describe('MobileNav Resilience', () => {
    it('renders all 4 primary navigation tabs', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <MobileNav />
        </MemoryRouter>
      );
      const mobileNav = screen.getByLabelText('Mobile Bottom Navigation');
      expect(mobileNav).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Curriculum/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Visualizers/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Progress/i })).toBeInTheDocument();
    });
  });

  describe('Footer External Links & Security Attributes', () => {
    it('verifies all external links have rel="noopener noreferrer" and target="_blank"', () => {
      render(
        <MemoryRouter>
          <Footer />
        </MemoryRouter>
      );

      const links = screen.getAllByRole('link');
      const externalLinks = links.filter((l) => l.getAttribute('target') === '_blank');
      expect(externalLinks.length).toBeGreaterThan(0);

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link.getAttribute('href')).toMatch(/^https:\/\//);
      });
    });
  });

  describe('AppLayout Full Shell Integration', () => {
    it('coordinates open/close state between Header hamburger and Sidebar', async () => {
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<div>Shell Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      // Initially closed
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument();

      // Click hamburger
      const menuBtn = screen.getByLabelText('Open navigation drawer');
      await user.click(menuBtn);

      // Now backdrop is open
      const backdrop = screen.getByRole('presentation');
      expect(backdrop).toBeInTheDocument();

      // Click backdrop to dismiss
      await user.click(backdrop);
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument();
    });
  });
});
