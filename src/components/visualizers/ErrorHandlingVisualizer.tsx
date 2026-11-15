import React, { useState } from 'react';
import { VisualizerProps } from './types';
import { ArrowRight, AlertTriangle, Bug, ShieldCheck } from 'lucide-react';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';
import { useI18n } from '@/lib/i18n';

export const ErrorHandlingVisualizer: React.FC<VisualizerProps> = ({ className = '' }) => {
  const { language } = useI18n();
  const [tab, setTab] = useState<'railway' | 'option' | 'panic' | 'from_into'>('railway');

  // Railway state
  const [isInputValid, setIsInputValid] = useState(true);
  const [railwayStep, setRailwayStep] = useState(0);

  // Option state
  const [optionValue, setOptionValue] = useState<'some' | 'none'>('some');

  // Panic state
  const [hasPanicked, setHasPanicked] = useState(false);

  // Error simulation toggle
  const [simulateError, setSimulateError] = useState(false);

  // Header Ferris mood - avoid duplicate panic mascot when panic view is active
  let headerMood: FerrisMood = 'safety';
  if (simulateError) {
    headerMood = 'panic';
  } else if (!isInputValid && railwayStep >= 1 && tab === 'railway') {
    headerMood = 'confused';
  } else {
    headerMood = 'safety';
  }

  return (
    <div
      data-testid="error-handling-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={headerMood} size="sm" className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? '错误处理与铁路道岔模型'
                : language === 'ja'
                ? 'エラー処理と鉄道モデル'
                : 'Error Handling & Railway Visualizer'}
            </h3>
            <span className="text-xs text-slate-500">
              {language === 'zh'
                ? 'Result/Option 双轨流、? 运算符短路与 panic! 边界'
                : language === 'ja'
                ? 'Result/Option 2軌道フロー、? 演算子短縮と panic!'
                : 'Result/Option Railway Tracks, ? Operator & Panic Boundaries'}
            </span>
          </div>
        </div>

        {/* Error Simulation Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSimulateError((prev) => !prev)}
            aria-label="Toggle Error Simulation"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              simulateError
                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {simulateError ? <Bug className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
            <span>
              {simulateError
                ? language === 'zh'
                  ? '模拟 Rustc 报错中'
                  : language === 'ja'
                  ? 'Rustc エラー発生中'
                  : 'Simulating Rustc Error'
                : language === 'zh'
                ? '模拟 Rustc 报错 (Simulate Rustc Error)'
                : language === 'ja'
                ? 'Rustc エラー再現'
                : 'Simulate Rustc Error'}
            </span>
          </button>
        </div>
      </div>

      {/* Compiler error simulation banner */}
      {simulateError && (
        <div
          role="alert"
          data-testid="compiler-error"
          aria-live="polite"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>error[E0277]: the `?` operator can only be used in a function that returns `Result` or `Option`</span>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'railway'}
          onClick={() => setTab('railway')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            tab === 'railway'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? 'Result 铁路流 (Result Railway)'
            : language === 'ja'
            ? 'Result レールウェイ (Result Railway)'
            : 'Result Railway'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'option'}
          onClick={() => setTab('option')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            tab === 'option'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? 'Option 组合子 (Option Combinators)'
            : language === 'ja'
            ? 'Option コンビネータ (Option Combinators)'
            : 'Option Combinators'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'panic'}
          onClick={() => setTab('panic')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            tab === 'panic'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? 'Panic 与可恢复错误 (Panic vs Recoverable)'
            : language === 'ja'
            ? 'Panic と回復可能エラー (Panic vs Recoverable)'
            : 'Panic vs Recoverable'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'from_into'}
          onClick={() => setTab('from_into')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            tab === 'from_into'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {language === 'zh'
            ? 'From/Into 自动错误转换 (From/Into Conversion)'
            : language === 'ja'
            ? 'From/Into エラー変換 (From/Into Conversion)'
            : 'From/Into Conversion'}
        </button>
      </div>

      {/* Railway Track View */}
      {tab === 'railway' && (
        <div data-testid="railway-view" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'zh'
                  ? '输入校验状态：'
                  : language === 'ja'
                  ? '入力データの妥当性：'
                  : 'Input string validity:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsInputValid(!isInputValid);
                  setRailwayStep(0);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  isInputValid ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {isInputValid
                  ? language === 'zh'
                    ? '有效输入 (Valid Input)'
                    : language === 'ja'
                    ? '有効入力 (Valid Input)'
                    : 'Valid Input'
                  : language === 'zh'
                  ? '无效输入 (Invalid Input)'
                  : language === 'ja'
                  ? '不正入力 (Invalid Input)'
                  : 'Invalid Input'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setRailwayStep((prev) => (prev + 1) % 4)}
              className="rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B33621]"
            >
              {language === 'zh'
                ? '单步推进 Step Track'
                : language === 'ja'
                ? 'トラック進行 Step Track'
                : 'Step Track'}
            </button>
          </div>

          {/* Railway Tracks */}
          <div className="rounded-xl border border-slate-200 p-6 dark:border-slate-800 space-y-6">
            {/* Green Ok Track */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-600">
                {language === 'zh'
                  ? '成功绿轨 Green Track (Ok Path)'
                  : language === 'ja'
                  ? '正常トラック Green Track (Ok Path)'
                  : 'Green Track (Ok Path)'}
              </span>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
                <div className={`p-2 rounded border ${railwayStep >= 0 ? 'bg-emerald-100 border-emerald-500 text-emerald-800' : 'bg-slate-100'}`}>
                  parse_input()
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div
                  className={`p-2 rounded border ${
                    railwayStep >= 1 && isInputValid
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold'
                      : 'bg-slate-100'
                  }`}
                >
                  validate()?
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div
                  className={`p-2 rounded border ${
                    railwayStep >= 2 && isInputValid
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800 font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  process()
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
                <div
                  className={`p-2 rounded border ${
                    railwayStep >= 3 && isInputValid
                      ? 'bg-emerald-500 text-white font-bold'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  Ok(value)
                </div>
              </div>
            </div>

            {/* Red Err Track */}
            <div className="space-y-1 pl-4 md:pl-28">
              <span className="text-xs font-bold text-red-600">
                {language === 'zh'
                  ? '错误红轨 Red Track (Err Divert)'
                  : language === 'ja'
                  ? 'エラー分岐 Red Track (Err Divert)'
                  : 'Red Track (Err Divert)'}
              </span>
              <div className="flex items-center gap-3 font-mono text-xs">
                {!isInputValid && railwayStep >= 1 ? (
                  <div className="p-2 rounded border border-red-500 bg-red-100 text-red-800 font-bold">
                    Err(ValidationError) [Early Return]
                  </div>
                ) : (
                  <div className="p-2 text-slate-400 italic">
                    {language === 'zh'
                      ? '暂未触发错误 (No errors triggered)'
                      : language === 'ja'
                      ? 'エラー未発生 (No errors triggered)'
                      : 'No errors triggered'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Option Combinators View */}
      {tab === 'option' && (
        <div data-testid="option-view" className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold">
              {language === 'zh'
                ? '选择 Option 枚举变体：'
                : language === 'ja'
                ? 'Option バリアントを選択：'
                : 'Select Option variant:'}
            </span>
            <button
              type="button"
              onClick={() => setOptionValue('some')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                optionValue === 'some' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              Some(5)
            </button>
            <button
              type="button"
              onClick={() => setOptionValue('none')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                optionValue === 'none' ? 'bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
              }`}
            >
              None
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2 font-mono text-xs">
            <div>
              {language === 'zh' ? '组合子管道 Pipeline' : language === 'ja' ? 'パイプライン Pipeline' : 'Pipeline'}:{' '}
              <code>opt.map(|x| x * 2).unwrap_or(0)</code>
            </div>
            <div className="rounded bg-slate-100 p-3 dark:bg-slate-800">
              Result:{' '}
              <span className="font-bold text-[#CE412B]">
                {optionValue === 'some' ? '10 (mapped via Some)' : '0 (default branch via unwrap_or)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Panic vs Recoverable View */}
      {tab === 'panic' && (
        <div data-testid="panic-view" className="space-y-4">
          <button
            type="button"
            onClick={() => setHasPanicked(true)}
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            {language === 'zh'
              ? '对 None 触发 Trigger unwrap() on None'
              : language === 'ja'
              ? 'None に対して実行 Trigger unwrap() on None'
              : 'Trigger unwrap() on None'}
          </button>

          {hasPanicked && (
            <div className="flex items-center gap-4 rounded-xl border border-red-500/40 bg-red-500/10 p-4">
              <Ferris mood="panic" size={64} />
              <div className="space-y-1 text-xs">
                <span className="font-bold text-red-600">
                  thread 'main' panicked at 'called `Option::unwrap()` on a `None` value'
                </span>
                <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                  {language === 'zh'
                    ? '调用栈回溯：正在展开栈帧 stack backtrace: unwinding stack frames...'
                    : language === 'ja'
                    ? 'バックトレース：スタックフレームを巻き戻しています unwinding stack frames...'
                    : 'stack backtrace: unwinding stack frames...'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* From/Into View */}
      {tab === 'from_into' && (
        <div data-testid="from-into-view" className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {language === 'zh' ? (
              <>
                <code>?</code> 运算符会借助标准库的 <code>From::from</code> 自动将底层错误类型转换为外层函数的统一错误类型。
              </>
            ) : language === 'ja' ? (
              <>
                <code>?</code> 演算子は <code>From::from</code> を呼び出し、異なるエラー型を戻り値のエラー型へ自動変換します。
              </>
            ) : (
              <>
                The <code>?</code> operator converts heterogeneous error types automatically using <code>From::from</code>.
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="rounded bg-slate-100 p-2 dark:bg-slate-800">std::io::Error</div>
            <ArrowRight className="h-4 w-4 text-[#CE412B]" />
            <div className="rounded bg-amber-100 text-amber-800 p-2 font-bold border border-amber-400">
              From::from conversion
            </div>
            <ArrowRight className="h-4 w-4 text-[#CE412B]" />
            <div className="rounded bg-blue-100 text-blue-800 p-2 font-bold border border-blue-400">
              AppError::Io(err)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErrorHandlingVisualizer;
