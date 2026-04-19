import { getSubjects } from "./exam-facts";
import { getPolycetTopicQueue } from "./topic-priorities";
import type { ExamType, StudyPlanDay, TgrjcGroup } from "./types";

const tsrjcMpcTopicCycle = ["English Grammar", "Reading Comprehension", "Mathematics basics", "Physical Science formulas"];

export function generateStudyPlan(options: {
  exam: ExamType;
  group?: TgrjcGroup | null;
  days: 7 | 14 | 30;
  weaknesses?: string[];
}): StudyPlanDay[] {
  const subjects = getSubjects(options.exam, options.group === "MPC" ? "MPC" : options.group);
  const priorityQueue = options.exam === "POLYCET" ? getPolycetTopicQueue() : [];
  const fallbackWeaknesses = options.exam === "POLYCET" ? priorityQueue.map((item) => item.topic) : tsrjcMpcTopicCycle;
  const weaknesses = options.weaknesses?.length ? options.weaknesses : fallbackWeaknesses;
  const weightedSubjects = subjects.flatMap((subject) => Array.from({ length: subject.weight }, () => subject.name));

  return Array.from({ length: options.days }, (_, index) => {
    const priorityItem = priorityQueue[index % Math.max(priorityQueue.length, 1)];
    const subject = options.exam === "POLYCET" && priorityItem ? priorityItem.subject : weightedSubjects[index % weightedSubjects.length];
    const weakTopic = options.exam === "POLYCET" && priorityItem ? priorityItem.topic : weaknesses[index % weaknesses.length];
    const isRevisionDay = (index + 1) % 7 === 0;
    const isPolycetMaths = options.exam === "POLYCET" && subject === "Maths";
    const targetQuestions = isPolycetMaths ? 30 : options.exam === "POLYCET" ? 18 : 15;

    return {
      day: index + 1,
      title: isRevisionDay ? "Revision and retry day" : `${subject} focus`,
      targetQuestions,
      tasks: isRevisionDay
        ? ["Retry saved mistakes", "Revise formula/error notes for 30 minutes", "Take one strict 20-question test"]
        : [
            `Study ${weakTopic} basics for 25 minutes`,
            `Practice ${targetQuestions} ${subject} questions`,
            isPolycetMaths ? "Write every formula or step before choosing the option" : "Mark guessed questions honestly",
            "Review wrong answers before closing the app"
          ]
    };
  });
}
