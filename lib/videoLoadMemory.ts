/**
 * Remember video srcs that already finished loading in this tab.
 * Soft navigations + reloads in the same tab skip the stroke loader.
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
 * Reveal gate for a single video src.
 * Cached clips use an instant cover fade — but only after onCoverDone
 * (real frame ready). Never reveal the media before that, or you get a black flash.
 */
export function useVideoRevealGate(cacheKey: string) {
  const [revealed, setRevealed] = useState(false);
  const [instant, setInstant] = useState(false);

  useLayoutEffect(() => {
    setRevealed(false);
    setInstant(Boolean(cacheKey && wasVideoLoaded(cacheKey)));
  }, [cacheKey]);

  return {
    revealed,
    instant,
    onCoverDone: () => setRevealed(true),
  };
}
