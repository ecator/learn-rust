import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {
  ThemeProvider,
  useTheme,
  getSystemTheme,
  getStoredTheme,
  applyThemeClass,
  THEME_STORAGE_KEY,
} from '@/lib/theme';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';

function createMatchMediaMock(matches: boolean) {
  let currentMatches = matches;
  const changeListeners: Array<(e: MediaQueryListEvent) => void> = [];
  const legacyListeners: Array<(e: MediaQueryListEvent) => void> = [];

  const mql = {
    matches: currentMatches,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addListener: vi.fn((fn: (e: MediaQueryListEvent) => void) => {
      legacyListeners.push(fn);
    }),
    removeListener: vi.fn((fn: (e: MediaQueryListEvent) => void) => {
      const idx = legacyListeners.indexOf(fn);
      if (idx !== -1) legacyListeners.splice(idx, 1);
    }),
    addEventListener: vi.fn((event: string, fn: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') changeListeners.push(fn);
    }),
    removeEventListener: vi.fn((event: string, fn: (e: MediaQueryListEvent) => void) => {
      if (event === 'change') {
        const idx = changeListeners.indexOf(fn);
        if (idx !== -1) changeListeners.splice(idx, 1);
      }
    }),
    dispatchEvent: vi.fn((event: Event) => {
      [...changeListeners, ...legacyListeners].forEach((l) =>
        l(event as unknown as MediaQueryListEvent)
      );
      return true;
    }),
    _setMatches(newMatches: boolean) {
      currentMatches = newMatches;
      mql.matches = newMatches;
      const event = { matches: newMatches, media: '(prefers-color-scheme: dark)' } as MediaQueryListEvent;
      [...changeListeners, ...legacyListeners].forEach((listener) => listener(event));
    },
    _getActiveListenerCount() {
      return changeListeners.length + legacyListeners.length;
    },
  };

  return vi.fn().mockReturnValue(mql);
}

const ThemeInspector: React.FC = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <div>
      <div data-testid="active-theme">{theme}</div>
      <div data-testid="resolved-theme">{resolvedTheme}</div>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="set-system" onClick={() => setTheme('system')}>System</button>
      {/* Test invalid theme injection */}
      <button data-testid="set-invalid" onClick={() => (setTheme as any)('ultra-violet')}>Invalid</button>
    </div>
  );
};

