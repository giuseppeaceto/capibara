"use client";

import React, { useState, useCallback } from "react";
import { CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";

type QuizQuestion = {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC?: string | null;
  optionD?: string | null;
  correctAnswer: "A" | "B" | "C" | "D";
  explanation?: string | null;
};

type Props = {
  questions: QuizQuestion[];
};

type AnswerState = {
  selected: string | null;
  confirmed: boolean;
};

const optionKeys = ["A", "B", "C", "D"] as const;

function getOptionText(q: QuizQuestion, key: string): string | null {
  const map: Record<string, string | null | undefined> = {
    A: q.optionA,
    B: q.optionB,
    C: q.optionC,
    D: q.optionD,
  };
  return map[key] ?? null;
}

export default function LessonQuiz({ questions }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(
    () => questions.map(() => ({ selected: null, confirmed: false })),
  );
  const [showResults, setShowResults] = useState(false);

  const current = questions[currentIdx];
  const answer = answers[currentIdx];

  const selectOption = useCallback(
    (key: string) => {
      if (answer.confirmed) return;
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIdx] = { ...next[currentIdx], selected: key };
        return next;
      });
    },
    [currentIdx, answer.confirmed],
  );

  const confirm = useCallback(() => {
    if (!answer.selected) return;
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], confirmed: true };
      return next;
    });
  }, [currentIdx, answer.selected]);

  const goNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setShowResults(true);
    }
  }, [currentIdx, questions.length]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) setCurrentIdx((i) => i - 1);
  }, [currentIdx]);

  const reset = useCallback(() => {
    setAnswers(questions.map(() => ({ selected: null, confirmed: false })));
    setCurrentIdx(0);
    setShowResults(false);
  }, [questions]);

  const correctCount = answers.filter(
    (a, i) => a.confirmed && a.selected === questions[i].correctAnswer,
  ).length;

  if (showResults) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="quiz-card space-y-4 text-center">
        <Trophy className="mx-auto h-12 w-12 text-amber-500" />
        <h3 className="page-heading text-xl font-bold">Quiz completato!</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Hai risposto correttamente a{" "}
          <strong>
            {correctCount} su {questions.length}
          </strong>{" "}
          domande ({pct}%)
        </p>
        <div className="progress-bar-bg mx-auto max-w-xs">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <button
          onClick={reset}
          className="hero-button-secondary mx-auto inline-flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Ripeti il quiz
        </button>
      </div>
    );
  }

  const availableOptions = optionKeys.filter(
    (key) => getOptionText(current, key) != null,
  );

  return (
    <div className="quiz-card space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="page-heading flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="h-5 w-5 text-amber-500" />
          Quiz
        </h3>
        <span className="text-xs text-zinc-500">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="progress-bar-bg">
        <div
          className="progress-bar-fill"
          style={{
            width: `${((currentIdx + (answer.confirmed ? 1 : 0)) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question */}
      <p className="text-base font-medium leading-relaxed page-heading">
        {current.question}
      </p>

      {/* Options */}
      <div className="space-y-2">
        {availableOptions.map((key) => {
          const text = getOptionText(current, key);
          const isSelected = answer.selected === key;
          const isCorrect = key === current.correctAnswer;
          const isConfirmed = answer.confirmed;

          let stateClass = "";
          if (isConfirmed && isSelected && isCorrect)
            stateClass = "quiz-option-correct";
          else if (isConfirmed && isSelected && !isCorrect)
            stateClass = "quiz-option-wrong";
          else if (isConfirmed && isCorrect)
            stateClass = "quiz-option-correct";

          return (
            <button
              key={key}
              onClick={() => selectOption(key)}
              disabled={isConfirmed}
              className={`quiz-option flex w-full items-center gap-3 text-left ${
                isSelected && !isConfirmed
                  ? "border-amber-500/60 bg-amber-500/10"
                  : ""
              } ${stateClass}`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-current/20 text-xs font-bold">
                {key}
              </span>
              <span className="flex-1">{text}</span>
              {isConfirmed && isSelected && isCorrect && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              )}
              {isConfirmed && isSelected && !isCorrect && (
                <XCircle className="h-5 w-5 shrink-0 text-red-500" />
              )}
              {isConfirmed && !isSelected && isCorrect && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answer.confirmed && current.explanation && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          <strong className="text-amber-500">Spiegazione:</strong>{" "}
          {current.explanation}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={goPrev}
          disabled={currentIdx === 0}
          className="pagination-button disabled:opacity-30"
        >
          ← Precedente
        </button>

        {!answer.confirmed ? (
          <button
            onClick={confirm}
            disabled={!answer.selected}
            className="hero-button-primary disabled:opacity-30"
          >
            Verifica
          </button>
        ) : (
          <button onClick={goNext} className="hero-button-primary">
            {currentIdx < questions.length - 1
              ? "Prossima domanda →"
              : "Vedi risultati"}
          </button>
        )}
      </div>
    </div>
  );
}
