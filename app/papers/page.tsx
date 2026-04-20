import { QuestionCard } from "@/components/question-card";
import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { deployPapers, deployQuestions } from "@/lib/deploy-data";

function verificationLabel(status?: string | null) {
  if (!status) return "source linked";
  if (status === "official_source") return "official source";
  if (status === "verified_official_key") return "verified key";
  if (status.includes("mirror")) return "mirror fallback";
  if (status.includes("ocr")) return "OCR required";
  if (status.includes("key_only")) return "key ready, OCR needed";
  if (status.includes("local")) return "local source imported";
  if (status.includes("community")) return "community gap-fill";
  return status.replace(/_/g, " ");
}

export default function PapersPage() {
  const papers = deployPapers.filter((paper) => paper.exam === "POLYCET" || (paper.exam === "TGRJC" && paper.group === "MPC"));
  const officialCount = papers.filter((paper) => paper.sourceType === "official").length;
  const sourceBackedCount = papers.filter((paper) => paper.sourceRecordId).length;

  return (
    <main>
      <PageHeader eyebrow="Library" title="POLYCET and MPC Papers" note="Paper availability is source-backed. Imported PDFs are bundled for mobile access; official sources are preferred where available." />
      <section className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm font-bold text-ink/50">Paper records</p><p className="text-3xl font-black">{papers.length}</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Source-backed</p><p className="text-3xl font-black">{sourceBackedCount}</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Official-linked</p><p className="text-3xl font-black">{officialCount}</p></Card>
      </section>
      <Card className="mt-4">
        <SectionTitle>Active Tracks</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {["POLYCET", "TSRJC/TGRJC MPC"].map((tab) => <span key={tab} className="rounded-2xl bg-field p-3 text-center font-black text-ink/75">{tab}</span>)}
        </div>
      </Card>
      <section className="mt-4 grid gap-3">
        {papers.map((paper) => {
          const label = paper.exam === "TGRJC" ? "TSRJC/TGRJC MPC" : "POLYCET";
          return (
            <Card key={paper.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-ink">{paper.title.replace("TGRJC", "TSRJC/TGRJC")}</h2>
                  <p className="mt-1 font-bold text-ink/60">
                    {label} {paper.group ? `· ${paper.group}` : ""} · {paper.questionCount ? `${paper.questionCount} imported questions` : "source indexed, questions pending extraction"}
                  </p>
                  {paper.subjects.length ? <p className="mt-1 text-sm font-bold text-ink/50">{paper.subjects.join(", ")}</p> : null}
                </div>
                <div className="rounded-2xl bg-millet/30 px-3 py-2 text-sm font-black">{paper.year}</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <span className={`rounded-2xl p-3 text-center font-black text-white ${paper.questionCount ? "bg-leaf" : "bg-ink/40"}`}>{paper.questionCount ? "Practice Ready" : "Extraction Pending"}</span>
                <span className={`rounded-2xl p-3 text-center font-black text-white ${paper.verificationStatus === "official_source" ? "bg-leaf" : "bg-clay"}`}>{verificationLabel(paper.verificationStatus)}</span>
              </div>
              {paper.sourceUrl ? (
                <a href={paper.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 block rounded-2xl bg-white p-3 text-sm font-bold text-ink/70">
                  Source: {paper.sourceTitle ?? paper.sourceUrl} · {paper.sourceType}
                </a>
              ) : (
                <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-bold text-ink/60">Source: not linked yet</p>
              )}
            </Card>
          );
        })}
      </section>
      <section className="mt-4 space-y-3">
        <SectionTitle>Imported Sample Questions</SectionTitle>
        <p className="text-sm font-bold text-ink/60">These questions are imported from the bundled POLYCET 2025 Q&A PDF.</p>
        {deployQuestions.slice(0, 3).map((question) => <QuestionCard key={question.question_text} question={question} showAnswer />)}
      </section>
    </main>
  );
}
