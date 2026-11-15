import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  CrabCursor,
  resolveCursorState,
  getCursorHotspot,
} from '@/components/cursor/CrabCursor';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/lib/theme';

function mockMatchMedia(matchesMap: Record<string, boolean>) {
  return vi.fn().mockImplementation((query: string) => ({
    matches: Boolean(matchesMap[query]),
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

describe('CrabCursor Component & Cursor Resolution', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.crabCursor;
    localStorage.clear();
  });

  afterEach(() => {
    delete document.documentElement.dataset.crabCursor;
  });

  describe('resolveCursorState & getCursorHotspot helpers', () => {
    it('returns default claw state for null or plain text nodes', () => {
      expect(resolveCursorState(null)).toEqual({ mode: 'claw', variant: 'default' });

      const div = document.createElement('div');
      const text = document.createTextNode('Rust');
      div.appendChild(text);
      expect(resolveCursorState(text)).toEqual({ mode: 'claw', variant: 'default' });
    });

    it('resolves language and theme variants including nested SVG descendants', () => {
      const btn = document.createElement('button');
      btn.setAttribute('data-cursor', 'theme');
      btn.setAttribute('data-cursor-variant', 'dark');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.appendChild(path);
      btn.appendChild(svg);

      expect(resolveCursorState(path)).toEqual({ mode: 'theme', variant: 'dark' });

      const langBtn = document.createElement('button');
      langBtn.setAttribute('data-cursor', 'language');
      langBtn.setAttribute('data-cursor-variant', 'ja');
      expect(resolveCursorState(langBtn)).toEqual({ mode: 'language', variant: 'ja' });

      const unknownLang = document.createElement('div');
      unknownLang.setAttribute('data-cursor', 'language');
      unknownLang.setAttribute('data-cursor-variant', 'unknown');
      expect(resolveCursorState(unknownLang)).toEqual({ mode: 'language', variant: 'cycle' });
    });

    it('resolves text mode for editable inputs and pointer mode for clickable controls', () => {
      const textInput = document.createElement('input');
      textInput.type = 'text';
      expect(resolveCursorState(textInput)).toEqual({ mode: 'text', variant: 'default' });

      const disabledInput = document.createElement('input');
      disabledInput.type = 'text';
      disabledInput.disabled = true;
      expect(resolveCursorState(disabledInput)).toEqual({ mode: 'claw', variant: 'default' });

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      expect(resolveCursorState(checkbox)).toEqual({ mode: 'pointer', variant: 'default' });

      const button = document.createElement('button');
      expect(resolveCursorState(button)).toEqual({ mode: 'pointer', variant: 'default' });

      const disabledButton = document.createElement('button');
      disabledButton.disabled = true;
      expect(resolveCursorState(disabledButton)).toEqual({ mode: 'claw', variant: 'default' });
    });

    it('returns accurate hotspot offsets for claw, pointer, special morphs, and text I-beam mode', () => {
      expect(getCursorHotspot('claw')).toEqual({ x: 4, y: 4 });
      expect(getCursorHotspot('pointer')).toEqual({ x: 17, y: 5 });
      expect(getCursorHotspot('language')).toEqual({ x: 4, y: 4 });
      expect(getCursorHotspot('theme')).toEqual({ x: 4, y: 4 });
      expect(getCursorHotspot('text')).toEqual({ x: 22, y: 22 });
    });
  });

  describe('Integrated CrabCursor behavior inside AppLayout', () => {
    const renderWithLayout = () =>
      render(
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route
                index
                element={
                  <div data-testid="plain-surface">
                    <p data-testid="plain-text">Hello Ferris</p>
                    <button type="button" data-testid="sample-btn">
                      Click Me
                    </button>
                    <input type="text" aria-label="Code input" data-testid="sample-input" />
                  </div>
                }
              />
            </Route>
          </Routes>
        </MemoryRouter>
      );

    it('remains hidden prior to mouse movement and has zero text content / aria-hidden', () => {
      renderWithLayout();

      const cursor = screen.getByTestId('crab-cursor');
      expect(cursor).toHaveAttribute('aria-hidden', 'true');
      expect(cursor).toHaveAttribute('data-visible', 'false');
      expect(cursor.textContent).toBe('');
      expect(document.documentElement.dataset.crabCursor).toBeUndefined();
    });

    it('shows crab claw on default surface, morphs to crab-hand pointer on buttons, and snaps/sparks on click', () => {
      renderWithLayout();

      const cursor = screen.getByTestId('crab-cursor');
      const plainText = screen.getByTestId('plain-text');
      const sampleBtn = screen.getByTestId('sample-btn');

      // Move over plain surface -> default crab claw
      fireEvent.mouseMove(plainText, { clientX: 120, clientY: 160 });
      expect(cursor).toHaveAttribute('data-visible', 'true');
      expect(cursor).toHaveAttribute('data-cursor-mode', 'claw');
      expect(document.documentElement.dataset.crabCursor).toBe('active');
      expect(cursor.style.transform).toBe('translate3d(116px, 156px, 0)');
      expect(screen.getByTestId('cursor-shape-claw')).toBeInTheDocument();
      expect(screen.getByTestId('crab-claw-lower-jaw').style.transform).toBe('rotate(0deg)');

      // Press mouse down on plain surface -> crab claw pinches shut + sparks
      fireEvent.mouseDown(plainText, { clientX: 120, clientY: 160 });
      expect(cursor).toHaveAttribute('data-cursor-pressed', 'true');
      expect(screen.getByTestId('crab-claw-lower-jaw').style.transform).toBe('rotate(13deg)');
      expect(screen.getByTestId('crab-claw-snap-sparks')).toBeInTheDocument();
      fireEvent.mouseUp(plainText);
      expect(cursor).toHaveAttribute('data-cursor-pressed', 'false');
      expect(screen.queryByTestId('crab-claw-snap-sparks')).not.toBeInTheDocument();

      // Move over clickable button -> upright vertical crab claw with (17, 5) hotspot
      fireEvent.mouseMove(sampleBtn, { clientX: 200, clientY: 220 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'pointer');
      expect(cursor.style.transform).toBe('translate3d(183px, 215px, 0)');
      expect(screen.getByTestId('cursor-shape-pointer')).toBeInTheDocument();
      expect(screen.getByTestId('crab-pointer-right-jaw').style.transform).toBe('rotate(0deg)');
      expect(screen.getByTestId('crab-pointer-hover-arc')).toBeInTheDocument();

      // Press mouse down on button -> upright right pincer clamps shut + click burst sparks
      fireEvent.mouseDown(sampleBtn, { clientX: 200, clientY: 220 });
      expect(cursor).toHaveAttribute('data-cursor-pressed', 'true');
      expect(screen.getByTestId('crab-pointer-right-jaw').style.transform).toBe('rotate(-34deg)');
      expect(screen.queryByTestId('crab-pointer-hover-arc')).not.toBeInTheDocument();
      expect(screen.getByTestId('crab-pointer-snap-sparks')).toBeInTheDocument();

      // Release mouse up -> returns to open upright crab claw + hover arc
      fireEvent.mouseUp(sampleBtn);
      expect(cursor).toHaveAttribute('data-cursor-pressed', 'false');
      expect(screen.getByTestId('crab-pointer-right-jaw').style.transform).toBe('rotate(0deg)');
      expect(screen.queryByTestId('crab-pointer-snap-sparks')).not.toBeInTheDocument();
      expect(screen.getByTestId('crab-pointer-hover-arc')).toBeInTheDocument();
    });

    it('morphs into crab-pincer I-beam with centered hotspot over text inputs', () => {
      renderWithLayout();

      const cursor = screen.getByTestId('crab-cursor');
      const input = screen.getByTestId('sample-input');

      fireEvent.mouseMove(input, { clientX: 100, clientY: 100 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'text');
      expect(screen.getByTestId('cursor-shape-text')).toBeInTheDocument();
      expect(cursor.style.transform).toBe('translate3d(78px, 78px, 0)');
    });

    it('morphs into language pointer variants when hovering Header and Sidebar language switchers', () => {
      renderWithLayout();
      const cursor = screen.getByTestId('crab-cursor');

      // Header Globe button
      fireEvent.mouseMove(screen.getByTestId('language-cycle-button'), { clientX: 300, clientY: 24 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'language');
      expect(cursor).toHaveAttribute('data-cursor-variant', 'cycle');
      expect(screen.getByTestId('cursor-shape-language-cycle')).toBeInTheDocument();

      // Header ZH / EN / JA buttons
      fireEvent.mouseMove(screen.getByTestId('lang-option-zh'), { clientX: 330, clientY: 24 });
      expect(cursor).toHaveAttribute('data-cursor-variant', 'zh');
      expect(screen.getByTestId('cursor-shape-language-zh')).toBeInTheDocument();

      fireEvent.mouseMove(screen.getByTestId('lang-option-en'), { clientX: 360, clientY: 24 });
      expect(cursor).toHaveAttribute('data-cursor-variant', 'en');
      expect(screen.getByTestId('cursor-shape-language-en')).toBeInTheDocument();

      fireEvent.mouseMove(screen.getByTestId('lang-option-ja'), { clientX: 390, clientY: 24 });
      expect(cursor).toHaveAttribute('data-cursor-variant', 'ja');
      expect(screen.getByTestId('cursor-shape-language-ja')).toBeInTheDocument();

      // Sidebar language option
      fireEvent.mouseMove(screen.getByTestId('sidebar-lang-ja'), { clientX: 140, clientY: 120 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'language');
      expect(cursor).toHaveAttribute('data-cursor-variant', 'ja');

      // Move back to normal text -> reverts to crab claw
      fireEvent.mouseMove(screen.getByTestId('plain-text'), { clientX: 120, clientY: 300 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'claw');
      expect(screen.getByTestId('cursor-shape-claw')).toBeInTheDocument();
    });

    it('morphs into Sun, Moon, and Eclipse theme forms when hovering Theme switchers', () => {
      renderWithLayout();
      const cursor = screen.getByTestId('crab-cursor');

      fireEvent.mouseMove(screen.getByTestId('theme-option-light'), { clientX: 500, clientY: 24 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'theme');
      expect(cursor).toHaveAttribute('data-cursor-variant', 'light');
      expect(screen.getByTestId('cursor-shape-theme-light')).toBeInTheDocument();

      fireEvent.mouseMove(screen.getByTestId('theme-option-dark'), { clientX: 540, clientY: 24 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'theme');
      expect(cursor).toHaveAttribute('data-cursor-variant', 'dark');
      expect(screen.getByTestId('cursor-shape-theme-dark')).toBeInTheDocument();

      fireEvent.mouseMove(screen.getByTestId('theme-option-system'), { clientX: 580, clientY: 24 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'theme');
      expect(cursor).toHaveAttribute('data-cursor-variant', 'system');
      expect(screen.getByTestId('cursor-shape-theme-system')).toBeInTheDocument();

      // Sidebar theme switcher also morphs cursor
      fireEvent.mouseMove(screen.getByTestId('sidebar-theme-dark'), { clientX: 140, clientY: 180 });
      expect(cursor).toHaveAttribute('data-cursor-mode', 'theme');
      expect(cursor).toHaveAttribute('data-cursor-variant', 'dark');
      expect(screen.getByTestId('cursor-shape-theme-dark')).toBeInTheDocument();
    });

    it('hides cleanly on mouseleave, window blur, and touch interaction', () => {
      renderWithLayout();
      const cursor = screen.getByTestId('crab-cursor');
      const plainText = screen.getByTestId('plain-text');

      fireEvent.mouseMove(plainText, { clientX: 100, clientY: 100 });
      expect(cursor).toHaveAttribute('data-visible', 'true');

      // Leave viewport
      fireEvent.mouseLeave(document.documentElement);
      expect(cursor).toHaveAttribute('data-visible', 'false');
      expect(document.documentElement.dataset.crabCursor).toBeUndefined();

      // Re-enter via mouse then blur window
      fireEvent.mouseMove(plainText, { clientX: 100, clientY: 100 });
      expect(cursor).toHaveAttribute('data-visible', 'true');
      fireEvent.blur(window);
      expect(cursor).toHaveAttribute('data-visible', 'false');

      // Re-enter via mouse then touch screen -> hides and suppresses immediate compatibility mousemove
      fireEvent.mouseMove(plainText, { clientX: 100, clientY: 100 });
      expect(cursor).toHaveAttribute('data-visible', 'true');

      fireEvent.touchStart(plainText);
      expect(cursor).toHaveAttribute('data-visible', 'false');

      fireEvent.mouseMove(plainText, { clientX: 105, clientY: 105 });
      expect(cursor).toHaveAttribute('data-visible', 'false');
    });
  });

  describe('Device & accessibility safeguards', () => {
    it('stays inactive on coarse-only touch devices', () => {
      window.matchMedia = mockMatchMedia({
        '(pointer: coarse)': true,
        '(any-pointer: fine)': false,
      });

      render(
        <ThemeProvider>
          <CrabCursor />
        </ThemeProvider>
      );

      fireEvent.mouseMove(document.body, { clientX: 50, clientY: 50 });
      expect(screen.getByTestId('crab-cursor')).toHaveAttribute('data-visible', 'false');
      expect(document.documentElement.dataset.crabCursor).toBeUndefined();
    });

    it('respects prefers-reduced-motion: reduce', () => {
      window.matchMedia = mockMatchMedia({
        '(prefers-reduced-motion: reduce)': true,
      });

      render(
        <ThemeProvider>
          <div data-cursor="theme" data-cursor-variant="light" data-testid="light-target" />
          <CrabCursor />
        </ThemeProvider>
      );

      const cursor = screen.getByTestId('crab-cursor');
      expect(cursor).toHaveAttribute('data-reduced-motion', 'true');

      fireEvent.mouseMove(screen.getByTestId('light-target'), { clientX: 40, clientY: 40 });
      expect(screen.getByTestId('cursor-shape-theme-light')).toBeInTheDocument();
    });

    it('cleans up data-crab-cursor attribute on unmount', () => {
      const { unmount } = render(
        <ThemeProvider>
          <CrabCursor />
        </ThemeProvider>
      );

      fireEvent.mouseMove(document.body, { clientX: 80, clientY: 80 });
      expect(document.documentElement.dataset.crabCursor).toBe('active');

      unmount();
      expect(document.documentElement.dataset.crabCursor).toBeUndefined();
    });
  });
});
