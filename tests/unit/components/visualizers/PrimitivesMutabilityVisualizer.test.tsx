import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PrimitivesMutabilityVisualizer } from '@/components/visualizers/PrimitivesMutabilityVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('PrimitivesMutabilityVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders immutable binding error E0384 initially and toggles to valid mut mode', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <PrimitivesMutabilityVisualizer />
      </I18nProvider>
    );

    expect(screen.getByTestId('primitives-mutability-visualizer')).toBeInTheDocument();
    expect(screen.getByTestId('compiler-error')).toHaveTextContent(/E0384/i);
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Toggle Error Simulation/i });
    await user.click(toggleBtn);

    expect(screen.queryByTestId('compiler-error')).not.toBeInTheDocument();
    expect(screen.getByText(/MUTABLE \(IN-PLACE\)/i)).toBeInTheDocument();

    const mutateBtn = screen.getByRole('button', { name: /Mutate \+1/i });
    await user.click(mutateBtn);
    expect(screen.getByText('43')).toBeInTheDocument();
  });

  it('steps through shadowing, scalar stack types, and Copy array semantics', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <PrimitivesMutabilityVisualizer />
      </I18nProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextBtn);
    expect(screen.getByTestId('shadowing-stack-view')).toBeInTheDocument();
    expect(screen.getByText(/SHADOWED/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-wizard')).toBeInTheDocument();

    await user.click(nextBtn);
    expect(screen.getByTestId('scalar-stack-view')).toBeInTheDocument();
    expect(screen.getByText(/f64 \(8 bytes\)/i)).toBeInTheDocument();

    await user.click(nextBtn);
    expect(screen.getByTestId('copy-array-stack-view')).toBeInTheDocument();
    expect(screen.getByText(/VALID \(Bitwise Copy\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-happy')).toBeInTheDocument();
  });

  it('resets back to step 1 when Reset is clicked', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <PrimitivesMutabilityVisualizer initialStep={2} />
      </I18nProvider>
    );

    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 3 of 4/i);
    await user.click(screen.getByRole('button', { name: /Reset/i }));
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 1 of 4/i);
  });
});
