"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  clearAllProjectsVisibleStorage,
  resetProjectsExpandOnReload,
  SCROLL_RESTORE_EVENT,
} from "@/lib/projectsListRestore";
import "lenis/dist/lenis.css";

type SmoothScrollProps = {
  children: ReactNode;
};

const SCROLL_STORAGE_PREFIX = "iamedx:scroll:";
/** Frozen Y at leave-time — not overwritten by later scroll listeners */
const SCROLL_PIN_PREFIX = "iamedx:scroll-pin:";

/**
 * Keep re-applying while layout/images grow. User wheel/touch cancels immediately
 * so we don’t fight scrolling (flicker).
 */
const RESTORE_RETRY_MS = [0, 32, 80, 160, 320, 640, 1200, 2000, 2800] as const;
const RESTORE_LOCK_MS = 3200;

type LenisLike = {
  scrollTo: (
    value: number,
    opts?: { immediate?: boolean; force?: boolean },
  ) => void;
} | null;

type NavKind = "push" | "pop";

/** Module-level so Strict Mode remounts / effect order can’t lose the flag */
let navigationKind: NavKind | null = null;
let historyPatched = false;
let lenisForRestore: LenisLike = null;
const restoreTimerIds = new Set<number>();
const restoreRafIds = new Set<number>();
/** While true, ignore scroll persistence so a transient jump-to-0 can’t wipe Y */
let restoreLockUntil = 0;
let restoreHeightObserver: ResizeObserver | null = null;
let restoreAnchorPrev: string | null = null;

function scrollStorageKey(pathname: string) {
  return `${SCROLL_STORAGE_PREFIX}${pathname}`;
}

function scrollPinKey(pathname: string) {
  return `${SCROLL_PIN_PREFIX}${pathname}`;
}

function readWindowScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function applyScrollY(y: number, lenis?: LenisLike) {
  const target = Math.max(0, y);
  window.scrollTo({ top: target, left: 0, behavior: "auto" });
  document.documentElement.scrollTop = target;
  document.body.scrollTop = target;
  lenis?.scrollTo(target, { immediate: true, force: true });
}

function readSavedScrollY(pathname: string) {
  try {
    /* Prefer leave-time pin — continuous scroll must not dilute it */
    const pinned = sessionStorage.getItem(scrollPinKey(pathname));
    if (pinned != null) {
      const parsedPin = Number.parseFloat(pinned);
      if (Number.isFinite(parsedPin)) return Math.max(0, parsedPin);
    }
    const raw = sessionStorage.getItem(scrollStorageKey(pathname));
    if (raw == null) return 0;
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  } catch {
    return 0;
  }
}

function saveScrollY(pathname: string, y = readWindowScrollY()) {
  if (performance.now() < restoreLockUntil) return;
  /*
   * After pushState/popstate, location updates before React pathname + before
   * scroll listeners detach. Saving then would stamp Y=0 onto the page we left.
   */
  if (pathname !== window.location.pathname) return;
  try {
    sessionStorage.setItem(scrollStorageKey(pathname), String(Math.max(0, y)));
  } catch {
    /* private mode / quota */
  }
}

/** Snapshot Y as we leave a route — restore reads this first */
function pinScrollY(pathname: string, y = readWindowScrollY()) {
  try {
    const value = String(Math.max(0, y));
    sessionStorage.setItem(scrollPinKey(pathname), value);
    sessionStorage.setItem(scrollStorageKey(pathname), value);
  } catch {
    /* private mode / quota */
  }
}

function clearRestoreTimers() {
  for (const id of restoreTimerIds) window.clearTimeout(id);
  restoreTimerIds.clear();
  for (const id of restoreRafIds) cancelAnimationFrame(id);
  restoreRafIds.clear();
}

type RestoreCancelFns = {
  onWheel: () => void;
  onTouch: () => void;
  onKey: (event: KeyboardEvent) => void;
};

let restoreCancelFns: RestoreCancelFns | null = null;

function detachRestoreCancel() {
  if (!restoreCancelFns) return;
  window.removeEventListener("wheel", restoreCancelFns.onWheel);
  window.removeEventListener("touchstart", restoreCancelFns.onTouch);
  window.removeEventListener("keydown", restoreCancelFns.onKey);
  restoreCancelFns = null;
}

function detachRestoreHeightObserver() {
  if (restoreHeightObserver) {
    restoreHeightObserver.disconnect();
    restoreHeightObserver = null;
  }
  if (restoreAnchorPrev != null) {
    document.documentElement.style.overflowAnchor = restoreAnchorPrev;
    restoreAnchorPrev = null;
  }
}

function endScrollRestore() {
  clearRestoreTimers();
  detachRestoreCancel();
  detachRestoreHeightObserver();
  restoreLockUntil = 0;
}

