import seed from "@/data/questions.seed.json";
import { sourceAttributionFor } from "./source-registry";
import type { ExamType, Question, TgrjcGroup } from "./types";

export const questions = seed.questions as Question[];

export function filterQuestions(filters: {
  exam?: ExamType;
  group?: TgrjcGroup | null;
  subject?: string;
  year?: number;
  topic?: string;
  query?: string;
  limit?: number;
}) {
  const query = filters.query?.toLowerCase().trim();
  const topic = filters.topic?.toLowerCase().trim();
  let result = questions.filter((question) => {
    if (filters.exam && question.exam_type !== filters.exam) return false;
    if (filters.group !== undefined && question.group !== filters.group) return false;
    if (filters.subject && question.subject !== filters.subject) return false;
    if (filters.year && question.year !== filters.year) return false;
    if (topic && !question.topic.toLowerCase().includes(topic)) return false;
    if (query) {
      const haystack = [question.exam_type, question.group, question.subject, question.topic, question.subtopic, question.year, question.question_text]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  if (filters.limit) result = result.slice(0, filters.limit);
  return result;
}

export function getPapers() {
  const map = new Map<string, { exam: ExamType; group: TgrjcGroup | null; year: number; title: string; questionCount: number; subjects: string[]; sourceTitle?: string; sourceUrl?: string; sourceType?: string; verificationStatus?: string }>();
  for (const question of questions) {
    const key = `${question.exam_type}-${question.group ?? "ALL"}-${question.year}`;
    const attribution = sourceAttributionFor(question.exam_type, question.group, "previous_papers");
    const existing = map.get(key) ?? {
      exam: question.exam_type,
      group: question.group,
      year: question.year,
      title: `${question.exam_type}${question.group ? ` ${question.group}` : ""} ${question.year} Sample Paper`,
      questionCount: 0,
      subjects: [],
      sourceTitle: attribution?.title,
      sourceUrl: attribution?.url,
      sourceType: attribution?.sourceType,
      verificationStatus: attribution?.verificationStatus
    };
    existing.questionCount += 1;
    existing.subjects = Array.from(new Set([...existing.subjects, question.subject]));
    map.set(key, existing);
  }
  return Array.from(map.values()).sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export function findRelevantQuestions(query: string, limit = 3) {
  const terms = query.toLowerCase().split(/\s+/).filter((term) => term.length > 2);
  return questions
    .map((question) => {
      const text = [question.subject, question.topic, question.subtopic, question.question_text, question.explanation, ...question.tags]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);
      return { question, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.question);
}
