import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PDFParse } from "pdf-parse";

process.env.DATABASE_URL ??= "file:./dev.db";

const prisma = new PrismaClient();

const localPdfs = [
  {
    id: "local_tsrjc_recent_papers_bundle_actual",
    file: "/Users/saiprasadkomuroju/Downloads/ChromeDownLoadsSPK/TSRJC_recent_papers_bundle_actual.pdf",
    year: 2025,
    assetType: "paper_bundle_with_preliminary_key",
    title: "TSRJC/TGRJC MPC recent papers bundle with 2025 preliminary key",
    verificationStatus: "local_key_only_questions_need_ocr"
  },
  {
    id: "local_tsrjc_math_model_2020",
    file: "/Users/saiprasadkomuroju/Downloads/ChromeDownLoadsSPK/TSRJC Mathematics (English & Telugu Medium) Model 2020 Question paper.pdf",
    year: 2020,
    assetType: "model_papers",
    title: "TSRJC Mathematics model 2020 question paper PDF",
    verificationStatus: "ocr_required"
  }
];

type KeyRow = {
  question: number;
  bookletA: string;
  bookletB: string;
  bookletC: string;
  bookletD: string;
};

async function extractPdfText(file: string) {
  const parser = new PDFParse({ data: readFileSync(file) });
  const result = await parser.getText();
  await parser.destroy();
  return { text: result.text.replace(/\s+/g, " ").trim(), pages: result.total ?? result.pages?.length ?? 0 };
}

async function ensureTsrjcMpc() {
  const exam = await prisma.exam.upsert({
    where: { code: "TGRJC" },
    update: {},
    create: {
      code: "TGRJC",
      name: "TSRJC/TGRJC MPC",
      description: "TSRJC/TGRJC MPC objective exam covering English, Mathematics, and Physical Science.",
      durationMin: 150,
      totalMarks: 150,
      totalQuestions: 150
    }
  });

  const group = await prisma.examGroup.upsert({
    where: { examId_code: { examId: exam.id, code: "MPC" } },
    update: { name: "MPC" },
    create: { examId: exam.id, code: "MPC", name: "MPC" }
  });

  for (const subject of [
    { name: "English", marks: 50, weight: 2 },
    { name: "Mathematics", marks: 50, weight: 3 },
    { name: "Physical Science", marks: 50, weight: 2 }
  ]) {
    await prisma.subject.upsert({
      where: { examId_groupId_name: { examId: exam.id, groupId: group.id, name: subject.name } },
      update: subject,
      create: { examId: exam.id, groupId: group.id, ...subject }
    });
  }

  return { exam, group };
}

function parsePreliminaryKey(text: string): KeyRow[] {
  const tableStart = text.indexOf("Set Q Booklet -A");
  const tableEnd = text.indexOf("TGRJC CET 2025 PRELIMINARY KEY");
  if (tableStart === -1 || tableEnd === -1 || tableEnd <= tableStart) return [];

  const table = text.slice(tableStart, tableEnd).replace(/Set Q Booklet -A Booklet -B Booklet -C Booklet -D/g, " ");
  const tokens = table.match(/add score|1 or 3|1 or 4|[A-D]|\d+/gi) ?? [];
  const rows: KeyRow[] = [];

  for (let index = 0; index <= tokens.length - 5; index += 5) {
    const question = Number(tokens[index]);
    if (!Number.isInteger(question) || question < 1 || question > 150) continue;
    rows.push({
      question,
      bookletA: tokens[index + 1],
      bookletB: tokens[index + 2],
      bookletC: tokens[index + 3],
      bookletD: tokens[index + 4]
    });
  }

  const unique = new Map<number, KeyRow>();
  for (const row of rows) unique.set(row.question, row);
  return Array.from(unique.values()).sort((a, b) => a.question - b.question);
}

async function registerPdfSource(pdf: typeof localPdfs[number], pages: number, chars: number, keyRows: KeyRow[]) {
  await prisma.sourceRecord.upsert({
    where: { id: pdf.id },
    update: {
      exam: "TGRJC",
      group: "MPC",
      assetType: pdf.assetType,
      title: pdf.title,
      url: `file://${pdf.file}`,
      sourceType: "local_pdf",
      tier: "local_import",
      yearsClaimed: String(pdf.year),
      verificationStatus: pdf.verificationStatus,
      metadata: JSON.stringify({ file: pdf.file, pages, chars, keyRows: keyRows.length })
    },
    create: {
      id: pdf.id,
      exam: "TGRJC",
      group: "MPC",
      assetType: pdf.assetType,
      title: pdf.title,
      url: `file://${pdf.file}`,
      sourceType: "local_pdf",
      tier: "local_import",
      yearsClaimed: String(pdf.year),
      verificationStatus: pdf.verificationStatus,
      metadata: JSON.stringify({ file: pdf.file, pages, chars, keyRows: keyRows.length })
    }
  });
}

async function main() {
  mkdirSync(join(process.cwd(), "data/extracted/pdf-text"), { recursive: true });
  mkdirSync(join(process.cwd(), "data/extracted/answer-keys"), { recursive: true });
  const { exam, group } = await ensureTsrjcMpc();

  let totalKeyRows = 0;
  for (const pdf of localPdfs) {
    const { text, pages } = await extractPdfText(pdf.file);
    const textOutput = join(process.cwd(), "data/extracted/pdf-text", `${pdf.id}.txt`);
    writeFileSync(textOutput, `${text}\n`);

    const keyRows = parsePreliminaryKey(text);
    if (keyRows.length) {
      const keyOutput = join(process.cwd(), "data/extracted/answer-keys", `${pdf.id}.json`);
      writeFileSync(keyOutput, `${JSON.stringify({ sourceId: pdf.id, exam: "TGRJC", group: "MPC", year: pdf.year, status: pdf.verificationStatus, rows: keyRows }, null, 2)}\n`);
      totalKeyRows += keyRows.length;
    }

    await registerPdfSource(pdf, pages, text.length, keyRows);
    await prisma.paper.upsert({
      where: { id: pdf.id },
      update: {
        sourceRecordId: pdf.id,
        year: pdf.year,
        title: pdf.title,
        sourceType: "local_pdf",
        sourceUrl: `file://${pdf.file}`
      },
      create: {
        id: pdf.id,
        examId: exam.id,
        groupId: group.id,
        sourceRecordId: pdf.id,
        year: pdf.year,
        title: pdf.title,
        sourceType: "local_pdf",
        sourceUrl: `file://${pdf.file}`
      }
    });
  }

  console.log(`Registered ${localPdfs.length} local TSRJC/TGRJC MPC PDFs and extracted ${totalKeyRows} preliminary key rows.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
