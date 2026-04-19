"use client";

import { useMemo, useState } from "react";
import { evaluateMock } from "@/lib/assessment";
import type { Question } from "@/lib/types";

type OptionState = "neutral" | "selected" | "correct" | "wrong" | "missed-correct";

function optionState(question: Question, selectedOption: string | undefined, optionLabel: string, submitted: boolean): OptionState {
  if (!submitted) return selectedOption === optionLabel ? "selected" : "neutral";
  if (optionLabel === question.correct_option && selectedOption !== question.correct_option) return "missed-correct";
  if (optionLabel === question.correct_option) return "correct";
  if (selectedOption === optionLabel) return "wrong";
  return "neutral";
}

function optionClasses(state: OptionState) {
  const base = "flex min-h-14 items-center gap-3 rounded-2xl border p-3 text-left font-bold transition active:scale-[0.99]";
  const styles = {
    neutral: "border-ink/10 bg-white text-ink/75",
    selected: "border-leaf bg-field text-ink",
    correct: "border-emerald-600 bg-emerald-50 text-emerald-950",
    wrong: "border-red-600 bg-red-50 text-red-950",
    "missed-correct": "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200"
  } satisfies Record<OptionState, string>;
  return `${base} ${styles[state]}`;
}

function dotClasses(state: OptionState) {
  const styles = {
    neutral: "bg-white text-leaf",
    selected: "bg-leaf text-white",
    correct: "bg-emerald-600 text-white",
    wrong: "bg-red-600 text-white",
    "missed-correct": "bg-emerald-600 text-white"
  } satisfies Record<OptionState, string>;
  return `omr-dot flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${styles[state]}`;
}

function mistakeMessage(question: Question, selectedOption?: string) {
  if (!selectedOption) {
    return "You left this blank. In these exams there is no negative marking for POLYCET, so leaving easy questions blank can waste marks. If unsure, eliminate two options and attempt.";
  }

  const selected = question.options.find((option) => option.label === selectedOption)?.text ?? selectedOption;
  const correct = question.options.find((option) => option.label === question.correct_option)?.text ?? question.correct_option;
  return `You selected ${selectedOption}: ${selected}. Correct is ${question.correct_option}: ${correct}. This usually means the rule/formula was not checked before choosing the option.`;
}

