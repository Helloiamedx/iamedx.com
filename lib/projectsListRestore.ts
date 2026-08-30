/**
 * Projects index “See more” expand persistence.
 *
 * - Visible count lives in sessionStorage (written synchronously on expand).
 * - Returning via browser back keeps the stored count (storage is not cleared).
 * - Hard refresh + Link/push into `/projects` clear storage → start collapsed.
 */

const VISIBLE_STORAGE_PREFIX = "iamedx:projects-visible:";
export const PROJECTS_COLLAPSE_EVENT = "iamedx:projects-collapse";
export const SCROLL_RESTORE_EVENT = "iamedx:scroll-restore";

let reloadResetDone = false;

export function projectsVisibleStorageKey(filterKey: string) {
  return `${VISIBLE_STORAGE_PREFIX}${filterKey}`;
}

function dispatchProjectsCollapse() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROJECTS_COLLAPSE_EVENT));
}

export function clearAllProjectsVisibleStorage() {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i += 1) {
      const key = sessionStorage.key(i);
      if (key?.startsWith(VISIBLE_STORAGE_PREFIX)) keys.push(key);
    }
    for (const key of keys) sessionStorage.removeItem(key);
  } catch {
    /* private mode / quota */
  }
  dispatchProjectsCollapse();
}

export function clearProjectsVisibleStorage(filterKey: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(projectsVisibleStorageKey(filterKey));
  } catch {
    /* private mode / quota */
  }
}

/** Hard refresh — drop expand so the list starts collapsed. */
export function resetProjectsExpandOnReload() {
  if (typeof window === "undefined" || reloadResetDone) return;
  reloadResetDone = true;
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav?.type !== "reload") return;
  } catch {
    return;
  }
  clearAllProjectsVisibleStorage();
}

export function readProjectsVisibleCount(
  filterKey: string,
  max: number,
  fallback: number,
) {
  if (typeof window === "undefined") return fallback;
  resetProjectsExpandOnReload();
  try {
    const raw = sessionStorage.getItem(projectsVisibleStorageKey(filterKey));
    if (raw == null) return fallback;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(
      Math.max(fallback, parsed),
      Math.max(fallback, max),
    );
  } catch {
    return fallback;
  }
}

export function writeProjectsVisibleCount(filterKey: string, count: number) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(projectsVisibleStorageKey(filterKey), String(count));
  } catch {
    /* private mode / quota */
  }
}

export function requestScrollRestore() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SCROLL_RESTORE_EVENT));
}
