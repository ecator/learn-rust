import { describe, it, expect, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OwnershipVisualizer } from '@/components/visualizers/OwnershipVisualizer';
import { BorrowCheckerVisualizer } from '@/components/visualizers/BorrowCheckerVisualizer';
import { MemoryLayoutVisualizer } from '@/components/visualizers/MemoryLayoutVisualizer';
import { VisualizerDriver } from '../helpers/visualizer-driver';

describe('Tier 1: Core Concept Visualizers (F09 - F11)', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  // ==========================================
  // F09: Ownership & Move Visualizer
  // ==========================================
  describe('F09: Ownership & Move Visualizer', () => {
    it('TC-T1-F09-01: Initial State Stack & Heap Representation', () => {
      render(<OwnershipVisualizer initialStep={0} />);
      const stackHeading = screen.getByText(/Stack Memory/i);
      const heapHeading = screen.getByText(/Heap Memory/i);
      expect(stackHeading).toBeInTheDocument();
      expect(heapHeading).toBeInTheDocument();

      expect(screen.getByText(/s1: String/i)).toBeInTheDocument();
      expect(screen.getByText(/ptr: 0x1040/i)).toBeInTheDocument();
      expect(screen.getByText(/len: 5/i)).toBeInTheDocument();
      expect(screen.getByText(/cap: 5/i)).toBeInTheDocument();
    });

    it('TC-T1-F09-02: Step Forward (Move Semantics)', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={0} />);
      const driver = new VisualizerDriver(container);

      await driver.stepForward();

      // s2 now active, s1 marked moved
      expect(screen.getByText(/s2: String \(Valid Owner\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Moved\/Invalidated/i)).toBeInTheDocument();
    });

    it('TC-T1-F09-03: Borrow Checker Error on Use-After-Move', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={1} />);
      const driver = new VisualizerDriver(container);

      await driver.stepForward(); // advance to step 2

      const error = driver.getCompilerError();
      expect(error).toMatch(/E0382.*borrow of moved value/i);
    });

    it('TC-T1-F09-04: Step Backwards (Scrubber Reversibility)', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={1} />);
      const driver = new VisualizerDriver(container);

      await driver.stepBackward(); // back to step 0

      expect(screen.queryByText(/Moved\/Invalidated/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/s2: String/i)).not.toBeInTheDocument();
    });

    it('TC-T1-F09-05: Scope Drop Animation & Deallocation', async () => {
      const { container } = render(<OwnershipVisualizer initialStep={2} />);
      const driver = new VisualizerDriver(container);

      await driver.stepForward(); // advance to step 3 (drop)

      expect(screen.getByText(/Heap memory deallocated/i)).toBeInTheDocument();
    });
  });

  // ==========================================
  // F10: Borrow Checker & Lifetimes Visualizer
  // ==========================================
  describe('F10: Borrow Checker & Lifetimes Visualizer', () => {
    it('TC-T1-F10-01: Immutable Multiple Borrows Render', () => {
      render(<BorrowCheckerVisualizer initialStep={1} />);
      const activeLeases = screen.getAllByText(/Active Lease \(&T\)/i);
      expect(activeLeases.length).toBe(2);
    });

    it('TC-T1-F10-02: Mutable Lease Exclusivity Simulation', async () => {
      const { container } = render(<BorrowCheckerVisualizer initialStep={1} />);
      const driver = new VisualizerDriver(container);

      await driver.stepForward(); // advance to step 2

      const error = driver.getCompilerError();
      expect(error).toMatch(/E0502.*cannot borrow.*as mutable/i);
    });

    it('TC-T1-F10-03: Non-Lexical Lifetimes (NLL) End of Scope', async () => {
      const { container } = render(<BorrowCheckerVisualizer initialStep={2} />);
      const driver = new VisualizerDriver(container);

      await driver.stepForward(); // advance to step 3

      expect(screen.getByText(/Non-Lexical Lifetimes \(NLL\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Active Lease \(&mut T\)/i)).toBeInTheDocument();
    });

    it('TC-T1-F10-04: Play/Pause Auto-scrubbing', async () => {
      const { container } = render(<BorrowCheckerVisualizer initialStep={0} />);
      const driver = new VisualizerDriver(container);

      const playBtn = driver.findPlayPauseButton();
      expect(playBtn).toBeInTheDocument();

      await driver.togglePlay();
      expect(screen.getByRole('button', { name: /Pause/i })).toBeInTheDocument();

      await driver.togglePlay();
      expect(screen.getByRole('button', { name: /Play/i })).toBeInTheDocument();
    });

    it('TC-T1-F10-05: Reset Visualizer State', async () => {
      const { container } = render(<BorrowCheckerVisualizer initialStep={3} />);
      const driver = new VisualizerDriver(container);

      await driver.reset();
      expect(screen.getByTestId('current-step')).toHaveTextContent(/Step 1 of 4/i);
    });
  });

  // ==========================================
  // F11: Memory Layout & Slice Visualizer
  // ==========================================
  describe('F11: Memory Layout & Slice Visualizer', () => {
    it('TC-T1-F11-01: Fat Pointer &str vs String Layout', () => {
      render(<MemoryLayoutVisualizer />);
      expect(screen.getByText(/String \(3 Words: 24 bytes\)/i)).toBeInTheDocument();
      expect(screen.getByText(/&str Fat Pointer \(2 Words: 16 bytes\)/i)).toBeInTheDocument();
    });

    it('TC-T1-F11-02: Slice Sub-range Visualization', async () => {
      render(<MemoryLayoutVisualizer />);
      const sliceTab = screen.getByRole('tab', { name: /Slice \(&s\[1\.\.4\]\)/i });
      await user.click(sliceTab);

      expect(screen.getByText(/\+1 offset/i)).toBeInTheDocument();
      expect(screen.getByText(/len: 3/i)).toBeInTheDocument();
    });

    it('TC-T1-F11-03: Vec Reallocation & Doubling Capacity', async () => {
      render(<MemoryLayoutVisualizer />);
      const vecTab = screen.getByRole('tab', { name: /Vec Reallocation/i });
      await user.click(vecTab);

      const pushBtn = screen.getByRole('button', { name: /Push Item/i });
      // Initially cap 4, len 2
      expect(screen.getByText('4')).toBeInTheDocument();

      // Push 3 times to exceed cap 4 -> cap becomes 8
      await user.click(pushBtn); // len 3
      await user.click(pushBtn); // len 4
      await user.click(pushBtn); // len 5, cap 8!

      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('TC-T1-F11-04: Alignment & Padding Inspection', async () => {
      render(<MemoryLayoutVisualizer />);
      const paddingTab = screen.getByRole('tab', { name: /Struct Padding/i });
      await user.click(paddingTab);

      expect(screen.getAllByText(/7-byte padding/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/6-byte padding/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Total Size: 24 bytes/i)).toBeInTheDocument();
    });

    it('TC-T1-F11-05: Zero-Sized Types (ZST) Representation', async () => {
      render(<MemoryLayoutVisualizer />);
      const zstTab = screen.getByRole('tab', { name: /Zero-Sized Type \(ZST\)/i });
      await user.click(zstTab);

      expect(screen.getAllByText(/0 bytes/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Alignment of/i)).toBeInTheDocument();
    });
  });
});
