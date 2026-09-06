"use client";

import { useEffect, useRef } from "react";
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
 * First in the top→bottom queue so the case hero isn’t blocked by gallery.
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
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    priority,
    rootRef,
  );
  const loadKey = allowed ? src : "";
  const { progress, ready } = useVideoLoadProgress(videoRef, loadKey);
  const { revealed, onCoverDone } = useVideoRevealGate(src);
  const segmentLoop = endSeconds != null && endSeconds > startSeconds;

  /* Unlock the rest of the page as soon as a true hero can play */
  useEffect(() => {
    if (allowed && ready) {
      if (priority <= VIDEO_LOAD_PRIORITY.caseHero) {
        unlockVideosAfterHero();
      }
      releaseSlot();
    }
  }, [allowed, ready, releaseSlot, priority]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;

    const seekStart = () => {
      if (Math.abs(el.currentTime - startSeconds) > 0.35) {
        el.currentTime = startSeconds;
      }
    };

    seekStart();
    void el.play().catch(() => {});

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
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
    };
  }, [ready, src, startSeconds, endSeconds, segmentLoop]);

  const handleDone = () => {
    releaseSlot();
    onCoverDone();
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
          ready={ready}
          cacheKey={src}
          onDone={handleDone}
        />
      ) : null}
    </div>
  );
}
