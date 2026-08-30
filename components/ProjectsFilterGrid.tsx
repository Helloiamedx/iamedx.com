"use client";

import { useLenis } from "lenis/react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { ProjectsCollectionSection } from "@/components/ProjectsCollectionSection";
import { OriginButton } from "@/components/ui/origin-button";
import type { Project } from "@/content/projects";
import {
  clearProjectsVisibleStorage,
  PROJECTS_COLLAPSE_EVENT,
  readProjectsVisibleCount,
  requestScrollRestore,
  writeProjectsVisibleCount,
} from "@/lib/projectsListRestore";
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
  /** `tri` = index filter (3-col). `related` = 2-col detail strip. */
  layout?: "tri" | "related";
  enableHoverSwap?: boolean;
  /** Interleave collection breaks — only on the unfiltered index. */
  interleaveCollections?: boolean;
};

function lockWindowScrollY(
  y: number,
  lenis?: {
    scrollTo: (
      value: number,
      opts?: { immediate?: boolean; force?: boolean },
    ) => void;
  } | null,
) {
  const target = Math.max(0, y);
  window.scrollTo(0, target);
  document.documentElement.scrollTop = target;
  document.body.scrollTop = target;
  lenis?.scrollTo(target, { immediate: true, force: true });
}

export function ProjectsFilterGrid({
  projects,
  filterKey,
  layout = "related",
  enableHoverSwap = false,
  interleaveCollections = true,
}: ProjectsFilterGridProps) {
  /* Always SSR/first paint collapsed — avoids hydration mismatch */
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const lenis = useLenis();
  const prevCountRef = useRef(visibleCount);
  const pendingScrollYRef = useRef<number | null>(null);
  const filterKeyRef = useRef(filterKey);
  const didRestoreScrollRef = useRef(false);

  /*
   * Always rehydrate from sessionStorage on mount / length change.
   * Storage is cleared only on reload + push into /projects + filter change —
   * so browser back keeps the expanded “See more” count.
   */
  useLayoutEffect(() => {
    const filterChanged = filterKeyRef.current !== filterKey;
    filterKeyRef.current = filterKey;

    if (filterChanged) {
      didRestoreScrollRef.current = false;
      setVisibleCount(INITIAL_VISIBLE);
      prevCountRef.current = INITIAL_VISIBLE;
      clearProjectsVisibleStorage(filterKey);
      writeProjectsVisibleCount(filterKey, INITIAL_VISIBLE);
      pendingScrollYRef.current = null;
      return;
    }

    const restored = readProjectsVisibleCount(
      filterKey,
      projects.length,
      INITIAL_VISIBLE,
    );
    setVisibleCount(restored);
    prevCountRef.current = restored;
    pendingScrollYRef.current = null;

    if (restored > INITIAL_VISIBLE && !didRestoreScrollRef.current) {
      didRestoreScrollRef.current = true;
      requestAnimationFrame(() => {
        requestScrollRestore();
        window.setTimeout(() => requestScrollRestore(), 120);
        window.setTimeout(() => requestScrollRestore(), 400);
        window.setTimeout(() => requestScrollRestore(), 900);
        window.setTimeout(() => requestScrollRestore(), 1600);
      });
    }
  }, [filterKey, projects.length]);

  /* Nav “Projects” while already on /projects — grid may not remount */
  useEffect(() => {
    const collapse = () => {
      didRestoreScrollRef.current = false;
      setVisibleCount(INITIAL_VISIBLE);
      prevCountRef.current = INITIAL_VISIBLE;
      pendingScrollYRef.current = null;
      writeProjectsVisibleCount(filterKeyRef.current, INITIAL_VISIBLE);
    };
    window.addEventListener(PROJECTS_COLLAPSE_EVENT, collapse);
    return () => window.removeEventListener(PROJECTS_COLLAPSE_EVENT, collapse);
  }, []);

  useEffect(() => {
    setVisibleCount((count) => {
      const next = Math.min(count, Math.max(projects.length, 0));
      if (next !== count) writeProjectsVisibleCount(filterKey, next);
      return next;
    });
  }, [filterKey, projects.length]);

  useEffect(() => {
    const mq = window.matchMedia(SINGLE_COLUMN_MQ);
    const sync = () => setIsSingleColumn(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /*
   * “See more” inserts content above the focused button — the browser then
   * scrolls to keep that button in view (reads as a jump to the bottom).
   * Lock the pre-click Y across the layout pass.
   */
  useLayoutEffect(() => {
    const pendingY = pendingScrollYRef.current;
    const grew = visibleCount > prevCountRef.current;
    prevCountRef.current = visibleCount;

    if (!grew || pendingY == null) return;

    lockWindowScrollY(pendingY, lenis);
    const raf = requestAnimationFrame(() => {
      lockWindowScrollY(pendingY, lenis);
      requestAnimationFrame(() => lockWindowScrollY(pendingY, lenis));
    });
    const t1 = window.setTimeout(() => lockWindowScrollY(pendingY, lenis), 80);
    const t2 = window.setTimeout(() => {
      lockWindowScrollY(pendingY, lenis);
      pendingScrollYRef.current = null;
    }, 220);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [visibleCount, lenis]);

  const loadMore = () => {
    pendingScrollYRef.current =
      window.scrollY || document.documentElement.scrollTop || 0;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setVisibleCount((count) => {
      const next = Math.min(count + LOAD_MORE_STEP, projects.length);
      /* Sync write before any navigation can unmount this tree */
      writeProjectsVisibleCount(filterKey, next);
      return next;
    });
  };

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

  const seeMore =
    hasMore ? (
      <div className="detail-index-cta">
        <OriginButton type="button" onClick={loadMore}>
          See more projects
        </OriginButton>
      </div>
    ) : null;

  if (layout !== "related") {
    return (
      <>
        <ProjectMasonry
          projects={visibleProjects}
          layout={layout}
          enableHoverSwap={enableHoverSwap}
        />
        {seeMore}
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
      {seeMore}
    </>
  );
}
