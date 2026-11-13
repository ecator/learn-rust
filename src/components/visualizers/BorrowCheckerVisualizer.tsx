import React, { useState, useEffect } from 'react';
import { VisualizerProps } from './types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Bug } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';

export const BorrowCheckerVisualizer: React.FC<VisualizerProps> = ({
  initialStep = 0,
  autoPlay = false,
  onComplete,
  className = '',
}) => {
  const { language } = useI18n();
  const [step, setStep] = useState(initialStep);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [simulateError, setSimulateError] = useState(true);
  const [mobileTab, setMobileTab] = useState<'code' | 'timeline'>('code');
  const stepsCount = 4;

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= stepsCount - 1) {
      setIsPlaying(false);
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, step, onComplete]);

  const handleNext = () => {
    if (step < stepsCount - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
  };

  // Determine Ferris mascot mood
  let ferrisMood: FerrisMood = 'safety';
  if (step === 2 && simulateError) {
    ferrisMood = 'panic';
  } else if (step === 1) {
    ferrisMood = 'detective';
  } else if (step === 3) {
    ferrisMood = 'safety';
  } else {
    ferrisMood = 'happy';
  }

  // Tri-lingual explanations
  const stepExplanations = [
    {
      zh: '声明可变变量 let mut x = 42; 此时所有者拥有唯一的读写权限，尚未产生任何借用。',
      en: 'Declares mutable binding let mut x = 42; owner possesses full read/write rights with zero active borrows.',
      ja: '可変変数 let mut x = 42; を宣言。所有者が排他的な読み書き権限を持ち、借用はまだありません。',
    },
    {
      zh: '创建不可变借用 r1 和 r2 (&x)。Rust 允许多个共享引用并发存在，读取内存是完全并发安全的。',
      en: 'Creates immutable borrows r1 and r2 (&x). Rust permits unlimited concurrent shared readers without data races.',
      ja: '不変借用 r1, r2 (&x) を作成。Rust では複数の不変借用が同時に存在でき、データ競合を防ぎます。',
    },
    {
      zh: simulateError
        ? '尝试创建可变借用 let m = &mut x; 与现存共享借用冲突，Rust 编译器触发 E0502 借用规则冲突！'
        : '通过独立作用域限制共享引用范围，r1/r2 结束后再进行可变借用，完全符合借用检查器规则。',
      en: simulateError
        ? "Attempting mutable borrow 'let m = &mut x;' triggers error[E0502]: cannot borrow as mutable while borrowed as immutable."
        : 'Using scoped lifetimes ensures immutable borrows expire cleanly before acquiring mutable lease.',
      ja: simulateError
        ? '可変借用 let m = &mut x; を試行すると、error[E0502] が発生し、不変借用との競合が阻止されます。'
        : 'スコープを分離することで、不変借用の失効後に安全に可変借用を取得できます。',
    },
    {
      zh: '非词法作用域生命周期（NLL）：r1/r2 在最后一次使用后提前失效，独占可变租约 m 顺利授予并安全打印。',
      en: 'Non-Lexical Lifetimes (NLL): r1 and r2 expired after their last use; mutable lease granted cleanly.',
      ja: '非語彙的ライフタイム (NLL)：最後の使用をもって r1/r2 が終了し、可変借用 m が安全に付与されます。',
    },
  ];

  const currentExplanation =
    stepExplanations[step]?.[language] || stepExplanations[step]?.en || stepExplanations[step]?.zh;

  return (
    <div
      data-testid="borrow-checker-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      {/* Header with Title, Step and Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={ferrisMood} size="sm" className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? '借用检查器与生命周期'
                : language === 'ja'
                ? '借用チェッカーとライフタイム'
                : 'Borrow Checker & Lifetimes Visualizer'}
            </h3>
            <span className="text-xs text-slate-500" data-testid="current-step">
              {language === 'zh'
                ? `步骤 ${step + 1} / ${stepsCount} (Step ${step + 1} of ${stepsCount})`
                : language === 'ja'
                ? `ステップ ${step + 1} / ${stepsCount} (Step ${step + 1} of ${stepsCount})`
                : `Step ${step + 1} of ${stepsCount}`}
            </span>
          </div>
        </div>

        {/* Action Controls & Error Toggle */}
        <div className="flex items-center gap-2">
          {/* Error Simulator Toggle */}
          <button
            type="button"
            onClick={() => setSimulateError((prev) => !prev)}
            aria-label="Toggle Error Simulation"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              simulateError
                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            {simulateError ? <Bug className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            <span>
              {simulateError
                ? language === 'zh'
                  ? '模拟 rustc 报错 (Simulate Error)'
                  : language === 'ja'
                  ? 'rustc エラー再現'
                  : 'Simulate rustc error'
                : language === 'zh'
                ? '安全借用模式 (Valid Borrow)'
                : language === 'ja'
                ? '安全な借用'
                : 'Valid Code (Scoped)'}
            </span>
          </button>

          {/* Scrubber Buttons */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={step === 0}
            aria-label="Previous Step"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={step === stepsCount - 1}
            aria-label="Next Step"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset"
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Step Explanation Banner */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300 flex items-start gap-2">
        <span className="font-bold text-[#CE412B] shrink-0">
          {language === 'zh' ? '借用分析:' : language === 'ja' ? '借用分析:' : 'Analysis:'}
        </span>
        <span>{currentExplanation}</span>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'code'}
          onClick={() => setMobileTab('code')}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
            mobileTab === 'code' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {language === 'zh' ? '代码视窗 (Code)' : language === 'ja' ? 'コード (Code)' : 'Code View'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'timeline'}
          onClick={() => setMobileTab('timeline')}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
            mobileTab === 'timeline' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {language === 'zh' ? '生命周期 (Leases)' : language === 'ja' ? 'ライフタイム (Leases)' : 'Leases Timeline'}
        </button>
      </div>

      {/* Code Display */}
      <div className={`${mobileTab === 'code' ? 'block' : 'hidden md:block'}`}>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 space-y-1">
          <div className={step === 0 ? 'bg-[#CE412B]/30 px-2 py-0.5 rounded text-white font-bold' : 'px-2 py-0.5'}>
            1: let mut x = 42;
          </div>
          <div className={step === 1 ? 'bg-[#CE412B]/30 px-2 py-0.5 rounded text-white font-bold' : 'px-2 py-0.5'}>
            2: let r1 = &amp;x; let r2 = &amp;x; // multiple immutable borrows allowed
          </div>
          <div className={step === 2 ? (simulateError ? 'bg-red-500/30 px-2 py-0.5 rounded text-red-200 font-bold' : 'bg-emerald-500/30 px-2 py-0.5 rounded text-emerald-200 font-bold') : 'px-2 py-0.5'}>
            {simulateError
              ? '3: let m = &mut x; // conflict! cannot borrow as mutable while borrowed as immutable'
              : '3: { let r1 = &x; } let m = &mut x; // scoped lease allows safe mut borrow'}
          </div>
          <div className={step === 3 ? 'bg-emerald-500/30 px-2 py-0.5 rounded text-emerald-200 font-bold' : 'px-2 py-0.5'}>
            4: println!("&#123;&#125;", m); // NLL: r1/r2 expired, m succeeds
          </div>
        </div>

        {/* Compiler error or success banner */}
        {step === 2 && simulateError && (
          <div
            role="alert"
            data-testid="compiler-error"
            aria-live="polite"
            className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span>error[E0502]: cannot borrow 'x' as mutable because it is also borrowed as immutable</span>
          </div>
        )}

        {step === 2 && !simulateError && (
          <div
            role="status"
            className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>
              {language === 'zh'
                ? '共享引用已在上一行结束生命周期，独占可变借用合法建立。'
                : language === 'ja'
                ? '不変借用が終了しているため、安全に可変借用を取得できます。'
                : 'Immutable leases expired before mutable borrow; no aliasing conflict.'}
            </span>
          </div>
        )}

        {step === 3 && (
          <div
            role="status"
            className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Non-Lexical Lifetimes (NLL): r1 and r2 expired after their last use; mutable lease granted cleanly.</span>
          </div>
        )}
      </div>

      {/* Leases Timeline Gantt */}
      <div className={`${mobileTab === 'timeline' ? 'block' : 'hidden md:block'}`}>
        <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Reference Leases Timeline
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {language === 'zh' ? '只读共享 vs 独占可变' : language === 'ja' ? '共有 vs 排他' : 'Shared vs Exclusive'}
            </span>
          </div>

          <div className="space-y-3">
            {/* r1 Lease */}
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono text-xs font-semibold">r1: &amp;T</span>
              <div className="h-6 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                {(step === 1 || (step === 2 && simulateError)) && (
                  <div
                    className={`h-full transition-all ${
                      step === 2 && simulateError ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: '80%' }}
                  />
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {step === 1 ? 'Active Lease (&T)' : step === 2 && simulateError ? 'In Conflict' : 'Inactive'}
              </span>
            </div>

            {/* r2 Lease */}
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono text-xs font-semibold">r2: &amp;T</span>
              <div className="h-6 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                {(step === 1 || (step === 2 && simulateError)) && (
                  <div
                    className={`h-full transition-all ${
                      step === 2 && simulateError ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: '80%' }}
                  />
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {step === 1 ? 'Active Lease (&T)' : step === 2 && simulateError ? 'In Conflict' : 'Inactive'}
              </span>
            </div>

            {/* m Lease */}
            <div className="flex items-center gap-3">
              <span className="w-16 font-mono text-xs font-semibold">m: &amp;mut T</span>
              <div className="h-6 flex-1 rounded-full bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
                {step === 2 && simulateError ? (
                  <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }} />
                ) : (step === 2 && !simulateError) || step === 3 ? (
                  <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                ) : null}
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {step === 2 && simulateError ? 'Blocked' : step === 3 || (step === 2 && !simulateError) ? 'Active Lease (&mut T)' : 'Unallocated'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BorrowCheckerVisualizer;
