import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= "file:./dev.db";

const prisma = new PrismaClient();

function yearsForSource(source: { yearsClaimed: string | null; title: string }) {
  const claimed = source.yearsClaimed?.split(",").map((year) => year.trim()).filter(Boolean) ?? [];
  const fromTitle = Array.from(source.title.matchAll(/20\d{2}/g)).map((match) => match[0]);
  return Array.from(new Set([...claimed, ...fromTitle])).map(Number).filter((year) => Number.isInteger(year));
}

async function main() {
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

  let createdOrUpdated = 0;

  for (const source of sources) {
    const examCode = source.exam === "TGRJC" ? "TGRJC" : source.exam;
    const exam = examByCode.get(examCode);
    if (!exam) continue;
    const group = source.group ? exam.groups.find((item) => item.code === source.group) : null;
    const years = yearsForSource(source);

    for (const year of years) {
      const id = `source-${source.id}-${year}`;
      await prisma.paper.upsert({
        where: { id },
        update: {
          sourceRecordId: source.id,
          sourceType: source.sourceType,
          sourceUrl: source.url,
          title: `${source.exam === "TGRJC" ? "TSRJC/TGRJC MPC" : "POLYCET"} ${year} ${source.assetType.replace(/_/g, " ")}`
        },
        create: {
          id,
          examId: exam.id,
          groupId: group?.id ?? null,
          sourceRecordId: source.id,
          year,
          title: `${source.exam === "TGRJC" ? "TSRJC/TGRJC MPC" : "POLYCET"} ${year} ${source.assetType.replace(/_/g, " ")}`,
          sourceType: source.sourceType,
          sourceUrl: source.url
        }
      });
      createdOrUpdated += 1;
    }
  }

  console.log(`Synced ${createdOrUpdated} source-backed paper shells.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
