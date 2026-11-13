import React from 'react';
import { Link } from 'react-router-dom';
import { FerrisIcon } from '@/components/FerrisIcon';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-[#CE412B]/20 blur-2xl" />
        <FerrisIcon size={120} className="relative drop-shadow-lg" />
      </div>

      <span className="rounded-full bg-[#CE412B]/10 px-3 py-1 text-xs font-bold text-[#CE412B] dark:bg-[#CE412B]/20 mb-3">
        Error 404: Dangling Pointer
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
        Oops! Page Has Gone Out of Scope
      </h1>

      <p className="mt-3 max-w-md text-sm text-slate-600 dark:text-slate-400">
        Ferris searched the entire stack and heap, but this memory address does not exist or has
        already been dropped by the borrow checker.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#CE412B] px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B33621] transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Return to Safety (Home)</span>
        </Link>
        <Link
          to="/curriculum"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Browse Curriculum</span>
        </Link>
      </div>
    </div>
  );
};
