import type { Metadata } from "next";
import { FilterResults } from "@/components/FilterResults";
import { InsightFilter } from "@/components/InsightFilter";
import { InsightMasonry } from "@/components/InsightMasonry";
import { InsightsHero } from "@/components/InsightsHero";
import { InsightsLead } from "@/components/InsightsLead";
import { findInsightTag } from "@/content/nav";
import { getAllInsights, getInsightsByTag } from "@/lib/insights";

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
  /* Featured lead is fixed — not part of the filter swap */
  const lead = getAllInsights()[0] ?? null;
  /* All matching articles under the filter (3-col layout, not a 3-item cap) */
  const filtered = getInsightsByTag(activeTag?.slug ?? null).filter(
    (insight) => insight.slug !== lead?.slug,
  );
  const filterKey = activeTag?.slug ?? "all";

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
          <FilterResults key={filterKey}>
            <InsightMasonry insights={filtered} />
          </FilterResults>
        </div>
      </section>
    </main>
  );
}
