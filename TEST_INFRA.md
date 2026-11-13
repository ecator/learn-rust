# Learn Rust E2E Testing Infrastructure & Specification Blueprint
**Document Version:** 1.0.0  
**Target Project:** Learn Rust Interactive Learning Web App (`ecator/learn-rust`)  
**Standard Compliance:** WCAG 2.1 AA/AAA, React Router v7 SPA, Vitest + Testing Library  

---

## 1. Executive Summary & Architecture Blueprint

This document defines the comprehensive end-to-end (E2E) and integration test specifications for the **Learn Rust** interactive web application across all 18 core features (F01 through F18) and across four test tiers:
- **Tier 1: Feature Coverage** (Minimum 5 test cases per feature = 90 test cases)
- **Tier 2: Boundary & Corner Cases** (Minimum 5 test cases per feature = 90 test cases)
- **Tier 3: Cross-Feature Pairwise Combinations** (All-Pairs orthogonal matrix covering Language × Theme × Viewport × Route × State)
- **Tier 4: Real-World Application Workloads** (5 multi-step holistic learner journeys)

### 1.1 Testing Stack & Execution Environment
- **Runner**: Vitest (`vitest`) with ESM module resolution and TS support.
- **DOM Environment**: `happy-dom` (fast, lightweight DOM implementation with custom window polyfills).
- **DOM Testing Utilities**: `@testing-library/react` (v16+) and `@testing-library/user-event` (v14+).
- **Assertions**: Vitest built-in Chai-compatible matchers (`expect`) extended with `@testing-library/jest-dom` matchers (`toBeInTheDocument`, `toHaveAttribute`, `toHaveClass`, `toHaveTextContent`).

### 1.2 Strict Opaque-Box Testing Guidelines
To guarantee high test resilience and zero coupling to internal implementation details:
1. **Querying by Role and Accessible Name**: All interactive elements MUST be queried via `getByRole` / `findByRole` with `{ name: ... }`, `getByLabelText`, or standard semantic elements (`heading`, `button`, `navigation`, `main`, `region`, `combobox`, `radio`, `tab`, `tabpanel`).
2. **Accessible Text & Localization Agnostic Hooks**: When verifying localized UI, queries MUST verify expected localized text matching the active language (`zh`, `en`, `ja`) or use semantic `aria-label` / `data-testid` only where standard ARIA roles are ambiguous (e.g. specific SVG nodes in visualizers).
3. **URL & Navigation Assertions**: Navigation MUST be asserted via `window.location.pathname` and `window.location.search`, reflecting the GitHub Pages base path `/learn-rust/`.
4. **State Verification via External Side Effects**: State MUST be observed through DOM updates, ARIA attributes (`aria-selected="true"`, `aria-checked="true"`, `aria-valuenow`), document class mutations (`document.documentElement.classList.contains('dark')`), or `localStorage` serialization. Direct access to component React state (`fiber`, `useState` hooks) is strictly prohibited.

---

## 2. Directory & Harness Blueprint

### 2.1 Test Directory Structure
```
src/
└── tests/
    ├── e2e/
    │   ├── setup.ts                           # Global happy-dom polyfills & test lifecycle
    │   ├── helpers/
    │   │   ├── render-app.tsx                 # Root app wrapper with MemoryRouter & Providers
    │   │   ├── storage-mock.ts                # Deterministic localStorage seeders & spies
    │   │   ├── viewport.ts                    # Window resize & matchMedia mocks
    │   │   ├── visualizer-driver.ts           # Opaque-box visualizer interaction driver
    │   │   └── accessibility.ts               # Contrast ratio & ARIA validator
    │   ├── tier1-features/
    │   │   ├── t1-f01-f03-foundation.test.tsx # Scaffolding, Routing, Vitest Setup
    │   │   ├── t1-f04-f06-layout-i18n.test.tsx# Navigation, Theming, Tri-lingual i18n
    │   │   ├── t1-f07-f08-storage-mascot.test.tsx # Progress Storage & Ferris Mascot
    │   │   ├── t1-f09-f11-core-visualizers.test.tsx # Ownership, Borrow, Memory Layout
    │   │   ├── t1-f12-f14-adv-visualizers.test.tsx  # Traits, Concurrency, Error Handling
    │   │   └── t1-f15-f18-curriculum-ops.test.tsx  # Curriculum, Quizzes, CI/CD, Docs
    │   ├── tier2-boundaries/
    │   │   ├── t2-f01-f06-boundaries.test.tsx
    │   │   ├── t2-f07-f11-boundaries.test.tsx
    │   │   └── t2-f12-f18-boundaries.test.tsx
    │   ├── tier3-pairwise/
    │   │   ├── pairwise-matrix.data.ts       # Generated All-Pairs test vectors
    │   │   └── t3-pairwise-combinations.test.tsx
    │   └── tier4-journeys/
    │       ├── t4-journey1-novice-ownership.test.tsx
    │       ├── t4-journey2-borrow-mastery.test.tsx
    │       ├── t4-journey3-polyglot-nightowl.test.tsx
    │       ├── t4-journey4-data-migration.test.tsx
    │       └── t4-journey5-concurrency-errorflow.test.tsx
```

### 2.2 Global Test Harness Polyfills (`src/tests/e2e/setup.ts`)
```typescript
import '@testing-library/jest-dom';
import { beforeEach, afterEach, vi } from 'vitest';

// 1. matchMedia polyfill for Theme (prefers-color-scheme) & Responsive queries
class MockMediaQueryList implements MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => any) | null = null;
  private listeners: Array<(e: MediaQueryListEvent) => void> = [];

  constructor(media: string, matches: boolean = false) {
    this.media = media;
    this.matches = matches;
  }
  addEventListener(type: string, listener: any) { this.listeners.push(listener); }
  removeEventListener(type: string, listener: any) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  addListener(listener: any) { this.addEventListener('change', listener); }
  removeListener(listener: any) { this.removeEventListener('change', listener); }
  dispatchEvent(event: Event): boolean { return true; }
  setMatches(matches: boolean) {
    this.matches = matches;
    const ev = { matches, media: this.media } as MediaQueryListEvent;
    this.listeners.forEach(l => l(ev));
  }
}

// 2. ResizeObserver polyfill
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 3. window.scrollTo polyfill
window.scrollTo = vi.fn();

// 4. Reset DOM and LocalStorage between runs
beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.lang = 'zh';
});
```

---

## 3. Formal Testing Methodologies

### 3.1 Category-Partition Method
For each feature, parameters and environment variables are partitioned into disjoint equivalence classes with constraints:
- **Input Parameters**: User clicks, keyboard navigation, text search, quiz option selections, slider step index.
- **Environment Characteristics**: Viewport dimensions (Mobile 375×667, Tablet 768×1024, Desktop 1280×800), Browser preferred language (`navigator.language` in `['zh-CN', 'en-US', 'ja-JP', 'fr-FR']`), OS theme preference (`prefers-color-scheme: dark | light`), LocalStorage state (empty, valid schema v1, corrupted JSON, schema mismatch).
- **Constraint Matrix**:
  - `[Property]` annotations ensure incompatible states (e.g. mobile drawer open simultaneously with desktop static sidebar) are handled cleanly.
  - `[Error]` partitions specify invalid states that must yield graceful fallbacks without crashing the React root.

### 3.2 Boundary Value Analysis (BVA)
BVA targets edge transitions across:
- **Step Visualizers**: `step = -1` (underflow), `step = 0` (first step), `step = N-1` (penultimate), `step = N` (terminal), `step = N+1` (overflow attempt).
- **Curriculum Pagination**: First lesson (Previous disabled), Last lesson (Next redirects to completion/curriculum), Lesson jump bounds.
- **LocalStorage Data Capacity & Structure**: 0-byte initial state, 5MB quota exhaustion simulation, null values, partial object keys missing (`version` missing, corrupted dates).
- **Viewport Boundaries**: Exactly 767px (mobile layout) vs 768px (desktop breakpoint transition).
- **Rapid Interactive Events**: 10 rapid clicks within 50ms on Play/Step button or Language selector to test race conditions and debouncing.

### 3.3 Combinatorial / Pairwise (All-Pairs) Strategy
Cross-feature interactions are condensed via Orthogonal Array All-Pairs generation covering:
1. **Factor 1: Language (`LANG`)**: `zh` | `en` | `ja` (3 levels)
2. **Factor 2: Theme (`THEME`)**: `light` | `dark` | `system` (3 levels)
3. **Factor 3: Viewport (`VIEWPORT`)**: `mobile` (375px) | `desktop` (1280px) (2 levels)
4. **Factor 4: Route (`ROUTE`)**: `/learn-rust/` | `/learn-rust/curriculum` | `/learn-rust/lessons/ownership` | `/learn-rust/visualizers` | `/learn-rust/progress` | `/learn-rust/404` (6 levels)
5. **Factor 5: Visualizer Execution (`VIZ_STATE`)**: `initial` | `scrubbing` | `error_sim` | `completed` | `reset` (5 levels)

---

## 4. Tier 1: Feature Coverage Specifications (F01 – F18)

Each test case adheres to the pattern:
`TC-T1-Fxx-yy: [Feature Name] - [Scenario Description]`

---

### F01: Project Scaffolding
- **TC-T1-F01-01: Root Application Mount**  
  *Action*: Render root `App` inside happy-dom.  
  *Assertion*: DOM contains primary application shell (`<div id="root">`), semantic `<header>`, and `<main>` regions without uncaught React runtime exceptions.
- **TC-T1-F01-02: Tailwind CSS Layout Classes Initialization**  
  *Action*: Inspect root container and theme wrapper.  
  *Assertion*: Top-level element features essential utility classes (`min-h-screen`, `bg-`, `text-`).
- **TC-T1-F01-03: TypeScript Strict Mode Type Safety**  
  *Action*: Verify runtime type assertions on context providers (Theme, I18n, Progress).  
  *Assertion*: Providers expose typed context properties without returning `undefined`.
