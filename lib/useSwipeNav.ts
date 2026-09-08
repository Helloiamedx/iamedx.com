"use client";

import { useEffect, type RefObject } from "react";

type SwipeDir = -1 | 1;

/**
 * Horizontal swipe on `ref` → `onSwipe(-1 | 1)` (left = next / +1).
 * Ignores mostly-vertical gestures.
 */
export function useSwipeNav(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (dir: SwipeDir) => void,
  enabled = true,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const thresholdPx = 48;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    const onStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = true;
    };

    const onEnd = (event: TouchEvent) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      if (Math.abs(dx) < thresholdPx || Math.abs(dx) <= Math.abs(dy)) return;
      onSwipe(dx < 0 ? 1 : -1);
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, onSwipe, enabled]);
}
