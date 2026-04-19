import { findRelevantQuestions } from "./questions";

export function resolveDoubt(query: string) {
  const matches = findRelevantQuestions(query, 3);

  if (matches.length === 0) {
    return {
      answer: "I could not find this in the current syllabus question bank. Add the question to the curated bank first, then I can explain it safely.",
      matches: [],
      commonTrap: "Avoid random internet explanations for exam prep. Use verified SSC/POLYCET/TGRJC material only."
    };
  }

  const top = matches[0];
  const correct = top.options.find((option) => option.label === top.correct_option);

  return {
    answer: `${top.explanation} Correct option is ${top.correct_option}${correct ? `: ${correct.text}` : ""}.`,
    matches,
    commonTrap: "Common trap: students often pick the option that looks familiar. First identify the formula or rule, then choose."
  };
}
