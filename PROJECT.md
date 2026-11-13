# Project: Learn Rust Interactive Learning Web App

## Architecture
- **Framework**: React 19 + React Router v7 (`react-router-dom@^7` in library mode) on Vite SPA
- **Package Manager**: pnpm (v12)
- **Styling & Design System**: Tailwind CSS v4 (`@tailwindcss/vite`), `clsx`, `tailwind-merge`, `lucide-react`
- **Internationalization (i18n)**: Tri-lingual support (Chinese `zh`, English `en`, Japanese `ja`) with browser detection fallback to `zh`, dynamic `<html lang="...">`, type-safe key dictionaries.
- **Theming**: Light and dark themes, defaulting to `system` (`prefers-color-scheme`), WCAG AA/AAA accessible contrast ratios (>15:1 primary text, >4.5:1 code/tokens), anti-FOUC initialization.
- **Interactive Visualizers**: Client-side interactive state machines with step scrubbers, memory pointer diagrams, timeline Gantt charts, railway error flows, and compiler error simulation.
- **Mascot Art**: Native responsive vector SVG Ferris the Crab with 7 emotional moods (`happy`, `confused`, `safety`, `panic`, `detective`, `speed`, `wizard`).
- **Progress Persistence**: LocalStorage schema `learn_rust_progress_v1` tracking completed modules, quiz answers, challenge submissions, bookmarks, and stats.
- **Testing**: Vitest + `happy-dom` + `@testing-library/react` for unit/integration/E2E test execution.
- **Deployment & CI/CD**: GitHub Actions workflow deploying to GitHub Pages at `/learn-rust/`, with client-side SPA `404.html` redirect.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Project Scaffolding | Vite + React 19 + TypeScript + pnpm build pipeline | M1 | Survey 1 |
| F02 | React Router Setup | Client-side routing with base path `/learn-rust/` and SPA 404 fallback | M1 | Survey 1 |
| F03 | Vitest Test Infrastructure | Vitest + happy-dom + testing-library runner and npm test scripts | M1 | Survey 1 |
| F04 | Navigation & Responsive Layout | Header, sidebar curriculum drawer, breadcrumbs, mobile responsive tabs | M1 | Survey 1 & 2 |
| F05 | Theming Engine | Light/Dark/System themes, anti-FOUC script, WCAG contrast compliance | M2 | Survey 3 |
| F06 | Tri-lingual i18n System | Chinese (zh), English (en), Japanese (ja) with browser auto-detect & fallback zh | M2 | Survey 3 |
| F07 | LocalStorage Progress Engine | `learn_rust_progress_v1` schema, save/load, export/import/reset, cross-tab sync | M2 | Survey 3 |
| F08 | Ferris Mascot SVG Component | Modular SVG Ferris with 7 emotional moods, animations, accessible contrast | M2 | Survey 2 |
| F09 | Ownership & Move Visualizer | Interactive stack vs heap, pointer invalidation, drop, step scrubber | M3 | Survey 2 |
| F10 | Borrow Checker & Lifetimes Visualizer | Timeline Gantt chart, shared vs mutable leases, compile-time lease conflict simulator | M3 | Survey 2 |
| F11 | Memory Layout & Slice Visualizer | Stack frames, heap allocations, `&str` fat pointer vs `String`, `Vec` capacity/len | M3 | Survey 2 |
| F12 | Trait Dispatch Visualizer | Monomorphization code expansion vs dynamic vtable dispatch jump | M3 | Survey 2 |
| F13 | Concurrency & Mutex Visualizer | Channel message passing & `Arc<Mutex<T>>` lock/wait state machine | M3 | Survey 2 |
| F14 | Error Handling Visualizer | Railway-oriented `Result`/`Option` chaining with `?` operator flow | M3 | Survey 2 |
| F15 | Curriculum: 10 Progressive Modules | Beginner to Advanced modules (zh/en/ja) with deep dives, gotchas, code examples | M4 | Survey 2 |
| F16 | Interactive Quizzes & Challenges | Knowledge checks, pitfall analysis, instant feedback, progress credit | M4 | Survey 2 |
| F17 | GitHub Actions CI/CD Workflow | `.github/workflows/deploy.yml` with pnpm, cache, test-before-build, GitHub Pages deploy | M5 | Survey 3 |
| F18 | Documentation (README & AGENTS) | Comprehensive README.md with live links and AGENTS.md maintainer guide | M5 | Survey 3 |
| F19 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite verifying all features end-to-end | M6 | E2E Track |
| F20 | Tier 5 Hardening & Git Push | White-box adversarial edge testing, forensic integrity audit, git commit and push | M6 | Orchestrator |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Scaffolding & Routing | Project init, pnpm config, Vite + React Router v7, Tailwind v4, Base Layout, 404 SPA fallback, Vitest setup | none | DONE |
| M2 | Design System, i18n, Theme & Ferris | Light/Dark/System theme engine, Tri-lingual zh/en/ja i18n, LocalStorage progress store, Ferris SVG mascot component | M1 | DONE |
| M3 | Interactive Visualizer Engine | 6 Interactive Rust Visualizers (Ownership, Borrow Checker, Memory, Traits, Concurrency, Error Handling) | M2 | DONE |
| M4 | Complete Curriculum & Quizzes | 10 Progressive learning modules (Beginner to Advanced) in zh/en/ja with interactive sandboxes | M3 | IN_PROGRESS |
| M5 | Documentation & GitHub Actions CI/CD | Comprehensive README.md, AGENTS.md, `.github/workflows/deploy.yml`, Pages readiness | M4 | PLANNED |
| M6 | Final Dual-Track Convergence & Git Push | Pass 100% E2E tests (Tiers 1-4), Tier 5 adversarial hardening, Forensic Audit, push to GitHub origin/main | M5 | PLANNED |

