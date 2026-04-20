import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { PDFParse } from "pdf-parse";
import { polycetPriorityTopics } from "../lib/topic-priorities";

process.env.DATABASE_URL ??= "file:./dev.db";

const prisma = new PrismaClient();

const localPdfs = [
  {
    id: "local_polycet_2024_set_a_collegedunia_pdf",
    file: "TS POLYCET 2024 Question Paper_ Download Set A Question Paper with Answer Key PDF.pdf",
    year: 2024,
    set: "A",
    assetType: "paper_with_key",
    title: "TS POLYCET 2024 Set A question paper with answer key PDF",
    parseStructured: false
  },
  {
    id: "local_polycet_2025_collegedunia_pdf",
    file: "TS POLYCET 2025 Question Paper (Available) _Download Solution PDF with Answer Key.pdf",
    year: 2025,
    set: "Memory/Shift",
    assetType: "paper_with_key",
    title: "TS POLYCET 2025 question paper with answer key PDF",
    parseStructured: false
  },
  {
    id: "local_polycet_2023_set_b_pdf",
    file: "TS_POLYCET_2023_Question_Paper_Set_B_079f187adceee47e7cb95d4b386153d1.pdf",
    year: 2023,
    set: "B",
    assetType: "previous_papers",
    title: "TS POLYCET 2023 Set B question paper PDF",
    parseStructured: false,
    needsOcr: true
  },
  {
    id: "local_polycet_2023_set_c_pdf",
    file: "TS_POLYCET_2023_Question_Paper_Set_C_5b9bf33124912e544a0a54940469f584.pdf",
    year: 2023,
    set: "C",
    assetType: "previous_papers",
    title: "TS POLYCET 2023 Set C question paper PDF",
    parseStructured: false,
    needsOcr: true
  },
  {
    id: "local_polycet_2024_question_pdf",
    file: "TS_Polycet_2024_Q.pdf",
    year: 2024,
    set: "Question paper",
    assetType: "previous_papers",
    title: "TS POLYCET 2024 question paper PDF",
    parseStructured: false,
    needsOcr: true
  },
  {
    id: "local_polycet_2025_qa_pdf",
    file: "TS_POLYCET_2025_Q&A.pdf",
    year: 2025,
    set: "Q&A",
    assetType: "paper_with_key",
    title: "TS POLYCET 2025 Q&A PDF with solutions",
    parseStructured: true
  }
];

type ParsedQuestion = {
  number: number;
  subject: "Maths" | "Physics" | "Chemistry";
  topic: string;
  questionText: string;
  options: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
};

