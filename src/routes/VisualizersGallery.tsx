import React, { useState, useMemo } from 'react';
import {
  Layers,
  ShieldCheck,
  Lock,
  Boxes,
  Cpu,
  Zap,
  Sparkles,
  ArrowRight,
  Search,
  RotateCcw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { OwnershipVisualizer } from '@/components/visualizers/OwnershipVisualizer';
import { BorrowCheckerVisualizer } from '@/components/visualizers/BorrowCheckerVisualizer';
import { MemoryLayoutVisualizer } from '@/components/visualizers/MemoryLayoutVisualizer';
import { TraitDispatchVisualizer } from '@/components/visualizers/TraitDispatchVisualizer';
import { ConcurrencyVisualizer } from '@/components/visualizers/ConcurrencyVisualizer';
import { ErrorHandlingVisualizer } from '@/components/visualizers/ErrorHandlingVisualizer';
import { SupportedLanguage, useI18n } from '@/lib/i18n';

export type VisualizerCategory =
  | 'All'
  | 'Ownership & Memory'
  | 'Lifetimes & Borrows'
  | 'Types & Traits'
  | 'Concurrency & Errors';

interface LocalizedVisualizerText {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

interface VisualizerCard {
  id: string;
  category: VisualizerCategory;
  lessonSlug: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  translations: Record<SupportedLanguage, LocalizedVisualizerText>;
}

const visualizers: VisualizerCard[] = [
  {
    id: 'ownership',
    category: 'Ownership & Memory',
    lessonSlug: 'ownership-move',
    icon: ShieldCheck,
    color: 'from-orange-500/10 to-red-500/10 border-orange-500/30 text-[#CE412B]',
    translations: {
      zh: {
        title: '所有权与移动语义 (Ownership & Move)',
        subtitle: '追踪值的所有权转移与作用域释放',
        description:
          '观察将堆数据变量赋值时如何移动栈指针，同时立即使原绑定失效，防止二次释放。',
        features: ['栈与堆指针内存追踪', '值移动动画状态演示', '作用域结束自动 Drop 析构'],
      },
      en: {
        title: 'Ownership & Move Semantics',
        subtitle: 'Track value movement and scope drops',
        description:
          'Inspect how assigning a variable moves its stack pointer and heap allocation, instantly invalidating the original binding.',
        features: ['Stack vs Heap pointer tracking', 'Value move animations', 'Drop scope destruction'],
      },
      ja: {
        title: '所有権とムーブセマンティクス',
        subtitle: '値のムーブとスコープ解放を追跡',
        description:
          '変数の代入時にスタックポインタが移動し、元の束縛が即座に無効化される仕組みを観察します。',
        features: ['スタック・ヒープポインタ追跡', 'ムーブアニメーション', 'スコープ終了時の Drop 解放'],
      },
    },
  },
  {
    id: 'borrow-checker',
    category: 'Lifetimes & Borrows',
    lessonSlug: 'references-borrowing',
    icon: Lock,
    color: 'from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-600',
    translations: {
      zh: {
        title: '借用检查与生命周期 (Borrow Checker)',
        subtitle: '可视化活跃引用租期与别名互斥规则',
        description:
          '实时模拟 Rust 借用检查器，理解为什么多共享读（&T）与唯一可变写（&mut T）能消灭数据竞争。',
        features: ['编译期别名互斥规则', '非词法生命周期（NLL）区间', '借用冲突高亮报警'],
      },
      en: {
        title: 'Borrow Checker & Lifetimes',
        subtitle: 'Visualize active references and aliasing rules',
        description:
          'Simulate the Rust borrow checker in real-time. Experience why multiple readers (&T) or single writer (&mut T) prevents data races.',
        features: ['Compile-time aliasing rules', 'Lifetime scope spans', 'Conflict violation highlighting'],
      },
      ja: {
        title: '借用チェッカーとライフタイム',
        subtitle: '有効な参照リースとエイリアシング規則を可視化',
        description:
          '複数の共有参照（&T）または単一的可変参照（&mut T）の排他制御がデータ競合を防ぐ仕組みを体験します。',
        features: ['コンパイル時エイリアシング検証', 'NLL ライフタイム区間', '借用競合エラー強調表示'],
      },
    },
  },
  {
    id: 'memory-layout',
    category: 'Ownership & Memory',
    lessonSlug: 'primitives-mutability',
    icon: Boxes,
    color: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-600',
    translations: {
      zh: {
        title: '内存布局 (栈、堆、对齐与切片)',
        subtitle: '直观呈现程序字节对齐、胖指针与扩容策略',
        description:
          '可视化结构体字段对齐填充、Vec 动态扩容重新分配以及 &str 胖指针的双字内存结构。',
        features: ['Vec 容量增长与重分配', 'String / &str 内存解剖', '结构体字节对齐可视化'],
      },
      en: {
        title: 'Memory Layout (Stack vs Heap)',
        subtitle: 'Direct visual mapping of program memory',
        description:
          'Visual representation of Stack frames, pointers, capacities, heap chunks, and struct byte alignments.',
        features: ['Vector growth & reallocation', 'String buffer anatomy', 'Zero-cost abstraction proofs'],
      },
      ja: {
        title: 'メモリレイアウト（スタック・ヒープ・スライス）',
        subtitle: 'プログラムメモリとアラインメントを直接マッピング',
        description:
          '構造体パディング、Vec の動的再割り当て、&str ファットポインタの内部構造を可視化します。',
        features: ['Vec 容量拡張と再割り当て', 'String / &str 構造解剖', 'ゼロコスト抽象化の確認'],
      },
    },
  },
  {
    id: 'trait-dispatch',
    category: 'Types & Traits',
    lessonSlug: 'traits-generics',
    icon: Cpu,
    color: 'from-purple-500/10 to-indigo-500/10 border-purple-500/30 text-purple-600',
    translations: {
      zh: {
        title: 'Trait 分发机制 (静态单态化 vs 动态 VTable)',
        subtitle: '对比编译期单态化与运行时虚表跳转',
        description:
          '交互式对比静态分发 impl Trait 代码膨胀与动态分发 dyn Trait 双指针虚表查表过程。',
        features: ['胖指针双字结构解析', 'VTable 虚函数跳转追踪', '代码体积与性能权衡对比'],
      },
      en: {
        title: 'Trait Dispatch (Static vs Dyn)',
        subtitle: 'Monomorphization vs Vtable lookups',
        description:
          'Compare compile-time monomorphization with runtime dynamic dispatch (dyn Trait) through interactive vtable diagrams.',
        features: ['Fat pointer dissection', 'Vtable jump simulation', 'Binary size vs flexibility analysis'],
      },
      ja: {
        title: 'トレイトディスパッチ（静的単相化 vs 動的 VTable）',
        subtitle: '単相化展開と VTable 動的ルックアップの比較',
        description:
          '静的ディスパッチ（impl Trait）と動的ディスパッチ（dyn Trait）のメカニズムとトレードオフを比較します。',
        features: ['ファットポインタ構造解析', 'VTable ジャンプシミュレーション', 'バイナリサイズと柔軟性分析'],
      },
    },
  },
  {
    id: 'concurrency',
    category: 'Concurrency & Errors',
    lessonSlug: 'concurrency-mutex',
    icon: Zap,
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600',
    translations: {
      zh: {
        title: '无畏并发与互斥锁 (Mutex & MPSC)',
        subtitle: '多线程锁竞争、通道队列与死锁预防',
        description:
          '模拟多 OS 线程排队获取 MutexGuard 互斥锁、MPSC 异步通道消息传递及典型死锁场景。',
        features: ['Mutex 加锁与释放生命周期', 'MPSC 消息通道缓冲队列', '死锁与 JoinHandle 演示'],
      },
      en: {
        title: 'Concurrency & Mutex Locking',
        subtitle: 'Thread synchronization and channel message queues',
        description:
          'Experience fearless concurrency: simulate multiple threads acquiring MutexGuard locks, avoiding deadlocks and race conditions.',
        features: ['Mutex lock/unlock lifecycle', 'MPSC queue visualization', 'Send & Sync bounds inspector'],
      },
      ja: {
        title: '恐れなき並行性と Mutex',
        subtitle: 'スレッド同期・チャネルキュー・デッドロック検証',
        description:
          '複数スレッドによる MutexGuard の獲得競合、MPSC チャネル通信、デッドロック発生パターンをシミュレートします。',
        features: ['Mutex ロック/解放ライフサイクル', 'MPSC キュー可視化', 'デッドロックと JoinHandle 検証'],
      },
    },
  },
  {
    id: 'railway-errors',
    category: 'Concurrency & Errors',
    lessonSlug: 'error-handling',
    icon: Layers,
    color: 'from-rose-500/10 to-pink-500/10 border-rose-500/30 text-rose-600',
    translations: {
      zh: {
        title: '铁路错误流 (Option / Result 与 ? 传播)',
        subtitle: 'Ok 绿轨与 Err 红轨的可视化短路流转',
        description:
          '观察多步骤校验管道如何通过 ? 运算符在出错时自动短路切换至 Err 轨道并返回。',
        features: ['Ok / Err 双轨分流机制', '问号 (?) 运算符早返回演示', 'Option 组合子与 From 转换'],
      },
      en: {
        title: 'Railway Error Flow (Option/Result)',
        subtitle: 'Visual track switching for robust error handling',
        description:
          'Watch function pipelines fork between Ok and Err tracks, seeing exactly how the ? operator short-circuits failure states.',
        features: ['Railway track switching', 'Question mark operator flow', 'Exhaustive pattern matching'],
      },
      ja: {
        title: '鉄道指向エラーハンドリング (Option / Result)',
        subtitle: '? 演算子による Ok / Err トラック切り替え可視化',
        description:
          '処理パイプラインが失敗時に ? 演算子で Err レールへ即座にショートサーキットする流れを視覚的に追跡します。',
        features: ['Ok / Err トラック分岐', '? 演算子による早期リターン', 'Option コンビネータと From 変換'],
      },
    },
  },
];

const categories: Array<{ key: VisualizerCategory; labelKey: string }> = [
  { key: 'All', labelKey: 'gallery.catAll' },
  { key: 'Ownership & Memory', labelKey: 'gallery.catOwnership' },
  { key: 'Lifetimes & Borrows', labelKey: 'gallery.catLifetimes' },
  { key: 'Types & Traits', labelKey: 'gallery.catTypes' },
  { key: 'Concurrency & Errors', labelKey: 'gallery.catConcurrency' },
];

export const VisualizersGallery: React.FC = () => {
  const { language, t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState<VisualizerCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVisualizers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return visualizers.filter((vis) => {
      const matchesCategory =
        selectedCategory === 'All' || vis.category === selectedCategory;
      if (!q) return matchesCategory;

      const localized = vis.translations[language] ?? vis.translations.en;
      const enText = vis.translations.en;
      const searchable = [
        localized.title,
        localized.subtitle,
        localized.description,
        enText.title,
        enText.subtitle,
        enText.description,
      ]
        .join(' ')
        .toLowerCase();

      return matchesCategory && searchable.includes(q);
    });
  }, [selectedCategory, searchQuery, language]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
  };

  const renderVisualizer = (id: string) => {
    switch (id) {
      case 'ownership':
        return <OwnershipVisualizer />;
      case 'borrow-checker':
        return <BorrowCheckerVisualizer />;
      case 'memory-layout':
        return <MemoryLayoutVisualizer />;
      case 'trait-dispatch':
        return <TraitDispatchVisualizer />;
      case 'concurrency':
        return <ConcurrencyVisualizer />;
      case 'railway-errors':
        return <ErrorHandlingVisualizer />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-10 px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title & Introduction */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#CE412B]/10 px-3 py-1 text-xs font-semibold text-[#CE412B] dark:bg-[#CE412B]/20">
          <Layers className="h-3.5 w-3.5" />
          <span>{t('gallery.badge')}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t('gallery.title')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          {t('gallery.subtitle')}
        </p>
      </div>

      {/* Filter Toolbar: Categories, Search & Reset */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-slate-200/80 py-4 dark:border-slate-800">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Category Filter">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedCategory === cat.key
                  ? 'bg-[#CE412B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {t(cat.labelKey)}
            </button>
          ))}
        </div>

        {/* Search input & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('gallery.searchPlaceholder')}
              aria-label="Search visualizers"
              className="rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#CE412B] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          {(selectedCategory !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              aria-label="Reset All Filters"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3 w-3" />
              <span>{t('common.reset')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Visualizers Grid */}
      {filteredVisualizers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 dark:border-slate-800">
          <p className="text-sm font-medium">{t('gallery.emptyState')}</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#CE412B] px-3 py-1.5 text-xs font-semibold text-white"
          >
            <RotateCcw className="h-3 w-3" />
            <span>{t('gallery.resetFilters')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {filteredVisualizers.map((vis) => {
            const Icon = vis.icon;
            const localized = vis.translations[language] ?? vis.translations.en;
            return (
              <div
                key={vis.id}
                id={vis.id}
                className={`flex flex-col justify-between rounded-3xl border bg-gradient-to-b p-6 sm:p-7 shadow-sm transition-all hover:shadow-lg dark:bg-slate-900/60 ${vis.color}`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="rounded-2xl bg-white/80 p-3 shadow-sm dark:bg-slate-800">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-xs dark:bg-slate-800 dark:text-slate-200">
                      {t('gallery.statusReady')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {localized.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {localized.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {localized.description}
                  </p>

                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      {t('gallery.simulatedFeatures')}
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                      {localized.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-1.5">
                          <Sparkles className="h-3 w-3 opacity-60 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Embedded Interactive Visualizer Simulator */}
                  <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800">
                    {renderVisualizer(vis.id)}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200/60 pt-4 dark:border-slate-800">
                  <Link
                    to={`/lesson/${vis.lessonSlug}`}
                    className="flex items-center justify-between text-xs font-bold hover:underline"
                  >
                    <span>{t('gallery.readTheory')}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VisualizersGallery;
