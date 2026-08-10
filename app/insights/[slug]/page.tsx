import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  INSIGHT_COVER_H,
  INSIGHT_COVER_W,
  getInsightBySlug,
  getInsightSlugs,
  getInsightTagLabels,
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
  const paragraphs = insight.content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);

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
            <Image
              src={insight.coverImage}
              alt=""
              width={INSIGHT_COVER_W}
              height={INSIGHT_COVER_H}
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 82vw, 70vw"
              priority
              className="insight-detail__cover-image"
            />
          </div>

          {paragraphs.length > 0 ? (
            <article className="insight-detail__body">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </article>
          ) : null}
        </div>
      </div>
    </main>
  );
}