- **TC-T1-F01-04: Asset Link Verification**  
  *Action*: Inspect document `<head>` or navbar for SVG logo / mascot references.  
  *Assertion*: Favicon link and logo `img`/`svg` tags contain valid paths pointing to SVG resources.
- **TC-T1-F01-05: Error Boundary Fallback on Render Crash**  
  *Action*: Trigger a deliberate child render throw inside an isolated test harness.  
  *Assertion*: App renders graceful Error Boundary UI with retry button instead of blank page.

---

### F02: React Router Setup
- **TC-T1-F02-01: Base Path Recognition (`/learn-rust/`)**  
  *Action*: Render app at initial path `/learn-rust/`.  
  *Assertion*: Home page view is mounted; hero section with introductory heading is visible.
- **TC-T1-F02-02: Direct Navigation to Curriculum (`/learn-rust/curriculum`)**  
  *Action*: Navigate to `/learn-rust/curriculum`.  
  *Assertion*: Curriculum catalog heading renders; list of 10 modules is displayed in the document.
- **TC-T1-F02-03: Lesson Route Parameter Matching (`/learn-rust/lessons/:slug`)**  
  *Action*: Navigate to `/learn-rust/lessons/ownership`.  
  *Assertion*: Lesson page for "ownership" loads; displays lesson title, code snippet, and ownership visualizer.
- **TC-T1-F02-04: Visualizer Gallery Route (`/learn-rust/visualizers`)**  
  *Action*: Navigate to `/learn-rust/visualizers`.  
  *Assertion*: Visualizer gallery page loads with cards for all 6 interactive visualizers.
- **TC-T1-F02-05: Client-Side 404 Fallback Route (`/learn-rust/non-existent-route`)**  
  *Action*: Navigate to an unknown URL `/learn-rust/unknown-xyz`.  
  *Assertion*: 404 Not Found component renders with "Page Not Found" message and a working "Return Home" button.

---

### F03: Vitest Test Infrastructure
- **TC-T1-F03-01: Happy-DOM Environment Validation**  
  *Action*: Query global `window`, `document`, and `navigator` objects in test execution.  
  *Assertion*: Globals are defined and permit standard DOM manipulations (`createElement`, `dispatchEvent`).
- **TC-T1-F03-02: UserEvent User Interaction Dispatch**  
  *Action*: Dispatch `userEvent.click` on a button.  
  *Assertion*: Click listener fires synchronously and updates DOM without synthetic event discrepancies.
- **TC-T1-F03-03: Asynchronous Render Timing & waitFor**  
  *Action*: Trigger an async state transition (e.g. timeout or resolved promise).  
  *Assertion*: `waitFor` resolves correctly within the default 1000ms timeout.
- **TC-T1-F03-04: Mock Cleanup Integrity**  
  *Action*: Configure `vi.spyOn(localStorage, 'setItem')`, run test, unmount.  
  *Assertion*: Spy does not leak into subsequent test suites; clean sandbox guaranteed.
- **TC-T1-F03-05: Jest-DOM Custom Matchers Support**  
  *Action*: Run assertions using `toBeVisible()`, `toHaveAttribute()`, and `toHaveClass()`.  
  *Assertion*: Matchers evaluate correctly and give descriptive assertion failure messages.

---

### F04: Navigation & Responsive Layout
- **TC-T1-F04-01: Desktop Navigation Links Rendering**  
  *Action*: Set viewport to 1280×800.  
  *Assertion*: Header displays nav links: "Home", "Curriculum", "Visualizers", "Progress" with appropriate accessible roles.
- **TC-T1-F04-02: Header Navigation Click Transitions**  
  *Action*: Click "Visualizers" nav link.  
  *Assertion*: URL updates to `/learn-rust/visualizers`, active nav link has `aria-current="page"`.
- **TC-T1-F04-03: Mobile Viewport Hamburger Menu Toggle**  
  *Action*: Set viewport to 375×667; verify desktop nav is hidden and hamburger button is present. Click hamburger button.  
  *Assertion*: Mobile drawer opens, `aria-expanded="true"`, navigation links become visible in the drawer.
- **TC-T1-F04-04: Sidebar Curriculum Navigation in Lesson Page**  
  *Action*: Navigate to `/learn-rust/lessons/ownership` on desktop.  
  *Assertion*: Sidebar lists modules; current module is highlighted with active styling.
- **TC-T1-F04-05: Breadcrumbs Trail Navigation**  
  *Action*: View breadcrumbs on `/learn-rust/lessons/ownership`.  
  *Assertion*: Trail displays `Home > Curriculum > Ownership & Borrowing`; clicking `Curriculum` returns to `/learn-rust/curriculum`.

---

### F05: Theming Engine
- **TC-T1-F05-01: Default Theme Follows System Preference (Dark)**  
  *Action*: Set system media query `prefers-color-scheme: dark`, clear `localStorage`. Render app.  
  *Assertion*: `document.documentElement.classList` contains `dark`.
- **TC-T1-F05-02: Default Theme Follows System Preference (Light)**  
  *Action*: Set system media query `prefers-color-scheme: light`, clear `localStorage`. Render app.  
  *Assertion*: `document.documentElement.classList` does NOT contain `dark`.
- **TC-T1-F05-03: Manual Theme Switch to Dark**  
  *Action*: Click Theme toggle button; select "Dark".  
  *Assertion*: `document.documentElement` gains `.dark` class; `localStorage.getItem('learn_rust_theme')` is `'dark'`.
- **TC-T1-F05-04: Manual Theme Switch to Light**  
  *Action*: Set theme to dark, then click Theme toggle button and select "Light".  
  *Assertion*: `document.documentElement` loses `.dark` class; `localStorage.getItem('learn_rust_theme')` is `'light'`.
- **TC-T1-F05-05: System Mode Dynamic Adaptation**  
  *Action*: Select "System" theme mode. Dispatch `change` event on `matchMedia('prefers-color-scheme: dark')` toggling to true.  
  *Assertion*: Class `.dark` is added automatically to document root without page reload.

---

### F06: Tri-lingual i18n System
- **TC-T1-F06-01: Auto-detection of Chinese (`zh`) from Browser**  
  *Action*: Mock `navigator.language = 'zh-CN'`; render app with fresh storage.  
  *Assertion*: Navbar links, hero title, and buttons render in Simplified Chinese; `<html lang="zh">`.
- **TC-T1-F06-02: Auto-detection of English (`en`) from Browser**  
  *Action*: Mock `navigator.language = 'en-US'`; render app with fresh storage.  
  *Assertion*: Navbar links and hero title render in English; `<html lang="en">`.
- **TC-T1-F06-03: Auto-detection of Japanese (`ja`) from Browser**  
  *Action*: Mock `navigator.language = 'ja-JP'`; render app with fresh storage.  
  *Assertion*: Navbar links and hero title render in Japanese; `<html lang="ja">`.
- **TC-T1-F06-04: Unknown Language Fallback to Chinese**  
  *Action*: Mock `navigator.language = 'fr-FR'`; render app.  
  *Assertion*: Interface falls back to Chinese (`zh`) text; `<html lang="zh">`.
- **TC-T1-F06-05: Manual Language Switcher Dropdown**  
  *Action*: Click language switcher; choose "English".  
  *Assertion*: All visible text updates to English immediately; `localStorage.getItem('learn_rust_lang')` is `'en'`.

---

### F07: LocalStorage Progress Engine
- **TC-T1-F07-01: Schema Initial State Creation**  
  *Action*: Render app with empty storage. Inspect `localStorage`.  
  *Assertion*: Schema `learn_rust_progress_v1` is initialized with version `1`, empty completed arrays, and valid timestamp.
- **TC-T1-F07-02: Lesson Completion Mark Persistence**  
  *Action*: Navigate to lesson page; click "Mark as Completed" button.  
  *Assertion*: Button text switches to "Completed"; storage record `completedLessons` contains the lesson id.
- **TC-T1-F07-03: Quiz Result State Persistence**  
  *Action*: Complete quiz on a lesson; choose correct answer; click Submit.  
  *Assertion*: Storage `quizStates[lessonId]` contains `{ passed: true, attempts: 1, selectedAnswer: ... }`.
- **TC-T1-F07-04: Progress Export as JSON**  
  *Action*: Navigate to Progress page; click "Export Progress" button.  
  *Assertion*: Triggers download or copies JSON string containing exact valid `UserProgress` schema.
- **TC-T1-F07-05: Progress Reset Action**  
  *Action*: Click "Reset All Progress" button; confirm modal prompt.  
  *Assertion*: `completedLessons` becomes empty array; UI progress bar resets to 0%.

---

### F08: Ferris Mascot SVG Component
- **TC-T1-F08-01: Default Happy Mood Rendering**  
  *Action*: Render `<Ferris mood="happy" />`.  
  *Assertion*: Renders SVG element with accessible label or role `img`, displaying standard open eyes and claw positions.
- **TC-T1-F08-02: Confused Mood Visual State**  
  *Action*: Render `<Ferris mood="confused" />`.  
  *Assertion*: SVG contains question mark element or tilted claw geometry reflecting confused mood.
- **TC-T1-F08-03: Panic Mood Visual State**  
  *Action*: Render `<Ferris mood="panic" />`.  
  *Assertion*: SVG contains wide open panic eyes and raised claws.
- **TC-T1-F08-04: Wizard Mood Visual State**  
  *Action*: Render `<Ferris mood="wizard" />`.  
  *Assertion*: SVG contains wizard hat path and star elements.
- **TC-T1-F08-05: Mood Cycling on Quiz Feedback**  
  *Action*: On quiz component, submit wrong answer then correct answer.  
  *Assertion*: Ferris mood updates from `confused`/`panic` to `happy`/`wizard`.

---

