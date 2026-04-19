import { PrismaClient } from "@prisma/client";
import seed from "../data/questions.seed.json";
import { bestSourceFor, loadSourceRegistry } from "../lib/source-registry";

process.env.DATABASE_URL ??= "file:./dev.db";

const prisma = new PrismaClient();

type SeedQuestion = (typeof seed.questions)[number];

const examFacts: Record<"POLYCET" | "TGRJC", { name: string; description: string; durationMin: number; totalMarks: number; totalQuestions: number; subjects: Array<{ name: string; marks: number; weight: number }>; groups: string[] }> = {
  POLYCET: {
    name: "POLYCET",
    description: "120 objective questions: 50 Maths, 40 Physics, 30 Chemistry. No negative marking. SSC-level syllabus.",
    durationMin: 120,
    totalMarks: 120,
    totalQuestions: 120,
    subjects: [
      { name: "Maths", marks: 50, weight: 5 },
      { name: "Physics", marks: 40, weight: 4 },
      { name: "Chemistry", marks: 30, weight: 3 }
    ],
    groups: [] as string[]
  },
  TGRJC: {
    name: "TGRJC",
    description: "Objective type, 2.5 hours, 150 marks. Group subjects carry 50 marks each and follow Telangana 10th syllabus.",
    durationMin: 150,
    totalMarks: 150,
    totalQuestions: 150,
    subjects: [],
    groups: ["MPC", "BPC", "MEC"]
  }
};

const groupSubjects: Record<string, Array<{ name: string; marks: number; weight: number }>> = {
  MPC: [
    { name: "English", marks: 50, weight: 2 },
    { name: "Mathematics", marks: 50, weight: 3 },
    { name: "Physical Science", marks: 50, weight: 2 }
  ],
  BPC: [
    { name: "English", marks: 50, weight: 2 },
    { name: "Biological Science", marks: 50, weight: 3 },
    { name: "Physical Science", marks: 50, weight: 2 }
  ],
  MEC: [
    { name: "English", marks: 50, weight: 2 },
    { name: "Social Studies", marks: 50, weight: 3 },
    { name: "Maths", marks: 50, weight: 2 }
  ]
};

async function upsertBaseData() {
  const exams = new Map<string, string>();
  const groups = new Map<string, string>();
  const subjects = new Map<string, string>();

  for (const code of Object.keys(examFacts) as Array<"POLYCET" | "TGRJC">) {
    const fact = examFacts[code];
    const examData = {
      name: fact.name,
      description: fact.description,
      durationMin: fact.durationMin,
      totalMarks: fact.totalMarks,
      totalQuestions: fact.totalQuestions
    };
    const exam = await prisma.exam.upsert({
      where: { code },
      update: examData,
      create: { code, ...examData }
    });
    exams.set(code, exam.id);

    for (const groupCode of fact.groups) {
      const group = await prisma.examGroup.upsert({
        where: { examId_code: { examId: exam.id, code: groupCode } },
        update: { name: groupCode },
        create: { examId: exam.id, code: groupCode, name: groupCode }
      });
      groups.set(`${code}:${groupCode}`, group.id);

      for (const subject of groupSubjects[groupCode]) {
        const created = await prisma.subject.upsert({
          where: { examId_groupId_name: { examId: exam.id, groupId: group.id, name: subject.name } },
          update: subject,
          create: { examId: exam.id, groupId: group.id, ...subject }
        });
        subjects.set(`${code}:${groupCode}:${subject.name}`, created.id);
      }
    }

    for (const subject of fact.subjects) {
      const existing = await prisma.subject.findFirst({
        where: { examId: exam.id, groupId: null, name: subject.name }
      });
      const created = existing
        ? await prisma.subject.update({ where: { id: existing.id }, data: subject })
        : await prisma.subject.create({ data: { examId: exam.id, ...subject } });
      subjects.set(`${code}:none:${subject.name}`, created.id);
    }
  }

  return { exams, groups, subjects };
}

