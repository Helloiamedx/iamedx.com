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

/**
 * First screen: 6 cards → collection break → 4 more cards, then “See more”.
 * Each “See more” still adds one full group of 6.
 */
const INITIAL_VISIBLE = 10;
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
  const gridRef = useRef<HTMLDivElement>(null);
  const pendingHeightRef = useRef<number | null>(null);
  const expansionRef = useRef<Animation | null>(null);
  const revealRangeRef = useRef<{ from: number; to: number } | null>(null);
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

  /* Reveal pixels inside the grid; never animate document height or the footer position. */
  useLayoutEffect(() => {
    const pendingY = pendingScrollYRef.current;
    const fromHeight = pendingHeightRef.current;
    const grew = visibleCount > prevCountRef.current;
    prevCountRef.current = visibleCount;
    pendingScrollYRef.current = null;
    pendingHeightRef.current = null;

    const grid = gridRef.current;
    if (!grew || pendingY == null || fromHeight == null || !grid) return;

    const toHeight = grid.getBoundingClientRect().height;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    lockWindowScrollY(pendingY, lenis);
    if (reduced.matches || toHeight <= fromHeight) return;

    // The layout already has its final height. Only the lower clipping edge moves;
    // existing cards remain visible and new cards retain their Apple entrance.
    const animation = grid.animate(
      [
        { clipPath: `inset(0px 0px ${toHeight - fromHeight}px 0px)` },
        { clipPath: "inset(0px 0px 0px 0px)" },
      ],
      { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
    expansionRef.current = animation;
    revealRangeRef.current = { from: fromHeight, to: toHeight };

    const cleanup = () => {
      animation.onfinish = null;
      animation.cancel();
      if (expansionRef.current === animation) {
        expansionRef.current = null;
        revealRangeRef.current = null;
      }
      window.removeEventListener("resize", cleanup);
      reduced.removeEventListener("change", cleanup);
    };
    animation.onfinish = cleanup;
    window.addEventListener("resize", cleanup);
    reduced.addEventListener("change", cleanup);
    return cleanup;
  }, [visibleCount, lenis]);

  const loadMore = () => {
    const animation = expansionRef.current;
    const range = revealRangeRef.current;
    const progress = animation?.effect?.getComputedTiming().progress;
    // Continue from the visible edge on rapid clicks, not the full layout height.
    pendingHeightRef.current = range && progress != null
      ? range.from + (range.to - range.from) * progress
      : gridRef.current?.getBoundingClientRect().height ?? null;
    animation?.cancel();
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
      <div style={{ overflowAnchor: "none" }}>
        <div ref={gridRef}>
          <ProjectMasonry
            projects={visibleProjects}
            layout={layout}
            enableHoverSwap={enableHoverSwap}
          />
        </div>
        {seeMore}
      </div>
    );
  }

  return (
    <div style={{ overflowAnchor: "none" }}>
      <div ref={gridRef} className="projects-interleaved-grid">
        {segments.map((segment, index) => {
          return (
            <div
              // Filling a segment adds a collection, but must not remount its cards.
              key={`segment-${index}`}
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
    </div>
  );
}
