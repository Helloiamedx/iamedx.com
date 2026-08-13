"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  filterCardItemVariants,
  filterCardItemVariantsReduced,
  filterCardListVariants,
  filterCardListVariantsReduced,
} from "@/components/filterCardMotion";
import {
  INSIGHT_COVER_H,
  INSIGHT_COVER_W,
  getInsightTagLabels,
  isInsightVideoCover,
  type InsightMeta,
} from "@/lib/insight-meta";
import { ProtectedVideo } from "@/components/ProtectedVideo";

type InsightMasonryProps = {
  insights: InsightMeta[];
  emptyLabel?: string;
  /** `tri` = index filter (3-col, items stay 1/3). `related` = 2-col detail strip. */
  layout?: "tri" | "related";
};

export function InsightMasonry({
  insights,
  emptyLabel = "No insights with this tag yet.",
  layout = "tri",
}: InsightMasonryProps) {
  const reduceMotion = useReducedMotion();
  const listVariants = reduceMotion
    ? filterCardListVariantsReduced
    : filterCardListVariants;
  const itemVariants = reduceMotion
    ? filterCardItemVariantsReduced
    : filterCardItemVariants;

  if (insights.length === 0) {
    return (
      <motion.p
        className="empty-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0.01 : 0.2 }}
      >
        {emptyLabel}
      </motion.p>
    );
  }

  const listClass =
    layout === "related"
      ? "insight-showcase insight-showcase--related"
      : "insight-showcase insight-showcase--tri";

  return (
    <motion.ul
      className={listClass}
      variants={listVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      {insights.map((insight) => {
        /* Showcase cards carry a single Insights mega tag */
        const tagLabel = getInsightTagLabels(insight.tags).at(0) ?? null;

        return (
          <motion.li
            key={insight.slug}
            className="insight-showcase__item"
            variants={itemVariants}
          >
            <Link
              href={`/insights/${insight.slug}`}
              className="insight-showcase__link"
            >
              <div className="insight-showcase__media">
                {isInsightVideoCover(insight.coverImage) ? (
                  <ProtectedVideo
                    className="insight-showcase__cover-video"
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
                    sizes="(max-width: 700px) 100vw, (max-width: 900px) 48vw, (max-width: 1400px) 32vw, 460px"
                  />
                )}
              </div>
              <div className="insight-showcase__meta">
                <h3 className="insight-showcase__title">{insight.title}</h3>
                {tagLabel ? (
                  <span className="insight-chip">{tagLabel}</span>
                ) : (
                  <span aria-hidden="true" />
                )}
                {insight.excerpt ? (
                  <p className="insight-showcase__excerpt">{insight.excerpt}</p>
                ) : null}
              </div>
            </Link>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
