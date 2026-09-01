"use client";

import {
  useEffect,
  useState,
  type RefObject,
} from "react";

type VideoLoadingCoverProps = {
  /** 0–100 buffer / load progress */
  progress: number;
  /** True when load reached 100% and playback may start */
  ready: boolean;
  /** First frame is painted — keep pill, clear solid black plate */
  framed?: boolean;
};

function clampProgress(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * Dark cover + pill progress bar (no copy).
 * Track is dark gray with rounded ends; fill is white.
 */
export function VideoLoadingCover({
  progress,
  ready,
  framed = false,
}: VideoLoadingCoverProps) {
  const pct = ready ? 100 : clampProgress(progress);

  return (
    <div
      className={`video-loading-cover${ready ? " is-ready" : ""}${framed ? " is-framed" : ""}`}
      aria-hidden={ready}
      aria-busy={!ready}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label="Loading video"
    >
      <div className="video-loading-cover__track">
        <div
          className="video-loading-cover__fill"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Buffered fraction of duration (0–100). */
export function readVideoBufferProgress(el: HTMLVideoElement): number {
  const { duration, buffered, readyState } = el;
  /* Playable enough to start — treat as complete for the bar */
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
 * Tracks HTML video until it can play, then marks ready (bar → 100%).
 * Does **not** wait for the full file to download.
 * Keep the element paused until `ready` — then call play in the parent.
 *
 * iOS Safari often never fires `canplay` while paused with preload=auto —
 * treat metadata / first frame as enough, and also accept a short timeout
 * so LAN preview isn’t stuck on the load mark forever.
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
        /* Mobile Safari: first frame is enough to reveal + call play() */
        el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA
      ) {
        finish();
      }
    };

    const onCanPlay = () => finish();
    const onProgress = () => sync();
    const onLoadedData = () => sync();
    const onLoadedMetadata = () => sync();
    const onError = () => {
      /* Fail open so copy/CTA aren’t blocked behind a dead load mark */
      finish();
    };

    el.addEventListener("progress", onProgress);
    el.addEventListener("loadeddata", onLoadedData);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    el.addEventListener("canplay", onCanPlay);
    el.addEventListener("canplaythrough", onCanPlay);
    el.addEventListener("error", onError);

    /* Nudge the network stack — some mobile browsers idle until load() */
    try {
      el.load();
    } catch {
      /* ignore */
    }

    sync();
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) finish();

    /* Safety: don’t leave hero stuck if events never arrive */
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
