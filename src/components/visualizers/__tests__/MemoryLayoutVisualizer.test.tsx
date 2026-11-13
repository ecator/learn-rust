import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryLayoutVisualizer } from '../MemoryLayoutVisualizer';
import { I18nProvider } from '@/lib/i18n';

describe('MemoryLayoutVisualizer Unit Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  it('renders initial String vs &str fat pointer comparison', () => {
    render(
      <I18nProvider defaultLanguage="en">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    expect(screen.getByTestId('memory-layout-visualizer')).toBeInTheDocument();
    expect(screen.getByText(/String \(3 Words: 24 bytes\)/i)).toBeInTheDocument();
    expect(screen.getByText(/&str Fat Pointer \(2 Words: 16 bytes\)/i)).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-wizard')).toBeInTheDocument();
  });

  it('switches to Slice tab and shows pointer offset calculation', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    const sliceTab = screen.getByRole('tab', { name: /Slice \(&s\[1\.\.4\]\)/i });
    await user.click(sliceTab);

    expect(screen.getByText(/\+1 offset/i)).toBeInTheDocument();
    expect(screen.getByText(/len: 3/i)).toBeInTheDocument();
  });

  it('simulates vector growth and capacity doubling on push', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    const vecTab = screen.getByRole('tab', { name: /Vec Reallocation/i });
    await user.click(vecTab);

    expect(screen.getByText('4')).toBeInTheDocument(); // initial cap
    const pushBtn = screen.getByRole('button', { name: /Push Item/i });

    await user.click(pushBtn); // 3
    await user.click(pushBtn); // 4
    await user.click(pushBtn); // 5 -> reallocates to cap 8
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByTestId('ferris-mascot-speed')).toBeInTheDocument();
  });

  it('renders struct memory padding and alignment', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    const paddingTab = screen.getByRole('tab', { name: /Struct Padding/i });
    await user.click(paddingTab);

    expect(screen.getAllByText(/7-byte padding/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/6-byte padding/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Total Size: 24 bytes/i)).toBeInTheDocument();
  });

  it('renders Zero-Sized Types with 0 bytes size', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    const zstTab = screen.getByRole('tab', { name: /Zero-Sized Type \(ZST\)/i });
    await user.click(zstTab);

    expect(screen.getAllByText(/0 bytes/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Alignment of/i)).toBeInTheDocument();
  });

  it('toggles out-of-bounds error simulation', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    const toggleBtn = screen.getByRole('button', { name: /Toggle Error Simulation/i });
    await user.click(toggleBtn);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(/index out of bounds/i);
    expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();
  });

  it('navigates via Prev/Next step scrubber', async () => {
    render(
      <I18nProvider defaultLanguage="en">
        <MemoryLayoutVisualizer initialStep={0} />
      </I18nProvider>
    );

    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    await user.click(nextBtn);

    expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 2 of 5/i);
    expect(screen.getByRole('tab', { name: /Slice/i })).toHaveAttribute('aria-selected', 'true');
  });

  it('renders in Chinese when language is zh', () => {
    localStorage.setItem('learn_rust_lang', 'zh');
    render(
      <I18nProvider defaultLanguage="zh">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/内存布局与切片机制/i)).toBeInTheDocument();
  });

  it('renders in Japanese when language is ja', () => {
    localStorage.setItem('learn_rust_lang', 'ja');
    render(
      <I18nProvider defaultLanguage="ja">
        <MemoryLayoutVisualizer />
      </I18nProvider>
    );

    expect(screen.getByText(/メモリレイアウトとスライス/i)).toBeInTheDocument();
  });
});
