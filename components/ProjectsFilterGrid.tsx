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

/** First screen / each “See more”: one group = 6 cards (+ collection while any remain). */
const INITIAL_VISIBLE = 6;
const LOAD_MORE_STEP = 6;

const SINGLE_COLUMN_MQ = "(max-width: 700px)";

type ProjectsFilterGridProps = {
  projects: Project[];
  /** Resets visible count when filters change. */
  filterKey: string;
  /** `tri` = 3-col (legacy). `related` = 2-col index grid. */
  layout?: "tri" | "related";
  enableHoverSwap?: boolean;
  /** Interleave collection breaks — only on the unfiltered index. */
  interleaveCollections?: boolean;
};

export function ProjectsFilterGrid({
  projects,
  filterKey,
  layout = "related",
  enableHoverSwap = false,
  interleaveCollections = true,
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
    if (layout !== "related" || !interleaveCollections) {
      return [{ grid: visibleProjects, collection: null }];
    }
    return segmentProjectsForIndex(
      visibleProjects,
      gridSlotsPerBreak(isSingleColumn),
    );
  }, [visibleProjects, layout, isSingleColumn, interleaveCollections]);

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
          return (
            <div
              key={`segment-${index}-${segment.collection?.slug ?? "grid"}`}
              className="projects-interleaved-grid__segment"
            >
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
