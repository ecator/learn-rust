export const STORAGE_KEY_PROGRESS = 'learn_rust_progress_v1';
export const PROGRESS_CHANGE_EVENT = 'learn_rust_progress_change';

export interface UserProgress {
  version: 1;
  lastUpdated: string;
  completedLessons: string[];
  quizStates: Record<string, { passed: boolean; attempts: number; selectedAnswer: number | string }>;
  interactiveChallenges: Record<string, { solved: boolean; timestamp: string }>;
  bookmarks: string[];
  stats: { xpScore: number; streakDays: number; lastActiveDate: string };
}

export function createDefaultProgress(overrides?: Partial<UserProgress>): UserProgress {
  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    completedLessons: [],
    quizStates: {},
    interactiveChallenges: {},
    bookmarks: [],
    stats: { xpScore: 0, streakDays: 1, lastActiveDate: new Date().toISOString() },
    ...overrides,
  };
}

function notifySubscribers(progress: UserProgress): void {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent<UserProgress>(PROGRESS_CHANGE_EVENT, { detail: progress })
      );
    } catch {}
  }
}

/**
 * Loads user progress from localStorage or initializes default state if not found or corrupted.
 */
export function getProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) {
      const defaultState = createDefaultProgress();
      saveProgress(defaultState, false);
      return defaultState;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.completedLessons)) {
      const defaultState = createDefaultProgress();
      saveProgress(defaultState, false);
      return defaultState;
    }

    // Defensive initialization of nested structures
    const validated: UserProgress = {
      version: 1,
      lastUpdated: typeof parsed.lastUpdated === 'string' ? parsed.lastUpdated : new Date().toISOString(),
      completedLessons: parsed.completedLessons.filter((x: any) => typeof x === 'string'),
      quizStates:
        parsed.quizStates && typeof parsed.quizStates === 'object' && !Array.isArray(parsed.quizStates)
          ? parsed.quizStates
          : {},
      interactiveChallenges:
        parsed.interactiveChallenges &&
        typeof parsed.interactiveChallenges === 'object' &&
        !Array.isArray(parsed.interactiveChallenges)
          ? parsed.interactiveChallenges
          : {},
      bookmarks: Array.isArray(parsed.bookmarks)
        ? parsed.bookmarks.filter((x: any) => typeof x === 'string')
        : [],
      stats: {
        xpScore: Number.isFinite(parsed.stats?.xpScore) && parsed.stats.xpScore >= 0 ? parsed.stats.xpScore : 0,
        streakDays:
          Number.isFinite(parsed.stats?.streakDays) && parsed.stats.streakDays >= 1
            ? parsed.stats.streakDays
            : 1,
        lastActiveDate:
          typeof parsed.stats?.lastActiveDate === 'string'
            ? parsed.stats.lastActiveDate
            : new Date().toISOString(),
      },
    };

    return validated;
  } catch {
    const defaultState = createDefaultProgress();
    saveProgress(defaultState, false);
    return defaultState;
  }
}

export const loadProgress = getProgress;

/**
 * Saves user progress to localStorage with error handling for quota and private mode
 */
export function saveProgress(progress: UserProgress, notify: boolean = true): void {
  if (!progress || typeof progress !== 'object') return;
  try {
    const toSave: UserProgress = {
      ...progress,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(toSave));
    if (notify) {
      notifySubscribers(toSave);
    }
  } catch (err) {
    console.warn('Failed to save progress to localStorage', err);
  }
}

/**
 * Marks a lesson as complete and increments XP
 */
export function markLessonComplete(lessonId: string): UserProgress {
  if (!lessonId || typeof lessonId !== 'string') return getProgress();
  const current = getProgress();
  if (!current.completedLessons.includes(lessonId)) {
    current.completedLessons.push(lessonId);
    current.stats.xpScore += 50;
    saveProgress(current);
  }
  return current;
}

export const markLessonCompleted = markLessonComplete;

/**
 * Saves a quiz result and awards XP on first pass
 */
export function recordQuizResult(
  lessonId: string,
  result: { passed: boolean; attempts: number; selectedAnswer: number | string }
): UserProgress {
  const current = getProgress();
  const alreadyPassed = current.quizStates[lessonId]?.passed;
  current.quizStates[lessonId] = result;
  if (result.passed && !alreadyPassed) {
    current.stats.xpScore += 20;
  }
  saveProgress(current);
  return current;
}

export const saveQuizResult = recordQuizResult;

/**
 * Toggles a bookmark for a specific lesson
 */
export function toggleBookmark(lessonId: string): UserProgress {
  const current = getProgress();
  if (current.bookmarks.includes(lessonId)) {
    current.bookmarks = current.bookmarks.filter((id) => id !== lessonId);
  } else {
    current.bookmarks.push(lessonId);
  }
  saveProgress(current);
  return current;
}

/**
 * Exports progress as formatted JSON string
 */
export function exportProgressJSON(): string {
  const current = getProgress();
  return JSON.stringify(current, null, 2);
}

export const exportProgress = exportProgressJSON;

/**
 * Imports progress from a JSON string, validating the schema version
 */
export function importProgressJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.version === 1 && Array.isArray(parsed.completedLessons)) {
      const validated: UserProgress = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        completedLessons: parsed.completedLessons.filter((x: any) => typeof x === 'string'),
        quizStates:
          parsed.quizStates && typeof parsed.quizStates === 'object' && !Array.isArray(parsed.quizStates)
            ? parsed.quizStates
            : {},
        interactiveChallenges:
          parsed.interactiveChallenges &&
          typeof parsed.interactiveChallenges === 'object' &&
          !Array.isArray(parsed.interactiveChallenges)
            ? parsed.interactiveChallenges
            : {},
        bookmarks: Array.isArray(parsed.bookmarks)
          ? parsed.bookmarks.filter((x: any) => typeof x === 'string')
          : [],
        stats: {
          xpScore: Number.isFinite(parsed.stats?.xpScore) && parsed.stats.xpScore >= 0 ? parsed.stats.xpScore : 0,
          streakDays:
            Number.isFinite(parsed.stats?.streakDays) && parsed.stats.streakDays >= 1
              ? parsed.stats.streakDays
              : 1,
          lastActiveDate:
            typeof parsed.stats?.lastActiveDate === 'string'
              ? parsed.stats.lastActiveDate
              : new Date().toISOString(),
        },
      };
      saveProgress(validated);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export const importProgress = importProgressJSON;

/**
 * Resets user progress back to baseline
 */
export function resetProgress(): UserProgress {
  const defaultState = createDefaultProgress();
  try {
    localStorage.removeItem(STORAGE_KEY_PROGRESS);
    localStorage.removeItem('learn_rust_progress');
  } catch {}
  saveProgress(defaultState);
  return defaultState;
}

/**
 * Subscribes to progress changes from both current tab and other tabs
 */
export function subscribeProgress(callback: (progress: UserProgress) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const custom = e as CustomEvent<UserProgress>;
    if (custom.detail) {
      callback(custom.detail);
    } else {
      callback(getProgress());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY_PROGRESS || e.key === null) {
      callback(getProgress());
    }
  };

  window.addEventListener(PROGRESS_CHANGE_EVENT, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(PROGRESS_CHANGE_EVENT, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
}
