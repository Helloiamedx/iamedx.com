"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Site-wide Lenis scroll — slight weight / drag, not sticky.
 * Honors prefers-reduced-motion via Lenis `respectReducedMotion`.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.09,
        smoothWheel: true,
        /* Touch (phone / iPad): same weighted feel as wheel */
        syncTouch: true,
        syncTouchLerp: 0.09,
        touchInertiaExponent: 1.15,
        /* No rubber-band past document end (stops footer 漏底) */
        overscroll: false,
        autoRaf: true,
        respectReducedMotion: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
