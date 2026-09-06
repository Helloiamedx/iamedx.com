/**
 * Video load gate — hero first, then everyone else in parallel.
 *
 * Serial “one clip at a time” made pages feel much slower than before the
 * mark loader existed. Desired behavior:
 * 1. Hero / case hero starts immediately
 * 2. When it is playable → unlock the rest
 * 3. Remaining clips attach src and buffer together in the background
 * 4. Mark UI is separate (only on-screen) and must not hold the network
 */

"use client";

import {
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

type Waiter = {
  id: string;
  resolve: () => void;
};

/** True once the page hero has become playable (or no hero registered). */
let postHeroOpen = false;
const waiters: Waiter[] = [];
let heroWatchdogId = 0;

function clearHeroWatchdog() {
  if (heroWatchdogId) {
    window.clearTimeout(heroWatchdogId);
    heroWatchdogId = 0;
  }
}

function flushWaiters() {
  const pending = waiters.splice(0, waiters.length);
  for (const waiter of pending) waiter.resolve();
}

function isHomeIntroLoading() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("edx-loading")
  );
}

/**
 * Call when the page hero (home or case) can play.
 * Opens the gate so gallery / footer / cards may attach sources in parallel.
 */
export function unlockVideosAfterHero() {
  if (postHeroOpen) return;
  postHeroOpen = true;
  clearHeroWatchdog();
  flushWaiters();
}

/** Soft reset on client navigations that remount the tree (best-effort). */
export function resetVideoLoadGate() {
  postHeroOpen = false;
  waiters.length = 0;
  clearHeroWatchdog();
}

function ensureHeroWatchdog() {
  if (postHeroOpen || heroWatchdogId || typeof window === "undefined") return;
  /* Pages without a hero video shouldn't block forever */
  heroWatchdogId = window.setTimeout(() => {
    heroWatchdogId = 0;
    unlockVideosAfterHero();
  }, 4000);
}

function acquireAfterHero(id: string): Promise<void> {
  if (!id) return Promise.resolve();
  if (isHomeIntroLoading() || postHeroOpen) return Promise.resolve();

  ensureHeroWatchdog();

  return new Promise((resolve) => {
    const existing = waiters.find((w) => w.id === id);
    if (existing) {
      existing.resolve = resolve;
    } else {
      waiters.push({ id, resolve });
    }
  });
}

/**
 * `allowed` = may attach <video src> and buffer.
 * Hero priorities start immediately; everyone else waits until hero unlocks.
 */
export function useVideoLoadSlot(
  id: string,
  wantLoad: boolean,
  priority = 50,
  _anchorRef?: RefObject<Element | null>,
) {
  const [allowed, setAllowed] = useState(false);
  const isHero =
    priority <= VIDEO_LOAD_PRIORITY.caseHero ||
    priority === VIDEO_LOAD_PRIORITY.hero;

  useEffect(() => {
    setAllowed(false);
    if (!wantLoad || !id) return;

    let cancelled = false;

    const start = () => {
      if (cancelled) return;
      setAllowed(true);
    };

    if (isHero || isHomeIntroLoading() || postHeroOpen) {
      start();
      return () => {
        cancelled = true;
        setAllowed(false);
      };
    }

    void acquireAfterHero(id).then(start);

    return () => {
      cancelled = true;
      const index = waiters.findIndex((w) => w.id === id);
      if (index >= 0) waiters.splice(index, 1);
      setAllowed(false);
    };
  }, [id, wantLoad, isHero]);

  /** No-op kept for call-site compatibility — network is not serial anymore. */
  const releaseSlot = () => {
    if (isHero) unlockVideosAfterHero();
  };

  return { allowed, releaseSlot };
}

/**
 * Lower number = treated as hero (starts before the post-hero gate opens).
 */
export const VIDEO_LOAD_PRIORITY = {
  hero: 0,
  caseHero: 5,
  syncedPair: 10,
  gallery: 20,
  coverCard: 30,
  footer: 40,
} as const;