describe('Adversarial Challenge: Theming Engine Resilience', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    vi.restoreAllMocks();
  });

  describe('1. Corrupted & Edge-Case Storage Values', () => {
    const corruptedValues = [
      'ultra-violet',
      '',
      'null',
      'undefined',
      '{"bad": true}',
      'NaN',
      '0',
      'DARK',
      'LIGHT',
      'SYSTEM',
      '!@#$%^&*()',
      '   ',
    ];

    corruptedValues.forEach((val) => {
      it(`gracefully recovers when localStorage has corrupted value: "${val}"`, () => {
        localStorage.setItem(THEME_STORAGE_KEY, val);
        window.matchMedia = createMatchMediaMock(true); // system is dark

        expect(getStoredTheme()).toBe('system');

        render(
          <ThemeProvider>
            <ThemeInspector />
          </ThemeProvider>
        );

        // When corrupted, it falls back to system mode, which resolves to dark
        expect(screen.getByTestId('active-theme')).toHaveTextContent('system');
        expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
        expect(document.documentElement.classList.contains('dark')).toBe(true);
      });
    });

    it('safely handles null storage when key does not exist', () => {
      localStorage.removeItem(THEME_STORAGE_KEY);
      window.matchMedia = createMatchMediaMock(false);

      expect(getStoredTheme()).toBe('system');

      render(
        <ThemeProvider>
          <ThemeInspector />
        </ThemeProvider>
      );

      expect(screen.getByTestId('active-theme')).toHaveTextContent('system');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('sanitizes invalid values passed directly to setTheme at runtime', async () => {
      const user = userEvent.setup();
      window.matchMedia = createMatchMediaMock(false);

      render(
        <ThemeProvider>
          <ThemeInspector />
        </ThemeProvider>
      );

      const invalidBtn = screen.getByTestId('set-invalid');
      await user.click(invalidBtn);

      // setTheme sanitizes invalid values to 'system'
      expect(screen.getByTestId('active-theme')).toHaveTextContent('system');
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    });
  });

  describe('2. Rapid Oscillation & Concurrency Events', () => {
    it('handles rapid back-and-forth system theme oscillation without state desync', () => {
      const mockMm = createMatchMediaMock(false);
      window.matchMedia = mockMm;

      render(
        <ThemeProvider>
          <ThemeInspector />
        </ThemeProvider>
      );

      const mqlInstance = mockMm.mock.results[0]?.value;

      // Rapidly oscillate 50 times between dark and light
      for (let i = 0; i < 50; i++) {
        act(() => {
          mqlInstance._setMatches(i % 2 === 0);
        });
      }

      // After 50 iterations (last is i=49, which is odd -> false = light)
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Settle to dark
      act(() => {
        mqlInstance._setMatches(true);
      });
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  describe('3. Memory Leak Audit: matchMedia Listener Cleanup', () => {
    it('cleanly unsubscribes event listener when ThemeProvider unmounts (modern addEventListener)', () => {
      const mockMm = createMatchMediaMock(false);
      window.matchMedia = mockMm;

      const { unmount } = render(
        <ThemeProvider>
          <ThemeInspector />
        </ThemeProvider>
      );

      const mqlInstance = mockMm.mock.results[0]?.value;
      expect(mqlInstance.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mqlInstance._getActiveListenerCount()).toBe(1);

      // Unmount ThemeProvider
      unmount();

      expect(mqlInstance.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mqlInstance._getActiveListenerCount()).toBe(0);
    });

    it('cleanly unsubscribes event listener using legacy addListener / removeListener fallback', () => {
      const listeners: Array<(e: MediaQueryListEvent) => void> = [];
      const legacyMql = {
        matches: false,
        media: '(prefers-color-scheme: dark)',
        onchange: null,
        // No addEventListener / removeEventListener
        addEventListener: undefined,
        removeEventListener: undefined,
        addListener: vi.fn((fn) => listeners.push(fn)),
        removeListener: vi.fn((fn) => {
          const idx = listeners.indexOf(fn);
          if (idx !== -1) listeners.splice(idx, 1);
        }),
      };
      window.matchMedia = vi.fn().mockReturnValue(legacyMql);

      const { unmount } = render(
        <ThemeProvider>
          <ThemeInspector />
        </ThemeProvider>
      );

      expect(legacyMql.addListener).toHaveBeenCalledWith(expect.any(Function));
      expect(listeners.length).toBe(1);

      unmount();

      expect(legacyMql.removeListener).toHaveBeenCalledWith(expect.any(Function));
      expect(listeners.length).toBe(0);
    });
  });

  describe('4. Isolated useTheme() Outside Provider Hierarchy', () => {
    it('functions completely safely when invoked outside ThemeProvider', async () => {
      const user = userEvent.setup();
      window.matchMedia = createMatchMediaMock(false);

      render(<ThemeInspector />);

      expect(screen.getByTestId('active-theme')).toBeInTheDocument();
      expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');

      const darkBtn = screen.getByTestId('set-dark');
      await user.click(darkBtn);

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      const invalidBtn = screen.getByTestId('set-invalid');
      await user.click(invalidBtn);

      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    });
  });

  describe('5. Anti-FOUC Inline Script Resilience in index.html', () => {
    const indexHtmlContent = fs.readFileSync(
      path.resolve(__dirname, '../../index.html'),
      'utf-8'
    );

    // Extract the anti-FOUC script content
    const scriptMatch = indexHtmlContent.match(
      /<!-- Anti-FOUC Theme Detector: check localStorage or system preference -->\s*<script>([\s\S]*?)<\/script>/
    );

    it('extracts anti-FOUC inline script from index.html for sandbox evaluation', () => {
      expect(scriptMatch).not.toBeNull();
      expect(scriptMatch![1]).toContain('learn_rust_theme');
    });

    const runScriptInSandbox = (context: {
      localStorage?: { getItem: (key: string) => string | null };
      matchMedia?: (q: string) => { matches: boolean };
    }) => {
      const docElementClasses = new Set<string>();
      const sandboxDoc = {
        documentElement: {
          classList: {
            add: (c: string) => docElementClasses.add(c),
            remove: (c: string) => docElementClasses.delete(c),
            contains: (c: string) => docElementClasses.has(c),
          },
        },
      };

      const sandboxContext = {
        window: {
          matchMedia: context.matchMedia,
        },
        document: sandboxDoc,
        localStorage: context.localStorage,
        Boolean,
      };

      vm.createContext(sandboxContext);
      vm.runInContext(scriptMatch![1], sandboxContext);

      return docElementClasses;
    };

    it('resolves dark class when localStorage is "dark"', () => {
      const classes = runScriptInSandbox({
        localStorage: { getItem: () => 'dark' },
        matchMedia: () => ({ matches: false }),
      });
      expect(classes.has('dark')).toBe(true);
    });

    it('resolves light class when localStorage is "light" even if system preference is dark', () => {
      const classes = runScriptInSandbox({
        localStorage: { getItem: () => 'light' },
        matchMedia: () => ({ matches: true }),
      });
      expect(classes.has('dark')).toBe(false);
    });

    it('resolves dark class when system preference is dark and theme is "system"', () => {
      const classes = runScriptInSandbox({
        localStorage: { getItem: () => 'system' },
        matchMedia: () => ({ matches: true }),
      });
      expect(classes.has('dark')).toBe(true);
    });

    it('resolves dark class when localStorage has corrupted value ("ultra-violet") and system preference is dark', () => {
      const classes = runScriptInSandbox({
        localStorage: { getItem: () => 'ultra-violet' },
        matchMedia: () => ({ matches: true }),
      });
      expect(classes.has('dark')).toBe(true);
    });

    it('resilient when localStorage is blocked / throws SecurityError', () => {
      const classes = runScriptInSandbox({
        localStorage: {
          getItem: () => {
            throw new Error('SecurityError: Access to localStorage is denied');
          },
        },
        matchMedia: () => ({ matches: true }),
      });
      expect(classes.has('dark')).toBe(true);
    });

    it('resilient when window.matchMedia is undefined / missing', () => {
      const classes = runScriptInSandbox({
        localStorage: { getItem: () => null },
        matchMedia: undefined,
      });
      expect(classes.has('dark')).toBe(false);
    });
  });
});

describe('Adversarial Challenge: Ferris Mascot SVG Component Resilience', () => {
  describe('1. Invalid Mood Prop Graceful Fallback', () => {
    const invalidMoods = [
      'sleeping',
      'angry',
      'hungry',
      '',
      'HAPPY',
      'unknown_alien_mood',
      '123',
    ];

    invalidMoods.forEach((invalidMood) => {
      it(`safely falls back to happy mood without crashing for invalid mood: "${invalidMood}"`, () => {
        // @ts-expect-error Testing adversarial runtime inputs
        render(<Ferris mood={invalidMood} />);

        const mascot = screen.getByRole('img', { name: 'Ferris the Crab (happy)' });
        expect(mascot).toBeInTheDocument();
        expect(mascot).toHaveAttribute('data-testid', 'ferris-mascot-happy');
        expect(mascot).toHaveAttribute('role', 'img');

        // Confirms fallback rendered standard claws and happy eyes
        expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
        expect(screen.getByTestId('happy-eyes')).toBeInTheDocument();
      });
    });

    it('safely falls back when mood is undefined or null', () => {
      // @ts-expect-error Testing adversarial null
      render(<Ferris mood={null} />);
      const mascot = screen.getByRole('img', { name: 'Ferris the Crab (happy)' });
      expect(mascot).toBeInTheDocument();
    });
  });

  describe('2. Extreme & Invalid Size Values', () => {
    it('handles size={0} gracefully without error', () => {
      render(<Ferris size={0} data-testid="zero-ferris" />);
      const svg = screen.getByTestId('zero-ferris');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '0');
      expect(svg).toHaveAttribute('height', '0');
    });

    it('handles negative size={-10} by clamping safely to 0 (preventing invalid SVG dimension error)', () => {
      render(<Ferris size={-10} data-testid="negative-ferris" />);
      const svg = screen.getByTestId('negative-ferris');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '0');
      expect(svg).toHaveAttribute('height', '0');
    });

    it('handles ultra-large size={4096} without layout crash', () => {
      render(<Ferris size={4096} data-testid="huge-ferris" />);
      const svg = screen.getByTestId('huge-ferris');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('width', '4096');
      expect(svg).toHaveAttribute('height', '4096');
      expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    });

    it('handles NaN and Infinity by falling back to default 64', () => {
      render(<Ferris size={NaN} data-testid="nan-ferris" />);
      const nanSvg = screen.getByTestId('nan-ferris');
      expect(nanSvg).toHaveAttribute('width', '64');

      render(<Ferris size={Infinity} data-testid="inf-ferris" />);
      const infSvg = screen.getByTestId('inf-ferris');
      expect(infSvg).toHaveAttribute('width', '64');
    });
  });

  describe('3. Complete Accessories & Claws Verification Across All 7 Moods', () => {
    const requiredAccessoryTestIds = [
      'safety-accessories',
      'detective-accessories',
      'wizard-accessories',
      'speed-accessories',
      'panic-claws',
      'confused-claws',
      'standard-claws',
    ];

    it('verifies all 7 mood accessory & claw elements exist with correct data-testid attributes', () => {
      const moods: FerrisMood[] = [
        'happy',
        'confused',
        'safety',
        'panic',
        'detective',
        'speed',
        'wizard',
      ];

      const foundTestIds = new Set<string>();

      moods.forEach((mood) => {
        const { unmount } = render(<Ferris mood={mood} />);

        requiredAccessoryTestIds.forEach((testId) => {
          if (screen.queryByTestId(testId)) {
            foundTestIds.add(testId);
          }
        });

        unmount();
      });

      // Assert that every single one of the 7 required testids was encountered
      requiredAccessoryTestIds.forEach((id) => {
        expect(foundTestIds.has(id)).toBe(true);
      });
      expect(foundTestIds.size).toBe(requiredAccessoryTestIds.length);
    });

    it('verifies safety accessories presence', () => {
      render(<Ferris mood="safety" />);
      expect(screen.getByTestId('safety-accessories')).toBeInTheDocument();
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
    });

    it('verifies detective accessories presence', () => {
      render(<Ferris mood="detective" />);
      expect(screen.getByTestId('detective-accessories')).toBeInTheDocument();
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
    });

    it('verifies wizard accessories presence', () => {
      render(<Ferris mood="wizard" />);
      expect(screen.getByTestId('wizard-accessories')).toBeInTheDocument();
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
    });

    it('verifies speed accessories presence', () => {
      render(<Ferris mood="speed" />);
      expect(screen.getByTestId('speed-accessories')).toBeInTheDocument();
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
    });

    it('verifies panic claws presence', () => {
      render(<Ferris mood="panic" />);
      expect(screen.getByTestId('panic-claws')).toBeInTheDocument();
      expect(screen.getByTestId('panic-eyes')).toBeInTheDocument();
    });

    it('verifies confused claws presence', () => {
      render(<Ferris mood="confused" />);
      expect(screen.getByTestId('confused-claws')).toBeInTheDocument();
      expect(screen.getByTestId('confused-eyes')).toBeInTheDocument();
    });

    it('verifies standard claws presence on happy mood', () => {
      render(<Ferris mood="happy" />);
      expect(screen.getByTestId('standard-claws')).toBeInTheDocument();
      expect(screen.getByTestId('happy-eyes')).toBeInTheDocument();
    });
  });

  describe('4. SVG Accessibility Validation', () => {
    const moods: FerrisMood[] = [
      'happy',
      'confused',
      'safety',
      'panic',
      'detective',
      'speed',
      'wizard',
    ];

    moods.forEach((m) => {
      it(`enforces role="img" and matching aria-label="Ferris the Crab (${m})" for ${m}`, () => {
        const { unmount } = render(<Ferris mood={m} />);
        const svg = screen.getByRole('img', { name: `Ferris the Crab (${m})` });
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute('role', 'img');
        expect(svg).toHaveAttribute('aria-label', `Ferris the Crab (${m})`);
        expect(svg).toHaveAttribute('data-testid', `ferris-mascot-${m}`);
        unmount();
      });
    });
  });
});
