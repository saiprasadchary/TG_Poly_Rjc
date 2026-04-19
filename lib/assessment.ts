import type { EvaluatedAnswer, MockAnswerInput, MockResult } from "./types";

export function evaluateMock(answers: MockAnswerInput[]): MockResult {
  const evaluated: EvaluatedAnswer[] = answers.map((answer) => ({
    ...answer,
    isCorrect: answer.selectedOption === answer.question.correct_option
  }));

  const score = evaluated.filter((answer) => answer.isCorrect).length;
  const total = evaluated.length;
  const timeSpentSec = evaluated.reduce((sum, answer) => sum + answer.timeSpentSec, 0);
  const subjectMap = new Map<string, { correct: number; total: number }>();
  const topicMap = new Map<string, { subject: string; topic: string; wrong: number; total: number }>();
  const repeated = new Map<string, number>();

  for (const answer of evaluated) {
    const subject = answer.question.subject;
    const subjectStats = subjectMap.get(subject) ?? { correct: 0, total: 0 };
    subjectStats.total += 1;
    if (answer.isCorrect) subjectStats.correct += 1;
    subjectMap.set(subject, subjectStats);

    const topicKey = `${subject}:${answer.question.topic}`;
    const topicStats = topicMap.get(topicKey) ?? { subject, topic: answer.question.topic, wrong: 0, total: 0 };
    topicStats.total += 1;
    if (!answer.isCorrect) {
      topicStats.wrong += 1;
      repeated.set(answer.question.topic, (repeated.get(answer.question.topic) ?? 0) + 1);
    }
    topicMap.set(topicKey, topicStats);
  }

  return {
    score,
    total,
    accuracy: total ? Math.round((score / total) * 100) : 0,
    timeSpentSec,
    subjectBreakdown: Array.from(subjectMap.entries()).map(([subject, stats]) => ({
      subject,
      correct: stats.correct,
      total: stats.total,
      accuracy: stats.total ? Math.round((stats.correct / stats.total) * 100) : 0
    })),
    weakTopics: Array.from(topicMap.values())
      .filter((topic) => topic.wrong > 0)
      .sort((a, b) => b.wrong - a.wrong),
    guessedAnswers: evaluated.filter((answer) => answer.isGuessed),
    slowButCorrect: evaluated.filter((answer) => answer.isCorrect && answer.timeSpentSec >= 150),
    repeatedMistakes: Array.from(repeated.entries())
      .map(([topic, count]) => ({ topic, count }))
      .filter((item) => item.count > 1)
  };
}

export function projectScore(lastFiveScores: number[], fullMarks: number) {
  if (lastFiveScores.length === 0) return { projected: 0, message: "Take one mock test to start projection." };
  const recent = lastFiveScores.slice(-5);
  const weighted = recent.reduce((sum, score, index) => sum + score * (index + 1), 0);
  const denominator = recent.reduce((sum, _score, index) => sum + index + 1, 0);
  const projected = Math.min(fullMarks, Math.round(weighted / denominator));
  const previous = recent.length > 1 ? recent[recent.length - 2] : recent[0];
  const direction = projected >= previous ? "improving" : "needs focus";
  return {
    projected,
    message: direction === "improving" ? "Good going. Last tests show improvement." : "Don't panic. Retry weak topics before the next mock."
  };
}

export function buildFocusAreas(result: MockResult) {
  const weak = result.weakTopics.slice(0, 3).map((item) => `${item.subject}: ${item.topic}`);
  const slow = result.slowButCorrect.slice(0, 2).map((item) => `${item.question.subject}: ${item.question.topic} is correct but slow`);
  return [...weak, ...slow];
}
