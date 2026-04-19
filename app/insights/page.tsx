import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { buildFocusAreas, evaluateMock, projectScore } from "@/lib/assessment";
import { filterQuestions } from "@/lib/questions";

export default function InsightsPage() {
  const sample = filterQuestions({ limit: 7 });
  const result = evaluateMock(sample.map((question, index) => ({
    question,
    selectedOption: index % 3 === 0 ? "A" : question.correct_option,
    isGuessed: index === 4,
    isFlagged: index === 5,
    timeSpentSec: 80 + index * 30
  })));
  const projection = projectScore([48, 53, 50, 61, result.score], 120);
  const focus = buildFocusAreas(result);

  return (
    <main>
      <PageHeader eyebrow="Assessment" title="Insights" note="Simple marks intelligence: weak chapters, speed issues, guesses, repeated mistakes, and trend." />
      <section className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm font-bold text-ink/50">Score</p><p className="text-3xl font-black">{result.score}/{result.total}</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Accuracy</p><p className="text-3xl font-black">{result.accuracy}%</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Projection</p><p className="text-3xl font-black">{projection.projected}</p></Card>
      </section>
      <Card className="mt-4">
        <SectionTitle>Subject Breakdown</SectionTitle>
        <div className="space-y-3">
          {result.subjectBreakdown.map((subject) => (
            <div key={subject.subject}>
              <div className="mb-1 flex justify-between text-sm font-black"><span>{subject.subject}</span><span>{subject.correct}/{subject.total}</span></div>
              <div className="h-3 rounded-full bg-field"><div className="h-3 rounded-full bg-leaf" style={{ width: `${subject.accuracy}%` }} /></div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="mt-4">
        <SectionTitle>Focus Areas</SectionTitle>
        <div className="space-y-2">
          {focus.map((item) => <p key={item} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{item}</p>)}
        </div>
      </Card>
      <Card className="mt-4 bg-millet/30">
        <p className="font-black text-ink">You are losing marks mostly in simple algebra mistakes.</p>
        <p className="mt-1 font-bold text-ink/70">Fix this before trying hard questions. Easy marks are first priority.</p>
      </Card>
    </main>
  );
}
