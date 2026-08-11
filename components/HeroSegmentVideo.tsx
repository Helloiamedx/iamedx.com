"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";

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
 */
export function HeroSegmentVideo({
  src,
  startSeconds = 0,
  endSeconds,
  className = "",
}: HeroSegmentVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const segmentLoop = endSeconds != null && endSeconds > startSeconds;

  useEffect(() => {
    setReady(false);
    const el = videoRef.current;
    if (!el) return;

    const seekStart = () => {
      if (Math.abs(el.currentTime - startSeconds) > 0.35) {
        el.currentTime = startSeconds;
      }
    };

    const onReady = () => {
      seekStart();
      void el.play().catch(() => {
        /* muted autoplay usually ok */
      });
      setReady(true);
    };

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

    el.addEventListener("loadeddata", onReady);
    el.addEventListener("canplay", onReady);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("ended", onEnded);

    if (el.readyState >= 2) onReady();

    return () => {
      el.removeEventListener("loadeddata", onReady);
      el.removeEventListener("canplay", onReady);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("ended", onEnded);
    };
  }, [src, startSeconds, endSeconds, segmentLoop]);

  return (
    <div
      className={`hero-segment-video${ready ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <ProtectedVideo
        ref={videoRef}
        className="hero-segment-video__media"
        src={src}
        preload="auto"
        loop={!segmentLoop}
      />
      <div className="hero-segment-video__veil" aria-hidden="true" />
    </div>
  );
}
