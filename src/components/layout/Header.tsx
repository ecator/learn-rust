import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { FerrisIcon } from '@/components/FerrisIcon';
import { cn } from '@/lib/utils';
import { GithubIcon } from '@/components/GithubIcon';
import { useTheme } from '@/lib/theme';
import { useI18n, SupportedLanguage } from '@/lib/i18n';
import {
  Menu,
  X,
  Sun,
  Moon,
  Globe,
  BookOpen,
  Layers,
  Award,
  Home,
} from 'lucide-react';

interface HeaderProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSidebarOpen = false,
  onToggleSidebar,
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  // Local state to support both inside ThemeProvider/I18nProvider and standalone renders
  const [localTheme, setLocalTheme] = React.useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return resolvedTheme;
  });

  const [currentLang, setCurrentLang] = React.useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('learn_rust_lang');
      if (stored === 'zh' || stored === 'en' || stored === 'ja') return stored as SupportedLanguage;
      if (
        document.documentElement.lang === 'zh' ||
        document.documentElement.lang === 'en' ||
        document.documentElement.lang === 'ja'
      ) {
        return document.documentElement.lang as SupportedLanguage;
      }
    }
    return language;
  });

  React.useEffect(() => {
    setLocalTheme(resolvedTheme);
  }, [resolvedTheme]);

  React.useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const isDark = localTheme === 'dark';

  const toggleTheme = () => {
    const nextDark = !isDark;
    const nextTheme: 'light' | 'dark' = nextDark ? 'dark' : 'light';
    setLocalTheme(nextTheme);
    setTheme(nextTheme);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('learn_rust_theme', 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('learn_rust_theme', 'light');
      } catch {}
    }
  };

  const selectLanguage = (nextLang: SupportedLanguage) => {
    setCurrentLang(nextLang);
    setLanguage(nextLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLang;
    }
    try {
      localStorage.setItem('learn_rust_lang', nextLang);
    } catch {}
  };

  const cycleLanguage = () => {
    const langOrder: SupportedLanguage[] = ['zh', 'en', 'ja'];
    const nextIndex = (langOrder.indexOf(currentLang) + 1) % langOrder.length;
    selectLanguage(langOrder[nextIndex]);
  };

  const languageOptions: Array<{
    code: SupportedLanguage;
    label: string;
    title: string;
  }> = [
    { code: 'zh', label: '中文', title: '简体中文' },
    { code: 'en', label: 'EN', title: 'English' },
    { code: 'ja', label: '日本語', title: '日本語' },
  ];

  const navItems = [
    { key: 'home', name: 'Home', path: '/', icon: Home, end: true },
    { key: 'curriculum', name: 'Curriculum', path: '/curriculum', icon: BookOpen },
    { key: 'visualizers', name: 'Visualizers', path: '/visualizers', icon: Layers },
    { key: 'progress', name: 'Progress', path: '/progress', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              aria-label={isSidebarOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
              title={isSidebarOpen ? t('nav.closeNav') : t('nav.openNav')}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-[#CE412B]"
            >
              {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}

          <Link
            to="/"
            className="flex items-center gap-2.5 transition-transform hover:scale-105"
            aria-label="Learn Rust Home"
          >
            <FerrisIcon size={36} className="shrink-0 drop-shadow-sm" />
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-slate-900 dark:text-white text-lg leading-tight flex items-center gap-1.5">
                {t('common.appName')}
                <span className="rounded-full bg-[#CE412B]/10 px-2 py-0.5 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
                  {t('common.version')}
                </span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {t('common.tagline')}
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const label = t(`nav.${item.key}`) || item.name;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                aria-label={label}
                title={label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-100 text-[#CE412B] dark:bg-slate-800 dark:text-[#CE412B]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Actions (Language, Theme, GitHub) */}
        <div className="flex items-center gap-2">
          {/* Segmented Pill Language Switcher */}
          <div
            role="group"
            aria-label={t('nav.languageLabel')}
            data-testid="language-switcher"
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100/90 p-0.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/90"
          >
            <button
              type="button"
              onClick={cycleLanguage}
              aria-label="Change language (ZH / EN / JA)"
              data-testid="language-cycle-button"
              title={t('nav.languageToggle')}
              className="inline-flex items-center justify-center rounded-full p-1.5 text-[#CE412B] hover:bg-white dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#CE412B]"
            >
              <Globe className="h-4 w-4" />
            </button>
            {languageOptions.map((option) => {
              const active = currentLang === option.code;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => selectLanguage(option.code)}
                  aria-pressed={active}
                  data-testid={`lang-option-${option.code}`}
                  title={option.title}
                  className={cn(
                    'rounded-full px-1.5 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all focus:outline-none focus:ring-2 focus:ring-[#CE412B]',
                    active
                      ? 'bg-[#CE412B] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/70'
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Theme Toggle Slot */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? t('nav.themeToggleLight') : t('nav.themeToggleDark')}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#CE412B]"
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>

          {/* GitHub Repo Link */}
          <a
            href="https://github.com/ecator/learn-rust"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#CE412B]"
          >
            <GithubIcon size={20} />
          </a>
        </div>
      </div>
    </header>
  );
};
