"use client";

import Link from "next/link";
import { GlareHover, GLARE_WIPE_MS } from "@/components/GlareHover";
import { insightTags, type InsightTag } from "@/content/nav";

type InsightFilterProps = {
  activeTag: InsightTag | null;
};

function FilterPill({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <GlareHover
      width="auto"
      height="auto"
      background={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.06)"}
      borderRadius="999px"
      borderColor={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.16)"}
      glareColor="#ffffff"
      glareOpacity={0.55}
      transitionDuration={GLARE_WIPE_MS}
      className="insight-filter__glare"
    >
      <Link
        href={href}
        role="listitem"
        className={
          isActive ? "insight-filter__pill is-active" : "insight-filter__pill"
        }
        aria-current={isActive ? "page" : undefined}
      >
        {label}
      </Link>
    </GlareHover>
  );
}

export function InsightFilter({ activeTag }: InsightFilterProps) {
  return (
    <div className="insight-filter">
      <div className="insight-filter__folder">
        <div
          className="insight-filter__track"
          role="list"
          aria-label="Filter by tag"
        >
          <FilterPill href="/insights" label="All" isActive={!activeTag} />
          {insightTags.map((tag) => (
            <FilterPill
              key={tag.slug}
              href={`/insights?tag=${tag.slug}`}
              label={tag.label}
              isActive={activeTag?.slug === tag.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
