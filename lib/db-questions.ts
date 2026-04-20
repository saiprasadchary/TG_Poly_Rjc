import type { Question } from "./types";

type DbQuestion = {
  year: number | null;
  topic: string;
  subtopic: string | null;
  difficulty: string;
  questionText: string;
  explanation: string;
  sourceType: string;
  sourceUrl: string | null;
  exam: { code: string };
  group: { code: string } | null;
  subject: { name: string };
  options: Array<{ label: string; text: string }>;
  answerKey: { correctOption: string } | null;
  topicTags: Array<{ tag: string }>;
};

function normalizeOption(label: string) {
  if (["A", "B", "C", "D"].includes(label)) return label as "A" | "B" | "C" | "D";
  return "A";
}

export function toQuestion(question: DbQuestion): Question | null {
  if (!question.answerKey) return null;
  const correctOption = normalizeOption(question.answerKey.correctOption);
  const options = question.options
    .sort((a, b) => a.label.localeCompare(b.label))
    .slice(0, 4)
    .map((option) => ({ label: normalizeOption(option.label), text: option.text }));
  if (options.length !== 4) return null;

  return {
    exam_type: question.exam.code === "POLYCET" ? "POLYCET" : "TGRJC",
    year: question.year ?? new Date().getFullYear(),
    group: question.group?.code === "MPC" ? "MPC" : null,
    subject: question.subject.name,
    topic: question.topic,
    subtopic: question.subtopic,
    difficulty: question.difficulty === "HARD" ? "HARD" : question.difficulty === "MEDIUM" ? "MEDIUM" : "EASY",
    question_text: question.questionText,
    options,
    correct_option: correctOption,
    explanation: question.explanation,
    source_type: question.sourceType,
    source_url: question.sourceUrl,
    tags: question.topicTags.map((tag) => tag.tag)
  };
}
