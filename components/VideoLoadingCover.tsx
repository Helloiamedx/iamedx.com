"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  SITE_MARK_BOTTOM_D,
  SITE_MARK_TOP_D,
} from "@/lib/siteMark";
import { markVideoLoaded } from "@/lib/videoLoadMemory";

type VideoLoadingCoverProps = {
  /**
   * Buffer progress 0–100 — kept for aria; stroke no longer tracks it.
   * Animation loops full outlines until `ready`, then fill → unveil.
   */
  progress: number;
  /** True when enough is buffered for smooth first play */
  ready: boolean;
  /**
   * Only the queue’s current on-screen clip should animate.
   * While false: render nothing (no black waiting plate).
   */
  active?: boolean;
  /** First frame is painted — keep mark, clear solid black plate */
  framed?: boolean;
  /** Stable id — remembered after a successful unveil (tab session) */
  cacheKey?: string;
  /** Fires when the cover begins fading — parent should reveal the video then */
  onDone?: () => void;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function ease(value: number) {
  const progress = clamp01(value);
  return progress * progress * (3 - 2 * progress);
}

/** Loop while waiting — one full outline draw per cycle (no wipe-back) */
const STROKE_CYCLE_MS = 2400;
/** Once the clip is playable: snap outline full → fill → unveil (no extra stroke rounds) */
const BEFORE_FILL_MS = 20;
const FILL_MS = 320;
const HOLD_MS = 40;

function strokeDrawProgress(localMs: number, cycleMs: number) {
  return ease(clamp01(localMs / cycleMs));
}

/**
 * Fraction of the media timeline buffered contiguously from the start.
 * Per-element only — never page-wide.
 */
export function readBufferedRatio(el: HTMLVideoElement): number {
  const { duration, buffered } = el;
  if (
    !duration ||
    !Number.isFinite(duration) ||
    duration <= 0 ||
    buffered.length === 0
  ) {
    return 0;
  }
  try {
    let end = 0;
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const stop = buffered.end(i);
      if (start <= end + 0.35) {
        end = Math.max(end, stop);
      } else if (start <= 0.35) {
        end = stop;
      } else {
        break;
      }
    }
    return clamp01(end / duration);
  } catch {
    return 0;
  }
}

export function readyTargetRatio(el: HTMLVideoElement): number {
  const { duration } = el;
  if (duration && Number.isFinite(duration) && duration > 0) {
    if (duration <= 20) {
      return Math.min(0.55, Math.max(0.4, 5 / duration));
    }
    return Math.min(0.45, Math.max(7 / duration, 0.28));
  }
  return 0.5;
}

export function isVideoBufferReady(el: HTMLVideoElement): boolean {
  const ratio = readBufferedRatio(el);
  const { duration, readyState } = el;

  if (readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA && ratio >= 0.2) {
    return true;
  }
  if (ratio >= 0.8) return true;
  if (duration && Number.isFinite(duration) && duration > 0) {
    return ratio >= readyTargetRatio(el);
  }
  return readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
}

