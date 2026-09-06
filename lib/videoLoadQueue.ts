/**
 * Video load gate — one clip at a time, top → bottom.
 *
 * Home fullscreen intro (`edx-loading`):
 *   ONLY the home / case hero may attach. Nothing else on this page (and no
 *   other-route media) starts until the veil is gone.
 *
 * After intro / on other pages:
 *   1. Hero first (or watchdog if none)
 *   2. Then waiters serially: lower priority first; same priority keeps
 *      registration order (React mount ≈ DOM top → bottom)
 *   3. `releaseSlot` when playable → next waiter
 */

"use client";

import { useEffect, useState, type RefObject } from "react";

type Waiter = {
  id: string;
  priority: number;
  seq: number;
  resolve: () => void;
};

let heroDone = false;
let activeId: string | null = null;
let seqCounter = 0;
const waiters: Waiter[] = [];
let heroWatchdogId = 0;
let introObserver: MutationObserver | null = null;

function clearHeroWatchdog() {
  if (heroWatchdogId) {
    window.clearTimeout(heroWatchdogId);
    heroWatchdogId = 0;
  }
}

function isHomeIntroLoading() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("edx-loading")
  );
}

function isHeroPriority(priority: number) {
  return (
    priority <= VIDEO_LOAD_PRIORITY.caseHero ||
    priority === VIDEO_LOAD_PRIORITY.hero
  );
}

function sortWaiters() {
  waiters.sort((a, b) => a.priority - b.priority || a.seq - b.seq);
}

/** While the home veil is up, watch for unveil so the serial queue can resume. */
function ensureIntroObserver() {
  if (typeof document === "undefined" || introObserver) return;
  introObserver = new MutationObserver(() => {
    if (!isHomeIntroLoading()) {
      introObserver?.disconnect();
      introObserver = null;
      if (!activeId) pump();
    }
  });
  introObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

function pump() {
  if (activeId) return;

  sortWaiters();

  /* Fullscreen home intro: hero bytes only — hold every other clip. */
  if (isHomeIntroLoading()) {
    ensureIntroObserver();
    const index = waiters.findIndex((w) => isHeroPriority(w.priority));
    if (index < 0) {
      ensureHeroWatchdog();
      return;
    }
    const [next] = waiters.splice(index, 1);
    activeId = next.id;
    next.resolve();
    return;
  }

  if (!heroDone) {
    const index = waiters.findIndex((w) => isHeroPriority(w.priority));
    if (index < 0) {
      ensureHeroWatchdog();
      return;
    }
    const [next] = waiters.splice(index, 1);
    activeId = next.id;
    next.resolve();
    return;
  }

  const next = waiters.shift();
  if (!next) return;
  activeId = next.id;
  next.resolve();
}

function ensureHeroWatchdog() {
  if (heroDone || heroWatchdogId || typeof window === "undefined") return;
  /* Pages without a hero video shouldn't block the rest forever */
  heroWatchdogId = window.setTimeout(() => {
    heroWatchdogId = 0;
    unlockVideosAfterHero();
  }, 4000);
}

function acquire(id: string, priority: number): Promise<void> {
  if (!id) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = waiters.find((w) => w.id === id);
    if (existing) {
      existing.resolve = resolve;
      existing.priority = priority;
      pump();
      return;
    }

    waiters.push({
      id,
      priority,
      seq: seqCounter++,
      resolve,
    });
    pump();
  });
}

function release(id: string) {
  if (!id) return;

  const waiting = waiters.findIndex((w) => w.id === id);
  if (waiting >= 0) waiters.splice(waiting, 1);

  if (activeId !== id) return;
  activeId = null;
  pump();
}

/**
 * Call when the page hero (home or case) can play.
 * After the home intro unveils, opens the serial queue for the next clip.
 */
export function unlockVideosAfterHero() {
  if (heroDone) {
    if (!activeId) pump();
    return;
  }
  heroDone = true;
  clearHeroWatchdog();
  if (!activeId) pump();
}

/** Soft reset on client navigations that remount the tree (best-effort). */
export function resetVideoLoadGate() {
  heroDone = false;
  activeId = null;
  seqCounter = 0;
  waiters.length = 0;
  clearHeroWatchdog();
  introObserver?.disconnect();
  introObserver = null;
}

/**
 * `allowed` = may attach <video src> and buffer.
 * Only one slot is active at a time. Hero priorities run before anything else.
 * During `edx-loading`, non-hero slots stay blocked.
 */
export function useVideoLoadSlot(
  id: string,
  wantLoad: boolean,
  priority = 50,
  _anchorRef?: RefObject<Element | null>,
) {
  const [allowed, setAllowed] = useState(false);
  const isHero = isHeroPriority(priority);

  useEffect(() => {
    setAllowed(false);
    if (!wantLoad || !id) return;

    let cancelled = false;
    let acquired = false;

    void acquire(id, priority).then(() => {
      if (cancelled) {
        release(id);
        return;
      }
      acquired = true;
      setAllowed(true);
    });

    return () => {
      cancelled = true;
      if (acquired) release(id);
      else {
        const index = waiters.findIndex((w) => w.id === id);
        if (index >= 0) waiters.splice(index, 1);
      }
      setAllowed(false);
    };
  }, [id, wantLoad, priority]);

  const releaseSlot = () => {
    if (isHero) unlockVideosAfterHero();
    release(id);
  };

  return { allowed, releaseSlot };
}

/**
 * Lower number = earlier in the serial queue.
 * Same-priority clips keep mount / registration order (page top → bottom).
 */
export const VIDEO_LOAD_PRIORITY = {
  hero: 0,
  caseHero: 5,
  /** Home support band — after hero, before insight covers */
  homeSupport: 15,
  /** Mid-page clips (gallery + synced pairs) — DOM order via registration */
  syncedPair: 20,
  gallery: 20,
  coverCard: 30,
  footer: 40,
} as const;
