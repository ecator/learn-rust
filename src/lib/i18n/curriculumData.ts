import { curriculumLessonsPart1 } from './curriculumPart1';
import { curriculumLessonsPart2 } from './curriculumPart2';
import {
  CurriculumLesson,
  LocalizedLessonContent,
} from './curriculumTypes';
import { SupportedLanguage } from './types';

export * from './curriculumTypes';

export const curriculumLessons: CurriculumLesson[] = [
  ...curriculumLessonsPart1,
  ...curriculumLessonsPart2,
].sort((a, b) => a.order - b.order);

export type ResolvedCurriculumLesson = Omit<CurriculumLesson, 'translations'> &
  LocalizedLessonContent;

export function getCurriculumLesson(
  slug: string
): CurriculumLesson | undefined {
  return curriculumLessons.find((lesson) => lesson.slug === slug);
}

export function getLocalizedLesson(
  slug: string,
  lang: SupportedLanguage
): ResolvedCurriculumLesson | undefined {
  const lesson = getCurriculumLesson(slug);
  if (!lesson) {
    return undefined;
  }

  const localized = lesson.translations[lang] ?? lesson.translations.en;
  const { translations: _translations, ...meta } = lesson;

  return {
    ...meta,
    ...localized,
  };
}
