import Image from "next/image";
import Link from "next/link";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import {
  INSIGHT_COVER_H,
  INSIGHT_COVER_W,
  getInsightTagLabels,
  isInsightVideoCover,
  type InsightMeta,
} from "@/lib/insight-meta";

type InsightMasonryProps = {
  insights: InsightMeta[];
  emptyLabel?: string;
  /** `tri` = index filter (3-col, items stay 1/3). `related` = 2-col detail strip. */
  layout?: "tri" | "related";
};

export function InsightMasonry({
  insights,
  emptyLabel = "No thoughts with this tag yet.",
  layout = "tri",
}: InsightMasonryProps) {
  if (insights.length === 0) {
    return <p className="empty-state">{emptyLabel}</p>;
  }

  const listClass =
    layout === "related"
      ? "insight-showcase insight-showcase--related"
      : "insight-showcase insight-showcase--tri";

  return (
    <ul className={listClass}>
      {insights.map((insight) => {
        /* Showcase cards carry a single Insights mega tag */
        const tagLabel = getInsightTagLabels(insight.tags).at(0) ?? null;

        return (
          <li key={insight.slug} className="insight-showcase__item">
            <Link
              href={`/thoughts/${insight.slug}`}
              className="insight-showcase__link"
              prefetch={false}
            >
              <div className="insight-showcase__media">
                {isInsightVideoCover(insight.coverImage) ? (
                  <CoverLoopVideo
                    className="insight-showcase__cover-video"
                    src={insight.coverImage}
                    ariaLabel={insight.title}
                  />
                ) : (
                  <Image
                    src={insight.coverImage}
                    alt=""
                    width={INSIGHT_COVER_W}
                    height={INSIGHT_COVER_H}
                    sizes="(max-width: 700px) 100vw, (max-width: 900px) 48vw, (max-width: 1400px) 32vw, 460px"
                  />
                )}
              </div>
              <div className="insight-showcase__meta">
                <div className="card-meta__head">
                  <h3 className="insight-showcase__title">{insight.title}</h3>
                  {tagLabel ? (
                    <span className="insight-chip">{tagLabel}</span>
                  ) : null}
                </div>
                {insight.excerpt ? (
                  <p className="insight-showcase__excerpt">{insight.excerpt}</p>
                ) : null}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
