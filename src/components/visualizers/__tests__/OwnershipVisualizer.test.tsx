import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OwnershipVisualizer } from '../OwnershipVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('OwnershipVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders initial state with Stack and Heap allocations', () => {
    render(
      <I18nProvider defaultLanguage="en">
        <OwnershipVisualizer initialStep={0} />
      </I18nProvider>
    );

    expect(screen.getByTestId('ownership-visualizer')).toBeInTheDocument();
    expect(screen.getByText(/Stack Memory/i)).toBeInTheDocument();
    expect(screen.getByText(/Heap Memory/i)).toBeInTheDocument();
    expect(screen.getByText(/s1: String/i)).toBeInTheDocument();
    expect(screen.getByText(/ptr: 0x1040/i)).toBeInTheDocument();
    expect(screen.getByText(/len: 5/i)).toBeInTheDocument();
    expect(screen.getByText(/cap: 5/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-safety')).toBeInTheDocument();
  });

  it('advances through steps: move semantics at step 1', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <OwnershipVisualizer initialStep={0} />
      </I18nProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextBtn);

    expect(screen.getByText(/s2: String \(Valid Owner\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Moved\/Invalidated/i)).toBeInTheDocument();
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 2 of 4/i);
  });

  it('shows compiler error E0382 at step 2 when error simulation is enabled', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <OwnershipVisualizer initialStep={1} />
      </I18nProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/error\[E0382\]: borrow of moved value: 's1'/i);
    expect(screen.getByTestId('compiler-error')).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();
  });

  it('toggles error simulation to clone mode and resolves compiler error', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <OwnershipVisualizer initialStep={2} />
      </I18nProvider>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    const toggleBtn = screen.getByRole('button', { name: /Toggle Error Simulation/i });
    await user.click(toggleBtn);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByText(/With explicit \.clone\(\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-happy')).toBeInTheDocument();
  });

  it('drops heap memory at step 3', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <OwnershipVisualizer initialStep={2} />
      </I18nProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextBtn);

    expect(screen.getByText(/Heap memory deallocated/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-confused')).toBeInTheDocument();
  });

  it('handles reset and previous step navigation', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <OwnershipVisualizer initialStep={3} />
      </I18nProvider>
    );

    const prevBtn = screen.getByRole('button', { name: /Previous Step/i });
    await user.click(prevBtn);
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 3 of 4/i);

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    await user.click(resetBtn);
    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 1 of 4/i);
  });

  it('renders text in Chinese when language is zh', () => {
    render(
      <I18nProvider defaultLanguage="zh">
        <OwnershipVisualizer initialStep={0} />
      </I18nProvider>
    );

    expect(screen.getByText(/所有权转移与内存机制/i)).toBeInTheDocument();
  });

  it('renders text in Japanese when language is ja', () => {
    render(
      <I18nProvider defaultLanguage="ja">
        <OwnershipVisualizer initialStep={0} />
      </I18nProvider>
    );

    expect(screen.getByText(/所有権移動とメモリ可視化/i)).toBeInTheDocument();
  });

  it('switches mobile tabs between Code and Memory State', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <OwnershipVisualizer initialStep={0} />
      </I18nProvider>
    );

    const memoryTab = screen.getByRole('tab', { name: /Memory State/i });
    await user.click(memoryTab);
    expect(memoryTab).toHaveAttribute('aria-selected', 'true');

    const codeTab = screen.getByRole('tab', { name: /Code View/i });
    await user.click(codeTab);
    expect(codeTab).toHaveAttribute('aria-selected', 'true');
  });
});
