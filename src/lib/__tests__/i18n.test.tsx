import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  I18nProvider,
  useI18n,
  detectBrowserLanguage,
  formatTranslation,
  LANG_STORAGE_KEY,
  zh,
  en,
  ja,
} from '../i18n';

const I18nConsumer: React.FC = () => {
  const { language, setLanguage, t } = useI18n();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="home-nav">{t('nav.home')}</span>
      <span data-testid="app-name">{t('common.appName')}</span>
      <span data-testid="xp-text">{t('progress.xp')}</span>
      <span data-testid="interpolated">{t('custom.greeting', { name: 'Rustacean', score: 100 })}</span>
      <button onClick={() => setLanguage('en')}>Set EN</button>
      <button onClick={() => setLanguage('ja')}>Set JA</button>
      <button onClick={() => setLanguage('zh')}>Set ZH</button>
    </div>
  );
};

describe('Tri-lingual i18n Engine (src/lib/i18n/)', () => {
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

  describe('Language Auto-Detection', () => {
    it('detects Chinese from browser language', () => {
      Object.defineProperty(navigator, 'language', { value: 'zh-CN', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['zh-CN', 'zh'], configurable: true });
      expect(detectBrowserLanguage()).toBe('zh');
    });

    it('detects English from browser language', () => {
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['en-US', 'en'], configurable: true });
      expect(detectBrowserLanguage()).toBe('en');
    });

    it('detects Japanese from browser language', () => {
      Object.defineProperty(navigator, 'language', { value: 'ja-JP', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['ja-JP', 'ja'], configurable: true });
      expect(detectBrowserLanguage()).toBe('ja');
    });

    it('falls back to Chinese (zh) when browser language is unknown or unsupported', () => {
      Object.defineProperty(navigator, 'language', { value: 'fr-FR', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['fr-FR', 'es-ES'], configurable: true });
      expect(detectBrowserLanguage()).toBe('zh');
    });

    it('prioritizes localStorage over navigator preferences', () => {
      localStorage.setItem(LANG_STORAGE_KEY, 'ja');
      Object.defineProperty(navigator, 'language', { value: 'en-US', configurable: true });
      Object.defineProperty(navigator, 'languages', { value: ['en-US'], configurable: true });
      expect(detectBrowserLanguage()).toBe('ja');
    });
  });

  describe('Provider & Context State', () => {
    it('synchronizes html lang attribute on mount and on language change', async () => {
      const user = userEvent.setup();
      render(
        <I18nProvider defaultLanguage="zh">
          <I18nConsumer />
        </I18nProvider>
      );

      expect(screen.getByTestId('current-lang')).toHaveTextContent('zh');
      expect(screen.getByTestId('home-nav')).toHaveTextContent('首页');
      expect(document.documentElement.lang).toBe('zh');

      const enBtn = screen.getByRole('button', { name: 'Set EN' });
      await user.click(enBtn);

      expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
      expect(screen.getByTestId('home-nav')).toHaveTextContent('Home');
      expect(document.documentElement.lang).toBe('en');
      expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('en');

      const jaBtn = screen.getByRole('button', { name: 'Set JA' });
      await user.click(jaBtn);

      expect(screen.getByTestId('current-lang')).toHaveTextContent('ja');
      expect(screen.getByTestId('home-nav')).toHaveTextContent('ホーム');
      expect(document.documentElement.lang).toBe('ja');
      expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ja');
    });

    it('interpolates template parameters properly with formatTranslation', () => {
      const result = formatTranslation('en', 'greeting.hello', { name: 'Alice' });
      expect(result).toBe('greeting.hello');

      // Test interpolation logic directly with custom template string
      zh.testInterpolate = '你好，{name}！你获得了 {points} 积分。';
      const formattedZh = formatTranslation('zh', 'testInterpolate', { name: 'Ferris', points: 50 });
      expect(formattedZh).toBe('你好，Ferris！你获得了 50 积分。');
      delete zh.testInterpolate;
    });

    it('gracefully falls back when useI18n() is called outside I18nProvider', async () => {
      const user = userEvent.setup();
      document.documentElement.lang = 'en';

      render(<I18nConsumer />);

      expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
      expect(screen.getByTestId('home-nav')).toHaveTextContent('Home');

      const jaBtn = screen.getByRole('button', { name: 'Set JA' });
      await user.click(jaBtn);

      expect(localStorage.getItem(LANG_STORAGE_KEY)).toBe('ja');
      expect(document.documentElement.lang).toBe('ja');
    });
  });

  describe('Dictionary Structural Integrity', () => {
    it('verifies that zh, en, and ja dictionaries share identical top-level and section keys', () => {
      const zhKeys = Object.keys(zh).sort();
      const enKeys = Object.keys(en).sort();
      const jaKeys = Object.keys(ja).sort();

      expect(enKeys).toEqual(zhKeys);
      expect(jaKeys).toEqual(zhKeys);

      const sections = ['nav', 'common', 'mascot', 'visualizers', 'progress', 'errors'] as const;
      for (const section of sections) {
        const zhSectionKeys = Object.keys(zh[section]).sort();
        const enSectionKeys = Object.keys(en[section]).sort();
        const jaSectionKeys = Object.keys(ja[section]).sort();

        expect(enSectionKeys).toEqual(zhSectionKeys);
        expect(jaSectionKeys).toEqual(zhSectionKeys);
      }
    });

    it('verifies all 7 mascot mood names exist in each dictionary', () => {
      const moods = ['happy', 'confused', 'safety', 'panic', 'detective', 'speed', 'wizard'] as const;
      for (const mood of moods) {
        expect(zh.mascot[mood]).toBeTruthy();
        expect(en.mascot[mood]).toBeTruthy();
        expect(ja.mascot[mood]).toBeTruthy();
      }
    });
  });
});
