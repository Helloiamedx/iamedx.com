/**
 * Projects index “See more” expand — restore only after browser back/forward.
 * Refresh / nav Link push must start collapsed again.
 */

const VISIBLE_STORAGE_PREFIX = "iamedx:projects-visible:";
const EXPAND_RESTORE_KEY = "iamedx:projects-expand-restore";
export const PROJECTS_COLLAPSE_EVENT = "iamedx:projects-collapse";

let expandRestorePending = false;

export function markProjectsExpandRestore() {
  expandRestorePending = true;
  try {
    sessionStorage.setItem(EXPAND_RESTORE_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}

export function peekProjectsExpandRestore() {
  if (expandRestorePending) return true;
  try {
    return sessionStorage.getItem(EXPAND_RESTORE_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearProjectsExpandRestore() {
  expandRestorePending = false;
  try {
    sessionStorage.removeItem(EXPAND_RESTORE_KEY);
  } catch {
    /* private mode / quota */
  }
}

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

/** Ask SmoothScroll to re-apply saved Y after expand restores document height. */
export const SCROLL_RESTORE_EVENT = "iamedx:scroll-restore";

export function requestScrollRestore() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SCROLL_RESTORE_EVENT));
}
