"use client";

import Link from "next/link";
import { FilterSegmentTrack } from "@/components/FilterSegmentTrack";
import {
  involvementFilters,
  type Involvement,
} from "@/content/projects";

type ProjectFilterProps = {
  active: Involvement | "all";
  activeIp?: string | null;
};

export function ProjectFilter({ active, activeIp }: ProjectFilterProps) {
  const items = involvementFilters.map((item) => ({
    id: item.id,
    label: item.label,
    href:
      item.id === "all"
        ? activeIp
          ? `/projects?ip=${activeIp}`
          : "/projects"
        : activeIp
          ? `/projects?involvement=${item.id}&ip=${activeIp}`
          : `/projects?involvement=${item.id}`,
  }));

  return (
    <div className="project-involvement">
      <h2 className="project-involvement__heading">Explore Featured Projects</h2>

      {activeIp ? (
        <p className="project-involvement__ip">
          <Link href="/projects" scroll={false}>
            Clear IP filter
          </Link>
        </p>
      ) : null}

      <div className="project-involvement__folder">
        <FilterSegmentTrack
          items={items}
          activeId={active}
          ariaLabel="Filter by involvement"
        />
      </div>
    </div>
  );
}
