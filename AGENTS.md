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
  - Language preference stored under `learn_rust_lang` (`zh` | `en` | `ja`).

---

## 1.1 Core Feature Inventory (F01 - F18)

| Feature ID | Feature Name | Description |
|------------|--------------|-------------|
| F01 | Project Scaffolding | Vite + React 19 + TypeScript + Tailwind v4 build system |
| F02 | React Router Setup | React Router v7 client routing with /learn-rust/ basename & SPA 404 fallback |
| F03 | Vitest Test Infrastructure | Vitest + Happy-DOM + Testing Library unit/integration test suite |
| F04 | Navigation & Responsive Layout | Desktop nav, mobile hamburger drawer, sidebar curriculum navigation |
| F05 | Theming Engine | Light, Dark, System theme mode with prefers-color-scheme listener |
| F06 | Tri-lingual i18n System | Chinese (zh), English (en), Japanese (ja) with automatic locale detection |
| F07 | LocalStorage Progress Engine | Schema learn_rust_progress_v1 persistence, export/import/reset |
| F08 | Ferris Mascot SVG Component | Vector Ferris mascot supporting 7 distinct emotional moods |
| F09 | Ownership & Move Visualizer | Interactive stack & heap memory diagram illustrating move semantics |
| F10 | Borrow Checker & Lifetimes Visualizer | Shared vs mutable reference lease Gantt chart and NLL validation |
| F11 | Memory Layout & Slice Visualizer | Struct byte alignment, fat pointer slices, vector capacity growth |
| F12 | Trait Dispatch Visualizer | Monomorphization code expansion vs dynamic VTable jump tracing |
| F13 | Concurrency & Mutex Visualizer | MPSC channel queueing and Arc<Mutex<T>> contention handoff |
| F14 | Error Handling Visualizer | Railway track Result/Option chaining with ? operator short-circuiting |
| F15 | Curriculum: 10 Progressive Modules | Progressive modules covering beginner to advanced Rust concepts |
| F16 | Interactive Quizzes & Challenges | Knowledge check quizzes with instant evaluation and progress scoring |
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
│   │   ├── layout/                 # Header, Sidebar, Breadcrumbs, Footer, MobileNav
│   │   ├── mascot/                 # Ferris vector mascot with 7 moods
│   │   └── visualizers/            # 6 interactive Rust concept state machines
│   ├── routes/                     # React Router page views
│   │   ├── Home.tsx
│   │   ├── Curriculum.tsx
│   │   ├── LessonPage.tsx
│   │   ├── VisualizersGallery.tsx
│   │   ├── ProgressPage.tsx
│   │   └── NotFound.tsx
│   ├── lib/
│   │   ├── storage.ts              # LocalStorage progress persistence engine
│   │   └── utils.ts                # Tailwind cn utility
│   ├── tests/
│   │   └── e2e/                    # Vitest + Testing Library E2E test suites
│   │       ├── helpers/            # render-app, storage-mock, viewport, visualizer-driver
│   │       └── tier1-features/     # T1 Feature Coverage suites
│   ├── App.tsx                     # Top-level RouterProvider
│   └── main.tsx                    # React 19 createRoot entry point
├── vite.config.ts                  # Base path and Tailwind plugins
└── vitest.config.ts                # Happy-DOM test configuration
```

---

## 3. How to Add New Modules & Visualizers

### 3.1 Adding a New Curriculum Module
1. Define metadata in `src/routes/Curriculum.tsx` under the `lessons` array.
2. Add full lesson content, overview, and code examples in `src/routes/LessonPage.tsx`.
3. Provide tri-lingual translations for title, description, and key concepts (`zh`, `en`, `ja`).

### 3.2 Adding a New Visualizer
1. Implement component under `src/components/visualizers/` implementing `VisualizerProps` from `types.ts`.
2. Include controls: Previous Step, Next Step, Reset, and optional Play/Pause.
3. Use accessible roles, standard button text or `aria-label`, and `data-testid` where appropriate.
4. Register the card in `src/routes/VisualizersGallery.tsx`.

---

## 4. Testing & Quality Standards

- **Runner**: Vitest with `happy-dom` environment.
- **Opaque-Box Testing**: All test suites in `src/tests/e2e/` must interact through accessible roles (`getByRole`, `within`), labels (`getByLabelText`), or standard DOM text. Avoid reaching into private component state.
- **Execution**: Run `pnpm test:run` or `pnpm test:e2e` to verify changes.

---

## 5. Troubleshooting Common Issues

### 5.1 Tailwind CSS v4 Build Warnings
Tailwind v4 is loaded as a Vite plugin via `@tailwindcss/vite` instead of a PostCSS configuration. Ensure `@import "tailwindcss";` is present at the top of `src/index.css`.

### 5.2 GitHub Pages Routing & Base Path
The app is hosted at `/learn-rust/`. All route links must use relative React Router paths (`/curriculum`, `/visualizers`), while Vite handles the base path prefix automatically. Direct deep links in production are restored via `public/404.html`.

### 5.3 Happy-DOM Test Quirks
- For media queries, use `createMatchMediaMock()` in `src/tests/e2e/setup.ts`.
- When asserting clipboard writes, mock `navigator.clipboard` using `Object.defineProperty`.
- Always reset `localStorage` and `document.documentElement` before each test.
