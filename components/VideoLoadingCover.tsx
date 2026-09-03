"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";

type VideoLoadingCoverProps = {
  /** 0–100 buffer / load progress */
  progress: number;
  /** True when load reached 100% and playback may start under the cover */
  ready: boolean;
  /** First frame is painted — keep mark, clear solid black plate */
  framed?: boolean;
  /** Fires when the cover begins fading — parent should reveal the video then */
  onDone?: () => void;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

const VIEW = 500;
/** Soft breath band — visible load feel, not half-full */
const BREATH_MIN = 18;
const BREATH_MAX = 32;
const BREATH_HZ = 0.48;
/** Horizontal wave travel (crests move L→R) — subtle ripples */
const TRAVEL_HZ = 0.58;
const WAVE_AMP = 6;
const WAVE_COUNT = 1.25;
/** Keep breathing after buffer ready — never snap-finish */
const MIN_BREATH_MS = 780;
const EXTRA_BREATH_AFTER_READY_MS = 320;
/** Slow rise to full once we leave the breath phase */
const FINISH_MS = 720;
/** Hold full mark before fading the cover (video appears after this) */
const HOLD_BEFORE_FADE_MS = 120;

type Phase = "wave" | "finish" | "hold" | "done";

/** Liquid clip: flat bottom, wavy top traveling with `phase`. */
function waveClipPath(
  fillPct: number,
  phase: number,
  amplitude: number,
): string {
  const level = VIEW * (1 - clampProgress(fillPct) / 100);
  const steps = 56;
  let d = `M0 ${VIEW} L0 ${level}`;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * VIEW;
    const y =
      level +
      Math.sin((i / steps) * WAVE_COUNT * Math.PI * 2 + phase) * amplitude;
    d += ` L${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  d += ` L${VIEW} ${VIEW} Z`;
  return d;
}

const MARK_PATHS = (
  <>
    <path
      fill="currentColor"
      d="M392.17,317.83c-25.35,53.04-79.49,89.67-142.17,89.67s-116.83-36.62-142.17-89.67l42.36-19.76c17.88,37.11,55.86,62.7,99.81,62.7s81.94-25.59,99.81-62.7l42.36,19.76Z"
    />
    <path
      fill="currentColor"
      d="M404.9,221.42c-13.43-73.34-77.67-128.92-154.9-128.92s-141.47,55.58-154.9,128.92c-1.72,9.27-2.6,18.83-2.6,28.58,0,6.19.36,12.31,1.06,18.3h312.88c.7-6,1.06-12.11,1.06-18.3,0-9.76-.88-19.32-2.6-28.58ZM142.95,221.42c1.55-5.87,3.6-11.54,6.05-16.98,17.37-38.45,56.07-65.22,101.01-65.22s83.64,26.77,101.01,65.22c2.45,5.44,4.49,11.11,6.05,16.98h-214.11Z"
    />
  </>
);

/**
 * Shared video load UI — site mark with a liquid wave that travels
 * left → right while the fill level breathes up/down. After `ready`,
 * keeps breathing, then slowly fills to full, holds, and fades.
 */
export function VideoLoadingCover({
  progress,
  ready,
  framed = false,
  onDone,
}: VideoLoadingCoverProps) {
  const clipId = useId().replace(/:/g, "");
  const [phase, setPhase] = useState<Phase>("wave");
  const [cycle, setCycle] = useState(0);
  const [clipD, setClipD] = useState(() =>
    waveClipPath((BREATH_MIN + BREATH_MAX) / 2, 0, WAVE_AMP),
  );
  const [ariaFill, setAriaFill] = useState(BREATH_MIN);

  const phaseRef = useRef<Phase>("wave");
  const fillRef = useRef((BREATH_MIN + BREATH_MAX) / 2);
  const phaseAngleRef = useRef(0);
  const ampRef = useRef(WAVE_AMP);
  const finishFromRef = useRef(BREATH_MIN);
  const finishStartRef = useRef(0);
  const cycleStartRef = useRef(
    typeof performance !== "undefined" ? performance.now() : 0,
  );
  const readyAtRef = useRef<number | null>(null);
  const rafRef = useRef(0);
  const holdTimerRef = useRef(0);
  const onDoneRef = useRef(onDone);
  const doneFiredRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  /* Reset when parent drops ready */
  useEffect(() => {
    if (ready) return;
    setPhase("wave");
    phaseRef.current = "wave";
    fillRef.current = (BREATH_MIN + BREATH_MAX) / 2;
    phaseAngleRef.current = 0;
    ampRef.current = WAVE_AMP;
    readyAtRef.current = null;
    doneFiredRef.current = false;
    cycleStartRef.current = performance.now();
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = 0;
    }
    setCycle((n) => n + 1);
  }, [ready]);

  useEffect(() => {
    if (!ready || readyAtRef.current != null) return;
    readyAtRef.current = performance.now();
  }, [ready]);

  /* Single rAF loop: travel L→R + breath, then slow finish */
  useEffect(() => {
    const mid = (BREATH_MIN + BREATH_MAX) / 2;
    const breathAmp = (BREATH_MAX - BREATH_MIN) / 2;

    const tick = (now: number) => {
      const p = phaseRef.current;
      const t = (now - cycleStartRef.current) / 1000;

      /* Crests drift left → right */
      phaseAngleRef.current = t * Math.PI * 2 * TRAVEL_HZ;

      if (p === "wave") {
        fillRef.current =
          mid + Math.sin(t * Math.PI * 2 * BREATH_HZ) * breathAmp;
        ampRef.current = WAVE_AMP;

        if (readyAtRef.current != null) {
          const sinceStart = now - cycleStartRef.current;
          const sinceReady = now - readyAtRef.current;
          if (
            sinceStart >= MIN_BREATH_MS &&
            sinceReady >= EXTRA_BREATH_AFTER_READY_MS
          ) {
            finishFromRef.current = fillRef.current;
            finishStartRef.current = now;
            phaseRef.current = "finish";
            setPhase("finish");
          }
        }
      } else if (p === "finish") {
        const u = Math.min(1, (now - finishStartRef.current) / FINISH_MS);
        const eased = 1 - (1 - u) ** 3;
        fillRef.current =
          finishFromRef.current + (100 - finishFromRef.current) * eased;
        ampRef.current = WAVE_AMP * (1 - eased);

        if (u >= 1) {
          fillRef.current = 100;
          ampRef.current = 0;
          phaseRef.current = "hold";
          setPhase("hold");
        }
      }

      setClipD(
        waveClipPath(
          fillRef.current,
          phaseAngleRef.current,
          ampRef.current,
        ),
      );
      setAriaFill(fillRef.current);

      if (phaseRef.current !== "done") {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cycle]);

  /* Brief hold at full, then fade cover + notify parent */
  useEffect(() => {
    if (phase !== "hold") return;
    holdTimerRef.current = window.setTimeout(() => {
      setPhase("done");
      phaseRef.current = "done";
      if (!doneFiredRef.current) {
        doneFiredRef.current = true;
        onDoneRef.current?.();
      }
    }, HOLD_BEFORE_FADE_MS);
    return () => {
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    };
  }, [phase]);

  const exiting = phase === "done";
  const loading = phase === "wave";
  const ariaNow = Math.round(
    exiting || phase === "finish" || phase === "hold"
      ? ariaFill
      : Math.max(ariaFill, clampProgress(progress)),
  );

  return (
    <div
      className={`video-loading-cover${exiting ? " is-ready" : ""}${framed ? " is-framed" : ""}${loading ? " is-loading" : ""}`}
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
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          width={160}
          height={160}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
              <path d={clipD} />
            </clipPath>
          </defs>
          <g className="video-loading-cover__base" opacity={0.22}>
            {MARK_PATHS}
          </g>
          <g clipPath={`url(#${clipId})`}>{MARK_PATHS}</g>
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
}) {
  return <VideoLoadingCover {...props} />;
}

/** Buffered fraction of duration (0–100). */
export function readVideoBufferProgress(el: HTMLVideoElement): number {
  const { duration, buffered, readyState } = el;
  if (readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return 100;
  if (
    duration &&
    Number.isFinite(duration) &&
    duration > 0 &&
    buffered.length > 0
  ) {
    const end = buffered.end(buffered.length - 1);
    return clampProgress((end / duration) * 100);
  }
  if (readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return 55;
  if (readyState >= HTMLMediaElement.HAVE_METADATA) return 12;
  return 0;
}

/**
 * Tracks HTML video until it can play, then marks ready.
 * Does **not** wait for the full file to download.
 * Keep the element paused until `ready` — then call play in the parent.
 * Reveal the video only after `VideoLoadingCover` `onDone`.
 */
export function useVideoLoadProgress(
  videoRef: RefObject<HTMLVideoElement | null>,
  resetKey: string,
) {
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProgress(0);
    setReady(false);
    const el = videoRef.current;
    if (!el || !resetKey) return;

    el.pause();

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setProgress(100);
      setReady(true);
    };

    const sync = () => {
      if (done) return;
      const next = readVideoBufferProgress(el);
      setProgress((prev) => Math.max(prev, next));
      if (
        next >= 99.5 ||
        el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ||
        el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        finish();
      }
    };

    const onCanPlay = () => finish();
    const onProgress = () => sync();
    const onLoadedData = () => sync();
    const onLoadedMetadata = () => sync();
    const onError = () => finish();

    el.addEventListener("progress", onProgress);
    el.addEventListener("loadeddata", onLoadedData);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("canplaythrough", onCanPlay);
    el.addEventListener("error", onError);

    try {
      el.load();
    } catch {
      /* ignore */
    }

    sync();
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) finish();

    const safety = window.setTimeout(() => {
      if (!done && el.readyState >= HTMLMediaElement.HAVE_METADATA) finish();
    }, 4000);

    return () => {
      window.clearTimeout(safety);
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("loadeddata", onLoadedData);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("canplaythrough", onCanPlay);
      el.removeEventListener("error", onError);
    };
  }, [videoRef, resetKey]);

  return { progress, ready };
}