function scheduleRestore(pathname: string, lenis?: LenisLike) {
  const y = readSavedScrollY(pathname);
  endScrollRestore();
  if (y <= 0) return;

  restoreLockUntil = performance.now() + RESTORE_LOCK_MS;

  let cancelled = false;

  const cancelFromUser = () => {
    if (cancelled) return;
    cancelled = true;
    endScrollRestore();
  };

  const onKey = (event: KeyboardEvent) => {
    if (
      event.key === "ArrowUp" ||
      event.key === "ArrowDown" ||
      event.key === "PageUp" ||
      event.key === "PageDown" ||
      event.key === "Home" ||
      event.key === "End" ||
      event.key === " "
    ) {
      cancelFromUser();
    }
  };

  restoreCancelFns = {
    onWheel: cancelFromUser,
    onTouch: cancelFromUser,
    onKey,
  };
  window.addEventListener("wheel", cancelFromUser, { passive: true });
  window.addEventListener("touchstart", cancelFromUser, { passive: true });
  window.addEventListener("keydown", onKey);

  /* Images / expanded grids growing above must not yank scroll via anchoring */
  restoreAnchorPrev = document.documentElement.style.overflowAnchor;
  document.documentElement.style.overflowAnchor = "none";

  const restore = () => {
    if (cancelled) return;
    applyScrollY(y, lenis ?? lenisForRestore);
  };

  restore();

  const raf1 = requestAnimationFrame(() => {
    restore();
    restoreRafIds.add(requestAnimationFrame(restore));
  });
  restoreRafIds.add(raf1);

  for (const ms of RESTORE_RETRY_MS) {
    if (ms === 0) continue;
    restoreTimerIds.add(window.setTimeout(restore, ms));
  }

  /* As masonry/images increase scrollHeight, re-apply the pinned Y */
  if (typeof ResizeObserver !== "undefined") {
    let lastHeight = document.documentElement.scrollHeight;
    restoreHeightObserver = new ResizeObserver(() => {
      if (cancelled) return;
      const nextHeight = document.documentElement.scrollHeight;
      if (nextHeight === lastHeight) return;
      lastHeight = nextHeight;
      restore();
    });
    restoreHeightObserver.observe(document.documentElement);
    if (document.body) restoreHeightObserver.observe(document.body);
  }

  restoreTimerIds.add(
    window.setTimeout(() => {
      if (!cancelled) endScrollRestore();
    }, RESTORE_LOCK_MS),
  );
}

/**
 * Classify App Router history moves:
 * - pushState → forward Link / router.push → scroll top
 * - popstate → back/forward → restore saved Y
 */
function ensureHistoryScrollHooks() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;

  resetProjectsExpandOnReload();

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const origPushState = window.history.pushState.bind(window.history);
  const origReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = (data, unused, url) => {
    const fromPath = window.location.pathname;
    /* Freeze Y before Next scrolls the destination to top */
    pinScrollY(fromPath);
    navigationKind = "push";
    endScrollRestore();

    let nextPath: string | null = null;
    try {
      if (url != null) {
        nextPath = new URL(String(url), window.location.href).pathname;
      }
    } catch {
      nextPath = null;
    }

    if (nextPath === "/projects") {
      /* Nav / Link into projects — start collapsed again */
      clearAllProjectsVisibleStorage();
    }

    return origPushState(data, unused, url);
  };

  window.history.replaceState = (data, unused, url) => {
    /* Filters / Next internals — don’t force top or restore */
    return origReplaceState(data, unused, url);
  };

  window.addEventListener(
    "popstate",
    () => {
      navigationKind = "pop";
      scheduleRestore(window.location.pathname, lenisForRestore);
    },
    true,
  );

  window.addEventListener(SCROLL_RESTORE_EVENT, () => {
    scheduleRestore(window.location.pathname, lenisForRestore);
  });

  document.addEventListener(
    "click",
    (event) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (/^(mailto:|tel:|https?:)/i.test(href) && !href.startsWith("/")) {
        try {
          const url = new URL(href, window.location.href);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }
      saveScrollY(window.location.pathname);
      pinScrollY(window.location.pathname);
    },
    true,
  );
}

/**
 * Push → top. Pop → restore.
 * Scroll positions are saved continuously + right before pushState.
 */
function useRouteScrollBehavior(lenis?: LenisLike) {
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);
  const lenisRef = useRef(lenis);
  const didMountRef = useRef(false);

  pathnameRef.current = pathname;
  lenisRef.current = lenis ?? null;
  lenisForRestore = lenis ?? null;

  useEffect(() => {
    ensureHistoryScrollHooks();
  }, []);

  useEffect(() => {
    let ticking = false;

    const persist = () => {
      ticking = false;
      saveScrollY(pathnameRef.current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(persist);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    saveScrollY(pathname);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scroll", onScroll, true);
      saveScrollY(pathname);
    };
  }, [pathname]);

  useEffect(() => {
    const kind = navigationKind;
    navigationKind = null;

    if (!didMountRef.current) {
      didMountRef.current = true;
      if (kind === "pop") {
        scheduleRestore(pathname, lenisRef.current);
      }
      return;
    }

    if (kind === "pop") {
      scheduleRestore(pathname, lenisRef.current);
      return () => {
        endScrollRestore();
        saveScrollY(pathname);
      };
    }

    if (kind === "push") {
      endScrollRestore();
      applyScrollY(0, lenisRef.current);
      return () => {
        saveScrollY(pathname);
      };
    }

    return () => {
      saveScrollY(pathname);
    };
  }, [pathname]);
}

function NativeRouteScrollReset() {
  useRouteScrollBehavior(null);
  return null;
}

function LenisRouteScrollReset() {
  const lenis = useLenis();
  useRouteScrollBehavior(lenis);
  return null;
}

/**
 * Site-wide Lenis — weighted wheel on desktop only.
 * Touch stays native (no Lenis instance).
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  const [desktopWheel, setDesktopWheel] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setDesktopWheel(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  if (!desktopWheel) {
    return (
      <>
        <NativeRouteScrollReset />
        {children}
      </>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        smoothWheel: true,
        syncTouch: false,
        overscroll: false,
        autoRaf: true,
        respectReducedMotion: true,
        stopInertiaOnNavigate: true,
      }}
    >
      <LenisRouteScrollReset />
      {children}
    </ReactLenis>
  );
}
