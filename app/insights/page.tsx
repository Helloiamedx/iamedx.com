import type { Metadata } from "next";
import { FilterResults } from "@/components/FilterResults";
import { InsightFilter } from "@/components/InsightFilter";
import { InsightMasonry } from "@/components/InsightMasonry";
import { InsightsHero } from "@/components/InsightsHero";
import { InsightsLead } from "@/components/InsightsLead";
import { findInsightTag } from "@/content/nav";
import {
  getInsightsByTag,
  getInsightsFeaturedLead,
} from "@/lib/insights";
import { shuffleArray } from "@/lib/utils";

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
  /* Featured lead stays above the filter — also included in filter results when it matches */
  const lead = getInsightsFeaturedLead();
  const filtered = shuffleArray(getInsightsByTag(activeTag?.slug ?? null));
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
          <FilterResults filterKey={filterKey}>
            <InsightMasonry insights={filtered} />
          </FilterResults>
        </div>
      </section>
    </main>
  );
}
