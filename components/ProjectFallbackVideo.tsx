"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";

export type ProjectFallbackVideoProps = {
  /** Preferred source (e.g. TikTok / original URL). */
  primarySrc: string;
  /**
   * CDN / direct mp4 used when primary cannot play.
   * Omit until the user supplies a backup — do not invent one.
   */
  fallbackSrc?: string;
  alt: string;
  /** CSS padding-bottom ratio, e.g. `177.78%` for 9:16 */
  ratio?: string;
  className?: string;
  /** Give up on primary and switch to fallback after this many ms. */
  primaryTimeoutMs?: number;
};

/**
 * Tries `primarySrc` first; on load/play failure (or timeout) switches to
 * `fallbackSrc` when provided. Muted autoplay loop, no download.
 * Progress bar until buffer hits 100%, then play — never a frame poster.
 */
export function ProjectFallbackVideo({
  primarySrc,
  fallbackSrc,
  alt,
  ratio = "177.78%",
  className = "",
  primaryTimeoutMs = 2500,
}: ProjectFallbackVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(primarySrc);
  const [usedFallback, setUsedFallback] = useState(false);
  const { progress, ready } = useVideoLoadProgress(videoRef, src);

  useEffect(() => {
    setSrc(primarySrc);
    setUsedFallback(false);
  }, [primarySrc, fallbackSrc]);

  useEffect(() => {
    if (!fallbackSrc || usedFallback || ready || src === fallbackSrc) return;
    const id = window.setTimeout(() => {
      setUsedFallback(true);
      setSrc(fallbackSrc);
    }, primaryTimeoutMs);
    return () => window.clearTimeout(id);
  }, [src, fallbackSrc, usedFallback, ready, primaryTimeoutMs]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {
      /* Autoplay can still be blocked; muted + playsInline usually ok */
    });
  }, [ready, src]);

  const switchToFallback = () => {
    if (!fallbackSrc || usedFallback || src === fallbackSrc) return;
    setUsedFallback(true);
    setSrc(fallbackSrc);
  };

  return (
    <div
      className={`project-fallback-video${ready ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      style={{ paddingBottom: ratio }}
    >
      <ProtectedVideo
        key={src}
        ref={videoRef}
        className="project-fallback-video__media"
        src={src}
        preload="auto"
        autoPlay={false}
        aria-label={alt}
        onError={switchToFallback}
      />

      <VideoLoadingCover progress={progress} ready={ready} />
    </div>
  );
}
