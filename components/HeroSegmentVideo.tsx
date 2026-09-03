"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";

type HeroSegmentVideoProps = {
  src: string;
  /** Seek / restart point in seconds (e.g. 79 = 1:19) */
  startSeconds?: number;
  /** Loop-back point in seconds (e.g. 401 = 6:41). Omit to native-loop the whole file. */
  endSeconds?: number;
  className?: string;
};

/**
 * Full-bleed muted hero clip. Optional `[start, end]` loop via currentTime
 * (native `loop` only when no end is set).
 * Wave cover until buffer ready + settle, then reveal.
 */
export function HeroSegmentVideo({
  src,
  startSeconds = 0,
  endSeconds,
  className = "",
}: HeroSegmentVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { progress, ready } = useVideoLoadProgress(videoRef, src);
  const [revealed, setRevealed] = useState(false);
  const segmentLoop = endSeconds != null && endSeconds > startSeconds;

  useEffect(() => {
    setRevealed(false);
  }, [src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;

    const seekStart = () => {
      if (Math.abs(el.currentTime - startSeconds) > 0.35) {
        el.currentTime = startSeconds;
      }
    };

    seekStart();
    void el.play().catch(() => {
      /* muted autoplay usually ok */
    });

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

  return (
    <div
      className={`hero-segment-video${revealed ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <ProtectedVideo
        ref={videoRef}
        className="hero-segment-video__media"
        src={src}
        preload="auto"
        autoPlay={false}
        loop={!segmentLoop}
      />
      <VideoLoadingCover
        progress={progress}
        ready={ready}
        onDone={() => setRevealed(true)}
      />
    </div>
  );
}
