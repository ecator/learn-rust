import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { routesConfig } from '../routesConfig';

describe('Application Routing Tree', () => {
  const renderRoute = (initialPath: string) => {
    const memoryRouter = createMemoryRouter(routesConfig, {
      initialEntries: [initialPath],
    });
    return render(<RouterProvider router={memoryRouter} />);
  };

  it('renders Home route on "/"', () => {
    renderRoute('/');

    expect(screen.getByText(/Master Rust with/i)).toBeInTheDocument();
    expect(screen.getByText(/Visual Clarity/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Learning/i)).toBeInTheDocument();
    expect(screen.getByText(/Why Learn Rust Here\?/i)).toBeInTheDocument();
  });

  it('renders Curriculum route on "/curriculum"', () => {
    renderRoute('/curriculum');

    expect(screen.getByText(/The Complete Rust Learning Path/i)).toBeInTheDocument();
    expect(screen.getByText('Hello Ferris & Cargo Basics')).toBeInTheDocument();
    expect(screen.getByText('Ownership & Move Semantics')).toBeInTheDocument();
    expect(screen.getByText('Fearless Concurrency & Mutex')).toBeInTheDocument();
  });

  it('renders Lesson detail route on "/lesson/:slug"', () => {
    renderRoute('/lesson/ownership-move');

    expect(screen.getByText('Ownership & Move Semantics')).toBeInTheDocument();
    expect(screen.getByText(/Ownership is Rust’s core mechanism/i)).toBeInTheDocument();
    expect(screen.getByText(/Open Related Visualizer/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Code Walkthrough/i)).toBeInTheDocument();
  });

  it('renders Visualizers Gallery on "/visualizers"', () => {
    renderRoute('/visualizers');

    expect(screen.getByText('6 Core Rust Concept Simulators')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Borrow Checker & Lifetimes' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Memory Layout (Stack vs Heap)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Trait Dispatch (Static vs Dyn)' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Railway Error Flow (Option/Result)' })).toBeInTheDocument();
  });

  it('renders Progress dashboard on "/progress"', () => {
    renderRoute('/progress');

    expect(screen.getByText('Your Learning Trajectory')).toBeInTheDocument();
    expect(screen.getByText('Experience Points (XP)')).toBeInTheDocument();
    expect(screen.getByText('Reset Local Progress')).toBeInTheDocument();
    expect(screen.getByText(/Level 1: Novice Crab/i)).toBeInTheDocument();
  });

  it('renders 404 NotFound page on unknown routes', () => {
    renderRoute('/unknown/dangling-route');

    expect(screen.getByText(/Error 404: Dangling Pointer/i)).toBeInTheDocument();
    expect(screen.getByText(/Oops! Page Has Gone Out of Scope/i)).toBeInTheDocument();
    expect(screen.getByText(/Return to Safety \(Home\)/i)).toBeInTheDocument();
  });
});
