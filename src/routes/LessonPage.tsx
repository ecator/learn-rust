import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  Layers,
  CheckCircle,
  Code2,
} from 'lucide-react';
import { OwnershipVisualizer } from '@/components/visualizers/OwnershipVisualizer';
import { BorrowCheckerVisualizer } from '@/components/visualizers/BorrowCheckerVisualizer';
import { MemoryLayoutVisualizer } from '@/components/visualizers/MemoryLayoutVisualizer';
import { TraitDispatchVisualizer } from '@/components/visualizers/TraitDispatchVisualizer';
import { ConcurrencyVisualizer } from '@/components/visualizers/ConcurrencyVisualizer';
import { ErrorHandlingVisualizer } from '@/components/visualizers/ErrorHandlingVisualizer';
import { QuizChallenge } from '@/components/common/QuizChallenge';
import { loadProgress, saveProgress } from '@/lib/storage';

const lessonData: Record<
  string,
  {
    title: string;
    phase: string;
    difficulty: string;
    duration: string;
    overview: string;
    codeSnippet: string;
    visualizerSlug?: string;
    nextSlug?: string;
    prevSlug?: string;
  }
> = {
  'hello-ferris': {
    title: 'Hello Ferris & Cargo Basics',
    phase: 'Phase 1: Foundations',
    difficulty: 'Beginner',
    duration: '15 min',
    overview:
      'Cargo is the Rust build system and package manager. In this module, you learn how cargo manages dependencies, builds release binaries, and why Rust enforces explicit entry points.',
    codeSnippet: `fn main() {
    println!("Hello, Ferris! 🦀");
    let name = "Rustacean";
    println!("Welcome to memory-safe systems programming, {}!", name);
}`,
    visualizerSlug: 'memory-layout',
    nextSlug: 'primitives-mutability',
  },
  'primitives-mutability': {
    title: 'Primitive Types & Mutability',
    phase: 'Phase 1: Foundations',
    difficulty: 'Beginner',
    duration: '20 min',
    overview:
      'In Rust, variables are immutable by default. To make a binding mutable, you must explicitly declare it with "let mut". Learn how scalar and compound types behave in memory.',
    codeSnippet: `fn main() {
    let mut count = 42; // mutable variable
    println!("Initial count: {}", count);
    count += 1;
    println!("Incremented count: {}", count);
}`,
    visualizerSlug: 'memory-layout',
    prevSlug: 'hello-ferris',
    nextSlug: 'ownership-move',
  },
  'ownership-move': {
    title: 'Ownership & Move Semantics',
    phase: 'Phase 1: Foundations',
    difficulty: 'Beginner',
    duration: '30 min',
    overview:
      'Ownership is Rust’s core mechanism for memory safety without a garbage collector. Each value has an owner, only one owner exists at a time, and when the owner goes out of scope, the memory is freed automatically.',
    codeSnippet: `fn main() {
    let s1 = String::from("hello");
    // Ownership moves from s1 to s2.
    // s1 is invalidated here!
    let s2 = s1;

    // println!("{}", s1); // COMPILE ERROR: value borrowed here after move
    println!("s2 has ownership: {}", s2);
}`,
    visualizerSlug: 'ownership',
    prevSlug: 'primitives-mutability',
    nextSlug: 'references-borrowing',
  },
  'references-borrowing': {
    title: 'References & Borrowing',
    phase: 'Phase 1: Foundations',
    difficulty: 'Beginner',
    duration: '25 min',
    overview:
      'Borrowing allows accessing data without taking ownership. You can have any number of immutable references (&T) OR exactly one mutable reference (&mut T) at any given time, preventing data races at compile time.',
    codeSnippet: `fn main() {
    let mut data = String::from("Ferris");
    
    // Immutable borrow
    let len = calculate_length(&data);
    println!("Length: {}", len);

    // Mutable borrow
    append_crab(&mut data);
    println!("Modified: {}", data);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

fn append_crab(s: &mut String) {
    s.push_str(" 🦀");
}`,
    visualizerSlug: 'borrow-checker',
    prevSlug: 'ownership-move',
    nextSlug: 'lifetimes-scopes',
  },
};

