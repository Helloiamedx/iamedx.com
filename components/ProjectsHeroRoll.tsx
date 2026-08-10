"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type AnimationEvent,
  type CSSProperties,
} from "react";
import {
  projectsHeroLines,
  projectsHeroRoll,
  type ProjectsHeroRollItem,
} from "@/content/projects";
import "./ProjectsHeroRoll.css";

const MAX_ON_SCREEN = 11;
const TARGET_ON_SCREEN = 8;
/** Watchdog cadence */
const WATCH_MS = 400;
/**
 * Min gap before the next continuous spawn may appear.
 * Kept a bit long so refill never reads as “one group ends → next group dumps in”.
 */
const SPAWN_COOLDOWN_MS = 860;
/**
 * How long a spawn's strip stays partially off-limits.
 * Long enough that the immediate next frames go elsewhere — not the whole trip.
 */
const SPATIAL_BAN_MS = 2200;
/**
 * Only the leading fraction of a ban strip is hard-blocked.
 * Ban [0, 500] → hard zone [0, 225]; next frame may start from x ≥ 225.
 */
const BAN_KEEP_FRAC = 0.45;
/** Cap stacked bans so the stage can't lock itself empty */
const MAX_ACTIVE_BANS = 3;
const LINE_HOLD_MS = 6500;
const LINE_FADE_MS = 560;

/** Base size, then shrink only 15–20% — never down to ~half */
const BASE_WIDTH_FRAC = 0.34;
const BASE_WIDTH_FRAC_MOBILE = 0.52;
const SHRINK_MIN = 0.8; /* 20% smaller */
const SHRINK_MAX = 0.85; /* 15% smaller */
const WIDTH_MAX_PX = 440;
const WIDTH_MIN_PX = 160;

const SPEED_PX_PER_S = 52;
const SPEED_JITTER = 0.3;

/** Spatial depth tiers — shadow / air / slight parallax (size stays fixed) */
type Depth = "far" | "mid" | "near";
const DEPTH_Z: Record<Depth, number> = { far: 2, mid: 5, near: 8 };
/** Near drifts a touch faster, far slower — reads as layers, not stickers */
const DEPTH_SPEED: Record<Depth, number> = { far: 0.86, mid: 1, near: 1.14 };

function pickDepth(): Depth {
  const r = Math.random();
  if (r < 0.28) return "far";
  if (r < 0.72) return "mid";
  return "near";
}

/** Min center-to-center gap — fights vertical stacking */
const MIN_SEP_X = 0.12; /* of stage width */
const MIN_SEP_Y = 0.16; /* of stage height */

/** Opening: hard box clearance so first act never stacks */
const OPEN_GAP_X = 0.028; /* of stage width */
const OPEN_GAP_Y = 0.045; /* of stage height */

type Rect = { x: number; y: number; w: number; h: number; cx: number; cy: number };

type Floater = {
  key: string;
  item: ProjectsHeroRollItem;
  style: CSSProperties;
  depth: Depth;
  x: number;
  yStart: number;
  width: number;
  height: number;
  travel: number;
  durationMs: number;
  bornAt: number;
  flush: "left" | "right" | null;
};

/** Opening anchors — always these seven, staggered */
type OpeningSlot = {
  id: string;
  flush: "left" | "right" | null;
  /** Normalized center x 0–1 (ignored when flush) */
  x: [number, number];
  /** Normalized top y 0–1 */
  y: [number, number];
  delayMs: number;
};

const OPENING: OpeningSlot[] = [
  { id: "left", flush: "left", x: [0, 0], y: [0.3, 0.42], delayMs: 40 },
  { id: "right", flush: "right", x: [1, 1], y: [0.48, 0.6], delayMs: 100 },
  /* Always projectsroll16 — sits under the cycling hero lines */
  { id: "center", flush: null, x: [0.4, 0.6], y: [0.36, 0.48], delayMs: 170 },
  /* Col 2 / col 4 — between edge and center */
  { id: "upper-left", flush: null, x: [0.18, 0.34], y: [0.04, 0.18], delayMs: 260 },
  { id: "upper-right", flush: null, x: [0.66, 0.82], y: [0.05, 0.19], delayMs: 340 },
  { id: "lower-left", flush: null, x: [0.16, 0.32], y: [0.64, 0.78], delayMs: 430 },
  { id: "lower-right", flush: null, x: [0.68, 0.84], y: [0.66, 0.8], delayMs: 520 },
];

