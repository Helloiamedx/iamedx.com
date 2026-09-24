"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * APPLE CARD REVEAL — the staggered rise from Apple's product pages.
 *
 * Ported from the standalone script the author supplied. The timings, easing
 * and trigger are the authored ones and are not to be retuned:
 *
 *   stagger 150ms · travel 30px · move 700ms · fade 900ms · trigger 85%
 *   easing `easeInOutQuad` — the exact curve the original used
 *
 * How this differs from the archived C01–C06 port (`backups/card-motion/`, not
 * wired to the site — `lib/cardMotion.ts` was removed once this replaced it):
 *
 * - It drives every item from one `requestAnimationFrame` loop with plain
 *   inline styles, instead of Web Animations keyframes.
 * - The group starts from a single trigger — the group's own top crossing 85%
 *   of the viewport height — instead of a per-card intersection ratio.
 * - While attached, items carry `data-reveal-item` inside a `data-apple-reveal`
 *   root. That is the hook the `is-revealing` transition guard in
 *   `app/globals.css` keys off, so a card's existing CSS transition can never
 *   interpolate between the frames this loop writes.
 *
 * Ownership: while attached the module owns each item's inline `opacity`,
 * `transform` and `will-change`. Original inline values are captured on attach
 * and handed back on settle or destroy — which is what makes `fade: false`
 * safe on cards whose opacity belongs to CSS (the Recognition carousel dims
 * off-focus cards to 0.55; fading them to 1 would snap back on settle).
 *
 * Reduced motion skips the whole thing: nothing is staged, so the cards simply
 * render at rest.
 */

const STAGGER_MS = 150;
const DISTANCE_PX = 30;
const MOVE_MS = 700;
const FADE_MS = 900;
const TRIGGER_RATIO = 0.85;

const ROOT_ATTR = "data-apple-reveal";
const ITEM_ATTR = "data-reveal-item";
const REVEALING_CLASS = "is-revealing";
/** Inline properties the loop writes, and therefore has to hand back. */
const TRACKED_PROPS = ["opacity", "transform", "will-change"] as const;

/** The authored curve. */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

type SavedProp = { name: string; value: string; priority: string };
type RevealItem = { el: HTMLElement; saved: SavedProp[] };

export type AppleRevealOptions = {
  /**
   * Fade items in as they rise. `false` leaves opacity entirely to CSS — the
   * rise still runs, which is what the dimming carousels need.
   */
  fade?: boolean;
  /** Milliseconds between items. */
  stagger?: number;
  /** Travel distance in px. */
  distance?: number;
  /** Milliseconds for one item's movement. */
  moveMs?: number;
  /** Milliseconds for one item's fade. */
  fadeMs?: number;
  /** Share of the viewport height the group's top must cross to fire (0–1). */
  trigger?: number;
};

export type AppleRevealController = {
  /** Hand back current values, re-arm and play again from the start. */
  replay: () => void;
  /** Cancel, release the observer and restore every inline value. */
  destroy: () => void;
};

/**
 * Prepare a group and return its controller.
 *
 * `root` is the group's own element (it carries `data-apple-reveal` and the
 * `is-revealing` class); `items` are the elements that rise. Both must already
 * be in the DOM, and React must not write `opacity` / `transform` on the items
 * itself while this is attached.
 */
