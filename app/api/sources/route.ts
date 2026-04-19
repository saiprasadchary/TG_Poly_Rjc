import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loadSourceRegistry } from "@/lib/source-registry";
import { sourceRank } from "@/lib/source-rank";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const exam = searchParams.get("exam") ?? undefined;
  const group = searchParams.get("group") ?? undefined;
  const assetType = searchParams.get("assetType") ?? undefined;
  const verificationStatus = searchParams.get("verificationStatus") ?? undefined;

  const records = await prisma.sourceRecord.findMany({
    where: {
      ...(exam ? { exam } : {}),
      ...(group ? { group: group === "none" ? null : group } : {}),
      ...(assetType ? { assetType } : {}),
      ...(verificationStatus ? { verificationStatus } : {})
    }
  });

  records.sort((a, b) => sourceRank(a) - sourceRank(b) || a.title.localeCompare(b.title));

  return NextResponse.json({ records });
}

export async function POST() {
  const records = loadSourceRegistry();
  for (const record of records) {
    await prisma.sourceRecord.upsert({
      where: { id: record.id },
      update: {
        exam: record.exam,
        group: record.group,
        assetType: record.assetType,
        title: record.title,
        url: record.url,
        sourceType: record.sourceType,
        tier: record.tier,
        yearsClaimed: record.yearsClaimed.join(","),
        verificationStatus: record.verificationStatus,
        metadata: JSON.stringify(record.metadata)
      },
      create: {
        id: record.id,
        exam: record.exam,
        group: record.group,
        assetType: record.assetType,
        title: record.title,
        url: record.url,
        sourceType: record.sourceType,
        tier: record.tier,
        yearsClaimed: record.yearsClaimed.join(","),
        verificationStatus: record.verificationStatus,
        metadata: JSON.stringify(record.metadata)
      }
    });
  }

  return NextResponse.json({ imported: records.length });
}
