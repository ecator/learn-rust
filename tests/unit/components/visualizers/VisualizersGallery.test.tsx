import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { VisualizersGallery } from '@/routes/VisualizersGallery';
import { I18nProvider } from '@/lib/i18n';
import { VISUALIZER_FOCUS_EVENT } from '@/components/visualizers/types';

describe('VisualizersGallery Unit Tests', () => {
  const user = userEvent.setup();
  const originalScrollIntoViewDesc = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'scrollIntoView'
  );

  const mockScrollIntoView = () => {
    const spy = vi.fn();
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: spy,
    });
    return spy;
  };

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalScrollIntoViewDesc) {
      Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', originalScrollIntoViewDesc);
    } else {
      delete (HTMLElement.prototype as { scrollIntoView?: unknown }).scrollIntoView;
    }
  });

  const renderGallery = (
    lang: 'en' | 'zh' | 'ja' = 'en',
    initialEntries: string[] = ['/visualizers']
  ) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <I18nProvider defaultLanguage={lang}>
          <VisualizersGallery />
        </I18nProvider>
      </MemoryRouter>
    );
  };

  it('renders all 6 visualizer cards initially', () => {
    renderGallery();

    expect(screen.getByText('6 Core Rust Concept Simulators')).toBeInTheDocument();
    expect(screen.getByText('Ownership & Move Semantics')).toBeInTheDocument();
    expect(screen.getByText('Borrow Checker & Lifetimes')).toBeInTheDocument();
    expect(screen.getByText('Memory Layout (Stack vs Heap)')).toBeInTheDocument();
    expect(screen.getByText('Trait Dispatch (Static vs Dyn)')).toBeInTheDocument();
    expect(screen.getByText('Concurrency & Mutex Locking')).toBeInTheDocument();
    expect(screen.getByText('Railway Error Flow (Option/Result)')).toBeInTheDocument();
  });

  it('filters visualizers by category', async () => {
    renderGallery();

    const ownershipFilter = screen.getByRole('tab', { name: /Ownership & Memory/i });
    await user.click(ownershipFilter);

    expect(screen.getByText('Ownership & Move Semantics')).toBeInTheDocument();
    expect(screen.getByText('Memory Layout (Stack vs Heap)')).toBeInTheDocument();
    expect(screen.queryByText('Concurrency & Mutex Locking')).not.toBeInTheDocument();
    expect(screen.queryByText('Railway Error Flow (Option/Result)')).not.toBeInTheDocument();

    const concurrencyFilter = screen.getByRole('tab', { name: /Concurrency & Errors/i });
    await user.click(concurrencyFilter);

    expect(screen.getByText('Concurrency & Mutex Locking')).toBeInTheDocument();
    expect(screen.getByText('Railway Error Flow (Option/Result)')).toBeInTheDocument();
    expect(screen.queryByText('Ownership & Move Semantics')).not.toBeInTheDocument();
  });

  it('filters visualizers by search query and shows reset button', async () => {
    renderGallery();

    const searchInput = screen.getByRole('textbox', { name: /Search visualizers/i });
    await user.type(searchInput, 'vtable');

    expect(screen.getByText('Trait Dispatch (Static vs Dyn)')).toBeInTheDocument();
    expect(screen.queryByText('Ownership & Move Semantics')).not.toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset All Filters/i });
    await user.click(resetBtn);

    expect(screen.getByText('Ownership & Move Semantics')).toBeInTheDocument();
  });

  it('displays empty state when search matches nothing and allows reset', async () => {
    renderGallery();

    const searchInput = screen.getByRole('textbox', { name: /Search visualizers/i });
    await user.type(searchInput, 'nonexistent_simulator_keyword');

    expect(screen.getByText(/No visualizers match the selected filter/i)).toBeInTheDocument();

    const resetFiltersBtn = screen.getByRole('button', { name: /Reset Filters/i });
    await user.click(resetFiltersBtn);

    expect(screen.getByText('Ownership & Move Semantics')).toBeInTheDocument();
  });

  it('contains links to theory lessons', () => {
    renderGallery();

    const theoryLinks = screen.getAllByRole('link', { name: /Read Accompanying Theory/i });
    expect(theoryLinks.length).toBeGreaterThan(0);
  });

  it('renders Chinese category labels when language is zh', () => {
    localStorage.setItem('learn_rust_lang', 'zh');
    render(
      <MemoryRouter>
        <I18nProvider defaultLanguage="zh">
          <VisualizersGallery />
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('tab', { name: /全部 \(All\)/i })).toBeInTheDocument();
  });

  it('renders Japanese category labels when language is ja', () => {
    localStorage.setItem('learn_rust_lang', 'ja');
    render(
      <MemoryRouter>
        <I18nProvider defaultLanguage="ja">
          <VisualizersGallery />
        </I18nProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('tab', { name: /すべて \(All\)/i })).toBeInTheDocument();
  });

  it('highlights and scrolls to target visualizer specified by URL hash', async () => {
    const scrollIntoViewMock = mockScrollIntoView();

    const { container } = renderGallery('en', ['/visualizers#concurrency']);

    const concurrencyCard = container.querySelector('#concurrency');
    const ownershipCard = container.querySelector('#ownership');

    expect(concurrencyCard).toHaveAttribute('data-selected', 'true');
    expect(ownershipCard).toHaveAttribute('data-selected', 'false');
    expect(screen.getByText('Selected')).toBeInTheDocument();

    await waitFor(() => {
      expect(scrollIntoViewMock).toHaveBeenCalledTimes(1);
    });
    expect(scrollIntoViewMock.mock.instances[0]).toBe(concurrencyCard);
  });

  it('resets active filters and scrolls when focus event targets a hidden visualizer', async () => {
    const scrollIntoViewMock = mockScrollIntoView();

    const { container } = renderGallery('zh', ['/visualizers#railway-errors']);

    // Filter down to Types & Traits so railway-errors is hidden
    const typesTab = screen.getByRole('tab', { name: /类型与 Trait/i });
    await user.click(typesTab);
    expect(container.querySelector('#railway-errors')).toBeNull();

    // Re-trigger focus on railway-errors (simulating clicking the sidebar link again)
    window.dispatchEvent(
      new CustomEvent(VISUALIZER_FOCUS_EVENT, { detail: 'railway-errors' })
    );

    await waitFor(() => {
      const targetCard = container.querySelector('#railway-errors');
      expect(targetCard).not.toBeNull();
      expect(targetCard).toHaveAttribute('data-selected', 'true');
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });
  });

  it('ignores unknown hash fragments safely without selecting any card', () => {
    const { container } = renderGallery('en', ['/visualizers#non-existent-id']);
    const selectedCards = container.querySelectorAll('[data-selected="true"]');
    expect(selectedCards).toHaveLength(0);
    expect(screen.queryByText('Selected')).not.toBeInTheDocument();
  });
});
