/**
 * Video load gate — hero absolute first, then visibility-ranked concurrency.
 *
 * Home fullscreen intro (`edx-loading`): only hero may attach.
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
 * Home intro keeps a long failsafe; other routes (services / thoughts) have no
 * hero — open almost immediately so covers aren’t stuck on a black plate.
 */
const HERO_FAILSAFE_HOME_MS = 16000;
const HERO_FAILSAFE_PAGE_MS = 48;
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
let introObserver: MutationObserver | null = null;

function clearHeroWatchdog() {
  if (heroWatchdogId) {
    window.clearTimeout(heroWatchdogId);
    heroWatchdogId = 0;
  }
}

export function isHomeIntroLoading() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("edx-loading")
  );
}

function isHeroPriority(band: number) {
  return (
    band <= VIDEO_LOAD_PRIORITY.caseHero || band === VIDEO_LOAD_PRIORITY.hero
  );
}

function emitHeroUnlocked() {
  heroListeners.forEach((listener) => listener());
}

function ensureIntroObserver() {
  if (typeof document === "undefined" || introObserver) return;
  introObserver = new MutationObserver(() => {
    if (!isHomeIntroLoading()) {
      introObserver?.disconnect();
      introObserver = null;
      pump();
      if (heroDone) emitHeroUnlocked();
    }
  });
  introObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
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
  if (isHomeIntroLoading()) return 1;
  if (!heroDone) return 1;
  return MAX_POST_HERO;
}

function canStart(waiter: Waiter): boolean {
  if (isHomeIntroLoading()) return waiter.isHero;
  if (!heroDone) return waiter.isHero;
  /* After hero: only in-view / near-view */
  return waiter.visibility <= VIS_NEAR;
}

function pump() {
  const limit = maxSlots();
  if (activeIds.size >= limit) return;

  if (isHomeIntroLoading()) ensureIntroObserver();

  if (!heroDone && !waiters.some((w) => w.isHero) && !activeIds.size) {
    ensureHeroWatchdog();
  }

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
  const delay = isHomeIntroLoading()
    ? HERO_FAILSAFE_HOME_MS
    : HERO_FAILSAFE_PAGE_MS;
  heroWatchdogId = window.setTimeout(() => {
    heroWatchdogId = 0;
    unlockVideosAfterHero();
  }, delay);
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
  const wasDone = heroDone;
  if (!heroDone) {
    heroDone = true;
    clearHeroWatchdog();
  }
  pump();
  if (!wasDone || !isHomeIntroLoading()) emitHeroUnlocked();
}

/** Soft reset on client navigations. */
export function resetVideoLoadGate() {
  heroDone = false;
  seqCounter = 0;
  waiters.length = 0;
  activeIds.clear();
  clearHeroWatchdog();
  introObserver?.disconnect();
  introObserver = null;
  emitHeroUnlocked();
}

/**
 * True once the page hero has unlocked and home intro veil is gone.
 * Pair with near-viewport for gallery stills.
 */
export function useAfterHeroGate() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setOpen(heroDone && !isHomeIntroLoading());
    };
    sync();
    heroListeners.add(sync);
    if (!heroDone) ensureHeroWatchdog();
    if (isHomeIntroLoading()) ensureIntroObserver();
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
  if (rect.bottom > 0 && rect.top < vh) return VIS_IN;
  if (rect.bottom > -rootMarginPx && rect.top < vh + rootMarginPx) {
    return VIS_NEAR;
  }
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
      } else if (typeof window !== "undefined") {
        window.addEventListener("scroll", syncFromDom, { passive: true });
        window.addEventListener("resize", syncFromDom, { passive: true });
      }
    }

    return () => {
      cancelled = true;
      io?.disconnect();
      if (!isHero && typeof window !== "undefined") {
        window.removeEventListener("scroll", syncFromDom);
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
