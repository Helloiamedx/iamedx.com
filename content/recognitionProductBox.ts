/**
 * Recognition product-box packs — placements independently replaceable.
 * Wire packs to slides via `recognitionProductBoxBySlideId`.
 * Do not invent final service-type grouping yet.
 */

import { asset } from "@/lib/assets";

export type RecognitionProductBoxItem = {
  id: string;
  /** Transparent product cutout (CDN via `asset()`) */
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Degrees */
  rotate: number;
  rotateOriginX: number;
  rotateOriginY: number;
  /**
   * Uniform scale around the item center (1 = no change).
   * Prefer this for size tweaks so x/y/rotate stay put.
   */
  scale?: number;
  /** CSS time — staggered enter */
  enterDelay: string;
  /** CSS time — drift phase offset */
  driftDelay: string;
  /** Hover lift in px */
  lift: number;
  /** Hover rotate, e.g. "-2deg" */
  turn: string;
  /** Hover scale (1 = none). Hero pieces can go higher. */
  hoverScale?: number;
};

export type RecognitionProductBoxSet = {
  id: string;
  /** Internal note only — not shown in UI */
  label: string;
  items: RecognitionProductBoxItem[];
};

const FOLDER = `/images/home/${encodeURIComponent("Recognition comes first")}/${encodeURIComponent("Clients Come Back")}`;

/** CDN cutout URL; optional `v` busts cache when a same-name file is replaced. */
const cutout = (file: string, v?: string) => {
  const url = asset(`${FOLDER}/${file}`);
  return v ? `${url}${url.includes("?") ? "&" : "?"}v=${v}` : url;
};

function origin(x: number, y: number, width: number, height: number) {
  return {
    rotateOriginX: Math.round(x + width / 2),
    rotateOriginY: Math.round(y + height * 0.9),
  };
}

function sized(
  ratio: number,
  height: number,
): { width: number; height: number } {
  return { width: Math.round(height * ratio), height };
}

function item(
  partial: Omit<RecognitionProductBoxItem, "rotateOriginX" | "rotateOriginY">,
): RecognitionProductBoxItem {
  return {
    ...partial,
    ...origin(partial.x, partial.y, partial.width, partial.height),
  };
}

/* —— Pack A: Clients Come Back e1…e7 —— */

const E_RATIO = {
  e1: 1342 / 2409,
  e2: 795 / 925,
  e3: 1186 / 2561,
  /* Replaced pin cutout (was Fallout coin 1440×1205) */
  e4: 474 / 407,
  e5: 555 / 1103,
  e6: 1293 / 1238,
  e7: 1002 / 733,
} as const;

/** Clients Come Back — e1…e7
 * Paint order = back → front.
 * Locked visual roles: e2 UL · e5 UR · e3 center hero (subject centers, not frames).
 * e7 Skyrim bag — provisional mid-left fill; refine later.
 */
