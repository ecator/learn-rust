import React, { useState, useEffect } from 'react';
import { VisualizerProps } from './types';
import { RotateCcw, Play, Pause, ChevronLeft, ChevronRight, Bug, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';

const MEMORY_TABS = ['string_str', 'slice', 'vec', 'padding', 'zst'] as const;
export type MemoryLayoutTab = (typeof MEMORY_TABS)[number];

interface MemoryLayoutVisualizerProps extends VisualizerProps {
  initialTab?: MemoryLayoutTab;
}

export const MemoryLayoutVisualizer: React.FC<MemoryLayoutVisualizerProps> = ({
  initialStep = 0,
  initialTab,
  autoPlay = false,
  onComplete,
  className = '',
}) => {
  const { language } = useI18n();
  const tabs = MEMORY_TABS;
  const resolvedInitialStep = initialTab
    ? MEMORY_TABS.indexOf(initialTab)
    : Math.max(0, Math.min(MEMORY_TABS.length - 1, initialStep));
  const [activeTab, setActiveTab] = useState<MemoryLayoutTab>(tabs[resolvedInitialStep]);
  const [vecCap, setVecCap] = useState(4);
  const [vecLen, setVecLen] = useState(2);
  const [step, setStep] = useState(resolvedInitialStep);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [simulateError, setSimulateError] = useState(false);

  useEffect(() => {
    if (!isPlaying) return;
    if (step >= tabs.length - 1) {
      setIsPlaying(false);
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => {
      setStep((prev) => {
        const next = prev + 1;
        setActiveTab(tabs[next]);
        return next;
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [isPlaying, step, onComplete]);

  const handleNext = () => {
    if (step < tabs.length - 1) {
      const next = step + 1;
      setStep(next);
      setActiveTab(tabs[next]);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      const prev = step - 1;
      setStep(prev);
      setActiveTab(tabs[prev]);
    }
  };

  const handleTabSelect = (tab: MemoryLayoutTab) => {
    setActiveTab(tab);
    setStep(tabs.indexOf(tab));
  };

  const triggerVecPush = () => {
    if (vecLen + 1 > vecCap) {
      setVecCap(vecCap * 2);
    }
    setVecLen((prev) => prev + 1);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setVecCap(4);
    setVecLen(2);
    setStep(resolvedInitialStep);
    setActiveTab(tabs[resolvedInitialStep]);
    setSimulateError(false);
  };

  // Determine mascot mood
  let ferrisMood: FerrisMood = 'wizard';
  if (simulateError) {
    ferrisMood = 'panic';
  } else if (activeTab === 'slice' || activeTab === 'vec') {
    ferrisMood = 'speed';
  } else if (activeTab === 'padding') {
    ferrisMood = 'detective';
  }

  return (
    <div
      data-testid="memory-layout-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={ferrisMood} size={44} className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? '内存布局与切片机制'
                : language === 'ja'
                ? 'メモリレイアウトとスライス'
                : 'Memory Layout & Slice Visualizer'}
            </h3>
            <span className="text-xs text-slate-500" data-testid="current-step">
              {language === 'zh'
                ? `模式 ${step + 1} / ${tabs.length} (Step ${step + 1} of ${tabs.length})`
                : language === 'ja'
                ? `モード ${step + 1} / ${tabs.length} (Step ${step + 1} of ${tabs.length})`
                : `Step ${step + 1} of ${tabs.length}`}
            </span>
          </div>
        </div>

        {/* Scrubber & Controls */}
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
                  ? '越界错误模拟 (Simulate Error)'
                  : language === 'ja'
                  ? '境界外エラー再現'
                  : 'Simulate rustc error'
                : language === 'zh'
                ? '内存安全 (Safe Layout)'
                : language === 'ja'
                ? '安全レイアウト'
                : 'Safe Layout'}
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
            disabled={step === tabs.length - 1}
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

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap gap-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'string_str'}
          onClick={() => handleTabSelect('string_str')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'string_str'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          String vs &amp;str
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'slice'}
          onClick={() => handleTabSelect('slice')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'slice'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? '切片 Slice (&s[1..4])'
            : language === 'ja'
            ? 'スライス Slice (&s[1..4])'
            : 'Slice (&s[1..4])'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'vec'}
          onClick={() => handleTabSelect('vec')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'vec'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? 'Vec 扩容重分配 (Vec Reallocation)'
            : language === 'ja'
            ? 'Vec 再割り当て (Vec Reallocation)'
            : 'Vec Reallocation'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'padding'}
          onClick={() => handleTabSelect('padding')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'padding'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? '结构体对齐填充 (Struct Padding)'
            : language === 'ja'
            ? '構造体パディング (Struct Padding)'
            : 'Struct Padding'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'zst'}
          onClick={() => handleTabSelect('zst')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            activeTab === 'zst'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? '零大小类型 Zero-Sized Type (ZST)'
            : language === 'ja'
            ? 'ゼロサイズ型 Zero-Sized Type (ZST)'
            : 'Zero-Sized Type (ZST)'}
        </button>
      </div>

      {/* Compiler / Runtime error simulation banner */}
      {simulateError && (
        <div
          role="alert"
          data-testid="compiler-error"
          aria-live="polite"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>
            {language === 'zh'
              ? 'panic: 索引越界！切片长度为 5，但访问索引为 8 (panicked at index out of bounds: the len is 5 but the index is 8)'
              : language === 'ja'
              ? 'panic: 範囲外アクセス！長さ 5 に対してインデックス 8 を参照しました (panicked at index out of bounds)'
              : 'panicked at index out of bounds: the len is 5 but the index is 8'}
          </span>
        </div>
      )}

      {/* Tab Panels */}
      {activeTab === 'string_str' && (
        <div data-testid="layout-string-str" className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'zh' ? (
              <>
                <code>String</code> 是一个栈上 3 字结构体 — 3-word struct (24 bytes on 64-bit: ptr, cap, len) — 并拥有堆缓冲区所有权；而 <code>&amp;str</code> 是只借用切片数据的双字胖指针（16 bytes: ptr, len）。
              </>
            ) : language === 'ja' ? (
              <>
                <code>String</code> はヒープを所有する 3-word struct (24 bytes on 64-bit: ptr, cap, len) であり、<code>&amp;str</code> は借用スライスを指す 2 ワードのファットポインタ（16 bytes: ptr, len）です。
              </>
            ) : (
              <>
                A <code>String</code> is a 3-word struct (24 bytes on 64-bit: ptr, cap, len) owning heap memory,
                while <code>&amp;str</code> is a 2-word fat pointer (16 bytes: ptr, len) referencing a borrowed slice.
              </>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'zh'
                  ? 'String (3 Words: 24 bytes / 栈上 3 字)'
                  : language === 'ja'
                  ? 'String (3 Words: 24 bytes / 3ワード)'
                  : 'String (3 Words: 24 bytes)'}
              </h4>
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
                <div className="rounded bg-slate-100 p-2 text-center dark:bg-slate-800">ptr: 0x2000</div>
                <div className="rounded bg-slate-100 p-2 text-center dark:bg-slate-800">cap: 8</div>
                <div className="rounded bg-slate-100 p-2 text-center dark:bg-slate-800">len: 5</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'zh'
                  ? '&str Fat Pointer (2 Words: 16 bytes / 胖指针)'
                  : language === 'ja'
                  ? '&str Fat Pointer (2 Words: 16 bytes / ファットポインタ)'
                  : '&str Fat Pointer (2 Words: 16 bytes)'}
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="rounded bg-slate-100 p-2 text-center dark:bg-slate-800">ptr: 0x2000</div>
                <div className="rounded bg-slate-100 p-2 text-center dark:bg-slate-800">len: 5</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'slice' && (
        <div data-testid="layout-slice" className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'zh' ? (
              <>切片 <code>&amp;s[1..4]</code> 无需拷贝底层字符串，仅将指针向后移动 1 字节并设置长度 len = 3。</>
            ) : language === 'ja' ? (
              <>スライス <code>&amp;s[1..4]</code> はヒープを複製せず、ポインタを 1 バイトだけ進めて長さ 3 を指します。</>
            ) : (
              <>Slice <code>&amp;s[1..4]</code> offsets pointer by +1 byte and sets length to 3 bytes.</>
            )}
          </p>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3">
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="rounded bg-slate-100 p-2 text-center dark:bg-slate-800">ptr: 0x2001 (+1 offset)</div>
              <div className="rounded bg-slate-100 p-2 text-center dark:bg-slate-800">len: 3</div>
            </div>
            <div className="flex gap-1 font-mono text-xs">
              {['H', 'e', 'l', 'l', 'o'].map((ch, idx) => (
                <div
                  key={idx}
                  className={`flex h-8 w-8 items-center justify-center rounded font-bold ${
                    idx >= 1 && idx <= 3
                      ? 'bg-[#CE412B] text-white ring-2 ring-orange-400'
                      : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                  }`}
                >
                  {ch}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vec' && (
        <div data-testid="layout-vec" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'zh'
                ? '当元素长度超出容量 cap 时，Vec 会按倍增策略重新申请更大的堆内存块并搬移数据。'
                : language === 'ja'
                ? '長さが容量 (cap) を超えると、Vec は通常 2 倍の新しいヒープ領域を再割り当てします。'
                : 'When length exceeds capacity, vector reallocates to double capacity.'}
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={triggerVecPush}
                className="rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B33621]"
              >
                {language === 'zh'
                  ? '压入元素 Push Item (vec.push)'
                  : language === 'ja'
                  ? '要素追加 Push Item (vec.push)'
                  : 'Push Item (vec.push)'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                aria-label="Reset"
                className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="rounded-xl border p-4 text-center dark:border-slate-800">
              {language === 'zh' ? '当前长度 Length' : language === 'ja' ? '長さ Length' : 'Length'}:{' '}
              <span className="font-bold text-[#CE412B]">{vecLen}</span>
            </div>
            <div className="rounded-xl border p-4 text-center dark:border-slate-800">
              {language === 'zh' ? '分配容量 Capacity' : language === 'ja' ? '容量 Capacity' : 'Capacity'}:{' '}
              <span className="font-bold text-blue-600">{vecCap}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'padding' && (
        <div data-testid="layout-padding" className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'zh' ? (
              <>
                <code>struct Foo &#123; a: u8, b: u64, c: u16 &#125;</code> 按最大字段 8 字节对齐：1 字节 (a) + 7-byte padding + 8 字节 (b) + 2 字节 (c) + 6-byte padding = 24 bytes。
              </>
            ) : language === 'ja' ? (
              <>
                <code>struct Foo &#123; a: u8, b: u64, c: u16 &#125;</code> は 8 バイト境界に整列され、1B (a) + 7-byte padding + 8B (b) + 2B (c) + 6-byte padding = 合計 24 バイトになります。
              </>
            ) : (
              <>
                <code>struct Foo &#123; a: u8, b: u64, c: u16 &#125;</code> requires 8-byte alignment, producing
                1-byte (a) + 7-byte padding + 8-byte (b) + 2-byte (c) + 6-byte tail padding = 24 bytes total.
              </>
            )}
          </p>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="grid grid-cols-8 gap-1 font-mono text-[11px] text-center">
              <div className="bg-blue-500 text-white rounded p-1">a (u8)</div>
              <div className="bg-slate-300 dark:bg-slate-700 col-span-7 rounded p-1 text-slate-600 dark:text-slate-400">
                7-byte padding
              </div>
              <div className="bg-emerald-500 text-white col-span-8 rounded p-1">b (u64 - 8 bytes)</div>
              <div className="bg-amber-500 text-white col-span-2 rounded p-1">c (u16)</div>
              <div className="bg-slate-300 dark:bg-slate-700 col-span-6 rounded p-1 text-slate-600 dark:text-slate-400">
                6-byte padding
              </div>
            </div>
            <div className="mt-2 text-right text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
              Total Size: 24 bytes (align: 8)
            </div>
          </div>
        </div>
      )}

      {activeTab === 'zst' && (
        <div data-testid="layout-zst" className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'zh' ? (
              <>
                类似单元类型 <code>()</code> 或空标记结构体 <code>struct Unit;</code> 的零大小类型占用 0 bytes 且无需堆内存分配 (require no heap allocation)。
              </>
            ) : language === 'ja' ? (
              <>
                <code>()</code> や <code>struct Unit;</code> のようなゼロサイズ型はメモリを 0 bytes しか消費せず、ヒープ割り当て不要 (require no heap allocation) です。
              </>
            ) : (
              <>
                Zero-Sized Types like <code>()</code> or <code>struct Unit;</code> take 0 bytes of memory and require no heap allocation.
              </>
            )}
          </p>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 grid grid-cols-2 gap-4 font-mono text-xs text-center">
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              Size of <code>()</code>: <span className="font-bold text-emerald-600">0 bytes</span>
            </div>
            <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
              Alignment of <code>()</code>: <span className="font-bold text-blue-600">1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryLayoutVisualizer;
