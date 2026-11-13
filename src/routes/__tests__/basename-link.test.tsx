import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routesConfig } from '../routesConfig';

describe('Basename Link Generation Adversarial Check', () => {
  it('correctly qualifies anchor href attributes with basename', () => {
    const router = createMemoryRouter(routesConfig, {
      basename: '/learn-rust',
      initialEntries: ['/learn-rust/'],
    });

    render(<RouterProvider router={router} />);

    // Check header logo link
    const logoLink = screen.getByRole('link', { name: /Learn Rust Home/i });
    expect(logoLink).toHaveAttribute('href', '/learn-rust');

    // Check header navigation links
    const curriculumLink = screen.getAllByRole('link', { name: /Curriculum/i })[0];
    expect(curriculumLink).toHaveAttribute('href', '/learn-rust/curriculum');

    const visualizersLink = screen.getAllByRole('link', { name: /Visualizers/i })[0];
    expect(visualizersLink).toHaveAttribute('href', '/learn-rust/visualizers');

    const progressLink = screen.getAllByRole('link', { name: /Progress/i })[0];
    expect(progressLink).toHaveAttribute('href', '/learn-rust/progress');
  });

  it('correctly qualifies anchor href attributes when basename is root "/"', () => {
    const router = createMemoryRouter(routesConfig, {
      basename: '/',
      initialEntries: ['/'],
    });

    render(<RouterProvider router={router} />);

    const curriculumLink = screen.getAllByRole('link', { name: /Curriculum/i })[0];
    expect(curriculumLink).toHaveAttribute('href', '/curriculum');

    const visualizersLink = screen.getAllByRole('link', { name: /Visualizers/i })[0];
    expect(visualizersLink).toHaveAttribute('href', '/visualizers');
  });

  it('404 recovery buttons have proper basename-aware links', () => {
    const router = createMemoryRouter(routesConfig, {
      basename: '/learn-rust',
      initialEntries: ['/learn-rust/invalid-page'],
    });

    render(<RouterProvider router={router} />);

    const returnHomeLink = screen.getByRole('link', { name: /Return to Safety/i });
    expect(returnHomeLink).toHaveAttribute('href', '/learn-rust');

    const browseCurriculumLink = screen.getByRole('link', { name: /Browse Curriculum/i });
    expect(browseCurriculumLink).toHaveAttribute('href', '/learn-rust/curriculum');
  });
});