### F09: Ownership & Move Visualizer
- **TC-T1-F09-01: Initial State Stack & Heap Representation**  
  *Action*: Load Ownership Visualizer (`let s1 = String::from("hello");`).  
  *Assertion*: Stack frame renders variable `s1` pointing to Heap memory block containing `"hello"` (`ptr`, `len: 5`, `cap: 5`).
- **TC-T1-F09-02: Step Forward (Move Semantics)**  
  *Action*: Click "Next Step" (`let s2 = s1;`).  
  *Assertion*: Stack displays `s2` pointing to the same heap block; `s1` is visually marked invalid/grayed out with tooltip "Moved/Invalidated".
- **TC-T1-F09-03: Borrow Checker Error on Use-After-Move**  
  *Action*: Advance to step `println!("{}", s1);`.  
  *Assertion*: Visualizer displays compiler error simulation (`E0382: borrow of moved value: 's1'`).
- **TC-T1-F09-04: Step Backwards (Scrubber Reversibility)**  
  *Action*: Advance to step 2, then click "Previous Step".  
  *Assertion*: `s1` is restored to valid ownership; `s2` is removed from stack frame.
- **TC-T1-F09-05: Scope Drop Animation & Deallocation**  
  *Action*: Advance to closing brace `}` of function scope.  
  *Assertion*: Heap memory is freed (`drop(s2)` executed); stack frames pop.

---

### F10: Borrow Checker & Lifetimes Visualizer
- **TC-T1-F10-01: Immutable Multiple Borrows Render**  
  *Action*: Load Borrow visualizer (`let r1 = &x; let r2 = &x;`).  
  *Assertion*: Timeline displays two concurrent shared read leases (`&T`); both marked active without conflict.
- **TC-T1-F10-02: Mutable Lease Exclusivity Simulation**  
  *Action*: Advance to `let m = &mut x;` while `r1` is in scope.  
  *Assertion*: Conflict warning highlights timeline in red (`E0502: cannot borrow 'x' as mutable because it is also borrowed as immutable`).
- **TC-T1-F10-03: Non-Lexical Lifetimes (NLL) End of Scope**  
  *Action*: Advance past the last read of `r1` to a subsequent mutable borrow.  
  *Assertion*: Timeline shows `r1` lease expiring early; subsequent `&mut x` lease successfully acquires without conflict.
- **TC-T1-F10-04: Play/Pause Auto-scrubbing**  
  *Action*: Click "Play" button.  
  *Assertion*: Timer advances steps every interval; button switches to "Pause"; clicking Pause halts stepping.
- **TC-T1-F10-05: Reset Visualizer State**  
  *Action*: Advance to step 4; click "Reset" button.  
  *Assertion*: Visualizer returns to step 0; all active leases reset to initial blank state.

---

### F11: Memory Layout & Slice Visualizer
- **TC-T1-F11-01: Fat Pointer `&str` vs `String` Layout**  
  *Action*: Mount Memory Layout Visualizer.  
  *Assertion*: Stack shows `String` with 3 words (`ptr`, `cap`, `len`) and `&str` with 2 words (`ptr`, `len`).
- **TC-T1-F11-02: Slice Sub-range Visualization**  
  *Action*: Select slice range `&s[1..4]`.  
  *Assertion*: Stack pointer references byte offset +1 in heap; `len` indicates 3 bytes; heap highlight highlights only bytes 1, 2, 3.
- **TC-T1-F11-03: Vec Reallocation & Doubling Capacity**  
  *Action*: Trigger push operations (`vec.push(x)`) exceeding capacity.  
  *Assertion*: Heap memory shows old array freed, new larger buffer allocated with double capacity.
- **TC-T1-F11-04: Alignment & Padding Inspection**  
  *Action*: Switch struct memory layout tab (e.g. `struct Foo { a: u8, b: u64, c: u16 }`).  
  *Assertion*: Diagram renders byte grid illustrating 1-byte, 7-byte padding, 8-byte, 2-byte, 6-byte padding (total 24 bytes).
- **TC-T1-F11-05: Zero-Sized Types (ZST) Representation**  
  *Action*: Select `()` or empty struct `struct Unit;`.  
  *Assertion*: Memory inspector indicates 0 bytes size and alignment 1 without heap allocation.

---

### F12: Trait Dispatch Visualizer
- **TC-T1-F12-01: Static Dispatch (Monomorphization) View**  
  *Action*: Select "Static Dispatch (`impl Trait` / Generics)" tab.  
  *Assertion*: Code view illustrates code duplication/expansion into specialized functions (`draw_circle`, `draw_square`) with direct assembly calls.
- **TC-T1-F12-02: Dynamic Dispatch (`dyn Trait`) VTable View**  
  *Action*: Select "Dynamic Dispatch (`&dyn Trait`)" tab.  
  *Assertion*: Diagram shows fat pointer with Data Pointer pointing to instance and VTable Pointer pointing to function pointer table.
- **TC-T1-F12-03: VTable Jump Step-Through**  
  *Action*: Click "Step" in dynamic dispatch mode.  
  *Assertion*: Animation traces execution: Dereference VTable -> Lookup `draw()` offset -> Jump to target function address.
- **TC-T1-F12-04: Cost Trade-off Comparison Table**  
  *Action*: View performance breakdown tab.  
  *Assertion*: Displays binary size vs runtime indirection comparison between Static and Dynamic dispatch.
- **TC-T1-F12-05: Object Safety Rule Checker**  
  *Action*: Toggle method returning `Self` or having generic parameters.  
  *Assertion*: Visualizer flags object safety violation (`E0038: the trait cannot be made into an object`).

---

### F13: Concurrency & Mutex Visualizer
- **TC-T1-F13-01: Channel MPSC Message Passing**  
  *Action*: Mount Concurrency visualizer in Channel mode; click "Send Message".  
  *Assertion*: Message packet transitions from Producer thread queue into Channel buffer and arrives at Receiver thread.
- **TC-T1-F13-02: `Arc<Mutex<T>>` Contention Simulation**  
  *Action*: Trigger Thread 1 and Thread 2 both requesting lock on shared counter.  
  *Assertion*: Thread 1 acquires lock (green); Thread 2 enters "Waiting/Blocked" state (amber/red).
- **TC-T1-F13-03: Mutex Unlock & Handoff**  
  *Action*: Advance step to drop Thread 1's `MutexGuard`.  
  *Assertion*: Lock releases; Thread 2 unblocks, acquires lock, and increments data value.
- **TC-T1-F13-04: Deadlock Simulation**  
  *Action*: Select "Deadlock Scenario" (Thread A locks L1 then L2; Thread B locks L2 then L1).  
  *Assertion*: Both threads enter mutual blocked state; UI displays deadlock warning indicator.
- **TC-T1-F13-05: Thread Spawn & Join Lifecycle**  
  *Action*: Click "Spawn Thread"; click "Join".  
  *Assertion*: Visual thread timeline forks on spawn and rejoins main thread upon `join().unwrap()`.

---

### F14: Error Handling Visualizer
- **TC-T1-F14-01: `Result::Ok` Railway Track Execution**  
  *Action*: Execute happy path pipeline `parse_input -> validate -> process`.  
  *Assertion*: Green railway track lights up sequentially; final `Ok(value)` token is emitted.
- **TC-T1-F14-02: `Result::Err` Short-Circuit via `?` Operator**  
  *Action*: Set `validate` input to invalid string; advance step.  
  *Assertion*: At `?`, execution diverts from the green track down to the red error track; downstream functions are bypassed; returns early with `Err(ValidationError)`.
- **TC-T1-F14-03: `Option` Combinators (`map`, `and_then`, `unwrap_or`)**  
  *Action*: Select Option chaining tab; supply `Some(5)` then `None`.  
  *Assertion*: `Some` maps through functions; `None` takes default branch indicated by `unwrap_or`.
- **TC-T1-F14-04: Panic vs Recoverable Error Contrast**  
  *Action*: Trigger `unwrap()` on `None`.  
  *Assertion*: Ferris displays `panic` mood; screen displays panic stack unwinding indicator.
- **TC-T1-F14-05: Custom Error Conversion with `From`/`Into`**  
  *Action*: Step through `?` with heterogeneous error types (`io::Error` converted to `AppError`).  
  *Assertion*: Diagram highlights intermediate conversion node invoking `From::from`.

---

### F15: Curriculum: 10 Progressive Modules
- **TC-T1-F15-01: Module Catalog Completeness**  
  *Action*: Navigate to `/learn-rust/curriculum`.  
  *Assertion*: 10 distinct curriculum cards render (M01 Getting Started, M02 Common Concepts, M03 Ownership, M04 Structs & Enums, M05 Pattern Matching, M06 Collections, M07 Error Handling, M08 Generics & Traits, M09 Lifetimes, M10 Concurrency).
- **TC-T1-F15-02: Tri-lingual Content Availability**  
  *Action*: Switch language across `zh`, `en`, `ja` on any lesson page.  
  *Assertion*: Title, description, concepts, and explanation update without missing key warnings or empty text.
- **TC-T1-F15-03: Syntax-Highlighted Code Snippets Rendering**  
  *Action*: Open lesson M03 (Ownership).  
  *Assertion*: Code block renders with preformatted tags (`<pre>`, `<code>`) and syntax token coloring.
- **TC-T1-F15-04: Common Pitfalls Section**  
  *Action*: Scroll to "Pitfalls & Gotchas" section in Lesson page.  
  *Assertion*: Displays compiler error examples, explanation of root cause, and idiomatic fix.
- **TC-T1-F15-05: Next / Previous Lesson Navigation Flow**  
  *Action*: On M01, click "Next Lesson"; on M02, click "Previous Lesson".  
  *Assertion*: Navigates sequentially from `/learn-rust/lessons/01` to `02`, and back to `01`.

---

