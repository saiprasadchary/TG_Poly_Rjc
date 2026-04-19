import { ActionButton, Card, PageHeader, SectionTitle } from "@/components/ui";
import { examFacts, tgrjcGroups } from "@/lib/exam-facts";

export default function TgrjcPage() {
  const group = tgrjcGroups.MPC;
  return (
    <main>
      <PageHeader eyebrow="Exam guide" title="TSRJC/TGRJC MPC Prep" note="This app now prepares only MPC: English, Mathematics, Physical Science. No BPC/MEC distraction." />
      <Card>
        <SectionTitle>Exam Pattern</SectionTitle>
        <div className="grid gap-2">
          {examFacts.TGRJC.facts.map((fact) => <p key={fact} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{fact}</p>)}
        </div>
      </Card>
      <Card className="mt-4">
        <SectionTitle>MPC Subjects</SectionTitle>
        <div className="grid gap-2">
          {group.subjects.map((subject) => <p key={subject.name} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{subject.name}: {subject.marks} marks</p>)}
        </div>
      </Card>
      <section className="mt-4 grid gap-3">
        <ActionButton href="/exam/tgrjc/mpc">Open MPC Plan and Papers</ActionButton>
      </section>
    </main>
  );
}
