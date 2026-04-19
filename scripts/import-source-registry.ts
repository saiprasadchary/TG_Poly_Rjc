import { PrismaClient } from "@prisma/client";
import { loadSourceRegistry, bestSourceFor } from "../lib/source-registry";

process.env.DATABASE_URL ??= "file:./dev.db";

const prisma = new PrismaClient();

async function upsertSources() {
  const records = loadSourceRegistry();
  for (const record of records) {
    await prisma.sourceRecord.upsert({
      where: { id: record.id },
      update: {
        exam: record.exam,
        group: record.group,
        assetType: record.assetType,
        title: record.title,
        url: record.url,
        sourceType: record.sourceType,
        tier: record.tier,
        yearsClaimed: record.yearsClaimed.join(","),
        verificationStatus: record.verificationStatus,
        metadata: JSON.stringify(record.metadata)
      },
      create: {
        id: record.id,
        exam: record.exam,
        group: record.group,
        assetType: record.assetType,
        title: record.title,
        url: record.url,
        sourceType: record.sourceType,
        tier: record.tier,
        yearsClaimed: record.yearsClaimed.join(","),
        verificationStatus: record.verificationStatus,
        metadata: JSON.stringify(record.metadata)
      }
    });
  }
  return records.length;
}

async function linkExistingContent() {
  const papers = await prisma.paper.findMany({ include: { exam: true, group: true } });
  for (const paper of papers) {
    const source = bestSourceFor({
      exam: paper.exam.code,
      group: paper.group?.code ?? null,
      year: paper.year,
      assetTypes: ["previous_papers", "paper_with_key", "portal"]
    });
    if (!source) continue;
    await prisma.paper.update({
      where: { id: paper.id },
      data: { sourceRecordId: source.id, sourceType: source.sourceType, sourceUrl: source.url }
    });
    await prisma.question.updateMany({
      where: { paperId: paper.id },
      data: { sourceRecordId: source.id, sourceType: source.sourceType, sourceUrl: source.url }
    });
  }

  const answerKeys = await prisma.answerKey.findMany({ include: { question: { include: { exam: true, group: true } } } });
  for (const answerKey of answerKeys) {
    const source = bestSourceFor({
      exam: answerKey.question.exam.code,
      group: answerKey.question.group?.code ?? null,
      year: answerKey.question.year ?? undefined,
      assetTypes: ["answer_keys", "paper_with_key", "portal"]
    });
    const verificationStatus = source?.verificationStatus === "verified_official_key" ? "verified_official_key" : "unverified_registry_match";
    await prisma.answerKey.update({
      where: { id: answerKey.id },
      data: { sourceRecordId: source?.id ?? null, verificationStatus }
    });
  }

  const topicSource = bestSourceFor({ exam: "SSC_TOPIC_MAPPING", group: null, assetTypes: ["textbook_catalog", "textbook_list", "textbook_mirror"] });
  if (topicSource) {
    await prisma.topicTag.updateMany({ data: { sourceRecordId: topicSource.id } });
  }
}

async function syncPaperShells() {
  const exams = await prisma.exam.findMany({ include: { groups: true } });
  const examByCode = new Map(exams.map((exam) => [exam.code, exam]));
  const sources = await prisma.sourceRecord.findMany({
    where: {
      OR: [
        { exam: "POLYCET", assetType: { in: ["previous_papers", "paper_with_key"] } },
        { exam: "TGRJC", group: "MPC", assetType: { in: ["previous_papers", "paper_with_key", "model_papers"] } }
      ]
    }
  });

  for (const source of sources) {
    const exam = examByCode.get(source.exam);
    if (!exam) continue;
    const group = source.group ? exam.groups.find((item) => item.code === source.group) : null;
    const years = Array.from(new Set([
      ...(source.yearsClaimed?.split(",").map((year) => year.trim()).filter(Boolean) ?? []),
      ...Array.from(source.title.matchAll(/20\d{2}/g)).map((match) => match[0])
    ])).map(Number).filter((year) => Number.isInteger(year));

    for (const year of years) {
      const id = `source-${source.id}-${year}`;
      const examLabel = source.exam === "TGRJC" ? "TSRJC/TGRJC MPC" : "POLYCET";
      await prisma.paper.upsert({
        where: { id },
        update: {
          sourceRecordId: source.id,
          sourceType: source.sourceType,
          sourceUrl: source.url,
          title: `${examLabel} ${year} ${source.assetType.replace(/_/g, " ")}`
        },
        create: {
          id,
          examId: exam.id,
          groupId: group?.id ?? null,
          sourceRecordId: source.id,
          year,
          title: `${examLabel} ${year} ${source.assetType.replace(/_/g, " ")}`,
          sourceType: source.sourceType,
          sourceUrl: source.url
        }
      });
    }
  }
}

async function main() {
  const count = await upsertSources();
  await linkExistingContent();
  await syncPaperShells();
  console.log(`Imported ${count} source registry records, linked content, and synced source-backed paper shells.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
