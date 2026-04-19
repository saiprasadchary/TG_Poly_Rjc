import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const optionSchema = z.object({
  label: z.enum(["A", "B", "C", "D"]),
  text: z.string().min(1)
});

const questionSchema = z.object({
  exam_type: z.enum(["POLYCET", "TGRJC"]),
  year: z.number().int().min(2000),
  group: z.enum(["MPC", "BPC", "MEC"]).nullable(),
  subject: z.string().min(1),
  topic: z.string().min(1),
  subtopic: z.string().nullable().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  question_text: z.string().min(1),
  options: z.array(optionSchema).length(4),
  correct_option: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(1),
  source_type: z.string().min(1),
  source_url: z.string().url().nullable().optional(),
  tags: z.array(z.string()).default([])
});

const bankSchema = z.object({
  version: z.number().int(),
  source_note: z.string().optional(),
  questions: z.array(questionSchema)
});

const [inputPath, outputPath = "data/questions.normalized.json"] = process.argv.slice(2);

if (!inputPath) {
  console.error("Usage: npm run import:questions -- input.json [output.json]");
  process.exit(1);
}

const raw = JSON.parse(readFileSync(resolve(inputPath), "utf8"));
const parsed = bankSchema.parse(raw);

const normalized = {
  ...parsed,
  questions: parsed.questions.map((question) => ({
    ...question,
    subject: question.subject.trim(),
    topic: question.topic.trim(),
    subtopic: question.subtopic?.trim() ?? null,
    question_text: question.question_text.trim(),
    explanation: question.explanation.trim(),
    tags: Array.from(new Set(question.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)))
  }))
};

writeFileSync(resolve(outputPath), `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Validated ${normalized.questions.length} questions -> ${outputPath}`);
