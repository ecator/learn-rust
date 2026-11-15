# Learn Rust - Maintainer & Agent Guide (AGENTS.md)

This guide documents the architecture, directory conventions, development workflows, and testing standards for human maintainers and autonomous AI agents contributing to `ecator/learn-rust`.

---

## 1. Architectural Principles

- **Framework**: React 19 + React Router v7 (`react-router-dom@^7` in library mode) bundled with Vite 6.
- **Pure Client-Side SPA**: Zero server dependencies; deployed to GitHub Pages with base path `/learn-rust/`.
- **Styling**: Tailwind CSS v4 using `@tailwindcss/vite`.
- **State Management**:
  - Routing via `createBrowserRouter` / `createMemoryRouter` (for tests) with `basename: '/learn-rust'`.
  - Local state and progress persistence managed via `localStorage` with key `learn_rust_progress_v1`.
  - Theming stored under `learn_rust_theme` (`light` | `dark` | `system`).
  - Language preference stored under `learn_rust_lang` (`zh` | `en` | `ja`) via `I18nProvider` (synchronized across components with custom event `learn_rust_lang_change` and `storage` listener), driving both UI strings (`src/lib/i18n/translations/`) and localized curriculum/quiz data (`src/lib/i18n/curriculumData.ts`).

---

## 1.1 Core Feature Inventory (F01 - F18)

| Feature ID | Feature Name | Description |
|------------|--------------|-------------|
| F01 | Project Scaffolding | Vite + React 19 + TypeScript + Tailwind v4 build system |
| F02 | React Router Setup | React Router v7 client routing with /learn-rust/ basename & SPA 404 fallback |
| F03 | Vitest Test Infrastructure | Vitest + Happy-DOM + Testing Library unit/integration test suite |
| F04 | Navigation & Responsive Layout | Desktop nav, mobile hamburger drawer, sidebar curriculum navigation |
| F05 | Theming Engine | Light, Dark, System theme mode with prefers-color-scheme listener |
| F06 | Tri-lingual i18n System | Chinese (zh), English (en), Japanese (ja) across UI, visualizers, quizzes & curriculum with auto locale detection |
| F07 | LocalStorage Progress Engine | Schema learn_rust_progress_v1 persistence, export/import/reset |
| F08 | Ferris Mascot SVG Component | Vector Ferris mascot supporting 7 distinct emotional moods |
| F09 | Ownership & Move Visualizer | Interactive stack & heap memory diagram illustrating move semantics |
| F10 | Borrow Checker & Lifetimes Visualizer | Shared vs mutable reference lease Gantt chart and NLL validation |
| F11 | Memory Layout & Slice Visualizer | Struct byte alignment, fat pointer slices, vector capacity growth |
| F12 | Trait Dispatch Visualizer | Monomorphization code expansion vs dynamic VTable jump tracing |
| F13 | Concurrency & Mutex Visualizer | MPSC channel queueing and Arc<Mutex<T>> contention handoff |
| F14 | Error Handling Visualizer | Railway track Result/Option chaining with ? operator short-circuiting |
| F15 | Curriculum: 10 Progressive Modules | Progressive tri-lingual (zh, en, ja) modules covering beginner to advanced Rust concepts |
| F16 | Interactive Quizzes & Challenges | Localized knowledge check quizzes and code challenges with instant evaluation and progress scoring |
| F17 | GitHub Actions CI/CD Workflow | Automated test and build deployment workflow to GitHub Pages |
| F18 | Documentation (README & AGENTS) | Maintainer documentation, architecture guidelines, and troubleshooting |

---

## 2. Directory Layout & Conventions

