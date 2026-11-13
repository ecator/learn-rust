import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TraitDispatchVisualizer } from '../TraitDispatchVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('TraitDispatchVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders static dispatch (monomorphization) view by default', () => {
    render(
      <I18nProvider defaultLanguage="en">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    expect(screen.getByTestId('trait-dispatch-visualizer')).toBeInTheDocument();
    expect(screen.getByText(/draw_circle/i)).toBeInTheDocument();
    expect(screen.getByText(/draw_square/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-speed')).toBeInTheDocument();
  });

  it('switches to Dynamic Dispatch tab with fat pointer vtable', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    const dynamicTab = screen.getByRole('tab', { name: /Dynamic Dispatch/i });
    await user.click(dynamicTab);

    expect(screen.getAllByText(/Data Pointer/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/VTable Pointer/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('ferris-mascot-detective')).toBeInTheDocument();
  });

  it('traces vtable jump steps on step execution', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    const dynamicTab = screen.getByRole('tab', { name: /Dynamic Dispatch/i });
    await user.click(dynamicTab);

    const stepBtn = screen.getByRole('button', { name: /Step Execution/i });
    await user.click(stepBtn);
    await user.click(stepBtn);

    expect(screen.getByText(/Jump to target function address/i)).toBeInTheDocument();
  });

  it('displays cost trade-offs comparison table', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    const tradeoffsTab = screen.getByRole('tab', { name: /Cost Trade-offs/i });
    await user.click(tradeoffsTab);

    expect(screen.getByText(/Binary Size/i)).toBeInTheDocument();
    expect(screen.getByText(/Runtime Indirection/i)).toBeInTheDocument();
  });

  it('simulates Object Safety violation with error E0038', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    const safetyTab = screen.getByRole('tab', { name: /Object Safety/i });
    await user.click(safetyTab);

    const toggleBtn = screen.getByRole('button', { name: /Only object-safe methods/i });
    await user.click(toggleBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/E0038.*trait cannot be made into an object/i);
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();
  });

  it('triggers error simulation from quick toggle button', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    const quickErrorBtn = screen.getByRole('button', { name: /Toggle Error Simulation/i });
    await user.click(quickErrorBtn);

    expect(screen.getByRole('alert')).toHaveTextContent(/E0038/i);
  });

  it('renders tri-lingual titles in Chinese when language is zh', () => {
    localStorage.setItem('learn_rust_lang', 'zh');
    render(
      <I18nProvider defaultLanguage="zh">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/Trait 分发与虚表机制/i)).toBeInTheDocument();
    expect(screen.getByText(/静态单态化 vs 动态虚表分发/i)).toBeInTheDocument();
  });

  it('renders tri-lingual titles in Japanese when language is ja', () => {
    localStorage.setItem('learn_rust_lang', 'ja');
    render(
      <I18nProvider defaultLanguage="ja">
        <TraitDispatchVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/Trait ディスパッチと vtable/i)).toBeInTheDocument();
  });
});
