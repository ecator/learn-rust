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
} from 'lucide-react';
import { loadProgress, STORAGE_KEY_PROGRESS } from '@/lib/storage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
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

  const totalLessons = 10;
  const completedCount = progress.completedLessons?.length || 0;
  const progressPercent = Math.min(100, Math.round((completedCount / totalLessons) * 100));
  const curriculumSections = [
    {
      title: 'Phase 1: Foundations',
      items: [
        { title: '1. Hello Ferris & Cargo', slug: 'hello-ferris', icon: Sparkles },
        { title: '2. Primitive Types & Mutability', slug: 'primitives-mutability', icon: Boxes },
        { title: '3. Ownership & Move Semantics', slug: 'ownership-move', icon: ShieldCheck },
        { title: '4. References & Borrowing', slug: 'references-borrowing', icon: Lock },
      ],
    },
    {
      title: 'Phase 2: Deep Dive',
      items: [
        { title: '5. Lifetimes & Scopes', slug: 'lifetimes-scopes', icon: Repeat },
        { title: '6. Structs, Enums & Pattern Matching', slug: 'structs-enums', icon: Boxes },
        { title: '7. Traits & Generics', slug: 'traits-generics', icon: Cpu },
        { title: '8. Error Handling & Result', slug: 'error-handling', icon: Zap },
      ],
    },
    {
      title: 'Phase 3: Mastery',
      items: [
        { title: '9. Smart Pointers (Box, Rc, Arc)', slug: 'smart-pointers', icon: Lock },
        { title: '10. Fearless Concurrency & Mutex', slug: 'concurrency-mutex', icon: Zap },
      ],
    },
  ];

  const visualizerLinks = [
    { title: 'Ownership & Move', slug: 'ownership' },
    { title: 'Borrow Checker & Lifetimes', slug: 'borrow-checker' },
    { title: 'Memory Layout (Stack vs Heap)', slug: 'memory-layout' },
    { title: 'Trait Dispatch (Static vs Dyn)', slug: 'trait-dispatch' },
    { title: 'Concurrency & Mutex', slug: 'concurrency' },
    { title: 'Railway Error Flow', slug: 'railway-errors' },
  ];

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
            Course Navigator
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Visualizers Quick Menu */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-[#CE412B]" />
                Interactive Visualizers
              </span>
              <NavLink
                to="/visualizers"
                onClick={onClose}
                className="text-[11px] font-medium text-[#CE412B] hover:underline"
              >
                All
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
                Curriculum Lessons
              </span>
              <NavLink
                to="/curriculum"
                onClick={onClose}
                className="text-[11px] font-medium text-[#CE412B] hover:underline"
              >
                Overview
              </NavLink>
            </div>

            {curriculumSections.map((sec) => (
              <div key={sec.title} className="space-y-1">
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
              <span>Your Rust Progress</span>
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