### F16: Interactive Quizzes & Challenges
- **TC-T1-F16-01: Quiz Option Selection & Radio State**  
  *Action*: Open quiz section in a lesson; click option B.  
  *Assertion*: Radio input or option button shows selected state (`aria-checked="true"`).
- **TC-T1-F16-02: Incorrect Answer Feedback & Explanation**  
  *Action*: Select wrong option; click "Submit Answer".  
  *Assertion*: Red feedback badge appears; explanation is revealed; score is not incremented.
- **TC-T1-F16-03: Correct Answer Feedback & Score Crediting**  
  *Action*: Select correct option; click "Submit Answer".  
  *Assertion*: Green success banner appears; celebration message shows; user XP increases in storage.
- **TC-T1-F16-04: Quiz Retry Mechanism**  
  *Action*: After wrong submission, click "Try Again" button.  
  *Assertion*: Selection resets; options become re-clickable; explanation hides until re-submission.
- **TC-T1-F16-05: Challenge Code Fill-in-the-Blank**  
  *Action*: In a syntax challenge, input missing keyword `mut`; click "Verify".  
  *Assertion*: Syntax checker marks answer valid; checkmark displays.

---

### F17: GitHub Actions CI/CD Workflow
- **TC-T1-F17-01: Workflow YAML Configuration Validity**  
  *Action*: Inspect `.github/workflows/deploy.yml`.  
  *Assertion*: Defines trigger on push to `main`; specifies Node.js, pnpm setup, `pnpm test`, `pnpm build`, and `actions/deploy-pages`.
- **TC-T1-F17-02: Build Output Artifact Directory Path**  
  *Action*: Verify build script target in `vite.config.ts`.  
  *Assertion*: Output dir matches standard `dist/` configured for Pages deployment.
- **TC-T1-F17-03: Vite Base Path Configuration**  
  *Action*: Verify `base` parameter in `vite.config.ts`.  
  *Assertion*: `base` is configured to `'/learn-rust/'` or `process.env.BASE_URL`.
- **TC-T1-F17-04: SPA 404 Routing Redirection File**  
  *Action*: Verify `public/404.html` exists.  
  *Assertion*: Contains script redirecting URL path to index SPA entry point with query parameter preservation.
- **TC-T1-F17-05: Clean Build Verification**  
  *Action*: Execute `pnpm build` in headless dry run.  
  *Assertion*: Build succeeds with zero TypeScript errors and generates `dist/index.html`.

---

### F18: Documentation (README & AGENTS)
- **TC-T1-F18-01: README Structure & Feature Overview**  
  *Action*: Read `README.md`.  
  *Assertion*: Contains project title, live demo URL link, feature highlights, local setup commands (`pnpm install`, `pnpm dev`, `pnpm test`), and tech stack badges.
- **TC-T1-F18-02: AGENTS.md Architecture & Maintenance Guidelines**  
  *Action*: Read `AGENTS.md`.  
  *Assertion*: Contains architecture overview, directory conventions, guidelines for adding new lessons and visualizers, and state management rules.
- **TC-T1-F18-03: Bilingual / Tri-lingual Quick Start Instructions**  
  *Action*: Check README language options or clear localized sections.  
  *Assertion*: Setup commands and features are documented clearly.
- **TC-T1-F18-04: Accurate Repository & License Links**  
  *Action*: Check license link in README.  
  *Assertion*: Points to MIT / Apache 2.0 LICENSE file in repository root.
- **TC-T1-F18-05: Contributor & Troubleshooting Guidance**  
  *Action*: Check AGENTS.md for troubleshooting common build and test issues.  
  *Assertion*: Includes troubleshooting for Tailwind v4, Vite base path, and happy-dom test quirks.

---

## 5. Tier 2: Boundary & Corner Cases Specifications (F01 – F18)

Each test case targets edge inputs, limits, corrupt states, and rapid asynchronous interactions:
`TC-T2-Fxx-yy: [Feature Name] - [Boundary Scenario]`

---

### F01: Scaffolding Boundaries
- **TC-T2-F01-01: Missing Root Element in HTML**  
  *Scenario*: App bootstrap executed when `#root` is missing.  
  *Assertion*: Throws a clean initialization error rather than silent undefined failure.
- **TC-T2-F01-02: Extreme Viewport Scaling (200px Mobile & 4K Ultra-wide 3840px)**  
  *Scenario*: Resize viewport to 200×600 and 3840×2160.  
  *Assertion*: Content does not create horizontal document scroll or broken overlapping layouts.
- **TC-T2-F01-03: Dynamic Script Injection / XSS in Code Display**  
  *Scenario*: Code snippet containing `<script>alert(1)</script>` or `"><img onerror=...>` rendered in lesson code block.  
  *Assertion*: Content is strictly escaped as text; no script execution or DOM injection occurs.
- **TC-T2-F01-04: High Latency Slow Render / Concurrent Re-renders**  
  *Scenario*: Trigger 50 rapid sequential state updates.  
  *Assertion*: App remains stable without infinite re-render loops or memory leaks.
- **TC-T2-F01-05: Missing System Fonts Fallback**  
  *Scenario*: Disable custom web fonts.  
  *Assertion*: Fallback font stack (`system-ui`, `-apple-system`, `sans-serif`, `monospace`) renders legibly.

---

### F02: React Router Boundaries
- **TC-T2-F02-01: Trailing Slash Insensitivity (`/learn-rust/curriculum/` vs `/learn-rust/curriculum`)**  
  *Scenario*: Navigate with and without trailing slash.  
  *Assertion*: Both resolve to the identical Curriculum component view.
- **TC-T2-F02-02: URL Case Sensitivity & Query Parameter Preservation**  
  *Scenario*: Navigate to `/learn-rust/lessons/ownership?ref=sidebar&step=2`.  
  *Assertion*: Route matches correctly; query parameters remain accessible in `location.search`.
- **TC-T2-F02-03: Rapid Back/Forward Browser History Cycling**  
  *Scenario*: Dispatch 10 rapid `popstate` events alternating between Lesson and Home.  
  *Assertion*: Router stays synchronized with current history index without desynchronization.
- **TC-T2-F02-04: Non-existent Lesson Slug (`/learn-rust/lessons/invalid-slug-999`)**  
  *Scenario*: Navigate to valid lesson prefix but non-existent module slug.  
  *Assertion*: Displays localized "Lesson Not Found" fallback with a button back to Curriculum catalog.
- **TC-T2-F02-05: Double Slashes and Malformed URIs (`/learn-rust//lessons///ownership`)**  
  *Scenario*: Navigate with redundant slashes.  
  *Assertion*: Sanitized cleanly by router; does not 404 crash.

---

### F03: Test Infrastructure Boundaries
- **TC-T2-F03-01: LocalStorage Quota Exceeded Simulation**  
  *Scenario*: Mock `localStorage.setItem` to throw `QuotaExceededError`.  
  *Assertion*: Storage engine catches error, logs warning, and alerts user gracefully without application crash.
- **TC-T2-F03-02: Zero-Timer Race Condition in userEvent**  
  *Scenario*: Rapid keypresses dispatched with `delay: 0`.  
  *Assertion*: All keystrokes recorded in correct sequential order without skipped characters.
- **TC-T2-F03-03: Unhandled Promise Rejection in Async Hook**  
  *Scenario*: An async fetch/computation rejects unexpectedly.  
  *Assertion*: Global error listener captures rejection; test runner reports error clearly.
- **TC-T2-F03-04: Window MediaQueryList Missing Listener Methods**  
  *Scenario*: Older browser simulation where `addEventListener` on media query is undefined and only `addListener` exists.  
  *Assertion*: Theme listener detects legacy method and attaches listener cleanly.
- **TC-T2-F03-05: Multi-root Concurrent Mounts in Same DOM**  
  *Scenario*: Mount two separate app instances in the same happy-dom document.  
  *Assertion*: Each operates independently without shared state leakage outside localStorage.

---

### F04: Navigation & Responsive Layout Boundaries
- **TC-T2-F04-01: Breakpoint Edge at Exactly 767px vs 768px**  
  *Scenario*: Resize viewport from 767px (mobile) to 768px (tablet/desktop) while mobile drawer is open.  
  *Assertion*: Mobile drawer auto-closes or hides; desktop sidebar/header smoothly appears without ghost overlays.
- **TC-T2-F04-02: Deep Nested Route Breadcrumb Overflow**  
  *Scenario*: Long lesson titles on small mobile screens (320px).  
  *Assertion*: Breadcrumb wraps or truncates gracefully (`truncate` ellipsis) without pushing nav controls off-screen.
- **TC-T2-F04-03: Keyboard Escape Closes Mobile Navigation Drawer**  
  *Scenario*: Open mobile drawer; press `Escape` key.  
  *Assertion*: Drawer closes; focus returns to the hamburger trigger button (`aria-expanded="false"`).
- **TC-T2-F04-04: Rapid Multi-click on Mobile Drawer Toggle**  
  *Scenario*: Click hamburger button 10 times in 100ms.  
  *Assertion*: Final drawer open/close state matches parity of clicks; animation does not freeze in intermediate state.
- **TC-T2-F04-05: Focus Trap Inside Open Mobile Navigation Modal**  
  *Scenario*: Tab through elements while mobile drawer is open.  
  *Assertion*: Focus remains trapped within drawer links and does not escape to background page.

---

### F05: Theming Engine Boundaries
- **TC-T2-F05-01: Rapid Theme Switching (5 Clicks in 100ms)**  
  *Scenario*: Alternate theme light -> dark -> light -> dark rapidly.  
  *Assertion*: Final state accurately matches last clicked option; class list has exactly one matching class; no duplicate classes.
- **TC-T2-F05-02: Corrupted Theme Value in LocalStorage**  
  *Scenario*: `localStorage.setItem('learn_rust_theme', 'invalid_random_string')`; reload app.  
  *Assertion*: Falls back safely to `'system'` mode; does not throw exception.
