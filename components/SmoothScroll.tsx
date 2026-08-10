"use client";

import { ReactLenis, useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import "lenis/dist/lenis.css";

type SmoothScrollProps = {
  children: ReactNode;
};

/** Native + document scroll to top — used when Lenis is not mounted (touch). */
function NativeRouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}

/** Kill Lenis inertia and snap to top on every App Router navigation. */
function LenisRouteScrollReset() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    lenis?.scrollTo(0, { immediate: true });
  }, [pathname, lenis]);

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
