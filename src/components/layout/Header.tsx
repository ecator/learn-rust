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

  const cycleLanguage = () => {
    const langOrder: SupportedLanguage[] = ['zh', 'en', 'ja'];
    const nextIndex = (langOrder.indexOf(currentLang) + 1) % langOrder.length;
    const nextLang = langOrder[nextIndex];
    setCurrentLang(nextLang);
    setLanguage(nextLang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLang;
    }
    try {
      localStorage.setItem('learn_rust_lang', nextLang);
    } catch {}
  };

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
                Learn Rust
                <span className="rounded-full bg-[#CE412B]/10 px-2 py-0.5 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
                  v0.1
                </span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                Interactive Crab Lab
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Desktop Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                aria-label={item.name}
                title={t(`nav.${item.key}`) || item.name}
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
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right: Actions (Language, Theme, GitHub) */}
        <div className="flex items-center gap-2">
          {/* Language Selector Slot */}
          <button
            type="button"
            onClick={cycleLanguage}
            aria-label="Change language (ZH / EN / JA)"
            title="Language selector (Milestone 2 full dictionary)"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Globe className="h-4 w-4 text-[#CE412B]" />
            <span className="hidden sm:inline">中 / EN / 日</span>
          </button>

          {/* Theme Toggle Slot */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
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