- **TC-T2-F05-03: System Preference Toggling Mid-Session in System Mode**  
  *Scenario*: User is on System theme; OS toggles dark mode on and off 3 times.  
  *Assertion*: Document class updates every time immediately in sync.
- **TC-T2-F05-04: System Preference Ignored When Manual Override Active**  
  *Scenario*: User explicitly selected "Dark"; OS toggles to light mode.  
  *Assertion*: Document remains in `.dark`; manual user choice overrides OS preference.
- **TC-T2-F05-05: WCAG Color Contrast Compliance Across All Tokens**  
  *Scenario*: Inspect computed text color and background color of code blocks, body text, and alerts in both light and dark modes.  
  *Assertion*: Body text contrast >= 4.5:1 (AA); headings >= 3:1.

---

### F06: Tri-lingual i18n System Boundaries
- **TC-T2-F06-01: Unsupported Subtag / Regional Locale (`zh-TW`, `zh-HK`, `en-GB`, `ja-JP-mac`)**  
  *Scenario*: Set `navigator.language` to `zh-TW` or `en-GB`.  
  *Assertion*: Correctly maps `zh-*` to `zh`, `en-*` to `en`, `ja-*` to `ja`.
- **TC-T2-F06-02: Corrupted Language Value in LocalStorage**  
  *Scenario*: `localStorage.setItem('learn_rust_lang', 'klingon')`; reload app.  
  *Assertion*: Falls back gracefully to `'zh'`; does not fail.
- **TC-T2-F06-03: Interpolation of Missing or Null Dynamic Parameters**  
  *Scenario*: Call `t('greeting', { name: undefined as any })`.  
  *Assertion*: Renders fallback placeholder without `Cannot read property of undefined` crash.
- **TC-T2-F06-04: Non-breaking Layout with Long German/Cyrillic Strings Simulation**  
  *Scenario*: Render simulated longest string variations in buttons and headers.  
  *Assertion*: Buttons do not clip or break container boundaries; flexbox wrapping behaves correctly.
- **TC-T2-F06-05: Missing Translation Key Fallback**  
  *Scenario*: Call `t('non.existent.key')`.  
  *Assertion*: Returns the key name (`non.existent.key`) or English fallback rather than returning empty blank or crashing.

---

### F07: LocalStorage Progress Boundaries
- **TC-T2-F07-01: Severely Corrupted JSON in Storage**  
  *Scenario*: `localStorage.setItem('learn_rust_progress_v1', '{invalid-json:&&')`; reload app.  
  *Assertion*: Catch handler triggers auto-repair; re-initializes clean schema; application loads smoothly.
- **TC-T2-F07-02: Legacy Schema Migration (Schema Version Mismatch)**  
  *Scenario*: `localStorage.setItem('learn_rust_progress_v1', JSON.stringify({ version: 0, oldData: true }))`.  
  *Assertion*: Engine migrates or resets safely to version 1 without losing incompatible data where recoverable.
- **TC-T2-F07-03: Progress Data Import of Malformed File**  
  *Scenario*: User uploads random text file or JSON missing required arrays into "Import Progress".  
  *Assertion*: Shows descriptive error notification ("Invalid progress backup file format"); preserves existing storage intact.
- **TC-T2-F07-04: Cross-Tab Storage Event Synchronization**  
  *Scenario*: Dispatch `window.dispatchEvent(new StorageEvent('storage', { key: 'learn_rust_progress_v1', newValue: ... }))`.  
  *Assertion*: Active view updates progress indicator and completed checkmarks without requiring manual page refresh.
- **TC-T2-F07-05: Max Length Arrays Handling (10,000 Completed IDs Stress)**  
  *Scenario*: Populate `completedLessons` with 1,000 synthetic IDs.  
  *Assertion*: Progress calculation evaluates without UI lag or memory leak.

---

### F08: Ferris Mascot Boundaries
- **TC-T2-F08-01: Unknown / Undefined Mood Prop**  
  *Scenario*: Pass `<Ferris mood={'surprise' as any} />`.  
  *Assertion*: Safely defaults to `'happy'` mood without SVG rendering error.
- **TC-T2-F08-02: Zero and Scaled SVG Dimensions (`width={0}`, `width={1000}`)**  
  *Scenario*: Render Ferris with 0px and 1000px widths.  
  *Assertion*: SVG maintains `viewBox` aspect ratio; does not overflow parent or cause NaN attributes.
- **TC-T2-F08-03: High Contrast Mode Inversion Support**  
  *Scenario*: Toggle dark theme with Ferris mascot rendered.  
  *Assertion*: Ferris outline and eyes maintain WCAG visibility contrast against dark background.
- **TC-T2-F08-04: Screen Reader Accessibility with Mood Announcement**  
  *Scenario*: Inspect accessibility tree for `<Ferris mood="panic" />`.  
  *Assertion*: Element contains `role="img"` and `aria-label="Ferris the Crab (panic)"` (or localized equivalent).
- **TC-T2-F08-05: Rapid Consecutive Mood Switches (10 Moods in 50ms)**  
  *Scenario*: Switch moods in a tight loop.  
  *Assertion*: SVG smoothly re-renders the final target mood without lingering intermediate paths.

---

### F09: Ownership Visualizer Boundaries
- **TC-T2-F09-01: Step Scrubber Underflow (Previous at Step 0)**  
  *Scenario*: At step 0, click "Previous Step" button.  
  *Assertion*: Button is disabled (`disabled` attribute and `aria-disabled="true"`); step remains 0.
- **TC-T2-F09-02: Step Scrubber Overflow (Next at Last Step)**  
  *Scenario*: Advance to maximum step $N$; click "Next Step" button.  
  *Assertion*: Button is disabled; step remains at $N$; does not throw out-of-bounds index error.
- **TC-T2-F09-03: Clone vs Move Boundary Distinction**  
  *Scenario*: Toggle `let s2 = s1.clone()` instead of `let s2 = s1`.  
  *Assertion*: Diagram renders two separate heap allocations; both `s1` and `s2` remain valid pointers simultaneously.
- **TC-T2-F09-04: Re-allocation During String Mutation**  
  *Scenario*: Step through `s.push_str(", world! This is a long string that exceeds capacity")`.  
  *Assertion*: Heap block updates address; capacity increases; old heap memory location is marked freed.
- **TC-T2-F09-05: Rapid Scrubbing via Slider Input**  
  *Scenario*: Drag slider thumb from min to max and back to min within 20ms.  
  *Assertion*: Memory states reflect slider position accurately without asynchronous rendering drift.

---

### F10: Borrow Checker Boundaries
- **TC-T2-F10-01: Maximum Simultaneous Shared Borrows (10 Active Borrows)**  
  *Scenario*: Simulate code with `r1..r10` all borrowing `x`.  
  *Assertion*: Gantt timeline renders 10 parallel stacked bars legibly without vertical overlapping or clipping.
- **TC-T2-F10-02: Simultaneous Re-borrowing from a Mutable Reference**  
  *Scenario*: Step through `let ref_mut = &mut x; let reborrow = &*ref_mut;`.  
  *Assertion*: Visualizer highlights temporary suspension of `ref_mut` while `reborrow` is active, and reactivation when `reborrow` expires.
- **TC-T2-F10-03: Multiple Leases Expiring Simultaneously in Same Block**  
  *Scenario*: Step past closing curly brace where 3 references drop together.  
  *Assertion*: All 3 leases expire on the timeline simultaneously in a single frame.
- **TC-T2-F10-04: Lifetimes Outliving Struct Owner Edge**  
  *Scenario*: Step through struct holding reference that outlives referee (`struct Ref<'a> { x: &'a i32 }`).  
  *Assertion*: Compile error simulation triggers with lifetime visual annotation showing lifetime `'a` extending beyond owner.
- **TC-T2-F10-05: Auto-Play Timer Cancellation on Component Unmount**  
  *Scenario*: Start auto-play; abruptly navigate away to Home page.  
  *Assertion*: `setInterval` timer is cleared; no "Can't perform a React state update on an unmounted component" warning.

---

### F11: Memory Layout Boundaries
- **TC-T2-F11-01: Empty Slice Boundary (`&s[0..0]`)**  
  *Scenario*: Select empty range `0..0`.  
  *Assertion*: Stack pointer points to index 0; length is 0; heap diagram indicates 0 bytes highlighted without error.
- **TC-T2-F11-02: Out of Bounds Slice Range Simulation (`&s[0..100]`)**  
  *Scenario*: Attempt to slice beyond String length.  
  *Assertion*: Visualizer flags runtime panic (`byte index 100 is out of bounds`) with red alert indicator.
- **TC-T2-F11-03: UTF-8 Multi-byte Character Splitting Boundary (Emoji / CJK)**  
  *Scenario*: Slice string `"🦀Rust"` at byte index 1 (`&s[0..1]`).  
  *Assertion*: Visualizer flags UTF-8 boundary panic (`byte index 1 is not a char boundary; it is inside '🦀' (bytes 0..4)`).
- **TC-T2-F11-04: Vec with Zero Capacity (`Vec::new()`)**  
  *Scenario*: Inspect unallocated vector.  
  *Assertion*: Stack shows pointer as dangling (`NonNull::dangling()`), capacity `0`, length `0`; no heap allocation shown.
- **TC-T2-F11-05: Recursive Data Structure (Boxed List Node Layout)**  
  *Scenario*: Select linked list node `struct Node { val: i32, next: Option<Box<Node>> }`.  
  *Assertion*: Stack points to Heap Node 1; Heap Node 1 points to Heap Node 2; terminates cleanly at `None` (null pointer optimization).

---

### F12: Trait Dispatch Boundaries
- **TC-T2-F12-01: Large VTable with 20 Methods**  
  *Scenario*: Display trait with numerous method definitions.  
  *Assertion*: VTable table displays cleanly with internal scrolling; method offset calculations (`+0x00`, `+0x08`, `+0x10`) remain accurate.
