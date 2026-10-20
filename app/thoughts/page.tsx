import type { Metadata } from "next";
import { CardRevealGroup } from "@/components/CardRevealGroup";
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
  title: "Thoughts",
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
            {/*
             * Cards take the Apple entrance. `FilterResults` remounts its swap
             * layer per `filterKey`, so changing the tag re-arms the group and
             * the new set rises in rather than hard-cutting.
             *
             * `trigger={1}`: this grid sits under the featured lead + filter.
             * At the authored 85% the first row waits below the fold and
             * leaves a blank band at the bottom of the screen; arming at the
             * viewport edge makes it rise as soon as it is actually visible.
             */}
            <CardRevealGroup selector=".insight-showcase__item" trigger={1}>
              <InsightMasonry insights={filtered} />
            </CardRevealGroup>
          </FilterResults>
        </div>
      </section>
    </main>
  );
}
