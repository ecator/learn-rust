import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Award, Sparkles } from 'lucide-react';
import { saveQuizResult } from '@/lib/storage';
import { useI18n } from '@/lib/i18n';
import { getLocalizedLesson } from '@/lib/i18n/curriculumData';
import { HighlightedRustCode } from '@/components/common/RustCodeBlock';

export interface QuizChallengeProps {
  lessonId?: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  challengePrompt?: string;
  challengePrefix?: string;
  challengeKeyword?: string;
  challengeSuffix?: string;
  challengeSuccess?: string;
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({
  lessonId = 'ownership-move',
  question,
  options,
  correctIndex,
  explanation,
  challengePrompt,
  challengePrefix,
  challengeKeyword,
  challengeSuffix,
  challengeSuccess,
}) => {
  const { language, t } = useI18n();
  const defaultLesson = getLocalizedLesson(lessonId, language) ?? getLocalizedLesson('ownership-move', language);

  const resolvedQuestion = question ?? defaultLesson?.quiz.question ?? '';
  const resolvedOptions = options ?? defaultLesson?.quiz.options ?? [];
  const resolvedCorrectIndex = correctIndex ?? defaultLesson?.quiz.correctIndex ?? 1;
  const resolvedExplanation = explanation ?? defaultLesson?.quiz.explanation ?? '';
  const resolvedChallengePrompt =
    challengePrompt ?? t('quiz.syntaxChallengeDesc');
  const resolvedChallengePrefix = challengePrefix ?? 'let';
  const resolvedChallengeKeyword = challengeKeyword ?? 'mut';
  const resolvedChallengeSuffix = challengeSuffix ?? 'count = 0;';
  const resolvedChallengeSuccess =
    challengeSuccess ??
    t('quiz.syntaxSuccess', { keyword: resolvedChallengeKeyword });

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeVerified, setChallengeVerified] = useState<boolean | null>(null);

  useEffect(() => {
    setSelectedIndex(null);
    setIsSubmitted(false);
    setChallengeInput('');
    setChallengeVerified(null);
  }, [lessonId]);

  const isCorrect = selectedIndex === resolvedCorrectIndex;

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    setIsSubmitted(true);
    saveQuizResult(lessonId, {
      passed: isCorrect,
      attempts: 1,
      selectedAnswer: selectedIndex,
    });
  };

  const handleRetry = () => {
    setSelectedIndex(null);
    setIsSubmitted(false);
  };

  const verifyChallenge = () => {
    if (challengeInput.trim() === resolvedChallengeKeyword) {
      setChallengeVerified(true);
    } else {
      setChallengeVerified(false);
    }
  };

  return (
    <div
      data-testid="quiz-challenge"
      className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6"
    >
      {/* Quiz Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#CE412B]">
          <Award className="h-4 w-4" />
          <span>{t('quiz.knowledgeCheck')}</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          {resolvedQuestion}
        </h3>

        {/* Options (Radio buttons) */}
        <div role="radiogroup" aria-label={t('quiz.optionsAriaLabel')} className="space-y-2">
          {resolvedOptions.map((opt, idx) => {
            const isChecked = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                role="radio"
                aria-checked={isChecked}
                disabled={isSubmitted}
                onClick={() => setSelectedIndex(idx)}
                className={`w-full text-left rounded-xl p-3 text-xs sm:text-sm border transition-colors flex items-center justify-between ${
                  isChecked
                    ? 'border-[#CE412B] bg-[#CE412B]/5 font-semibold text-[#CE412B] dark:border-[#CE412B] dark:bg-[#CE412B]/10'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60'
                }`}
              >
                <span>{opt}</span>
                <span
                  className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                    isChecked ? 'border-[#CE412B] bg-[#CE412B]' : 'border-slate-300'
                  }`}
                >
                  {isChecked && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions & Feedback */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {!isSubmitted ? (
            <button
              type="button"
              disabled={selectedIndex === null}
              onClick={handleSubmit}
              aria-label="Submit Answer"
              className="rounded-xl bg-[#CE412B] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#B33621] disabled:opacity-50"
            >
              {t('quiz.submitAnswer')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              aria-label="Try Again"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('quiz.tryAgain')}</span>
            </button>
          )}
        </div>

        {isSubmitted && (
          <div
            role="alert"
            className={`rounded-xl p-4 text-xs space-y-2 ${
              isCorrect
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                : 'border border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  <span>{t('quiz.correctMessage')}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <span>{t('quiz.incorrectMessage')}</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{resolvedExplanation}</p>
          </div>
        )}
      </div>

      {/* Code Syntax Fill-in Challenge */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
          <Sparkles className="h-4 w-4" />
          <span>{t('quiz.syntaxChallengeTitle')}</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          {resolvedChallengePrompt}
        </p>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 font-mono text-xs text-slate-200">
          {resolvedChallengePrefix && (
            <span className="whitespace-pre-wrap">
              <HighlightedRustCode code={resolvedChallengePrefix} />
            </span>
          )}
          <input
            type="text"
            aria-label="Missing Rust keyword"
            value={challengeInput}
            onChange={(e) => {
              setChallengeInput(e.target.value);
              if (challengeVerified !== null) setChallengeVerified(null);
            }}
            placeholder={t('quiz.keywordPlaceholder')}
            className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-center font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#CE412B]"
          />
          {resolvedChallengeSuffix && (
            <span className="whitespace-pre-wrap">
              <HighlightedRustCode code={resolvedChallengeSuffix} />
            </span>
          )}

          <button
            type="button"
            onClick={verifyChallenge}
            aria-label="Verify"
            className="ml-auto rounded-lg bg-[#CE412B] text-white px-3 py-1.5 font-sans text-xs font-semibold hover:bg-[#B33621] transition-colors"
          >
            {t('quiz.verify')}
          </button>
        </div>

        {challengeVerified === true && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{resolvedChallengeSuccess}</span>
          </div>
        )}

        {challengeVerified === false && (
          <div role="alert" className="flex items-center gap-2 text-xs font-semibold text-red-600">
            <XCircle className="h-4 w-4 shrink-0" />
            <span>{t('quiz.syntaxFailure', { keyword: resolvedChallengeKeyword })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizChallenge;
