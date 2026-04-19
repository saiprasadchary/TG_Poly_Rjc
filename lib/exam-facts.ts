import type { ExamType, TgrjcGroup } from "./types";
import { tsrjcMpcSubjects } from "./topic-priorities";

export const examFacts = {
  POLYCET: {
    name: "POLYCET",
    path: "/exam/polycet",
    duration: "Usually practiced as 120-question full mock",
    totalQuestions: 120,
    totalMarks: 120,
    subjects: [
      { name: "Maths", marks: 50, weight: 5 },
      { name: "Physics", marks: 40, weight: 4 },
      { name: "Chemistry", marks: 30, weight: 3 }
    ],
    facts: ["120 objective questions", "50 Maths, 40 Physics, 30 Chemistry", "No negative marking", "SSC-level syllabus", "OMR style practice supported"]
  },
  TGRJC: {
    name: "TSRJC/TGRJC MPC",
    path: "/exam/tgrjc",
    duration: "2.5 hours",
    totalQuestions: 150,
    totalMarks: 150,
    subjects: [],
    facts: ["Objective type", "2.5 hours", "150 marks", "MPC only for this app", "English, Mathematics, Physical Science", "Telangana 10th syllabus based", "OMR style practice supported"]
  }
} as const;

export const tgrjcGroups: Record<TgrjcGroup, { name: string; path: string; subjects: Array<{ name: string; marks: number; weight: number }> }> = {
  MPC: {
    name: "MPC",
    path: "/exam/tgrjc/mpc",
    subjects: [...tsrjcMpcSubjects]
  },
  BPC: {
    name: "BPC",
    path: "/exam/tgrjc/bpc",
    subjects: [
      { name: "English", marks: 50, weight: 2 },
      { name: "Biological Science", marks: 50, weight: 3 },
      { name: "Physical Science", marks: 50, weight: 2 }
    ]
  },
  MEC: {
    name: "MEC",
    path: "/exam/tgrjc/mec",
    subjects: [
      { name: "English", marks: 50, weight: 2 },
      { name: "Social Studies", marks: 50, weight: 3 },
      { name: "Maths", marks: 50, weight: 2 }
    ]
  }
};

export function getSubjects(exam: ExamType, group?: TgrjcGroup | null) {
  if (exam === "POLYCET") return [...examFacts.POLYCET.subjects];
  if (group) return [...tgrjcGroups[group].subjects];
  return [...tgrjcGroups.MPC.subjects];
}
