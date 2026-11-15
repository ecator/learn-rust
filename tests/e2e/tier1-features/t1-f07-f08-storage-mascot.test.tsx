import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from '../helpers/render-app';
import { Ferris } from '@/components/mascot/Ferris';
import {
  seedProgress,
  getStoredProgress,
  seedQuizAnswer,
  createDefaultProgress,
} from '../helpers/storage-mock';

describe('Tier 1: Storage & Mascot (F07 - F08)', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.clear();
  });

  // ==========================================
  // F07: LocalStorage Progress Engine
  // ==========================================
  describe('F07: LocalStorage Progress Engine', () => {
    it('TC-T1-F07-01: Schema Initial State Creation', () => {
      // Seeds schema if uninitialized or upon storage access
      const defaultData = seedProgress();
      expect(defaultData.version).toBe(1);
      expect(Array.isArray(defaultData.completedLessons)).toBe(true);
      expect(typeof defaultData.lastUpdated).toBe('string');
      expect(defaultData.stats.streakDays).toBeGreaterThanOrEqual(1);

      const stored = getStoredProgress();
      expect(stored).not.toBeNull();
      expect(stored?.version).toBe(1);
    });

    it('TC-T1-F07-02: Lesson Completion Mark Persistence', async () => {
      seedProgress();
      renderApp({ route: '/learn-rust/lesson/hello-ferris' });

      const markBtn = screen.getByRole('button', { name: /Mark as Completed/i });
      expect(markBtn).toBeInTheDocument();

      await user.click(markBtn);

      // Verify button updates to Completed
      expect(screen.getByRole('button', { name: /Completed/i })).toBeInTheDocument();

      // Verify localStorage persists completed lesson id
      const stored = getStoredProgress();
      expect(stored?.completedLessons).toContain('hello-ferris');
    });

    it('TC-T1-F07-03: Quiz Result State Persistence', () => {
      seedProgress();
      seedQuizAnswer('ownership-move', 2, true, 1);

      const stored = getStoredProgress();
      expect(stored?.quizStates['ownership-move']).toBeDefined();
      expect(stored?.quizStates['ownership-move'].passed).toBe(true);
      expect(stored?.quizStates['ownership-move'].attempts).toBe(1);
      expect(stored?.stats.xpScore).toBeGreaterThanOrEqual(10);
    });

    it('TC-T1-F07-04: Progress Export as JSON', async () => {
      seedProgress({ completedLessons: ['hello-ferris'] });
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        configurable: true,
        writable: true,
      });

      renderApp({ route: '/learn-rust/progress' });

      const exportBtn = screen.getByRole('button', { name: /Export Progress/i });
      expect(exportBtn).toBeInTheDocument();

      await user.click(exportBtn);
      expect(writeTextMock).toHaveBeenCalled();
      const exportedJson = JSON.parse(writeTextMock.mock.calls[0][0]);
      expect(exportedJson.version).toBe(1);
      expect(exportedJson.completedLessons).toContain('hello-ferris');
    });

    it('TC-T1-F07-05: Progress Reset Action', async () => {
      seedProgress({ completedLessons: ['hello-ferris', 'primitives-mutability'] });
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderApp({ route: '/learn-rust/progress' });

      const resetBtn = screen.getByRole('button', { name: /Reset Local Progress/i });
      expect(resetBtn).toBeInTheDocument();

      await user.click(resetBtn);

      const stored = getStoredProgress();
      expect(stored?.completedLessons).toEqual([]);
      expect(stored?.stats.xpScore).toBe(0);
    });
  });

  // ==========================================
  // F08: Ferris Mascot SVG Component
  // ==========================================
  describe('F08: Ferris Mascot SVG Component', () => {
    it('TC-T1-F08-01: Default Happy Mood Rendering', () => {
      render(<Ferris mood="happy" />);
      const mascot = screen.getByRole('img', { name: /Ferris the Crab \(happy\)/i });
      expect(mascot).toBeInTheDocument();
      expect(mascot).toHaveAttribute('data-testid', 'ferris-mascot-happy');
    });

    it('TC-T1-F08-02: Confused Mood Visual State', () => {
      render(<Ferris mood="confused" />);
      const mascot = screen.getByRole('img', { name: /Ferris the Crab \(confused\)/i });
      expect(mascot).toBeInTheDocument();
      expect(screen.getByTestId('confused-eyes')).toBeInTheDocument();
      expect(screen.getByTestId('confused-claws')).toBeInTheDocument();
    });

    it('TC-T1-F08-03: Panic Mood Visual State', () => {
      render(<Ferris mood="panic" />);
      const mascot = screen.getByRole('img', { name: /Ferris the Crab \(panic\)/i });
      expect(mascot).toBeInTheDocument();
      expect(screen.getByTestId('panic-eyes')).toBeInTheDocument();
      expect(screen.getByTestId('panic-claws')).toBeInTheDocument();
    });

    it('TC-T1-F08-04: Wizard Mood Visual State', () => {
      render(<Ferris mood="wizard" />);
      const mascot = screen.getByRole('img', { name: /Ferris the Crab \(wizard\)/i });
      expect(mascot).toBeInTheDocument();
      expect(screen.getByTestId('wizard-accessories')).toBeInTheDocument();
    });

    it('TC-T1-F08-05: Mood Cycling on Quiz Feedback', () => {
      // Simulates mood transition based on answer correctness
      const QuizWithMood = ({ isCorrect }: { isCorrect: boolean | null }) => {
        const mood = isCorrect === null ? 'confused' : isCorrect ? 'wizard' : 'panic';
        return <Ferris mood={mood} />;
      };

      const { rerender } = render(<QuizWithMood isCorrect={null} />);
      expect(screen.getByRole('img', { name: /Ferris the Crab \(confused\)/i })).toBeInTheDocument();

      rerender(<QuizWithMood isCorrect={false} />);
      expect(screen.getByRole('img', { name: /Ferris the Crab \(panic\)/i })).toBeInTheDocument();

      rerender(<QuizWithMood isCorrect={true} />);
      expect(screen.getByRole('img', { name: /Ferris the Crab \(wizard\)/i })).toBeInTheDocument();
    });
  });
});
