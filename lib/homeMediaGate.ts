/**
 * Home intro readiness — in-page video players report ready while edx-loading.
 * SiteIntroLoader waits until every expected src is marked (or timeout).
 */

"use client";

let expected = new Set<string>();
let readySet = new Set<string>();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** Register the home video srcs the intro must wait for. Keeps prior ready marks. */
export function setHomeMediaExpected(ids: string[]) {
  expected = new Set(ids.filter(Boolean));
  for (const id of [...readySet]) {
    if (!expected.has(id)) readySet.delete(id);
  }
  emit();
}

export function markHomeMediaReady(id: string) {
  if (!id) return;
  if (readySet.has(id)) return;
  readySet.add(id);
  emit();
}

export function whenHomeMediaReady(timeoutMs = 20000): Promise<void> {
  return new Promise((resolve) => {
    const check = () => {
      if (expected.size === 0) {
        cleanup();
        resolve();
        return;
      }
      for (const id of expected) {
        if (!readySet.has(id)) return;
      }
      cleanup();
      resolve();
    };

    const cleanup = () => {
      listeners.delete(check);
      window.clearTimeout(safetyId);
    };

    listeners.add(check);
    check();
    const safetyId = window.setTimeout(() => {
      cleanup();
      resolve();
    }, timeoutMs);
  });
}
