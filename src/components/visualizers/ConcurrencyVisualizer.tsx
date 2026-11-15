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
          {language === 'zh'
            ? 'MPSC 通道 (MPSC Channel)'
            : language === 'ja'
            ? 'MPSC チャネル (MPSC Channel)'
            : 'MPSC Channel'}
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
          {language === 'zh'
            ? '死锁场景 (Deadlock Scenario)'
            : language === 'ja'
            ? 'デッドロック (Deadlock Scenario)'
            : 'Deadlock Scenario'}
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
          {language === 'zh'
            ? '线程派生与合并 (Thread Spawn/Join)'
            : language === 'ja'
            ? 'スレッド生成・待機 (Thread Spawn/Join)'
            : 'Thread Spawn/Join'}
        </button>
      </div>

      {/* MPSC Channel View */}
      {mode === 'channel' && (
        <div data-testid="channel-view" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'zh'
                ? '多生产者单消费者 (MPSC)：生产者将数据所有权安全跨越线程边界发送到接收端。'
                : language === 'ja'
                ? '複数プロデューサー・単一コンシューマー：送信側がスレッド境界を越えて所有権付きでデータを渡します。'
                : 'Multiple Producer, Single Consumer: Producers send data packets across a thread boundary.'}
            </p>
            <button
              type="button"
              onClick={sendMessage}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#B33621] shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
              <span>
                {language === 'zh' ? '发送消息 Send Message' : language === 'ja' ? '送信 Send Message' : 'Send Message'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {language === 'zh' ? '发送线程 Producer Thread (tx)' : language === 'ja' ? '送信スレッド Producer Thread (tx)' : 'Producer Thread (tx)'}
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
                {language === 'zh' ? '接收线程 Receiver Thread (rx)' : language === 'ja' ? '受信スレッド Receiver Thread (rx)' : 'Receiver Thread (rx)'}
              </span>
              <p className="mt-2 text-xs font-mono text-slate-600 dark:text-slate-400">rx.recv()</p>
            </div>
          </div>
        </div>
      )}

      {/* Mutex Contention View */}
      {mode === 'mutex' && (
        <div data-testid="mutex-view" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'zh' ? (
                <>模拟多线程对共享互斥锁 <code>Arc&lt;Mutex&lt;u32&gt;&gt;</code> 的争用与轮转。</>
              ) : language === 'ja' ? (
                <>共有ミューテックス <code>Arc&lt;Mutex&lt;u32&gt;&gt;</code> の競合とロック引き渡しをシミュレートします。</>
              ) : (
                <>Simulate contention on a shared <code>Arc&lt;Mutex&lt;u32&gt;&gt;</code>.</>
              )}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMutexHolder('Thread 1')}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                {language === 'zh'
                  ? 'Thread 1: Acquire Lock (获取锁)'
                  : language === 'ja'
                  ? 'Thread 1: Acquire Lock (ロック取得)'
                  : 'Thread 1: Acquire Lock'}
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
                {language === 'zh' ? 'Thread 2: 获取/交接 Acquire / Handoff' : language === 'ja' ? 'Thread 2: 取得/引き継ぎ Acquire / Handoff' : 'Thread 2: Acquire / Handoff'}
              </button>
              <button
                type="button"
                onClick={() => setMutexHolder(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700"
              >
                {language === 'zh' ? '释放锁 Release Lock' : language === 'ja' ? 'ロック解放 Release Lock' : 'Release Lock'}
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
                    ? language === 'zh'
                      ? '持有锁 Holding Lock'
                      : language === 'ja'
                      ? 'ロック保持 Holding Lock'
                      : 'Holding Lock'
                    : mutexHolder === 'Thread 2'
                    ? language === 'zh'
                      ? '等待阻塞 Waiting/Blocked'
                      : language === 'ja'
                      ? '待機ブロック Waiting/Blocked'
                      : 'Waiting/Blocked'
                    : language === 'zh'
                    ? '空闲 Idle'
                    : language === 'ja'
                    ? '待機 Idle'
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
                    ? language === 'zh'
                      ? '持有锁 Holding Lock'
                      : language === 'ja'
                      ? 'ロック保持 Holding Lock'
                      : 'Holding Lock'
                    : mutexHolder === 'Thread 1'
                    ? language === 'zh'
                      ? '等待阻塞 Waiting/Blocked'
                      : language === 'ja'
                      ? '待機ブロック Waiting/Blocked'
                      : 'Waiting/Blocked'
                    : language === 'zh'
                    ? '空闲 Idle'
                    : language === 'ja'
                    ? '待機 Idle'
                    : 'Idle'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
            <span className="text-xs font-mono">
              {language === 'zh'
                ? '共享计数器 Shared Counter Value: '
                : language === 'ja'
                ? '共有カウンタ値 Shared Counter Value: '
                : 'Shared Counter Value: '}
            </span>
            <span className="text-base font-bold font-mono text-[#CE412B]">{counterValue}</span>
          </div>
        </div>
      )}

      {/* Deadlock View */}
      {mode === 'deadlock' && (
        <div data-testid="deadlock-view" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'zh'
                ? '线程 A 持有 Lock 1 并等待 Lock 2；同时线程 B 持有 Lock 2 并等待 Lock 1，形成循环等待死锁。'
                : language === 'ja'
                ? 'スレッド A は Lock 1 を保持して Lock 2 を待ち、スレッド B は Lock 2 を保持して Lock 1 を待つ循環待ち状態です。'
                : 'Thread A locks L1 then waits for L2; Thread B locks L2 then waits for L1.'}
            </p>
            <button
              type="button"
              onClick={() => setIsDeadlocked(!isDeadlocked)}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 shrink-0"
            >
              {isDeadlocked
                ? language === 'zh'
                  ? '解除死锁 Resolve Deadlock'
                  : language === 'ja'
                  ? 'デッドロック解除 Resolve Deadlock'
                  : 'Resolve Deadlock'
                : language === 'zh'
                ? '模拟死锁 Simulate Deadlock'
                : language === 'ja'
                ? 'デッドロック発生 Simulate Deadlock'
                : 'Simulate Deadlock'}
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
              <span>
                {language === 'zh'
                  ? '死锁警告 Deadlock Warning：Thread A 与 Thread B 相互无限阻塞在锁获取步骤！'
                  : language === 'ja'
                  ? 'デッドロック警告 Deadlock Warning: Thread A と Thread B が互いにロック待ちで永久停止しています！'
                  : 'Deadlock Warning: Both Thread A and Thread B are mutually blocked on lock acquisition!'}
              </span>
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
              {language === 'zh' ? '派生线程 Spawn Thread' : language === 'ja' ? 'スレッド生成 Spawn Thread' : 'Spawn Thread'}
            </button>
            <button
              type="button"
              disabled={!threadSpawned || threadJoined}
              onClick={() => setThreadJoined(true)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              {language === 'zh' ? '等待汇合 Join Thread' : language === 'ja' ? '合流待機 Join Thread' : 'Join Thread'}
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
