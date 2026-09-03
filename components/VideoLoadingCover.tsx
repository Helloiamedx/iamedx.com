"use client";

import {
  useEffect,
  useLayoutEffect,
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

/** Keep breathing after buffer ready — never snap-finish */
const MIN_BREATH_MS = 780;
const EXTRA_BREATH_AFTER_READY_MS = 320;
/** CSS finish transition length — keep in sync with globals.css */
const FINISH_MS = 720;
const HOLD_BEFORE_FADE_MS = 120;

type Phase = "breath" | "finish" | "hold" | "done";

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
 * Shared video load UI — mark breathes dim ↔ bright (opacity only, no blur);
 * when ready, eases to full brightness, holds, then fades. Never steals taps.
 */
export function VideoLoadingCover({
  progress,
  ready,
  framed = false,
  onDone,
}: VideoLoadingCoverProps) {
  const [phase, setPhase] = useState<Phase>("breath");
  const phaseRef = useRef<Phase>("breath");
  const cycleStartRef = useRef(
    typeof performance !== "undefined" ? performance.now() : 0,
  );
  const readyAtRef = useRef<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const onDoneRef = useRef(onDone);
  const doneFiredRef = useRef(false);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  };

  /* Reset when parent drops ready */
  useEffect(() => {
    if (ready) return;
    clearTimers();
    setPhase("breath");
    phaseRef.current = "breath";
    readyAtRef.current = null;
    doneFiredRef.current = false;
    cycleStartRef.current = performance.now();
  }, [ready]);

  /* After ready: keep CSS breath, then finish → hold → done (timers only) */
  useEffect(() => {
    if (!ready) return;
    if (readyAtRef.current == null) readyAtRef.current = performance.now();

    clearTimers();
    const sinceStart = performance.now() - cycleStartRef.current;
    const sinceReady = performance.now() - (readyAtRef.current ?? performance.now());
    const wait = Math.max(
      0,
      Math.max(MIN_BREATH_MS - sinceStart, EXTRA_BREATH_AFTER_READY_MS - sinceReady),
    );

    const tFinish = window.setTimeout(() => {
      setPhase("finish");
      phaseRef.current = "finish";

      const tHold = window.setTimeout(() => {
        setPhase("hold");
        phaseRef.current = "hold";

        const tDone = window.setTimeout(() => {
          setPhase("done");
          phaseRef.current = "done";
          if (!doneFiredRef.current) {
            doneFiredRef.current = true;
            onDoneRef.current?.();
          }
        }, HOLD_BEFORE_FADE_MS);
        timersRef.current.push(tDone);
      }, FINISH_MS);
      timersRef.current.push(tHold);
    }, wait);
    timersRef.current.push(tFinish);

    return clearTimers;
  }, [ready]);

  const exiting = phase === "done";
  const ariaNow =
    phase === "hold" || exiting
      ? 100
      : phase === "finish"
        ? 85
        : Math.round(Math.max(12, clampProgress(progress) * 0.4));

  return (
    <div
      className={`video-loading-cover${exiting ? " is-ready" : ""}${framed ? " is-framed" : ""}${phase === "breath" ? " is-loading" : ""}${phase === "finish" ? " is-finishing" : ""}${phase === "hold" ? " is-holding" : ""}`}
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
          {MARK_PATHS}
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

  useLayoutEffect(() => {
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
        el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        finish();
      }
    };

    const onCanPlay = () => finish();
    const onPlaying = () => finish();
    const onProgress = () => sync();
    const onLoadedData = () => sync();
    const onLoadedMetadata = () => sync();
    const onError = () => finish();

    el.addEventListener("progress", onProgress);
    el.addEventListener("loadeddata", onLoadedData);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("canplaythrough", onCanPlay);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("error", onError);

    /* Only restart if nothing is buffered yet — el.load() can stall on iOS */
    if (el.readyState < HTMLMediaElement.HAVE_METADATA) {
      try {
        el.load();
      } catch {
        /* ignore */
      }
    }

    sync();
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) finish();

    const safetyMeta = window.setTimeout(() => {
      if (!done && el.readyState >= HTMLMediaElement.HAVE_METADATA) finish();
    }, 2500);
    const safetyHard = window.setTimeout(() => {
      if (!done) finish();
    }, 8000);

    return () => {
      window.clearTimeout(safetyMeta);
      window.clearTimeout(safetyHard);
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("loadeddata", onLoadedData);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
      el.removeEventListener("canplay", onCanPlay);
      el.removeEventListener("canplaythrough", onCanPlay);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("error", onError);
    };
  }, [videoRef, resetKey]);

  return { progress, ready };
}
