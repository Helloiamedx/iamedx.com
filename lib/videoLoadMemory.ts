/**
 * Tab memory for video srcs that finished a load cycle.
 * Used for soft analytics / optional hints — covers always run stroke→fill.
 */

"use client";

import { useLayoutEffect, useState } from "react";

const STORAGE_KEY = "edx-video-loaded-v1";

function readSet(): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw) as unknown;
    if (!Array.isArray(list)) return new Set();
    return new Set(list.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

function writeSet(set: Set<string>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {
    /* private mode / quota */
  }
}

export function wasVideoLoaded(src: string): boolean {
  if (!src) return false;
  return readSet().has(src);
}

export function markVideoLoaded(src: string) {
  if (!src) return;
  const set = readSet();
  if (set.has(src)) return;
  set.add(src);
  writeSet(set);
}

/**
 * Reveal gate — parent shows media after cover onDone.
 * No “instant skip” path; every mount gets stroke → fill.
 */
export function useVideoRevealGate(_cacheKey: string) {
  const [revealed, setRevealed] = useState(false);

  useLayoutEffect(() => {
    setRevealed(false);
  }, [_cacheKey]);

  return {
    revealed,
    instant: false,
    onCoverDone: () => setRevealed(true),
  };
}
