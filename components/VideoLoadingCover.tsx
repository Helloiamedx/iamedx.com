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
   * Readiness estimate 0–100 — not a byte-download percentage.
   * Animation loops full outlines until `ready`, then fill → unveil.
   */
  progress: number;
  /** True once playback starts, or the player reports a failure. */
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

/** Loop while waiting — faster than the fullscreen intro. */
const STROKE_CYCLE_MS = 1200;
/** Once ready: finish the current outline, fill it, then unveil. */
const FINISH_STROKE_MS = 280;
const BEFORE_FILL_MS = 40;
const FILL_MS = 520;
const HOLD_MS = 90;

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

/** Readiness is local to the current playback position, never a file percentage. */
export function isVideoBufferReady(el: HTMLVideoElement): boolean {
  return !el.seeking && el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA;
}

export function readVideoBufferProgress(el: HTMLVideoElement): number {
  if (isVideoBufferReady(el)) return 100;
  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return 70;
  if (el.readyState >= HTMLMediaElement.HAVE_METADATA) return 30;
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
    let readyTrace = 0;
    let frameId = 0;
    let aborted = false;
    let finished = false;

    function unveil() {
      if (aborted || finished) return;
      finished = true;
      cancelAnimationFrame(frameId);
      if (cacheKey && readyRef.current) markVideoLoaded(cacheKey);
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
      if (!Number.isFinite(readyAt) && readyRef.current) {
        readyAt = elapsed;
        readyTrace = strokeDrawProgress(elapsed % cycleMs, cycleMs);
      }

      const fillStart = Number.isFinite(readyAt)
        ? readyAt + FINISH_STROKE_MS + BEFORE_FILL_MS
        : Infinity;
      const revealStart = fillStart + FILL_MS + HOLD_MS;
      const fillProgress = Number.isFinite(readyAt)
        ? ease((elapsed - fillStart) / FILL_MS)
        : 0;

      let traceProgress: number;
      if (reduce) {
        traceProgress = 1;
      } else if (Number.isFinite(readyAt)) {
        const finishProgress = ease((elapsed - readyAt) / FINISH_STROKE_MS);
        traceProgress = readyTrace + (1 - readyTrace) * finishProgress;
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

/** Observe readiness only. Playback belongs to the player's controller. */
export function useVideoLoadProgress(
  videoRef: RefObject<HTMLVideoElement | null>,
  resetKey: string,
) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useLayoutEffect(() => {
    setProgress(0);
    setReady(false);
    setFailed(false);
    const el = videoRef.current;
    if (!el || !resetKey) return;

    const sample = () => {
      setProgress(readVideoBufferProgress(el));
      setReady(isVideoBufferReady(el));
    };
    const onError = () => setFailed(true);
    const events = ["progress", "loadeddata", "loadedmetadata", "canplay", "playing", "seeked"];
    events.forEach((event) => el.addEventListener(event, sample));
    el.addEventListener("error", onError);
    sample();
    if (el.error) onError();
    return () => {
      events.forEach((event) => el.removeEventListener(event, sample));
      el.removeEventListener("error", onError);
    };
  }, [videoRef, resetKey]);

  return { progress, ready, failed };
}
