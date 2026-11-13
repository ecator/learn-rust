import React, { useState, useEffect } from 'react';
import {
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { FerrisIcon } from '@/components/FerrisIcon';
import {
  loadProgress,
  resetProgress as storageResetProgress,
  STORAGE_KEY_PROGRESS,
  UserProgress,
} from '@/lib/storage';

export const ProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress>(() => loadProgress());
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key === STORAGE_KEY_PROGRESS) {
        setProgress(loadProgress());
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const xp = progress.stats?.xpScore || 0;
  const completedCount = progress.completedLessons?.length || 0;
  const streakDays = progress.stats?.streakDays || 1;
  const percent = Math.min(100, Math.round((completedCount / 10) * 100));

  const resetProgress = () => {
    if (window.confirm('Are you sure you want to reset your learning progress?')) {
      const defaultState = storageResetProgress();
      setProgress(defaultState);
      setMessage('Progress successfully reset to baseline.');
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const exportProgress = () => {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS) || JSON.stringify(progress, null, 2);
    navigator.clipboard?.writeText(raw);
    setMessage('Progress JSON exported to clipboard successfully.');
  };

  const statCards = [
    {
      label: 'Experience Points (XP)',
      value: `${xp} XP`,
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/20',
      subtitle: 'Earn XP by completing quizzes',
    },
    {
      label: 'Modules Completed',
      value: `${completedCount} / 10`,
      icon: CheckCircle2,
      color: 'text-[#CE412B] bg-[#CE412B]/10 dark:bg-[#CE412B]/20',
      subtitle: `${percent}% overall curriculum progress`,
    },
    {
      label: 'Learning Streak',
      value: `${streakDays} Day`,
      icon: Flame,
      color: 'text-orange-500 bg-orange-500/10 dark:bg-orange-500/20',
      subtitle: 'Study daily to maintain momentum',
    },
    {
      label: 'Interactive Accuracy',
      value: '100%',
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20',
      subtitle: 'Based on simulator quizzes',
    },
  ];

  return (
    <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#CE412B]/10 px-3 py-1 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
          <Award className="h-3.5 w-3.5" />
          <span>Learner Profile</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Your Learning Trajectory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          All progress data is stored locally in your browser’s localStorage. No login or tracking
          cookies required.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          {message}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </span>
                <div className={`rounded-xl p-2 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {stat.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mascot Cheer & Level Status */}
      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 sm:p-8 dark:border-orange-950 dark:bg-slate-900/60">
        <FerrisIcon size={96} className="shrink-0 drop-shadow-md" />
        <div className="space-y-2 text-center sm:text-left flex-1">
          <span className="rounded-full bg-[#CE412B] px-2.5 py-0.5 text-xs font-bold text-white">
            Level 1: Novice Crab
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Ready to tackle your first ownership move?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
            You are just getting started on your Rust journey. Complete lessons in the curriculum to
            unlock new Ferris outfits and level up your Rustacean rank.
          </p>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Data Management & Privacy
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          This application operates completely offline and client-side. If you wish to start from
          scratch, you can wipe your local records at any time.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={exportProgress}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span>Export Progress</span>
          </button>
          <button
            type="button"
            onClick={resetProgress}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 dark:hover:bg-red-900/40 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset Local Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
