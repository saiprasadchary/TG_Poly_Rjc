import { ActionButton, Card, PageHeader, SectionTitle } from "@/components/ui";
import { tgrjcGroups } from "@/lib/exam-facts";
import type { TgrjcGroup } from "@/lib/types";

export function GroupPage({ group }: { group: TgrjcGroup }) {
  const details = tgrjcGroups[group];
  const isMpc = group === "MPC";

  return (
    <main>
      <PageHeader
        eyebrow="TSRJC/TGRJC group"
        title={isMpc ? "MPC Mentor" : `${group} not active`}
        note={isMpc ? "Only MPC is active for this prep system: English, Mathematics, Physical Science." : "This app is currently focused on TSRJC/TGRJC MPC and POLYCET only."}
      />
      <Card>
        <SectionTitle>{isMpc ? "MPC Subjects" : "Focus Changed"}</SectionTitle>
        <div className="grid gap-3">
          {(isMpc ? details.subjects : tgrjcGroups.MPC.subjects).map((subject) => (
            <div key={subject.name} className="rounded-2xl bg-white p-3">
              <div className="flex justify-between font-black"><span>{subject.name}</span><span>{subject.marks} marks</span></div>
              <p className="mt-1 text-sm font-bold text-ink/60">Plan weight: {subject.weight}x</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="mt-4 bg-millet/25">
        <p className="font-black text-ink">MPC rule: English steady, Mathematics sharp, Physical Science formula-ready.</p>
        <p className="mt-1 font-bold text-ink/70">Don&apos;t mix groups. Practice only what gives marks in your target exam.</p>
      </Card>
      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <ActionButton href="/mock">Start MPC Mock</ActionButton>
        <ActionButton href="/planner" tone="light">Build Plan</ActionButton>
      </section>
    </main>
  );
}
