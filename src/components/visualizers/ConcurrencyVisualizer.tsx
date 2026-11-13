import React, { useState } from 'react';
import { VisualizerProps } from './types';
import { AlertTriangle, Send, GitBranch, GitMerge, ShieldCheck, Bug, RotateCcw } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';

export const ConcurrencyVisualizer: React.FC<VisualizerProps> = ({ className = '' }) => {
  const { language } = useI18n();
  const [mode, setMode] = useState<'channel' | 'mutex' | 'deadlock' | 'threads'>('channel');

  // Channel state
  const [messages, setMessages] = useState<string[]>([]);
  const sendMessage = () => {
    setMessages((prev) => [...prev, `Message #${prev.length + 1}`]);
  };

  // Mutex state
  const [mutexHolder, setMutexHolder] = useState<'Thread 1' | 'Thread 2' | null>(null);
  const [counterValue, setCounterValue] = useState(0);

  // Deadlock state
  const [isDeadlocked, setIsDeadlocked] = useState(false);

  // Threads state
  const [threadSpawned, setThreadSpawned] = useState(false);
  const [threadJoined, setThreadJoined] = useState(false);

  // Error simulation toggle
  const [simulateError, setSimulateError] = useState(false);

  const handleReset = () => {
    setMessages([]);
    setMutexHolder(null);
    setCounterValue(0);
    setIsDeadlocked(false);
    setThreadSpawned(false);
    setThreadJoined(false);
    setSimulateError(false);
  };

  // Ferris mascot mood
  let ferrisMood: FerrisMood = 'safety';
  if (isDeadlocked && mode === 'deadlock') {
    ferrisMood = 'panic';
  } else if (simulateError) {
    ferrisMood = 'panic';
  } else if (mode === 'channel') {
    ferrisMood = 'safety';
  } else if (mode === 'threads') {
    ferrisMood = 'speed';
  } else {
    ferrisMood = 'detective';
  }

  return (
    <div
      data-testid="concurrency-visualizer"
      className={`rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <Ferris mood={ferrisMood} size="sm" className="shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === 'zh'
                ? '并发与互斥锁机制'
                : language === 'ja'
                ? '並行処理と排他制御'
                : 'Concurrency & Mutex Visualizer'}
            </h3>
            <span className="text-xs text-slate-500">
              {language === 'zh'
                ? 'MPSC 消息传递、Arc<Mutex<T>> 锁竞争与死锁预防'
                : language === 'ja'
                ? 'MPSC チャネル、Arc<Mutex<T>>、デッドロック回避'
                : 'MPSC Channels, Arc<Mutex<T>> & Deadlock Simulation'}
            </span>
          </div>
        </div>

        {/* Quick Simulator Toggle & Reset */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (mode === 'deadlock') {
                setIsDeadlocked((prev) => !prev);
              } else {
                setSimulateError((prev) => !prev);
              }
            }}
            aria-label="Toggle Error Simulation"
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              (isDeadlocked && mode === 'deadlock') || simulateError
                ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {(isDeadlocked && mode === 'deadlock') || simulateError ? (
              <Bug className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            )}
            <span>
              {(isDeadlocked && mode === 'deadlock') || simulateError
                ? language === 'zh'
                  ? '死锁 / 竞争报错模拟中'
                  : language === 'ja'
                  ? 'エラー発生中'
                  : 'Simulating Concurrency Error'
                : language === 'zh'
                ? '模拟 Rustc 报错 (Simulate Rustc Error)'
                : language === 'ja'
                ? 'Rustc エラー再現'
                : 'Simulate Rustc Error'}
            </span>
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

      {/* Compiler Data Race Alert */}
      {simulateError && (
        <div
          role="alert"
          data-testid="compiler-error"
          aria-live="polite"
          className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
        >
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
          <span>{"error[E0277]: `Rc<RefCell<T>>` cannot be sent between threads safely; the trait `Send` is not implemented"}</span>
        </div>
      )}

      {/* Mode Selector */}
      <div className="flex flex-wrap gap-1" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'channel'}
          onClick={() => setMode('channel')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'channel'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          MPSC Channel
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'mutex'}
          onClick={() => setMode('mutex')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'mutex'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Arc&lt;Mutex&lt;T&gt;&gt;
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'deadlock'}
          onClick={() => setMode('deadlock')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'deadlock'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Deadlock Scenario
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'threads'}
          onClick={() => setMode('threads')}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
            mode === 'threads'
              ? 'bg-[#CE412B] text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          Thread Spawn/Join
        </button>
      </div>

      {/* MPSC Channel View */}
      {mode === 'channel' && (
        <div data-testid="channel-view" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Multiple Producer, Single Consumer: Producers send data packets across a thread boundary.
            </p>
            <button
              type="button"
              onClick={sendMessage}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B33621]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Send Message</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Producer Thread (tx)
              </span>
              <p className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-400">tx.send(msg)</p>
            </div>

            <div className="rounded-xl border border-dashed border-orange-300 p-4 text-center bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Channel Buffer ({messages.length})
              </span>
              <div className="mt-2 flex flex-wrap justify-center gap-1">
                {messages.map((m, idx) => (
                  <span key={idx} className="rounded bg-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Receiver Thread (rx)
              </span>
              <p className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-400">rx.recv()</p>
            </div>
          </div>
        </div>
      )}

      {/* Mutex Contention View */}
      {mode === 'mutex' && (
        <div data-testid="mutex-view" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Simulate contention on a shared <code>Arc&lt;Mutex&lt;u32&gt;&gt;</code>.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMutexHolder('Thread 1')}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Thread 1: Acquire Lock
              </button>
              <button
                type="button"
                onClick={() => {
                  if (mutexHolder === 'Thread 1') {
                    setMutexHolder('Thread 2');
                    setCounterValue((prev) => prev + 1);
                  } else {
                    setMutexHolder('Thread 2');
                  }
                }}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Thread 2: Acquire / Handoff
              </button>
              <button
                type="button"
                onClick={() => setMutexHolder(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700"
              >
                Release Lock
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thread 1 */}
            <div
              className={`rounded-xl border p-4 transition-colors ${
                mutexHolder === 'Thread 1'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Thread 1</span>
                <span
                  className={
                    mutexHolder === 'Thread 1'
                      ? 'text-emerald-600 font-bold'
                      : mutexHolder === 'Thread 2'
                      ? 'text-amber-500 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {mutexHolder === 'Thread 1'
                    ? 'Holding Lock'
                    : mutexHolder === 'Thread 2'
                    ? 'Waiting/Blocked'
                    : 'Idle'}
                </span>
              </div>
            </div>

            {/* Thread 2 */}
            <div
              className={`rounded-xl border p-4 transition-colors ${
                mutexHolder === 'Thread 2'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>Thread 2</span>
                <span
                  className={
                    mutexHolder === 'Thread 2'
                      ? 'text-emerald-600 font-bold'
                      : mutexHolder === 'Thread 1'
                      ? 'text-amber-500 font-bold'
                      : 'text-slate-400'
                  }
                >
                  {mutexHolder === 'Thread 2'
                    ? 'Holding Lock'
                    : mutexHolder === 'Thread 1'
                    ? 'Waiting/Blocked'
                    : 'Idle'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
            <span className="text-xs font-mono">Shared Counter Value: </span>
            <span className="text-base font-bold font-mono text-[#CE412B]">{counterValue}</span>
          </div>
        </div>
      )}

      {/* Deadlock View */}
      {mode === 'deadlock' && (
        <div data-testid="deadlock-view" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Thread A locks L1 then waits for L2; Thread B locks L2 then waits for L1.
            </p>
            <button
              type="button"
              onClick={() => setIsDeadlocked(!isDeadlocked)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              {isDeadlocked ? 'Resolve Deadlock' : 'Simulate Deadlock'}
            </button>
          </div>

          {isDeadlocked && (
            <div
              role="alert"
              data-testid="compiler-error"
              aria-live="polite"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <span>Deadlock Warning: Both Thread A and Thread B are mutually blocked on lock acquisition!</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-xs font-mono text-center">
            <div className="rounded-xl border p-4 dark:border-slate-800">
              <span className="font-bold">Thread A</span>
              <div className="mt-2 text-emerald-600">Holds: Lock 1</div>
              <div className="text-red-500">{isDeadlocked ? 'Waiting on: Lock 2 (Blocked)' : 'Idle'}</div>
            </div>
            <div className="rounded-xl border p-4 dark:border-slate-800">
              <span className="font-bold">Thread B</span>
              <div className="mt-2 text-emerald-600">Holds: Lock 2</div>
              <div className="text-red-500">{isDeadlocked ? 'Waiting on: Lock 1 (Blocked)' : 'Idle'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Thread Spawn / Join View */}
      {mode === 'threads' && (
        <div data-testid="threads-view" className="space-y-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setThreadSpawned(true);
                setThreadJoined(false);
              }}
              className="rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B33621]"
            >
              Spawn Thread
            </button>
            <button
              type="button"
              disabled={!threadSpawned || threadJoined}
              onClick={() => setThreadJoined(true)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              Join Thread
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 text-blue-600">
              <span className="font-bold">Main Thread</span>
              <div className="h-0.5 flex-1 bg-blue-500" />
            </div>

            {threadSpawned && (
              <div className="flex items-center gap-2 text-emerald-600 pl-8">
                <GitBranch className="h-3.5 w-3.5" />
                <span>Worker Thread (spawned)</span>
                <div className="h-0.5 flex-1 bg-emerald-500" />
                {threadJoined && (
                  <span className="flex items-center gap-1 text-slate-400">
                    <GitMerge className="h-3.5 w-3.5 text-blue-500" />
                    <span>joined!</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcurrencyVisualizer;
