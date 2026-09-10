"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VIDEO_LOAD_PRIORITY,
  softenVideoDownload,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";
import { useDriveVideoPlayback } from "@/lib/videoPlayback";
import { cn } from "@/lib/utils";

type CoverLoopVideoProps = {
  src: string;
  /** Class on the <video> element (object-fit etc.) */
  className?: string;
  ariaLabel?: string;
  /**
   * Slide / card is the current one (recognition). Used to reset the playhead
   * when arriving on this slide — not when autoplay is merely paused.
   */
  active?: boolean;
  /**
   * When false, pause without resetting (scroll gate / manual pause).
   * Default true for index / services covers.
   */
  playbackEnabled?: boolean;
  /** Default true. Recognition cards set false so one playthrough matches the pager. */
  loop?: boolean;
  /** Fires with media duration in ms once metadata is known. */
  onDurationMs?: (ms: number) => void;
  /** Fires when a non-looping clip reaches the end. */
  onEnded?: () => void;
  /** Optional handle to the underlying <video> (seek / progress sync). */
  mediaRef?: RefObject<HTMLVideoElement | null>;
};

/**
 * Card / services / insights cover loop.
 * Site-bg plate until playing — no site-mark load cover.
 */
export function CoverLoopVideo({
  src,
  className,
  ariaLabel,
  active = true,
  playbackEnabled = true,
  loop = true,
  onDurationMs,
  onEnded,
  mediaRef,
}: CoverLoopVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const releasedRef = useRef(false);
  /** Keep last frame visible after a pause (don’t drop is-ready). */
  const readyHeldRef = useRef(false);
  const wasSlideActiveRef = useRef(false);
  const onDurationMsRef = useRef(onDurationMs);
  const onEndedRef = useRef(onEnded);
  onDurationMsRef.current = onDurationMs;
  onEndedRef.current = onEnded;

  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    VIDEO_LOAD_PRIORITY.coverCard,
    rootRef,
  );

  const onSettled = () => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    softenVideoDownload(videoRef.current);
    releaseSlot();
  };

  const shouldPlay = allowed && active && playbackEnabled;
  const { playing, settled } = useDriveVideoPlayback(
    videoRef,
    shouldPlay,
    onSettled,
    src,
  );
  if (playing || settled) readyHeldRef.current = true;
  const ready = readyHeldRef.current || playing || settled;

  const attachVideo = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (mediaRef) mediaRef.current = node;
  };

  useEffect(() => {
    releasedRef.current = false;
    readyHeldRef.current = false;
    wasSlideActiveRef.current = false;
  }, [src]);

  useEffect(() => {
    return () => {
      if (mediaRef && mediaRef.current === videoRef.current) {
        mediaRef.current = null;
      }
    };
  }, [mediaRef]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    /* Arriving on this slide → start a fresh playthrough for pager sync */
    if (active && !wasSlideActiveRef.current && !loop) {
      try {
        el.currentTime = 0;
      } catch {
        /* ignore */
      }
    }
    wasSlideActiveRef.current = active;

    if (!active || !playbackEnabled) {
      el.pause();
    }
  }, [active, playbackEnabled, loop]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !allowed) return;

    const reportDuration = () => {
      if (!Number.isFinite(el.duration) || el.duration <= 0) return;
      onDurationMsRef.current?.(Math.round(el.duration * 1000));
    };
    const handleEnded = () => {
      onEndedRef.current?.();
    };

    el.addEventListener("loadedmetadata", reportDuration);
    el.addEventListener("durationchange", reportDuration);
    el.addEventListener("ended", handleEnded);
    reportDuration();

    return () => {
      el.removeEventListener("loadedmetadata", reportDuration);
      el.removeEventListener("durationchange", reportDuration);
      el.removeEventListener("ended", handleEnded);
    };
  }, [allowed, src, active]);

  return (
    <div
      ref={rootRef}
      className={cn("cover-loop-video", ready && "is-ready")}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {allowed ? (
        <ProtectedVideo
          ref={attachVideo}
          className={cn("cover-loop-video__media", className)}
          src={src}
          preload="auto"
          autoPlay={false}
          loop={loop}
          aria-label={ariaLabel}
        />
      ) : null}
    </div>
  );
}
