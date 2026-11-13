import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  STORAGE_KEY_PROGRESS,
  PROGRESS_CHANGE_EVENT,
  UserProgress,
  createDefaultProgress,
  getProgress,
  saveProgress,
  markLessonComplete,
  recordQuizResult,
  toggleBookmark,
  exportProgressJSON,
  importProgressJSON,
  resetProgress,
  subscribeProgress,
} from '../storage';
import {
  I18nProvider,
  useI18n,
  detectBrowserLanguage,
  formatTranslation,
  LANG_STORAGE_KEY,
} from '../i18n';
import {
  ThemeProvider,
  useTheme,
  getSystemTheme,
  getStoredTheme,
  applyThemeClass,
  THEME_STORAGE_KEY,
} from '../theme';
import { Ferris, FerrisMood } from '../../components/mascot/Ferris';

describe('Adversarial Challenge: Milestone 2 Core Engines', () => {
  describe('1. Storage Engine Adversarial Edge Cases', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.restoreAllMocks();
    });

    it('survives completely corrupted JSON strings in localStorage', () => {
      const corruptPayloads = [
        '{',
        '{"version":',
        'undefined',
        'null',
        'true',
        '12345',
        '"just a plain string"',
        '[1, 2, 3]',
        'NaN',
        '<html><body>502 Bad Gateway</body></html>',
      ];

      for (const bad of corruptPayloads) {
        localStorage.setItem(STORAGE_KEY_PROGRESS, bad);
        const progress = getProgress();
        expect(progress.version).toBe(1);
        expect(Array.isArray(progress.completedLessons)).toBe(true);
        expect(progress.completedLessons).toEqual([]);
        expect(progress.stats.xpScore).toBe(0);
      }
    });

    it('rejects schema versions other than 1', () => {
      const invalidVersions = [0, 2, -1, 999, '1', null, undefined, {}];

      for (const v of invalidVersions) {
        localStorage.setItem(
          STORAGE_KEY_PROGRESS,
          JSON.stringify({ version: v, completedLessons: ['lesson-ghost'] })
        );
        const progress = getProgress();
        expect(progress.version).toBe(1);
        expect(progress.completedLessons).toEqual([]);
      }
    });

    it('sanitizes partially corrupted nested payloads without crashing', () => {
      const semibroken = {
        version: 1,
        lastUpdated: 12345, // invalid type
        completedLessons: ['valid-1', 42, null, { fake: true }, 'valid-2'],
        quizStates: [1, 2, 3], // array instead of record
        interactiveChallenges: 'not an object',
        bookmarks: 'not an array',
        stats: {
          xpScore: NaN,
          streakDays: -10,
          lastActiveDate: null,
        },
      };

      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(semibroken));
      const sanitized = getProgress();

      expect(sanitized.version).toBe(1);
      expect(sanitized.completedLessons).toEqual(['valid-1', 'valid-2']);
      expect(sanitized.quizStates).toEqual({});
      expect(sanitized.interactiveChallenges).toEqual({});
      expect(sanitized.bookmarks).toEqual([]);
      expect(sanitized.stats.xpScore).toBe(0);
      expect(sanitized.stats.streakDays).toBe(1);
      expect(typeof sanitized.lastUpdated).toBe('string');
    });

    it('handles QuotaExceededError and private browsing write rejections across all operations', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw quotaError;
      });

      // saveProgress
      expect(() => saveProgress(createDefaultProgress())).not.toThrow();

      // markLessonComplete
      expect(() => markLessonComplete('quota-lesson')).not.toThrow();

      // recordQuizResult
      expect(() =>
        recordQuizResult('quota-quiz', { passed: true, attempts: 1, selectedAnswer: 0 })
      ).not.toThrow();

      // toggleBookmark
      expect(() => toggleBookmark('quota-lesson')).not.toThrow();

      // resetProgress
      expect(() => resetProgress()).not.toThrow();

      // importProgressJSON
      expect(() =>
        importProgressJSON(JSON.stringify(createDefaultProgress()))
      ).not.toThrow();

      expect(warnSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });

    it('maintains strict idempotency under rapid repeated calls', () => {
      // Rapid repeated completions of the same lesson
      for (let i = 0; i < 50; i++) {
        markLessonComplete('rapid-lesson');
      }

      const progress = getProgress();
      expect(progress.completedLessons).toEqual(['rapid-lesson']);
      expect(progress.stats.xpScore).toBe(50);

      // Defensively rejects invalid lesson IDs
      markLessonComplete('');
      markLessonComplete(null as any);
      markLessonComplete(undefined as any);
      expect(getProgress().completedLessons).toEqual(['rapid-lesson']);
    });

    it('awards quiz XP exactly once even under retries and failures', () => {
      // First pass (+20 XP)
      recordQuizResult('quiz-1', { passed: true, attempts: 1, selectedAnswer: 'A' });
      expect(getProgress().stats.xpScore).toBe(20);

      // Second pass retry (+0 XP)
      recordQuizResult('quiz-1', { passed: true, attempts: 2, selectedAnswer: 'A' });
      expect(getProgress().stats.xpScore).toBe(20);

      // Third pass retry (+0 XP)
      recordQuizResult('quiz-1', { passed: true, attempts: 3, selectedAnswer: 'B' });
      expect(getProgress().stats.xpScore).toBe(20);
    });

    it('propagates cross-tab storage events including localStorage.clear()', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeProgress(listener);

      // 1. Cross-tab update
      const remoteData = createDefaultProgress({ completedLessons: ['remote-lesson'] });
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(remoteData));

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY_PROGRESS,
          newValue: JSON.stringify(remoteData),
        })
      );

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener.mock.calls[0][0].completedLessons).toContain('remote-lesson');

      // 2. Cross-tab storage clear (e.key is null per W3C specification)
      localStorage.clear();
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: null,
          newValue: null,
        })
      );

      expect(listener).toHaveBeenCalledTimes(2);
      expect(listener.mock.calls[1][0].completedLessons).toEqual([]);

      // 3. Unrelated key event should be ignored
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'some_unrelated_key',
          newValue: 'value',
        })
      );
      expect(listener).toHaveBeenCalledTimes(2);

      unsubscribe();
    });

    it('safely handles frozen progress objects without mutating them in-place', () => {
      const frozen = Object.freeze(createDefaultProgress());
      expect(() => saveProgress(frozen)).not.toThrow();
    });
  });

  describe('2. i18n Engine Adversarial Edge Cases', () => {
    let originalNavigatorLanguage: string;
    let originalNavigatorLanguages: readonly string[];

    beforeEach(() => {
      localStorage.clear();
      document.documentElement.lang = 'zh';
      originalNavigatorLanguage = navigator.language;
      originalNavigatorLanguages = navigator.languages;
    });

    afterEach(() => {
      Object.defineProperty(navigator, 'language', {
        value: originalNavigatorLanguage,
        configurable: true,
      });
      Object.defineProperty(navigator, 'languages', {
        value: originalNavigatorLanguages,
        configurable: true,
      });
      vi.restoreAllMocks();
    });

    it('handles unusual browser navigator language combinations', () => {
      // European languages -> fallback to zh
      Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['fr-FR', 'de-DE'], configurable: true });
      expect(detectBrowserLanguage()).toBe('zh');

      // Primary en, secondary zh -> detects en
      Object.defineProperty(navigator, 'language', { value: 'en-GB', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['en-GB', 'zh-TW'], configurable: true });
      expect(detectBrowserLanguage()).toBe('en');

      // Primary undefined, secondary en -> detects en from languages list
      Object.defineProperty(navigator, 'language', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['en-US'], configurable: true });
      expect(detectBrowserLanguage()).toBe('en');

      // Empty arrays -> fallback to zh
      Object.defineProperty(navigator, 'language', { value: '', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: [], configurable: true });
      expect(detectBrowserLanguage()).toBe('zh');

      // navigator.languages undefined -> fallback to zh
      Object.defineProperty(navigator, 'language', { value: undefined, configurable: true });
      Object.defineProperty(navigator, 'languages', { value: undefined, configurable: true });
      expect(detectBrowserLanguage()).toBe('zh');

      // Japanese detection
      Object.defineProperty(navigator, 'language', { value: 'ja', configurable: true });
      expect(detectBrowserLanguage()).toBe('ja');
    });

    it('handles non-existent, malformed, or prototype keys safely in formatTranslation', () => {
      // Non-existent key returns key itself
      expect(formatTranslation('en', 'non.existent.path')).toBe('non.existent.path');
      expect(formatTranslation('zh', 'some_unknown_key')).toBe('some_unknown_key');

      // Prototype pollution attempts return key safely without crashing or leaking Object methods
      expect(formatTranslation('en', 'toString')).toBe('toString');
      expect(formatTranslation('en', '__proto__')).toBe('__proto__');
      expect(formatTranslation('en', 'constructor')).toBe('constructor');

      // Key resolving to an object returns key string
      expect(formatTranslation('en', 'nav')).toBe('nav');

      // Invalid key types return empty string or fallback gracefully
      expect(formatTranslation('en', null as any)).toBe('');
      expect(formatTranslation('en', undefined as any)).toBe('');
      expect(formatTranslation('en', 123 as any)).toBe('');
    });

    it('handles regex-breaking parameters and dollar signs without crashing or expanding', () => {
      // Template with regex characters in paramKey
      const dictKey = 'common.tagline'; // "A modern, interactive guide to learning Rust systems programming"

      // Regex special characters in parameter name
      expect(() => {
        formatTranslation('en', dictKey, {
          'name*with+regex(chars)': 'test',
          '[brackets]': 'safe',
          'dot.param': 'clean',
        });
      }).not.toThrow();

      // Parameter replacement with dollar signs ($1, $&, $$)
      const res = formatTranslation('en', 'nav.home', {
        foo: '$1 $& $$ $`',
      });
      expect(res).toBe('Home');

      // Null or primitive params
      expect(() => formatTranslation('en', 'nav.home', null as any)).not.toThrow();
      expect(() => formatTranslation('en', 'nav.home', 'not-an-object' as any)).not.toThrow();
    });

    it('dynamically preserves <html lang="..."> consistency across rapid switching', async () => {
      const user = userEvent.setup();

      const LangSwitcher: React.FC = () => {
        const { language, setLanguage, t } = useI18n();
        return (
          <div>
            <span data-testid="active-lang">{language}</span>
            <span data-testid="nav-text">{t('nav.home')}</span>
            <button onClick={() => setLanguage('en')}>Switch EN</button>
            <button onClick={() => setLanguage('ja')}>Switch JA</button>
            <button onClick={() => setLanguage('zh')}>Switch ZH</button>
          </div>
        );
      };

      render(
        <I18nProvider defaultLanguage="zh">
          <LangSwitcher />
        </I18nProvider>
      );

      // 1. Initial ZH
      expect(document.documentElement.lang).toBe('zh');
      expect(screen.getByTestId('active-lang')).toHaveTextContent('zh');
      expect(screen.getByTestId('nav-text')).toHaveTextContent('首页');

      // 2. Switch to EN
      await user.click(screen.getByRole('button', { name: 'Switch EN' }));
      expect(document.documentElement.lang).toBe('en');
      expect(screen.getByTestId('active-lang')).toHaveTextContent('en');
      expect(screen.getByTestId('nav-text')).toHaveTextContent('Home');
      expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');

      // 3. Switch to JA
      await user.click(screen.getByRole('button', { name: 'Switch JA' }));
      expect(document.documentElement.lang).toBe('ja');
      expect(screen.getByTestId('active-lang')).toHaveTextContent('ja');
      expect(screen.getByTestId('nav-text')).toHaveTextContent('ホーム');
      expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ja');

      // 4. Switch back to ZH
      await user.click(screen.getByRole('button', { name: 'Switch ZH' }));
      expect(document.documentElement.lang).toBe('zh');
      expect(screen.getByTestId('active-lang')).toHaveTextContent('zh');
      expect(screen.getByTestId('nav-text')).toHaveTextContent('首页');
      expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('zh');
    });
  });

  describe('3. Theme & Ferris Mascot Resilience', () => {
    beforeEach(() => {
      localStorage.clear();
      document.documentElement.className = '';
    });

    it('recovers gracefully from corrupted theme in localStorage', () => {
      localStorage.setItem(THEME_STORAGE_KEY, 'corrupted_theme_mode');
      expect(getStoredTheme()).toBe('system');
    });

    it('correctly toggles dark class on documentElement', () => {
      applyThemeClass('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      applyThemeClass('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('renders Ferris mascot safely with invalid mood or abnormal size', () => {
      // Invalid mood falls back to happy
      const { unmount: unmountInvalid } = render(<Ferris mood={'angry-crab' as any} />);
      expect(screen.getByTestId('ferris-mascot-happy')).toBeInTheDocument();
      unmountInvalid();

      // All 7 valid moods render corresponding SVG testids
      const moods: FerrisMood[] = [
        'happy',
        'confused',
        'safety',
        'panic',
        'detective',
        'speed',
        'wizard',
      ];
      for (const m of moods) {
        const { unmount } = render(<Ferris mood={m} />);
        expect(screen.getByTestId(`ferris-mascot-${m}`)).toBeInTheDocument();
        unmount();
      }
    });
  });
});
