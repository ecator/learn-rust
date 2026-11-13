import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConcurrencyVisualizer } from '../ConcurrencyVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('ConcurrencyVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders MPSC Channel message queue by default', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    expect(screen.getByTestId('concurrency-visualizer')).toBeInTheDocument();
    expect(screen.getByText(/Multiple Producer, Single Consumer/i)).toBeInTheDocument();

    const sendBtn = screen.getByRole('button', { name: /Send Message/i });
    await user.click(sendBtn);

    expect(screen.getByText(/Message #1/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-safety')).toBeInTheDocument();
  });

  it('handles Arc<Mutex<T>> lock contention and handoff', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    const mutexTab = screen.getByRole('tab', { name: /Arc<Mutex<T>>/i });
    await user.click(mutexTab);

    const t1Btn = screen.getByRole('button', { name: /Thread 1: Acquire Lock/i });
    await user.click(t1Btn);

    expect(screen.getByText(/Holding Lock/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-detective')).toBeInTheDocument();

    const t2Btn = screen.getByRole('button', { name: /Thread 2: Acquire \/ Handoff/i });
    await user.click(t2Btn);

    expect(screen.getByText('1')).toBeInTheDocument(); // counter increments
  });

  it('triggers Deadlock scenario warning and panic Ferris mood', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    const deadlockTab = screen.getByRole('tab', { name: /Deadlock Scenario/i });
    await user.click(deadlockTab);

    const simBtn = screen.getByRole('button', { name: /Simulate Deadlock/i });
    await user.click(simBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/Deadlock Warning/i);
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();
  });

  it('simulates thread spawn and join lifecycle', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    const threadsTab = screen.getByRole('tab', { name: /Thread Spawn\/Join/i });
    await user.click(threadsTab);

    const spawnBtn = screen.getByRole('button', { name: /Spawn Thread/i });
    await user.click(spawnBtn);
    expect(screen.getByText(/Worker Thread \(spawned\)/i)).toBeInTheDocument();

    const joinBtn = screen.getByRole('button', { name: /Join Thread/i });
    await user.click(joinBtn);
    expect(screen.getByText(/joined!/i)).toBeInTheDocument();
  });

  it('toggles data race compile error simulation', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    const errorToggle = screen.getByRole('button', { name: /Toggle Error Simulation/i });
    await user.click(errorToggle);

    expect(screen.getByTestId('compiler-error')).toHaveTextContent(/E0277.*Send/i);
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();
  });

  it('resets visualizer state when reset button is clicked', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    const sendBtn = screen.getByRole('button', { name: /Send Message/i });
    await user.click(sendBtn);
    expect(screen.getByText(/Message #1/i)).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    await user.click(resetBtn);

    expect(screen.queryByText(/Message #1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Channel Buffer \(0\)/i)).toBeInTheDocument();
  });

  it('renders in Chinese when language is zh', () => {
    localStorage.setItem('learn_rust_lang', 'zh');
    render(
      <I18nProvider defaultLanguage="zh">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/并发.*锁机制/i)).toBeInTheDocument();
  });

  it('renders in Japanese when language is ja', () => {
    localStorage.setItem('learn_rust_lang', 'ja');
    render(
      <I18nProvider defaultLanguage="ja">
        <ConcurrencyVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/並行.*排他制御/i)).toBeInTheDocument();
  });
});
