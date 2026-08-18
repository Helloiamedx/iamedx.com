import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FrostIndexLink } from "@/components/FrostIndexLink";
import { InsightBody } from "@/components/InsightBody";
import { InsightMasonry } from "@/components/InsightMasonry";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  INSIGHT_COVER_H,
  INSIGHT_COVER_W,
  getInsightBySlug,
  getInsightSlugs,
  getInsightTagLabels,
  getRelatedInsights,
  isInsightVideoCover,
} from "@/lib/insights";

type InsightPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getInsightSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: InsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) return { title: "Insight" };
  return {
    title: insight.title,
    description: insight.excerpt,
  };
}

function formatInsightDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function InsightDetailPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) notFound();

  const typeLabel = getInsightTagLabels(insight.tags).at(0) ?? null;
  const related = getRelatedInsights([insight.slug], 2, insight.tags);

  return (
    <main className="insight-detail">
      <div className="insight-detail__shell">
        <div className="insight-detail__frame">
          <header className="insight-detail__header">
            <div className="insight-detail__meta">
              <time dateTime={insight.date}>
                {formatInsightDate(insight.date)}
              </time>
              {typeLabel ? (
                <span className="insight-detail__type">{typeLabel}</span>
              ) : (
                <span className="insight-detail__type" aria-hidden="true" />
              )}
            </div>
            <h1 className="insight-detail__title">{insight.title}</h1>
          </header>

          <div className="insight-detail__cover">
            {isInsightVideoCover(insight.coverImage) ? (
              <ProtectedVideo
                className="insight-detail__cover-video"
                src={insight.coverImage}
                preload="metadata"
                aria-label={insight.title}
              />
            ) : (
              <Image
                src={insight.coverImage}
                alt=""
                width={INSIGHT_COVER_W}
                height={INSIGHT_COVER_H}
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 82vw, 70vw"
                priority
                className="insight-detail__cover-image"
              />
            )}
          </div>

          {insight.content.trim() ? (
            <InsightBody content={insight.content} />
          ) : null}
        </div>

        {related.length > 0 ? (
          <section className="insights-related" aria-labelledby="insights-related-title">
            <h2 id="insights-related-title" className="insights-related__title">
              Related
            </h2>
            <InsightMasonry insights={related} layout="related" />
            <FrostIndexLink href="/thoughts">All thoughts</FrostIndexLink>
          </section>
        ) : (
          <FrostIndexLink href="/thoughts">All thoughts</FrostIndexLink>
        )}
      </div>
    </main>
  );
}
