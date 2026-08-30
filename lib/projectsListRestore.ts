/**
 * Projects index “See more” expand — restore only after browser back/forward.
 * Refresh / nav Link push must start collapsed again.
 */

const VISIBLE_STORAGE_PREFIX = "iamedx:projects-visible:";
export const PROJECTS_COLLAPSE_EVENT = "iamedx:projects-collapse";

let expandRestorePending = false;

export function markProjectsExpandRestore() {
  expandRestorePending = true;
}

export function peekProjectsExpandRestore() {
  return expandRestorePending;
}

export function clearProjectsExpandRestore() {
  expandRestorePending = false;
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
