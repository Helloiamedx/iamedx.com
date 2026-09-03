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
  /**
   * Size the frame to the file’s intrinsic width/height (no forced box /
   * cover crop). Wins over `ratio` when set.
   */
  nativeAspect?: boolean;
  className?: string;
  /** Give up on primary and switch to fallback after this many ms. */
  primaryTimeoutMs?: number;
};

/**
 * Tries `primarySrc` first; on load/play failure (or timeout) switches to
 * `fallbackSrc` when provided. Muted autoplay loop, no download.
 * Site-mark wave until buffer ready + cover settles, then reveal.
 */
export function ProjectFallbackVideo({
  primarySrc,
  fallbackSrc,
  alt,
  ratio = "177.78%",
  nativeAspect = false,
  className = "",
  primaryTimeoutMs = 2500,
}: ProjectFallbackVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(primarySrc);
  const [usedFallback, setUsedFallback] = useState(false);
  const [intrinsicRatio, setIntrinsicRatio] = useState<string | undefined>();
  const [revealed, setRevealed] = useState(false);
  const { progress, ready } = useVideoLoadProgress(videoRef, src);

  useEffect(() => {
    setSrc(primarySrc);
    setUsedFallback(false);
    setIntrinsicRatio(undefined);
    setRevealed(false);
  }, [primarySrc, fallbackSrc]);

  useEffect(() => {
    if (!fallbackSrc || usedFallback || ready || src === fallbackSrc) return;
    const id = window.setTimeout(() => {
      setUsedFallback(true);
      setSrc(fallbackSrc);
      setRevealed(false);
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
    setRevealed(false);
  };

  const syncIntrinsic = () => {
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    setIntrinsicRatio(`${el.videoWidth} / ${el.videoHeight}`);
  };

  return (
    <div
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${revealed ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      style={
        nativeAspect
          ? intrinsicRatio
            ? { aspectRatio: intrinsicRatio }
            : undefined
          : { paddingBottom: ratio }
      }
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
        onLoadedMetadata={nativeAspect ? syncIntrinsic : undefined}
      />

      <VideoLoadingCover
        progress={progress}
        ready={ready}
        onDone={() => setRevealed(true)}
      />
    </div>
  );
}
