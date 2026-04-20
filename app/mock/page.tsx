import { MockTest } from "@/components/mock-test";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { deployQuestions } from "@/lib/deploy-data";
import { filterQuestions } from "@/lib/questions";
import { getPolycetTopicQueue } from "@/lib/topic-priorities";

export default function MockPage() {
  const importedQuestions = deployQuestions.slice(0, 20);
  const fallbackQuestions = [...filterQuestions({ exam: "POLYCET", limit: 6 }), ...filterQuestions({ exam: "TGRJC", group: "MPC", limit: 2 })];
  const demoQuestions = importedQuestions.length >= 8 ? importedQuestions : fallbackQuestions;
  const priorityTopics = getPolycetTopicQueue().slice(0, 6);

  return (
    <main>
      <PageHeader eyebrow="Mock test" title="Strict Test" note="Using imported POLYCET PDF questions. Answer all questions first, then review mistakes in red." />
      <Card className="mb-4">
        <SectionTitle>Exam Modes</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {["POLYCET PDF Import", "TSRJC/TGRJC MPC", "Topic Test", "Quick 20"].map((mode) => <span key={mode} className="rounded-2xl bg-field p-3 text-center font-black text-ink/75">{mode}</span>)}
        </div>
      </Card>
      <Card className="mb-4">
        <SectionTitle>Question Source</SectionTitle>
        <p className="rounded-2xl bg-white p-3 font-bold text-ink/75">
          {importedQuestions.length >= 8 ? `${importedQuestions.length} imported POLYCET questions loaded from TS_POLYCET_2025_Q&A.pdf.` : "Using fallback seed questions because imported PDF questions are not ready."}
        </p>
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
