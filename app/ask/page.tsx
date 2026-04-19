import { QuestionCard } from "@/components/question-card";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { resolveDoubt } from "@/lib/doubt-resolver";

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params.q ?? "Why pH 2 is acidic";
  const response = resolveDoubt(query);
  return (
    <main>
      <PageHeader eyebrow="Doubt resolver" title="Ask from question bank" note="This stub answers only from curated local syllabus/question-bank context. No random internet answers." />
      <Card>
        <form className="space-y-3">
          <label htmlFor="q" className="block text-sm font-black uppercase tracking-wide text-leaf">Your doubt</label>
          <input id="q" name="q" defaultValue={query} className="w-full rounded-2xl border border-ink/10 bg-white px-4 py-4 text-lg font-bold outline-none focus:border-leaf" placeholder="Example: algebra equation" />
          <button className="w-full rounded-2xl bg-leaf px-5 py-4 text-lg font-black text-white">Explain Simply</button>
        </form>
      </Card>
      <Card className="mt-4">
        <SectionTitle>Answer</SectionTitle>
        <p className="text-lg font-bold leading-8 text-ink/80">{response.answer}</p>
        <p className="mt-3 rounded-2xl bg-millet/25 p-3 font-bold text-ink/75">Common trap: {response.commonTrap}</p>
      </Card>
      <section className="mt-4 space-y-3">
        <SectionTitle>Matched Context</SectionTitle>
        {response.matches.map((question) => <QuestionCard key={question.question_text} question={question} showAnswer />)}
      </section>
    </main>
  );
}
