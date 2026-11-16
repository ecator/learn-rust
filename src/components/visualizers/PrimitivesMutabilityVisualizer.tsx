import React, { useState, useEffect } from 'react';
import { VisualizerProps } from './types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Bug, Lock, Unlock } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';
import { HighlightedRustCode } from '@/components/common/RustCodeBlock';

const STEPS_COUNT = 4;

export const PrimitivesMutabilityVisualizer: React.FC<VisualizerProps> = ({
  initialStep = 0,
  autoPlay = false,
  onComplete,
  className = '',
}) => {
  const { language } = useI18n();
  const [step, setStep] = useState(() => Math.max(0, Math.min(STEPS_COUNT - 1, initialStep)));
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [simulateError, setSimulateError] = useState(true);
  const [mutValue, setMutValue] = useState(42);

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= STEPS_COUNT - 1) {
      setIsPlaying(false);
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => {
      setStep((prev) => prev + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, step, onComplete]);

  const handleNext = () => {
    if (step < STEPS_COUNT - 1) setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setStep(0);
    setMutValue(42);
  };

  let ferrisMood: FerrisMood = 'safety';
  if (step === 0 && simulateError) {
    ferrisMood = 'panic';
  } else if (step === 1) {
    ferrisMood = 'wizard';
  } else if (step === 3) {
    ferrisMood = 'happy';
  }

  const stepTabs = [
    {
      zh: '1. let vs let mut',
      en: '1. let vs let mut',
      ja: '1. let vs let mut',
    },
    {
      zh: '2. 变量遮蔽 (Shadowing)',
      en: '2. Shadowing',
      ja: '2. シャドーイング',
    },
    {
      zh: '3. 标量栈布局',
      en: '3. Scalar Types',
      ja: '3. スカラー型',
    },
    {
      zh: '4. 定长数组与 Copy',
      en: '4. Array & Copy',
      ja: '4. 配列と Copy',
    },
  ];

  const stepExplanations = [
    {
      zh: simulateError
        ? '默认绑定 `let x = 5` 是只读的；尝试 `x = 10` 会在编译期触发 E0384，防止意外篡改状态。'
        : '使用 `let mut count = 42` 显式声明可变绑定后，可在同一栈地址原地修改数值。',
      en: simulateError
        ? '`let x = 5` is immutable by default; attempting `x = 10` triggers compile-time error[E0384].'
        : '`let mut count = 42` explicitly grants write access to mutate the stack slot in-place.',
      ja: simulateError
        ? '`let x = 5` はデフォルトで不変のため、`x = 10` はコンパイル時に error[E0384] となります。'
        : '`let mut count = 42` と明示することで、同じスタック領域の値をインプレースで更新できます。',
    },
    {
      zh: '变量遮蔽（Shadowing）通过再次 `let` 创建全新栈绑定，可在无需 `mut` 的前提下安全转换类型（&str → i32）。',
      en: 'Shadowing re-declares `let raw` on the stack, allowing a safe type change (&str → i32) while keeping immutability.',
      ja: 'シャドーイングは新しい `let` 束縛を作成し、`mut` なしで型変換（&str → i32）と不変性を両立します。',
    },
    {
      zh: '所有标量类型在编译期大小固定（Sized），直接紧致地存放在高速调用栈上：`char` 为 4 字节 Unicode 标量值。',
      en: 'Scalar primitives have compile-time known sizes and live directly on the stack: `char` is a 4-byte Unicode scalar.',
      ja: 'スカラー型はすべてコンパイル時にサイズが確定し、スタック上に直接配置されます（`char` は 4 バイトの Unicode スカラー値）。',
    },
    {
      zh: '标量与定长数组 `[i32; 3]` 实现了 `Copy` trait：赋值 `let copy = nums` 执行按位栈拷贝，两个变量同时保持有效。',
      en: 'Primitives and fixed arrays `[i32; 3]` implement `Copy`: `let copy = nums` copies stack bytes, leaving both valid.',
      ja: '基本型や固定長配列 `[i32; 3]` は `Copy` トレイトを実装しており、代入後も元の変数が有効なまま残ります。',
    },
  ];

  const codeSnippets = [
    simulateError
      ? `fn main() {\n    let x: i32 = 5;\n    x = 10; // error[E0384]!\n}`
      : `fn main() {\n    let mut count: i32 = 42;\n    count = ${mutValue + 1};\n}`,
    `fn main() {\n    let raw: &str = "42";\n    let raw: i32 = 42; // Shadowing\n}`,
    `fn main() {\n    let a: i32 = -7;     // 4B\n    let b: f64 = 3.14;   // 8B\n    let ok: bool = true; // 1B\n    let c: char = '🦀';  // 4B\n}`,
    `fn main() {\n    let nums: [i32; 3] = [10, 20, 30];\n    let copy = nums; // Bitwise Copy\n}`,
  ];

  const activeHighlightLines = step === 0 ? [2, 3] : step === 1 ? [2, 3] : step === 2 ? [2, 3, 4, 5] : [2, 3];

  const currentExplanation =
    stepExplanations[step]?.[language] || stepExplanations[step]?.en || stepExplanations[step]?.zh;

  return (
    <div
      data-testid="primitives-mutability-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={ferrisMood} size={44} className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? '基本类型、可变性与栈内存绑定'
                : language === 'ja'
                ? '基本型・可変性とスタック束縛'
                : 'Primitives, Mutability & Stack Bindings'}
            </h3>
            <span className="text-xs text-slate-500" data-testid="current-step">
              {language === 'zh'
                ? `步骤 ${step + 1} / ${STEPS_COUNT} (Step ${step + 1} of ${STEPS_COUNT})`
                : language === 'ja'
                ? `ステップ ${step + 1} / ${STEPS_COUNT} (Step ${step + 1} of ${STEPS_COUNT})`
                : `Step ${step + 1} of ${STEPS_COUNT}`}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
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
                  ? '不可变赋值报错 (Simulate Error)'
                  : language === 'ja'
                  ? '不変再代入エラー再現'
                  : 'Simulate E0384 error'
                : language === 'zh'
                ? '显式可变模式 (let mut)'
                : language === 'ja'
                ? '明示的可変モード (let mut)'
                : 'Valid Mutability (let mut)'}
            </span>
          </button>

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
            disabled={step === STEPS_COUNT - 1}
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

      {/* Step Selector Tabs */}
      <div className="flex flex-wrap gap-1.5" role="tablist">
        {stepTabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={step === idx}
            onClick={() => {
              setIsPlaying(false);
              setStep(idx);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              step === idx
                ? 'bg-[#CE412B] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {tab[language] || tab.en}
          </button>
        ))}
      </div>

      {/* Explanation Banner */}
      <div className="rounded-xl bg-slate-50 p-3.5 text-xs sm:text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60">
        {currentExplanation}
      </div>

      {/* Compiler Error Banner */}
      {step === 0 && simulateError && (
        <div
          role="alert"
          data-testid="compiler-error"
          aria-live="polite"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-mono"
        >
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>error[E0384]: cannot assign twice to immutable variable `x`</span>
        </div>
      )}

      {/* Main Split View: Code vs Stack Memory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Code Panel */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-100 dark:border-slate-800 overflow-x-auto space-y-1">
          {codeSnippets[step].split('\n').map((line, idx) => {
            const isHighlighted = activeHighlightLines.includes(idx + 1);
            return (
              <div
                key={idx}
                className={`px-2 py-0.5 rounded whitespace-pre ${
                  isHighlighted ? 'bg-[#CE412B]/20 border-l-2 border-[#CE412B]' : ''
                }`}
              >
                <HighlightedRustCode code={line} />
              </div>
            );
          })}
        </div>

        {/* Stack Memory Panel */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'zh'
                ? '栈帧内存状态 (Stack Frame)'
                : language === 'ja'
                ? 'スタックフレーム状態 (Stack Frame)'
                : 'Stack Frame Memory'}
            </span>
            {step === 0 && !simulateError && (
              <button
                type="button"
                onClick={() => setMutValue((v) => v + 1)}
                className="rounded-lg bg-[#CE412B] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#B33621] transition-colors"
              >
                {language === 'zh' ? '原地 +1 (Mutate)' : language === 'ja' ? '値を +1 (Mutate)' : 'Mutate +1'}
              </button>
            )}
          </div>

          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs" data-testid="mutability-stack-view">
              {simulateError ? (
                <div className="sm:col-span-2 rounded-xl border-2 border-red-400/70 bg-red-50/70 p-4 dark:bg-red-950/20 dark:border-red-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      x: i32
                    </span>
                    <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 dark:bg-red-900/50 dark:text-red-300">
                      IMMUTABLE (E0384)
                    </span>
                  </div>
                  <div className="rounded bg-white dark:bg-slate-900 p-2.5 text-center border border-slate-200 dark:border-slate-700">
                    addr: 0x7ffd_00 | val: <span className="font-bold text-[#CE412B]">5</span> (4 bytes)
                  </div>
                </div>
              ) : (
                <div className="sm:col-span-2 rounded-xl border-2 border-emerald-400/70 bg-emerald-50/70 p-4 dark:bg-emerald-950/20 dark:border-emerald-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                      mut count: i32
                    </span>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                      MUTABLE (IN-PLACE)
                    </span>
                  </div>
                  <div className="rounded bg-white dark:bg-slate-900 p-2.5 text-center border border-slate-200 dark:border-slate-700">
                    addr: 0x7ffd_04 | val: <span className="font-bold text-emerald-600">{mutValue}</span> (4 bytes)
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2.5 font-mono text-xs" data-testid="shadowing-stack-view">
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-100/80 p-3 opacity-60 dark:border-slate-700 dark:bg-slate-900/50 flex items-center justify-between">
                <span>raw: &amp;str = &quot;42&quot; (16 bytes)</span>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  SHADOWED
                </span>
              </div>
              <div className="rounded-xl border-2 border-[#CE412B]/60 bg-orange-50/60 p-3 dark:border-[#CE412B]/50 dark:bg-orange-950/20 flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">raw: i32 = 42 (4 bytes)</span>
                <span className="rounded bg-[#CE412B] px-2 py-0.5 text-[10px] font-bold text-white">
                  ACTIVE BINDING
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs" data-testid="scalar-stack-view">
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[10px] text-slate-400">i32 (4 bytes)</div>
                <div className="mt-1 font-bold text-blue-600">-7</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[10px] text-slate-400">f64 (8 bytes)</div>
                <div className="mt-1 font-bold text-emerald-600">3.14</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[10px] text-slate-400">bool (1 byte)</div>
                <div className="mt-1 font-bold text-purple-600">true</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                <div className="text-[10px] text-slate-400">char (4 bytes)</div>
                <div className="mt-1 font-bold text-[#CE412B]">&apos;🦀&apos;</div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 font-mono text-xs" data-testid="copy-array-stack-view">
              <div className="rounded-xl border border-emerald-500/40 bg-white p-3 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">nums: [i32; 3] (12 bytes)</span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    VALID (Copy)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[10, 20, 30].map((n, i) => (
                    <div key={i} className="rounded bg-slate-100 p-1.5 dark:bg-slate-800">
                      [{i}]: {n}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-blue-500/40 bg-white p-3 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">copy: [i32; 3] (12 bytes)</span>
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    VALID (Bitwise Copy)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[10, 20, 30].map((n, i) => (
                    <div key={i} className="rounded bg-blue-50 p-1.5 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      [{i}]: {n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrimitivesMutabilityVisualizer;
