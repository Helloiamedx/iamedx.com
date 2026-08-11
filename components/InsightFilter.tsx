"use client";

import { FilterSegmentTrack } from "@/components/FilterSegmentTrack";
import { insightTags, type InsightTag } from "@/content/nav";

type InsightFilterProps = {
  activeTag: InsightTag | null;
};

export function InsightFilter({ activeTag }: InsightFilterProps) {
  const items = [
    { id: "all", label: "All", href: "/insights" },
    ...insightTags.map((tag) => ({
      id: tag.slug,
      label: tag.label,
      href: `/insights?tag=${tag.slug}`,
    })),
  ];

  return (
    <div className="project-involvement insight-filter-bar">
      <h2 className="project-involvement__heading">The Latest Insight</h2>
      <div className="project-involvement__folder">
        <FilterSegmentTrack
          items={items}
          activeId={activeTag?.slug ?? "all"}
          ariaLabel="Filter by tag"
        />
      </div>
    </div>
  );
}
