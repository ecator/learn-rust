import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { getLocalizedLesson } from '@/lib/i18n/curriculumData';

const slugToTitle = (slug: string): string => {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const { language, t } = useI18n();
  const pathnames = location.pathname.split('/').filter(Boolean);

  if (pathnames.length === 0) {
    return null;
  }

  const segmentLabels: Record<string, string> = {
    curriculum: t('nav.curriculum'),
    lesson: t('nav.curriculum'),
    lessons: t('nav.curriculum'),
    visualizers: t('nav.visualizers'),
    progress: t('nav.progress'),
  };

  const items = [{ label: t('nav.home'), href: '/' }];

  let currentPath = '';
  pathnames.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathnames.length - 1;

    const lessonMatch = getLocalizedLesson(segment, language);
    const label =
      segmentLabels[segment] ||
      (language === 'en'
        ? slugToTitle(segment)
        : lessonMatch?.title || slugToTitle(segment));
    // If the path is /lesson/:slug or /lessons/:slug, label "Curriculum" linking to /curriculum
    let href = currentPath;
    if (segment === 'lesson' || segment === 'lessons') {
      href = '/curriculum';
    }

    // Avoid duplicate Curriculum item if preceded by /curriculum
    if (items.some((it) => it.label === label && it.href === href)) {
      return;
    }

    items.push({
      label,
      href: isLast ? '' : href,
    });
  });

  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-4 sm:px-6 lg:px-8 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
      <ol className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
        {items.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === items.length - 1;

          return (
            <li key={idx} className="flex items-center space-x-2">
              {!isFirst && <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 shrink-0" />}
              {isLast ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center gap-1 hover:text-[#CE412B] dark:hover:text-[#CE412B] transition-colors"
                >
                  {isFirst && <Home className="h-3.5 w-3.5" />}
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