function slug(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function subjectForQuestion(number: number): "Maths" | "Physics" | "Chemistry" {
  if (number <= 60) return "Maths";
  if (number <= 90) return "Physics";
  return "Chemistry";
}

function classifyTopic(subject: "Maths" | "Physics" | "Chemistry", text: string) {
  const haystack = text.toLowerCase();
  const topics = polycetPriorityTopics[subject];
  const direct = topics.find((topic) => haystack.includes(topic.toLowerCase()));
  if (direct) return direct;

  const keywordMap: Record<string, string[]> = {
    "Linear Equations": ["linear", "pair of", "system of equations", "equations"],
    "Quadratic Equations": ["quadratic", "roots", "alpha", "beta"],
    "Trigonometry": ["sin", "cos", "tan", "trigonometric"],
    "Applications of Trigonometry": ["height", "distance", "angle of elevation", "angle of depression"],
    "Arithmetic Progression": ["a.p", "arithmetic progression", "terms"],
    Polynomials: ["polynomial", "zeroes"],
    Probability: ["probability", "dice", "coin"],
    Statistics: ["mean", "median", "mode", "frequency"],
    Circles: ["circle", "radius", "diameter", "tangent"],
    "Similar Triangles": ["similar", "triangle"],
    Sets: ["set", "venn"],
    Logarithm: ["log"],
    Electricity: ["current", "resistance", "ohm", "voltage", "potential difference"],
    "Heating Effect of Current": ["heating", "joule", "heat"],
    Magnetism: ["magnet", "magnetic"],
    "Reflection of Light": ["reflection", "mirror"],
    Refraction: ["refraction", "refractive", "lens", "prism"],
    "Human Eye and Colourful World": ["eye", "vision", "colour", "scattering", "myopia"],
    "Sources of Energy": ["energy", "renewable", "solar"],
    Metallurgy: ["metal", "ore", "metallurgy"],
    "Carbon and its Compounds": ["carbon", "hydrocarbon", "alkane", "alkene"],
    "Acids Bases and Salts": ["acid", "base", "salt", "ph"],
    "Atomic Structure": ["atom", "electron", "proton", "neutron"],
    "Classification of Elements": ["periodic", "mendeleev", "octaves", "newlands"],
    "Redox Reactions": ["oxidation", "reduction", "redox"],
    "States of Matter": ["solid", "liquid", "gas", "matter"],
    Equilibrium: ["equilibrium"],
    Polymers: ["polymer"],
    "Nuclear Chemistry": ["nuclear", "radioactive"]
  };

  return topics.find((topic) => keywordMap[topic]?.some((keyword) => haystack.includes(keyword))) ?? topics[0];
}

async function extractPdfText(file: string) {
  const parser = new PDFParse({ data: readFileSync(file) });
  const result = await parser.getText();
  await parser.destroy();
  return { text: result.text.replace(/\s+/g, " ").trim(), pages: result.total ?? result.pages?.length ?? 0 };
}

function findQuestionPositions(text: string, maxQuestion = 120) {
  const positions: number[] = [];
  let previous = 0;
  for (let number = 1; number <= maxQuestion; number += 1) {
    const pattern = new RegExp(`(?:^|\\s)${number}\\.\\s`, "g");
    let match: RegExpExecArray | null;
    let chosen = -1;
    while ((match = pattern.exec(text))) {
      const pos = match.index + (match[0].startsWith(" ") ? 1 : 0);
      if (pos < previous) continue;
      if (text.slice(pos, pos + 900).includes("Correct Answer:")) {
        chosen = pos;
        break;
      }
    }
    if (chosen === -1) throw new Error(`Could not locate question ${number}`);
    positions.push(chosen);
    previous = chosen + 5;
  }
  return positions;
}

function parseOptions(questionPart: string) {
  const optionPattern = /\((?:1|A)\)\s*/;
  let firstOption = questionPart.search(optionPattern);
  let markerPattern = /\(([1-4A-D])\)\s*/g;
  if (firstOption === -1) {
    firstOption = questionPart.search(/(?:^|\s)1\.\s*/);
    markerPattern = /(?:^|\s)([1-4])\.\s*/g;
  }
  if (firstOption === -1) return null;
  const questionText = questionPart.slice(0, firstOption).trim();
  const optionsText = questionPart.slice(firstOption).trim();
  const markers = Array.from(optionsText.matchAll(markerPattern));
  if (markers.length < 4) return null;

  const labelMap: Record<string, "A" | "B" | "C" | "D"> = { "1": "A", "2": "B", "3": "C", "4": "D", A: "A", B: "B", C: "C", D: "D" };
  const options = markers.slice(0, 4).map((marker, index) => {
    const start = (marker.index ?? 0) + marker[0].length;
    const end = index < 3 ? markers[index + 1].index ?? optionsText.length : optionsText.length;
    return { label: labelMap[marker[1]], text: optionsText.slice(start, end).trim() };
  });

  return { questionText, options };
}

function parseStructuredQuestions(text: string) {
  const positions = findQuestionPositions(text, 120);
  const parsed: ParsedQuestion[] = [];
  for (let index = 0; index < positions.length; index += 1) {
    const number = index + 1;
    const segment = text.slice(positions[index], positions[index + 1] ?? text.length);
    const withoutNumber = segment.replace(new RegExp(`^${number}\\.\\s*`), "");
    const [questionAndOptions, answerAndSolution = ""] = withoutNumber.split("Correct Answer:");
    const normalizedAnswer = answerAndSolution.trim();
    const correctMatch = normalizedAnswer.match(/\(([1-4A-D])\)\s*([^]*?)(?:Solution:|$)/) ?? normalizedAnswer.match(/^([1-4])\.\s*([^]*?)(?:Solution:|$)/);
    const optionData = parseOptions(questionAndOptions);
    if (!correctMatch || !optionData) continue;
    const correctRaw = correctMatch[1];
    const correctOption = ({ "1": "A", "2": "B", "3": "C", "4": "D", A: "A", B: "B", C: "C", D: "D" } as const)[correctRaw];
    if (!correctOption) continue;
    const solution = answerAndSolution.split("Solution:").slice(1).join("Solution:").split("Quick Tip")[0]?.trim();
    const subject = subjectForQuestion(number);
    const topic = classifyTopic(subject, `${optionData.questionText} ${solution ?? ""}`);
    parsed.push({
      number,
      subject,
      topic,
      questionText: optionData.questionText,
      options: optionData.options,
      correctOption,
      explanation: solution || `Correct answer is option ${correctOption}. Review the linked source PDF for full working.`
    });
  }
  return parsed;
}

async function ensureBase() {
  const polycet = await prisma.exam.upsert({
    where: { code: "POLYCET" },
    update: {},
    create: {
      code: "POLYCET",
      name: "POLYCET",
      description: "POLYCET objective exam with Maths, Physics, and Chemistry.",
      durationMin: 150,
      totalMarks: 150,
      totalQuestions: 150
    }
  });
  const subjects = new Map<string, string>();
  for (const subject of [
    { name: "Maths", marks: 60, weight: 5 },
    { name: "Physics", marks: 30, weight: 3 },
    { name: "Chemistry", marks: 30, weight: 3 }
  ]) {
    const existing = await prisma.subject.findFirst({ where: { examId: polycet.id, groupId: null, name: subject.name } });
    const record = existing
      ? await prisma.subject.update({ where: { id: existing.id }, data: subject })
      : await prisma.subject.create({ data: { examId: polycet.id, ...subject } });
    subjects.set(subject.name, record.id);
  }
  return { exam: polycet, subjects };
}

async function registerPdfSource(pdf: typeof localPdfs[number], pages: number, chars: number) {
  await prisma.sourceRecord.upsert({
    where: { id: pdf.id },
    update: {
      exam: "POLYCET",
      group: null,
      assetType: pdf.assetType,
      title: pdf.title,
      url: `file://${join(process.cwd(), pdf.file)}`,
      sourceType: "local_pdf",
      tier: "local_import",
      yearsClaimed: String(pdf.year),
      verificationStatus: pdf.needsOcr ? "ocr_required" : "local_unverified",
      metadata: JSON.stringify({ file: pdf.file, pages, chars, set: pdf.set, parseStructured: pdf.parseStructured })
    },
    create: {
      id: pdf.id,
      exam: "POLYCET",
      group: null,
      assetType: pdf.assetType,
      title: pdf.title,
      url: `file://${join(process.cwd(), pdf.file)}`,
      sourceType: "local_pdf",
      tier: "local_import",
      yearsClaimed: String(pdf.year),
      verificationStatus: pdf.needsOcr ? "ocr_required" : "local_unverified",
      metadata: JSON.stringify({ file: pdf.file, pages, chars, set: pdf.set, parseStructured: pdf.parseStructured })
    }
  });
}

async function importStructuredQuestions(pdf: typeof localPdfs[number], text: string) {
  const { exam, subjects } = await ensureBase();
  const paper = await prisma.paper.upsert({
    where: { id: pdf.id },
    update: {
      sourceRecordId: pdf.id,
      year: pdf.year,
      title: pdf.title,
      sourceType: "local_pdf",
      sourceUrl: `file://${join(process.cwd(), pdf.file)}`
    },
    create: {
      id: pdf.id,
      examId: exam.id,
      sourceRecordId: pdf.id,
      year: pdf.year,
      title: pdf.title,
      sourceType: "local_pdf",
      sourceUrl: `file://${join(process.cwd(), pdf.file)}`
    }
  });

  await prisma.question.deleteMany({ where: { paperId: paper.id } });
  const parsed = parseStructuredQuestions(text);

  for (const question of parsed) {
    const subjectId = subjects.get(question.subject);
    if (!subjectId) continue;
    await prisma.question.create({
      data: {
        examId: exam.id,
        paperId: paper.id,
        sourceRecordId: pdf.id,
        subjectId,
        year: pdf.year,
        topic: question.topic,
        subtopic: null,
        difficulty: question.number <= 40 ? "EASY" : question.number <= 90 ? "MEDIUM" : "HARD",
        questionText: question.questionText,
        explanation: question.explanation,
        sourceType: "local_pdf",
        sourceUrl: `file://${join(process.cwd(), pdf.file)}`,
        options: { create: question.options },
        answerKey: { create: { correctOption: question.correctOption, sourceRecordId: pdf.id, verificationStatus: "unverified_local_pdf" } },
        topicTags: { create: [{ tag: slug(question.subject) }, { tag: slug(question.topic) }, { tag: `polycet-${pdf.year}` }] }
      }
    });
  }

  return parsed.length;
}

async function main() {
  mkdirSync(join(process.cwd(), "data/extracted/pdf-text"), { recursive: true });
  let importedQuestions = 0;

  for (const pdf of localPdfs) {
    const { text, pages } = await extractPdfText(pdf.file);
    const outputPath = join(process.cwd(), "data/extracted/pdf-text", `${pdf.id}.txt`);
    writeFileSync(outputPath, `${text}\n`);
    await registerPdfSource(pdf, pages, text.length);

    if (pdf.parseStructured) {
      importedQuestions += await importStructuredQuestions(pdf, text);
    } else {
      const { exam } = await ensureBase();
      await prisma.paper.upsert({
        where: { id: pdf.id },
        update: { sourceRecordId: pdf.id, year: pdf.year, title: pdf.title, sourceType: "local_pdf", sourceUrl: `file://${join(process.cwd(), pdf.file)}` },
        create: { id: pdf.id, examId: exam.id, sourceRecordId: pdf.id, year: pdf.year, title: pdf.title, sourceType: "local_pdf", sourceUrl: `file://${join(process.cwd(), pdf.file)}` }
      });
    }
  }

  console.log(`Registered ${localPdfs.length} local POLYCET PDFs and imported ${importedQuestions} structured questions.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
