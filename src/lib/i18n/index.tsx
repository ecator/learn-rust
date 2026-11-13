import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { SupportedLanguage, I18nContextValue, TranslationDictionary } from './types';
import { zh } from './translations/zh';
import { en } from './translations/en';
import { ja } from './translations/ja';

export * from './types';
export { zh, en, ja };

export const LANG_STORAGE_KEY = 'learn_rust_lang';

export const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  zh,
  en,
  ja,
};

/**
 * Detect language from localStorage or browser preferences.
 * Defaults to 'zh' if detection is inconclusive.
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'zh';

  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en' || stored === 'ja') {
      return stored as SupportedLanguage;
    }

    const primary = (
      (typeof navigator.language === 'string' && navigator.language) ||
      (Array.isArray(navigator.languages) && typeof navigator.languages[0] === 'string' && navigator.languages[0]) ||
      ''
    ).toLowerCase();

    if (primary.startsWith('zh')) return 'zh';
    if (primary.startsWith('en')) return 'en';
    if (primary.startsWith('ja')) return 'ja';
  } catch {}

  // Fallback to Chinese per specification ("默认根据浏览器语言设置，如果无法判断就用中文")
  return 'zh';
}

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object' || typeof path !== 'string' || !path) return undefined;
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, part)) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Universal translate function with parameter interpolation {name}
 */
export function formatTranslation(
  lang: SupportedLanguage,
  key: string,
  params?: Record<string, string | number>
): string {
  if (typeof key !== 'string') return '';
  const dict = dictionaries[lang] || dictionaries.zh;
  let text = getNestedValue(dict, key) ?? getNestedValue(dictionaries.zh, key) ?? key;

  if (params && typeof params === 'object') {
    for (const [paramKey, paramVal] of Object.entries(params)) {
      if (paramKey) {
        text = text.split(`{${paramKey}}`).join(String(paramVal ?? ''));
      }
    }
  }
  return text;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLanguage?: SupportedLanguage;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLanguage,
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return defaultLanguage || detectBrowserLanguage();
  });

  // Sync defaultLanguage when updated via prop
  useEffect(() => {
    if (defaultLanguage) {
      setLanguageState(defaultLanguage);
    }
  }, [defaultLanguage]);

  // Synchronize document.documentElement.lang
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
    }
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to persist language to localStorage', e);
    }
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return formatTranslation(language, key, params);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

/**
 * useI18n hook with graceful fallback when called outside I18nProvider
 */
export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (context) {
    return context;
  }

  // Fallback for standalone/isolated tests without provider
  let currentLang: SupportedLanguage = 'zh';
  if (
    typeof document !== 'undefined' &&
    (document.documentElement.lang === 'zh' ||
      document.documentElement.lang === 'en' ||
      document.documentElement.lang === 'ja')
  ) {
    currentLang = document.documentElement.lang as SupportedLanguage;
  } else {
    currentLang = detectBrowserLanguage();
  }

  return {
    language: currentLang,
    setLanguage: (lang: SupportedLanguage) => {
      if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
      }
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {}
    },
    t: (key: string, params?: Record<string, string | number>) => {
      return formatTranslation(currentLang, key, params);
    },
  };
}