export function MockTest({ questions }: { questions: Question[] }) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showMissingWarning, setShowMissingWarning] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;

  const result = useMemo(
    () =>
      evaluateMock(
        questions.map((question, index) => ({
          question,
          selectedOption: answers[index],
          isFlagged: flagged[index],
          isGuessed: false,
          timeSpentSec: 90 + index * 25
        }))
      ),
    [answers, flagged, questions]
  );

  const wrongAnswers = result.weakTopics.reduce((sum, topic) => sum + topic.wrong, 0);

  function submitStrictExam() {
    if (unansweredCount > 0) {
      setShowMissingWarning(true);
      return;
    }
    setSubmitted(true);
    setShowMissingWarning(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-ink p-4 text-white shadow-soft">
        <p className="text-sm font-bold uppercase tracking-wide text-millet">Strict exam mode</p>
        <h2 className="mt-1 text-2xl font-black">Answer first. Learn after submit.</h2>
        <p className="mt-2 text-white/80">No hints during the test. No instant feedback. Finish all questions, then review red mistakes and green correct answers.</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm font-black">
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-white/60">Answered</p><p className="text-xl">{answeredCount}</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-white/60">Left</p><p className="text-xl">{unansweredCount}</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><p className="text-white/60">Flagged</p><p className="text-xl">{Object.values(flagged).filter(Boolean).length}</p></div>
        </div>
      </div>

      {submitted ? (
        <section className="rounded-3xl border border-ink/10 bg-paper p-4 shadow-soft">
          <p className="text-sm font-bold uppercase tracking-wide text-leaf">Exam review</p>
          <h2 className="text-4xl font-black text-ink">{result.score}/{result.total}</h2>
          <p className="mt-1 font-bold text-ink/70">Accuracy: {result.accuracy}%</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <p className="rounded-2xl bg-emerald-50 p-3 font-black text-emerald-900">Correct: {result.score}</p>
            <p className="rounded-2xl bg-red-50 p-3 font-black text-red-900">Incorrect: {wrongAnswers}</p>
            <p className="rounded-2xl bg-millet/25 p-3 font-black text-ink">Time: {Math.round(result.timeSpentSec / 60)} min</p>
          </div>
          <div className="mt-4 space-y-2">
            {result.weakTopics.map((topic) => (
              <p key={`${topic.subject}-${topic.topic}`} className="rounded-2xl bg-white p-3 font-bold text-ink/75">
                Focus: {topic.subject} - {topic.topic}. Don&apos;t panic. Retry this first, then take one short test again.
              </p>
            ))}
          </div>
        </section>
      ) : null}

      {questions.map((question, index) => {
        const selectedOption = answers[index];
        const isWrong = submitted && selectedOption !== question.correct_option;
        const isCorrect = submitted && selectedOption === question.correct_option;

        return (
          <article key={`${question.exam_type}-${question.year}-${question.question_text}`} className="rounded-3xl border border-ink/10 bg-white p-4 shadow-soft">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-black text-leaf">Q{index + 1}. {question.subject} - {question.topic}</p>
              <button
                type="button"
                disabled={submitted}
                onClick={() => setFlagged((current) => ({ ...current, [index]: !current[index] }))}
                className="rounded-full bg-field px-3 py-1 text-xs font-black text-ink disabled:opacity-60"
              >
                {flagged[index] ? "Flagged" : "Flag"}
              </button>
            </div>
            <p className="text-lg font-black leading-7 text-ink">{question.question_text}</p>
            <div className="mt-4 grid gap-2">
              {question.options.map((option) => {
                const state = optionState(question, selectedOption, option.label, submitted);
                return (
                  <button
                    type="button"
                    key={option.label}
                    disabled={submitted}
                    onClick={() => setAnswers((current) => ({ ...current, [index]: option.label }))}
                    className={optionClasses(state)}
                  >
                    <span className={dotClasses(state)}>{option.label}</span>
                    <span className="flex-1">{option.text}</span>
                    {submitted && state === "correct" ? <span className="text-sm font-black">Correct</span> : null}
                    {submitted && state === "wrong" ? <span className="text-sm font-black">Your answer</span> : null}
                  </button>
                );
              })}
            </div>

            {submitted ? (
              <div className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${isWrong ? "bg-red-50 text-red-950" : "bg-emerald-50 text-emerald-950"}`}>
                <p className="text-base font-black">{isCorrect ? "Good. This mark is safe." : "Mistake review"}</p>
                {isWrong ? <p className="mt-1 font-bold">{mistakeMessage(question, selectedOption)}</p> : null}
                <div className="mt-3 rounded-2xl bg-white/70 p-3">
                  <p className="font-black">Why the correct option is right</p>
                  <p>{question.explanation}</p>
                </div>
                {isWrong ? (
                  <p className="mt-3 font-bold">Common trap: don&apos;t choose by memory feeling. Read the rule, solve one step, then mark OMR.</p>
                ) : null}
              </div>
            ) : null}
          </article>
        );
      })}

      {showMissingWarning ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-950">
          Strict exam mode: {unansweredCount} question{unansweredCount === 1 ? "" : "s"} left. Answer all before submitting.
        </div>
      ) : null}

      {!submitted ? (
        <button type="button" onClick={submitStrictExam} className="w-full rounded-2xl bg-clay px-5 py-4 text-lg font-black text-white shadow-soft active:scale-[0.98]">
          Submit Strict Exam
        </button>
      ) : (
        <button type="button" onClick={() => { setAnswers({}); setFlagged({}); setSubmitted(false); setShowMissingWarning(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full rounded-2xl bg-leaf px-5 py-4 text-lg font-black text-white shadow-soft active:scale-[0.98]">
          Retry Test
        </button>
      )}
    </div>
  );
}
