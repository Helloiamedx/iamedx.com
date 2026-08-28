import type { ProjectCollection } from "@/content/collections";
import { getCollectionForBreakIndex } from "@/content/collections";
import type { Project } from "@/content/projects";

/** One two-column grid chunk plus optional collection break that follows it. */
export type ProjectsIndexSegment = {
  grid: Project[];
  collection: ProjectCollection | null;
};

/**
 * After every `gridSlotsPerBreak` grid cards, insert a collection section
 * (not a project card).
 *
 * TEMP preview: every 4 cards. Restore desktop 6 / mobile 3 when ready.
 */
export function segmentProjectsForIndex(
  projects: Project[],
  gridSlotsPerBreak: number,
): ProjectsIndexSegment[] {
  if (gridSlotsPerBreak < 1) {
    return projects.length > 0 ? [{ grid: projects, collection: null }] : [];
  }

  const segments: ProjectsIndexSegment[] = [];
  let index = 0;
  let breakIndex = 0;

  while (index < projects.length) {
    const grid = projects.slice(index, index + gridSlotsPerBreak);
    index += grid.length;

    let collection: ProjectCollection | null = null;
    if (grid.length === gridSlotsPerBreak) {
      collection = getCollectionForBreakIndex(breakIndex);
      breakIndex += 1;
    }

    segments.push({ grid, collection });
  }

  return segments;
}

/** TEMP preview: every 4 cards. Restore: desktop 6 / mobile 3. */
export function gridSlotsPerBreak(_isSingleColumn: boolean): number {
  return 4;
}
