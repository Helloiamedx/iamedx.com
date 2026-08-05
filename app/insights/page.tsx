import type { Metadata } from "next";
import Link from "next/link";
import { findInsightTag, insightTags } from "@/content/nav";
import { getInsightTagLabels, getInsightsByTag } from "@/lib/insights";

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

  return (
    <main className="section">
      <p className="eyebrow">Insights</p>
      <h1>{activeTag ? activeTag.label : "Notes from the work."}</h1>
      {activeTag ? (
        <p className="lede">
          Articles tagged under this topic.{" "}
          <Link href="/insights">View all insights</Link>
        </p>
      ) : (
        <p className="lede">
          Manufacturing, supply chain, and business notes — filter by tag from
          the Insights menu.
        </p>
      )}

      <div className="project-filter" role="list">
        <Link
          href="/insights"
          role="listitem"
          className={!activeTag ? "is-active" : undefined}
        >
          All
        </Link>
        {insightTags.map((tag) => (
          <Link
            key={tag.slug}
            href={`/insights?tag=${tag.slug}`}
            role="listitem"
            className={activeTag?.slug === tag.slug ? "is-active" : undefined}
            aria-current={activeTag?.slug === tag.slug ? "page" : undefined}
          >
            {tag.label}
          </Link>
        ))}
      </div>

      {insights.length === 0 ? (
        <p className="empty-state">No insights with this tag yet.</p>
      ) : (
        <ul className="insight-list">
          {insights.map((insight) => (
            <li key={insight.slug}>
              <Link href={`/insights/${insight.slug}`}>
                <time dateTime={insight.date}>{insight.date}</time>
                <h2>{insight.title}</h2>
                <p>{insight.excerpt}</p>
                {insight.tags.length > 0 ? (
                  <p className="insight-tags">
                    {getInsightTagLabels(insight.tags).join(" · ")}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
