"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import "lenis/dist/lenis.css";

type SmoothScrollProps = {
  children: ReactNode;
};

const SCROLL_STORAGE_PREFIX = "iamedx:scroll:";

function scrollStorageKey(pathname: string) {
  return `${SCROLL_STORAGE_PREFIX}${pathname}`;
}

function readWindowScrollY() {
  return window.scrollY || document.documentElement.scrollTop || 0;
}

function applyScrollY(
  y: number,
  lenis?: { scrollTo: (value: number, opts?: { immediate?: boolean }) => void } | null,
) {
  const target = Math.max(0, y);
  window.scrollTo(0, target);
  document.documentElement.scrollTop = target;
  document.body.scrollTop = target;
  lenis?.scrollTo(target, { immediate: true });
}

/**
 * Push navigations → top.
 * Back/forward (popstate) → restore the saved position for that pathname.
 * Next App Router uses manual scroll restoration, so we own both behaviors.
 */
function useRouteScrollBehavior(
  lenis?: { scrollTo: (value: number, opts?: { immediate?: boolean }) => void } | null,
) {
  const pathname = usePathname();
  const isPopRef = useRef(false);

  useEffect(() => {
    const onPopState = () => {
      isPopRef.current = true;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const key = scrollStorageKey(pathname);
    const isPop = isPopRef.current;
    isPopRef.current = false;

    if (isPop) {
      const raw = sessionStorage.getItem(key);
      const parsed = raw == null ? 0 : Number.parseFloat(raw);
      const y = Number.isFinite(parsed) ? parsed : 0;

      applyScrollY(y, lenis);
      const raf1 = requestAnimationFrame(() => {
        applyScrollY(y, lenis);
        requestAnimationFrame(() => applyScrollY(y, lenis));
      });
      /* Filter grids / media can shift height after first paint */
      const timeoutId = window.setTimeout(() => applyScrollY(y, lenis), 120);

      return () => {
        cancelAnimationFrame(raf1);
        window.clearTimeout(timeoutId);
        sessionStorage.setItem(key, String(readWindowScrollY()));
      };
    }

    applyScrollY(0, lenis);

    return () => {
      sessionStorage.setItem(key, String(readWindowScrollY()));
    };
  }, [pathname, lenis]);
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
