import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
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

export default async function InsightDetailPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const insight = getInsightBySlug(slug);
  if (!insight) notFound();

  return (
    <main className="section insight-detail">
      <Link href="/insights" className="back-link">
        ← Insights
      </Link>
      <header>
        <time dateTime={insight.date}>{insight.date}</time>
        <h1>{insight.title}</h1>
        <p className="lede">{insight.excerpt}</p>
        {insight.tags.length > 0 ? (
          <p className="insight-tags">
            {insight.tags.map((tagSlug, index) => (
              <span key={tagSlug}>
                {index > 0 ? " · " : null}
                <Link href={`/insights?tag=${tagSlug}`}>
                  {getInsightTagLabels([tagSlug])[0]}
                </Link>
              </span>
            ))}
          </p>
        ) : null}
      </header>
      <article className="prose">
        {insight.content.split("\n\n").map((paragraph) => (
          <p key={paragraph.slice(0, 24)}>{paragraph}</p>
        ))}
      </article>
    </main>
  );
}