- **TC-T2-F12-02: Downcasting via `Any` Boundary**  
  *Scenario*: Step through `dyn Any` downcast attempt to concrete type.  
  *Assertion*: Success shows type ID match; failure displays `None` return branch.
- **TC-T2-F12-03: Multiple Trait Bounds (`T: TraitA + TraitB + Clone`)**  
  *Scenario*: Select generic function with compound bounds.  
  *Assertion*: Monomorphization inspector lists compiler verification checkmarks for all three bounds before generating concrete instance.
- **TC-T2-F12-04: Zero Trait Methods (Marker Traits: `Send`, `Sync`)**  
  *Scenario*: Inspect marker trait dispatch.  
  *Assertion*: Visualizer clarifies marker traits produce 0-sized VTables and purely compile-time static verification.
- **TC-T2-F12-05: Supertrait VTable Layout (`trait Sub: Super`)**  
  *Scenario*: Inspect trait inheritance layout.  
  *Assertion*: VTable diagram shows supertrait method pointers preceding or nested within subtrait table.

---

### F13: Concurrency Boundaries
- **TC-T2-F13-01: Dropped Channel Sender (Disconnected Channel)**  
  *Scenario*: Sender drops before message sent; Receiver calls `rx.recv()`.  
  *Assertion*: Receiver receives `Err(RecvError)` indicating disconnected channel; doesn't hang forever.
- **TC-T2-F13-02: Zero-Capacity Channel (Rendezvous Channel)**  
  *Scenario*: Synchronous channel `sync_channel(0)`.  
  *Assertion*: Sender remains blocked until receiver is ready to receive at exact same instant.
- **TC-T2-F13-03: Poisoned Mutex Recovery Simulation**  
  *Scenario*: Thread holding Mutex panics before unlock.  
  *Assertion*: Subsequent `lock()` returns `Err(PoisonError)`; visualizer shows mutex tagged as "Poisoned" with recovery option.
- **TC-T2-F13-04: 100 Rapid Messages Channel Saturation**  
  *Scenario*: Flood channel buffer with 100 messages.  
  *Assertion*: Message counter increments correctly; UI renders compact counter badge rather than crashing DOM with 100 floating nodes.
- **TC-T2-F13-05: Atomic Compare-and-Swap (CAS) Failure & Loop Retry**  
  *Scenario*: CAS operation encounters conflicting concurrent write.  
  *Assertion*: Visualizer highlights CAS returning `Err(actual_value)` and thread executing loop retry until success.

---

### F14: Error Handling Boundaries
- **TC-T2-F14-01: Deeply Nested Railway Chains (10 `?` Operators in Sequence)**  
  *Scenario*: Step through 10-step pipeline.  
  *Assertion*: Step scrubber scrolls horizontally; active step stays centered; step indicator displays `Step 7 of 10`.
- **TC-T2-F14-02: Custom Error with Missing Cause / Backtrace**  
  *Scenario*: Error without nested source rendered in inspector.  
  *Assertion*: Inspector displays error message cleanly without blank breakdown or null pointer exception.
- **TC-T2-F14-03: Rapid Step Toggling During Divergence Transition**  
  *Scenario*: Step into error diversion step, then immediately step back and forward 5 times.  
  *Assertion*: Railway junction switch animation stays in sync with current step without graphic glitches.
- **TC-T2-F14-04: `unwrap()` on `Err` with Long Multi-line Error Message**  
  *Scenario*: Panic payload contains 500 characters of stack trace text.  
  *Assertion*: Error dialog has accessible scrollbar; does not break outside viewport container.
- **TC-T2-F14-05: `Option::take()` Nullifying Slot**  
  *Scenario*: Execute `opt.take()` on variable holding `Some(val)`.  
  *Assertion*: Variable transitions to `None`; returned value receives ownership of `Some(val)`.

---

### F15: Curriculum Boundaries
- **TC-T2-F15-01: Direct Deep-Link to Terminal Lesson M10 (`/learn-rust/lessons/10`)**  
  *Scenario*: Fresh browser session navigates directly to final lesson without completing M01-M09.  
  *Assertion*: Lesson loads and is fully readable; "Next" button indicates "Complete Course" or returns to Curriculum catalog.
- **TC-T2-F15-02: Extremely Long Code Snippet Horizontal Scrolling**  
  *Scenario*: Code block contains lines with 120+ characters.  
  *Assertion*: Code block contains `overflow-x-auto` class; code lines scroll horizontally without breaking overall page layout.
- **TC-T2-F15-03: Switching Language While Scrolled Halfway Down Lesson**  
  *Scenario*: Scroll to middle of lesson; switch language via navbar dropdown.  
  *Assertion*: Language updates in place; scroll position is preserved; active lesson slug does not change.
- **TC-T2-F15-04: Markdown / HTML Injection in Lesson Content**  
  *Scenario*: Lesson data containing HTML tags (`<iframe src="...">`, `<style>`).  
  *Assertion*: Sanitized or rendered as safe markdown tokens; no arbitrary script execution.
- **TC-T2-F15-05: Rapid Navigation Between Consecutive Lessons**  
  *Scenario*: Click "Next Lesson" 5 times in rapid succession.  
  *Assertion*: Correct target lesson is mounted; previous lesson components are cleanly unmounted.

---

### F16: Quizzes & Challenges Boundaries
- **TC-T2-F16-01: Submit Without Selecting Any Option**  
  *Scenario*: Click "Submit Answer" button while no radio option is checked.  
  *Assertion*: Submit button is either disabled or triggers accessible alert ("Please select an option first"); does not submit null answer.
- **TC-T2-F16-02: Multiple Resubmissions of Correct Answer**  
  *Scenario*: Click "Submit Answer" repeatedly on already passed quiz.  
  *Assertion*: Score is only incremented once in progress storage; attempts counter increments or stays capped.
- **TC-T2-F16-03: Quiz Option Text Containing Special Characters & Rust Code (`<T: 'static>`, `&mut Vec<Option<i32>>`)**  
  *Scenario*: Quiz questions and options containing raw angle brackets and quotes.  
  *Assertion*: Rendered literally without HTML entity corruption (`&lt;` escaped properly).
- **TC-T2-F16-04: Challenge Input with Whitespace & Trailing Semicolons**  
  *Scenario*: User enters answer with extra spaces: `"  mut  "`.  
  *Assertion*: Evaluator trims input; accepts answer as correct.
- **TC-T2-F16-05: Quiz Progress Survives Page Refresh**  
  *Scenario*: Answer quiz correctly, reload page at same URL.  
  *Assertion*: Quiz displays in completed state with selected answer preserved and explanation visible.

---

### F17: CI/CD Workflow Boundaries
- **TC-T2-F17-01: GitHub Actions Runner Environment Missing PNPM**  
  *Scenario*: Check workflow YAML for `pnpm/action-setup`.  
  *Assertion*: Step explicitly installs pnpm before `actions/setup-node` with cache key.
- **TC-T2-F17-02: Non-Zero Exit Code on Test Failure Blocks Deploy**  
  *Scenario*: Inspect workflow step sequence.  
  *Assertion*: `pnpm test` step precedes `pnpm build` and deploy; failure halts the workflow.
- **TC-T2-F17-03: Subpath Base URL Asset References in HTML**  
  *Scenario*: Inspect built `dist/index.html` head tags.  
  *Assertion*: Asset script and link tags start with `/learn-rust/` or relative `./`, preventing 404s on Pages subpath.
- **TC-T2-F17-04: SPA 404 Query Parameter Decoding Edge**  
  *Scenario*: Deep link `/learn-rust/lessons/ownership?lang=ja&theme=dark` redirected through `404.html`.  
  *Assertion*: Client router extracts query parameters correctly and restores route without losing state.
- **TC-T2-F17-05: Concurrent Deployments Concurrency Group**  
  *Scenario*: Check `deploy.yml` concurrency configuration.  
  *Assertion*: Specifies `concurrency: group: "pages", cancel-in-progress: false` ensuring atomic deployments.

---

### F18: Documentation Boundaries
- **TC-T2-F18-01: Broken Markdown Links in README**  
  *Scenario*: Parse all internal links in `README.md` (e.g. `#features`, `./AGENTS.md`, `./LICENSE`).  
  *Assertion*: All target files and anchor headings exist in the workspace.
- **TC-T2-F18-02: Code Snippets in Documentation Are Syntactically Valid Rust**  
  *Scenario*: Extract Rust code blocks from `README.md`.  
  *Assertion*: Contain valid Rust syntax matching the learning curriculum.
- **TC-T2-F18-03: README Live Demo Link Matches Pages Deployment URL**  
  *Scenario*: Inspect demo badge / link in `README.md`.  
  *Assertion*: URL matches `https://ecator.github.io/learn-rust/`.
- **TC-T2-F18-04: AGENTS.md Lists All 18 Features with Correct IDs**  
  *Scenario*: Check AGENTS.md feature table.  
  *Assertion*: Matches F01 through F18 as defined in PROJECT.md without numbering discrepancies.
- **TC-T2-F18-05: README Image References Point to Valid Local or Public Files**  
  *Scenario*: Check mascot / logo image paths in README.  
  *Assertion*: Point to existing files in `public/` or `src/assets/`.

---

## 6. Tier 3: Cross-Feature Combinations & Pairwise Matrix

### 6.1 Factors & Equivalence Classes
| Factor Name | Factor ID | Levels | Level Values |
|-------------|-----------|--------|--------------|
| **Language** | `LANG` | 3 | `zh` (Chinese), `en` (English), `ja` (Japanese) |
| **Theme** | `THEME` | 3 | `light`, `dark`, `system` |
| **Viewport** | `VIEWPORT` | 2 | `mobile` (375×667), `desktop` (1280×800) |
| **Route** | `ROUTE` | 6 | `home` (`/learn-rust/`), `curriculum` (`/learn-rust/curriculum`), `lesson_ownership` (`/learn-rust/lessons/ownership`), `visualizers` (`/learn-rust/visualizers`), `progress` (`/learn-rust/progress`), `notfound` (`/learn-rust/404-check`) |
| **Visualizer State** | `VIZ` | 5 | `initial`, `scrubbing`, `error_sim`, `completed`, `reset` |

