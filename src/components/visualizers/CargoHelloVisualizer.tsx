import React, { useState, useEffect } from 'react';
import { VisualizerProps } from './types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck, Bug, Terminal, FolderTree, Cpu } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';
import { HighlightedRustCode } from '@/components/common/RustCodeBlock';

const STEPS_COUNT = 4;

export const CargoHelloVisualizer: React.FC<VisualizerProps> = ({
  initialStep = 0,
  autoPlay = false,
  onComplete,
  className = '',
}) => {
  const { language } = useI18n();
  const [step, setStep] = useState(() => Math.max(0, Math.min(STEPS_COUNT - 1, initialStep)));
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [simulateError, setSimulateError] = useState(false);

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
    setSimulateError(false);
  };

  let ferrisMood: FerrisMood = 'happy';
  if (step === 1 && simulateError) {
    ferrisMood = 'panic';
  } else if (step === 2) {
    ferrisMood = 'wizard';
  } else if (step === 3) {
    ferrisMood = 'speed';
  }

  const stepTabs = [
    { zh: '1. cargo new 工程结构', en: '1. cargo new Layout', ja: '1. cargo new 構成' },
    { zh: '2. cargo check 与宏校验', en: '2. cargo check & Macro', ja: '2. cargo check とマクロ' },
    { zh: '3. .rodata 静态字面量', en: '3. .rodata Literal', ja: '3. .rodata 静的リテラル' },
    { zh: '4. Debug vs --release', en: '4. Debug vs --release', ja: '4. Debug vs --release' },
  ];

  const stepExplanations = [
    {
      zh: '`cargo new hello_ferris` 生成标准 Crate 目录：Cargo.toml 描述依赖与 Edition，src/main.rs 包含唯一入口 `fn main()`。',
      en: '`cargo new hello_ferris` scaffolds Cargo.toml manifest and src/main.rs with the `fn main()` entry point.',
      ja: '`cargo new hello_ferris` は Cargo.toml と `fn main()` を持つ src/main.rs を自動生成します。',
    },
    {
      zh: simulateError
        ? '遗漏感叹号写成 `println(...)` 时，`cargo check` 会立即报出 E0423：因为 `println!` 是编译期展开的宏而非普通函数。'
        : '`cargo check` 跳过代码生成直接展开 `println!` 宏并在编译期校验 `{}` 占位符与参数数量匹配。',
      en: simulateError
        ? 'Omitting `!` in `println(...)` triggers `error[E0423]` during `cargo check` because `println!` is a macro, not a function.'
        : '`cargo check` skips codegen, expands `println!`, and verifies `{}` format arguments at compile time.',
      ja: simulateError
        ? '`!` を忘れた `println(...)` は、`cargo check` 時に `error[E0423]` となります（`println!` は関数ではなくマクロです）。'
        : '`cargo check` はコード生成を省き、`println!` マクロの展開と書式引数の整合性を高速に検証します。',
    },
    {
      zh: '`let name = "Rustacean";` 直接编译进二进制只读段 `.rodata`，栈上的 `&\'static str` 仅保存指向该字面量的地址与长度。',
      en: '`let name = "Rustacean";` embeds bytes in read-only binary `.rodata`; stack holds a `&\'static str` pointer + length.',
      ja: '`let name = "Rustacean";` は読み取り専用領域 `.rodata` に埋め込まれ、スタックには参照と長さだけが置かれます。',
    },
    {
      zh: '日常开发使用 `cargo run`（Debug 快速编译 + 溢出检查）；发布时切换 `cargo build --release` 开启 LLVM AOT 极致优化。',
      en: 'Use `cargo run` for fast debug iterations, and `cargo build --release` for LLVM-optimized native AOT binaries.',
      ja: '開発中は高速な `cargo run`、本番配信時は LLVM 最適化が有効な `cargo build --release` を使います。',
    },
  ];

  const codeSnippets = [
    `fn main() {\n    println!("Hello, Ferris! 🦀");\n}`,
    simulateError
      ? `fn main() {\n    println("Hello, Ferris!"); // missing !\n}`
      : `fn main() {\n    println!("Hello, {}!", "Ferris");\n}`,
    `fn main() {\n    let name = "Rustacean";\n    println!("Hi, {}", name);\n}`,
    `$ cargo run\n   Compiling hello_ferris v0.1.0\n$ cargo build --release`,
  ];

  const currentExplanation =
    stepExplanations[step]?.[language] || stepExplanations[step]?.en || stepExplanations[step]?.zh;

  return (
    <div
      data-testid="cargo-hello-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={ferrisMood} size={44} className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? 'Cargo 构建流与 Hello Ferris 入口机制'
                : language === 'ja'
                ? 'Cargo ビルドフローと Hello Ferris'
                : 'Cargo Workflow & Hello Ferris Entry'}
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
                  ? '宏调用缺少 ! (E0423)'
                  : language === 'ja'
                  ? 'マクロ ! 欠落 (E0423)'
                  : 'Simulate E0423 error'
                : language === 'zh'
                ? '正常宏展开 (println!)'
                : language === 'ja'
                ? '正常マクロ展開 (println!)'
                : 'Valid Macro (println!)'}
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

      {/* Step Tabs */}
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

      {/* Explanation */}
      <div className="rounded-xl bg-slate-50 p-3.5 text-xs sm:text-sm text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60">
        {currentExplanation}
      </div>

      {step === 1 && simulateError && (
        <div
          role="alert"
          data-testid="compiler-error"
          aria-live="polite"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-mono"
        >
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>error[E0423]: expected function, found macro `println`</span>
        </div>
      )}

      {/* Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-100 dark:border-slate-800 overflow-x-auto space-y-1">
          {codeSnippets[step].split('\n').map((line, idx) => {
            const isHighlighted = step === 1 ? idx === 1 : idx === 0 || idx === 1;
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

        <div className="lg:col-span-7 rounded-xl border border-slate-200 p-4 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3">
          {step === 0 && (
            <div className="space-y-2 font-mono text-xs" data-testid="cargo-tree-view">
              <div className="flex items-center gap-2 text-slate-500 font-sans font-bold uppercase tracking-wider">
                <FolderTree className="h-4 w-4 text-[#CE412B]" />
                <span>hello_ferris/</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                ├── Cargo.toml <span className="text-slate-400">(edition = &quot;2024&quot;)</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
                ├── Cargo.lock <span className="text-slate-400">(exact dependency lock)</span>
              </div>
              <div className="rounded-lg border border-[#CE412B]/40 bg-orange-50/60 p-2.5 dark:bg-orange-950/20">
                └── src/main.rs <span className="text-[#CE412B] font-semibold">→ fn main()</span>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2.5 font-mono text-xs" data-testid="cargo-check-view">
              <div className="flex items-center gap-2 text-slate-500 font-sans font-bold uppercase tracking-wider">
                <Terminal className="h-4 w-4 text-[#CE412B]" />
                <span>cargo check</span>
              </div>
              <div
                className={`rounded-xl border p-3 ${
                  simulateError
                    ? 'border-red-400 bg-red-50/60 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300'
                    : 'border-emerald-400 bg-emerald-50/60 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'
                }`}
              >
                {simulateError
                  ? 'rustc: help: use `!` to invoke the macro: `println!("Hello, Ferris!");`'
                  : 'Checking hello_ferris v0.1.0 — Finished in 0.12s (0 codegen units)'}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs" data-testid="rodata-view">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2">
                <div className="text-[11px] font-bold text-slate-500">STACK (main frame)</div>
                <div className="rounded bg-slate-100 p-2 dark:bg-slate-800">
                  name: &amp;&apos;static str
                  <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                    ptr: 0x4020 | len: 9
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-amber-500/40 bg-amber-50/50 p-3 dark:border-amber-800 dark:bg-amber-950/20 space-y-2">
                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300">.rodata (Static Read-Only)</div>
                <div className="rounded bg-white p-2 text-center font-bold dark:bg-slate-900 border border-amber-200 dark:border-amber-900">
                  &quot;Rustacean&quot; (9 bytes)
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs" data-testid="cargo-profiles-view">
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">Debug (cargo run)</div>
                <div className="text-[11px] text-slate-500">opt-level = 0 · overflow checks ON</div>
                <div className="text-[11px] text-emerald-600">target/debug/hello_ferris</div>
              </div>
              <div className="rounded-xl border border-[#CE412B]/40 bg-orange-50/50 p-3 dark:bg-orange-950/20 space-y-1.5">
                <div className="font-bold text-[#CE412B] flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>Release (--release)</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300">opt-level = 3 · LLVM AOT Native</div>
                <div className="text-[11px] text-[#CE412B]">target/release/hello_ferris</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CargoHelloVisualizer;
