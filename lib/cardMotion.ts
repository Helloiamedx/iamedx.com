"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * CARD MOTION — the six card entrance effects.
 *
 * Ported from the archived ChatGPT widget script
 * (`backups/card-motion/card-entrance.js`). Every id, name, offset, duration,
 * stagger and easing is preserved — do not retune them.
 *
 *   | #   | name       | id            | motion                                             |
 *   |-----|------------|---------------|----------------------------------------------------|
 *   | C01 | 整组轻升   | group-rise    | all together, up 28px, 1000ms                       |
 *   | C02 | 错峰上浮   | stagger-rise  | up 36px, 1000ms, stagger 120ms                      |
 *   | C03 | 缩放落定   | scale-settle  | scale(.94) translateY(12px) → rest, 1150ms, +100ms  |
 *   | C04 | 横向滑入   | slide-in      | from translateX(56px), 1050ms, +130ms               |
 *   | C05 | 微倾归位   | tilt-settle   | translateY(30px) rotateX(7deg) scale(.98) → rest    |
 *   | C06 | 卡片先行   | card-first    | card 24px/900ms, text +220ms, art blur +300ms       |
 *
 * Shared: leading delay 140ms · easing `cubic-bezier(.22,1,.36,1)` ·
 * `fill: 'both'` · `speed` 0.5×–1.5× scaling both duration and delay ·
 * `prefers-reduced-motion` skips the motion entirely.
 *
 * Two adaptations the archived script could not need:
 *
 * 1. **Resting opacity.** Several site cards already manage their own opacity
 *    (the Recognition carousel dims unfocused cards to 0.55). A hard-coded
 *    fade to `1` would snap back on settle, so each card's resting opacity is
 *    captured before the first run and used as the fade target. Set
 *    `fade: false` to leave opacity entirely to CSS.
 * 2. **Hide until first play.** Without it a below-the-fold section shows the
 *    cards at rest, then jumps them down and replays the rise. Cards stay
 *    `visibility: hidden` until the entrance fires; reduced motion and
 *    `trigger: "manual"` skip that so nothing can get stuck hidden.
 */

export const CARD_EFFECTS = Object.freeze({
  C01: Object.freeze({ name: "整组轻升", id: "group-rise" }),
  C02: Object.freeze({ name: "错峰上浮", id: "stagger-rise" }),
  C03: Object.freeze({ name: "缩放落定", id: "scale-settle" }),
  C04: Object.freeze({ name: "横向滑入", id: "slide-in" }),
  C05: Object.freeze({ name: "微倾归位", id: "tilt-settle" }),
  C06: Object.freeze({ name: "卡片先行", id: "card-first" }),
});

export type CardEffectId = keyof typeof CARD_EFFECTS;
export type CardEffectMeta = (typeof CARD_EFFECTS)[CardEffectId];
/** `"C04"` · `"横向滑入"` · `"slide-in"` all resolve to the same effect. */
export type CardEffectKey =
  | CardEffectId
  | CardEffectMeta["name"]
  | CardEffectMeta["id"];

export type CardTrigger = "view" | "immediate" | "manual";

export type CardMotionOptions = {
  /** `1` = authored speed. `0.5`–`1.5`, scaling duration and delay. */
  speed?: number;
  /** `view` (default) plays once on scroll-in, `immediate` on attach, `manual` on demand. */
  trigger?: CardTrigger;
  /** Fade cards in with the motion. `false` leaves opacity to CSS. */
  fade?: boolean;
  /**
   * Milliseconds between consecutive cards, replacing the effect's authored
   * stagger. Larger = a longer, more deliberate sequence. The archived values
   * stay the default; pass this to slow a dense row of cards down.
   */
  stagger?: number;
  /**
   * Milliseconds for one card's own motion, replacing the effect's authored
   * duration. Unlike `speed` (which divides both duration and delay), this
   * leaves the stagger alone — so pacing and travel speed are tunable
   * separately.
   */
  duration?: number;
  /**
   * Share of each card that must be visible before `trigger: "view"` fires
   * (0–1). Default `0.3`.
   *
   * This is measured on the cards, not on their section: a full-height band's
   * top edge touches the fold the moment the page loads, so a section-level
   * trigger plays the entrance in the background before the reader arrives.
   */
  amount?: number;
  /** C06 content parts, relative to each card. */
  textSelector?: string;
  artSelector?: string;
};

