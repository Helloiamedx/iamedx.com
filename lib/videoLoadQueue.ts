/**
 * Video load gate — hero absolute first, then visibility-ranked concurrency.
 *
 * After hero unlocks (playing / still painted / YouTube ready / hard fail):
 *   - Up to MAX_POST_HERO concurrent non-hero clips
 *   - Prefer in-view, then near-view; far clips stay pending (no src)
 *   - Scroll updates visibility scores so pending work reorders — active
 *     slots are never revoked (no src thrash on playing clips)
 *   - releaseSlot frees a concurrency slot (playing started, error, or unmount)
 */

"use client";

import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from "react";

/** In viewport */
export const VIS_IN = 0;
/** Within preload margin of viewport */
export const VIS_NEAR = 1;
/** Far — registered but not eligible to start */
export const VIS_FAR = 2;

const MAX_POST_HERO = 2;
/**
 * Unlock if no page hero ever claims the gate.
 * Routes without a page hero (services / thoughts) open almost immediately
 * so covers aren’t stuck on a black plate.
 */
const HERO_FAILSAFE_MS = 48;
const NEAR_ROOT_MARGIN = "280px 0px";

type Waiter = {
  id: string;
  band: number;
  seq: number;
  resolve: () => void;
  /** Lower = sooner */
  visibility: number;
  /** Hero bands ignore far-gate */
  isHero: boolean;
};

let heroDone = false;
let seqCounter = 0;
const waiters: Waiter[] = [];
const activeIds = new Set<string>();
const heroListeners = new Set<() => void>();
let heroWatchdogId = 0;

function clearHeroWatchdog() {
  if (heroWatchdogId) {
    window.clearTimeout(heroWatchdogId);
    heroWatchdogId = 0;
  }
}

function isHeroPriority(band: number) {
  return (
    band <= VIDEO_LOAD_PRIORITY.caseHero || band === VIDEO_LOAD_PRIORITY.hero
  );
}

function emitHeroUnlocked() {
  heroListeners.forEach((listener) => listener());
}

function sortWaiters() {
  waiters.sort((a, b) => {
    if (a.isHero !== b.isHero) return a.isHero ? -1 : 1;
    if (a.visibility !== b.visibility) return a.visibility - b.visibility;
    if (a.band !== b.band) return a.band - b.band;
    return a.seq - b.seq;
  });
}

function maxSlots(): number {
  if (!heroDone) return 1;
  return MAX_POST_HERO;
}

function canStart(waiter: Waiter): boolean {
  if (!heroDone) return waiter.isHero;
  /* After hero: only in-view / near-view */
  return waiter.visibility <= VIS_NEAR;
}

function pump() {
  const limit = maxSlots();

  /*
   * A hero has claimed the gate — waiting for its slot, or already loading one
   * (pre-unlock, only heroes can start, so any active id is a hero). Disarm the
   * failsafe: it exists only for routes that never produce a hero, and left
   * armed it still fires 48ms in, opening post-hero concurrency while the hero
   * video is still buffering. `HeroBackgroundVideo` registers a frame late (its
   * `src` is set in a rAF), which is long enough for an earlier near-viewport
   * cover to arm the timer first.
   */
  const heroClaimed =
    waiters.some((w) => w.isHero) || (!heroDone && activeIds.size > 0);

  if (heroClaimed) {
    clearHeroWatchdog();
  } else if (!heroDone && !activeIds.size) {
    ensureHeroWatchdog();
  }

  if (activeIds.size >= limit) return;

  sortWaiters();

  while (activeIds.size < limit) {
    const index = waiters.findIndex(
      (w) => !activeIds.has(w.id) && canStart(w),
    );
    if (index < 0) break;
    const [next] = waiters.splice(index, 1);
    activeIds.add(next.id);
    next.resolve();
  }
}

function ensureHeroWatchdog() {
  if (heroDone || heroWatchdogId || typeof window === "undefined") return;
  heroWatchdogId = window.setTimeout(() => {
    heroWatchdogId = 0;
    unlockVideosAfterHero();
  }, HERO_FAILSAFE_MS);
}

function acquire(
  id: string,
  band: number,
  visibility: number,
): Promise<void> {
  if (!id) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = waiters.find((w) => w.id === id);
    if (existing) {
      existing.resolve = resolve;
      existing.band = band;
      existing.visibility = visibility;
      existing.isHero = isHeroPriority(band);
      pump();
      return;
    }

    if (activeIds.has(id)) {
      resolve();
      return;
    }

    waiters.push({
      id,
      band,
      seq: seqCounter++,
      resolve,
      visibility,
      isHero: isHeroPriority(band),
    });
    pump();
  });
}

function updateVisibility(id: string, visibility: number) {
  const waiter = waiters.find((w) => w.id === id);
  if (waiter) {
    waiter.visibility = visibility;
    pump();
  }
}

function release(id: string) {
  if (!id) return;

  const waiting = waiters.findIndex((w) => w.id === id);
  if (waiting >= 0) waiters.splice(waiting, 1);

  if (!activeIds.has(id)) {
    pump();
    return;
  }
  activeIds.delete(id);
  pump();
}

/**
 * Page hero has started playback (or still/YouTube equivalent / hard fail).
 * Opens post-hero concurrency for near-viewport media.
 */
export function unlockVideosAfterHero() {
  if (!heroDone) {
    heroDone = true;
    clearHeroWatchdog();
  }
  pump();
  emitHeroUnlocked();
}

