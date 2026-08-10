"use client";

import Link from "next/link";
import { insightTags, type InsightTag } from "@/content/nav";

type InsightFilterProps = {
  activeTag: InsightTag | null;
};

export function InsightFilter({ activeTag }: InsightFilterProps) {
  return (
    <div className="project-involvement insight-filter-bar">
      <h2 className="project-involvement__heading">The Latest Insight</h2>
      <div className="project-involvement__folder">
        <div
          className="project-involvement__track"
          role="list"
          aria-label="Filter by tag"
        >
          <Link
            href="/insights"
            scroll={false}
            role="listitem"
            className={
              !activeTag
                ? "project-involvement__pill is-active"
                : "project-involvement__pill"
            }
            aria-current={!activeTag ? "page" : undefined}
          >
            All
          </Link>
          {insightTags.map((tag) => {
            const isActive = activeTag?.slug === tag.slug;
            return (
              <Link
                key={tag.slug}
                href={`/insights?tag=${tag.slug}`}
                scroll={false}
                role="listitem"
                className={
                  isActive
                    ? "project-involvement__pill is-active"
                    : "project-involvement__pill"
                }
                aria-current={isActive ? "page" : undefined}
              >
                {tag.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
