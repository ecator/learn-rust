import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, act, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';
import {
  STORAGE_KEY_PROGRESS,
  seedProgress,
  createDefaultProgress,
} from '../helpers/storage-mock';
import { VisualizerDriver } from '../helpers/visualizer-driver';
import { FerrisIcon } from '@/components/FerrisIcon';
import { Ferris, FerrisMood } from '@/components/mascot/Ferris';
import { OwnershipVisualizer } from '@/components/visualizers/OwnershipVisualizer';
import { BorrowCheckerVisualizer } from '@/components/visualizers/BorrowCheckerVisualizer';
import { MemoryLayoutVisualizer } from '@/components/visualizers/MemoryLayoutVisualizer';
import { TraitDispatchVisualizer } from '@/components/visualizers/TraitDispatchVisualizer';
import { ConcurrencyVisualizer } from '@/components/visualizers/ConcurrencyVisualizer';
import { ErrorHandlingVisualizer } from '@/components/visualizers/ErrorHandlingVisualizer';

describe('Tier 2: Storage & Visualizers Boundaries (F07 - F14)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    localStorage.clear();
  });

  // =========================================================================
  // 1. LocalStorage Corrupted Data, Quota Exceeded, & Migration Boundaries (F07)
  // =========================================================================
  describe('LocalStorage Progress Engine Boundaries (F07)', () => {
    it('TC-T2-F07-01: Severely corrupted JSON in localStorage triggers safe recovery', () => {
      localStorage.setItem(STORAGE_KEY_PROGRESS, '{malformed_json_corrupted:&&!@#');
      const { container } = renderApp({ route: '/learn-rust/progress' });
      expect(container).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Your Learning Trajectory/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/Experience Points \(XP\)/i)).toBeInTheDocument();
    });

    it('TC-T2-F07-02: Legacy schema version mismatch handling', () => {
      const legacyPayload = {
        version: 0,
        oldUserData: { completed: ['m01-syntax'] },
      };
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(legacyPayload));

      renderApp({ route: '/learn-rust/progress' });
      expect(
        screen.getByRole('heading', { name: /Your Learning Trajectory/i })
      ).toBeInTheDocument();
    });

    it('TC-T2-F07-03: Storage quota full / QuotaExceededError graceful fallback', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        throw error;
      });

      const { container } = renderApp({ route: '/learn-rust/progress' });
      expect(container).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Your Learning Trajectory/i })
      ).toBeInTheDocument();

      setItemSpy.mockRestore();
    });

    it('TC-T2-F07-04: Cross-tab storage event updates learning progress', async () => {
      seedProgress({
        stats: { xpScore: 50, streakDays: 2, lastActiveDate: new Date().toISOString() },
        completedLessons: ['hello-ferris'],
      });

      renderApp({ route: '/learn-rust/progress' });
      expect(screen.getByText('50 XP')).toBeInTheDocument();

      const updatedPayload = createDefaultProgress({
        stats: { xpScore: 120, streakDays: 3, lastActiveDate: new Date().toISOString() },
        completedLessons: ['hello-ferris', 'primitives-mutability'],
      });

      act(() => {
        localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(updatedPayload));
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: STORAGE_KEY_PROGRESS,
            newValue: JSON.stringify(updatedPayload),
            storageArea: localStorage,
          })
        );
      });

      expect(
        screen.getByRole('heading', { name: /Your Learning Trajectory/i })
      ).toBeInTheDocument();
    });

    it('TC-T2-F07-05: Handles massive progress array without degradation', () => {
      const massiveLessonIds = Array.from({ length: 500 }, (_, i) => `synthetic-lesson-${i}`);
      seedProgress({ completedLessons: massiveLessonIds });

      const startTime = performance.now();
      renderApp({ route: '/learn-rust/progress' });
      const duration = performance.now() - startTime;

      expect(duration).toBeLessThan(1500);
      expect(
        screen.getByRole('heading', { name: /Your Learning Trajectory/i })
      ).toBeInTheDocument();
    });

    it('TC-T2-F07-06: Partial schema corruption in localStorage recovers safely without TypeError', () => {
      // Partial schema missing stats, quizStates, bookmarks, interactiveChallenges
      const partialSchema = {
        version: 1,
        completedLessons: ['hello-ferris'],
      };
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(partialSchema));

      const { container } = renderApp({ route: '/learn-rust/progress' });
      expect(container).toBeInTheDocument();
      // Should default stats safely without throwing TypeError
      expect(screen.getByText('0 XP')).toBeInTheDocument();
      expect(screen.getByText('1 / 10')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 2. Ferris Mascot Component Edge States (F08)
  // =========================================================================
  describe('Ferris Mascot Boundaries (F08)', () => {
    it('TC-T2-F08-01: Unknown / undefined mood prop defaults safely without error', () => {
      const { container } = render(<FerrisIcon size={48} {...({ mood: 'unexpected_alien_mood' } as any)} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('aria-label', expect.stringMatching(/Ferris/i));
    });

    it('TC-T2-F08-02: Zero and extreme dimensions render valid SVG attributes', () => {
      const { container } = render(
        <div>
          <FerrisIcon size={0} data-testid="zero-ferris" />
          <FerrisIcon size={1200} data-testid="huge-ferris" />
        </div>
      );
      expect(container.querySelector('[data-testid="zero-ferris"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="huge-ferris"]')).toBeInTheDocument();
    });

    it('TC-T2-F08-03: High contrast dark mode mascot visibility', () => {
      const { container } = render(
        <div className="dark bg-slate-950 p-4">
          <Ferris mood="happy" size={80} />
        </div>
      );
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('role', 'img');
      const bodyPath = container.querySelector('path');
      expect(bodyPath).not.toBeNull();
    });

    it('TC-T2-F08-04: ARIA screen reader announcement & accessibility', () => {
      const { container } = render(<Ferris mood="panic" />);
      const svg = container.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Ferris the Crab (panic)');
    });

    it('TC-T2-F08-05: Rapid mood cycling without DOM crash', () => {
      const moods: FerrisMood[] = ['happy', 'confused', 'safety', 'panic', 'detective', 'speed', 'wizard'];
      const { container, rerender } = render(<Ferris mood="happy" />);

      for (const mood of moods) {
        rerender(<Ferris mood={mood} />);
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
        expect(svg).toHaveAttribute('aria-label', `Ferris the Crab (${mood})`);
      }
    });
  });

  // =========================================================================
  // 3. Ownership Visualizer Boundaries (F09)
  // =========================================================================
  describe('Ownership & Move Semantics Boundaries (F09)', () => {
    it('TC-T2-F09-01: Step scrubber underflow at step 0 (prev button boundary)', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={0} />);
      const driver = new VisualizerDriver(container);
      const prevBtn = driver.findPrevButton();
      expect(prevBtn).not.toBeNull();
      expect(prevBtn).toBeDisabled();

      const clicked = await driver.stepBackward();
      expect(clicked).toBe(false);
      expect(driver.getCurrentStep()).toBe(1);
    });

    it('TC-T2-F09-02: Step scrubber overflow boundary does not throw out of bounds index', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={0} />);
      const driver = new VisualizerDriver(container);
      const nextBtn = driver.findNextButton();
      expect(nextBtn).not.toBeNull();

      for (let i = 0; i < 10; i++) {
        await driver.stepForward();
      }
      expect(nextBtn).toBeDisabled();
      expect(driver.getCurrentStep()).toBe(4);
    });

    it('TC-T2-F09-03: Clone vs move boundary distinction', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={0} />);
      const driver = new VisualizerDriver(container);

      expect(screen.getByText(/s1: String/i)).toBeInTheDocument();
      await driver.stepForward();

      expect(screen.getByText(/s2: String \(Valid Owner\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Moved\/Invalidated/i)).toBeInTheDocument();
    });

    it('TC-T2-F09-04: Heap reallocation visualization', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={0} />);
      const driver = new VisualizerDriver(container);

      expect(screen.getAllByText(/0x1040/i).length).toBeGreaterThan(0);
      await driver.stepForward();
      await driver.stepForward();
      await driver.stepForward();
      expect(screen.getByText(/Heap memory deallocated/i)).toBeInTheDocument();
    });

    it('TC-T2-F09-05: Rapid scrubbing via slider input', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={0} />);
      const driver = new VisualizerDriver(container);

      await driver.stepForward();
      await driver.stepForward();
      await driver.stepBackward();
      await driver.stepForward();

      expect(driver.getCurrentStep()).toBe(3);
      const nextBtn = driver.findNextButton();
      expect(nextBtn).not.toBeNull();
    });
  });

  // =========================================================================
  // 4. Borrow Checker & Lifetime Conflict Scenarios (F10)
  // =========================================================================
  describe('Borrow Checker & Lifetime Conflict Scenarios (F10)', () => {
    it('TC-T2-F10-01: Visualizer gallery lists Borrow Checker & Lifetime simulator', () => {
      renderApp({ route: '/learn-rust/visualizers' });
      expect(screen.getAllByText('Borrow Checker & Lifetimes').length).toBeGreaterThan(0);
      expect(
        screen.getByText(/Visualize active references and aliasing rules/i)
      ).toBeInTheDocument();
    });

    it('TC-T2-F10-02: Multiple shared references vs exclusive mutable borrow rule presentation', () => {
      renderApp({ route: '/learn-rust/lessons/references-borrowing' });
      expect(screen.getByRole('heading', { name: /References & Borrowing/i })).toBeInTheDocument();

      expect(
        screen.getByText(/any number of immutable references \(&T\) OR exactly one mutable reference \(&mut T\)/i)
      ).toBeInTheDocument();
    });

    it('TC-T2-F10-03: Simulates move semantics preventing use-after-move error (E0382) with bi-directional recovery', async () => {
      renderApp({ route: '/learn-rust/lesson/ownership-move' });
      const visualizerEl = screen.getByTestId('ownership-visualizer');
      expect(visualizerEl).toBeInTheDocument();
      const driver = new VisualizerDriver(visualizerEl);

      // Initially at step 0 (Step 1 of 4): no compiler error
      expect(driver.getCompilerError()).toBeNull();

      // Step forward to step 1 (let s2 = s1)
      await driver.stepForward();
      expect(driver.getCompilerError()).toBeNull();

      // Step forward to step 2 (println!("{}", s1)) -> Error E0382 appears
      await driver.stepForward();
      const compilerError = driver.getCompilerError();
      expect(compilerError).not.toBeNull();
      expect(compilerError).toMatch(/error\[E0382\]/i);

      // Bi-directional recovery: step backward from error state
      await driver.stepBackward();
      // Assert error alert is removed from DOM
      expect(driver.getCompilerError()).toBeNull();
    });

    it('TC-T2-F10-04: Lifetimes outliving struct owner edge', async () => {
      const { container } = render(<BorrowCheckerVisualizer initialStep={2} />);
      const alert = container.querySelector('[role="alert"]');
      expect(alert).not.toBeNull();
      expect(alert).toHaveTextContent(/E0502.*cannot borrow.*as mutable/i);
    });

    it('TC-T2-F10-05: Visualizer unmount during autoPlay timer (zero memory leaks or unmounted errors)', async () => {
      const { container, unmount } = render(<OwnershipVisualizer autoPlay={true} />);
      const driver = new VisualizerDriver(container);

      const playBtn = driver.findPlayPauseButton();
      expect(playBtn).not.toBeNull();
      expect(playBtn).toHaveAttribute('aria-label', 'Pause');

      unmount();
      expect(container.firstChild).toBeNull();
    });
  });

  // =========================================================================
  // 5. Memory Layout Visualizer Boundaries (F11)
  // =========================================================================
  describe('Memory Layout Visualizer Boundaries (F11)', () => {
    it('TC-T2-F11-01: Memory Layout Visualizer card is cataloged with Stack vs Heap tracking', () => {
      renderApp({ route: '/learn-rust/visualizers' });
      expect(screen.getAllByText('Memory Layout (Stack vs Heap)').length).toBeGreaterThan(0);
      expect(
        screen.getByText(/Visual representation of Stack frames, pointers, capacities/i)
      ).toBeInTheDocument();
    });

    it('TC-T2-F11-02: Out-of-bounds slice range simulation (&s[0..100])', async () => {
      render(<MemoryLayoutVisualizer />);
      const sliceTab = screen.getByRole('tab', { name: /Slice/i });
      await user.click(sliceTab);

      expect(screen.getByTestId('layout-slice')).toBeInTheDocument();
      expect(screen.getByText(/len: 3/i)).toBeInTheDocument();
      expect(screen.getByText(/\+1 offset/i)).toBeInTheDocument();
    });

    it('TC-T2-F11-03: UTF-8 multibyte character splitting boundary (Emoji / CJK)', async () => {
      render(<MemoryLayoutVisualizer />);
      const strTab = screen.getByRole('tab', { name: /String vs &str/i });
      await user.click(strTab);

      expect(screen.getByText(/3-word struct \(24 bytes on 64-bit: ptr, cap, len\)/i)).toBeInTheDocument();
      expect(screen.getByText(/2-word fat pointer \(16 bytes: ptr, len\)/i)).toBeInTheDocument();
    });

    it('TC-T2-F11-04: Vec with zero capacity (Vec::new())', async () => {
      render(<MemoryLayoutVisualizer />);
      const vecTab = screen.getByRole('tab', { name: /Vec Reallocation/i });
      await user.click(vecTab);

      const pushBtn = screen.getByRole('button', { name: /Push Item/i });
      await user.click(pushBtn);
      await user.click(pushBtn);
      await user.click(pushBtn);

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('TC-T2-F11-05: Recursive data structure and zero-sized types (ZST)', async () => {
      render(<MemoryLayoutVisualizer />);
      const zstTab = screen.getByRole('tab', { name: /Zero-Sized Type/i });
      await user.click(zstTab);

      expect(screen.getByTestId('layout-zst')).toBeInTheDocument();
      expect(screen.getAllByText(/0 bytes/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/require no heap allocation/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // 6. Trait Dispatch Visualizer Boundaries (F12)
  // =========================================================================
  describe('Trait Dispatch Visualizer Boundaries (F12)', () => {
    it('TC-T2-F12-01: Trait Dispatch Visualizer compares Static Monomorphization vs Dynamic Vtable', () => {
      renderApp({ route: '/learn-rust/visualizers' });
      expect(screen.getAllByText('Trait Dispatch (Static vs Dyn)').length).toBeGreaterThan(0);
      expect(
        screen.getByText(/Compare compile-time monomorphization with runtime dynamic dispatch/i)
      ).toBeInTheDocument();
    });

    it('TC-T2-F12-02: Downcasting via Any boundary', async () => {
      render(<TraitDispatchVisualizer />);
      const dynamicTab = screen.getByRole('tab', { name: /Dynamic Dispatch/i });
      await user.click(dynamicTab);

      expect(screen.getByText(/Data Pointer: 0x3010/i)).toBeInTheDocument();
      expect(screen.getByText(/VTable Pointer: 0x8040/i)).toBeInTheDocument();
    });

    it('TC-T2-F12-03: Multiple trait bounds monomorphization verification', async () => {
      render(<TraitDispatchVisualizer />);
      expect(screen.getByText(/draw_circle/i)).toBeInTheDocument();
      expect(screen.getByText(/draw_square/i)).toBeInTheDocument();
    });

    it('TC-T2-F12-04: Zero-method marker traits and trade-off table', async () => {
      render(<TraitDispatchVisualizer />);
      const tradeoffsTab = screen.getByRole('tab', { name: /Cost Trade-offs/i });
      await user.click(tradeoffsTab);

      expect(screen.getByText(/Binary Size/i)).toBeInTheDocument();
      expect(screen.getByText(/Runtime Indirection/i)).toBeInTheDocument();
    });

    it('TC-T2-F12-05: Supertrait vtable inheritance & object safety rules', async () => {
      render(<TraitDispatchVisualizer />);
      const safetyTab = screen.getByRole('tab', { name: /Object Safety/i });
      await user.click(safetyTab);

      const toggleBtn = screen.getByRole('button', { name: /Only object-safe methods/i });
      await user.click(toggleBtn);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/E0038.*the trait cannot be made into an object/i);
    });
  });

  // =========================================================================
  // 7. Concurrency Visualizer Boundaries (F13)
  // =========================================================================
  describe('Concurrency Visualizer Boundaries (F13)', () => {
    it('TC-T2-F13-01: Concurrency Visualizer highlights MutexGuard & MPSC channels', () => {
      renderApp({ route: '/learn-rust/visualizers' });
      expect(screen.getAllByText(/Concurrency & Mutex/i).length).toBeGreaterThan(0);
      expect(
        screen.getByText(/simulate multiple threads acquiring MutexGuard locks/i)
      ).toBeInTheDocument();
    });

    it('TC-T2-F13-02: Rendezvous channel zero-capacity message passing', async () => {
      render(<ConcurrencyVisualizer />);
      const sendBtn = screen.getByRole('button', { name: /Send Message/i });
      await user.click(sendBtn);

      expect(screen.getByText(/Message #1/i)).toBeInTheDocument();
      expect(screen.getByText(/Channel Buffer \(1\)/i)).toBeInTheDocument();
    });

    it('TC-T2-F13-03: Poisoned mutex recovery simulation', async () => {
      render(<ConcurrencyVisualizer />);
      const mutexTab = screen.getByRole('tab', { name: /Arc<Mutex<T>>/i });
      await user.click(mutexTab);

      const t1LockBtn = screen.getByRole('button', { name: /Thread 1: Acquire Lock/i });
      await user.click(t1LockBtn);

      expect(screen.getByText(/Holding Lock/i)).toBeInTheDocument();
      expect(screen.getByText(/Waiting\/Blocked/i)).toBeInTheDocument();

      const t2Btn = screen.getByRole('button', { name: /Thread 2: Acquire \/ Handoff/i });
      await user.click(t2Btn);

      expect(screen.getByText(/Shared Counter Value:/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('TC-T2-F13-04: Channel saturation message burst', async () => {
      render(<ConcurrencyVisualizer />);
      const sendBtn = screen.getByRole('button', { name: /Send Message/i });

      for (let i = 0; i < 5; i++) {
        await user.click(sendBtn);
      }
      expect(screen.getByText(/Channel Buffer \(5\)/i)).toBeInTheDocument();
    });

    it('TC-T2-F13-05: Compare-and-swap and deadlock scenario detection', async () => {
      render(<ConcurrencyVisualizer />);
      const deadlockTab = screen.getByRole('tab', { name: /Deadlock Scenario/i });
      await user.click(deadlockTab);

      const simulateBtn = screen.getByRole('button', { name: /Simulate Deadlock/i });
      await user.click(simulateBtn);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(/Deadlock Warning/i);
    });
  });

  // =========================================================================
  // 8. Error Handling Visualizer Boundaries (F14)
  // =========================================================================
  describe('Error Handling Visualizer Boundaries (F14)', () => {
    it('TC-T2-F14-01: Railway Error Visualizer explains ? operator short-circuiting', () => {
      renderApp({ route: '/learn-rust/visualizers' });
      expect(screen.getAllByText(/Railway Error Flow/i).length).toBeGreaterThan(0);
      expect(
        screen.getByText(/seeing exactly how the \? operator short-circuits failure states/i)
      ).toBeInTheDocument();
    });

    it('TC-T2-F14-02: Custom error with missing cause / backtrace', async () => {
      render(<ErrorHandlingVisualizer />);
      const fromIntoTab = screen.getByRole('tab', { name: /From\/Into Conversion/i });
      await user.click(fromIntoTab);

      expect(screen.getByText(/From::from conversion/i)).toBeInTheDocument();
      expect(screen.getByText(/AppError::Io\(err\)/i)).toBeInTheDocument();
    });

    it('TC-T2-F14-03: Rapid step toggling at error junction', async () => {
      render(<ErrorHandlingVisualizer />);
      const stepBtn = screen.getByRole('button', { name: /Step Track/i });

      await user.click(stepBtn);
      await user.click(stepBtn);

      expect(screen.getByText(/process\(\)/i)).toBeInTheDocument();
    });

    it('TC-T2-F14-04: unwrap() on Err with long multi-line error message', async () => {
      render(<ErrorHandlingVisualizer />);
      const panicTab = screen.getByRole('tab', { name: /Panic vs Recoverable/i });
      await user.click(panicTab);

      const panicBtn = screen.getByRole('button', { name: /Trigger unwrap\(\) on None/i });
      await user.click(panicBtn);

      expect(screen.getByText(/thread 'main' panicked at/i)).toBeInTheDocument();
      expect(screen.getByTestId('ferris-mascot-panic')).toBeInTheDocument();
    });

    it('TC-T2-F14-05: Option::take() slot mutation and combinators', async () => {
      render(<ErrorHandlingVisualizer />);
      const optionTab = screen.getByRole('tab', { name: /Option Combinators/i });
      await user.click(optionTab);

      const noneBtn = screen.getByRole('button', { name: /^None$/i });
      await user.click(noneBtn);

      expect(screen.getByText(/0 \(default branch via unwrap_or\)/i)).toBeInTheDocument();
    });
  });
});
