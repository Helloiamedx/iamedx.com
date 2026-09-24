"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from "react";

/**
 * APPLE CARD REVEAL — the staggered rise from Apple's product pages.
 *
 * Ported from the standalone script the author supplied. The timings, easing
 * and per-row stagger are the authored ones and are not to be retuned:
 *
 *   stagger 150ms · travel 30px · move 700ms · fade 900ms · trigger 85%
 *   easing `easeInOutQuad` — the exact curve the original used
 *
 * Two deliberate departures from that script:
 *
 * 1. **Per card, not per group.** The original arms a *group* and fires every
 *    item when the group's top crosses 85% of the viewport. On a tall grid that
 *    runs the whole list the moment its first row is reached, so the rows below
 *    the fold animate unseen. Here each card is watched on its own: it rises
 *    when the reader scrolls to it, and only cards sharing a row are staggered
 *    relative to each other. A single-row rail behaves exactly as before — its
 *    cards share one row, so they still cascade 0 / 150 / 300 …
 * 2. **Cards added later are picked up.** A list that grows after mount (the
 *    projects index “See more” button) appends cards that were never in the
 *    initial query. A `MutationObserver` stages each new card and feeds it to
 *    the same per-card trigger, so the expansion animates too. Pass `selector`
 *    to enable this; without it the module watches only what it was given.
 *
 * How this differs from the archived C01–C06 port (`backups/card-motion/`, not
 * wired to the site — `lib/cardMotion.ts` was removed once this replaced it):
 *
 * - It drives every item from one `requestAnimationFrame` loop with plain
 *   inline styles, instead of Web Animations keyframes.
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

/**
 * `useLayoutEffect` warns during server rendering, and this module is imported
 * into client components that are still SSR'd.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** The authored curve. */
function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

type SavedProp = { name: string; value: string; priority: string };
type RevealItem = {
  el: HTMLElement;
  saved: SavedProp[];
  /** Milliseconds this item waits behind its own row's first card. */
  delayMs: number;
};

/**
 * Delay per item, measured from the front of its own row.
 *
 * Rows are read from layout, not from a fixed column count, so a grid that
 * reflows — three columns, two on a tablet, one on a phone — keeps the cascade
 * reading left to right within whatever row the reader is looking at. Cards in
 * different rows share a delay of 0 and are driven by their own scroll trigger
 * instead.
 *
 * Grouping is by viewport top rather than `offsetTop`: the projects index
 * interleaves collection blocks, so cards can sit under different offset
 * parents and `offsetTop` would not compare across them. Rounded to 4px to
 * absorb sub-pixel differences within one row — rows are hundreds of px apart,
 * so nothing adjacent is ever merged.
 */
function rowDelays(items: readonly HTMLElement[], stagger: number): number[] {
  const rows = new Map<
    number,
    { el: HTMLElement; left: number; index: number }[]
  >();

  items.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    const key = Math.round(rect.top / 4);
    const entry = { el, left: rect.left, index };
    const row = rows.get(key);
    if (row) row.push(entry);
    else rows.set(key, [entry]);
  });

  const delays = new Array<number>(items.length).fill(0);
  rows.forEach((row) => {
    row
      .slice()
      .sort((a, b) => a.left - b.left)
      .forEach((entry, position) => {
        delays[entry.index] = position * stagger;
      });
  });
  return delays;
}

export type AppleRevealOptions = {
  /**
   * Fade items in as they rise. `false` leaves opacity entirely to CSS — the
   * rise still runs, which is what the dimming carousels need.
   */
  fade?: boolean;
  /** Milliseconds between cards of the same row. */
  stagger?: number;
  /** Travel distance in px. */
  distance?: number;
  /** Milliseconds for one item's movement. */
  moveMs?: number;
  /** Milliseconds for one item's fade. */
  fadeMs?: number;
  /** Share of the viewport height a card's top must cross to fire (0–1). */
  trigger?: number;
  /**
   * CSS selector for the cards under `root`. Supplying it lets the module pick
   * up cards appended after mount (see the note at the top). Without it only
   * the items passed in are revealed.
   */
  selector?: string;
};

