import { MockTest } from "@/components/mock-test";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { filterQuestions } from "@/lib/questions";
import { getPolycetTopicQueue } from "@/lib/topic-priorities";

export default function MockPage() {
  const polycetQuestions = filterQuestions({ exam: "POLYCET", limit: 6 });
  const mpcQuestions = filterQuestions({ exam: "TGRJC", group: "MPC", limit: 2 });
  const demoQuestions = [...polycetQuestions, ...mpcQuestions];
  const priorityTopics = getPolycetTopicQueue().slice(0, 6);

  return (
    <main>
      <PageHeader eyebrow="Mock test" title="Strict Test" note="Focus tracks: POLYCET and TSRJC/TGRJC MPC. Answer all questions first, then review mistakes in red." />
      <Card className="mb-4">
        <SectionTitle>Exam Modes</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {["POLYCET Maths-first", "TSRJC/TGRJC MPC", "Topic Test", "Quick 20"].map((mode) => <span key={mode} className="rounded-2xl bg-field p-3 text-center font-black text-ink/75">{mode}</span>)}
        </div>
      </Card>
      <Card className="mb-4">
        <SectionTitle>Next Priority Topics</SectionTitle>
        <div className="grid gap-2">
          {priorityTopics.map((item) => <p key={`${item.subject}-${item.topic}`} className="rounded-2xl bg-white p-3 font-bold text-ink/75">{item.subject}: {item.topic}</p>)}
        </div>
      </Card>
      <MockTest questions={demoQuestions} />
    </main>
  );
}