export type CardMotionController = {
  /** Cancel and play again from the start. */
  replay: () => void;
  /** Switch effect and play it. */
  setEffect: (effect: CardEffectKey) => void;
  readonly effect: CardEffectId;
  /** Cancel everything and release the observer. */
  destroy: () => void;
};

/** Leading delay before the first card moves. */
const LEAD_MS = 140;
const EASE = "cubic-bezier(.22,1,.36,1)";
const MIN_SPEED = 0.5;
const MAX_SPEED = 1.5;
/**
 * Cap on how long the entrance waits for images to decode.
 *
 * Cards stay `visibility: hidden` until they play, which also defers their
 * `<img>` decoding — on a set of multi-megabyte cutouts that lands as one
 * main-thread hitch the moment they are revealed. Decoding ahead of the reveal
 * moves that cost off the interaction, and the cap stops a slow image from
 * holding the entrance back.
 */
const PRIME_WAIT_MS = 400;

type EffectSpec = {
  /** Transform on the opening keyframe. */
  from: string;
  /** Settled transform. */
  to: string;
  duration: number;
  /** Delay added per card. */
  stagger: number;
};

const EFFECT_SPECS: Record<CardEffectId, EffectSpec> = {
  C01: { from: "translateY(28px)", to: "translateY(0)", duration: 1000, stagger: 0 },
  C02: { from: "translateY(36px)", to: "translateY(0)", duration: 1000, stagger: 120 },
  C03: {
    from: "scale(.94) translateY(12px)",
    to: "scale(1) translateY(0)",
    duration: 1150,
    stagger: 100,
  },
  C04: {
    from: "translateX(56px)",
    to: "translateX(0)",
    duration: 1050,
    stagger: 130,
  },
  C05: {
    from: "translateY(30px) rotateX(7deg) scale(.98)",
    to: "translateY(0) rotateX(0deg) scale(1)",
    duration: 1200,
    stagger: 120,
  },
  /* C06 drives three parts; the card part doubles as the spec for its own row. */
  C06: { from: "translateY(24px)", to: "translateY(0)", duration: 900, stagger: 110 },
};

/** C06 part timings, measured from the card's own start. */
const C06_PARTS = {
  card: { offsetMs: 0, duration: 900 },
  text: { from: "translateY(14px)", offsetMs: 220, duration: 800 },
  art: { fromBlurPx: 7, offsetMs: 300, duration: 1000 },
} as const;

const DEFAULT_TEXT_SELECTOR = ".cm-text";
const DEFAULT_ART_SELECTOR = ".cm-art";

export function normalizeCardEffect(value: string): CardEffectId {
  const input = String(value).trim();
  const upper = input.toUpperCase();
  if (upper in CARD_EFFECTS) return upper as CardEffectId;

  const match = (Object.keys(CARD_EFFECTS) as CardEffectId[]).find(
    (id) => CARD_EFFECTS[id].name === input || CARD_EFFECTS[id].id === input,
  );
  if (!match) {
    throw new Error(
      `Unknown card effect: ${input}. Use C01–C06, the Chinese name, or the English id.`,
    );
  }
  return match;
}

export const CARD_EFFECT_IDS = Object.keys(CARD_EFFECTS) as CardEffectId[];

function clampSpeed(speed: number): number {
  if (!Number.isFinite(speed)) return 1;
  return Math.max(MIN_SPEED, Math.min(MAX_SPEED, speed));
}

