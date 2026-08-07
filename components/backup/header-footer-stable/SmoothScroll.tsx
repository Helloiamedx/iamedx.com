"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import "lenis/dist/lenis.css";

type SmoothScrollProps = {
  children: ReactNode;
};

/**
 * Site-wide Lenis — weighted wheel on desktop only.
 * Touch stays native: syncTouch + low lerp makes phones feel stuck.
 * Honors prefers-reduced-motion via Lenis `respectReducedMotion`.
 */
export function SmoothScroll({ children }: SmoothScrollProps) {
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
      }}
    >
      {children}
    </ReactLenis>
  );
}
