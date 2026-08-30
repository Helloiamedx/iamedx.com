"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  clearAllProjectsVisibleStorage,
  clearProjectsExpandRestore,
  markProjectsExpandRestore,
} from "@/lib/projectsListRestore";
import "lenis/dist/lenis.css";

type SmoothScrollProps = {
  children: ReactNode;
};

const SCROLL_STORAGE_PREFIX = "iamedx:scroll:";

/** Re-apply restore after images / “See more” grids settle */
const RESTORE_RETRY_MS = [0, 32, 80, 160, 320, 640, 1200, 2000, 3200] as const;

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

function scrollStorageKey(pathname: string) {
  return `${SCROLL_STORAGE_PREFIX}${pathname}`;
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
  try {
    sessionStorage.setItem(scrollStorageKey(pathname), String(Math.max(0, y)));
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

function scheduleRestore(pathname: string, lenis?: LenisLike) {
  const y = readSavedScrollY(pathname);
  clearRestoreTimers();
  restoreLockUntil = performance.now() + 3600;

  const restore = () => applyScrollY(y, lenis ?? lenisForRestore);
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

  restoreTimerIds.add(
    window.setTimeout(() => {
      restoreLockUntil = 0;
    }, 3600),
  );
}

/**
 * Classify App Router history moves:
 * - pushState → forward Link / router.push → scroll top
 * - popstate → back/forward → restore saved Y
 *
 * Relying only on a React effect + popstate flag races Next’s pathname
 * update and wrongly treats back as a fresh page (jump to top).
 */
function ensureHistoryScrollHooks() {
  if (historyPatched || typeof window === "undefined") return;
  historyPatched = true;

  if ("scrollRestoration" in window.history) {
    window.history.scrollRestoration = "manual";
  }

  const origPushState = window.history.pushState.bind(window.history);
  const origReplaceState = window.history.replaceState.bind(window.history);

  window.history.pushState = (data, unused, url) => {
    /* Location is still the page we’re leaving */
    saveScrollY(window.location.pathname);
    navigationKind = "push";
    clearRestoreTimers();
    clearProjectsExpandRestore();
    try {
      if (url != null) {
        const next = new URL(String(url), window.location.href);
        if (next.pathname === "/projects") {
          /* Nav / Link into projects — start collapsed again */
          clearAllProjectsVisibleStorage();
        }
      }
    } catch {
      /* ignore bad urls */
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
      if (window.location.pathname === "/projects") {
        markProjectsExpandRestore();
      } else {
        clearProjectsExpandRestore();
      }
      /* Location already matches the destination */
      scheduleRestore(window.location.pathname, lenisForRestore);
    },
    true,
  );

  /* Belt-and-suspenders: persist before internal navigations */
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

  /* Keep sessionStorage warm while the user scrolls this route */
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
        clearRestoreTimers();
        saveScrollY(pathname);
      };
    }

    if (kind === "push") {
      clearRestoreTimers();
      applyScrollY(0, lenisRef.current);
      return () => {
        saveScrollY(pathname);
      };
    }

    /* replaceState / unknown — leave scroll where it is */
    return () => {
      saveScrollY(pathname);
    };
  }, [pathname]);
}

/** Native + document scroll — used when Lenis is not mounted (touch). */
function NativeRouteScrollReset() {
  useRouteScrollBehavior(null);
  return null;
}

/** Keep Lenis in sync with push → top / pop → restore. */
function LenisRouteScrollReset() {
  const lenis = useLenis();
  useRouteScrollBehavior(lenis);
  return null;
}

/**
 * Site-wide Lenis — weighted wheel on desktop only.
 * Touch stays native (no Lenis instance): syncTouch + low lerp feels stuck,
 * and Lenis’ html.lenis height rules can interact badly with mobile Chrome.
 * Honors prefers-reduced-motion via Lenis `respectReducedMotion`.
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
        /* No rubber-band past document end (stops footer 漏底) */
        overscroll: false,
        autoRaf: true,
        respectReducedMotion: true,
        /* Stop wheel lerp before Next resets scrollTop on <Link> navigations */
        stopInertiaOnNavigate: true,
      }}
    >
      <LenisRouteScrollReset />
      {children}
    </ReactLenis>
  );
}