export function readVideoBufferProgress(el: HTMLVideoElement): number {
  const ratio = readBufferedRatio(el);
  if (ratio > 0) {
    const need = Math.max(0.08, readyTargetRatio(el));
    return clampProgress((ratio / need) * 100);
  }

  const { readyState } = el;
  if (readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) return 100;
  if (readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return 55;
  if (readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return 28;
  if (readyState >= HTMLMediaElement.HAVE_METADATA) return 10;
  return 0;
}

/**
 * Site mark loader for videos:
 * - `active` false: render nothing (no black “waiting” plate — load continues in queue)
 * - `active` true: loop full outlines while buffering; on `ready`, fill → unveil
 */
export function VideoLoadingCover({
  progress,
  ready,
  active = true,
  framed = false,
  cacheKey,
  onDone,
}: VideoLoadingCoverProps) {
  const [exiting, setExiting] = useState(false);
  const [cycle, setCycle] = useState(0);
  const coverRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const outlineGroupRef = useRef<SVGGElement>(null);
  const readyRef = useRef(ready);
  const onDoneRef = useRef(onDone);
  const doneFiredRef = useRef(false);

  /* Sync every render so the rAF loop sees ready without waiting an effect */
  readyRef.current = ready;
  onDoneRef.current = onDone;

  useLayoutEffect(() => {
    doneFiredRef.current = false;
    setExiting(false);
    if (active) setCycle((n) => n + 1);
  }, [cacheKey, active]);

  /* ready flipped false again — restart stroke loop */
  const wasReadyRef = useRef(false);
  useEffect(() => {
    if (!active) return;
    if (ready) {
      wasReadyRef.current = true;
      return;
    }
    if (!wasReadyRef.current) return;
    wasReadyRef.current = false;
    setExiting(false);
    doneFiredRef.current = false;
    setCycle((n) => n + 1);
  }, [ready, active]);

  useLayoutEffect(() => {
    if (!active) return;

    const cover = coverRef.current;
    const fill = fillRef.current;
    const outlineGroup = outlineGroupRef.current;
    if (!cover || !fill || !outlineGroup) return;
    const coverEl = cover;
    const fillEl = fill;
    const outlineGroupEl = outlineGroup;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    outlineGroupEl.replaceChildren();
    const outlines = [SITE_MARK_BOTTOM_D, SITE_MARK_TOP_D].map((d) => {
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", d);
      path.setAttribute("pathLength", "1000");
      path.setAttribute("class", "video-loading-cover__outline");
      path.style.strokeDashoffset = "1000";
      path.style.opacity = "1";
      outlineGroupEl.appendChild(path);
      return path;
    });

    coverEl.style.opacity = "1";
    coverEl.style.setProperty("--video-load-mark-opacity", "1");
    fillEl.style.opacity = "0";

    const startedAt = performance.now();
    let readyAt = Infinity;
    let frameId = 0;
    let aborted = false;
    let finished = false;

    function unveil() {
      if (aborted || finished) return;
      finished = true;
      cancelAnimationFrame(frameId);
      if (cacheKey) markVideoLoaded(cacheKey);
      setExiting(true);
      if (!doneFiredRef.current) {
        doneFiredRef.current = true;
        onDoneRef.current?.();
      }
    }

    function tick(now: number) {
      if (aborted || finished) return;

      const elapsed = now - startedAt;
      const reduce = reducedMotion.matches;
      const cycleMs = STROKE_CYCLE_MS;

      /* Video playable → leave the loop immediately (no ceil-to-next-cycle wait) */
      if (!Number.isFinite(readyAt) && (readyRef.current || reduce)) {
        readyAt = elapsed;
      }

      const fillStart = Number.isFinite(readyAt)
        ? readyAt + BEFORE_FILL_MS
        : Infinity;
      const revealStart = fillStart + FILL_MS + HOLD_MS;
      const fillProgress = Number.isFinite(readyAt)
        ? ease((elapsed - fillStart) / FILL_MS)
        : 0;

      let traceProgress: number;
      if (reduce || Number.isFinite(readyAt)) {
        /* Ready: outline complete so fill can read clearly */
        traceProgress = 1;
      } else {
        traceProgress = strokeDrawProgress(elapsed % cycleMs, cycleMs);
      }

      outlines.forEach((path, index) => {
        const stagger = index === 0 ? 0.12 : 0;
        const segment = reduce
          ? 1
          : clamp01((traceProgress - stagger) / (1 - stagger));
        path.style.strokeDashoffset = String(1000 * (1 - segment));
        path.style.opacity = String(
          (segment > 0 ? 1 : 0) * (1 - fillProgress),
        );
      });

      fillEl.style.opacity = String(fillProgress);

      if (Number.isFinite(readyAt) && elapsed >= revealStart) {
        coverEl.style.setProperty("--video-load-mark-opacity", "0");
        unveil();
        return;
      }

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      aborted = true;
      cancelAnimationFrame(frameId);
    };
  }, [cycle, cacheKey, active]);

  if (!active) return null;

  const ariaNow = exiting ? 100 : Math.round(clampProgress(progress));

  return (
    <div
      ref={coverRef}
      className={`video-loading-cover${exiting ? " is-ready" : ""}${framed ? " is-framed" : ""}${ready ? " is-finishing" : " is-loading"}`}
      aria-hidden={exiting}
      aria-busy={!exiting}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={ariaNow}
      aria-label="Loading video"
    >
      <div className="video-loading-cover__mark">
        <svg
          className="video-loading-cover__svg"
          viewBox="0 0 500 500"
          width={160}
          height={160}
          aria-hidden="true"
          focusable="false"
        >
          <g ref={fillRef} className="video-loading-cover__fill">
            <path d={SITE_MARK_BOTTOM_D} />
            <path d={SITE_MARK_TOP_D} />
          </g>
          <g ref={outlineGroupRef} />
        </svg>
      </div>
    </div>
  );
}

/** @deprecated Use VideoLoadingCover — same shared mark loader */
export function HeroVideoLoadingMark(props: {
  progress: number;
  ready: boolean;
  onDone?: () => void;
  cacheKey?: string;
}) {
  return <VideoLoadingCover {...props} />;
}

/**
 * Tracks THIS video’s buffer. Plays muted under the cover as soon as
 * pixels exist so remounts don’t stutter after unveil.
 * `ready` flips at the buffer gate — do not wait on a second “lead” delay
 * (that made the mark loader feel like it slowed downloads).
 */
export function useVideoLoadProgress(
  videoRef: RefObject<HTMLVideoElement | null>,
  resetKey: string,
) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    setProgress(0);
    setReady(false);
    const el = videoRef.current;
    if (!el || !resetKey) return;

    let done = false;
    let frameId = 0;
    let lastPosted = -1;
    let frameCount = 0;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(frameId);
      setProgress(100);
      setReady(true);
      void el.play().catch(() => {});
    };

    const nudgePlayback = () => {
      if (el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      void el.play().catch(() => {});
    };

    const sample = () => {
      if (done) return;
      const next = readVideoBufferProgress(el);
      if (Math.abs(next - lastPosted) >= 2 || next >= 99) {
        lastPosted = next;
        setProgress((prev) => Math.max(prev, next));
      }
      nudgePlayback();
      if (isVideoBufferReady(el)) finish();
    };

    const onError = () => finish();

    el.addEventListener("progress", sample);
    el.addEventListener("loadeddata", sample);
    el.addEventListener("loadedmetadata", sample);
    el.addEventListener("canplay", sample);
    el.addEventListener("canplaythrough", sample);
    el.addEventListener("playing", sample);
    el.addEventListener("error", onError);

    try {
      if (el.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        el.load();
      }
    } catch {
      /* ignore */
    }
    nudgePlayback();
    sample();

    const poll = () => {
      frameCount += 1;
      if (frameCount % 2 === 0) sample();
      if (!done) frameId = requestAnimationFrame(poll);
    };
    frameId = requestAnimationFrame(poll);

    const safetyHard = window.setTimeout(() => {
      if (!done) finish();
    }, 12000);

    return () => {
      done = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(safetyHard);
      el.removeEventListener("progress", sample);
      el.removeEventListener("loadeddata", sample);
      el.removeEventListener("loadedmetadata", sample);
      el.removeEventListener("canplay", sample);
      el.removeEventListener("canplaythrough", sample);
      el.removeEventListener("playing", sample);
      el.removeEventListener("error", onError);
    };
  }, [videoRef, resetKey]);

  return { progress, ready };
}