/** First-act center frame under the headline — never randomize this away */
const CENTER_OPENING_ROLL_ID = "projectsroll-16";

function centerOpeningItem(): ProjectsHeroRollItem {
  const item = projectsHeroRoll.find((entry) => entry.id === CENTER_OPENING_ROLL_ID);
  if (!item) {
    throw new Error(`Missing ${CENTER_OPENING_ROLL_ID} in projectsHeroRoll`);
  }
  return item;
}

function deckWithoutCenterOpening() {
  return shuffle(
    projectsHeroRoll.filter((entry) => entry.id !== CENTER_OPENING_ROLL_ID),
  );
}

type OpeningPose = {
  x: number;
  y: number;
  width: number;
  flush: Floater["flush"];
};

function boxesOverlap(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  gapX: number,
  gapY: number,
) {
  return !(
    a.x + a.w + gapX <= b.x ||
    b.x + b.w + gapX <= a.x ||
    a.y + a.h + gapY <= b.y ||
    b.y + b.h + gapY <= a.y
  );
}

/**
 * Plan all first-act frames at once with hard non-overlap.
 * Shrinks width if needed so every slot can land clear.
 */
function pickDisplayWidth(stageWidth: number, isMobile: boolean) {
  const base =
    stageWidth * (isMobile ? BASE_WIDTH_FRAC_MOBILE : BASE_WIDTH_FRAC);
  const shrink = SHRINK_MIN + Math.random() * (SHRINK_MAX - SHRINK_MIN);
  return Math.min(WIDTH_MAX_PX, Math.max(WIDTH_MIN_PX, base * shrink));
}

/**
 * Plan all first-act frames at once with hard non-overlap.
 * Shrinks within 25–30% band only; never halves the frame.
 */
function planOpeningLayout(
  stageW: number,
  stageH: number,
  isMobile: boolean,
): Map<string, OpeningPose> {
  const gapX = stageW * OPEN_GAP_X;
  const gapY = stageH * OPEN_GAP_Y;
  const placed: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    flush: Floater["flush"];
  }[] = [];

  for (const slot of OPENING) {
    let width = pickDisplayWidth(stageW, isMobile);
    let height = width * 1.15;
    let found: OpeningPose | null = null;

    for (let shrink = 0; shrink < 4 && !found; shrink++) {
      if (shrink > 0) {
        /* Stay inside the 25–30% band — nudge toward the small end only */
        width = Math.min(width, pickDisplayWidth(stageW, isMobile) * 0.98);
        height = width * 1.15;
      }

      for (let attempt = 0; attempt < 28 && !found; attempt++) {
        let x: number;
        if (slot.flush === "left") x = 0;
        else if (slot.flush === "right") x = stageW - width;
        else {
          const cx = lerp(slot.x[0], slot.x[1], Math.random()) * stageW;
          x = clamp(cx - width / 2, 0, stageW - width);
        }

        let y = lerp(slot.y[0], slot.y[1], Math.random()) * stageH;
        y = clamp(y, stageH * 0.02, stageH * 0.88 - height);

        for (let n = 0; n < 16; n++) {
          const box = { x, y, w: width, h: height };
          const hits = placed.some((p) => boxesOverlap(box, p, gapX, gapY));
          if (!hits) {
            found = { x, y, width, flush: slot.flush };
            break;
          }
          const angle = n * 0.9;
          const rad = (n + 1) * Math.min(stageW, stageH) * 0.035;
          if (slot.flush === "left" || slot.flush === "right") {
            y = clamp(
              y + Math.cos(angle) * rad,
              stageH * 0.02,
              stageH * 0.88 - height,
            );
          } else {
            x = clamp(x + Math.sin(angle) * rad, 0, stageW - width);
            y = clamp(
              y + Math.cos(angle) * rad,
              stageH * 0.02,
              stageH * 0.88 - height,
            );
          }
        }
      }
    }

    if (!found) {
      const widthFallback = pickDisplayWidth(stageW, isMobile);
      const x =
        slot.flush === "left"
          ? 0
          : slot.flush === "right"
            ? stageW - widthFallback
            : clamp(
                ((slot.x[0] + slot.x[1]) / 2) * stageW - widthFallback / 2,
                0,
                stageW - widthFallback,
              );
      const y = ((slot.y[0] + slot.y[1]) / 2) * stageH;
      found = { x, y, width: widthFallback, flush: slot.flush };
    }

    placed.push({
      id: slot.id,
      x: found.x,
      y: found.y,
      w: found.width,
      h: found.width * 1.15,
      flush: found.flush,
    });
  }

  const map = new Map<string, OpeningPose>();
  for (const p of placed) {
    map.set(p.id, { x: p.x, y: p.y, width: p.w, flush: p.flush });
  }
  return map;
}
function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function pickWidth(stageWidth: number, isMobile: boolean, _flush: Floater["flush"]) {
  return pickDisplayWidth(stageWidth, isMobile);
}

