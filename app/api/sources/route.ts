import { NextResponse } from "next/server";
import { deploySourceRecords } from "@/lib/deploy-data";
import { sourceRank } from "@/lib/source-rank";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exam = searchParams.get("exam") ?? undefined;
  const group = searchParams.get("group") ?? undefined;
  const assetType = searchParams.get("assetType") ?? undefined;
  const verificationStatus = searchParams.get("verificationStatus") ?? undefined;

  const records = deploySourceRecords
    .filter((source) => {
      if (exam && source.exam !== exam) return false;
      if (group && source.group !== (group === "none" ? null : group)) return false;
      if (assetType && source.assetType !== assetType) return false;
      if (verificationStatus && source.verificationStatus !== verificationStatus) return false;
      return true;
    })
    .sort((a, b) => sourceRank(a) - sourceRank(b) || a.title.localeCompare(b.title));

  return NextResponse.json({ records });
}
