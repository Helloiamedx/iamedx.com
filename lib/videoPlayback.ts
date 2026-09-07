"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

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

/** Handles already-playing media, missed events, rejection, errors and stalled startup. */
export function driveVideoPlayback(
  el: HTMLVideoElement,
  onPlaying: () => void,
  onFailed: () => void,
) {
  let cancelled = false;
  let finished = false;
  const timeout = window.setTimeout(fail, 12000);
  function finish(success: boolean) {
    if (cancelled || finished) return;
    finished = true;
    window.clearTimeout(timeout);
    if (success) onPlaying();
    else onFailed();
  }
  function fail() { finish(false); }
  function playing() { finish(true); }
  el.addEventListener("playing", playing);
  el.addEventListener("error", fail);
  if (el.error) fail();
  else {
    // play() resolves for media that was already playing too.
    void el.play().then(playing, fail);
  }
  return () => {
    cancelled = true;
    window.clearTimeout(timeout);
    el.removeEventListener("playing", playing);
    el.removeEventListener("error", fail);
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
    return driveVideoPlayback(el, () => {
      setPlaying(true);
      setSettled(true);
      onSettledRef.current();
    }, () => {
      setSettled(true);
      onSettledRef.current();
    });
  }, [enabled, resetKey, videoRef]);

  return { playing, settled, failed: settled && !playing };
}
