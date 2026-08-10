import type { Metadata } from "next";
import { InsightFilter } from "@/components/InsightFilter";
import { InsightMasonry } from "@/components/InsightMasonry";
import { InsightsHero } from "@/components/InsightsHero";
import { InsightsLead } from "@/components/InsightsLead";
import { findInsightTag } from "@/content/nav";
import { getInsightsByTag } from "@/lib/insights";

export const metadata: Metadata = {
  title: "Insights",
  description: "Notes and reflections from product manufacturing work.",
};

type InsightsPageProps = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function InsightsPage({ searchParams }: InsightsPageProps) {
  const params = await searchParams;
  const activeTag = params.tag ? findInsightTag(params.tag) : null;
  const insights = getInsightsByTag(activeTag?.slug ?? null);
  const lead = insights[0] ?? null;
  const rest = lead ? insights.slice(1) : [];

  return (
    <main className="insights-page">
      <section
        className="insights-opening"
        aria-labelledby="insights-hero-title"
      >
        <InsightsHero />
        {lead ? <InsightsLead insight={lead} /> : null}
      </section>

      <section className="insights-body">
        <div className="insights-shell">
          <InsightFilter activeTag={activeTag} />
          {insights.length === 0 ? (
            <p className="empty-state">No insights with this tag yet.</p>
          ) : rest.length > 0 ? (
            <InsightMasonry insights={rest} />
          ) : null}
        </div>
      </section>
    </main>
  );
}
