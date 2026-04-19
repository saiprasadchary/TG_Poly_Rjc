import { Card, PageHeader, SectionTitle } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { sourceRank } from "@/lib/source-rank";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const sources = await prisma.sourceRecord.findMany({
    where: {
      OR: [
        { exam: "POLYCET" },
        { exam: "TGRJC", group: "MPC" },
        { exam: "SSC_TOPIC_MAPPING" }
      ]
    }
  });

  sources.sort((a, b) => sourceRank(a) - sourceRank(b) || a.assetType.localeCompare(b.assetType) || a.title.localeCompare(b.title));

  const officialCount = sources.filter((source) => source.sourceType === "official").length;
  const verifiedKeys = sources.filter((source) => source.verificationStatus === "verified_official_key").length;

  return (
    <main>
      <PageHeader eyebrow="Debug" title="Source Registry" note="Active registry for POLYCET and TSRJC/TGRJC MPC. Retrieval prefers official sources first, then mirrors, then community gap-fill." />
      <section className="grid gap-3 sm:grid-cols-3">
        <Card><p className="text-sm font-bold text-ink/50">Records</p><p className="text-3xl font-black">{sources.length}</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Official</p><p className="text-3xl font-black">{officialCount}</p></Card>
        <Card><p className="text-sm font-bold text-ink/50">Verified keys</p><p className="text-3xl font-black">{verifiedKeys}</p></Card>
      </section>
      <section className="mt-4 space-y-3">
        <SectionTitle>Queryable Sources</SectionTitle>
        {sources.map((source) => (
          <Card key={source.id}>
            <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-wide text-leaf">
              <span>{source.exam}</span>
              {source.group ? <span>{source.group}</span> : null}
              <span>{source.assetType}</span>
              <span>{source.sourceType}</span>
              <span>{source.verificationStatus}</span>
            </div>
            <h2 className="mt-2 text-lg font-black text-ink">{source.title}</h2>
            <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 block break-words text-sm font-bold text-clay">{source.url}</a>
            {source.yearsClaimed ? <p className="mt-2 text-sm font-bold text-ink/60">Years claimed: {source.yearsClaimed}</p> : null}
          </Card>
        ))}
      </section>
    </main>
  );
}
