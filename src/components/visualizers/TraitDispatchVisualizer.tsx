import React, { useState } from 'react';
import { VisualizerProps } from './types';
import { AlertTriangle, ShieldCheck, Bug } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';

export const TraitDispatchVisualizer: React.FC<VisualizerProps> = ({ className = '' }) => {
  const { language } = useI18n();
  const [mode, setMode] = useState<'static' | 'dynamic' | 'tradeoffs' | 'object_safety'>('static');
  const [vtableStep, setVtableStep] = useState(0);
  const [hasSelfReturn, setHasSelfReturn] = useState(false);

  // Ferris mascot mood
  let ferrisMood: FerrisMood = 'speed';
  if (mode === 'static') {
    ferrisMood = 'speed';
  } else if (mode === 'dynamic') {
    ferrisMood = 'detective';
  } else if (mode === 'object_safety') {
    ferrisMood = hasSelfReturn ? 'panic' : 'safety';
  } else {
    ferrisMood = 'wizard';
  }

  return (
    <div
      data-testid="trait-dispatch-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={ferrisMood} size="sm" className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? 'Trait 分发与虚表机制'
                : language === 'ja'
                ? 'Trait ディスパッチと vtable'
                : 'Trait Dispatch Visualizer'}
            </h3>
            <span className="text-xs text-slate-500">
              {language === 'zh'
                ? '静态单态化 vs 动态虚表分发'
                : language === 'ja'
                ? '静的単態化 vs 動的 vtable ディスパッチ'
                : 'Static Monomorphization vs Dynamic Vtable'}
            </span>
          </div>
        </div>

        {/* Quick Error Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setMode('object_safety');
              setHasSelfReturn((prev) => !prev);
            }}
            aria-label="Toggle Error Simulation"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              hasSelfReturn && mode === 'object_safety'
                ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {hasSelfReturn && mode === 'object_safety' ? (
              <Bug className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span>
              {hasSelfReturn && mode === 'object_safety'
                ? language === 'zh'
                  ? '模拟 E0038 报错中'
                  : language === 'ja'
                  ? 'E0038 エラー発生中'
                  : 'Simulating E0038 Error'
                : language === 'zh'
                ? '模拟 Rustc 报错 (Simulate Rustc Error)'
                : language === 'ja'
                ? 'Rustc エラー再現'
                : 'Simulate Rustc Error'}
            </span>
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex flex-wrap gap-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'static'}
          onClick={() => setMode('static')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'static'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Static Dispatch (impl Trait)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'dynamic'}
          onClick={() => setMode('dynamic')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'dynamic'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Dynamic Dispatch (&amp;dyn Trait)
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'tradeoffs'}
          onClick={() => setMode('tradeoffs')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'tradeoffs'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Cost Trade-offs
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'object_safety'}
          onClick={() => setMode('object_safety')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'object_safety'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Object Safety
        </button>
      </div>

      {/* Static Dispatch Tab */}
      {mode === 'static' && (
        <div data-testid="static-dispatch-view" className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Monomorphization generates specialized functions for each concrete type with direct assembly call targets.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Specialized: draw_circle(&amp;Circle)
              </span>
              <pre className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300">
                call &lt;Circle as Draw&gt;::draw
              </pre>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Specialized: draw_square(&amp;Square)
              </span>
              <pre className="mt-2 font-mono text-xs text-slate-600 dark:text-slate-300">
                call &lt;Square as Draw&gt;::draw
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Dispatch Tab */}
      {mode === 'dynamic' && (
        <div data-testid="dynamic-dispatch-view" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              <code>&amp;dyn Draw</code> is a 16-byte fat pointer consisting of Data Pointer and VTable Pointer.
            </p>
            <button
              type="button"
              onClick={() => setVtableStep((prev) => (prev + 1) % 3)}
              className="rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B33621]"
            >
              Step Execution
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Fat Pointer */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                Fat Pointer (&amp;dyn Draw)
              </span>
              <div
                className={`rounded p-2 border ${
                  vtableStep === 0 ? 'bg-blue-50 border-blue-400 dark:bg-blue-950/40 font-bold' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                Data Pointer: 0x3010 -&gt; Instance Data
              </div>
              <div
                className={`rounded p-2 border ${
                  vtableStep === 1 ? 'bg-amber-50 border-amber-400 dark:bg-amber-950/40 font-bold' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                VTable Pointer: 0x8040 -&gt; Function Table
              </div>
            </div>

            {/* VTable Table */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-sans">
                VTable Structure (0x8040)
              </span>
              <div className="rounded bg-slate-100 p-2 dark:bg-slate-800 text-slate-500">
                offset 0: destructor pointer
              </div>
              <div className="rounded bg-slate-100 p-2 dark:bg-slate-800 text-slate-500">
                offset 8: size (24) &amp; align (8)
              </div>
              <div
                className={`rounded p-2 border ${
                  vtableStep === 2 ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 font-bold text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                offset 16: fn draw() -&gt; Jump to target function address
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade-offs Tab */}
      {mode === 'tradeoffs' && (
        <div data-testid="tradeoffs-view" className="space-y-4">
          <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-800">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">Attribute</th>
                <th className="p-3">Static Dispatch (impl Trait)</th>
                <th className="p-3">Dynamic Dispatch (&amp;dyn Trait)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td className="p-3 font-semibold">Binary Size</td>
                <td className="p-3 text-amber-600">Larger (Code duplication via monomorphization)</td>
                <td className="p-3 text-emerald-600">Smaller (Single shared implementation)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Runtime Indirection</td>
                <td className="p-3 text-emerald-600">Zero cost (direct assembly call / inlining)</td>
                <td className="p-3 text-amber-600">VTable pointer dereference + indirect call</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold">Heterogeneous Collections</td>
                <td className="p-3 text-slate-500">No (homogeneous types only)</td>
                <td className="p-3 text-emerald-600">Yes (Vec&lt;Box&lt;dyn Trait&gt;&gt;)</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Object Safety Tab */}
      {mode === 'object_safety' && (
        <div data-testid="object-safety-view" className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Toggle method returning Self:
            </span>
            <button
              type="button"
              onClick={() => setHasSelfReturn(!hasSelfReturn)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {hasSelfReturn ? 'Has "fn clone(&self) -> Self"' : 'Only object-safe methods'}
            </button>
          </div>

          {hasSelfReturn ? (
            <div
              role="alert"
              data-testid="compiler-error"
              aria-live="polite"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span>error[E0038]: the trait cannot be made into an object</span>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
              Trait is object-safe! Can be used as &amp;dyn Trait.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TraitDispatchVisualizer;