export const recognitionProductBoxClientsComeBack: RecognitionProductBoxSet = {
  id: "clients-come-back",
  label: "Clients Come Back — e1–e7",
  items: (() => {
    /* e2 / e5: +15%×2 size; inward; up 15%×3 of own height */
    const e2H = Math.round(268 * 1.15 * 1.15);
    const e5H = Math.round(292 * 1.15 * 1.15);
    const e2 = {
      x: 178,
      y: 148 - Math.round(e2H * 0.15) - Math.round(e2H * 0.15),
      ...sized(E_RATIO.e2, e2H),
      rotate: -8,
    };
    const e5 = {
      x: 400,
      y:
        136 -
        Math.round(e5H * 0.15) -
        Math.round(e5H * 0.15) -
        Math.round(e5H * 0.15),
      ...sized(E_RATIO.e5, e5H),
      rotate: 9,
    };
    const e1 = {
      x: 452,
      y: 158,
      ...sized(E_RATIO.e1, 238),
      rotate: 7,
      scale: 0.9,
    };
    const e7 = {
      x: 88,
      y: 228,
      ...sized(E_RATIO.e7, 168),
      rotate: -11,
      /* size via scale — height tweaks were too easy to miss */
      scale: 0.95,
    };
    const e4 = {
      x: 205,
      y: 336,
      ...sized(E_RATIO.e4, Math.round(128 * 0.95)),
      rotate: -18,
    };
    /* e3: up 15% from prior sink (net +15% of height from original y) */
    const e3 = {
      x: 276,
      y: 52 + Math.round(428 * 0.15),
      ...sized(E_RATIO.e3, 428),
      rotate: 1,
      scale: 0.85 * 0.85,
    };
    /* e6 sits under the front flap — scale so growth shows above the rim */
    const e6 = {
      x: 442,
      y: 330,
      ...sized(E_RATIO.e6, 136),
      rotate: 8,
      scale: 1.1,
    };

    return [
      item({
        id: "e2",
        src: cutout("e2.png"),
        ...e2,
        enterDelay: "0.05s",
        driftDelay: "-3s",
        lift: 15,
        turn: "2deg",
      }),
      item({
        id: "e5",
        src: cutout("e5.png"),
        ...e5,
        enterDelay: "0.12s",
        driftDelay: "-4.2s",
        lift: 14,
        turn: "3deg",
      }),
      item({
        id: "e1",
        src: cutout("e1.png"),
        ...e1,
        enterDelay: "0.18s",
        driftDelay: "-1.4s",
        lift: 12,
        turn: "-2deg",
      }),
      item({
        id: "e7",
        src: cutout("e7.png"),
        ...e7,
        enterDelay: "0.24s",
        driftDelay: "-2.7s",
        lift: 13,
        turn: "-2deg",
      }),
      item({
        id: "e4",
        src: cutout("e4.png", "2"),
        ...e4,
        enterDelay: "0.3s",
        driftDelay: "-2.3s",
        lift: 11,
        turn: "-3deg",
      }),
      item({
        id: "e3",
        src: cutout("e3.png"),
        ...e3,
        enterDelay: "0.36s",
        driftDelay: "-0.6s",
        lift: 28,
        turn: "2deg",
        hoverScale: 1.22,
      }),
      item({
        id: "e6",
        src: cutout("e6.png"),
        ...e6,
        enterDelay: "0.44s",
        driftDelay: "-3.6s",
        lift: 16,
        turn: "-3deg",
      }),
    ];
  })(),
};

/* —— Pack B: Clients Come Back s1…s5 (provisional layout; refine later) —— */

const S_RATIO = {
  s1: 1243 / 1145,
  s2: 1431 / 1255,
  s3: 1580 / 1248,
  s4: 1220 / 1022,
  s5: 1106 / 1397,
} as const;

/**
 * Second box — s1…s5.
 * Paint order = back → front: s5 back · s3+s4 mid · s1+s2 top.
 */
export const recognitionProductBoxClientsComeBackS: RecognitionProductBoxSet = {
  id: "clients-come-back-s",
  label: "Clients Come Back — s1–s5",
  items: (() => {
    const s5 = {
      x: 232,
      y: 198 - Math.round(310 * 0.2) - Math.round(310 * 0.2),
      ...sized(S_RATIO.s5, 310),
      rotate: 1,
      scale: 1.25 * 1.3 * 1.1,
    };
    const s2 = {
      x: 420,
      y: 248 + Math.round(178 * 0.12) + Math.round(198 * 0.15),
      ...sized(S_RATIO.s2, 198),
      rotate: -6,
      scale: 1.25,
    };
    const s3 = {
      x: 100,
      y: 48 + Math.round(236 * 0.2) + Math.round(236 * 0.15),
      ...sized(S_RATIO.s3, 236),
      rotate: 7,
      scale: 0.9 * 1.15,
    };
    const s1 = {
      x: 128,
      y: 210 + Math.round(208 * 0.12) + Math.round(208 * 0.15),
      ...sized(S_RATIO.s1, 208),
      rotate: 4,
      scale: 1.15,
    };
    const s4 = {
      x: 440,
      y: 72 + Math.round(198 * 0.3) + Math.round(178 * 0.15),
      ...sized(S_RATIO.s4, 178),
      rotate: -8,
      scale: 1.15,
    };

    return [
      item({
        id: "s5",
        src: cutout("s5.png"),
        ...s5,
        enterDelay: "0.05s",
        driftDelay: "-2.8s",
        lift: 28,
        turn: "2deg",
        hoverScale: 1.22,
      }),
      item({
        id: "s3",
        src: cutout("s3.png"),
        ...s3,
        enterDelay: "0.12s",
        driftDelay: "-0.7s",
        lift: 14,
        turn: "1deg",
      }),
      item({
        id: "s4",
        src: cutout("s4.png"),
        ...s4,
        enterDelay: "0.2s",
        driftDelay: "-3.2s",
        lift: 11,
        turn: "3deg",
      }),
      item({
        id: "s1",
        src: cutout("s1.png"),
        ...s1,
        enterDelay: "0.28s",
        driftDelay: "-1.6s",
        lift: 12,
        turn: "-3deg",
      }),
      item({
        id: "s2",
        src: cutout("s2.png"),
        ...s2,
        enterDelay: "0.36s",
        driftDelay: "-4s",
        lift: 13,
        turn: "2deg",
      }),
    ];
  })(),
};