/** Opacity to settle on — read before the module ever touches the card. */
function readRestingOpacity(card: HTMLElement): number {
  const value = Number.parseFloat(window.getComputedStyle(card).opacity);
  return Number.isFinite(value) ? value : 1;
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Force every `<img>` under `cards` to decode now.
 *
 * `decode()` resolves once the bitmap is ready to paint, so awaiting it before
 * the reveal means the first animated frame has nothing left to rasterize.
 * Failures are swallowed — a broken image must not block the entrance.
 */
function decodeImages(cards: readonly HTMLElement[]): Promise<void> {
  const images = cards.flatMap((card) =>
    Array.from(card.querySelectorAll("img")),
  );
  return Promise.all(
    images.map((image) =>
      typeof image.decode === "function"
        ? image.decode().catch(() => {})
        : Promise.resolve(),
    ),
  ).then(() => {});
}

/**
 * Prepare a set of cards and return the controller.
 *
 * `cards` must already be in the DOM. The module owns each card's inline
 * `transform` / `opacity` while attached — React must not set those itself.
 */
export function applyCardMotion(
  cards: readonly HTMLElement[],
  effect: CardEffectKey = "C02",
  options: CardMotionOptions = {},
): CardMotionController {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("applyCardMotion is browser-only.");
  }
  let currentEffect = normalizeCardEffect(effect);
  const speed = clampSpeed(options.speed ?? 1);
  const trigger: CardTrigger = options.trigger ?? "view";
  const fade = options.fade ?? true;
  const amount = Math.max(0, Math.min(1, options.amount ?? 0.3));
  const staggerOverride =
    options.stagger != null && options.stagger >= 0 ? options.stagger : null;
  const durationOverride =
    options.duration != null && options.duration > 0 ? options.duration : null;
  const textSelector = options.textSelector ?? DEFAULT_TEXT_SELECTOR;
  const artSelector = options.artSelector ?? DEFAULT_ART_SELECTOR;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const elements = cards.filter((card): card is HTMLElement => Boolean(card));

  /* Captured once, before any animation: see the resting-opacity note above. */
  const restingOpacity = new Map<HTMLElement, number>();
  if (fade) {
    elements.forEach((card) => restingOpacity.set(card, readRestingOpacity(card)));
  }

  let animations: Animation[] = [];
  let observer: IntersectionObserver | undefined;
  let destroyed = false;
  /** Guards an in-flight decode wait against a newer replay / destroy. */
  let runToken = 0;
  /** Shared decode promise — kicked off early, awaited at reveal. */
  let primed: Promise<void> | null = null;

  function primeImages(): Promise<void> {
    primed ??= decodeImages(elements);
    return primed;
  }

  function cancelAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  }

  function animate(
    target: Element,
    frames: Keyframe[],
    duration: number,
    delay = 0,
  ) {
    const animation = target.animate(frames, {
      duration: duration / speed,
      delay: delay / speed,
      easing: EASE,
      fill: "both",
    });
    animations.push(animation);
    /* The underlying style is already the settled state, so release control. */
    animation.finished.then(() => animation.cancel()).catch(() => {});
  }

  function cardFrames(card: HTMLElement, spec: EffectSpec): Keyframe[] {
    if (!fade) {
      return [{ transform: spec.from }, { transform: spec.to }];
    }
    return [
      { opacity: 0, transform: spec.from },
      { opacity: restingOpacity.get(card) ?? 1, transform: spec.to },
    ];
  }

  function replay() {
    if (destroyed) return;
    observer?.disconnect();
    observer = undefined;
    cancelAnimations();

    /* Reveal before animating — reduced motion just shows the resting state. */
    elements.forEach((card) => {
      card.style.visibility = "";
    });
    if (reduced.matches) return;

    const token = ++runToken;
    void Promise.race([primeImages(), waitMs(PRIME_WAIT_MS)]).then(() => {
      if (destroyed || token !== runToken) return;
      startAnimations();
    });
  }

  function startAnimations() {
    /* Own a compositor layer per card for the duration of the entrance, then
     * hand it back — keeping `will-change` on set-and-forget is a memory cost. */
    elements.forEach((card) => {
      card.style.willChange = "transform, opacity";
    });
    if (animations.length) {
      void Promise.allSettled(animations.map((a) => a.finished)).then(() => {
        if (destroyed) return;
        elements.forEach((card) => {
          card.style.willChange = "";
        });
      });
    }

    elements.forEach((card, index) => {
      const spec = EFFECT_SPECS[currentEffect];
      const stagger = staggerOverride ?? spec.stagger;
      const start = LEAD_MS + index * stagger;
      const cardMs = durationOverride ?? spec.duration;
      /*
       * C06's three parts have their own authored lengths. When the card
       * duration is overridden, scale them by the same ratio so the
       * card → text → art choreography keeps its shape.
       */
      const partMs = (base: number) =>
        durationOverride === null ? base : (base / spec.duration) * cardMs;

      if (currentEffect !== "C06") {
        animate(card, cardFrames(card, spec), cardMs, start);
        return;
      }

      /* C06 — card first, then its copy, then its artwork. */
      animate(card, cardFrames(card, spec), cardMs, start + C06_PARTS.card.offsetMs);

      const text = card.querySelector<HTMLElement>(textSelector);
      if (text) {
        animate(
          text,
          [{ transform: C06_PARTS.text.from }, { transform: "translateY(0)" }],
          partMs(C06_PARTS.text.duration),
          start + C06_PARTS.text.offsetMs,
        );
      }

      const art = card.querySelector<HTMLElement>(artSelector);
      if (art) {
        animate(
          art,
          [
            { opacity: 0, filter: `blur(${C06_PARTS.art.fromBlurPx}px)` },
            { opacity: 1, filter: "blur(0px)" },
          ],
          partMs(C06_PARTS.art.duration),
          start + C06_PARTS.art.offsetMs,
        );
      }
    });
  }

  /*
   * Hold the cards back until the entrance fires, so a below-the-fold section
   * does not show them at rest and then jump.
   */
  if (trigger !== "manual" && !reduced.matches) {
    elements.forEach((card) => {
      card.style.visibility = "hidden";
    });
    /*
     * Decode while the reader is still scrolling toward the section, so the
     * reveal has nothing left to rasterize. Deliberately not awaited here.
     */
    void primeImages();
  } else {
    /* Nothing hides them, so there is no deferred decode to compensate for. */
    void primeImages();
  }

  if (trigger === "immediate") replay();
  if (trigger === "view") {
    /*
     * Watch the cards themselves — see `amount` above. The ratio is checked
     * explicitly rather than relying on `isIntersecting`, which reports any
     * overlap at all and would still fire on a sliver.
     */
    if (typeof IntersectionObserver === "undefined") {
      replay();
    } else {
      const thresholds = amount >= 1 ? [1] : [0, amount];
      observer = new IntersectionObserver(
        (entries) => {
          if (
            entries.some(
              (entry) => entry.isIntersecting && entry.intersectionRatio >= amount,
            )
          ) {
            replay();
          }
        },
        { threshold: thresholds },
      );
      elements.forEach((card) => observer?.observe(card));
    }
  }

  const controller: CardMotionController = {
    replay,
    setEffect(value) {
      currentEffect = normalizeCardEffect(value);
      replay();
    },
    get effect() {
      return currentEffect;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      /* Invalidate any in-flight decode wait before tearing down. */
      runToken += 1;
      cancelAnimations();
      observer?.disconnect();
      observer = undefined;
      elements.forEach((card) => {
        card.style.visibility = "";
        card.style.willChange = "";
      });
    },
  };

  return controller;
}

