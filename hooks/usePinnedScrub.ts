"use client";

import { useEffect, useState, type RefObject } from "react";

type UsePinnedScrubOptions = {
  trackRef: RefObject<HTMLElement | null>;
  /** When false (e.g. reduced motion), progress stays 0 and listeners are off. */
  enabled?: boolean;
};

/**
 * Sticky scrub progress for tall pin tracks.
 * Progress follows scroll both ways (down advances, up reverses).
 * No latch, no height collapse, no programmatic scroll.
 */
export function usePinnedScrub({
  trackRef,
  enabled = true,
}: UsePinnedScrubOptions): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setProgress(0);
      return;
    }

    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    let lockedRange = 0;
    let lockedWidth = window.innerWidth;

    const resetRange = () => {
      lockedRange = 0;
      lockedWidth = window.innerWidth;
    };

    const paint = () => {
      raf = 0;
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;

      if (window.innerWidth !== lockedWidth) {
        resetRange();
      }

      // Lock scrub range while pinned so mobile URL-bar show/hide cannot jump progress.
      const inPin = rect.top <= 0 && rect.bottom > vh;
      if (inPin && !lockedRange) {
        lockedRange = Math.max(1, track.offsetHeight - vh);
      }
      if (!inPin && rect.top > 0) {
        lockedRange = 0;
      }

      const range = lockedRange || Math.max(1, track.offsetHeight - vh);
      const next = Math.min(1, Math.max(0, -rect.top / range));
      setProgress((prev) => (Math.abs(prev - next) < 1e-4 ? prev : next));
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [trackRef, enabled]);

  return progress;
}
