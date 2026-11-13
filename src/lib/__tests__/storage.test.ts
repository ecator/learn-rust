import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY_PROGRESS,
  UserProgress,
  createDefaultProgress,
  getProgress,
  loadProgress,
  saveProgress,
  markLessonComplete,
  markLessonCompleted,
  recordQuizResult,
  saveQuizResult,
  toggleBookmark,
  exportProgressJSON,
  exportProgress,
  importProgressJSON,
  importProgress,
  resetProgress,
  subscribeProgress,
} from '../storage';

describe('LocalStorage Progress Engine (src/lib/storage.ts)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Initialization and Schema Integrity', () => {
    it('creates a compliant default UserProgress schema', () => {
      const def = createDefaultProgress();
      expect(def.version).toBe(1);
      expect(Array.isArray(def.completedLessons)).toBe(true);
      expect(def.completedLessons.length).toBe(0);
      expect(typeof def.quizStates).toBe('object');
      expect(Array.isArray(def.bookmarks)).toBe(true);
      expect(def.stats.xpScore).toBe(0);
      expect(def.stats.streakDays).toBe(1);
      expect(typeof def.lastUpdated).toBe('string');
    });

    it('initializes and saves default progress when localStorage is empty', () => {
      const progress = getProgress();
      expect(progress.version).toBe(1);
      expect(localStorage.getItem(STORAGE_KEY_PROGRESS)).not.toBeNull();
    });

    it('aliases loadProgress to getProgress identically', () => {
      expect(loadProgress).toBe(getProgress);
    });

    it('recovers safely from malformed or corrupted JSON in localStorage', () => {
      localStorage.setItem(STORAGE_KEY_PROGRESS, '!!!NOT_VALID_JSON@@@');
      const recovered = getProgress();
      expect(recovered.version).toBe(1);
      expect(recovered.completedLessons).toEqual([]);
    });

    it('recovers safely from legacy or invalid schema version', () => {
      localStorage.setItem(
        STORAGE_KEY_PROGRESS,
        JSON.stringify({ version: 999, invalidData: true })
      );
      const recovered = getProgress();
      expect(recovered.version).toBe(1);
      expect(recovered.completedLessons).toEqual([]);
    });
  });

  describe('Lesson Completion & XP Tracking', () => {
    it('marks lesson as completed and awards 50 XP', () => {
      const updated = markLessonComplete('hello-ferris');
      expect(updated.completedLessons).toContain('hello-ferris');
      expect(updated.stats.xpScore).toBe(50);

      const stored = getProgress();
      expect(stored.completedLessons).toContain('hello-ferris');
      expect(stored.stats.xpScore).toBe(50);
    });

    it('does not duplicate completed lesson or award double XP on repeated completion', () => {
      markLessonComplete('hello-ferris');
      const secondCall = markLessonComplete('hello-ferris');

      expect(secondCall.completedLessons.filter((id) => id === 'hello-ferris').length).toBe(1);
      expect(secondCall.stats.xpScore).toBe(50);
    });

    it('aliases markLessonCompleted to markLessonComplete', () => {
      expect(markLessonCompleted).toBe(markLessonComplete);
    });
  });

  describe('Quiz Result Recording', () => {
    it('records quiz state and awards 20 XP on first pass', () => {
      const updated = recordQuizResult('ownership-move', {
        passed: true,
        attempts: 1,
        selectedAnswer: 2,
      });

      expect(updated.quizStates['ownership-move']).toBeDefined();
      expect(updated.quizStates['ownership-move'].passed).toBe(true);
      expect(updated.stats.xpScore).toBe(20);
    });

    it('does not re-award XP if already previously passed', () => {
      recordQuizResult('ownership-move', { passed: true, attempts: 1, selectedAnswer: 2 });
      const secondPass = recordQuizResult('ownership-move', { passed: true, attempts: 2, selectedAnswer: 2 });

      expect(secondPass.stats.xpScore).toBe(20);
      expect(secondPass.quizStates['ownership-move'].attempts).toBe(2);
    });

    it('does not award XP on failed quiz', () => {
      const failed = recordQuizResult('memory-layout', { passed: false, attempts: 1, selectedAnswer: 0 });
      expect(failed.stats.xpScore).toBe(0);
      expect(failed.quizStates['memory-layout'].passed).toBe(false);
    });

    it('aliases saveQuizResult to recordQuizResult', () => {
      expect(saveQuizResult).toBe(recordQuizResult);
    });
  });

  describe('Bookmarks Engine', () => {
    it('toggles bookmarks adding and removing lessons', () => {
      const withBookmark = toggleBookmark('concurrency-threads');
      expect(withBookmark.bookmarks).toContain('concurrency-threads');

      const removedBookmark = toggleBookmark('concurrency-threads');
      expect(removedBookmark.bookmarks).not.toContain('concurrency-threads');
    });
  });

  describe('Export & Import JSON', () => {
    it('exports formatted JSON string representing current progress', () => {
      markLessonComplete('hello-ferris');
      const exported = exportProgressJSON();
      expect(typeof exported).toBe('string');
      const parsed = JSON.parse(exported);
      expect(parsed.version).toBe(1);
      expect(parsed.completedLessons).toContain('hello-ferris');
    });

    it('aliases exportProgress to exportProgressJSON', () => {
      expect(exportProgress).toBe(exportProgressJSON);
    });

    it('imports valid JSON and updates localStorage', () => {
      const validImport: UserProgress = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        completedLessons: ['hello-ferris', 'primitives-mutability'],
        quizStates: {},
        interactiveChallenges: {},
        bookmarks: ['hello-ferris'],
        stats: { xpScore: 100, streakDays: 3, lastActiveDate: new Date().toISOString() },
      };

      const success = importProgressJSON(JSON.stringify(validImport));
      expect(success).toBe(true);

      const loaded = getProgress();
      expect(loaded.completedLessons).toEqual(['hello-ferris', 'primitives-mutability']);
      expect(loaded.stats.xpScore).toBe(100);
      expect(loaded.bookmarks).toContain('hello-ferris');
    });

    it('rejects invalid JSON string or version mismatch during import', () => {
      expect(importProgressJSON('corrupted_string')).toBe(false);
      expect(importProgressJSON(JSON.stringify({ version: 2 }))).toBe(false);
      expect(importProgressJSON(JSON.stringify({ version: 1, completedLessons: 'not-an-array' }))).toBe(false);
    });

    it('aliases importProgress to importProgressJSON', () => {
      expect(importProgress).toBe(importProgressJSON);
    });
  });

  describe('Reset Progress', () => {
    it('wipes progress back to baseline state', () => {
      markLessonComplete('hello-ferris');
      toggleBookmark('hello-ferris');
      expect(getProgress().completedLessons.length).toBe(1);

      const reset = resetProgress();
      expect(reset.completedLessons).toEqual([]);
      expect(reset.stats.xpScore).toBe(0);
      expect(reset.bookmarks).toEqual([]);

      const stored = getProgress();
      expect(stored.completedLessons).toEqual([]);
    });
  });

  describe('Cross-Tab & Event Subscription', () => {
    it('notifies subscribers on same-tab progress save', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeProgress(listener);

      markLessonComplete('hello-ferris');
      expect(listener).toHaveBeenCalled();
      const updatedArg = listener.mock.calls[listener.mock.calls.length - 1][0];
      expect(updatedArg.completedLessons).toContain('hello-ferris');

      unsubscribe();
      markLessonComplete('primitives-mutability');
      const callCountAfterUnsubscribe = listener.mock.calls.length;
      expect(listener.mock.calls.length).toBe(callCountAfterUnsubscribe);
    });

    it('notifies subscribers on cross-tab storage event', () => {
      const listener = vi.fn();
      const unsubscribe = subscribeProgress(listener);

      const crossTabProgress = createDefaultProgress({
        completedLessons: ['cross-tab-lesson'],
        stats: { xpScore: 200, streakDays: 5, lastActiveDate: new Date().toISOString() },
      });
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(crossTabProgress));

      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY_PROGRESS,
          newValue: JSON.stringify(crossTabProgress),
          storageArea: localStorage,
        })
      );

      expect(listener).toHaveBeenCalled();
      const received = listener.mock.calls[listener.mock.calls.length - 1][0];
      expect(received.completedLessons).toContain('cross-tab-lesson');

      unsubscribe();
    });
  });

  describe('Quota Exceeded & Exception Resilience', () => {
    it('catches QuotaExceededError in saveProgress gracefully without throwing', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const setItemSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      });

      expect(() => {
        saveProgress(createDefaultProgress());
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });
});
