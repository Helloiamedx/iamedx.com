/**
 * HEADLINE MOTION — fixed seven-effect protocol (dependency-free).
 *
 * Ported from the Codex handoff `headline-motion.js`. Every effect id, name,
 * duration, offset and stagger is preserved verbatim — do not retune them.
 *
 *   | #  | name             | id             | notes                                   |
 *   |----|------------------|----------------|-----------------------------------------|
 *   | 01 | 轻移渐显         | fade-up        | whole title, 0→1, up 26px, 1250ms        |
 *   | 02 | 逐行揭幕         | line-reveal    | per line, from below, 1100ms, +160ms     |
 *   | 03 | 模糊聚焦         | blur-focus     | per line, blur 14→0, up 16px, 1400ms     |
 *   | 04 | 缩放落定         | scale-in       | whole title, .94→1, up 8px, 1500ms       |
 *   | 05 | 逐字浮现         | char-reveal    | per char, up 22px, 850ms                 |
 *   | 06 | 光感扫入         | light-sweep    | per line, clip + brighten, 1550–1600ms   |
 *   | 07 | 逐行轻移渐显     | line-fade-up   | per line, up 14px, 850ms, +110ms         |
 *
 * 06 is a clip + opacity effect — no glow, gradient or decorative light band.
 *
 * Behaviour
 * - Lines are measured from real browser widths (never from a character count),
 *   so phones, tablets, desktop and font swaps all get the correct row count.
 * - Internal wrappers carry no vertical padding; spacing comes only from the
 *   headline's own `line-height` (1.08 is the recommended value for long titles).
 * - Plays once when scrolled into view, and honours `prefers-reduced-motion`.
 * - The module owns the element's children while attached. Never let React (or
 *   any other renderer) mutate the same nodes — call `destroy()` first.
 *
 * Everything here is browser-only. The module touches no globals at import time.
 */

export const HEADLINE_EFFECTS = Object.freeze({
  "01": Object.freeze({ name: "轻移渐显", id: "fade-up" }),
  "02": Object.freeze({ name: "逐行揭幕", id: "line-reveal" }),
  "03": Object.freeze({ name: "模糊聚焦", id: "blur-focus" }),
  "04": Object.freeze({ name: "缩放落定", id: "scale-in" }),
  "05": Object.freeze({ name: "逐字浮现", id: "char-reveal" }),
  "06": Object.freeze({ name: "光感扫入", id: "light-sweep" }),
  "07": Object.freeze({ name: "逐行轻移渐显", id: "line-fade-up" }),
});

export type HeadlineEffectId = keyof typeof HEADLINE_EFFECTS;
export type HeadlineEffectMeta =
  (typeof HEADLINE_EFFECTS)[HeadlineEffectId];
/** `"03"` · `"模糊聚焦"` · `"blur-focus"` all resolve to the same effect. */
export type HeadlineEffectKey =
  | HeadlineEffectId
  | HeadlineEffectMeta["name"]
  | HeadlineEffectMeta["id"];

export type HeadlineTrigger = "view" | "immediate" | "manual";

export type HeadlineMotionOptions = {
  /** `1` = authored speed. `1.2` faster, `0.8` slower. */
  speed?: number;
  /** `view` (default) plays once on scroll-in, `immediate` on attach, `manual` on demand. */
  trigger?: HeadlineTrigger;
};

export type HeadlineMotionController = {
  /** Re-measure, re-split lines, and play again from the start. */
  replay: () => void;
  /** Switch effect and play it. */
  setEffect: (effect: HeadlineEffectKey) => void;
  readonly effect: HeadlineEffectId;
  /** Restore the original nodes and release every listener / observer. */
  destroy: () => void;
};

export const HEADLINE_MOTION_STYLE_ID = "headline-motion-styles";

const EASE = "cubic-bezier(.22,1,.36,1)";
/** Row-grouping tolerance — subpixel baseline drift on one visual row. */
const ROW_TOLERANCE_PX = 2;

