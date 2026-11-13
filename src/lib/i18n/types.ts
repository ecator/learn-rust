export type SupportedLanguage = 'zh' | 'en' | 'ja';

export interface TranslationDictionary {
  nav: {
    home: string;
    curriculum: string;
    visualizers: string;
    progress: string;
    openNav: string;
    closeNav: string;
    languageToggle: string;
    themeToggleLight: string;
    themeToggleDark: string;
    githubRepo: string;
  };
  common: {
    appName: string;
    tagline: string;
    version: string;
    loading: string;
    back: string;
    next: string;
    previous: string;
    startLearning: string;
    exploreVisualizers: string;
    completed: string;
    markAsCompleted: string;
    reset: string;
    export: string;
    import: string;
    copy: string;
    copied: string;
  };
  mascot: {
    happy: string;
    confused: string;
    safety: string;
    panic: string;
    detective: string;
    speed: string;
    wizard: string;
  };
  visualizers: {
    title: string;
    subtitle: string;
    ownership: string;
    borrowChecker: string;
    memoryLayout: string;
    traitDispatch: string;
    concurrency: string;
    errorHandling: string;
  };
  progress: {
    title: string;
    subtitle: string;
    xp: string;
    modulesCompleted: string;
    streak: string;
    accuracy: string;
    exportTitle: string;
    resetTitle: string;
    resetConfirm: string;
  };
  errors: {
    notFound: string;
    quotaExceeded: string;
    unknown: string;
  };
  [key: string]: any;
}

export interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}
