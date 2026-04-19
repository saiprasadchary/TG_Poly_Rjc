export type ExamType = "POLYCET" | "TGRJC";
export type TgrjcGroup = "MPC" | "BPC" | "MEC";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type MockMode = "FULL" | "SECTION" | "TOPIC" | "QUICK";

export type QuestionOption = {
  label: "A" | "B" | "C" | "D";
  text: string;
};

export type Question = {
  exam_type: ExamType;
  year: number;
  group: TgrjcGroup | null;
  subject: string;
  topic: string;
  subtopic?: string | null;
  difficulty: Difficulty;
  question_text: string;
  options: QuestionOption[];
  correct_option: "A" | "B" | "C" | "D";
  explanation: string;
  source_type: string;
  source_url?: string | null;
  tags: string[];
};

export type MockAnswerInput = {
  question: Question;
  selectedOption?: string | null;
  isGuessed?: boolean;
  isFlagged?: boolean;
  timeSpentSec: number;
};

export type EvaluatedAnswer = MockAnswerInput & {
  isCorrect: boolean;
};

export type MockResult = {
  score: number;
  total: number;
  accuracy: number;
  timeSpentSec: number;
  subjectBreakdown: Array<{ subject: string; correct: number; total: number; accuracy: number }>;
  weakTopics: Array<{ subject: string; topic: string; wrong: number; total: number }>;
  guessedAnswers: EvaluatedAnswer[];
  slowButCorrect: EvaluatedAnswer[];
  repeatedMistakes: Array<{ topic: string; count: number }>;
};

export type StudyPlanDay = {
  day: number;
  title: string;
  tasks: string[];
  targetQuestions: number;
};