async function upsertSourceRecords() {
  for (const record of loadSourceRegistry()) {
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
}

async function createQuestion(question: SeedQuestion, ids: Awaited<ReturnType<typeof upsertBaseData>>) {
  const examType = question.exam_type;
  const examId = ids.exams.get(examType);
  if (!examId) throw new Error(`Unknown exam ${question.exam_type}`);

  const groupKey = question.group ? `${examType}:${question.group}` : undefined;
  const groupId = groupKey ? ids.groups.get(groupKey) : null;
  const subjectKey = `${examType}:${question.group ?? "none"}:${question.subject}`;
  const subjectId = ids.subjects.get(subjectKey);
  if (!subjectId) throw new Error(`Unknown subject ${subjectKey}`);
  const paperSource = bestSourceFor({
    exam: examType,
    group: question.group,
    year: question.year,
    assetTypes: ["previous_papers", "paper_with_key", "portal"]
  });
  const answerKeySource = bestSourceFor({
    exam: examType,
    group: question.group,
    year: question.year,
    assetTypes: ["answer_keys", "paper_with_key", "portal"]
  });
  const answerKeyVerification = answerKeySource?.verificationStatus === "verified_official_key" ? "verified_official_key" : "demo_unverified";

  const paper = await prisma.paper.upsert({
    where: { id: `${question.exam_type}-${question.group ?? "ALL"}-${question.year}` },
    update: {
      title: `${question.exam_type}${question.group ? ` ${question.group}` : ""} ${question.year} Sample Paper`,
      sourceRecordId: paperSource?.id,
      sourceType: paperSource?.sourceType ?? question.source_type,
      sourceUrl: paperSource?.url ?? question.source_url
    },
    create: {
      id: `${question.exam_type}-${question.group ?? "ALL"}-${question.year}`,
      examId,
      groupId,
      sourceRecordId: paperSource?.id,
      year: question.year,
      title: `${question.exam_type}${question.group ? ` ${question.group}` : ""} ${question.year} Sample Paper`,
      sourceType: paperSource?.sourceType ?? question.source_type,
      sourceUrl: paperSource?.url ?? question.source_url
    }
  });

  const created = await prisma.question.create({
    data: {
      examId,
      groupId,
      paperId: paper.id,
      sourceRecordId: paperSource?.id,
      subjectId,
      year: question.year,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      questionText: question.question_text,
      explanation: question.explanation,
      sourceType: paperSource?.sourceType ?? question.source_type,
      sourceUrl: paperSource?.url ?? question.source_url,
      options: { create: question.options },
      answerKey: { create: { correctOption: question.correct_option, sourceRecordId: answerKeySource?.id, verificationStatus: answerKeyVerification } },
      topicTags: { create: question.tags.map((tag) => ({ tag })) }
    }
  });

  return created.id;
}

async function main() {
  await prisma.mockAnswer.deleteMany();
  await prisma.mockAttempt.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.weaknessProfile.deleteMany();
  await prisma.studyPlan.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.topicTag.deleteMany();
  await prisma.answerKey.deleteMany();
  await prisma.option.deleteMany();
  await prisma.question.deleteMany();
  await prisma.paper.deleteMany();
  await prisma.sourceRecord.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.examGroup.deleteMany();
  await prisma.exam.deleteMany();

  await upsertSourceRecords();
  const ids = await upsertBaseData();
  const questionIds = [];
  for (const question of seed.questions) {
    questionIds.push(await createQuestion(question, ids));
  }

  const user = await prisma.userProfile.create({
    data: {
      displayName: "Demo Student",
      targetExam: "POLYCET",
      phoneStudyMode: true
    }
  });

  const polycetExam = await prisma.exam.findUniqueOrThrow({ where: { code: "POLYCET" } });
  const maths = await prisma.subject.findFirstOrThrow({ where: { examId: polycetExam.id, name: "Maths" } });
  const attempt = await prisma.mockAttempt.create({
    data: {
      userId: user.id,
      examId: polycetExam.id,
      subjectId: maths.id,
      mode: "QUICK",
      title: "Demo quick test",
      score: 3,
      totalMarks: 5,
      totalQuestions: 5,
      accuracy: 60,
      timeSpentSec: 720,
      submittedAt: new Date()
    }
  });

  await prisma.mockAnswer.createMany({
    data: questionIds.slice(0, 5).map((questionId, index) => ({
      attemptId: attempt.id,
      questionId,
      selectedOption: index < 3 ? "B" : "A",
      isCorrect: index < 3,
      isGuessed: index === 2,
      isFlagged: index === 4,
      timeSpentSec: [75, 140, 65, 190, 250][index]
    }))
  });

  await prisma.weaknessProfile.createMany({
    data: [
      { userId: user.id, examType: "POLYCET", subject: "Maths", topic: "Algebra", wrongCount: 3, attemptCount: 6, avgTimeSec: 155, confidence: 0.72 },
      { userId: user.id, examType: "POLYCET", subject: "Physics", topic: "Electricity", wrongCount: 2, attemptCount: 4, avgTimeSec: 180, confidence: 0.68 }
    ]
  });

  await prisma.bookmark.create({
    data: { userId: user.id, questionId: questionIds[3], type: "WRONG", note: "Triangle angle sum mistake" }
  });

  console.log(`Seeded ${seed.questions.length} questions and demo student data.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