export type AppleRevealController = {
  /** Hand back current values, re-arm and play again from the start. */
  replay: () => void;
  /**
   * Stage any cards under the root that have appeared since the last pass.
   *
   * Called by the React wrapper from a layout effect after every render, so a
   * list that grew — “See more projects”, a filter swap — has its new cards
   * posed *before the browser paints them at their resting state*. The
   * `MutationObserver` covers the same ground for imperative callers that have
   * no render pass to hook into; `tracked` keeps the two from double-handling.
   */
  collect: () => void;
  /** Cancel, release the observer and restore every inline value. */
  destroy: () => void;
};

/**
 * Prepare a set of cards and return the controller.
 *
 * `root` is the group's element (it carries `data-apple-reveal` and the
 * `is-revealing` class); `items` are the cards that rise. Both must already be
 * in the DOM, and React must not write `opacity` / `transform` on the items
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
  const selector = options.selector;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let destroyed = false;
  let frame = 0;
  let listening = false;
  let observer: MutationObserver | undefined;
  /** Every card the module has staged, so re-collects never double-handle one. */
  const tracked = new Set<HTMLElement>();
  /** Cards that still hold staged inline styles — what `settleAll` restores. */
  const staged = new Map<HTMLElement, RevealItem>();
  /** Cards waiting for the scroll to reach them. */
  let pending: RevealItem[] = [];
  /**
   * Cards on the move: element → its item and the timestamp the animation is
   * due to start (which may be slightly in the future, for the row stagger).
   */
  const active = new Map<HTMLElement, { item: RevealItem; startAt: number }>();

  /**
   * Opening pose: offset down by `distance`, transparent when fading.
   *
   * Deliberately no `will-change` here. Cards can wait a long time for their
   * scroll trigger, and promoting every waiting card hands the compositor a
   * layer per card at once — on a “See more” expansion that is a batch of tall
   * image cards. The layer is taken when the card actually starts moving (see
   * `check`) and given back on settle.
   */
  function stage(item: RevealItem) {
    item.el.style.transform = `translate3d(0, ${distance}px, 0)`;
    if (fade) item.el.style.opacity = "0";
  }

  /** Hand every inline value back, so CSS owns the card again. */
  function settleItem(item: RevealItem) {
    item.saved.forEach(({ name, value, priority }) => {
      if (value) item.el.style.setProperty(name, value, priority);
      else item.el.style.removeProperty(name);
    });
    staged.delete(item.el);
    active.delete(item.el);
  }

  function settleAll() {
    Array.from(staged.values()).forEach(settleItem);
    pending = [];
    root.classList.remove(REVEALING_CLASS);
  }

  function stop() {
    if (!frame) return;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function attach() {
    if (listening) return;
    listening = true;
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
  }

  function detach() {
    if (!listening) return;
    listening = false;
    window.removeEventListener("scroll", check);
    window.removeEventListener("resize", check);
  }

  /** Drop the module's own markup — attributes, not values. */
  function release() {
    stop();
    detach();
    observer?.disconnect();
    observer = undefined;
    root.removeAttribute(ROOT_ATTR);
    tracked.forEach((el) => el.removeAttribute(ITEM_ATTR));
  }

  function tick(now: number) {
    frame = 0;

    active.forEach(({ item, startAt }, el) => {
      const elapsed = now - startAt;
      /* Row stagger may not have come due yet — leave it in its opening pose. */
      if (elapsed < 0) return;

      const move = easeInOutQuad(clamp01(elapsed / moveMs));
      const fadeT = easeInOutQuad(clamp01(elapsed / fadeMs));

      el.style.transform = `translate3d(0, ${distance * (1 - move)}px, 0)`;
      if (fade) el.style.opacity = String(fadeT);

      /*
       * The authored tail is the fade length. Taking the longer of the two
       * keeps that identical at the authored values while still letting a
       * caller set a move longer than the fade without stranding the last item
       * mid-flight.
       */
      if (elapsed >= Math.max(moveMs, fadeMs)) settleItem(item);
    });

    if (active.size) {
      frame = requestAnimationFrame(tick);
      return;
    }
    /* Everything on screen has landed. Nothing pending? The guard can go too. */
    if (!pending.length) root.classList.remove(REVEALING_CLASS);
  }

  /** Start whichever cards the reader has scrolled to. */
  function check() {
    if (destroyed || reduced.matches || !pending.length) return;

    const limit = window.innerHeight * triggerRatio;
    const now = performance.now();

    pending = pending.filter((item) => {
      if (item.el.getBoundingClientRect().top > limit) return true;
      /* Compositor layer only for the cards that are actually moving now. */
      item.el.style.willChange = "opacity, transform";
      active.set(item.el, { item, startAt: now + item.delayMs });
      return false;
    });

    if (active.size && !frame) frame = requestAnimationFrame(tick);
    if (!pending.length) detach();
  }

  /**
   * Stage every card under `root` the module has not handled yet.
   *
   * Called once on attach, again whenever the tree gains nodes, and again on
   * replay. Re-querying the DOM (rather than trusting the initial `items`)
   * is what lets an expanding list — “See more” — animate its new cards.
   */
  function collect() {
    const found = (
      selector
        ? Array.from(root.querySelectorAll<HTMLElement>(selector))
        : items.filter((el) => root.contains(el))
    ).filter((el) => !tracked.has(el));

    if (!found.length) return;

    const delays = rowDelays(found, stagger);
    const added: RevealItem[] = found.map((el, index) => ({
      el,
      saved: TRACKED_PROPS.map((name) => ({
        name,
        value: el.style.getPropertyValue(name),
        priority: el.style.getPropertyPriority(name),
      })),
      delayMs: delays[index] ?? 0,
    }));

    found.forEach((el) => tracked.add(el));

    /* Guard first: it must be in place before any card carries the pose. */
    root.setAttribute(ROOT_ATTR, "");
    root.classList.add(REVEALING_CLASS);

    added.forEach((item) => {
      item.el.setAttribute(ITEM_ATTR, "");
      staged.set(item.el, item);
      stage(item);
    });

    pending = pending.concat(added);
    attach();
    check();
  }

  /** Watch for cards appended later (filter swaps, “See more” expansions). */
  function observe() {
    if (!selector || typeof MutationObserver === "undefined") return;
    observer = new MutationObserver((records) => {
      if (destroyed) return;
      const gained = records.some((record) => record.addedNodes.length > 0);
      if (!gained) return;
      /* Dropped cards would otherwise sit in `pending` forever. */
      pending = pending.filter((item) => item.el.isConnected);
      collect();
    });
    observer.observe(root, { childList: true, subtree: true });
  }

  /** Stage everything currently in the tree and wait for the scroll. */
  function arm() {
    if (destroyed || reduced.matches) return;
    collect();
    observe();
  }

  function replay() {
    if (destroyed) return;
    stop();
    settleAll();
    active.clear();
    tracked.clear();
    observer?.disconnect();
    observer = undefined;
    arm();
  }

  /** Enter, or re-enter, reduced motion: land everything on its resting state. */
  function onReducedChange(event: MediaQueryListEvent) {
    if (!event.matches) return;
    settleAll();
    release();
  }

  reduced.addEventListener("change", onReducedChange);
  arm();

  return {
    replay,
    collect() {
      if (destroyed || reduced.matches) return;
      collect();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      reduced.removeEventListener("change", onReducedChange);
      settleAll();
      release();
      tracked.clear();
      active.clear();
    },
  };
}

/**
 * React wrapper. Collects the cards inside `rootRef` on mount and reveals each
 * one as it is scrolled to; tears the controller down on unmount or when the
 * selector or any option changes.
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

  useIsomorphicLayoutEffect(() => {
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
        selector,
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

  /*
   * No dependency array on purpose: this runs after every render of the owner,
   * which is exactly when a list can have gained cards. `collect()` is a no-op
   * when nothing new sits under the root, and running it here — a layout effect
   * — poses those cards before the browser paints them at their resting state.
   */
  useIsomorphicLayoutEffect(() => {
    controllerRef.current?.collect();
  });

  return controllerRef;
}
