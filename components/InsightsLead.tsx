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
};

/**
 * Insights featured lead — cover only in media.
 * Meta shares projects featured / case-hero desktop recipe: desc at fixed centered-nav inset;
 * 5.5vw after title; 10vw before the type label.
 */
export function InsightsLead({ insight }: InsightsLeadProps) {
  const tagLabel = getInsightTagLabels(insight.tags).at(0) ?? null;
  const videoCover = isInsightVideoCover(insight.coverImage);

  return (
    <article className="insights-lead insights-shell">
      <Link href={`/thoughts/${insight.slug}`} className="insights-lead__link">
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
              priority
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
