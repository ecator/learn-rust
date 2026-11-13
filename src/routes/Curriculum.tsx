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

interface LessonMeta {
  slug: string;
  title: string;
  phase: 'Phase 1: Foundations' | 'Phase 2: Deep Dive' | 'Phase 3: Mastery';
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
}

const lessons: LessonMeta[] = [
  {
    slug: 'hello-ferris',
    title: 'Hello Ferris & Cargo Basics',
    phase: 'Phase 1: Foundations',
    duration: '15 min',
    difficulty: 'Beginner',
    summary: 'Discover the Rust ecosystem, Cargo build commands, formatting with rustfmt, and writing your first fn main().',
    icon: Sparkles,
    tags: ['Cargo', 'CLI', 'Syntax'],
  },
  {
    slug: 'primitives-mutability',
    title: 'Primitive Types & Mutability',
    phase: 'Phase 1: Foundations',
    duration: '20 min',
    difficulty: 'Beginner',
    summary: 'Master immutable variables by default (let), mutable binding (let mut), integer types, floating points, tuples, and arrays.',
    icon: Boxes,
    tags: ['Types', 'Memory', 'Variables'],
  },
  {
    slug: 'ownership-move',
    title: 'Ownership & Move Semantics',
    phase: 'Phase 1: Foundations',
    duration: '30 min',
    difficulty: 'Beginner',
    summary: 'Understand the three fundamental ownership rules, Stack vs. Heap allocation, and how Move semantics eliminate double-free errors.',
    icon: ShieldCheck,
    tags: ['Ownership', 'Move', 'Memory Safety'],
  },
  {
    slug: 'references-borrowing',
    title: 'References & Borrowing',
    phase: 'Phase 1: Foundations',
    duration: '25 min',
    difficulty: 'Beginner',
    summary: 'Learn immutable references (&T) vs mutable references (&mut T), aliasing rules, and compile-time data race prevention.',
    icon: Lock,
    tags: ['Borrowing', 'Pointers', 'Safety'],
  },
  {
    slug: 'lifetimes-scopes',
    title: 'Lifetimes & Borrow Checker',
    phase: 'Phase 2: Deep Dive',
    duration: '35 min',
    difficulty: 'Intermediate',
    summary: 'Demystify generic lifetime annotations (\'a), scope validation, and why dangling references cannot exist in safe Rust.',
    icon: Repeat,
    tags: ['Lifetimes', 'Borrow Checker', 'Scopes'],
  },
  {
    slug: 'structs-enums',
    title: 'Structs, Enums & Pattern Matching',
    phase: 'Phase 2: Deep Dive',
    duration: '25 min',
    difficulty: 'Intermediate',
    summary: 'Compose custom data structures, algebraic data types with Enums, and exhaustive match statement expressions.',
    icon: Boxes,
    tags: ['Structs', 'Enums', 'Pattern Matching'],
  },
  {
    slug: 'traits-generics',
    title: 'Traits & Generic Programming',
    phase: 'Phase 2: Deep Dive',
    duration: '30 min',
    difficulty: 'Intermediate',
    summary: 'Define shared interfaces with Traits, implement trait bounds, monomorphization, and dynamic dispatch via dyn Trait.',
    icon: Cpu,
    tags: ['Traits', 'Generics', 'Polymorphism'],
  },
  {
    slug: 'error-handling',
    title: 'Railway Error Handling: Option & Result',
    phase: 'Phase 2: Deep Dive',
    duration: '25 min',
    difficulty: 'Intermediate',
    summary: 'Say goodbye to null pointer exceptions with Option<T> and Result<T, E>, using the ? propagation operator seamlessly.',
    icon: Zap,
    tags: ['Option', 'Result', 'Error Handling'],
  },
  {
    slug: 'smart-pointers',
    title: 'Smart Pointers: Box, Rc, Arc & RefCell',
    phase: 'Phase 3: Mastery',
    duration: '35 min',
    difficulty: 'Advanced',
    summary: 'Explore heap allocation via Box<T>, reference counting with Rc<T>, thread-safe Arc<T>, and interior mutability with RefCell.',
    icon: Lock,
    tags: ['Smart Pointers', 'Box', 'Arc', 'RefCell'],
  },
  {
    slug: 'concurrency-mutex',
    title: 'Fearless Concurrency & Mutex',
    phase: 'Phase 3: Mastery',
    duration: '40 min',
    difficulty: 'Advanced',
    summary: 'Spawn OS threads, communicate over mpsc channels, synchronize shared state with Mutex<T>, and understand Send and Sync traits.',
    icon: Zap,
    tags: ['Threads', 'Mutex', 'MPSC', 'Fearless Concurrency'],
  },
];

export const Curriculum: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState<string>('All');

  const phases = ['All', 'Phase 1: Foundations', 'Phase 2: Deep Dive', 'Phase 3: Mastery'];

  const filteredLessons =
    selectedPhase === 'All'
      ? lessons
      : lessons.filter((l) => l.phase === selectedPhase);

  return (
    <div className="space-y-8 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#CE412B]/10 px-3 py-1 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
          <BookOpen className="h-3.5 w-3.5" />
          <span>Curriculum Roadmaps</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          The Complete Rust Learning Path: Rust Curriculum Catalog
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          From the basics of ownership to advanced fearless concurrency. Every module pairs
          in-depth explanations with visual interactive models and verified code snippets.
        </p>
      </div>

      {/* Phase Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mr-2">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>
        {phases.map((phase) => (
          <button
            key={phase}
            type="button"
            onClick={() => setSelectedPhase(phase)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              selectedPhase === phase
                ? 'bg-[#CE412B] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredLessons.map((lesson) => {
          const Icon = lesson.icon;
          return (
            <div
              key={lesson.slug}
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
                        lesson.difficulty === 'Beginner' &&
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                        lesson.difficulty === 'Intermediate' &&
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                        lesson.difficulty === 'Advanced' &&
                          'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                      )}
                    >
                      {lesson.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#CE412B]">
                    {lesson.phase}
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {lesson.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {lesson.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {lesson.tags.map((tag) => (
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
                  to={`/lesson/${lesson.slug}`}
                  className="flex items-center justify-between text-xs font-semibold text-[#CE412B] hover:text-[#B33621]"
                >
                  <span>Start Module</span>
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
