export const STORAGE_KEY_PROGRESS = 'learn_rust_progress_v1';
export const STORAGE_KEY_THEME = 'learn_rust_theme';
export const STORAGE_KEY_LANG = 'learn_rust_lang';

export interface UserProgress {
  version: 1;
  lastUpdated: string;
  completedLessons: string[];
  quizStates: Record<string, { passed: boolean; attempts: number; selectedAnswer: number | string }>;
  interactiveChallenges: Record<string, { solved: boolean; timestamp: string }>;
  bookmarks: string[];
  stats: { xpScore: number; streakDays: number; lastActiveDate: string };
}

export function createDefaultProgress(overrides: Partial<UserProgress> = {}): UserProgress {
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

export function seedProgress(overrides: Partial<UserProgress> = {}): UserProgress {
  const data = createDefaultProgress(overrides);
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
  return data;
}

export function getStoredProgress(): UserProgress | null {
  const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProgress;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY_PROGRESS);
}

export function seedCompletedLessons(lessonIds: string[]): void {
  const current = getStoredProgress() || createDefaultProgress();
  current.completedLessons = Array.from(new Set([...current.completedLessons, ...lessonIds]));
  current.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(current));
}

export function seedQuizAnswer(
  lessonId: string,
  selectedAnswer: number | string,
  passed: boolean,
  attempts = 1
): void {
  const current = getStoredProgress() || createDefaultProgress();
  current.quizStates[lessonId] = { passed, attempts, selectedAnswer };
  if (passed) {
    current.stats.xpScore += 10;
  }
  current.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(current));
}

export function seedTheme(theme: 'light' | 'dark' | 'system'): void {
  localStorage.setItem(STORAGE_KEY_THEME, theme);
}

export function getStoredTheme(): string | null {
  return localStorage.getItem(STORAGE_KEY_THEME);
}

export function seedLanguage(lang: 'zh' | 'en' | 'ja'): void {
  localStorage.setItem(STORAGE_KEY_LANG, lang);
}

export function getStoredLanguage(): string | null {
  return localStorage.getItem(STORAGE_KEY_LANG);
}
