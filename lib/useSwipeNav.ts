"use client";

import { useEffect, useRef, type RefObject } from "react";

type SwipeDir = -1 | 1;

type SwipeNavOptions = {
  /** Handle touchstart/touchend travel. Native rails that already scroll on
   *  touch should turn this off — re-issuing a step would double-advance. */
  touch?: boolean;
  /** Handle trackpad / wheel gestures. */
  wheel?: boolean;
};

/** Touch: minimum travel before a gesture counts */
const TOUCH_THRESHOLD_PX = 48;
/**
 * Trackpad: accumulated horizontal delta for one step.
 * Deliberately large — a single two-finger flick (fingers + momentum) can total
 * several hundred px, so a small threshold gets crossed twice by one flick.
 */
const WHEEL_THRESHOLD_PX = 120;
/** Wheel stream counts as finished after this much silence */
const WHEEL_IDLE_MS = 100;
/**
 * Momentum tail is over once deltas decay below this — a reliable “fingers are
 * gone” signal that re-arms without waiting out a long tail.
 */
const WHEEL_TAIL_END_PX = 5;
/** Last-resort re-arm so a pathological event stream can never lock the rail */
const WHEEL_MAX_SUPPRESS_MS = 900;
/** Line / page delta modes → pixels (trackpads report pixels) */
const LINE_HEIGHT_PX = 16;
const PAGE_HEIGHT_PX = 100;

/**
 * Horizontal swipe on `ref` → `onSwipe(-1 | 1)`.
 *
 * Handles both input families:
 * - **Touch** — touchstart/touchend travel (48px), ignores mostly-vertical drags.
 * - **Trackpad / wheel** — accumulates `deltaX` across a wheel burst, the same
 *   gesture a native overflow-x scroller would use. Mostly-vertical wheel
 *   streams are left alone so the page keeps scrolling; only an owned horizontal
 *   gesture is `preventDefault`ed (stops overscroll back/forward swipe).
 *
 * One flick = one step. After firing, the hook stays suppressed for the rest of
 * that gesture (macOS keeps sending a decaying momentum tail after the fingers
 * lift). It re-arms on whichever comes first:
 *
 * 1. deltas decay below `WHEEL_TAIL_END_PX` (tail is essentially done),
 * 2. the stream is silent for `WHEEL_IDLE_MS`,
 * 3. `WHEEL_MAX_SUPPRESS_MS` has elapsed (never lock the rail).
 *
 * Direction matches native scroll: pushing content left → `+1` (next).
 *
 * Prefer a native `overflow-x` rail for touch; use this for trackpad. Pair the
 * target with `data-lenis-prevent-horizontal`, otherwise Lenis still scrolls the
 * page by the gesture's vertical component and the rail drifts up/down.
 */
export function useSwipeNav(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (dir: SwipeDir) => void,
  enabled = true,
  options: SwipeNavOptions = {},
) {
  /**
   * Latest callback without re-subscribing — a re-run mid-gesture would drop the
   * accumulated wheel delta and re-add listeners on every index change.
   */
  const onSwipeRef = useRef(onSwipe);
  onSwipeRef.current = onSwipe;

  const { touch = true, wheel = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || (!touch && !wheel)) return;

    /* —— Touch —— */
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
      if (Math.abs(dx) < TOUCH_THRESHOLD_PX || Math.abs(dx) <= Math.abs(dy)) {
        return;
      }
      onSwipeRef.current(dx < 0 ? 1 : -1);
    };

    /* —— Trackpad / wheel —— */
    let acc = 0;
    let suppressed = false;
    let idleTimer = 0;
    let suppressTimer = 0;

    const rearm = () => {
      suppressed = false;
      acc = 0;
      window.clearTimeout(suppressTimer);
    };

    const onWheel = (event: WheelEvent) => {
      /* Pinch-zoom arrives as a wheel + ctrlKey — never a swipe */
      if (event.ctrlKey) return;

      let dx = event.deltaX;
      let dy = event.deltaY;
      if (event.deltaMode === 1) {
        dx *= LINE_HEIGHT_PX;
        dy *= LINE_HEIGHT_PX;
      } else if (event.deltaMode === 2) {
        dx *= PAGE_HEIGHT_PX;
        dy *= PAGE_HEIGHT_PX;
      }

      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      /* Mostly-vertical (or noise) → belongs to the page, not this rail */
      if (ax < 1 || ax <= ay) return;

      /* Owned gesture: block overscroll / two-finger history swipe */
      if (event.cancelable) event.preventDefault();

      /* Tail has decayed to nothing — the next real event starts fresh */
      if (suppressed && ax < WHEEL_TAIL_END_PX) rearm();

      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(rearm, WHEEL_IDLE_MS);

      if (suppressed) return;

      acc += dx;
      if (Math.abs(acc) < WHEEL_THRESHOLD_PX) return;

      const dir: SwipeDir = acc > 0 ? 1 : -1;
      acc = 0;
      suppressed = true;
      window.clearTimeout(suppressTimer);
      suppressTimer = window.setTimeout(rearm, WHEEL_MAX_SUPPRESS_MS);
      onSwipeRef.current(dir);
    };

    if (wheel) {
      el.addEventListener("wheel", onWheel, { passive: false });
    }
    if (touch) {
      el.addEventListener("touchstart", onStart, { passive: true });
      el.addEventListener("touchend", onEnd, { passive: true });
    }
    return () => {
      if (touch) {
        el.removeEventListener("touchstart", onStart);
        el.removeEventListener("touchend", onEnd);
      }
      if (wheel) el.removeEventListener("wheel", onWheel);
      window.clearTimeout(idleTimer);
      window.clearTimeout(suppressTimer);
    };
  }, [ref, enabled, touch, wheel]);
}
