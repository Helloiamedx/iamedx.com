"use client";

import { useEffect, useState } from "react";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { OriginButton } from "@/components/ui/origin-button";
import type { Project } from "@/content/projects";

const INITIAL_VISIBLE = 8;
const LOAD_MORE_STEP = 5;

type ProjectsFilterGridProps = {
  projects: Project[];
  /** Resets visible count when filters change. */
  filterKey: string;
  enableHoverSwap?: boolean;
};

export function ProjectsFilterGrid({
  projects,
  filterKey,
  enableHoverSwap = false,
}: ProjectsFilterGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [filterKey]);

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;

  return (
    <>
      <ProjectMasonry
        projects={visibleProjects}
        enableHoverSwap={enableHoverSwap}
      />
      {hasMore ? (
        <div className="detail-index-cta">
          <OriginButton
            type="button"
            onClick={() =>
              setVisibleCount((count) =>
                Math.min(count + LOAD_MORE_STEP, projects.length),
              )
            }
          >
            See more
          </OriginButton>
        </div>
      ) : null}
    </>
  );
}
