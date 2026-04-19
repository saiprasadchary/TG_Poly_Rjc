export function sourceRank(source: { sourceType: string; tier: string; verificationStatus: string }) {
  const tierRank = source.tier === "official" ? 0 : source.sourceType === "official" ? 1 : source.sourceType === "mirror" ? 2 : 3;
  const verificationRank = source.verificationStatus === "verified_official_key" ? 0 : source.verificationStatus === "official_source" ? 1 : 2;
  return tierRank * 10 + verificationRank;
}