function floaterRect(f: Floater, now: number): Rect {
  const t = clamp((now - f.bornAt) / f.durationMs, 0, 1);
  const y = f.yStart + f.travel * t;
  return {
    x: f.x,
    y,
    w: f.width,
    h: f.height,
    cx: f.x + f.width / 2,
    cy: y + f.height / 2,
  };
}

function tooClose(a: Rect, b: Rect, stageW: number, stageH: number) {
  const dx = Math.abs(a.cx - b.cx) / stageW;
  const dy = Math.abs(a.cy - b.cy) / stageH;
  /* Ellipse separation — vertical stacking is the main complaint */
  return (dx * dx) / (MIN_SEP_X * MIN_SEP_X) + (dy * dy) / (MIN_SEP_Y * MIN_SEP_Y) < 1;
}

function crowdingScore(
  candidate: Rect,
  others: Rect[],
  stageW: number,
  stageH: number,
) {
  let score = 0;
  for (const o of others) {
    const dx = (candidate.cx - o.cx) / stageW;
    const dy = (candidate.cy - o.cy) / stageH;
    const d2 = dx * dx + dy * dy * 1.35; /* weight vertical proximity harder */
    score += 1 / Math.max(0.004, d2);
    if (tooClose(candidate, o, stageW, stageH)) score += 80;
  }
  return score;
}

/**
 * Five columns: 1 edge-L · 2 mid-L · 3 center · 4 mid-R · 5 edge-R
 * Mid + center get hunger bonus; edges are capped so they can't pile up.
 */
const COLS = 5;
/** 0-indexed — boost mid-left, center, mid-right */
const COL_HUNGER_BONUS = [0, 0.28, 0.18, 0.28, 0];
/** Soft max live frames per column (visible band) */
const COL_SOFT_MAX = [2, 3, 3, 3, 2];

/** How often an edge-column spawn is truly flush — keep rare */
const FLUSH_CHANCE = 0.12;

/** Side frames sit inset so L/R don't read as a hard rail */
function staggeredEdgeX(
  side: "left" | "right",
  stageW: number,
  width: number,
  forceFlush = false,
) {
  if (forceFlush || Math.random() < FLUSH_CHANCE) {
    return side === "left" ? 0 : stageW - width;
  }
  /* Inset ~4–18% of stage — still “side”, clearly not centered */
  const inset = stageW * (0.04 + Math.random() * 0.14);
  if (side === "left") return clamp(inset, 0, stageW - width);
  return clamp(stageW - width - inset, 0, stageW - width);
}

type SpatialBan = { x0: number; x1: number; until: number };

/** True if [a0, a1) overlaps [b0, b1) even by 1px */
function rangesOverlap(a0: number, a1: number, b0: number, b1: number) {
  return a0 < b1 && b0 < a1;
}

