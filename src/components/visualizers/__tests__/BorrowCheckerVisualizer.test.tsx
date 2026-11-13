import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BorrowCheckerVisualizer } from '../BorrowCheckerVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('BorrowCheckerVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders initial state with mutable binding', () => {
    render(
      <I18nProvider defaultLanguage="en">
        <BorrowCheckerVisualizer initialStep={0} />
      </I18nProvider>
    );

    expect(screen.getByTestId('borrow-checker-visualizer')).toBeInTheDocument();
    expect(screen.getByText(/Borrow Checker & Lifetimes Visualizer/i)).toBeInTheDocument();
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 1 of 4/i);
    expect(screen.getByTestId('ferris-mascot-happy')).toBeInTheDocument();
  });

  it('renders concurrent immutable reference leases at step 1', () => {
    render(
      <I18nProvider defaultLanguage="en">
        <BorrowCheckerVisualizer initialStep={1} />
      </I18nProvider>
    );

    const activeLeases = screen.getAllByText(/Active Lease \(&T\)/i);
    expect(activeLeases.length).toBe(2);
    expect(screen.getByTestId('ferris-mascot-detective')).toBeInTheDocument();
  });

  it('displays E0502 compiler error on mutable borrow conflict at step 2', () => {
    render(
      <I18nProvider defaultLanguage="en">
        <BorrowCheckerVisualizer initialStep={2} />
      </I18nProvider>
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/error\[E0502\]: cannot borrow 'x' as mutable because it is also borrowed as immutable/i);
    expect(screen.getByTestId('compiler-error')).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();
  });

  it('toggles error simulation to valid scoped mode', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <BorrowCheckerVisualizer initialStep={2} />
      </I18nProvider>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Toggle Error Simulation/i });
    await user.click(toggleBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(/Immutable leases expired before mutable borrow/i)).toBeInTheDocument();
  });

  it('demonstrates Non-Lexical Lifetimes (NLL) early release at step 3', () => {
    render(
      <I18nProvider defaultLanguage="en">
        <BorrowCheckerVisualizer initialStep={3} />
      </I18nProvider>
    );

    expect(screen.getAllByText(/Non-Lexical Lifetimes \(NLL\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Active Lease \(&mut T\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-safety')).toBeInTheDocument();
  });

  it('supports previous, next, reset and play/pause controls', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <BorrowCheckerVisualizer initialStep={0} />
      </I18nProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextBtn);
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 2 of 4/i);

    const prevBtn = screen.getByRole('button', { name: /Previous Step/i });
    await user.click(prevBtn);
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 1 of 4/i);

    const playBtn = screen.getByRole('button', { name: /Play/i });
    await user.click(playBtn);
    expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    await user.click(resetBtn);
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 1 of 4/i);
  });

  it('renders text in Chinese when language is zh', () => {
    render(
      <I18nProvider defaultLanguage="zh">
        <BorrowCheckerVisualizer initialStep={0} />
      </I18nProvider>
    );

    expect(screen.getByText(/借用检查器与生命周期/i)).toBeInTheDocument();
  });

  it('renders text in Japanese when language is ja', () => {
    render(
      <I18nProvider defaultLanguage="ja">
        <BorrowCheckerVisualizer initialStep={0} />
      </I18nProvider>
    );

    expect(screen.getByText(/借用チェッカーとライフタイム/i)).toBeInTheDocument();
  });

  it('switches mobile tabs between Code and Leases Timeline', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <BorrowCheckerVisualizer initialStep={0} />
      </I18nProvider>
    );

    const timelineTab = screen.getByRole('tab', { name: /Leases Timeline/i });
    await user.click(timelineTab);
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');

    const codeTab = screen.getByRole('tab', { name: /Code View/i });
    await user.click(codeTab);
    expect(codeTab).toHaveAttribute('aria-selected', 'true');
  });
});