/**
 * React wrapper. Queries the cards inside `rootRef` on mount and applies one of
 * the six effects; tears the controller down on unmount or when the effect,
 * speed or selector changes.
 *
 * ```tsx
 * const motionRef = useCardMotion(sectionRef, ".home-recognition__card", "C02");
 * motionRef.current?.replay();
 * ```
 */
export function useCardMotion(
  rootRef: RefObject<Element | null>,
  selector: string,
  effect: CardEffectKey = "C02",
  options: CardMotionOptions = {},
): RefObject<CardMotionController | null> {
  const controllerRef = useRef<CardMotionController | null>(null);
  const { speed = 1, trigger = "view", fade = true, amount = 0.3 } = options;
  const { textSelector = DEFAULT_TEXT_SELECTOR, artSelector = DEFAULT_ART_SELECTOR } =
    options;
  const stagger = options.stagger;
  const duration = options.duration;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(selector),
    );
    if (!cards.length) return;

    try {
      controllerRef.current = applyCardMotion(cards, effect, {
        speed,
        trigger,
        fade,
        amount,
        stagger,
        duration,
        textSelector,
        artSelector,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("[useCardMotion]", error);
      }
      controllerRef.current = null;
    }

    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [
    rootRef,
    selector,
    effect,
    speed,
    trigger,
    fade,
    amount,
    stagger,
    duration,
    textSelector,
    artSelector,
  ]);

  return controllerRef;
}
