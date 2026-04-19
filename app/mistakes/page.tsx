import { QuestionCard } from "@/components/question-card";
import { ActionButton, Card, PageHeader, SectionTitle } from "@/components/ui";
import { filterQuestions } from "@/lib/questions";

export default function MistakesPage() {
  const wrong = filterQuestions({ exam: "POLYCET", subject: "Maths", limit: 2 });
  const flagged = filterQuestions({ exam: "TGRJC", limit: 2 });
  return (
    <main>
      <PageHeader eyebrow="Mistake book" title="Retry only what hurts marks." note="Wrong, flagged, and guessed-right questions are kept here so revision is not random." />
      <section className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm font-bold text-ink/50">Wrong</p><p className="text-3xl font-black">{wrong.length}</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Flagged</p><p className="text-3xl font-black">{flagged.length}</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Guessed right</p><p className="text-3xl font-black">1</p></Card>
      </section>
      <div className="mt-4"><ActionButton href="/mock">Retry Weak Questions</ActionButton></div>
      <section className="mt-4 space-y-3">
        <SectionTitle>Saved Questions</SectionTitle>
        {[...wrong, ...flagged].map((question) => <QuestionCard key={question.question_text} question={question} showAnswer />)}
      </section>
    </main>
  );
}
