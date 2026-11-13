import { describe, it, expect } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TraitDispatchVisualizer } from '@/components/visualizers/TraitDispatchVisualizer';
import { ConcurrencyVisualizer } from '@/components/visualizers/ConcurrencyVisualizer';
import { ErrorHandlingVisualizer } from '@/components/visualizers/ErrorHandlingVisualizer';

describe('Tier 1: Advanced Visualizers (F12 - F14)', () => {
  const user = userEvent.setup();

  // ==========================================
  // F12: Trait Dispatch Visualizer
  // ==========================================
  describe('F12: Trait Dispatch Visualizer', () => {
    it('TC-T1-F12-01: Static Dispatch (Monomorphization) View', () => {
      render(<TraitDispatchVisualizer />);
      expect(screen.getByText(/draw_circle/i)).toBeInTheDocument();
      expect(screen.getByText(/draw_square/i)).toBeInTheDocument();
    });

    it('TC-T1-F12-02: Dynamic Dispatch (dyn Trait) VTable View', async () => {
      render(<TraitDispatchVisualizer />);
      const dynamicTab = screen.getByRole('tab', { name: /Dynamic Dispatch/i });
      await user.click(dynamicTab);

      expect(screen.getAllByText(/Data Pointer/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/VTable Pointer/i).length).toBeGreaterThan(0);
    });

    it('TC-T1-F12-03: VTable Jump Step-Through', async () => {
      render(<TraitDispatchVisualizer />);
      const dynamicTab = screen.getByRole('tab', { name: /Dynamic Dispatch/i });
      await user.click(dynamicTab);

      const stepBtn = screen.getByRole('button', { name: /Step Execution/i });
      await user.click(stepBtn);
      await user.click(stepBtn);

      expect(screen.getByText(/Jump to target function address/i)).toBeInTheDocument();
    });

    it('TC-T1-F12-04: Cost Trade-off Comparison Table', async () => {
      render(<TraitDispatchVisualizer />);
      const tradeoffsTab = screen.getByRole('tab', { name: /Cost Trade-offs/i });
      await user.click(tradeoffsTab);

      expect(screen.getByText(/Binary Size/i)).toBeInTheDocument();
      expect(screen.getByText(/Runtime Indirection/i)).toBeInTheDocument();
    });

    it('TC-T1-F12-05: Object Safety Rule Checker', async () => {
      render(<TraitDispatchVisualizer />);
      const safetyTab = screen.getByRole('tab', { name: /Object Safety/i });
      await user.click(safetyTab);

      const toggleBtn = screen.getByRole('button', { name: /Only object-safe methods/i });
      await user.click(toggleBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/E0038.*trait cannot be made into an object/i);
    });
  });

  // ==========================================
  // F13: Concurrency & Mutex Visualizer
  // ==========================================
  describe('F13: Concurrency & Mutex Visualizer', () => {
    it('TC-T1-F13-01: Channel MPSC Message Passing', async () => {
      render(<ConcurrencyVisualizer />);
      const sendBtn = screen.getByRole('button', { name: /Send Message/i });
      await user.click(sendBtn);

      expect(screen.getByText(/Message #1/i)).toBeInTheDocument();
    });

    it('TC-T1-F13-02: Arc<Mutex<T>> Contention Simulation', async () => {
      render(<ConcurrencyVisualizer />);
      const mutexTab = screen.getByRole('tab', { name: /Arc<Mutex<T>>/i });
      await user.click(mutexTab);

      const t1Btn = screen.getByRole('button', { name: /Thread 1: Acquire Lock/i });
      await user.click(t1Btn);

      expect(screen.getByText(/Holding Lock/i)).toBeInTheDocument();
    });

    it('TC-T1-F13-03: Mutex Unlock & Handoff', async () => {
      render(<ConcurrencyVisualizer />);
      const mutexTab = screen.getByRole('tab', { name: /Arc<Mutex<T>>/i });
      await user.click(mutexTab);

      const t1Btn = screen.getByRole('button', { name: /Thread 1: Acquire Lock/i });
      await user.click(t1Btn);

      const t2Btn = screen.getByRole('button', { name: /Thread 2: Acquire \/ Handoff/i });
      await user.click(t2Btn);

      // Data value increments
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('TC-T1-F13-04: Deadlock Simulation', async () => {
      render(<ConcurrencyVisualizer />);
      const deadlockTab = screen.getByRole('tab', { name: /Deadlock Scenario/i });
      await user.click(deadlockTab);

      const simBtn = screen.getByRole('button', { name: /Simulate Deadlock/i });
      await user.click(simBtn);

      expect(screen.getByRole('alert')).toHaveTextContent(/Deadlock Warning/i);
    });

    it('TC-T1-F13-05: Thread Spawn & Join Lifecycle', async () => {
      render(<ConcurrencyVisualizer />);
      const threadsTab = screen.getByRole('tab', { name: /Thread Spawn\/Join/i });
      await user.click(threadsTab);

      const spawnBtn = screen.getByRole('button', { name: /Spawn Thread/i });
      await user.click(spawnBtn);
      expect(screen.getByText(/Worker Thread \(spawned\)/i)).toBeInTheDocument();

      const joinBtn = screen.getByRole('button', { name: /Join Thread/i });
      await user.click(joinBtn);
      expect(screen.getByText(/joined!/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // F14: Error Handling Visualizer
  // ==========================================
  describe('F14: Error Handling Visualizer', () => {
    it('TC-T1-F14-01: Result::Ok Railway Track Execution', async () => {
      render(<ErrorHandlingVisualizer />);
      const stepBtn = screen.getByRole('button', { name: /Step Track/i });

      await user.click(stepBtn);
      await user.click(stepBtn);
      await user.click(stepBtn);

      expect(screen.getByText(/Ok\(value\)/i)).toHaveClass('bg-emerald-500');
    });

    it('TC-T1-F14-02: Result::Err Short-Circuit via ? Operator', async () => {
      render(<ErrorHandlingVisualizer />);
      const toggleValidBtn = screen.getByRole('button', { name: /Valid Input/i });
      await user.click(toggleValidBtn); // switch to Invalid Input

      const stepBtn = screen.getByRole('button', { name: /Step Track/i });
      await user.click(stepBtn);

      expect(screen.getByText(/Err\(ValidationError\) \[Early Return\]/i)).toBeInTheDocument();
    });

    it('TC-T1-F14-03: Option Combinators (map, and_then, unwrap_or)', async () => {
      render(<ErrorHandlingVisualizer />);
      const optionTab = screen.getByRole('tab', { name: /Option Combinators/i });
      await user.click(optionTab);

      expect(screen.getByText(/10 \(mapped via Some\)/i)).toBeInTheDocument();

      const noneBtn = screen.getByRole('button', { name: /^None$/i });
      await user.click(noneBtn);
      expect(screen.getByText(/0 \(default branch via unwrap_or\)/i)).toBeInTheDocument();
    });

    it('TC-T1-F14-04: Panic vs Recoverable Error Contrast', async () => {
      render(<ErrorHandlingVisualizer />);
      const panicTab = screen.getByRole('tab', { name: /Panic vs Recoverable/i });
      await user.click(panicTab);

      const triggerBtn = screen.getByRole('button', { name: /Trigger unwrap\(\) on None/i });
      await user.click(triggerBtn);

      expect(screen.getByRole('img', { name: /Ferris the Crab \(panic\)/i })).toBeInTheDocument();
      expect(screen.getByText(/unwinding stack frames/i)).toBeInTheDocument();
    });

    it('TC-T1-F14-05: Custom Error Conversion with From/Into', async () => {
      render(<ErrorHandlingVisualizer />);
      const fromIntoTab = screen.getByRole('tab', { name: /From\/Into Conversion/i });
      await user.click(fromIntoTab);

      expect(screen.getByText(/From::from conversion/i)).toBeInTheDocument();
      expect(screen.getByText(/AppError::Io/i)).toBeInTheDocument();
    });
  });
});
