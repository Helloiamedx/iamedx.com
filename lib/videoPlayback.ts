"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";

/**
 * Convert CSS padding-bottom ratio (`56.25%`) to `aspect-ratio` (`100 / 56.25`).
 * Used to reserve layout space for native-aspect clips before metadata arrives.
 */
export function paddingBottomToAspectRatio(
  padding: string | undefined,
): string | undefined {
  if (!padding) return undefined;
  const trimmed = padding.trim();
  if (!trimmed.endsWith("%")) return undefined;
  const value = Number.parseFloat(trimmed);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return `100 / ${value}`;
}

/** Drop src so a stalled / failed clip stops hogging bandwidth for the queue. */
function abandonVideoSource(el: HTMLVideoElement) {
  try {
    el.pause();
  } catch {
    /* ignore */
  }
  try {
    el.removeAttribute("src");
    el.load();
  } catch {
    /* ignore */
  }
}

/**
 * Drive muted autoplay until `playing`, or hard-fail.
 *
 * Slow / large files must NOT be treated as failures on a short clock —
 * that left the load queue stuck while the abandoned clip kept downloading.
 * Only give up on media errors, or when there has been no buffer /
 * readyState progress for a long stall window.
 */
export function driveVideoPlayback(
  el: HTMLVideoElement,
  onPlaying: () => void,
  onFailed: () => void,
) {
  let cancelled = false;
  let finished = false;
  let lastProgressAt = performance.now();
  let lastReadyState = el.readyState;

  /** No progress at all for this long → free the queue slot. */
  const STALL_MS = 45000;
  const stallPollMs = 2000;

  function finish(success: boolean) {
    if (cancelled || finished) return;
    finished = true;
    window.clearInterval(stallId);
    el.removeEventListener("playing", playing);
    el.removeEventListener("error", fail);
    el.removeEventListener("progress", onProgress);
    el.removeEventListener("loadeddata", onProgress);
    el.removeEventListener("loadedmetadata", onProgress);
    el.removeEventListener("canplay", onProgress);
    if (success) onPlaying();
    else {
      abandonVideoSource(el);
      onFailed();
    }
  }
  function fail() {
    finish(false);
  }
  function playing() {
    finish(true);
  }
  function onProgress() {
    lastProgressAt = performance.now();
    if (el.readyState > lastReadyState) lastReadyState = el.readyState;
  }

  el.addEventListener("playing", playing);
  el.addEventListener("error", fail);
  el.addEventListener("progress", onProgress);
  el.addEventListener("loadeddata", onProgress);
  el.addEventListener("loadedmetadata", onProgress);
  el.addEventListener("canplay", onProgress);

  /* iOS Safari: attribute alone is not always enough for programmatic autoplay */
  el.muted = true;
  el.defaultMuted = true;
  el.playsInline = true;
  el.setAttribute("muted", "");
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");

  const stallId = window.setInterval(() => {
    if (cancelled || finished) return;
    if (el.error) {
      fail();
      return;
    }
    /* Still advancing through the buffer — keep waiting */
    if (el.readyState > lastReadyState) {
      lastReadyState = el.readyState;
      lastProgressAt = performance.now();
      return;
    }
    if (performance.now() - lastProgressAt < STALL_MS) return;

    /*
     * Long stall. If we already have paint-able frames, unlock the queue
     * (autoplay may be blocked; don’t abandon a loaded clip). Otherwise
     * hard-fail and free bandwidth.
     */
    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      void el.play().then(
        () => playing(),
        () => playing(),
      );
      return;
    }
    fail();
  }, stallPollMs);

  if (el.error) fail();
  else {
    // play() resolves for media that was already playing too.
    // Do NOT treat a slow play() rejection timeout as failure — wait for
    // playing / error / stall instead. Rejection often means NotAllowed;
    // still listen for a later playing after a user gesture or buffer.
    void el.play().then(
      () => {
        /* play() fulfilled — wait for the playing event (or stall poll) */
        if (!el.paused && el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          playing();
        }
      },
      () => {
        /* Autoplay blocked — keep listening; stall poll / error still apply */
      },
    );
  }

  return () => {
    cancelled = true;
    window.clearInterval(stallId);
    el.removeEventListener("playing", playing);
    el.removeEventListener("error", fail);
    el.removeEventListener("progress", onProgress);
    el.removeEventListener("loadeddata", onProgress);
    el.removeEventListener("loadedmetadata", onProgress);
    el.removeEventListener("canplay", onProgress);
  };
}

export function useDriveVideoPlayback(
  videoRef: RefObject<HTMLVideoElement | null>,
  enabled: boolean,
  onSettled: () => void,
  resetKey = "",
) {
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;
  const [playing, setPlaying] = useState(false);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    setPlaying(false);
    setSettled(false);
    const el = videoRef.current;
    if (!el || !enabled) return;
    return driveVideoPlayback(
      el,
      () => {
        setPlaying(true);
        setSettled(true);
        onSettledRef.current();
      },
      () => {
        setSettled(true);
        onSettledRef.current();
      },
    );
  }, [enabled, resetKey, videoRef]);

  return { playing, settled, failed: settled && !playing };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
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
    const events = [
      "progress",
      "loadeddata",
      "loadedmetadata",
      "canplay",
      "playing",
      "seeked",
    ];
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