### 6.2 All-Pairs Orthogonal Test Matrix (18 Representative Vectors)
Using combinatorial orthogonal array reduction, the following 18 high-density test vectors achieve 100% pairwise coverage across all 2-way parameter interactions:

| Test Vector ID | `LANG` | `THEME` | `VIEWPORT` | `ROUTE` | `VIZ` State | Description / Primary Verification Focus |
|----------------|--------|---------|------------|---------|-------------|-------------------------------------------|
| **TC-T3-PAIR-01** | `zh` | `light` | `desktop` | `home` | `initial` | Chinese desktop home page in light theme; verifies hero text & navbar |
| **TC-T3-PAIR-02** | `zh` | `dark` | `mobile` | `curriculum` | `scrubbing` | Chinese dark theme on mobile; drawer navigation to curriculum cards |
| **TC-T3-PAIR-03** | `zh` | `system` | `desktop` | `lesson_ownership` | `error_sim` | Chinese system theme; ownership error E0382 simulated in visualizer |
| **TC-T3-PAIR-04** | `zh` | `light` | `mobile` | `visualizers` | `completed` | Chinese mobile visualizers gallery; step visualizer reaches end state |
| **TC-T3-PAIR-05** | `zh` | `dark` | `desktop` | `progress` | `reset` | Chinese dark desktop progress dashboard; trigger reset dialog |
| **TC-T3-PAIR-06** | `zh` | `system` | `mobile` | `notfound` | `initial` | Chinese mobile 404 page with system dark mode; return home button |
| **TC-T3-PAIR-07** | `en` | `light` | `mobile` | `lesson_ownership` | `reset` | English light mobile lesson; scrubber reset and verify English text |
| **TC-T3-PAIR-08** | `en` | `dark` | `desktop` | `visualizers` | `initial` | English dark desktop visualizer gallery; load borrow checker |
| **TC-T3-PAIR-09** | `en` | `system` | `mobile` | `progress` | `scrubbing` | English system mobile progress; inspect XP breakdown and streak |
| **TC-T3-PAIR-10** | `en` | `light` | `desktop` | `notfound` | `error_sim` | English light desktop 404 error handling |
| **TC-T3-PAIR-11** | `en` | `dark` | `mobile` | `home` | `completed` | English dark mobile home; verify Ferris happy mood SVG contrast |
| **TC-T3-PAIR-12** | `en` | `system` | `desktop` | `curriculum` | `completed` | English system desktop curriculum; 10 modules rendered with checkmarks |
| **TC-T3-PAIR-13** | `ja` | `light` | `desktop` | `curriculum` | `error_sim` | Japanese light desktop curriculum; verify Japanese module descriptions |
| **TC-T3-PAIR-14** | `ja` | `dark` | `mobile` | `lesson_ownership` | `completed` | Japanese dark mobile lesson; complete ownership interactive quiz |
| **TC-T3-PAIR-15** | `ja` | `system` | `desktop` | `visualizers` | `scrubbing` | Japanese system desktop visualizer; step through memory layout |
| **TC-T3-PAIR-16** | `ja` | `light` | `mobile` | `progress` | `initial` | Japanese light mobile progress page; export backup button |
| **TC-T3-PAIR-17** | `ja` | `dark` | `desktop` | `notfound` | `reset` | Japanese dark desktop 404 page; click return to curriculum |
| **TC-T3-PAIR-18** | `ja` | `system` | `mobile` | `home` | `reset` | Japanese system mobile home; toggle language and theme in drawer |

### 6.3 Pairwise Cross-Feature Scenarios Specifications
- **TC-T3-SCEN-01: Language Switch During Mid-Visualizer Execution**  
  *Preconditions*: On `/learn-rust/lessons/ownership`, visualizer paused at Step 2 (Move state).  
  *Action*: Switch language from `zh` to `ja` via navbar.  
  *Assertion*: Visualizer step index remains at Step 2; explanation text updates to Japanese; stack diagram pointers do not reset.
- **TC-T3-SCEN-02: Theme Switch During Quiz Attempt**  
  *Preconditions*: User selects option B on an active quiz.  
  *Action*: Toggle theme from Light to Dark.  
  *Assertion*: Option B remains selected; radio background and text colors update to dark mode tokens with contrast ratio >= 4.5:1.
- **TC-T3-SCEN-03: Viewport Transition with Active Visualizer Canvas**  
  *Preconditions*: Visualizer active on desktop (1280px).  
  *Action*: Resize viewport to mobile (375px).  
  *Assertion*: Visualizer layout reflows from horizontal side-by-side to stacked vertical layout; active step state is preserved.
- **TC-T3-SCEN-04: Export Progress in Japanese and Re-import in English**  
  *Preconditions*: Language is `ja`, user has completed 3 lessons.  
  *Action*: Export progress to JSON; change language to `en`; reset progress; import exported JSON.  
  *Assertion*: Storage correctly restores completed lessons; UI displays "3 of 10 Completed" in English.
- **TC-T3-SCEN-05: Dark Theme System Detection on Mobile Navigation Drawer**  
  *Preconditions*: System dark mode active; viewport mobile (375px).  
  *Action*: Open mobile drawer.  
  *Assertion*: Drawer background renders dark theme background; text is crisp white/slate-100; theme badge indicates "System (Dark)".

---

## 7. Tier 4: Real-World Application End-to-End Journeys

---

### Journey 1: "The Rust Novice Journey: From Zero to Ownership Mastery"
- **Test ID**: `TC-T4-JOURNEY-01`
- **Persona**: Complete beginner discovering Rust through the app on desktop.
- **Multi-Step Flow**:
  1. **Landing**: User lands on `/learn-rust/` in browser default Chinese (`zh`). Views Ferris mascot greeting, hero banner, and feature overview.
  2. **Browse Curriculum**: Clicks "Start Learning" button; router navigates to `/learn-rust/curriculum`. Observes 10 modules with progress indicator "0% Complete".
  3. **Module 1 (Getting Started)**: Clicks Module 1. Reads installation and `fn main()` explanation. Reads common pitfalls. Clicks "Mark as Completed".
  4. **Module 3 (Ownership Deep Dive)**: Navigates via sidebar to Module 3 (Ownership). Observes interactive Ownership Visualizer initialized.
  5. **Visualizer Interaction**:
     - Clicks "Next Step" to allocate `s1 = String::from("hello")`. Stack and heap appear.
     - Clicks "Next Step" to execute `let s2 = s1;`. Observes move pointer transfer and `s1` invalidation.
     - Clicks "Next Step" to observe simulated compiler error `E0382`. Ferris changes mood to `confused`.
  6. **Take Quiz**: Scrolls down to Quiz. Selects correct explanation for ownership move. Clicks "Submit Answer".
  7. **Celebration & Progress**: Green success banner displays; Ferris switches to `wizard` mood. XP score increases.
  8. **Verification**: Navigates to `/learn-rust/progress`. Progress dashboard displays "2 Lessons Completed", XP: 150, streak: 1 day.

---

### Journey 2: "The Borrow Checker Deep Diver: Battling Conflicted Leases"
- **Test ID**: `TC-T4-JOURNEY-02`
- **Persona**: Intermediate developer mastering Rust's borrow checker rules.
- **Multi-Step Flow**:
  1. **Direct Navigation**: Learner enters directly via `/learn-rust/lessons/borrowing`.
  2. **Gantt Timeline Exploration**:
     - Plays auto-play scrubber through multiple shared borrows `&x`.
     - Observes parallel green lease bars.
     - Steps into mutable borrow `&mut x`. Conflict warning triggers; timeline turns red.
  3. **Simulated Compiler Resolution**: Toggles code fix tab to "NLL (Non-Lexical Lifetimes) Scoping". Re-runs timeline; observes lease expiring early and mutable borrow succeeding.
  4. **Quiz Failure & Retry**:
     - Takes Borrowing quiz. Intentionally selects incorrect option (mutable borrow while shared borrow is still active).
     - Submits answer. UI displays red error alert; Ferris displays `panic` mood.
     - Reads pitfall explanation. Clicks "Try Again".
     - Selects correct answer. Submits. Receives full credit.
  5. **Verification**: Inspects `localStorage.getItem('learn_rust_progress_v1')`. Confirms `quizStates['borrowing']` has `passed: true` with `attempts: 2`.

---

### Journey 3: "The International Polyglot & Night Owl"
- **Test ID**: `TC-T4-JOURNEY-03`
- **Persona**: Japanese engineer studying late at night on a mobile device.
- **Multi-Step Flow**:
  1. **Mobile Setup**: Viewport set to 375×667 (iPhone SE). Browser language mocked to `ja-JP`.
  2. **Initial Load & Auto-Detection**:
     - Opens `/learn-rust/`. App loads in Japanese (`ja`) with system dark theme enabled.
     - Header displays Japanese navigation title and hamburger menu.
  3. **Theme Customization**:
     - Opens mobile drawer. Changes theme explicitly from "System" to "Dark".
     - Closes drawer. Inspects body background (`bg-slate-900` / `bg-zinc-950`); verifies text color contrast > 15:1.
  4. **Language Switching**:
     - Opens drawer. Switches language to English (`en`). All UI elements update immediately.
     - Switches language back to Japanese (`ja`).
  5. **Visualizer on Mobile**:
     - Navigates to `/learn-rust/visualizers`. Selects "Trait Dispatch Visualizer".
     - Switches between Static Monomorphization and Dynamic VTable tabs on mobile touch layout.
     - Confirms code pre blocks wrap or scroll horizontally without breaking drawer or header layout.
  6. **Verification**: Reloads page. Persisted settings confirm `learn_rust_lang == 'ja'` and `learn_rust_theme == 'dark'`.

