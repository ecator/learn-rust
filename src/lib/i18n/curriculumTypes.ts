import { SupportedLanguage } from './types';

export type CurriculumPhaseKey = 'phase1' | 'phase2' | 'phase3';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonIconKey =
  | 'sparkles'
  | 'boxes'
  | 'shield'
  | 'lock'
  | 'repeat'
  | 'cpu'
  | 'zap';

export interface LessonSection {
  title: string;
  content: string;
  bullets: string[];
}

export interface LessonPitfall {
  title: string;
  errorCode: string;
  badCode: string;
  description: string;
  fix: string;
}

export interface LessonQuiz {
  question: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
  challengePrompt: string;
  challengePrefix: string;
  challengeKeyword: string;
  challengeSuffix: string;
  challengeSuccess: string;
}

export interface LocalizedLessonContent {
  title: string;
  shortTitle: string;
  phase: string;
  difficulty: string;
  duration: string;
  summary: string;
  tags: string[];
  overview: string;
  sections: [LessonSection, LessonSection, LessonSection];
  codeSnippet: string;
  codeExplanation: string[];
  pitfall: LessonPitfall;
  quiz: LessonQuiz;
}

export interface CurriculumLesson {
  slug: string;
  order: number;
  phaseKey: CurriculumPhaseKey;
  difficultyKey: DifficultyLevel;
  iconKey: LessonIconKey;
  visualizerSlug?: string;
  prevSlug?: string;
  nextSlug?: string;
  translations: Record<SupportedLanguage, LocalizedLessonContent>;
}
