"use client";

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

type InsightsLeadProps = {
  insight: InsightMeta;
  /**
   * Emit the `priority` preload hint. Default `true` — on /thoughts the lead
   * sits directly under a short text intro, so it belongs in the first paint.
   * The home page renders it seven-plus viewports down and opts out so it does
   * not contend with the hero at the highest priority.
   */
  priority?: boolean;
};

/**
 * Insights featured lead — cover only in media.
 * Meta: TITLE 40% | 10% | DESC (rest) | 10% | TAG — same as projects featured / case hero.
 */
export function InsightsLead({ insight, priority = true }: InsightsLeadProps) {
  const tagLabel = getInsightTagLabels(insight.tags).at(0) ?? null;
  const videoCover = isInsightVideoCover(insight.coverImage);

  return (
    <article className="insights-lead insights-shell">
      <Link
        href={`/thoughts/${insight.slug}`}
        className="insights-lead__link"
        prefetch={false}
      >
        <div className="insights-lead__media">
          {videoCover ? (
            <CoverLoopVideo
              className="insights-lead__cover-video"
              src={insight.coverImage}
              ariaLabel={insight.title}
            />
          ) : (
            <Image
              src={insight.coverImage}
              alt=""
              width={INSIGHT_COVER_W}
              height={INSIGHT_COVER_H}
              sizes="(max-width: 1400px) calc(100vw - 2 * var(--shell-gutter)), 1400px"
              priority={priority}
              className="insights-lead__image"
            />
          )}
        </div>
        <div className="insights-lead__meta">
          <h2 className="insights-lead__title">{insight.title}</h2>
          {insight.excerpt ? (
            <p className="insights-lead__excerpt">{insight.excerpt}</p>
          ) : (
            <span className="insights-lead__excerpt" aria-hidden="true" />
          )}
          {tagLabel ? (
            <span className="insight-chip">{tagLabel}</span>
          ) : (
            <span className="insights-lead__chip-slot" aria-hidden="true" />
          )}
        </div>
      </Link>
    </article>
  );
}
