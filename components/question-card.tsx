import type { Question } from "@/lib/types";

export function QuestionCard({ question, showAnswer = false }: { question: Question; showAnswer?: boolean }) {
  return (
    <article className="rounded-3xl border border-ink/10 bg-white p-4">
      <div className="mb-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-leaf">
        <span>{question.exam_type}</span>
        {question.group ? <span>{question.group}</span> : null}
        <span>{question.subject}</span>
        <span>{question.topic}</span>
      </div>
      <p className="text-lg font-black leading-7 text-ink">{question.question_text}</p>
      <div className="mt-4 grid gap-2">
        {question.options.map((option) => (
          <div key={option.label} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-field/60 p-3">
            <span className="omr-dot flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-leaf">{option.label}</span>
            <span className="font-bold text-ink/80">{option.text}</span>
          </div>
        ))}
      </div>
      {showAnswer ? (
        <div className="mt-4 rounded-2xl bg-millet/25 p-3 text-sm leading-6 text-ink/80">
          <p className="font-black text-ink">Correct: {question.correct_option}</p>
          <p>{question.explanation}</p>
        </div>
      ) : null}
    </article>
  );
}