export const LessonPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const currentSlug = slug || 'hello-ferris';

  const lesson = lessonData[currentSlug] || {
    title: currentSlug
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    phase: 'Curriculum Module',
    difficulty: 'Interactive',
    duration: '20 min',
    overview: `Detailed lesson content for "${currentSlug}". This module combines visual walkthroughs, interactive memory simulators, and practice challenges.`,
    codeSnippet: `// Rust Playground for ${currentSlug}
fn main() {
    println!("Exploring ${currentSlug}...");
}`,
    visualizerSlug: 'ownership',
    nextSlug: 'curriculum',
  };

  const [completed, setCompleted] = React.useState<boolean>(() => {
    const progress = loadProgress();
    return progress.completedLessons.includes(currentSlug);
  });

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
        return <BorrowCheckerVisualizer />;
      case 'slices-memory':
      case 'hello-ferris':
      case 'primitives-mutability':
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

  const getQuizData = (slug: string) => {
    switch (slug) {
      case 'references-borrowing':
        return {
          question:
            'Can you create an exclusive mutable reference (&mut T) while immutable references (&T) are active in the same scope?',
          options: [
            'Yes, Rust allows unlimited concurrent mutable and immutable references simultaneously.',
            'No, Rust enforces either any number of immutable references OR exactly one mutable reference at a time.',
            'Yes, but only if the variable is marked static.',
          ],
          correctIndex: 1,
          explanation:
            'Rust’s borrow checker guarantees that data cannot be mutated through one reference while other references are reading it, preventing data races.',
        };
      case 'concurrency-mutex':
        return {
          question:
            'What happens when a thread calls lock() on a Mutex that is currently held by another thread?',
          options: [
            'The thread blocks and sleeps until the holding thread drops its MutexGuard.',
            'The calling thread panics immediately.',
            'The mutex forcibly evicts the holding thread and grants access.',
          ],
          correctIndex: 0,
          explanation:
            'Mutex::lock() blocks the calling thread until the mutex is released when the previous owner drops its MutexGuard.',
        };
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Navigation back & actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/curriculum"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#CE412B] dark:text-slate-400 dark:hover:text-[#CE412B] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Curriculum</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Lesson ID: {currentSlug}</span>
          <button
            type="button"
            onClick={toggleCompleted}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <CheckCircle className={`h-4 w-4 ${completed ? 'text-emerald-500' : 'text-slate-400'}`} />
            <span>{completed ? 'Completed' : 'Mark as Completed'}</span>
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
              <span>Open Related Visualizer</span>
            </Link>
          </div>
        )}
      </div>

      {/* Code Playground Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-[#CE412B]" />
            <span>Interactive Code Walkthrough</span>
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
              Ready
            </span>
          </div>
          <pre className="p-4 sm:p-6 overflow-x-auto text-xs sm:text-sm font-mono text-slate-200 leading-relaxed">
            <code>{lesson.codeSnippet}</code>
          </pre>
        </div>
      </div>

      {/* Interactive Concept Simulator */}
      {renderVisualizer() && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#CE412B]" />
              <span>Interactive Concept Simulator</span>
            </h2>
          </div>
          {renderVisualizer()}
        </div>
      )}

      {/* Interactive Practice Quiz */}
      <div className="space-y-3">
        <QuizChallenge lessonId={currentSlug} {...getQuizData(currentSlug)} />
      </div>

      {/* Prev / Next controls */}
      <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
        {lesson.prevSlug ? (
          <Link
            to={`/lesson/${lesson.prevSlug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Lesson</span>
          </Link>
        ) : (
          <div />
        )}

        {lesson.nextSlug ? (
          <Link
            to={lesson.nextSlug === 'curriculum' ? '/curriculum' : `/lesson/${lesson.nextSlug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-[#CE412B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B33621]"
          >
            <span>Next Lesson</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <Link
            to="/curriculum"
            className="inline-flex items-center gap-2 rounded-xl bg-[#CE412B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#B33621]"
          >
            <span>View All Modules</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
};