```
learn-rust/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Pages CI/CD workflow
├── public/
│   ├── favicon.svg                 # Vector Ferris favicon
│   └── 404.html                    # GitHub Pages SPA redirect trick
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   └── QuizChallenge.tsx   # Localized quiz & code completion challenge
│   │   ├── layout/                 # Header, Sidebar, Breadcrumbs, Footer, MobileNav, AppLayout
│   │   ├── mascot/                 # Ferris vector mascot with 7 moods
│   │   └── visualizers/            # 6 interactive Rust concept state machines + types.ts
│   ├── lib/
│   │   ├── i18n/
│   │   │   ├── index.tsx           # I18nProvider, useI18n, detectBrowserLanguage
│   │   │   ├── types.ts            # SupportedLanguage, TranslationDictionary
│   │   │   ├── translations/       # UI & visualizer label dictionaries (zh.ts, en.ts, ja.ts)
│   │   │   ├── curriculumTypes.ts  # CurriculumLesson, LocalizedLessonContent, LessonQuiz
│   │   │   ├── curriculumData.ts   # curriculumLessons catalog & getLocalizedLesson()
│   │   │   ├── curriculumPart1.ts  # Modules 1-5 tri-lingual curriculum content
│   │   │   └── curriculumPart2.ts  # Modules 6-10 tri-lingual curriculum content
│   │   ├── storage.ts              # LocalStorage progress persistence engine
│   │   ├── theme.tsx               # ThemeProvider & dark/light/system handling
│   │   └── utils.ts                # Tailwind cn utility
│   ├── routes/                     # React Router page views & route table
│   │   ├── Home.tsx
│   │   ├── Curriculum.tsx
│   │   ├── LessonPage.tsx
│   │   ├── VisualizersGallery.tsx
│   │   ├── ProgressPage.tsx
│   │   ├── NotFound.tsx
│   │   ├── routesConfig.tsx
│   │   └── index.tsx
│   ├── App.tsx                     # Top-level RouterProvider
│   └── main.tsx                    # React 19 createRoot entry point
├── tests/
│   ├── setup.ts                    # Happy-DOM & global test environment setup
│   ├── unit/                       # Unit & component tests mirroring src/
│   ├── adversarial/                # Adversarial layout & theming resilience tests
│   └── e2e/                        # Vitest + Testing Library E2E test suites
│       ├── helpers/                # accessibility, render-app, storage-mock, viewport, visualizer-driver
│       ├── tier1-features/         # T1 Feature Coverage suites
│       ├── tier2-boundaries/       # T2 Boundary & documentation suites
│       ├── tier3-pairwise/         # T3 Orthogonal pairwise matrix suites
│       └── tier4-journeys/         # T4 End-to-end user journey suites
├── vite.config.ts                  # Base path and Tailwind plugins
└── vitest.config.ts                # Happy-DOM test configuration
```

---

## 3. How to Add New Modules & Visualizers

### 3.1 Adding a New Curriculum Module
1. Define the module metadata (`slug`, `order`, `phaseKey`, `iconKey`, optional `visualizerId`) in `src/lib/i18n/curriculumPart1.ts` or `src/lib/i18n/curriculumPart2.ts` using types from `src/lib/i18n/curriculumTypes.ts`. `src/lib/i18n/curriculumData.ts` automatically aggregates and sorts all lessons by `order` for `Curriculum.tsx`, `Sidebar.tsx`, `Breadcrumbs.tsx`, `LessonPage.tsx`, and `QuizChallenge.tsx`.
2. Populate complete tri-lingual `translations` (`zh`, `en`, `ja`) adhering to `LocalizedLessonContent` (`title`, `shortTitle`, `phase`, `difficulty`, `duration`, `summary`, `tags`, `overview`, `sections`, `codeSnippet`, `codeExplanation`, `pitfall`, and `quiz`).
3. If the module embeds a new interactive visualizer, wire its `visualizerId` in `src/routes/LessonPage.tsx`.
4. Add unit coverage checks in `tests/unit/lib/i18n.test.tsx` (update expected lesson count if the catalog size changes).

### 3.2 Adding a New Visualizer
1. Implement component under `src/components/visualizers/` implementing `VisualizerProps` from `types.ts`, using `useI18n()` / tri-lingual copy (`zh`, `en`, `ja`) for headings, tooltips, and step explanations.
2. Include controls: Previous Step, Next Step, Reset, and optional Play/Pause.
3. Use accessible roles, standard button text or `aria-label`, and `data-testid` where appropriate.
4. Register the localized card metadata in `src/routes/VisualizersGallery.tsx`, `src/components/layout/Sidebar.tsx`, and translation keys in `src/lib/i18n/translations/{zh,en,ja}.ts`.

---

## 4. Testing & Quality Standards

- **Runner**: Vitest with `happy-dom` environment.
- **Opaque-Box Testing**: All test suites in `tests/e2e/` must interact through accessible roles (`getByRole`, `within`), labels (`getByLabelText`), or standard DOM text. Avoid reaching into private component state.
- **Execution**: Run `pnpm test:run` or `pnpm test:e2e` to verify changes.

---

## 5. Troubleshooting Common Issues

### 5.1 Tailwind CSS v4 Build Warnings
Tailwind v4 is loaded as a Vite plugin via `@tailwindcss/vite` instead of a PostCSS configuration. Ensure `@import "tailwindcss";` is present at the top of `src/index.css`.

### 5.2 GitHub Pages Routing & Base Path
The app is hosted at `/learn-rust/`. All route links must use relative React Router paths (`/curriculum`, `/visualizers`), while Vite handles the base path prefix automatically. Direct deep links in production are restored via `public/404.html`.

### 5.3 Happy-DOM Test Quirks
- For media queries, use `createMatchMediaMock()` in `tests/setup.ts`.
- When asserting clipboard writes, mock `navigator.clipboard` using `Object.defineProperty`.
- Always reset `localStorage` and `document.documentElement` before each test.
- Outside `I18nProvider`, `useI18n()` falls back to `detectBrowserLanguage()` (which reads `localStorage['learn_rust_lang']` then `navigator.language`, defaulting to `'en'` in Happy-DOM); inside rendered app tests (`renderApp({ language })`), switch languages via Header/Sidebar buttons or dispatch `learn_rust_lang_change` rather than mutating `document.documentElement.lang` directly.
