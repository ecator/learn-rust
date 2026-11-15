import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Layers,
  CheckCircle,
  Code2,
  BookOpen,
  AlertTriangle,
  Check,
  Terminal,
} from 'lucide-react';
import { OwnershipVisualizer } from '@/components/visualizers/OwnershipVisualizer';
import { BorrowCheckerVisualizer } from '@/components/visualizers/BorrowCheckerVisualizer';
import { MemoryLayoutVisualizer } from '@/components/visualizers/MemoryLayoutVisualizer';
import { TraitDispatchVisualizer } from '@/components/visualizers/TraitDispatchVisualizer';
import { ConcurrencyVisualizer } from '@/components/visualizers/ConcurrencyVisualizer';
import { ErrorHandlingVisualizer } from '@/components/visualizers/ErrorHandlingVisualizer';
import { QuizChallenge } from '@/components/common/QuizChallenge';
import { loadProgress, saveProgress } from '@/lib/storage';
import { useI18n } from '@/lib/i18n';
import { getLocalizedLesson } from '@/lib/i18n/curriculumData';

export const LessonPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentSlug = slug || 'hello-ferris';
  const { language, t } = useI18n();

  const resolvedLesson = getLocalizedLesson(currentSlug, language);

  const fallbackTitle = currentSlug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const lesson = resolvedLesson ?? {
    slug: currentSlug,
    order: 0,
    phaseKey: 'phase1' as const,
    difficultyKey: 'beginner' as const,
    iconKey: 'sparkles' as const,
    title: fallbackTitle,
    shortTitle: fallbackTitle,
    phase: t('lesson.fallbackPhase'),
    difficulty: t('lesson.fallbackDifficulty'),
    duration: t('lesson.fallbackDuration'),
    summary: '',
    tags: [],
    overview: t('lesson.fallbackOverview', { title: fallbackTitle, slug: currentSlug }),
    sections: [],
    codeSnippet: `// Rust Playground: ${currentSlug}
fn main() {
    println!("Exploring ${currentSlug}...");
}`,
    codeExplanation: [],
    pitfall: undefined,
    quiz: undefined,
    visualizerSlug: 'ownership',
    prevSlug: undefined,
    nextSlug: 'curriculum',
  };

  const [completed, setCompleted] = React.useState<boolean>(() => {
    const progress = loadProgress();
    return progress.completedLessons.includes(currentSlug);
  });

  React.useEffect(() => {
    const progress = loadProgress();
    setCompleted(progress.completedLessons.includes(currentSlug));
  }, [currentSlug]);

  const toggleCompleted = () => {
    const progress = loadProgress();
    if (!progress.completedLessons.includes(currentSlug)) {
      progress.completedLessons.push(currentSlug);
      progress.stats.xpScore += 50;
      setCompleted(true);
    } else {
      progress.completedLessons = progress.completedLessons.filter((id) => id !== currentSlug);
      setCompleted(false);
    }
    saveProgress(progress);
  };

  const renderVisualizer = () => {
    switch (currentSlug) {
      case 'ownership-move':
        return <OwnershipVisualizer />;
      case 'references-borrowing':
      case 'lifetimes-scopes':
        return <BorrowCheckerVisualizer />;
      case 'slices-memory':
      case 'hello-ferris':
      case 'primitives-mutability':
      case 'structs-enums':
      case 'smart-pointers':
        return <MemoryLayoutVisualizer />;
      case 'traits-generics':
        return <TraitDispatchVisualizer />;
      case 'concurrency-mutex':
        return <ConcurrencyVisualizer />;
      case 'error-handling':
        return <ErrorHandlingVisualizer />;
      default: {
        const visSlug = lesson.visualizerSlug;
        if (visSlug === 'ownership') return <OwnershipVisualizer />;
        if (visSlug === 'borrow-checker') return <BorrowCheckerVisualizer />;
        if (visSlug === 'memory-layout') return <MemoryLayoutVisualizer />;
        if (visSlug === 'trait-dispatch') return <TraitDispatchVisualizer />;
        if (visSlug === 'concurrency') return <ConcurrencyVisualizer />;
        if (visSlug === 'railway-errors') return <ErrorHandlingVisualizer />;
        return null;
      }
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Navigation back & actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/curriculum"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#CE412B] dark:text-slate-400 dark:hover:text-[#CE412B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t('lesson.backToCurriculum')}</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {t('lesson.lessonIdLabel', { slug: currentSlug, id: currentSlug })}
          </span>
          <button
            type="button"
            onClick={toggleCompleted}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <CheckCircle className={`h-4 w-4 ${completed ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>{completed ? t('common.completed') : t('common.markAsCompleted')}</span>
          </button>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#CE412B]/10 px-3 py-1 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
            {lesson.phase}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {lesson.difficulty}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {lesson.duration}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          {lesson.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {lesson.overview}
        </p>

        {lesson.visualizerSlug && (
          <div className="pt-2">
            <Link
              to={`/visualizers#${lesson.visualizerSlug}`}
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500/10 px-4 py-2 text-xs font-semibold text-[#CE412B] hover:bg-orange-500/20 dark:bg-[#CE412B]/20 dark:hover:bg-[#CE412B]/30 transition-colors"
            >
              <Layers className="h-4 w-4" />
              <span>{t('lesson.openVisualizer')}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Deep-Dive Core Sections */}
      {lesson.sections.length > 0 && (
        <section className="space-y-4" data-testid="lesson-sections">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#CE412B]" />
            <span>{t('lesson.deepDiveTitle')}</span>
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {lesson.sections.map((sec, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm space-y-3"
              >
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#CE412B]/10 text-xs font-bold text-[#CE412B] dark:bg-[#CE412B]/20">
                    {idx + 1}
                  </span>
                  <span>{sec.title}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {sec.content}
                </p>
                {sec.bullets.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {sec.bullets.map((bullet, bIdx) => (
                      <li
                        key={bIdx}
                        className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300"
                      >
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Code Playground Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-[#CE412B]" />
            <span>{t('lesson.codeWalkthroughTitle')}</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">main.rs</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-slate-100 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-slate-400">rustc 1.84.0</span>
            </div>
            <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {t('common.ready')}
            </span>
          </div>
          <pre className="p-4 sm:p-6 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
            <code>{lesson.codeSnippet}</code>
          </pre>
        </div>

        {lesson.codeExplanation.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Terminal className="h-3.5 w-3.5 text-[#CE412B]" />
              <span>{t('lesson.codeStepsTitle')}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {lesson.codeExplanation.map((step, sIdx) => (
                <li key={sIdx} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* Common Pitfall Card */}
      {lesson.pitfall && (
        <section
          data-testid="lesson-pitfall"
          className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 sm:p-6 dark:bg-amber-950/20 space-y-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{t('lesson.pitfallsTitle')}: {lesson.pitfall.title}</span>
            </h2>
            <span className="rounded-md bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[11px] font-mono font-bold text-red-700 dark:text-red-300">
              {lesson.pitfall.errorCode}
            </span>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              {t('lesson.pitfallWrongLabel')}
            </span>
            <pre className="rounded-xl border border-red-900/30 bg-slate-950 p-3.5 overflow-x-auto text-xs font-mono text-red-200 leading-relaxed">
              <code>{lesson.pitfall.badCode}</code>
            </pre>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {lesson.pitfall.description}
          </p>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            <span className="font-bold">{t('lesson.pitfallFixLabel')}: </span>
            <span>{lesson.pitfall.fix}</span>
          </div>
        </section>
      )}

      {/* Interactive Concept Simulator */}
      {renderVisualizer() && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#CE412B]" />
              <span>{t('lesson.simulatorTitle')}</span>
            </h2>
          </div>
          {renderVisualizer()}
        </div>
      )}

      {/* Interactive Practice Quiz */}
      <div className="space-y-3">
        <QuizChallenge lessonId={currentSlug} {...(lesson.quiz ?? {})} />
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
        {lesson.prevSlug ? (
          <Link
            to={`/lesson/${lesson.prevSlug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('lesson.previousLesson')}</span>
          </Link>
        ) : (
          <div />
        )}

        {lesson.nextSlug ? (
          <Link
            to={lesson.nextSlug === 'curriculum' ? '/curriculum' : `/lesson/${lesson.nextSlug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#CE412B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B33621]"
          >
            <span>{t('lesson.nextLesson')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/curriculum"
            className="inline-flex items-center gap-2 rounded-xl bg-[#CE412B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B33621]"
          >
            <span>{t('lesson.viewAllModules')}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
};