const STYLE_TEXT = `
  .hm-content { display:block; padding:0; margin:0; }
  .hm-line { display:block; padding:0; margin:0; }
  .hm-inner { display:block; padding:0; margin:0; }
  .hm-word { display:inline-block; white-space:nowrap; }
  .hm-char { display:inline-block; }
  /*
   * The mask clips to the line box, which is shorter than the font's ink box
   * whenever line-height < ~1.19 (the site's titles sit at 1.05, cards at 1.0).
   * --hm-bleed is measured per headline from the real font metrics, so the
   * clip grows by exactly what the glyphs need and nothing more. The extra
   * bleed is not part of layout, so it adds no line spacing.
   */
  .hm-mask { overflow:clip; overflow-clip-margin:var(--hm-bleed, .07em); }
`;

/** Registered instances, so a re-attach always cleans up the previous run. */
const instances = new WeakMap<HTMLElement, HeadlineMotionController>();

export function normalizeHeadlineEffect(value: string | number): HeadlineEffectId {
  const input = String(value).trim();
  const key = /^\d{1,2}$/.test(input) ? input.padStart(2, "0") : input;
  if (key in HEADLINE_EFFECTS) return key as HeadlineEffectId;

  const match = (Object.keys(HEADLINE_EFFECTS) as HeadlineEffectId[]).find(
    (id) =>
      HEADLINE_EFFECTS[id].name === input || HEADLINE_EFFECTS[id].id === input,
  );
  if (!match) {
    throw new Error(
      `Unknown headline effect: ${input}. Use 01–07, the Chinese name, or the English id.`,
    );
  }
  return match;
}

/** Effect label for UI (preview switchers, docs) — `"03 · 模糊聚焦"`. */
export function headlineEffectLabel(id: HeadlineEffectId): string {
  return `${id} · ${HEADLINE_EFFECTS[id].name}`;
}

export const HEADLINE_EFFECT_IDS = Object.keys(
  HEADLINE_EFFECTS,
) as HeadlineEffectId[];

/**
 * Inject the wrapper styles, once per document.
 *
 * Called from `applyHeadlineMotion`, i.e. after mount — the wrappers are
 * block-level spans that render identically to the raw text, so there is no
 * unstyled flash in the frame before this runs.
 *
 * An existing tag is re-synced rather than assumed correct: during Fast Refresh
 * the module reloads while the document keeps the previous tag, and a stale
 * rule would silently outlive the code that wrote it.
 */
export function installHeadlineMotionStyles(doc: Document = document) {
  const existing = doc.getElementById(HEADLINE_MOTION_STYLE_ID);
  if (existing) {
    if (existing.textContent !== STYLE_TEXT) existing.textContent = STYLE_TEXT;
    return;
  }
  const style = doc.createElement("style");
  style.id = HEADLINE_MOTION_STYLE_ID;
  style.textContent = STYLE_TEXT;
  doc.head.append(style);
}

type SegmenterCtor = new (
  locales?: string | string[],
  options?: { granularity?: "grapheme" | "word" | "sentence" },
) => { segment(input: string): Iterable<{ segment: string }> };

/** Grapheme-aware split, so emoji / combining marks are never torn apart. */
function splitGraphemes(word: string): string[] {
  const Segmenter = (Intl as unknown as { Segmenter?: SegmenterCtor })
    .Segmenter;
  if (typeof Segmenter !== "function") return Array.from(word);
  const segmenter = new Segmenter(undefined, { granularity: "grapheme" });
  return Array.from(segmenter.segment(word), (item) => item.segment);
}

/**
 * Font ink metrics for one line, in px.
 *
 * Effect 02 clips each row to its own line box. That box is shorter than the
 * glyphs whenever `line-height` is below the font's natural ink ratio (~1.19
 * here), which is the normal case on this site — section titles run at 1.05 and
 * card titles at 1.0, so descenders would be shaved by up to ~0.8px.
 *
 * - `bleedPx` — how far the ink sticks out past the line box, per side. Expands
 *   the clip so no glyph is cut.
 * - `inkPx` — the full ink height. Starting the row at least this far down
 *   guarantees none of it is inside the clip before it slides up.
 *
 * Falls back to `0` when the fonts API gives nothing usable.
 */
