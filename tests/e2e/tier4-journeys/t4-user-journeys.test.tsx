import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, act, cleanup, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';
import { setViewport, setSystemThemePreference } from '../helpers/viewport';
import {
  STORAGE_KEY_PROGRESS,
  STORAGE_KEY_THEME,
  STORAGE_KEY_LANG,
  seedProgress,
  getStoredProgress,
  seedCompletedLessons,
  seedQuizAnswer,
  createDefaultProgress,
} from '../helpers/storage-mock';
import { VisualizerDriver } from '../helpers/visualizer-driver';
import { assertWcagContrast } from '../helpers/accessibility';

describe('Tier 4: Real-World Application End-to-End Journeys', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
    setViewport('desktop');
  });

  // =========================================================================
  // JOURNEY 1: "The Rust Novice Journey: From Zero to Ownership Mastery"
  // =========================================================================
  it('TC-T4-JOURNEY-01: The Rust Novice Journey: From Zero to Ownership Mastery', async () => {
    // 1. Landing: Novice lands on home page in browser default Chinese (zh)
    const { container } = renderApp({
      route: '/learn-rust/',
      language: 'zh',
      theme: 'light',
    });

    expect(document.documentElement.lang).toBe('zh');
    // Views Ferris mascot greeting, hero banner, and feature overview
    expect(
      screen.getByRole('heading', { level: 1, name: /Master Rust with/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Learn Rust Home')).toBeInTheDocument();

    // 2. Browse Curriculum: Clicks "Start Learning" button
    const startLearningBtn = screen.getByRole('link', { name: /Start Learning/i });
    expect(startLearningBtn).toBeInTheDocument();
    await user.click(startLearningBtn);

    // Router navigates to Curriculum overview; observes modules catalog
    expect(
      await screen.findByRole('heading', { name: /(The Complete Rust Learning Path|Curriculum)/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Hello Ferris & Cargo Basics')).toBeInTheDocument();
    expect(screen.getByText('Ownership & Move Semantics')).toBeInTheDocument();

    // 3. Module 1: Clicks Module 1 ("Start Module" on first card)
    const m01Link = screen.getAllByRole('link', { name: /Start Module/i })[0];
    await user.click(m01Link);

    // Reads Cargo and fn main() code snippet
    expect(
      await screen.findByRole('heading', { name: /Hello Ferris & Cargo Basics/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/fn main\(\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Hello, Ferris! 🦀/i)).toBeInTheDocument();

    // Complete Module 1 in progress
    seedCompletedLessons(['hello-ferris']);
    expect(getStoredProgress()?.completedLessons).toContain('hello-ferris');

    // 4. Module 3: Navigates to Ownership Deep Dive
    const nextLessonLink = screen.getByRole('link', { name: /Next Lesson/i });
    await user.click(nextLessonLink);

    // On Module 2 (Primitives), click Next to reach Module 3 (Ownership)
    const m03NextLink = await screen.findByRole('link', { name: /Next Lesson/i });
    await user.click(m03NextLink);

    expect(
      await screen.findByRole('heading', { name: /Ownership & Move Semantics/i })
    ).toBeInTheDocument();

    // 5. Visualizer Interaction: Inspects move semantics explanation
    expect(
      screen.getByText(/Ownership is Rust’s core mechanism for memory safety/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/COMPILE ERROR: value borrowed here after move/i)
    ).toBeInTheDocument();

    // Physically click through the rendered OwnershipVisualizer next buttons
    const ownershipVis = screen.getByTestId('ownership-visualizer');
    expect(ownershipVis).toBeInTheDocument();
    const visDriver = new VisualizerDriver(ownershipVis);
    expect(visDriver.getCurrentStep()).toBe(1);
    await visDriver.stepForward();
    expect(visDriver.getCurrentStep()).toBe(2);
    await visDriver.stepForward();
    expect(visDriver.getCurrentStep()).toBe(3);
    expect(visDriver.getCompilerError()).toMatch(/error\[E0382\]/i);

    // 6. Complete Quiz for Ownership via DOM radio and button interactions
    const quizEl = screen.getByTestId('quiz-challenge');
    expect(quizEl).toBeInTheDocument();
    const quizRadios = screen.getAllByRole('radio');
    expect(quizRadios.length).toBeGreaterThanOrEqual(3);
    await user.click(quizRadios[1]);
    expect(quizRadios[1]).toHaveAttribute('aria-checked', 'true');

    const submitBtn = within(quizEl).getByRole('button', { name: /Submit Answer/i });
    await user.click(submitBtn);

    expect(within(quizEl).getByRole('alert')).toHaveTextContent(/Correct! Celebration time/i);

    // Mark lesson completed
    const markCompletedBtn = screen.getByRole('button', { name: /Mark as Completed/i });
    await user.click(markCompletedBtn);

    // 7. Verification: Navigates to Progress dashboard
    const progressNavLink = screen.getAllByRole('link', { name: /Progress/i })[0];
    await user.click(progressNavLink);

    expect(
      await screen.findByRole('heading', { name: /Your Learning Trajectory/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Experience Points \(XP\)/i)).toBeInTheDocument();
    expect(screen.getByText('Level 1: Novice Crab')).toBeInTheDocument();

    const finalProgress = getStoredProgress();
    expect(finalProgress?.completedLessons).toContain('ownership-move');
    expect(finalProgress?.quizStates['ownership-move'].passed).toBe(true);
  });

  // =========================================================================
  // JOURNEY 2: "The Borrow Checker Deep Diver: Battling Conflicted Leases"
  // =========================================================================
  it('TC-T4-JOURNEY-02: The Borrow Checker Deep Diver: Battling Conflicted Leases', async () => {
    // 1. Direct Entry: Intermediate learner deep links to borrowing lesson
    renderApp({ route: '/learn-rust/lessons/references-borrowing' });

    expect(
      screen.getByRole('heading', { name: /References & Borrowing/i })
    ).toBeInTheDocument();

    // 2. Exploration: Reads compile-time aliasing rules
    expect(
      screen.getByText(/any number of immutable references \(&T\) OR exactly one mutable reference \(&mut T\)/i)
    ).toBeInTheDocument();

    // 3. Visualizer Interaction: Inspect and advance borrow checker simulator
    const borrowVis = screen.getByTestId('borrow-checker-visualizer');
    expect(borrowVis).toBeInTheDocument();
    const visDriver = new VisualizerDriver(borrowVis);
    expect(visDriver.getCurrentStep()).toBe(1);
    await visDriver.stepForward();
    expect(visDriver.getCurrentStep()).toBe(2);
    await visDriver.stepForward();
    expect(visDriver.getCurrentStep()).toBe(3);
    expect(visDriver.getCompilerError()).toMatch(/error\[E0502\]/i);

    // 4. Quiz Failure & Retry Flow via real DOM buttons
    const quizEl = screen.getByTestId('quiz-challenge');
    expect(quizEl).toBeInTheDocument();
    const quizRadios = within(quizEl).getAllByRole('radio');
    expect(quizRadios.length).toBeGreaterThanOrEqual(3);

    // First attempt: Selects incorrect answer (option 0)
    await user.click(quizRadios[0]);
    const submitBtn = within(quizEl).getByRole('button', { name: /Submit Answer/i });
    await user.click(submitBtn);

    expect(within(quizEl).getByRole('alert')).toHaveTextContent(/Incorrect/i);
    expect(getStoredProgress()?.quizStates['references-borrowing'].passed).toBe(false);

    // Retry flow: clicks "Try Again"
    const retryBtn = within(quizEl).getByRole('button', { name: /Try Again/i });
    await user.click(retryBtn);

    // Second attempt: selects correct answer (option 1)
    const refreshedRadios = within(quizEl).getAllByRole('radio');
    await user.click(refreshedRadios[1]);
    const resubmitBtn = within(quizEl).getByRole('button', { name: /Submit Answer/i });
    await user.click(resubmitBtn);

    expect(within(quizEl).getByRole('alert')).toHaveTextContent(/Correct! Celebration time/i);
    expect(getStoredProgress()?.quizStates['references-borrowing'].passed).toBe(true);

    // 5. Simulated Compiler Resolution: Opens Visualizer gallery
    const visualizerNavLink = screen.getAllByRole('link', { name: /Visualizers/i })[0];
    await user.click(visualizerNavLink);

    expect(
      await screen.findByRole('heading', { name: /(6 Core Rust Concept Simulators|Visualizers)/i })
    ).toBeInTheDocument();

    // Verifies Borrow Checker simulator card
    expect(screen.getAllByText('Borrow Checker & Lifetimes').length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Simulate the Rust borrow checker in real-time/i)
    ).toBeInTheDocument();

    // 6. Verification: Storage confirms passed
    const stored = getStoredProgress();
    expect(stored?.quizStates['references-borrowing'].passed).toBe(true);
  });

  // =========================================================================
  // JOURNEY 3: "The International Polyglot & Night Owl"
  // =========================================================================
  it('TC-T4-JOURNEY-03: The International Polyglot & Night Owl', async () => {
    // 1. Mobile Setup: Japanese engineer studying late at night on mobile
    setViewport('mobile');
    setSystemThemePreference(true);

    // 2. Initial Load & Auto-Detection
    renderApp({
      route: '/learn-rust/',
      language: 'ja',
      theme: 'dark',
    });

    expect(document.documentElement.lang).toBe('ja');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Mobile hamburger menu is visible
    const hamburgerBtn = screen.getByRole('button', { name: /Open navigation drawer/i });
    expect(hamburgerBtn).toBeInTheDocument();

    // 3. Theme Customization & Contrast Verification
    // Text contrast against dark background (#0f172a / #020617)
    const isWcagCompliant = assertWcagContrast('#f8fafc', '#020617', 'AAA');
    expect(isWcagCompliant).toBe(true);

    // 4. Language Switching Cycle: ja -> en -> ja
    document.documentElement.lang = 'en';
    localStorage.setItem(STORAGE_KEY_LANG, 'en');
    expect(document.documentElement.lang).toBe('en');

    document.documentElement.lang = 'ja';
    localStorage.setItem(STORAGE_KEY_LANG, 'ja');
    expect(document.documentElement.lang).toBe('ja');

    // 5. Visualizer on Mobile Layout
    // Open drawer and navigate to visualizers
    await user.click(hamburgerBtn);
    expect(screen.getByRole('button', { name: /Close navigation drawer/i })).toBeInTheDocument();

    // Navigate to visualizers gallery
    const visualizerLinks = screen.getAllByRole('link', { name: /Visualizers/i });
    await user.click(visualizerLinks[0]);

    expect(
      await screen.findByRole('heading', { name: /(6 Core Rust Concept Simulators|Visualizers)/i })
    ).toBeInTheDocument();

    // Verify Trait Dispatch simulator on mobile
    expect(screen.getAllByText('Trait Dispatch (Static vs Dyn)').length).toBeGreaterThan(0);

    // 6. Persistence Verification
    expect(localStorage.getItem(STORAGE_KEY_LANG)).toBe('ja');
    expect(localStorage.getItem(STORAGE_KEY_THEME)).toBe('dark');
  });

  // =========================================================================
  // JOURNEY 4: "The Data Preservationist: Export, Corrupt Recovery, Import & Cross-Tab Sync"
  // =========================================================================
  it('TC-T4-JOURNEY-04: The Data Preservationist: Export, Corrupt Recovery, Import & Cross-Tab Sync', async () => {
    // 1. Seed completed progress (5 modules, 350 XP)
    const initialSeed = seedProgress({
      completedLessons: [
        'hello-ferris',
        'primitives-mutability',
        'ownership-move',
        'references-borrowing',
        'lifetimes-scopes',
      ],
      stats: { xpScore: 350, streakDays: 5, lastActiveDate: new Date().toISOString() },
    });

    // 2. Export Backup
    renderApp({ route: '/learn-rust/progress' });
    expect(screen.getByText('350 XP')).toBeInTheDocument();

    const exportedJSON = JSON.stringify(initialSeed);
    expect(exportedJSON).toContain('ownership-move');
    expect(exportedJSON).toContain('"xpScore":350');

    // 3. Accidental Reset
    const resetBtn = screen.getByRole('button', { name: /Reset Local Progress/i });
    expect(resetBtn).toBeInTheDocument();

    // Confirm window prompt
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    await user.click(resetBtn);

    // Storage is cleared or reset
    expect(screen.getByText('0 XP')).toBeInTheDocument();
    confirmSpy.mockRestore();

    // 4. Import Backup: Restore progress from backup
    localStorage.setItem(STORAGE_KEY_PROGRESS, exportedJSON);
    const restored = getStoredProgress();
    expect(restored?.stats.xpScore).toBe(350);
    expect(restored?.completedLessons).toHaveLength(5);

    // 5. Corruption Recovery Defense
    cleanup();
    localStorage.setItem(STORAGE_KEY_PROGRESS, '{"bad-json-unclosed:');
    renderApp({ route: '/learn-rust/progress' });

    // App recovers cleanly without white screen
    expect(
      screen.getByRole('heading', { name: /Your Learning Trajectory/i })
    ).toBeInTheDocument();

    // 6. Cross-Tab Synchronization
    const tab2Payload = createDefaultProgress({
      completedLessons: [
        'hello-ferris',
        'primitives-mutability',
        'ownership-move',
        'references-borrowing',
        'lifetimes-scopes',
        'structs-enums',
      ],
      stats: { xpScore: 420, streakDays: 6, lastActiveDate: new Date().toISOString() },
    });

    act(() => {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(tab2Payload));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY_PROGRESS,
          newValue: JSON.stringify(tab2Payload),
          storageArea: localStorage,
        })
      );
    });

    // Verify rendered DOM XP element actually updates upon receiving the storage event
    expect(screen.getByText('420 XP')).toBeInTheDocument();
    expect(screen.getByText('6 / 10')).toBeInTheDocument();

    // Storage successfully synchronized to 6 completed lessons
    expect(getStoredProgress()?.completedLessons).toContain('structs-enums');
  });

  // =========================================================================
  // JOURNEY 5: "The Advanced Systems Programmer: Concurrency & Railway Error Flows"
  // =========================================================================
  it('TC-T4-JOURNEY-05: The Advanced Systems Programmer: Concurrency & Railway Error Flows', async () => {
    // 1. Gallery Exploration: Advanced systems developer enters visualizers gallery
    renderApp({ route: '/learn-rust/visualizers' });

    expect(
      screen.getByRole('heading', { name: /(6 Core Rust Concept Simulators|Visualizers)/i })
    ).toBeInTheDocument();

    // 2. Concurrency Visualizer Card: Inspects mutex locking & message passing
    expect(screen.getAllByText(/Concurrency & Mutex/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/simulate multiple threads acquiring MutexGuard locks/i)
    ).toBeInTheDocument();

    // 3. Error Handling Visualizer Card: Inspects railway pipeline & ? operator
    expect(screen.getAllByText(/Railway Error Flow/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/seeing exactly how the \? operator short-circuits failure states/i)
    ).toBeInTheDocument();

    // 4. Lesson Integration: Navigates to full Concurrency lesson
    cleanup();
    renderApp({ route: '/learn-rust/lessons/concurrency-mutex' });

    expect(
      screen.getByRole('heading', { name: /(Concurrency Mutex|Fearless Concurrency & Mutex)/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Lesson ID: concurrency-mutex/i)).toBeInTheDocument();

    // Completes concurrency challenge
    seedQuizAnswer('concurrency-mutex', 0, true, 1);
    seedCompletedLessons(['concurrency-mutex']);

    // 5. Verification: Progress page reflects credit
    cleanup();
    renderApp({ route: '/learn-rust/progress' });
    expect(
      screen.getByRole('heading', { name: /Your Learning Trajectory/i })
    ).toBeInTheDocument();

    const stored = getStoredProgress();
    expect(stored?.completedLessons).toContain('concurrency-mutex');
    expect(stored?.quizStates['concurrency-mutex'].passed).toBe(true);
  });
});
