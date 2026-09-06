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
import {
  markVideoLoaded,
  wasVideoLoaded,
} from "@/lib/videoLoadMemory";

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
  /**
   * Video URL (or stable id). Once loaded once in this tab, later mounts
   * skip the stroke animation.
   */
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
const FILL_MS = 520;
const HOLD_MS = 80;
/** Stroke eases toward live progress (smooths chunky buffer jumps) */
const TRACE_CATCHUP = 0.42;
/** Tiny tip so the mark reads immediately — not fake progress */
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

/**
 * How much of the file we need before first play feels smooth.
 * First unveil waits for a real lead — early play under the cover was causing
 * underrun stutter that continued after the cover lifted.
 */
export function readyTargetRatio(el: HTMLVideoElement): number {
  const { duration } = el;
  if (duration && Number.isFinite(duration) && duration > 0) {
    if (duration <= 20) {
      /* Short loops: ~5s lead or ~40–55% */
      return Math.min(0.55, Math.max(0.4, 5 / duration));
    }
    /* Longer: ~7s or ~28% */
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

/**
 * 0–100 for the stroke: 100 means “hit the ready gate”, not “downloaded 100% of the file”.
 * That way the line finishes when we can play — no empty chase after ready.
 */
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
 * Video load UI — stroke tracks THIS clip’s buffer toward the ready gate;
 * fill only after that; then unveil. Tab-cached srcs skip motion.
 */
export function VideoLoadingCover({
  progress,
  ready,
  framed = false,
  cacheKey,
  onDone,
}: VideoLoadingCoverProps) {
  /*
   * Do not read sessionStorage during render — SSR has no storage, so
   * wasVideoLoaded() would hydrate with a different className / aria-hidden.
   */
  const [exiting, setExiting] = useState(false);
  const [skipMotion, setSkipMotion] = useState(false);
  const [cycle, setCycle] = useState(0);
  const coverRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<SVGGElement>(null);
  const outlineGroupRef = useRef<SVGGElement>(null);
  const readyRef = useRef(ready);
  const progressRef = useRef(progress);
  const onDoneRef = useRef(onDone);
  const doneFiredRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  /* Reset gate whenever the clip identity changes */
  useLayoutEffect(() => {
    doneFiredRef.current = false;
    setExiting(false);
    const cached = Boolean(cacheKey && wasVideoLoaded(cacheKey));
    setSkipMotion(cached);
    /*
     * Same layout pass as skipMotion — don’t wait for a re-render, or the
     * plate paints as dead black (no stroke outlines when stroke RAF bails).
     */
    if (cached) {
      const fill = fillRef.current;
      const cover = coverRef.current;
      if (fill) fill.style.opacity = "1";
      cover?.style.setProperty("--video-load-mark-opacity", "1");
    }
  }, [cacheKey]);

  /* Tab-cached: skip stroke; unveil only once THIS element reports ready */
  useLayoutEffect(() => {
    if (!cacheKey || !wasVideoLoaded(cacheKey)) return;
    if (!ready || doneFiredRef.current) return;
    doneFiredRef.current = true;
    setExiting(true);
    onDoneRef.current?.();
  }, [cacheKey, ready]);

  const wasReadyRef = useRef(false);
  useEffect(() => {
    if (ready) {
      wasReadyRef.current = true;
      return;
    }
    if (!wasReadyRef.current) return;
    wasReadyRef.current = false;
    if (cacheKey && wasVideoLoaded(cacheKey)) {
      setSkipMotion(true);
      const fill = fillRef.current;
      if (fill) fill.style.opacity = "1";
      return;
    }
    setSkipMotion(false);
    setExiting(false);
    doneFiredRef.current = false;
    setCycle((n) => n + 1);
  }, [ready, cacheKey]);

  /* Keep solid mark visible while cached wait is still up */
  useLayoutEffect(() => {
    if (!skipMotion || exiting) return;
    const fill = fillRef.current;
    if (fill) fill.style.opacity = "1";
  }, [skipMotion, exiting, cacheKey]);

  useLayoutEffect(() => {
    if (cacheKey && wasVideoLoaded(cacheKey)) return;

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
        /*
         * progress is already normalized to the ready gate (100 = can play).
         * When ready, snap the last hair — no long chase past real buffer.
         */
        const gate01 = clampProgress(progressRef.current) / 100;
        const target = readyRef.current
          ? 1
          : Math.max(STROKE_TIP, gate01);
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
        path.style.opacity = String(
          (segment > 0.001 ? 1 : 0) * (1 - fillProgress),
        );
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

  const ariaNow =
    exiting || skipMotion ? 100 : Math.round(clampProgress(progress));

  return (
    <div
      ref={coverRef}
      className={`video-loading-cover${exiting ? " is-ready" : ""}${skipMotion ? " is-instant" : ""}${skipMotion && !exiting ? " is-warm" : ""}${framed ? " is-framed" : ""}${ready ? " is-finishing" : " is-loading"}`}
      aria-hidden={exiting || skipMotion}
      aria-busy={!exiting && !skipMotion}
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
 * Resolve only once THIS element has a paintable frame (or hard timeout).
 * Avoids lifting the cover onto a still-black video plate.
 * Call only after the buffer gate — play starts here, not during early load.
 */
function whenVideoHasFrame(
  el: HTMLVideoElement,
  onFrame: () => void,
  hardMs = 2800,
): () => void {
  let settled = false;
  let softId = 0;
  let hardId = 0;
  let rvfcId: number | null = null;

  const settle = () => {
    if (settled) return;
    settled = true;
    window.clearTimeout(softId);
    window.clearTimeout(hardId);
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
    el.removeEventListener("playing", settle);
    el.removeEventListener("loadeddata", onData);
    el.removeEventListener("canplay", onData);
    onFrame();
  };

  const onData = () => {
    if (el.videoWidth <= 0) return;
    if (el.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
    /* Prefer a real presented frame; soft-settle if decode already has pixels */
    window.clearTimeout(softId);
    softId = window.setTimeout(() => {
      if (el.videoWidth > 0) settle();
    }, 90);
  };

  el.addEventListener("playing", settle);
  el.addEventListener("loadeddata", onData);
  el.addEventListener("canplay", onData);

  if (typeof el.requestVideoFrameCallback === "function") {
    try {
      rvfcId = el.requestVideoFrameCallback(() => settle());
    } catch {
      rvfcId = null;
    }
  }

  try {
    if (el.currentTime > 0.05) el.currentTime = 0;
  } catch {
    /* seek can throw before metadata */
  }
  void el.play().catch(() => {});
  if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) onData();

  hardId = window.setTimeout(settle, hardMs);

  return () => {
    settled = true;
    window.clearTimeout(softId);
    window.clearTimeout(hardId);
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
    el.removeEventListener("playing", settle);
    el.removeEventListener("loadeddata", onData);
    el.removeEventListener("canplay", onData);
  };
}

/**
 * Tracks THIS video’s buffer until the ready gate.
 * Progress is gate-normalized (100 = can play). `ready` waits for a painted
 * frame so the cover never unveils onto dead black.
 * Do NOT play during early buffering — that underruns and stutters after unveil.
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

    /* Keep the element paused while preload=auto fills the lead */
    try {
      el.pause();
    } catch {
      /* ignore */
    }

    if (wasVideoLoaded(resetKey)) {
      setProgress(100);
      try {
        if (el.networkState === HTMLMediaElement.NETWORK_EMPTY) {
          el.load();
        }
      } catch {
        /* ignore */
      }
      return whenVideoHasFrame(el, () => setReady(true), 2200);
    }

    let done = false;
    let frameId = 0;
    let lastPosted = -1;
    let frameCount = 0;
    let stopFrameWait: (() => void) | null = null;

    const finish = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(frameId);
      setProgress(100);
      stopFrameWait?.();
      stopFrameWait = whenVideoHasFrame(el, () => setReady(true), 2200);
    };

    const sample = () => {
      if (done) return;
      const next = readVideoBufferProgress(el);
      /* ~2% steps — enough for the stroke, fewer React updates */
      if (Math.abs(next - lastPosted) >= 2 || next >= 99) {
        lastPosted = next;
        setProgress((prev) => Math.max(prev, next));
      }
      if (isVideoBufferReady(el)) finish();
    };

    const onLoadedData = () => {
      sample();
    };
    const onError = () => finish();

    el.addEventListener("progress", sample);
    el.addEventListener("loadeddata", onLoadedData);
    el.addEventListener("loadedmetadata", sample);
    el.addEventListener("canplay", sample);
    el.addEventListener("canplaythrough", sample);
    el.addEventListener("error", onError);

    /* Kick the network without starting playback (avoids early underrun) */
    try {
      if (el.networkState === HTMLMediaElement.NETWORK_EMPTY) {
        el.load();
      }
    } catch {
      /* ignore */
    }
    sample();

    const poll = () => {
      frameCount += 1;
      /* Every other frame is plenty — buffered ranges don’t change faster */
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
      stopFrameWait?.();
      el.removeEventListener("progress", sample);
      el.removeEventListener("loadeddata", onLoadedData);
      el.removeEventListener("loadedmetadata", sample);
      el.removeEventListener("canplay", sample);
      el.removeEventListener("canplaythrough", sample);
      el.removeEventListener("error", onError);
    };
  }, [videoRef, resetKey]);

  return { progress, ready };
}
