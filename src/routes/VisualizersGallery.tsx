import React, { useState, useMemo } from 'react';
import {
  Layers,
  ShieldCheck,
  Lock,
  Boxes,
  Cpu,
  Zap,
  Sparkles,
  ArrowRight,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { OwnershipVisualizer } from '@/components/visualizers/OwnershipVisualizer';
import { BorrowCheckerVisualizer } from '@/components/visualizers/BorrowCheckerVisualizer';
import { MemoryLayoutVisualizer } from '@/components/visualizers/MemoryLayoutVisualizer';
import { TraitDispatchVisualizer } from '@/components/visualizers/TraitDispatchVisualizer';
import { ConcurrencyVisualizer } from '@/components/visualizers/ConcurrencyVisualizer';
import { ErrorHandlingVisualizer } from '@/components/visualizers/ErrorHandlingVisualizer';
import { useI18n } from '@/lib/i18n';

export type VisualizerCategory =
  | 'All'
  | 'Ownership & Memory'
  | 'Lifetimes & Borrows'
  | 'Types & Traits'
  | 'Concurrency & Errors';

interface VisualizerCard {
  id: string;
  category: VisualizerCategory;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
  status: 'Prototype' | 'Ready in M3';
  color: string;
}

const visualizers: VisualizerCard[] = [
  {
    id: 'ownership',
    category: 'Ownership & Memory',
    title: 'Ownership & Move Semantics',
    subtitle: 'Track value movement and scope drops',
    icon: ShieldCheck,
    description:
      'Inspect how assigning a variable moves its stack pointer and heap allocation, instantly invalidating the original binding.',
    features: ['Stack vs Heap pointer tracking', 'Value move animations', 'Drop scope destruction'],
    status: 'Ready in M3',
    color: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-[#CE412B]',
  },
  {
    id: 'borrow-checker',
    category: 'Lifetimes & Borrows',
    title: 'Borrow Checker & Lifetimes',
    subtitle: 'Visualize active references and aliasing rules',
    icon: Lock,
    description:
      'Simulate the Rust borrow checker in real-time. Experience why multiple readers (&T) or single writer (&mut T) prevents data races.',
    features: ['Compile-time aliasing rules', 'Lifetime scope spans', 'Conflict violation highlighting'],
    status: 'Ready in M3',
    color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600',
  },
  {
    id: 'memory-layout',
    category: 'Ownership & Memory',
    title: 'Memory Layout (Stack vs Heap)',
    subtitle: 'Direct visual mapping of program memory',
    icon: Boxes,
    description:
      'Visual representation of Stack frames, pointers, capacities, heap chunks, and struct byte alignments.',
    features: ['Vector growth & reallocation', 'String buffer anatomy', 'Zero-cost abstraction proofs'],
    status: 'Ready in M3',
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-600',
  },
  {
    id: 'trait-dispatch',
    category: 'Types & Traits',
    title: 'Trait Dispatch (Static vs Dyn)',
    subtitle: 'Monomorphization vs Vtable lookups',
    icon: Cpu,
    description:
      'Compare compile-time monomorphization with runtime dynamic dispatch (dyn Trait) through interactive vtable diagrams.',
    features: ['Fat pointer dissection', 'Vtable jump simulation', 'Binary size vs flexibility analysis'],
    status: 'Ready in M3',
    color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-600',
  },
  {
    id: 'concurrency',
    category: 'Concurrency & Errors',
    title: 'Concurrency & Mutex Locking',
    subtitle: 'Thread synchronization and channel message queues',
    icon: Zap,
    description:
      'Experience fearless concurrency: simulate multiple threads acquiring MutexGuard locks, avoiding deadlocks and race conditions.',
    features: ['Mutex lock/unlock lifecycle', 'MPSC queue visualization', 'Send & Sync bounds inspector'],
    status: 'Ready in M3',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600',
  },
  {
    id: 'railway-errors',
    category: 'Concurrency & Errors',
    title: 'Railway Error Flow (Option/Result)',
    subtitle: 'Visual track switching for robust error handling',
    icon: Layers,
    description:
      'Watch function pipelines fork between Ok and Err tracks, seeing exactly how the ? operator short-circuits failure states.',
    features: ['Railway track switching', 'Question mark operator flow', 'Exhaustive pattern matching'],
    status: 'Ready in M3',
    color: 'from-rose-500/10 to-pink-500/10 border-rose-500/30 text-rose-600',
  },
];

const categories: VisualizerCategory[] = [
  'All',
  'Ownership & Memory',
  'Lifetimes & Borrows',
  'Types & Traits',
  'Concurrency & Errors',
];

export const VisualizersGallery: React.FC = () => {
  const { language } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<VisualizerCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVisualizers = useMemo(() => {
    return visualizers.filter((vis) => {
      const matchesCategory =
        selectedCategory === 'All' || vis.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        vis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vis.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vis.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const renderVisualizer = (id: string) => {
    switch (id) {
      case 'ownership':
        return <OwnershipVisualizer />;
      case 'borrow-checker':
        return <BorrowCheckerVisualizer />;
      case 'memory-layout':
        return <MemoryLayoutVisualizer />;
      case 'trait-dispatch':
        return <TraitDispatchVisualizer />;
      case 'concurrency':
        return <ConcurrencyVisualizer />;
      case 'railway-errors':
        return <ErrorHandlingVisualizer />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title & Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#CE412B]/10 px-3 py-1 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
          <Layers className="h-3.5 w-3.5" />
          <span>Interactive Visualizers Gallery</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          6 Core Rust Concept Simulators
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Visual interactive models explaining the most notorious Rust concepts. These interactive
          modules are live with state transitions and step-by-step simulations.
        </p>
      </div>

      {/* Filter Toolbar: Categories, Search & Reset */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-slate-200/80 py-4 dark:border-slate-800">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Category Filter">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#CE412B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'All'
                ? language === 'zh'
                  ? '全部 (All)'
                  : language === 'ja'
                  ? 'すべて (All)'
                  : 'All'
                : cat}
            </button>
          ))}
        </div>

        {/* Search input & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'zh'
                  ? '搜索可视化器...'
                  : language === 'ja'
                  ? '検索...'
                  : 'Search visualizers...'
              }
              aria-label="Search visualizers"
              className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#CE412B] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Reset All Filters"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Visualizers Grid */}
      {filteredVisualizers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800">
          <p className="text-sm font-medium">No visualizers match the selected filter.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {filteredVisualizers.map((vis) => {
            const Icon = vis.icon;
            return (
              <div
                key={vis.id}
                id={vis.id}
                className={`flex flex-col justify-between rounded-3xl border bg-gradient-to-b p-6 sm:p-7 shadow-sm transition-all hover:shadow-lg dark:bg-slate-900/60 ${vis.color}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-slate-800">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs dark:bg-slate-800 dark:text-slate-200">
                      {vis.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {vis.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {vis.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {vis.description}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      Simulated Features
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {vis.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 opacity-60 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Embedded Interactive Visualizer Simulator */}
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
                    {renderVisualizer(vis.id)}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200/60 pt-4 dark:border-slate-800">
                  <Link
                    to={`/lesson/${vis.id === 'ownership' ? 'ownership-move' : 'references-borrowing'}`}
                    className="flex items-center justify-between text-xs font-bold hover:underline"
                  >
                    <span>Read Accompanying Theory</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisualizersGallery;
