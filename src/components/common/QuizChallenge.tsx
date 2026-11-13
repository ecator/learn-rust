import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Award, Sparkles } from 'lucide-react';
import { saveQuizResult } from '@/lib/storage';

export interface QuizChallengeProps {
  lessonId?: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}

export const QuizChallenge: React.FC<QuizChallengeProps> = ({
  lessonId = 'ownership-move',
  question = 'What happens to the value in stack variable s1 when executing `let s2 = s1;` in Rust?',
  options = [
    'Deep copy: Both s1 and s2 own separate copies of the heap buffer.',
    'Move semantics: Ownership transfers to s2; s1 becomes invalidated.',
    'Shared reference: Both point to the same buffer without invalidation.',
  ],
  correctIndex = 1,
  explanation = 'Rust moves ownership from s1 to s2 by shallow copying the 24-byte stack pointer and invalidating s1, preventing double-free bugs at zero runtime cost.',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [challengeInput, setChallengeInput] = useState('');
  const [challengeVerified, setChallengeVerified] = useState<boolean | null>(null);

  const isCorrect = selectedIndex === correctIndex;

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
    if (challengeInput.trim() === 'mut') {
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
          <span>Knowledge Check</span>
        </div>

        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
          {question}
        </h3>

        {/* Options (Radio buttons) */}
        <div role="radiogroup" aria-label="Quiz Options" className="space-y-2">
          {options.map((opt, idx) => {
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
                  className={`h-4 w-4 rounded-full border flex items-center justify-center ${
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
              className="rounded-xl bg-[#CE412B] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#B33621] disabled:opacity-50"
            >
              Submit Answer
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRetry}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Try Again</span>
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
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span>Correct! Celebration time (+20 XP) 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span>Incorrect. Review the explanation below:</span>
                </>
              )}
            </div>
            <p className="leading-relaxed">{explanation}</p>
          </div>
        )}
      </div>

      {/* Code Syntax Fill-in Challenge */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
          <Sparkles className="h-4 w-4" />
          <span>Code Syntax Challenge</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          Make variable <code>count</code> mutable by typing the correct Rust keyword:
        </p>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span>let</span>
          <input
            type="text"
            aria-label="Missing Rust keyword"
            value={challengeInput}
            onChange={(e) => setChallengeInput(e.target.value)}
            placeholder="keyword"
            className="w-24 rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-center font-bold focus:ring-2 focus:ring-[#CE412B] dark:bg-slate-800"
          />
          <span>count = 0;</span>

          <button
            type="button"
            onClick={verifyChallenge}
            className="rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 font-sans text-xs font-semibold hover:opacity-90"
          >
            Verify
          </button>
        </div>

        {challengeVerified === true && (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
            <span>Valid Rust syntax! `mut` makes bindings mutable.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizChallenge;
