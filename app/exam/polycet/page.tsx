import { ActionButton, Card, PageHeader, SectionTitle } from "@/components/ui";
import { examFacts } from "@/lib/exam-facts";
import { polycetPriorityTopics } from "@/lib/topic-priorities";

const subjectNotes = {
  Maths: "Highest priority. These topics create the biggest score movement.",
  Physics: "Second priority. Formula clarity and concept traps matter.",
  Chemistry: "Third priority. Secure direct theory and simple concept marks."
} as const;

export default function PolycetPage() {
  return (
    <main>
      <PageHeader eyebrow="Exam guide" title="POLYCET Prep" note="Priority order is fixed: Maths first, Physics second, Chemistry third. Practice should follow marks and usefulness, not mood." />
      <Card>
        <SectionTitle>Exam Pattern</SectionTitle>
        <div className="grid gap-2">
          {examFacts.POLYCET.facts.map((fact) => <p key={fact} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{fact}</p>)}
        </div>
      </Card>
      <Card className="mt-4">
        <SectionTitle>Subject Weight</SectionTitle>
        <div className="space-y-3">
          {examFacts.POLYCET.subjects.map((subject) => (
            <div key={subject.name}>
              <div className="mb-1 flex justify-between text-sm font-black"><span>{subject.name}</span><span>{subject.marks} questions</span></div>
              <div className="h-3 rounded-full bg-field"><div className="h-3 rounded-full bg-leaf" style={{ width: `${subject.marks}%` }} /></div>
              <p className="mt-1 text-sm font-bold text-ink/60">{subjectNotes[subject.name as keyof typeof subjectNotes]}</p>
            </div>
          ))}
        </div>
      </Card>
      <section className="mt-4 space-y-3">
        <SectionTitle>Topic Priority</SectionTitle>
        {Object.entries(polycetPriorityTopics).map(([subject, topics]) => (
          <Card key={subject} className={subject === "Maths" ? "border-leaf/40 bg-field" : undefined}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black text-ink">{subject}</h2>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-leaf">{subject === "Maths" ? "Do first" : subject === "Physics" ? "Do second" : "Do third"}</span>
            </div>
            <div className="mt-3 grid gap-2">
              {topics.map((topic, index) => (
                <p key={topic} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{index + 1}. {topic}</p>
              ))}
            </div>
          </Card>
        ))}
      </section>
      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <ActionButton href="/mock">Start POLYCET Mock</ActionButton>
        <ActionButton href="/planner" tone="light">Build Maths-First Plan</ActionButton>
      </section>
    </main>
  );
}