---

## Interface Contracts

### 1. Theming Contract (`src/lib/theme.ts`)
```typescript
export type ThemeMode = 'light' | 'dark' | 'system';
export interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}
```

### 2. i18n Contract (`src/lib/i18n.ts`)
```typescript
export type SupportedLanguage = 'zh' | 'en' | 'ja';
export interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}
```

### 3. LocalStorage Progress Contract (`src/lib/storage.ts`)
```typescript
export interface UserProgress {
  version: 1;
  lastUpdated: string;
  completedLessons: string[];
  quizStates: Record<string, { passed: boolean; attempts: number; selectedAnswer: number | string }>;
  interactiveChallenges: Record<string, { solved: boolean; timestamp: string }>;
  bookmarks: string[];
  stats: { xpScore: number; streakDays: number; lastActiveDate: string };
}
```

### 4. Visualizer Component Contract (`src/components/visualizers/types.ts`)
```typescript
export interface VisualizerStep {
  step: number;
  codeHighlightLines: number[];
  explanation: { zh: string; en: string; ja: string };
  state: Record<string, unknown>;
  error?: { code: string; message: { zh: string; en: string; ja: string } };
}

export interface VisualizerProps {
  initialStep?: number;
  autoPlay?: boolean;
  onComplete?: () => void;
}
```

### 5. Curriculum Module Schema (`src/curriculum/types.ts`)
```typescript
export interface Lesson {
  id: string;
  slug: string;
  title: { zh: string; en: string; ja: string };
  description: { zh: string; en: string; ja: string };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTimeMinutes: number;
  visualizerType?: 'ownership' | 'borrow' | 'memory' | 'trait' | 'concurrency' | 'error';
  content: { zh: string; en: string; ja: string };
  codeSnippet: string;
  pitfalls: Array<{ code: string; explanation: { zh: string; en: string; ja: string } }>;
  quiz: {
    question: { zh: string; en: string; ja: string };
    options: Array<{ zh: string; en: string; ja: string }>;
    correctAnswerIndex: number;
    explanation: { zh: string; en: string; ja: string };
  };
}
```

---

## Code Layout
```
/home/antigravity/ecator/learn-rust/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deploy to Pages
├── public/
│   ├── favicon.svg                 # Ferris favicon
│   └── 404.html                    # GitHub Pages SPA redirect
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/                 # Header, Sidebar, Navigation, Footer
│   │   ├── common/                 # Buttons, Badges, Modals, Tabs, Tooltips
│   │   ├── mascot/                 # Ferris SVG with moods
│   │   └── visualizers/            # 6 Rust interactive concept visualizers
│   │       ├── OwnershipVisualizer.tsx
│   │       ├── BorrowCheckerVisualizer.tsx
│   │       ├── MemoryLayoutVisualizer.tsx
│   │       ├── TraitDispatchVisualizer.tsx
│   │       ├── ConcurrencyVisualizer.tsx
│   │       └── ErrorHandlingVisualizer.tsx
│   ├── curriculum/                 # 10 Curriculum modules & quizzes (zh/en/ja)
│   ├── lib/
│   │   ├── i18n/                   # Translation keys & detector
│   │   ├── theme.tsx               # ThemeProvider & hook
│   │   ├── storage.ts              # LocalStorage progress engine
│   │   └── utils.ts                # cn utility
│   ├── routes/                     # React Router page routes
│   │   ├── Home.tsx
│   │   ├── Curriculum.tsx
│   │   ├── LessonPage.tsx
│   │   ├── VisualizersGallery.tsx
│   │   ├── ProgressPage.tsx
│   │   └── NotFound.tsx
│   ├── tests/                      # Unit & component test suites
│   ├── index.css                   # Tailwind v4 import & custom styles
│   ├── main.tsx                    # Entry point & router setup
│   └── App.tsx
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── README.md
└── AGENTS.md
```