function measureLineMetrics(
  element: HTMLElement,
  lineBoxPx: number,
): { bleedPx: number; inkPx: number } {
  if (!lineBoxPx) return { bleedPx: 0, inkPx: 0 };
  const cs = window.getComputedStyle(element);
  const fontSize = Number.parseFloat(cs.fontSize);
  if (!Number.isFinite(fontSize) || fontSize <= 0) {
    return { bleedPx: 0, inkPx: 0 };
  }

  const context = document.createElement("canvas").getContext("2d");
  if (!context) return { bleedPx: 0, inkPx: 0 };
  context.font = `${cs.fontStyle} ${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;

  /* Ascenders, descenders and a couple of round/pointed shapes. */
  const metrics = context.measureText("HxpgQjy");
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } =
    metrics;
  if (!Number.isFinite(ascent) || !Number.isFinite(descent)) {
    return { bleedPx: 0, inkPx: 0 };
  }

  const inkPx = ascent + descent;
  return { bleedPx: Math.max(0, (inkPx - lineBoxPx) / 2), inkPx };
}

/**
 * Prepare one headline element and return its controller.
 *
 * The element must contain plain text and `<br>` only — links, `<em>` and other
 * inline markup are rejected because they cannot be split into lines safely.
 */
export function applyHeadlineMotion(
  element: HTMLElement,
  /* `string & {}` keeps editor suggestions for the union while still accepting
   * the raw `data-headline-motion` attribute value. Validated at runtime. */
  effect: HeadlineEffectKey | (string & {}) = "07",
  options: HeadlineMotionOptions = {},
): HeadlineMotionController {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("applyHeadlineMotion is browser-only.");
  }
  if (!(element instanceof HTMLElement)) {
    throw new TypeError("applyHeadlineMotion expects a headline DOM element.");
  }

  let currentEffect = normalizeHeadlineEffect(effect);
  const config: Required<HeadlineMotionOptions> = {
    speed: options.speed ?? 1,
    trigger: options.trigger ?? "view",
  };
  if (!Number.isFinite(config.speed) || config.speed <= 0) {
    throw new Error("speed must be greater than 0.");
  }
  if (!["view", "immediate", "manual"].includes(config.trigger)) {
    throw new Error("trigger must be view, immediate or manual.");
  }

  /* Replace any previous run before reading the source text. */
  instances.get(element)?.destroy();

  if (element.querySelector("*:not(br)")) {
    throw new Error(
      "Headline may only contain plain text and <br>. Remove other markup first.",
    );
  }

  installHeadlineMotionStyles(element.ownerDocument);

  /* Keep the original nodes + a11y attribute so destroy() restores them. */
  const originalNodes = Array.from(element.childNodes);
  const originalLabel = element.getAttribute("aria-label");
  const text = originalNodes
    .map((node) => (node.nodeName === "BR" ? "\n" : node.textContent ?? ""))
    .join("");
  const paragraphs = text
    .split("\n")
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  if (!paragraphs.length) throw new Error("Headline must not be empty.");

  const content = document.createElement("span");
  content.className = "hm-content";
  content.setAttribute("aria-hidden", "true");
  element.setAttribute("aria-label", originalLabel || paragraphs.join(" "));
  element.replaceChildren(content);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let animations: Animation[] = [];
  let inners: HTMLElement[] = [];
  let lineElements: HTMLElement[] = [];
  let observer: IntersectionObserver | undefined;
  let destroyed = false;
  let started = false;
  let frame = 0;
  /** Ink metrics for effect 02's mask, refreshed on every re-split. */
  let bleedPx = 0;
  let inkPx = 0;

  function cancelAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations = [];
  }

  /**
   * Re-split the text into visual rows.
   *
   * Words are laid out naturally first (`white-space: nowrap` keeps a word
   * whole), then grouped by measured `offsetTop`. That is what makes the row
   * count follow the real width instead of a guess.
   */
  function layout() {
    if (destroyed || !element.isConnected) return;
    cancelAnimations();
    content.replaceChildren();

    const measured: string[][] = [];
    paragraphs.forEach((paragraph) => {
      const probe = document.createElement("span");
      probe.style.display = "block";
      paragraph.split(" ").forEach((word, index) => {
        if (index) probe.append(document.createTextNode(" "));
        const token = document.createElement("span");
        token.className = "hm-word";
        token.textContent = word;
        probe.append(token);
      });
      content.append(probe);

      let top: number | null = null;
      let row: string[] = [];
      Array.from(probe.children).forEach((child) => {
        const token = child as HTMLElement;
        if (top === null || Math.abs(token.offsetTop - top) > ROW_TOLERANCE_PX) {
          row = [];
          measured.push(row);
          top = token.offsetTop;
        }
        row.push(token.textContent ?? "");
      });
    });

    content.replaceChildren();
    inners = [];
    lineElements = [];
    measured.forEach((words) => {
      const line = document.createElement("span");
      line.className = "hm-line";
      const inner = document.createElement("span");
      inner.className = "hm-inner";
      inner.textContent = words.join(" ");
      line.append(inner);
      content.append(line);
      lineElements.push(line);
      inners.push(inner);
    });

    /*
     * Effect 02 clips each row to its own line box, and the mask has to survive
     * every re-split — a resize or font swap rebuilds these nodes, so prepare
     * them here rather than only on the first play.
     */
    bleedPx = 0;
    inkPx = 0;
    const first = inners[0];
    if (currentEffect === "02" && first) {
      const metrics = measureLineMetrics(
        first,
        first.getBoundingClientRect().height,
      );
      bleedPx = metrics.bleedPx;
      inkPx = metrics.inkPx;
      content.style.setProperty("--hm-bleed", `${bleedPx}px`);
      lineElements.forEach((line) => line.classList.add("hm-mask"));
    }

    /*
     * Hold the title hidden until it first plays, so a scroll-in does not flash
     * the finished text first. Reduced motion skips animations entirely, so it
     * is shown straight away.
     */
    content.style.visibility =
      !started && !reduced.matches ? "hidden" : "visible";
  }

  function animate(
    target: HTMLElement,
    frames: Keyframe[],
    duration: number,
    delay = 0,
    easing: string = EASE,
  ) {
    const animation = target.animate(frames, {
      duration: duration / config.speed,
      delay: delay / config.speed,
      easing,
      fill: "both",
    });
    animations.push(animation);
    /*
     * The underlying style is already the finished state, so drop the animation
     * once it settles — this keeps the DOM free of dozens of held `fill: both`
     * animations on long headlines.
     */
    animation.finished.then(() => animation.cancel()).catch(() => {});
  }

  function replay() {
    if (destroyed) return;
    started = true;
    observer?.disconnect();
    observer = undefined;
    layout();
    content.style.visibility = "visible";
    if (reduced.matches) return;

    const move = (y: number): Keyframe[] => [
      { opacity: 0, transform: `translateY(${y}px)` },
      { opacity: 1, transform: "translateY(0)" },
    ];

    switch (currentEffect) {
      case "01": // Whole title, no per-line stagger.
        animate(content, move(26), 1250, 180);
        break;

      case "02": {
        /*
         * Per line, revealed out of a clipping band.
         *
         * The authored travel is 110% of the row. A tight `line-height` both
         * shaves the glyphs at rest and lets the incoming row's ascenders peek
         * through the clip, so the clip bleed measured in `layout()` is paired
         * with a start offset that clears it — the authored 110% stays the
         * floor, and no part of the row is visible before it slides up.
         */
        inners.forEach((inner, i) => {
          const lineBoxPx = inner.getBoundingClientRect().height;
          const startPx = Math.max(lineBoxPx * 1.1, inkPx);
          animate(
            inner,
            [
              { transform: `translateY(${startPx}px)` },
              { transform: "translateY(0px)" },
            ],
            1100,
            180 + i * 160,
          );
        });
        break;
      }

      case "03": // Per line, blur clears as it settles.
        inners.forEach((inner, i) =>
          animate(
            inner,
            [
              { opacity: 0, filter: "blur(14px)", transform: "translateY(16px)" },
              { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
            ],
            1400,
            160 + i * 180,
          ),
        );
        break;

      case "04": // Whole title scales in; lines never separate.
        animate(
          content,
          [
            { opacity: 0, transform: "scale(.94) translateY(8px)" },
            { opacity: 1, transform: "scale(1) translateY(0)" },
          ],
          1500,
          120,
        );
        break;

      case "05": {
        /* Per character. Whole words stay intact so nothing breaks mid-word. */
        const count = splitGraphemes(paragraphs.join(" ")).length;
        const gap = Math.min(55, 900 / Math.max(1, count));
        let index = 0;
        inners.forEach((inner) => {
          const words = (inner.textContent ?? "").split(" ");
          inner.replaceChildren();
          words.forEach((word, wordIndex) => {
            if (wordIndex) inner.append(document.createTextNode(" "));
            const wrapper = document.createElement("span");
            wrapper.className = "hm-word";
            inner.append(wrapper);
            splitGraphemes(word).forEach((letter) => {
              const character = document.createElement("span");
              character.className = "hm-char";
              character.textContent = letter;
              wrapper.append(character);
              animate(
                character,
                [
                  {
                    opacity: 0,
                    filter: "blur(4px)",
                    transform: "translateY(22px)",
                  },
                  { opacity: 1, filter: "blur(0px)", transform: "translateY(0)" },
                ],
                850,
                150 + index++ * gap,
              );
            });
          });
        });
        break;
      }

      case "06": // Horizontal clip + brighten. Not a real glow.
        inners.forEach((inner, i) => {
          animate(inner, [{ opacity: 0.12 }, { opacity: 1 }], 1600, 150 + i * 200, "ease-out");
          animate(
            inner,
            [
              { clipPath: "inset(0 100% 0 0)" },
              { clipPath: "inset(0 0% 0 0)" },
            ],
            1550,
            120 + i * 200,
            "cubic-bezier(.3,0,.15,1)",
          );
        });
        break;

      case "07": // Recommended for long titles: small travel, short stagger.
        inners.forEach((inner, i) => animate(inner, move(14), 850, 120 + i * 110));
        break;
    }
  }

  layout();

  let lastWidth = element.getBoundingClientRect().width;
  function scheduleLayout() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      /* Re-split without replaying — the spec keeps a resize silent. */
      layout();
      lastWidth = element.getBoundingClientRect().width;
    });
  }

  const resize = new ResizeObserver(() => {
    const width = element.getBoundingClientRect().width;
    if (Math.abs(width - lastWidth) < 0.5) return;
    lastWidth = width;
    scheduleLayout();
  });
  resize.observe(element);

  const onReducedChange = () => {
    if (reduced.matches) layout();
  };
  reduced.addEventListener("change", onReducedChange);

  /* Fonts can land after first paint and change every row break. */
  element.ownerDocument.fonts?.addEventListener("loadingdone", scheduleLayout);
  void element.ownerDocument.fonts?.ready.then(() => scheduleLayout());

  if (config.trigger === "immediate") replay();
  if (config.trigger === "view") {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) replay();
      },
      { threshold: 0 },
    );
    observer.observe(element);
  }

  const controller: HeadlineMotionController = {
    replay,
    setEffect(value) {
      currentEffect = normalizeHeadlineEffect(value);
      replay();
    },
    get effect() {
      return currentEffect;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      cancelAnimations();
      cancelAnimationFrame(frame);
      observer?.disconnect();
      observer = undefined;
      resize.disconnect();
      reduced.removeEventListener("change", onReducedChange);
      element.ownerDocument.fonts?.removeEventListener(
        "loadingdone",
        scheduleLayout,
      );
      /* Hand the element back exactly as it was. */
      element.replaceChildren(...originalNodes);
      if (originalLabel === null) element.removeAttribute("aria-label");
      else element.setAttribute("aria-label", originalLabel);
      instances.delete(element);
    },
  };

  instances.set(element, controller);
  return controller;
}

/**
 * Batch form: attaches to every `[data-headline-motion="03"]` in `root`.
 * The React component is the preferred entry point — use this for plain HTML.
 */
export function initHeadlineMotion(
  root: ParentNode = document,
  options: HeadlineMotionOptions = {},
): HeadlineMotionController[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>("[data-headline-motion]"),
    (element) =>
      applyHeadlineMotion(
        element,
        element.dataset.headlineMotion || "07",
        options,
      ),
  );
}