---

### Journey 4: "The Data Preservationist: Export, Corrupt Recovery, Import & Cross-Tab Sync"
- **Test ID**: `TC-T4-JOURNEY-04`
- **Persona**: Power user managing learning progress across multiple machines and browser tabs.
- **Multi-Step Flow**:
  1. **Seed Completed Progress**: Seed progress with 5 completed lessons, 4 passed quizzes, and 350 XP.
  2. **Export Backup**:
     - User navigates to `/learn-rust/progress`.
     - Clicks "Export Progress". File download simulation generates JSON backup string.
  3. **Accidental Reset**:
     - User clicks "Reset Progress". Confirms warning dialog.
     - Dashboard drops to 0 completed lessons, 0 XP.
  4. **Import Backup**:
     - Clicks "Import Progress". Pastes previously exported JSON backup.
     - Clicks "Restore". UI immediately updates to 5 completed lessons and 350 XP.
  5. **Corruption Recovery Defense**:
     - Manually writes corrupted syntax into `localStorage.setItem('learn_rust_progress_v1', '{"bad-json":')`.
     - Reloads page.
     - Storage engine intercepts syntax error, triggers safe recovery, and preserves app operational readiness without white screen.
  6. **Cross-Tab Synchronization**:
     - Simulates second tab completing Lesson 6 via `window.dispatchEvent(StorageEvent)`.
     - Tab 1 immediately updates completion badge to 6 lessons without page refresh.

---

### Journey 5: "The Advanced Systems Programmer: Concurrency & Railway Error Flows"
- **Test ID**: `TC-T4-JOURNEY-05`
- **Persona**: Experienced C++ engineer evaluating Rust's fearless concurrency and error propagation.
- **Multi-Step Flow**:
  1. **Gallery Exploration**: Navigates to `/learn-rust/visualizers`.
  2. **Concurrency Visualizer**:
     - Launches `Arc<Mutex<T>>` simulation.
     - Clicks "Thread 1 Acquire Lock". Counter increments to 1.
     - Clicks "Thread 2 Acquire Lock". Thread 2 enters blocked amber state.
     - Releases Thread 1 lock. Observes Thread 2 unblock, lock, and increment counter to 2.
     - Switches to "Channel MPSC" mode. Sends 3 sequential messages. Observes FIFO buffer dequeuing into receiver thread.
  3. **Error Handling Visualizer**:
     - Launches Railway-Oriented Error Visualizer.
     - Runs `Result` pipeline with valid input. Green railway lights up to final `Ok(Data)`.
     - Injects invalid input step. Steps through `?` operator. Visualizes immediate diversion down to red track returning `Err(ParseError)`.
     - Inspects Ferris mood shifting to `detective` / `panic`.
  4. **Lesson Integration**:
     - Clicks "Open Full Concurrency Lesson" link directly from visualizer card.
     - Navigates seamlessly to `/learn-rust/lessons/concurrency`.
     - Solves concurrency challenge quiz.
  5. **Verification**: Progress page reflects credit for advanced module challenge completion.

---

## 8. Traceability Matrix & Execution Mapping

| Feature ID | Feature Name | Tier 1 (Spec) | Tier 2 (Boundaries) | Tier 3 (Pairwise) | Tier 4 (Journeys) | Primary E2E Test File Target |
|------------|--------------|---------------|---------------------|-------------------|-------------------|------------------------------|
| **F01** | Scaffolding | TC-T1-F01-(01..05) | TC-T2-F01-(01..05) | TC-T3-PAIR-(01..18) | Journey 1 | `src/tests/e2e/tier1-features/t1-f01-f03-foundation.test.tsx` |
| **F02** | React Router | TC-T1-F02-(01..05) | TC-T2-F02-(01..05) | TC-T3-PAIR-(01..18) | Journeys 1, 2, 5 | `src/tests/e2e/tier1-features/t1-f01-f03-foundation.test.tsx` |
| **F03** | Test Infra | TC-T1-F03-(01..05) | TC-T2-F03-(01..05) | TC-T3-PAIR-(01..18) | All Journeys | `src/tests/e2e/tier1-features/t1-f01-f03-foundation.test.tsx` |
| **F04** | Nav & Layout | TC-T1-F04-(01..05) | TC-T2-F04-(01..05) | TC-T3-PAIR-(01..18) | Journeys 1, 3 | `src/tests/e2e/tier1-features/t1-f04-f06-layout-i18n.test.tsx` |
| **F05** | Theming Engine | TC-T1-F05-(01..05) | TC-T2-F05-(01..05) | TC-T3-PAIR-(01..18) | Journey 3 | `src/tests/e2e/tier1-features/t1-f04-f06-layout-i18n.test.tsx` |
| **F06** | Tri-lingual i18n | TC-T1-F06-(01..05) | TC-T2-F06-(01..05) | TC-T3-PAIR-(01..18) | Journeys 1, 3 | `src/tests/e2e/tier1-features/t1-f04-f06-layout-i18n.test.tsx` |
| **F07** | LocalStorage | TC-T1-F07-(01..05) | TC-T2-F07-(01..05) | TC-T3-PAIR-(01..18) | Journeys 1, 2, 4 | `src/tests/e2e/tier1-features/t1-f07-f08-storage-mascot.test.tsx` |
| **F08** | Ferris Mascot | TC-T1-F08-(01..05) | TC-T2-F08-(01..05) | TC-T3-PAIR-(01..18) | Journeys 1, 2, 5 | `src/tests/e2e/tier1-features/t1-f07-f08-storage-mascot.test.tsx` |
| **F09** | Ownership Viz | TC-T1-F09-(01..05) | TC-T2-F09-(01..05) | TC-T3-PAIR-(01..18) | Journey 1 | `src/tests/e2e/tier1-features/t1-f09-f11-core-visualizers.test.tsx` |
| **F10** | Borrow Viz | TC-T1-F10-(01..05) | TC-T2-F10-(01..05) | TC-T3-PAIR-(01..18) | Journey 2 | `src/tests/e2e/tier1-features/t1-f09-f11-core-visualizers.test.tsx` |
| **F11** | Memory Layout | TC-T1-F11-(01..05) | TC-T2-F11-(01..05) | TC-T3-PAIR-(01..18) | Journey 3 | `src/tests/e2e/tier1-features/t1-f09-f11-core-visualizers.test.tsx` |
| **F12** | Trait Dispatch | TC-T1-F12-(01..05) | TC-T2-F12-(01..05) | TC-T3-PAIR-(01..18) | Journey 3 | `src/tests/e2e/tier1-features/t1-f12-f14-adv-visualizers.test.tsx` |
| **F13** | Concurrency Viz | TC-T1-F13-(01..05) | TC-T2-F13-(01..05) | TC-T3-PAIR-(01..18) | Journey 5 | `src/tests/e2e/tier1-features/t1-f12-f14-adv-visualizers.test.tsx` |
| **F14** | Error Viz | TC-T1-F14-(01..05) | TC-T2-F14-(01..05) | TC-T3-PAIR-(01..18) | Journey 5 | `src/tests/e2e/tier1-features/t1-f12-f14-adv-visualizers.test.tsx` |
| **F15** | Curriculum (10) | TC-T1-F15-(01..05) | TC-T2-F15-(01..05) | TC-T3-PAIR-(01..18) | Journeys 1, 2, 5 | `src/tests/e2e/tier1-features/t1-f15-f18-curriculum-ops.test.tsx` |
| **F16** | Quizzes & Chal | TC-T1-F16-(01..05) | TC-T2-F16-(01..05) | TC-T3-PAIR-(01..18) | Journeys 1, 2, 5 | `src/tests/e2e/tier1-features/t1-f15-f18-curriculum-ops.test.tsx` |
| **F17** | GitHub Actions | TC-T1-F17-(01..05) | TC-T2-F17-(01..05) | TC-T3-PAIR-(01..18) | Deployment | `src/tests/e2e/tier1-features/t1-f15-f18-curriculum-ops.test.tsx` |
| **F18** | Documentation | TC-T1-F18-(01..05) | TC-T2-F18-(01..05) | TC-T3-PAIR-(01..18) | Audit | `src/tests/e2e/tier1-features/t1-f15-f18-curriculum-ops.test.tsx` |

---

## 9. Test Execution & CI Automation Commands

```bash
# 1. Run all unit and integration tests
pnpm test

# 2. Run Tier 1 Feature Coverage test suites
pnpm vitest run src/tests/e2e/tier1-features/

# 3. Run Tier 2 Boundary & Corner Cases
pnpm vitest run src/tests/e2e/tier2-boundaries/

# 4. Run Tier 3 Pairwise Combinations
pnpm vitest run src/tests/e2e/tier3-pairwise/

# 5. Run Tier 4 Real-World Application End-to-End Journeys
pnpm vitest run src/tests/e2e/tier4-journeys/

# 6. Execute full E2E test suite with coverage report
pnpm vitest run src/tests/e2e/ --coverage

# 7. Single watch command for test development
pnpm vitest watch src/tests/e2e/
```

### 9.1 Verification Gates
- **Gate 1**: 100% of Tier 1 tests (90/90) MUST pass.
- **Gate 2**: 100% of Tier 2 tests (90/90) MUST pass.
- **Gate 3**: 100% of Tier 3 Pairwise tests (18 vectors + cross scenarios) MUST pass.
- **Gate 4**: 100% of Tier 4 Real-World Journeys (5/5 multi-step flows) MUST pass.
- **Gate 5**: Zero lint errors, zero TypeScript type errors (`pnpm tsc --noEmit`), clean build (`pnpm build`).
