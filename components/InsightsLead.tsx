import Image from "next/image";
import Link from "next/link";
import {
  INSIGHT_COVER_H,
  INSIGHT_COVER_W,
  getInsightTagLabels,
  type InsightMeta,
} from "@/lib/insight-meta";

type InsightsLeadProps = {
  insight: InsightMeta;
};

export function InsightsLead({ insight }: InsightsLeadProps) {
  const tagLabel = getInsightTagLabels(insight.tags).at(0) ?? null;

  return (
    <article className="insights-lead insights-shell">
      <Link href={`/insights/${insight.slug}`} className="insights-lead__link">
        <div className="insights-lead__media">
          <Image
            src={insight.coverImage}
            alt=""
            width={INSIGHT_COVER_W}
            height={INSIGHT_COVER_H}
            sizes="(max-width: 1400px) calc(100vw - 2 * var(--shell-gutter)), 1400px"
            priority
            className="insights-lead__image"
          />
          <div className="insights-lead__scrim" aria-hidden="true" />
          <div className="insights-lead__meta">
            <h2 className="insights-lead__title">{insight.title}</h2>
            {insight.excerpt ? (
              <p className="insights-lead__excerpt">{insight.excerpt}</p>
            ) : (
              <span className="insights-lead__excerpt" aria-hidden="true" />
            )}
            {tagLabel ? (
              <span className="insight-chip insight-chip--on-media">{tagLabel}</span>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
