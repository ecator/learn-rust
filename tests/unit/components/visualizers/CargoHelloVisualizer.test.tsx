import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CargoHelloVisualizer } from '@/components/visualizers/CargoHelloVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('CargoHelloVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Cargo project structure initially and steps through macro check, .rodata, and release profiles', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <CargoHelloVisualizer />
      </I18nProvider>
    );

    expect(screen.getByTestId('cargo-hello-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('cargo-tree-view')).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-happy')).toBeInTheDocument();

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextBtn);
    expect(screen.getByTestId('cargo-check-view')).toBeInTheDocument();
    expect(screen.queryByTestId('compiler-error')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Toggle Error Simulation/i }));
    expect(screen.getByTestId('compiler-error')).toHaveTextContent(/E0423/i);
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();

    await user.click(nextBtn);
    const rodataView = screen.getByTestId('rodata-view');
    expect(rodataView).toBeInTheDocument();
    expect(within(rodataView).getByText(/\.rodata/i)).toBeInTheDocument();

    await user.click(nextBtn);
    expect(screen.getByTestId('cargo-profiles-view')).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-speed')).toBeInTheDocument();
  });
});
