import { ActionButton, Card, PageHeader, SectionTitle, StatPill } from "@/components/ui";
import { buildFocusAreas, projectScore } from "@/lib/assessment";
import { evaluateMock } from "@/lib/assessment";
import { filterQuestions } from "@/lib/questions";
import { getPolycetTopicQueue, primaryTracks } from "@/lib/topic-priorities";

export default function HomePage() {
  const sample = filterQuestions({ exam: "POLYCET", limit: 5 });
  const result = evaluateMock(
    sample.map((question, index) => ({
      question,
      selectedOption: index < 3 ? question.correct_option : "A",
      isGuessed: index === 2,
      isFlagged: index === 4,
      timeSpentSec: [75, 140, 65, 190, 250][index]
    }))
  );
  const projection = projectScore([42, 51, 55, 60, result.score], 120);
  const focusAreas = buildFocusAreas(result);
  const nextTopics = getPolycetTopicQueue().slice(0, 4);

  return (
    <main>
      <PageHeader eyebrow="Mana Mentor" title="POLYCET + TSRJC MPC prep, kept simple." note="Maths first. Strict practice. Clear mistake review. No extra distractions." />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatPill label="POLYCET focus" value="Maths first" />
        <StatPill label="TSRJC/TGRJC" value="MPC only" />
        <StatPill label="Streak" value="4 days" />
      </section>

      <Card className="mt-4 !bg-leaf !text-white">
        <p className="text-sm font-bold uppercase tracking-wide text-white/70">Today target</p>
        <h2 className="mt-1 text-2xl font-black">30 Maths questions: Linear Equations and Quadratic Equations.</h2>
        <p className="mt-3 text-white/80">After that, do 15 Electricity questions. Don&apos;t jump randomly. Marks first, ego later.</p>
      </Card>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        {primaryTracks.map((track) => (
          <Card key={track.label}>
            <h2 className="text-xl font-black text-ink">{track.label}</h2>
            <p className="mt-1 font-bold text-ink/65">{track.note}</p>
            <div className="mt-3"><ActionButton href={track.href}>Open Track</ActionButton></div>
          </Card>
        ))}
      </section>

      <Card className="mt-4">
        <SectionTitle>Next POLYCET Topics</SectionTitle>
        <div className="grid gap-2">
          {nextTopics.map((item, index) => (
            <p key={`${item.subject}-${item.topic}`} className="rounded-2xl bg-white p-3 font-bold text-ink/75">
              {index + 1}. {item.subject}: {item.topic}
            </p>
          ))}
        </div>
      </Card>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionTitle>Last Mock</SectionTitle>
          <p className="text-4xl font-black text-ink">{result.score}/{result.total}</p>
          <p className="mt-1 font-bold text-ink/60">Accuracy {result.accuracy}%</p>
          <p className="mt-3 rounded-2xl bg-field p-3 font-bold text-ink/75">Projected score: {projection.projected}. {projection.message}</p>
        </Card>
        <Card>
          <SectionTitle>Weakest Areas</SectionTitle>
          <div className="space-y-2">
            {focusAreas.length ? focusAreas.map((area) => <p key={area} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{area}</p>) : <p>No weak area yet. Take one mock.</p>}
          </div>
        </Card>
      </div>

      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <ActionButton href="/mock">Start Strict Test</ActionButton>
        <ActionButton href="/mistakes" tone="light">Retry Mistakes</ActionButton>
        <ActionButton href="/planner" tone="light">Today&apos;s Plan</ActionButton>
        <ActionButton href="/ask" tone="clay">Ask Doubt</ActionButton>
      </section>
    </main>
  );
}