export function applyAppleCardReveal(
  root: HTMLElement,
  items: readonly HTMLElement[],
  options: AppleRevealOptions = {},
): AppleRevealController {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("applyAppleCardReveal is browser-only.");
  }

  const fade = options.fade ?? true;
  const stagger = options.stagger ?? STAGGER_MS;
  const distance = options.distance ?? DISTANCE_PX;
  const moveMs = options.moveMs ?? MOVE_MS;
  const fadeMs = options.fadeMs ?? FADE_MS;
  const triggerRatio = options.trigger ?? TRIGGER_RATIO;

  const revealItems: RevealItem[] = items.map((el) => ({
    el,
    saved: TRACKED_PROPS.map((name) => ({
      name,
      value: el.style.getPropertyValue(name),
      priority: el.style.getPropertyPriority(name),
    })),
  }));

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let destroyed = false;
  /** Waiting for the trigger. */
  let armed = false;
  let frame = 0;
  let start = 0;

  /** Opening pose: offset down by `distance`, transparent when fading. */
  function stage() {
    revealItems.forEach(({ el }) => {
      if (fade) el.style.opacity = "0";
      el.style.transform = `translate3d(0, ${distance}px, 0)`;
      el.style.willChange = "opacity, transform";
    });
  }

  /** Hand every inline value back, so CSS owns the item again. */
  function settle() {
    revealItems.forEach(({ el, saved }) => {
      saved.forEach(({ name, value, priority }) => {
        if (value) el.style.setProperty(name, value, priority);
        else el.style.removeProperty(name);
      });
    });
    root.classList.remove(REVEALING_CLASS);
  }

  function stop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function detach() {
    window.removeEventListener("scroll", check);
    window.removeEventListener("resize", check);
  }

  /** Drop the module's own markup — attributes, not values. */
  function release() {
    stop();
    detach();
    root.removeAttribute(ROOT_ATTR);
    revealItems.forEach(({ el }) => el.removeAttribute(ITEM_ATTR));
  }

  function tick(now: number) {
    frame = 0;
    const elapsed = now - start;

    revealItems.forEach(({ el }, index) => {
      /* Item 0 is the headline's neighbour — the group's first card. */
      const time = elapsed - index * stagger;
      const move = easeInOutQuad(clamp01(time / moveMs));
      const fadeT = easeInOutQuad(clamp01(time / fadeMs));

      el.style.transform = `translate3d(0, ${distance * (1 - move)}px, 0)`;
      if (fade) el.style.opacity = String(fadeT);
    });

    /*
     * The authored tail is the fade length. Taking the longer of the two keeps
     * that identical at the authored values while still letting a caller set a
     * move longer than the fade without stranding the last item mid-flight.
     */
    const tail = Math.max(moveMs, fadeMs);
    if (elapsed >= (revealItems.length - 1) * stagger + tail) {
      settle();
      return;
    }

    frame = requestAnimationFrame(tick);
  }

  function check() {
    if (destroyed || !armed) return;
    if (root.getBoundingClientRect().top > window.innerHeight * triggerRatio) {
      return;
    }
    armed = false;
    detach();
    start = performance.now();
    frame = requestAnimationFrame(tick);
  }

  /** Stage the opening pose and wait for the trigger. */
  function arm() {
    if (destroyed || reduced.matches) return;

    root.setAttribute(ROOT_ATTR, "");
    revealItems.forEach(({ el }) => el.setAttribute(ITEM_ATTR, ""));
    root.classList.add(REVEALING_CLASS);
    stage();

    armed = true;
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    check();
  }

  function replay() {
    if (destroyed) return;
    stop();
    settle();
    arm();
  }

  /** Enter, or re-enter, reduced motion: land everything on its resting state. */
  function onReducedChange(event: MediaQueryListEvent) {
    if (!event.matches) return;
    armed = false;
    settle();
    release();
  }

  reduced.addEventListener("change", onReducedChange);
  arm();

  return {
    replay,
    destroy() {
      if (destroyed) return;
      destroyed = true;
      armed = false;
      reduced.removeEventListener("change", onReducedChange);
      settle();
      release();
    },
  };
}

/**
 * React wrapper. Collects the items inside `rootRef` on mount and reveals them
 * as one group; tears the controller down on unmount or when the selector or
 * any option changes.
 *
 * ```tsx
 * useAppleCardReveal(sectionRef, ".home-different__feature");
 * useAppleCardReveal(sectionRef, ".home-recognition__card", { fade: false });
 * ```
 */
export function useAppleCardReveal(
  rootRef: RefObject<Element | null>,
  selector: string,
  options: AppleRevealOptions = {},
): RefObject<AppleRevealController | null> {
  const controllerRef = useRef<AppleRevealController | null>(null);
  const { fade, stagger, distance, moveMs, fadeMs, trigger } = options;

  useEffect(() => {
    const root = rootRef.current;
    if (!(root instanceof HTMLElement)) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>(selector));
    if (!items.length) return;

    try {
      controllerRef.current = applyAppleCardReveal(root, items, {
        fade,
        stagger,
        distance,
        moveMs,
        fadeMs,
        trigger,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[useAppleCardReveal]", error);
      }
      controllerRef.current = null;
    }

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [rootRef, selector, fade, stagger, distance, moveMs, fadeMs, trigger]);

  return controllerRef;
}
