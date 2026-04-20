import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { toQuestion } from "../lib/db-questions";

process.env.DATABASE_URL ??= "file:./dev.db";
const prisma = new PrismaClient();

const publicUrlBySourceId: Record<string, string> = {
  local_polycet_2024_set_a_collegedunia_pdf: "/sources/polycet/ts-polycet-2024-set-a-with-answer-key.pdf",
  local_polycet_2025_collegedunia_pdf: "/sources/polycet/ts-polycet-2025-collegedunia-with-answer-key.pdf",
  local_polycet_2023_set_b_pdf: "/sources/polycet/ts-polycet-2023-set-b.pdf",
  local_polycet_2023_set_c_pdf: "/sources/polycet/ts-polycet-2023-set-c.pdf",
  local_polycet_2024_question_pdf: "/sources/polycet/ts-polycet-2024-question-paper.pdf",
  local_polycet_2025_qa_pdf: "/sources/polycet/ts-polycet-2025-qa.pdf",
  local_tsrjc_recent_papers_bundle_actual: "/sources/tsrjc/tsrjc-recent-papers-bundle-actual.pdf",
  local_tsrjc_math_model_2020: "/sources/tsrjc/tsrjc-mathematics-model-2020.pdf"
};

async function main() {
  mkdirSync(join(process.cwd(), "data/deploy"), { recursive: true });

  const sourceRecords = await prisma.sourceRecord.findMany({ orderBy: [{ exam: "asc" }, { assetType: "asc" }, { title: "asc" }] });
  const deploySources = sourceRecords.map((source) => ({
    id: source.id,
    exam: source.exam,
    group: source.group,
    assetType: source.assetType,
    title: source.title,
    url: publicUrlBySourceId[source.id] ?? source.url,
    sourceType: source.sourceType,
    tier: source.tier,
    yearsClaimed: source.yearsClaimed,
    verificationStatus: source.verificationStatus,
    metadata: source.metadata
  }));

  const dbQuestions = await prisma.question.findMany({
    where: { paperId: "local_polycet_2025_qa_pdf" },
    include: { exam: true, group: true, subject: true, options: true, answerKey: true, topicTags: true },
    orderBy: [{ subject: { name: "asc" } }, { id: "asc" }]
  });
  const questions = dbQuestions.map(toQuestion).filter(Boolean);

  const papers = await prisma.paper.findMany({
    where: {
      OR: [
        { exam: { code: "POLYCET" } },
        { exam: { code: "TGRJC" }, group: { code: "MPC" } }
      ]
    },
    include: { exam: true, group: true, sourceRecord: true, questions: { include: { subject: true } } },
    orderBy: [{ year: "desc" }, { title: "asc" }]
  });

  const deployPapers = papers.map((paper) => ({
    id: paper.id,
    exam: paper.exam.code,
    group: paper.group?.code ?? null,
    year: paper.year,
    title: paper.title,
    sourceRecordId: paper.sourceRecordId,
    sourceType: paper.sourceType,
    sourceUrl: paper.sourceRecordId ? publicUrlBySourceId[paper.sourceRecordId] ?? paper.sourceUrl : paper.sourceUrl,
    sourceTitle: paper.sourceRecord?.title ?? null,
    verificationStatus: paper.sourceRecord?.verificationStatus ?? null,
    questionCount: paper.questions.length,
    subjects: Array.from(new Set(paper.questions.map((question) => question.subject.name)))
  }));

  writeFileSync(join(process.cwd(), "data/deploy/source-records.json"), `${JSON.stringify(deploySources, null, 2)}\n`);
  writeFileSync(join(process.cwd(), "data/deploy/imported-questions.json"), `${JSON.stringify(questions, null, 2)}\n`);
  writeFileSync(join(process.cwd(), "data/deploy/papers.json"), `${JSON.stringify(deployPapers, null, 2)}\n`);
  console.log(`Exported ${deploySources.length} sources, ${questions.length} questions, and ${deployPapers.length} papers for deployment.`);
}

main().finally(async () => prisma.$disconnect());
