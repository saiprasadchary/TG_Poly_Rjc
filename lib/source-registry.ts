import manifest from "@/data/mana_mentor_seed_manifest.json";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type SourceRecordInput = {
  id: string;
  exam: string;
  group: string | null;
  assetType: string;
  title: string;
  url: string;
  sourceType: string;
  tier: string;
  yearsClaimed: string[];
  verificationStatus: string;
  metadata: Record<string, unknown>;
};

type SourceFilters = {
  exam?: string;
  group?: string | null;
  assetType?: string;
  year?: number | string;
  subject?: string;
  verificationStatus?: string;
};

const officialFinalKeyPattern = /official.*final.*key|final.*official.*key/i;

function normalizeExam(exam: string) {
  if (/polycet/i.test(exam)) return "POLYCET";
  if (/tsrjc|tgrjc/i.test(exam)) return "TGRJC";
  if (/ssc/i.test(exam)) return "SSC_TOPIC_MAPPING";
  return exam.toUpperCase().replace(/\s+/g, "_");
}

function normalizeGroup(group?: string | null) {
  if (!group || group === "NA" || group === "GENERAL") return null;
  return group.toUpperCase();
}

function normalizeAssetType(assetType: string) {
  return assetType.trim().toLowerCase().replace(/\s+/g, "_");
}

function csvRows(csv: string) {
  const lines = csv.trim().split(/\r?\n/);
  const headers = splitCsvLine(lines[0]);
  return lines.slice(1).filter(Boolean).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values.map((value) => value.trim());
}

function verificationStatus(source: { sourceType: string; asset_type?: string; assetType?: string; title: string; tier?: string }) {
  const assetType = source.asset_type ?? source.assetType ?? "";
  const official = source.sourceType === "official" || source.tier === "official";
  const answerKeyLike = /answer_keys?|paper_with_key/i.test(assetType);
  if (answerKeyLike && (official || officialFinalKeyPattern.test(source.title))) return "verified_official_key";
  if (official) return "official_source";
  if (source.sourceType === "mirror") return "mirror_unverified";
  return "community_unverified";
}

function fromManifest() {
  const sources = manifest.sources as Record<string, Array<Record<string, unknown>>>;
  return Object.entries(sources).flatMap(([tier, records]) =>
    records.map((record) => normalizeRecord({ ...record, tier }, "manifest"))
  );
}

function fromCsv() {
  const registryCsv = readFileSync(join(process.cwd(), "data/source_registry.csv"), "utf8");
  return csvRows(registryCsv).map((row) => normalizeRecord(row, "csv"));
}

function normalizeRecord(raw: Record<string, unknown>, origin: "manifest" | "csv"): SourceRecordInput {
  const id = String(raw.id);
  const sourceType = String(raw.sourceType ?? raw.source_type ?? "community");
  const assetType = normalizeAssetType(String(raw.asset_type ?? raw.assetType));
  const years = Array.isArray(raw.years_claimed) ? raw.years_claimed.map(String) : [];
  const tier = String(raw.tier ?? (sourceType === "official" ? "official" : sourceType === "mirror" ? "reputable_mirrors" : "community_or_gapfill"));
  const title = String(raw.title);

  return {
    id,
    exam: normalizeExam(String(raw.exam)),
    group: normalizeGroup(String(raw.group ?? "")),
    assetType,
    title,
    url: String(raw.url),
    sourceType,
    tier,
    yearsClaimed: years,
    verificationStatus: verificationStatus({ sourceType, assetType, title, tier }),
    metadata: {
      origin,
      useFor: raw.use_for ?? [],
      rawExam: raw.exam,
      rawGroup: raw.group,
      rawAssetType: raw.asset_type ?? raw.assetType,
      yearsClaimed: years
    }
  };
}

function officialRank(record: SourceRecordInput) {
  const tierRank = record.tier === "official" ? 0 : record.sourceType === "official" ? 1 : record.sourceType === "mirror" ? 2 : 3;
  const verificationRank = record.verificationStatus === "verified_official_key" ? 0 : record.verificationStatus === "official_source" ? 1 : 2;
  return tierRank * 10 + verificationRank;
}

export function loadSourceRegistry() {
  const merged = new Map<string, SourceRecordInput>();
  for (const record of [...fromManifest(), ...fromCsv()]) {
    const existing = merged.get(record.id);
    if (!existing || officialRank(record) < officialRank(existing)) merged.set(record.id, record);
  }
  return Array.from(merged.values()).sort((a, b) => officialRank(a) - officialRank(b) || a.title.localeCompare(b.title));
}

export function findSourceRecords(filters: SourceFilters) {
  const year = filters.year ? String(filters.year) : undefined;
  const subject = filters.subject?.toLowerCase();
  return loadSourceRegistry().filter((record) => {
    if (filters.exam && record.exam !== normalizeExam(filters.exam)) return false;
    if (filters.group !== undefined && record.group !== normalizeGroup(filters.group)) return false;
    if (filters.assetType && record.assetType !== normalizeAssetType(filters.assetType)) return false;
    if (filters.verificationStatus && record.verificationStatus !== filters.verificationStatus) return false;
    if (year && record.yearsClaimed.length > 0 && !record.yearsClaimed.includes(year)) return false;
    if (subject) {
      const haystack = `${record.title} ${JSON.stringify(record.metadata)}`.toLowerCase();
      if (!haystack.includes(subject)) return false;
    }
    return true;
  });
}

export function bestSourceFor(filters: SourceFilters & { assetTypes?: string[] }) {
  const assetTypes = filters.assetTypes ?? (filters.assetType ? [filters.assetType] : ["previous_papers", "paper_with_key", "portal"]);
  for (const assetType of assetTypes) {
    const matches = findSourceRecords({ ...filters, assetType });
    if (matches.length) return matches[0];
  }
  return findSourceRecords(filters)[0] ?? null;
}

export function sourceAttributionFor(exam: string, group: string | null, assetType = "previous_papers") {
  const best = bestSourceFor({ exam, group, assetType });
  if (!best) return null;
  return {
    title: best.title,
    url: best.url,
    sourceType: best.sourceType,
    verificationStatus: best.verificationStatus
  };
}