function stripBlocked(
  x: number,
  width: number,
  bans: SpatialBan[],
  now: number,
) {
  const a0 = x;
  const a1 = x + width;
  return bans.some((b) => {
    if (now >= b.until) return false;
    const banW = b.x1 - b.x0;
    const hard1 = b.x0 + banW * BAN_KEEP_FRAC;
    /* Only the first 45% of the strip is off-limits; the rest may overlap. */
    return rangesOverlap(a0, a1, b.x0, hard1);
  });
}

function columnOfRect(r: Rect, stageW: number) {
  return clamp(Math.floor((r.cx / stageW) * COLS), 0, COLS - 1);
}

/**
 * Pick X that does NOT intersect the hard (leading 45%) part of any ban.
 * Example: ban [0, 500] → hard [0, 225]; next may start at x ≥ 225.
 */
function pickBalancedPose(options: {
  stageW: number;
  stageH: number;
  others: Rect[];
  width: number;
  preferSide?: "left" | "right" | null;
  bans: SpatialBan[];
  now: number;
}): { x: number; y: number; flush: Floater["flush"] } | null {
  const { stageW, stageH, others, width, preferSide, bans, now } = options;

  if (width >= stageW) return null;

  const colCounts = Array.from({ length: COLS }, () => 0);
  const colHeat = Array.from({ length: COLS }, () => 0);

  for (const o of others) {
    if (o.cy < 0 || o.cy > stageH) continue;
    colCounts[columnOfRect(o, stageW)] += 1;
  }

  for (let col = 0; col < COLS; col++) {
    const cx = ((col + 0.5) / COLS) * stageW;
    for (const o of others) {
      if (o.cy < 0 || o.cy > stageH) continue;
      const dx = (o.cx - cx) / stageW;
      const dy = (o.cy - stageH * 0.45) / stageH;
      colHeat[col] += 1 / Math.max(0.008, dx * dx + dy * dy * 1.2);
    }
    colHeat[col] -= COL_HUNGER_BONUS[col] * 12;
    if (colCounts[col] >= COL_SOFT_MAX[col]) colHeat[col] += 80;
  }

  const cols = Array.from({ length: COLS }, (_, col) => col);
  cols.sort((a, b) => {
    const aFull = colCounts[a] >= COL_SOFT_MAX[a] ? 1 : 0;
    const bFull = colCounts[b] >= COL_SOFT_MAX[b] ? 1 : 0;
    if (preferSide === "left" && colCounts[0] < COL_SOFT_MAX[0]) {
      return (a === 0 ? 0 : 1) - (b === 0 ? 0 : 1) || colHeat[a] - colHeat[b];
    }
    if (preferSide === "right" && colCounts[COLS - 1] < COL_SOFT_MAX[COLS - 1]) {
      return (
        (a === COLS - 1 ? 0 : 1) - (b === COLS - 1 ? 0 : 1) ||
        colHeat[a] - colHeat[b]
      );
    }
    return aFull - bFull || colHeat[a] - colHeat[b];
  });

  const y = stageH + 16 + Math.random() * 48;
  type Candidate = { x: number; flush: Floater["flush"]; score: number };
  const candidates: Candidate[] = [];

  for (const col of cols) {
    if (colCounts[col] >= COL_SOFT_MAX[col]) continue;
    const colX0 = (col / COLS) * stageW;
    const colX1 = ((col + 1) / COLS) * stageW;

    for (let attempt = 0; attempt < 20; attempt++) {
      let x: number;
      let flush: Floater["flush"] = null;
      if (col === 0) {
        x = staggeredEdgeX("left", stageW, width);
        flush = x <= 2 ? "left" : null;
      } else if (col === COLS - 1) {
        x = staggeredEdgeX("right", stageW, width);
        flush = x + width >= stageW - 2 ? "right" : null;
      } else {
        x = clamp(
          lerp(colX0, Math.max(colX0, colX1 - width), Math.random()),
          0,
          stageW - width,
        );
      }

      if (stripBlocked(x, width, bans, now)) continue;
      candidates.push({ x, flush, score: colHeat[col] + Math.random() * 0.01 });
    }
  }

  /* Whole-stage scan fallback — still zero overlap with bans */
  if (candidates.length === 0) {
    const step = Math.max(16, Math.floor(width * 0.2));
    for (let x = 0; x <= stageW - width; x += step) {
      if (stripBlocked(x, width, bans, now)) continue;
      const col = clamp(
        Math.floor(((x + width / 2) / stageW) * COLS),
        0,
        COLS - 1,
      );
      candidates.push({
        x,
        flush: x <= 2 ? "left" : x + width >= stageW - 2 ? "right" : null,
        score: colHeat[col],
      });
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];
  return { x: best.x, y, flush: best.flush };
}

function hasHungryPocket(others: Rect[], stageW: number, stageH: number) {
  const heats = Array.from({ length: COLS }, () => 0);
  const counts = Array.from({ length: COLS }, () => 0);
  for (let col = 0; col < COLS; col++) {
    const cx = ((col + 0.5) / COLS) * stageW;
    for (const o of others) {
      if (o.cy < 0 || o.cy > stageH) continue;
      if (columnOfRect(o, stageW) === col) counts[col] += 1;
      const dx = (o.cx - cx) / stageW;
      const dy = (o.cy - stageH * 0.45) / stageH;
      heats[col] += 1 / Math.max(0.008, dx * dx + dy * dy);
    }
    heats[col] -= COL_HUNGER_BONUS[col] * 8;
    if (counts[col] >= COL_SOFT_MAX[col]) heats[col] += 40;
  }
  /* Ignore edge columns that are already at soft max when judging hunger */
  const eligible = heats.map((h, i) =>
    counts[i] >= COL_SOFT_MAX[i] ? Number.POSITIVE_INFINITY : h,
  );
  const finite = eligible.filter((h) => Number.isFinite(h));
  if (finite.length === 0) return false;
  const min = Math.min(...finite);
  const max = Math.max(...heats.filter((_, i) => counts[i] > 0), 1);
  return min / max < 0.55;
}

export function ProjectsHeroRoll() {
  const stageRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<ProjectsHeroRollItem[]>(deckWithoutCenterOpening());
  const deckIndexRef = useRef(0);
  const floatersRef = useRef<Floater[]>([]);
  const openingPlanRef = useRef<Map<string, OpeningPose> | null>(null);
  const lastSpawnAtRef = useRef(0);
  const spatialBansRef = useRef<SpatialBan[]>([]);
  const uid = useId();
  const seqRef = useRef(0);

  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [lineVisible, setLineVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  function nextItem(): ProjectsHeroRollItem {
    if (deckIndexRef.current >= deckRef.current.length) {
      /* After the reserved opening cycle, allow projectsroll16 back into rotation */
      deckRef.current = shuffle(projectsHeroRoll);
      deckIndexRef.current = 0;
    }
    return deckRef.current[deckIndexRef.current++];
  }

  function commit(next: Floater[]) {
    floatersRef.current = next;
    setFloaters(next);
  }

  function liveRects(now = performance.now()) {
    const stage = stageRef.current;
    if (!stage) return [] as Rect[];
    return floatersRef.current.map((f) => floaterRect(f, now));
  }

  function spawnAt(options: {
    x: number;
    y: number;
    width: number;
    flush: Floater["flush"];
    /** Opening frames stay put — no sideways drift into neighbors */
    lockPose?: boolean;
    /** Pin a specific roll item (opening center = projectsroll16) */
    item?: ProjectsHeroRollItem;
  }): number | false {
    const stage = stageRef.current;
    if (!stage) return false;
    if (floatersRef.current.length >= MAX_ON_SCREEN) return false;

    const { x, y, width, flush, lockPose = false, item: pinned } = options;
    const height = width * 1.25;
    const travel = -(y + height + 80);
    const speed =
      SPEED_PX_PER_S * (1 - SPEED_JITTER / 2 + Math.random() * SPEED_JITTER);
    const durationMs = (Math.abs(travel) / speed) * 1000;
    const drift = 0; /* Keep X fixed so horizontal bans stay honest */

    const depth = pickDepth();
    const speedMul = DEPTH_SPEED[depth];
    const durationMsDepth = durationMs / speedMul;
    const item = pinned ?? nextItem();
    const key = `${uid}-${seqRef.current++}`;
    const style: CSSProperties = {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      zIndex: DEPTH_Z[depth],
      ["--roll-travel" as string]: `${travel}px`,
      ["--roll-drift" as string]: `${drift}px`,
      animationDuration: `${durationMsDepth}ms`,
    };

    const floater: Floater = {
      key,
      item,
      style,
      depth,
      x,
      yStart: y,
      width,
      height,
      travel,
      durationMs: durationMsDepth,
      bornAt: performance.now(),
      flush,
    };

    commit([...floatersRef.current, floater]);
    return durationMs;
  }

  function spawnOpening(slot: OpeningSlot) {
    const stage = stageRef.current;
    if (!stage) return;

    if (!openingPlanRef.current) {
      openingPlanRef.current = planOpeningLayout(
        stage.clientWidth,
        stage.clientHeight,
        window.innerWidth <= 700,
      );
    }

    const pose = openingPlanRef.current.get(slot.id);
    if (!pose) return;
    const durationMs = spawnAt({
      x: pose.x,
      y: pose.y,
      width: pose.width,
      flush: pose.flush,
      lockPose: true,
      item: slot.id === "center" ? centerOpeningItem() : undefined,
    });
    if (durationMs) {
      banStrip(pose.x, pose.width);
    }
  }

  function pruneBans(now = performance.now()) {
    spatialBansRef.current = spatialBansRef.current
      .filter((b) => b.until > now)
      .slice(-MAX_ACTIVE_BANS);
  }

  /**
   * Record the spawn's [x, x+width]. Only the leading BAN_KEEP_FRAC is hard-blocked
   * for the next few frames — they may start from ~45% into this strip.
   */
  function banStrip(x: number, width: number) {
    const now = performance.now();
    pruneBans(now);
    spatialBansRef.current.push({
      x0: x,
      x1: x + width,
      until: now + SPATIAL_BAN_MS,
    });
    if (spatialBansRef.current.length > MAX_ACTIVE_BANS) {
      spatialBansRef.current = spatialBansRef.current.slice(-MAX_ACTIVE_BANS);
    }
  }

  function spawnBalanced() {
    const stage = stageRef.current;
    if (!stage) return false;
    if (floatersRef.current.length >= MAX_ON_SCREEN) return false;

    const now = performance.now();
    if (now - lastSpawnAtRef.current < SPAWN_COOLDOWN_MS) return false;
    pruneBans(now);

    const isMobile = window.innerWidth <= 700;
    const others = liveRects().filter(
      (o) => o.cy > 0 && o.cy < stage.clientHeight,
    );
    const hasLeftCol = others.some((o) => columnOfRect(o, stage.clientWidth) === 0);
    const hasRightCol = others.some(
      (o) => columnOfRect(o, stage.clientWidth) === COLS - 1,
    );
    const leftCount = others.filter(
      (o) => columnOfRect(o, stage.clientWidth) === 0,
    ).length;
    const rightCount = others.filter(
      (o) => columnOfRect(o, stage.clientWidth) === COLS - 1,
    ).length;
    const preferSide =
      !hasLeftCol && leftCount < COL_SOFT_MAX[0]
        ? "left"
        : !hasRightCol && rightCount < COL_SOFT_MAX[COLS - 1]
          ? "right"
          : null;
    const width = pickWidth(stage.clientWidth, isMobile, null);

    let bans = spatialBansRef.current;
    let pose = pickBalancedPose({
      stageW: stage.clientWidth,
      stageH: stage.clientHeight,
      others,
      width,
      preferSide,
      bans,
      now,
    });

    /*
     * If bans locked the whole stage and we're under target, drop the oldest
     * ban (keep the most recent strip rule) and try again.
     */
    if (!pose && floatersRef.current.length < TARGET_ON_SCREEN) {
      while (!pose && spatialBansRef.current.length > 0) {
        spatialBansRef.current.shift();
        bans = spatialBansRef.current;
        pose = pickBalancedPose({
          stageW: stage.clientWidth,
          stageH: stage.clientHeight,
          others,
          width,
          preferSide,
          bans,
          now,
        });
      }
    }

    if (!pose) return false;
    const durationMs = spawnAt({
      x: pose.x,
      y: pose.y,
      width,
      flush: pose.flush,
    });
    if (!durationMs) return false;
    lastSpawnAtRef.current = performance.now();
    banStrip(pose.x, width);
    return true;
  }

  /** Sole continuous feeder: emptiest pocket, one frame per cooldown */
  function watchAndFill() {
    const stage = stageRef.current;
    if (!stage) return;
    const others = liveRects();
    const underTarget = floatersRef.current.length < TARGET_ON_SCREEN;
    const hungry = hasHungryPocket(
      others,
      stage.clientWidth,
      stage.clientHeight,
    );
    if (underTarget || hungry) {
      spawnBalanced();
    }
  }

  function onEnd(key: string, event: AnimationEvent<HTMLElement>) {
    if (event.animationName !== "projects-hero-roll-up") return;
    commit(floatersRef.current.filter((f) => f.key !== key));
    /*
     * Don't spawn here — several frames can end in one tick and dump a cluster.
     * The emptiness watchdog refills one-by-one on cooldown.
     */
  }

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (reduced) return;

    const timers: number[] = [];
    let watchId: number | undefined;

    for (const slot of OPENING) {
      timers.push(window.setTimeout(() => spawnOpening(slot), slot.delayMs));
    }

    /* After opening lands, drip-feed from below into emptiest columns */
    timers.push(
      window.setTimeout(() => {
        lastSpawnAtRef.current = performance.now();
        watchId = window.setInterval(watchAndFill, WATCH_MS);
      }, 1600),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      if (watchId) window.clearInterval(watchId);
      openingPlanRef.current = null;
      spatialBansRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    if (reduced || projectsHeroLines.length < 2) return;

    let fadeTimer: number | undefined;
    const cycle = window.setInterval(() => {
      setLineVisible(false);
      fadeTimer = window.setTimeout(() => {
        setLineIndex((i) => (i + 1) % projectsHeroLines.length);
        setLineVisible(true);
      }, LINE_FADE_MS);
    }, LINE_HOLD_MS);

    return () => {
      window.clearInterval(cycle);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, [reduced]);

  const staticPreview = projectsHeroRoll.slice(0, 8);

  return (
    <section className="projects-cover projects-cover--roll" aria-label="Projects">
      <div className="projects-hero-roll" aria-hidden="true">
        <div ref={stageRef} className="projects-hero-roll__stage is-ready">
          {reduced
            ? staticPreview.map((item, index) => {
                const depth: Depth =
                  index % 3 === 0 ? "near" : index % 3 === 1 ? "mid" : "far";
                return (
                  <figure
                    key={item.id}
                    className={`projects-hero-roll__frame projects-hero-roll__frame--static projects-hero-roll__frame--s${index} projects-hero-roll__frame--${depth}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt="" draggable={false} />
                  </figure>
                );
              })
            : floaters.map((floater) => (
                <figure
                  key={floater.key}
                  className={`projects-hero-roll__frame projects-hero-roll__frame--${floater.depth}`}
                  style={floater.style}
                  onAnimationEnd={(event) => onEnd(floater.key, event)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={floater.item.src} alt="" draggable={false} />
                </figure>
              ))}
        </div>
        <div className="projects-hero-roll__veil" />
        <div className="projects-hero-roll__grain" />
      </div>

      <div className="projects-hero-roll__copy">
        <p
          className={`projects-hero-roll__line${lineVisible ? " is-visible" : ""}`}
          aria-live="polite"
        >
          {projectsHeroLines[lineIndex].map((row, rowIndex) => (
            <span key={`${lineIndex}-${row}`} className="projects-hero-roll__line-row">
              {rowIndex > 0 ? <br /> : null}
              {row}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
