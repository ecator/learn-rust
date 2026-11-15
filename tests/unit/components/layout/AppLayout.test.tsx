import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { AppLayout } from '@/components/layout/AppLayout';

describe('AppLayout Component', () => {
  beforeEach(() => {
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  const renderLayout = (initialPath = '/') => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<div data-testid="page-content">Home Content</div>} />
            <Route path="curriculum" element={<div data-testid="page-content">Curriculum Content</div>} />
            <Route path="lesson/:slug" element={<div data-testid="page-content">Lesson Detail Content</div>} />
            <Route path="visualizers" element={<div data-testid="page-content">Visualizers Content</div>} />
            <Route path="progress" element={<div data-testid="page-content">Progress Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders header, brand logo, navigation links, and outlet content', () => {
    renderLayout('/');

    // Brand and logo
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(process.cwd(), 'package.json'), 'utf-8')
    ) as { version: string };
    const expectedVersion = pkg.version.startsWith('v') ? pkg.version : `v${pkg.version}`;
    expect(screen.getByLabelText('Learn Rust Home')).toBeInTheDocument();
    expect(screen.getAllByText('Learn Rust').length).toBeGreaterThan(0);
    expect(screen.getByText(expectedVersion)).toBeInTheDocument();

    // Desktop nav links in header
    const desktopNav = screen.getByLabelText('Desktop Navigation');
    expect(desktopNav).toBeInTheDocument();
    expect(desktopNav).toHaveTextContent('Home');
    expect(desktopNav).toHaveTextContent('Curriculum');
    expect(desktopNav).toHaveTextContent('Visualizers');
    expect(desktopNav).toHaveTextContent('Progress');

    // Outlet child
    expect(screen.getByTestId('page-content')).toHaveTextContent('Home Content');
  });

  it('toggles theme between light, dark, and auto (system) across header and sidebar', async () => {
    const user = userEvent.setup();
    renderLayout('/');

    const lightBtn = screen.getByLabelText('Switch to light theme');
    const darkBtn = screen.getByLabelText('Switch to dark theme');
    const autoBtn = screen.getByLabelText('Switch to auto theme');

    expect(autoBtn).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(darkBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('sidebar-theme-dark')).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('learn_rust_theme')).toBe('dark');

    await user.click(lightBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(lightBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('sidebar-theme-light')).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('learn_rust_theme')).toBe('light');

    await user.click(screen.getByTestId('sidebar-theme-system'));
    expect(autoBtn).toHaveAttribute('aria-pressed', 'true');
    expect(localStorage.getItem('learn_rust_theme')).toBe('system');
  });

  it('displays localized Light / Dark / Auto labels when switched to Chinese', async () => {
    const user = userEvent.setup();
    renderLayout('/');

    await user.click(screen.getByTestId('lang-option-zh'));

    expect(screen.getByTestId('theme-option-light')).toHaveTextContent('明亮');
    expect(screen.getByTestId('theme-option-dark')).toHaveTextContent('暗色');
    expect(screen.getByTestId('theme-option-system')).toHaveTextContent('自动');
  });

  it('opens and closes mobile sidebar drawer when menu button is clicked', async () => {
    const user = userEvent.setup();
    renderLayout('/');

    const menuBtn = screen.getByLabelText('Open navigation drawer');
    expect(menuBtn).toBeInTheDocument();

    // Click to open sidebar
    await user.click(menuBtn);
    expect(screen.getByLabelText('Close navigation drawer')).toBeInTheDocument();

    // Check that close drawer button in drawer also works
    const closeDrawerBtn = screen.getByLabelText('Close navigation sidebar');
    await user.click(closeDrawerBtn);

    expect(screen.getByLabelText('Open navigation drawer')).toBeInTheDocument();
  });

  it('renders breadcrumbs correctly on nested routes', () => {
    renderLayout('/lesson/ownership-move');

    const breadcrumbs = screen.getByLabelText('Breadcrumb');
    expect(breadcrumbs).toBeInTheDocument();
    expect(breadcrumbs).toHaveTextContent('Home');
    expect(breadcrumbs).toHaveTextContent('Curriculum');
    expect(breadcrumbs).toHaveTextContent('Ownership Move');
  });

  it('renders footer with official links and copyright', () => {
    renderLayout('/');

    expect(screen.getByText('The Rust Book')).toBeInTheDocument();
    expect(screen.getByText('Standard Library API')).toBeInTheDocument();
    expect(screen.getByText(/Pure client-side interactive web app/i)).toBeInTheDocument();
  });

  it('renders mobile bottom navigation bar', () => {
    renderLayout('/');

    const mobileNav = screen.getByLabelText('Mobile Bottom Navigation');
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav).toHaveTextContent('Home');
    expect(mobileNav).toHaveTextContent('Curriculum');
    expect(mobileNav).toHaveTextContent('Visualizers');
    expect(mobileNav).toHaveTextContent('Progress');
  });
});
