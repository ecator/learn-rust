import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Layers,
  ChevronRight,
  Sparkles,
  Cpu,
  ShieldCheck,
  Zap,
  Repeat,
  Lock,
  Boxes,
  X,
  Globe,
} from 'lucide-react';
import { loadProgress, STORAGE_KEY_PROGRESS } from '@/lib/storage';
import { useI18n, SupportedLanguage } from '@/lib/i18n';
import {
  curriculumLessons,
  CurriculumPhaseKey,
  LessonIconKey,
} from '@/lib/i18n/curriculumData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<LessonIconKey, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  boxes: Boxes,
  shield: ShieldCheck,
  lock: Lock,
  repeat: Repeat,
  cpu: Cpu,
  zap: Zap,
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { language, setLanguage, t } = useI18n();
  const [progress, setProgress] = React.useState(() => loadProgress());

  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === STORAGE_KEY_PROGRESS) {
        setProgress(loadProgress());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const totalLessons = curriculumLessons.length;
  const completedCount = progress.completedLessons?.length || 0;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  const phaseOrder: CurriculumPhaseKey[] = ['phase1', 'phase2', 'phase3'];
  const curriculumSections = phaseOrder.map((phaseKey) => ({
    phaseKey,
    title: t(`curriculum.${phaseKey}`),
    items: curriculumLessons
      .filter((lesson) => lesson.phaseKey === phaseKey)
      .map((lesson) => ({
        slug: lesson.slug,
        title: (lesson.translations[language] ?? lesson.translations.en).shortTitle,
        icon: iconMap[lesson.iconKey],
      })),
  }));

  const visualizerLinks = [
    {
      title:
        language === 'zh'
          ? '所有权与移动'
          : language === 'ja'
          ? '所有権とムーブ'
          : 'Ownership & Move',
      slug: 'ownership',
    },
    { title: t('visualizers.borrowChecker'), slug: 'borrow-checker' },
    {
      title:
        language === 'en'
          ? 'Memory Layout (Stack vs Heap)'
          : t('visualizers.memoryLayout'),
      slug: 'memory-layout',
    },
    {
      title:
        language === 'en'
          ? 'Trait Dispatch (Static vs Dyn)'
          : t('visualizers.traitDispatch'),
      slug: 'trait-dispatch',
    },
    {
      title:
        language === 'en'
          ? 'Concurrency & Mutex'
          : t('visualizers.concurrency'),
      slug: 'concurrency',
    },
    {
      title:
        language === 'en'
          ? 'Railway Error Flow'
          : t('visualizers.errorHandling'),
      slug: 'railway-errors',
    },
  ];

  const handleSelectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
    try {
      localStorage.setItem('learn_rust_lang', lang);
    } catch {}
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        aria-label="Curriculum Sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:z-0 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer Header (mobile only) */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800 lg:hidden">
          <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#CE412B]" />
            {t('sidebar.courseNavigator')}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation sidebar"
            title={t('nav.closeSidebar')}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Mobile Language Switcher */}
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800 lg:hidden">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Globe className="h-3.5 w-3.5 text-[#CE412B]" />
            <span>{t('sidebar.languageSwitcher')}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5" data-testid="sidebar-language-switcher">
            {([
              { code: 'zh' as const, label: '简体中文' },
              { code: 'en' as const, label: 'English' },
              { code: 'ja' as const, label: '日本語' },
            ]).map((opt) => {
              const active = language === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => handleSelectLanguage(opt.code)}
                  aria-pressed={active}
                  aria-label={`${t('sidebar.languageSwitcher')}: ${opt.label}`}
                  data-testid={`sidebar-lang-${opt.code}`}
                  className={cn(
                    'rounded-lg border px-2 py-1.5 text-[11px] font-semibold transition-colors',
                    active
                      ? 'border-[#CE412B] bg-[#CE412B] text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Visualizers Quick Menu */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#CE412B]" />
                {t('sidebar.interactiveVisualizers')}
              </span>
              <NavLink
                to="/visualizers"
                onClick={onClose}
                className="text-[11px] font-medium text-[#CE412B] hover:underline"
              >
                {t('common.all')}
              </NavLink>
            </div>
            <div className="space-y-1">
              {visualizerLinks.map((vis) => (
                <NavLink
                  key={vis.slug}
                  to={`/visualizers#${vis.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <span className="truncate">{vis.title}</span>
                  <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Curriculum Sections */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5 text-[#CE412B]" />
                {t('sidebar.curriculumLessons')}
              </span>
              <NavLink
                to="/curriculum"
                onClick={onClose}
                className="text-[11px] font-medium text-[#CE412B] hover:underline"
              >
                {t('sidebar.overview')}
              </NavLink>
            </div>

            {curriculumSections.map((sec) => (
              <div key={sec.phaseKey} className="space-y-1">
                <h4 className="px-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {sec.title}
                </h4>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.slug}
                      to={`/lesson/${item.slug}`}
                      onClick={onClose}
                      className={({ isActive }) => {
                        const isCurrent = isActive || location.pathname.includes(item.slug);
                        return cn(
                          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                          isCurrent
                            ? 'bg-[#CE412B]/10 text-[#CE412B] font-semibold dark:bg-[#CE412B]/20'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                        );
                      }}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Footer info box in Sidebar */}
        <div className="border-t border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/50">
            <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
              <span>{t('sidebar.yourProgress')}</span>
              <span className="text-[#CE412B] font-bold">{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-[#CE412B] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
