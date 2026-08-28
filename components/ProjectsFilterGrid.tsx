"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { ProjectsCollectionSection } from "@/components/ProjectsCollectionSection";
import { OriginButton } from "@/components/ui/origin-button";
import type { Project } from "@/content/projects";
import {
  gridSlotsPerBreak,
  segmentProjectsForIndex,
} from "@/lib/projectsIndexLayout";

/** First screen: featured lead + grid-list projects (with interleaved collection breaks). */
/* TEMP preview — 12 covers three 4-card breaks. Restore to 9 later. */
const INITIAL_VISIBLE = 12;
const LOAD_MORE_STEP = 7;

const SINGLE_COLUMN_MQ = "(max-width: 700px)";

type ProjectsFilterGridProps = {
  projects: Project[];
  /** Resets visible count when filters change. */
  filterKey: string;
  /** `tri` = 3-col (legacy). `related` = 2-col index grid. */
  layout?: "tri" | "related";
  enableHoverSwap?: boolean;
};

export function ProjectsFilterGrid({
  projects,
  filterKey,
  layout = "related",
  enableHoverSwap = false,
}: ProjectsFilterGridProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isSingleColumn, setIsSingleColumn] = useState(false);

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [filterKey]);

  useEffect(() => {
    const mq = window.matchMedia(SINGLE_COLUMN_MQ);
    const sync = () => setIsSingleColumn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const visibleProjects = projects.slice(0, visibleCount);
  const hasMore = visibleCount < projects.length;

  const segments = useMemo(() => {
    if (layout !== "related") {
      return [{ grid: visibleProjects, collection: null }];
    }
    return segmentProjectsForIndex(
      visibleProjects,
      gridSlotsPerBreak(isSingleColumn),
    );
  }, [visibleProjects, layout, isSingleColumn]);

  if (layout !== "related") {
    return (
      <>
        <ProjectMasonry
          projects={visibleProjects}
          layout={layout}
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
              See more projects
            </OriginButton>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="projects-interleaved-grid">
        {segments.map((segment, index) => {
          const segmentKey =
            segment.collection?.slug ??
            segment.grid.map((project) => project.slug).join("-") ??
            `segment-${index}`;

          return (
            <div key={segmentKey} className="projects-interleaved-grid__segment">
              {segment.grid.length > 0 ? (
                <ProjectMasonry
                  projects={segment.grid}
                  layout="related"
                  enableHoverSwap={enableHoverSwap}
                />
              ) : null}
              {segment.collection ? (
                <ProjectsCollectionSection collection={segment.collection} />
              ) : null}
            </div>
          );
        })}
      </div>
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
            See more projects
          </OriginButton>
        </div>
      ) : null}
    </>
  );
}
