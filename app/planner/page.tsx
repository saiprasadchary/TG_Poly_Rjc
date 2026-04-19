import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { generateStudyPlan } from "@/lib/planner";

export default function PlannerPage() {
  const plan = generateStudyPlan({ exam: "POLYCET", days: 7 });
  const tgrjcPlan = generateStudyPlan({ exam: "TGRJC", group: "MPC", days: 7 });

  return (
    <main>
      <PageHeader eyebrow="Study planner" title="Maths-first daily plan" note="POLYCET plan follows your priority list. TSRJC/TGRJC plan is MPC only." />
      <Card className="!bg-leaf !text-white">
        <p className="text-sm font-bold uppercase tracking-wide text-white/70">Recommended today</p>
        <h2 className="mt-1 text-2xl font-black">Start with POLYCET Maths. Finish Linear Equations before touching random topics.</h2>
        <p className="mt-2 text-white/80">Simple rule: first high-weight topics, then mistakes, then mock.</p>
      </Card>
      <section className="mt-4 space-y-3">
        <SectionTitle>POLYCET 7-Day Plan</SectionTitle>
        {plan.map((day) => (
          <Card key={day.day}>
            <div className="flex justify-between gap-3"><h2 className="text-lg font-black">Day {day.day}: {day.title}</h2><span className="font-black text-leaf">{day.targetQuestions} Qs</span></div>
            <ul className="mt-3 space-y-2">
              {day.tasks.map((task) => <li key={task} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{task}</li>)}
            </ul>
          </Card>
        ))}
      </section>
      <section className="mt-4 space-y-3">
        <SectionTitle>TSRJC/TGRJC MPC Sample</SectionTitle>
        {tgrjcPlan.slice(0, 4).map((day) => <p key={day.day} className="rounded-2xl bg-white p-3 font-bold text-ink/75">Day {day.day}: {day.tasks[1]}</p>)}
      </section>
    </main>
  );
}
