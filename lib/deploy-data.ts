import importedQuestions from "@/data/deploy/imported-questions.json";
import papers from "@/data/deploy/papers.json";
import sourceRecords from "@/data/deploy/source-records.json";
import type { Question } from "./types";

export type DeploySourceRecord = (typeof sourceRecords)[number];
export type DeployPaper = (typeof papers)[number];

export const deployQuestions = importedQuestions as Question[];
export const deployPapers = papers as DeployPaper[];
export const deploySourceRecords = sourceRecords as DeploySourceRecord[];

export function deploySourcesFor(filters: { exam?: string; group?: string | null; assetType?: string }) {
  return deploySourceRecords.filter((source) => {
    if (filters.exam && source.exam !== filters.exam) return false;
    if (filters.group !== undefined && source.group !== filters.group) return false;
    if (filters.assetType && source.assetType !== filters.assetType) return false;
    return true;
  });
}
