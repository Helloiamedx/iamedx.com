import { findInsightTag } from "@/content/nav";

/** Cover frame size shared by Insights lead / masonry / detail */
export const INSIGHT_COVER_W = 3000;
export const INSIGHT_COVER_H = 1687;

export type InsightMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  /** Canonical tag slugs from frontmatter, matched to Insights mega menu */
  tags: string[];
  /** Cover URL — falls back to rotating placeholders when omitted */
  coverImage: string;
};

export type Insight = InsightMeta & {
  content: string;
};

/** Client-safe: resolve tag slugs → display labels (no filesystem). */
export function getInsightTagLabels(tagSlugs: string[]) {
  return tagSlugs
    .map((slug) => findInsightTag(slug)?.label ?? slug)
    .filter(Boolean);
}
