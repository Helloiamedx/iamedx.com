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
   * 0–100 stroke progress for THIS video.
   * 100 = enough buffer to play (ready gate), not necessarily the whole file.
   */
  progress: number;
  /** True when enough is buffered for smooth first play */
  ready: boolean;
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

/** After stroke hits the ready gate: fill → brief hold → fade with video */
const BEFORE_FILL_MS = 30;
const FILL_MS = 480;
const HOLD_MS = 40;
/** Stroke eases toward live progress (smooths chunky buffer jumps) */
const TRACE_CATCHUP = 0.42;
/** Tiny tip so the stroke reads immediately — not fake progress */
const STROKE_TIP = 0.03;

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
 * Always: stroke (tracks buffer) → fill → unveil.
 * When buffer is stalled (no progress), the stroke line breathes — not the whole mark.
 */
export function VideoLoadingCover({
  progress,
  ready,
  framed = false,
  cacheKey,
  onDone,
}: VideoLoadingCoverProps) {
  const [exiting, setExiting] = useState(false);
  const [stalled, setStalled] = useState(true);
  const [cycle, setCycle] = useState(0);
  const coverRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const outlineGroupRef = useRef<SVGGElement>(null);
  const readyRef = useRef(ready);
  const progressRef = useRef(progress);
  const stalledRef = useRef(true);
  const onDoneRef = useRef(onDone);
  const doneFiredRef = useRef(false);
  const lastProgressRef = useRef(progress);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    stalledRef.current = stalled;
  }, [stalled]);

  /* Stall = no buffer progress for a beat (first-load “still waiting”) */
  useEffect(() => {
    if (exiting || ready) {
      setStalled(false);
      return;
    }

    const moved = progress > lastProgressRef.current + 0.5;
    lastProgressRef.current = progress;
    if (moved) setStalled(false);

    const id = window.setTimeout(() => setStalled(true), 380);
    return () => window.clearTimeout(id);
  }, [progress, ready, exiting, cacheKey]);

  useLayoutEffect(() => {
    doneFiredRef.current = false;
    setExiting(false);
    setStalled(true);
    lastProgressRef.current = 0;
    setCycle((n) => n + 1);
  }, [cacheKey]);

  /* ready flipped false again — restart stroke cycle */
  const wasReadyRef = useRef(false);
  useEffect(() => {
    if (ready) {
      wasReadyRef.current = true;
      return;
    }
    if (!wasReadyRef.current) return;
    wasReadyRef.current = false;
    setExiting(false);
    doneFiredRef.current = false;
    setStalled(true);
    setCycle((n) => n + 1);
  }, [ready]);

  useLayoutEffect(() => {
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
      path.style.strokeDashoffset = "970";
      path.style.opacity = "1";
      outlineGroupEl.appendChild(path);
      return path;
    });

    coverEl.style.opacity = "1";
    coverEl.style.setProperty("--video-load-mark-opacity", "1");
    fillEl.style.opacity = "0";

    let displayTrace = STROKE_TIP;
    let strokeCompleteAt = Infinity;
    let frameId = 0;
    let aborted = false;
    let finished = false;
    let lastNow = performance.now();

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

      const dt = Math.min(48, Math.max(0, now - lastNow));
      lastNow = now;
      const reduce = reducedMotion.matches;

      if (reduce) {
        displayTrace = 1;
      } else {
        const gate01 = clampProgress(progressRef.current) / 100;
        const target = readyRef.current ? 1 : Math.max(STROKE_TIP, gate01);
        const catchupRate = readyRef.current
          ? Math.min(0.85, TRACE_CATCHUP * 2.2)
          : TRACE_CATCHUP;
        const catchup = 1 - Math.pow(1 - catchupRate, dt / 16.67);
        displayTrace += (target - displayTrace) * catchup;
        if (Math.abs(target - displayTrace) < 0.002) displayTrace = target;
      }

      if (
        !Number.isFinite(strokeCompleteAt) &&
        (readyRef.current || reduce) &&
        displayTrace >= 0.992
      ) {
        displayTrace = 1;
        strokeCompleteAt = now;
      }

      const fillStart = strokeCompleteAt + BEFORE_FILL_MS;
      const revealStart = fillStart + FILL_MS + HOLD_MS;
      const fillProgress = Number.isFinite(strokeCompleteAt)
        ? ease((now - fillStart) / FILL_MS)
        : 0;

      outlines.forEach((path, index) => {
        const stagger = index === 0 ? 0.06 : 0;
        const denom = Math.max(0.001, 1 - stagger);
        const segment = clamp01((displayTrace - stagger) / denom);
        path.style.strokeDashoffset = String(1000 * (1 - segment));
        /*
         * Breath ONLY the drawn stroke while buffer is stalled —
         * never the whole filled mark.
         */
        let strokeAlpha = (segment > 0.001 ? 1 : 0) * (1 - fillProgress);
        if (
          strokeAlpha > 0 &&
          stalledRef.current &&
          !readyRef.current &&
          fillProgress < 0.02
        ) {
          const breath =
            0.4 + 0.6 * (0.5 + 0.5 * Math.sin((now / 1350) * Math.PI * 2));
          strokeAlpha *= breath;
        }
        path.style.opacity = String(strokeAlpha);
      });

      fillEl.style.opacity = String(fillProgress);

      if (Number.isFinite(strokeCompleteAt) && now >= revealStart) {
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
  }, [cycle, cacheKey]);

  const ariaNow = exiting ? 100 : Math.round(clampProgress(progress));

  return (
    <div
      ref={coverRef}
      className={`video-loading-cover${exiting ? " is-ready" : ""}${framed ? " is-framed" : ""}${ready ? " is-finishing" : " is-loading"}${stalled && !exiting && !ready ? " is-stalled" : ""}`}
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
 * Contiguous buffered seconds ahead of the playhead.
 */
function readForwardLeadSec(el: HTMLVideoElement): number {
  const t = el.currentTime || 0;
  const { buffered } = el;
  if (!buffered || buffered.length === 0) return 0;
  try {
    let best = 0;
    for (let i = 0; i < buffered.length; i++) {
      const start = buffered.start(i);
      const end = buffered.end(i);
      if (start <= t + 0.35 && end > t) {
        best = Math.max(best, end - t);
      }
    }
    return best;
  } catch {
    return 0;
  }
}

function hasPlayableLead(el: HTMLVideoElement): boolean {
  if (el.videoWidth <= 0) return false;
  if (el.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) return true;
  return readForwardLeadSec(el) >= 1.2;
}

/**
 * After the buffer gate: keep playing under the cover until we have a frame
 * + short lead, then flip `ready` so stroke can finish → fill → unveil
 * onto an already-warm decoder (avoids remount stutter).
 */
function whenPlayableUnderCover(
  el: HTMLVideoElement,
  onReady: () => void,
  hardMs = 4000,
): () => void {
  let settled = false;
  let hardId = 0;
  let pollId = 0;
  let rvfcId: number | null = null;

  const settle = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(hardId);
    window.clearInterval(pollId);
    if (
      rvfcId != null &&
      typeof el.cancelVideoFrameCallback === "function"
    ) {
      try {
        el.cancelVideoFrameCallback(rvfcId);
      } catch {
        /* ignore */
      }
    }
    el.removeEventListener("playing", trySettle);
    el.removeEventListener("progress", trySettle);
    el.removeEventListener("canplay", trySettle);
    el.removeEventListener("loadeddata", trySettle);
    onReady();
  };

  const trySettle = () => {
    if (settled) return;
    if (el.paused) {
      void el.play().catch(() => {});
    }
    if (!hasPlayableLead(el)) return;
    if (el.paused) return;
    settle();
  };

  el.addEventListener("playing", trySettle);
  el.addEventListener("progress", trySettle);
  el.addEventListener("canplay", trySettle);
  el.addEventListener("loadeddata", trySettle);

  if (typeof el.requestVideoFrameCallback === "function") {
    try {
      rvfcId = el.requestVideoFrameCallback(() => trySettle());
    } catch {
      rvfcId = null;
    }
  }

  void el.play().catch(() => {});
  trySettle();
  pollId = window.setInterval(trySettle, 80);
  hardId = window.setTimeout(settle, hardMs);

  return () => {
    settled = true;
    window.clearTimeout(hardId);
    window.clearInterval(pollId);
    if (
      rvfcId != null &&
      typeof el.cancelVideoFrameCallback === "function"
    ) {
      try {
        el.cancelVideoFrameCallback(rvfcId);
      } catch {
        /* ignore */
      }
    }
    el.removeEventListener("playing", trySettle);
    el.removeEventListener("progress", trySettle);
    el.removeEventListener("canplay", trySettle);
    el.removeEventListener("loadeddata", trySettle);
  };
}

/**
 * Tracks THIS video’s buffer. Plays muted under the cover as soon as
 * pixels exist so remounts don’t stutter after unveil.
 * `ready` means: buffer gate hit AND playing with a short lead.
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
    let stopPlayWait: (() => void) | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(frameId);
      setProgress(100);
      stopPlayWait?.();
      stopPlayWait = whenPlayableUnderCover(el, () => setReady(true), 4000);
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
    }, 16000);

    return () => {
      done = true;
      cancelAnimationFrame(frameId);
      window.clearTimeout(safetyHard);
      stopPlayWait?.();
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
