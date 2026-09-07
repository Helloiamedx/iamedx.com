"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { useVideoRevealGate } from "@/lib/videoLoadMemory";
import {
  VIDEO_LOAD_PRIORITY,
  unlockVideosAfterHero,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";
import { useDriveVideoPlayback } from "@/lib/videoPlayback";

type HeroSegmentVideoProps = {
  src: string;
  /** Seek / restart point in seconds (e.g. 79 = 1:19) */
  startSeconds?: number;
  /** Loop-back point in seconds (e.g. 401 = 6:41). Omit to native-loop the whole file. */
  endSeconds?: number;
  className?: string;
  /**
   * Queue band — default case hero (runs first). Use `gallery` for secondary
   * heroes on collection rails so they don’t all compete as “hero”.
   */
  priority?: number;
};

/**
 * Full-bleed muted hero clip. Optional `[start, end]` loop via currentTime.
 * Unlocks the page media gate when playback actually starts (or hard-fails).
 */
export function HeroSegmentVideo({
  src,
  startSeconds = 0,
  endSeconds,
  className = "",
  priority = VIDEO_LOAD_PRIORITY.caseHero,
}: HeroSegmentVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const releasedRef = useRef(false);
  const [animationDone, setAnimationDone] = useState(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    priority,
    rootRef,
  );
  const loadKey = allowed ? src : "";
  const { progress, ready, failed } = useVideoLoadProgress(videoRef, loadKey);
  const { revealed, onCoverDone } = useVideoRevealGate(src);
  const segmentLoop = endSeconds != null && endSeconds > startSeconds;
  const isPageHero = priority <= VIDEO_LOAD_PRIORITY.caseHero;

  const onSettled = () => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    if (isPageHero) unlockVideosAfterHero();
    releaseSlot();
    onCoverDone();
  };

  useDriveVideoPlayback(
    videoRef,
    allowed && animationDone,
    onSettled,
    src,
  );

  const coverReady = ready || failed;

  useEffect(() => {
    releasedRef.current = false;
    setAnimationDone(false);
  }, [src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !allowed) return;

    const seekStart = () => {
      if (Math.abs(el.currentTime - startSeconds) > 0.35) {
        el.currentTime = startSeconds;
      }
    };

    if (el.readyState >= HTMLMediaElement.HAVE_METADATA) seekStart();
    el.addEventListener("loadedmetadata", seekStart);

    const onTimeUpdate = () => {
      if (!segmentLoop) return;
      if (el.currentTime >= (endSeconds as number) - 0.05) {
        el.currentTime = startSeconds;
        void el.play().catch(() => {});
      }
    };

    const onEnded = () => {
      seekStart();
      void el.play().catch(() => {});
    };

    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("loadedmetadata", seekStart);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
    };
  }, [allowed, src, startSeconds, endSeconds, segmentLoop]);

  const handleDone = () => {
    if (failed) {
      onSettled();
      return;
    }
    setAnimationDone(true);
  };

  return (
    <div
      ref={rootRef}
      className={`hero-segment-video${revealed ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      {allowed ? (
        <ProtectedVideo
          ref={videoRef}
          className="hero-segment-video__media"
          src={src}
          preload="auto"
          autoPlay={false}
          loop={!segmentLoop}
        />
      ) : null}
      {allowed && !revealed ? (
        <VideoLoadingCover
          active
          progress={progress}
          ready={coverReady}
          cacheKey={src}
          onDone={handleDone}
        />
      ) : null}
    </div>
  );
}
