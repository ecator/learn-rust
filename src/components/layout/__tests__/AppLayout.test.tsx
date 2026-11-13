import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../AppLayout';

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
    expect(screen.getByLabelText('Learn Rust Home')).toBeInTheDocument();
    expect(screen.getAllByText('Learn Rust').length).toBeGreaterThan(0);

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

  it('toggles theme between light and dark when theme button is clicked', async () => {
    const user = userEvent.setup();
    renderLayout('/');

    const themeBtn = screen.getByLabelText('Switch to dark theme');
    expect(themeBtn).toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(themeBtn);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByLabelText('Switch to light theme')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Switch to light theme'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
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
