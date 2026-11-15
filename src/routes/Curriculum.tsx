import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Sparkles,
  ShieldCheck,
  Lock,
  Boxes,
  Cpu,
  Zap,
  Repeat,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import {
  curriculumLessons,
  CurriculumPhaseKey,
  LessonIconKey,
} from '@/lib/i18n/curriculumData';

const iconMap: Record<LessonIconKey, React.ComponentType<{ className?: string }>> = {
  sparkles: Sparkles,
  boxes: Boxes,
  shield: ShieldCheck,
  lock: Lock,
  repeat: Repeat,
  cpu: Cpu,
  zap: Zap,
};

export const Curriculum: React.FC = () => {
  const { language, t } = useI18n();
  const [selectedPhaseKey, setSelectedPhaseKey] = useState<'all' | CurriculumPhaseKey>('all');

  const phaseFilters: Array<{ key: 'all' | CurriculumPhaseKey; label: string }> = [
    { key: 'all', label: t('curriculum.allPhases') },
    { key: 'phase1', label: t('curriculum.phase1') },
    { key: 'phase2', label: t('curriculum.phase2') },
    { key: 'phase3', label: t('curriculum.phase3') },
  ];

  const filteredLessons =
    selectedPhaseKey === 'all'
      ? curriculumLessons
      : curriculumLessons.filter((l) => l.phaseKey === selectedPhaseKey);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#CE412B]/10 px-3 py-1 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
          <BookOpen className="h-3.5 w-3.5" />
          <span>{t('curriculum.badge')}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t('curriculum.title')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          {t('curriculum.subtitle')}
        </p>
      </div>

      {/* Phase Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-2">
          <Filter className="h-3.5 w-3.5" />
          <span>{t('curriculum.filterLabel')}</span>
        </div>
        {phaseFilters.map((phase) => (
          <button
            key={phase.key}
            type="button"
            onClick={() => setSelectedPhaseKey(phase.key)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              selectedPhaseKey === phase.key
                ? 'bg-[#CE412B] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {phase.label}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLessons.map((item) => {
          const localized = item.translations[language] ?? item.translations.en;
          const Icon = iconMap[item.iconKey];
          return (
            <div
              key={item.slug}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-[#CE412B]/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/60 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-[#CE412B]/10 p-2.5 text-[#CE412B] dark:bg-[#CE412B]/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        item.difficultyKey === 'beginner' &&
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                        item.difficultyKey === 'intermediate' &&
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                        item.difficultyKey === 'advanced' &&
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      )}
                    >
                      {localized.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {localized.duration}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#CE412B]">
                    {localized.phase}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {localized.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {localized.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {localized.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/80">
                <Link
                  to={`/lesson/${item.slug}`}
                  className="flex items-center justify-between text-xs font-semibold text-[#CE412B] hover:text-[#B33621]"
                >
                  <span>{t('curriculum.startModule')}</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