/** Soft reset on client navigations. */
export function resetVideoLoadGate() {
  heroDone = false;
  seqCounter = 0;
  waiters.length = 0;
  activeIds.clear();
  clearHeroWatchdog();
  emitHeroUnlocked();
}

/**
 * True once the page hero has unlocked.
 * Pair with near-viewport for gallery stills.
 */
export function useAfterHeroGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setOpen(heroDone);
    };
    sync();
    heroListeners.add(sync);
    if (!heroDone) ensureHeroWatchdog();
    return () => {
      heroListeners.delete(sync);
    };
  }, []);

  return open;
}

/**
 * Start loading stills near the viewport, after hero unlock.
 * Once admitted, retain the media until unmount: removing off-screen images
 * collapses native-height frames and makes the document jump while scrolling.
 */
export function useNearViewportMedia(
  anchorRef: RefObject<Element | null>,
  rootMargin = NEAR_ROOT_MARGIN,
) {
  const heroReady = useAfterHeroGate();
  const [admitted, setAdmitted] = useState(false);

  useEffect(() => {
    const root = anchorRef.current;
    if (!root || !heroReady || admitted) return;

    if (typeof IntersectionObserver === "undefined") {
      setAdmitted(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setAdmitted(true);
        io.disconnect();
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [anchorRef, heroReady, rootMargin, admitted]);

  return admitted;
}

function readVisibility(
  el: Element | null,
  rootMarginPx: number,
): number {
  if (!el || typeof window === "undefined") return VIS_FAR;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || 0;
  const vw = window.innerWidth || 0;
  /* Both axes — horizontal carousels (Approach) must not look “in view”
   * while the card is clipped off to the side. */
  const vertIn = rect.bottom > 0 && rect.top < vh;
  const horizIn = rect.right > 0 && rect.left < vw;
  if (vertIn && horizIn) return VIS_IN;
  const vertNear =
    rect.bottom > -rootMarginPx && rect.top < vh + rootMarginPx;
  const horizNear =
    rect.right > -rootMarginPx && rect.left < vw + rootMarginPx;
  if (vertNear && horizNear) return VIS_NEAR;
  return VIS_FAR;
}

/**
 * `allowed` = may attach <video src>.
 * Heroes always contend for the single pre-unlock slot.
 * Others wait for hero + near/in-view, with max 2 concurrent.
 */
export function useVideoLoadSlot(
  id: string,
  wantLoad: boolean,
  band = 50,
  anchorRef?: RefObject<Element | null>,
) {
  const [allowed, setAllowed] = useState(false);
  const isHero = isHeroPriority(band);

  useEffect(() => {
    setAllowed(false);
    if (!wantLoad || !id) return;

    let cancelled = false;
    let acquired = false;
    let io: IntersectionObserver | null = null;
    const marginPx = 280;

    const enqueue = (visibility: number) => {
      if (cancelled) return;
      void acquire(id, band, visibility).then(() => {
        if (cancelled) {
          release(id);
          return;
        }
        acquired = true;
        setAllowed(true);
      });
    };

    const syncFromDom = () => {
      if (cancelled || acquired) return;
      const visibility = isHero
        ? VIS_IN
        : readVisibility(anchorRef?.current ?? null, marginPx);

      if (isHero || visibility <= VIS_NEAR) {
        const pending = waiters.find((w) => w.id === id);
        if (pending) updateVisibility(id, visibility);
        else enqueue(visibility);
      } else {
        const index = waiters.findIndex((w) => w.id === id);
        if (index >= 0) waiters.splice(index, 1);
      }
    };

    syncFromDom();

    if (!isHero) {
      const root = anchorRef?.current;
      if (root && typeof IntersectionObserver !== "undefined") {
        io = new IntersectionObserver(() => syncFromDom(), {
          rootMargin: NEAR_ROOT_MARGIN,
          threshold: [0, 0.01],
        });
        io.observe(root);
      }
      /* Capture scroll on overflow carousels (Approach rail), not only window */
      if (typeof window !== "undefined") {
        window.addEventListener("scroll", syncFromDom, {
          passive: true,
          capture: true,
        });
        window.addEventListener("resize", syncFromDom, { passive: true });
      }
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (!isHero && typeof window !== "undefined") {
        window.removeEventListener("scroll", syncFromDom, {
          capture: true,
        } as EventListenerOptions);
        window.removeEventListener("resize", syncFromDom);
      }
      if (acquired) release(id);
      else {
        const index = waiters.findIndex((w) => w.id === id);
        if (index >= 0) waiters.splice(index, 1);
      }
      setAllowed(false);
    };
  }, [id, wantLoad, band, isHero, anchorRef]);

  const releaseSlot = useCallback(() => {
    if (isHero) unlockVideosAfterHero();
    release(id);
  }, [id, isHero]);

  return { allowed, releaseSlot };
}

/**
 * Lower band number = preferred when visibility ties.
 */
export const VIDEO_LOAD_PRIORITY = {
  hero: 0,
  caseHero: 5,
  homeSupport: 15,
  syncedPair: 20,
  gallery: 20,
  coverCard: 30,
  footer: 40,
} as const;

/** Soften continued download after first frames are on screen */
export function softenVideoDownload(el: HTMLVideoElement | null) {
  if (!el) return;
  try {
    el.preload = "metadata";
  } catch {
    /* ignore */
  }
}