/* —— Pack C: Clients Come Back d1…d5 (provisional layout; refine later) —— */

const D_RATIO = {
  d1: 634 / 530,
  d2: 1285 / 1828,
  d3: 1407 / 1408,
  d4: 918 / 1080,
  d5: 1175 / 1237,
} as const;

/**
 * Third box — d1…d5 (v1 pass).
 * Paint order = back → front: d2+d4 back · d3 mid · d5+d1 front.
 */
export const recognitionProductBoxClientsComeBackD: RecognitionProductBoxSet = {
  id: "clients-come-back-d",
  label: "Clients Come Back — d1–d5",
  items: (() => {
    /* Tall patch — back left */
    const d2 = {
      x: 138,
      y: 88 + Math.round(292 * 0.15),
      ...sized(D_RATIO.d2, 292),
      rotate: -14,
      scale: 1.12,
    };
    /* Wood plaque — back right, nudged down */
    const d4 = {
      x: 405,
      y: 128 + Math.round(196 * 0.2) - Math.round(196 * 0.1),
      ...sized(D_RATIO.d4, 196),
      rotate: 9,
      scale: 1.08 * 1.2,
    };
    /* Casino chip box — front-mid fill */
    const d5 = {
      x: 188,
      y: 252 + Math.round(172 * 0.1) + Math.round(172 * 0.2),
      ...sized(D_RATIO.d5, 172),
      rotate: -5,
      scale: 1.06 * 0.95,
    };
    /* Coin — front accent */
    const d1 = {
      x: 422,
      y: 322 + Math.round(120 * 0.1) + Math.round(120 * 0.2),
      ...sized(D_RATIO.d1, 120),
      rotate: 12,
      scale: 1.08 * 0.95,
    };
    /* Yellow XING — middle layer; +20% size; pack hover focus */
    const d3 = {
      x: 262,
      y: 132 + Math.round(252 * 0.2) + Math.round(252 * 0.1),
      ...sized(D_RATIO.d3, 252),
      rotate: 2,
      scale: 0.92 * 1.2,
    };

    return [
      item({
        id: "d2",
        src: cutout("d2.png"),
        ...d2,
        enterDelay: "0.05s",
        driftDelay: "-2.6s",
        lift: 14,
        turn: "-2deg",
      }),
      item({
        id: "d4",
        src: cutout("d4.png"),
        ...d4,
        enterDelay: "0.12s",
        driftDelay: "-3.8s",
        lift: 12,
        turn: "3deg",
      }),
      item({
        id: "d3",
        src: cutout("d3.png"),
        ...d3,
        enterDelay: "0.2s",
        driftDelay: "-0.8s",
        lift: 28,
        turn: "2deg",
        hoverScale: 1.22,
      }),
      item({
        id: "d5",
        src: cutout("d5.png"),
        ...d5,
        enterDelay: "0.28s",
        driftDelay: "-1.5s",
        lift: 12,
        turn: "-2deg",
      }),
      item({
        id: "d1",
        src: cutout("d1.png"),
        ...d1,
        enterDelay: "0.36s",
        driftDelay: "-3.1s",
        lift: 11,
        turn: "2deg",
      }),
    ];
  })(),
};

/**
 * Registry for packs. Add / swap sets without touching animation CSS.
 */
export const recognitionProductBoxSets = {
  clientsComeBack: recognitionProductBoxClientsComeBack,
  clientsComeBackS: recognitionProductBoxClientsComeBackS,
  clientsComeBackD: recognitionProductBoxClientsComeBackD,
} as const;

export type RecognitionProductBoxSetId =
  keyof typeof recognitionProductBoxSets;

/** Slide id → one or more product-box packs (omit = photo cover). */
export const recognitionProductBoxBySlideId: Partial<
  Record<string, RecognitionProductBoxSetId | RecognitionProductBoxSetId[]>
> = {
  /* First card: e / s / d boxes side by side */
  "client-rehire": [
    "clientsComeBack",
    "clientsComeBackS",
    "clientsComeBackD",
  ],
};

export function getRecognitionProductBoxSet(
  id: RecognitionProductBoxSetId,
): RecognitionProductBoxSet {
  return recognitionProductBoxSets[id];
}

export function getRecognitionProductBoxSetsForSlide(
  slideId: string,
): RecognitionProductBoxSetId[] {
  const mapped = recognitionProductBoxBySlideId[slideId];
  if (!mapped) return [];
  return Array.isArray(mapped) ? mapped : [mapped];
}
