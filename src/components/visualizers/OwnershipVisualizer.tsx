import React, { useState, useEffect } from 'react';
import { VisualizerProps } from './types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Bug } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';

export const OwnershipVisualizer: React.FC<VisualizerProps> = ({
  initialStep = 0,
  autoPlay = false,
  onComplete,
  className = '',
}) => {
  const { language } = useI18n();
  const [step, setStep] = useState(initialStep);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [simulateError, setSimulateError] = useState(true);
  const [mobileTab, setMobileTab] = useState<'code' | 'memory'>('code');

  const stepsCount = 4; // 0, 1, 2, 3

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
  } else if (!simulateError && step === 2) {
    ferrisMood = 'happy';
  } else if (step === 1) {
    ferrisMood = 'safety';
  } else if (step === 3) {
    ferrisMood = 'confused';
  }

  // Tri-lingual explanations
  const stepExplanations = [
    {
      zh: '创建 String 变量 s1，在栈上分配指针、长度与容量，并在堆上分配字符数据。',
      en: 'Creates String variable s1 on the stack (ptr, len, cap) pointing to "hello" on the heap.',
      ja: 'String 型変数 s1 を作成し、スタック（ptr, len, cap）からヒープ領域のデータを指します。',
    },
    {
      zh: '执行 let s2 = s1; 发生所有权转移（Move），s1 立即失效，s2 成为堆数据的唯一合法拥有者。',
      en: 'let s2 = s1 moves ownership from s1 to s2. Stack metadata is copied and s1 is invalidated.',
      ja: 'let s2 = s1; により所有権が移動（Move）し、s1 は無効化され、s2 が新たな所有者となります。',
    },
    {
      zh: simulateError
        ? '尝试访问已被移动的变量 s1，Rust 编译器触发 E0382 借用错误，阻止悬垂指针或二次释放。'
        : '使用显式克隆 .clone() 复制堆数据，s1 与 s2 各自拥有独立的堆内存，运行安全。',
      en: simulateError
        ? "Attempting to use moved value 's1' triggers rustc error[E0382] at compile-time."
        : 'Using s1.clone() explicitly duplicates heap buffer, keeping both s1 and s2 valid.',
      ja: simulateError
        ? '移動後の s1 を使用しようとすると、コンパイラエラー error[E0382] が発生します。'
        : '明示的な .clone() によりヒープデータを複製し、s1 と s2 の両方が安全に保持されます。',
    },
    {
      zh: '离开作用域时，自动调用 drop(s2) 释放堆内存，防止内存泄漏。',
      en: 'Leaving the scope automatically invokes drop(s2), safely deallocating heap memory.',
      ja: 'スコープ終了時に drop(s2) が実行され、ヒープメモリが安全に解放されます。',
    },
  ];

  const currentExplanation =
    stepExplanations[step]?.[language] || stepExplanations[step]?.en || stepExplanations[step]?.zh;

  return (
    <div
      data-testid="ownership-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      {/* Header with Title, Step and Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={ferrisMood} size={44} className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? '所有权转移与内存机制'
                : language === 'ja'
                ? '所有権移動とメモリ可視化'
                : 'Ownership & Move Visualizer'}
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
                ? '安全克隆模式 (Valid Clone)'
                : language === 'ja'
                ? '安全なクローン'
                : 'Valid Code (Clone)'}
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
          {language === 'zh' ? '原理解析:' : language === 'ja' ? '解説:' : 'Explanation:'}
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
          aria-selected={mobileTab === 'memory'}
          onClick={() => setMobileTab('memory')}
          className={`flex-1 rounded-md py-1.5 text-xs font-semibold ${
            mobileTab === 'memory' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          {language === 'zh' ? '内存模型 (Memory)' : language === 'ja' ? 'メモリ (Memory)' : 'Memory State'}
        </button>
      </div>

      {/* Code Display */}
      <div className={`${mobileTab === 'code' ? 'block' : 'hidden md:block'}`}>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-xs text-slate-200 space-y-1">
          <div className={step === 0 ? 'bg-[#CE412B]/30 px-2 py-0.5 rounded text-white font-bold' : 'px-2 py-0.5'}>
            1: let s1 = String::from("hello");
          </div>
          <div className={step === 1 ? 'bg-[#CE412B]/30 px-2 py-0.5 rounded text-white font-bold' : 'px-2 py-0.5'}>
            {simulateError ? '2: let s2 = s1; // move occurs here' : '2: let s2 = s1.clone(); // deep heap clone'}
          </div>
          <div className={step === 2 ? (simulateError ? 'bg-red-500/30 px-2 py-0.5 rounded text-red-200 font-bold' : 'bg-emerald-500/30 px-2 py-0.5 rounded text-emerald-200 font-bold') : 'px-2 py-0.5'}>
            {simulateError ? '3: println!("{}", s1); // error: use of moved value' : '3: println!("{}, {}", s1, s2); // both valid!'}
          </div>
          <div className={step === 3 ? 'bg-[#CE412B]/30 px-2 py-0.5 rounded text-white font-bold' : 'px-2 py-0.5'}>
            4: &#125; // drop(s2) executes
          </div>
        </div>

        {/* Error alert simulation */}
        {step === 2 && simulateError && (
          <div
            role="alert"
            data-testid="compiler-error"
            aria-live="polite"
            className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
            <span>error[E0382]: borrow of moved value: 's1'</span>
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
                ? '通过显式克隆，两个变量各自拥有独立所有权，编译完全通过。'
                : language === 'ja'
                ? 'クローンにより独立した所有権を持つため、コンパイル成功！'
                : 'With explicit .clone(), both bindings maintain independent valid ownership.'}
            </span>
          </div>
        )}
      </div>

      {/* Stack & Heap Layout */}
      <div className={`${mobileTab === 'memory' ? 'block' : 'hidden md:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Stack Frame */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Stack Memory
              </span>
              <span className="text-[10px] font-mono text-slate-400">Fixed-size frames</span>
            </div>

            <div className="mt-3 space-y-3">
              {/* s1 */}
              <div
                className={`rounded-lg p-3 border transition-colors ${
                  step >= 1 && simulateError
                    ? 'border-dashed border-slate-300 opacity-50 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50'
                    : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>s1: String</span>
                  {step >= 1 && simulateError ? (
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-600 font-bold">
                      Moved/Invalidated
                    </span>
                  ) : (
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-600 font-bold">
                      Valid
                    </span>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  <div className="rounded bg-slate-100 p-1 text-center dark:bg-slate-700">ptr: 0x1040</div>
                  <div className="rounded bg-slate-100 p-1 text-center dark:bg-slate-700">len: 5</div>
                  <div className="rounded bg-slate-100 p-1 text-center dark:bg-slate-700">cap: 5</div>
                </div>
              </div>

              {/* s2 */}
              {step >= 1 && step < 3 && (
                <div className="rounded-lg p-3 border border-emerald-400 bg-emerald-50/30 dark:border-emerald-600 dark:bg-emerald-950/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    <span>s2: String (Valid Owner)</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="rounded bg-slate-100 p-1 text-center dark:bg-slate-700">
                      ptr: {simulateError ? '0x1040' : '0x1080'}
                    </div>
                    <div className="rounded bg-slate-100 p-1 text-center dark:bg-slate-700">len: 5</div>
                    <div className="rounded bg-slate-100 p-1 text-center dark:bg-slate-700">cap: 5</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Heap Frame */}
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Heap Memory
              </span>
              <span className="text-[10px] font-mono text-slate-400">Dynamic buffers</span>
            </div>

            <div className="mt-3 space-y-3">
              {step < 3 ? (
                <div className="rounded-lg border border-blue-300 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-950/30">
                  <div className="flex items-center justify-between text-xs font-mono text-blue-800 dark:text-blue-300">
                    <span>Address: 0x1040</span>
                    <span>5 bytes</span>
                  </div>
                  <div className="mt-2 flex gap-1 font-mono text-xs">
                    {['h', 'e', 'l', 'l', 'o'].map((ch, idx) => (
                      <div
                        key={idx}
                        className="flex h-8 w-8 items-center justify-center rounded bg-blue-500 text-white font-bold"
                      >
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 dark:border-slate-700">
                  Heap memory deallocated (drop(s2) executed)
                </div>
              )}

              {/* If clone mode, show second heap buffer */}
              {!simulateError && step >= 1 && step < 3 && (
                <div className="rounded-lg border border-emerald-300 bg-emerald-50/50 p-3 dark:border-emerald-700 dark:bg-emerald-950/30">
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-800 dark:text-emerald-300">
                    <span>Address: 0x1080 (Cloned buffer)</span>
                    <span>5 bytes</span>
                  </div>
                  <div className="mt-2 flex gap-1 font-mono text-xs">
                    {['h', 'e', 'l', 'l', 'o'].map((ch, idx) => (
                      <div
                        key={idx}
                        className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white font-bold"
                      >
                        {ch}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnershipVisualizer;
