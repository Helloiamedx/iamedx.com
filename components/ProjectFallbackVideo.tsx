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
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";

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
 * `fallbackSrc` when provided.
 *
 * After hero unlock: buffer in the background. When playable, play immediately
 * (no wait-for-scroll). Mark loader only if the cell is on-screen and not yet
 * revealed.
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
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(primarySrc);
  const [usedFallback, setUsedFallback] = useState(false);
  const [intrinsicRatio, setIntrinsicRatio] = useState<string | undefined>();
  const [nearView, setNearView] = useState(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    primarySrc,
    true,
    VIDEO_LOAD_PRIORITY.gallery,
    rootRef,
  );
  const loadKey = allowed ? src : "";
  const { progress, ready } = useVideoLoadProgress(videoRef, loadKey);
  const { revealed, onCoverDone } = useVideoRevealGate(src);
  const showMark = allowed && nearView && !revealed;

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setNearView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setNearView(true);
      },
      { rootMargin: "160px 0px", threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setSrc(primarySrc);
    setUsedFallback(false);
    setIntrinsicRatio(undefined);
  }, [primarySrc, fallbackSrc]);

  useEffect(() => {
    if (allowed && ready) releaseSlot();
  }, [allowed, ready, releaseSlot]);

  /* Play as soon as playable — do not wait for scroll */
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {});
  }, [ready, src]);

  /*
   * Unveil when ready unless an on-screen mark is handling fill→unveil.
   * Off-screen warm clips unveil immediately (already playing underneath).
   */
  useEffect(() => {
    if (!allowed || !ready || revealed) return;
    if (nearView) return;
    onCoverDone();
  }, [allowed, ready, revealed, nearView, onCoverDone]);

  useEffect(() => {
    if (!allowed) return;
    if (!fallbackSrc || usedFallback || ready || src === fallbackSrc) return;
    const id = window.setTimeout(() => {
      setUsedFallback(true);
      setSrc(fallbackSrc);
    }, primaryTimeoutMs);
    return () => window.clearTimeout(id);
  }, [allowed, src, fallbackSrc, usedFallback, ready, primaryTimeoutMs]);

  const switchToFallback = () => {
    if (!fallbackSrc || usedFallback || src === fallbackSrc) return;
    setUsedFallback(true);
    setSrc(fallbackSrc);
  };

  const syncIntrinsic = () => {
    const el = videoRef.current;
    if (!el || !el.videoWidth || !el.videoHeight) return;
    setIntrinsicRatio(`${el.videoWidth} / ${el.videoHeight}`);
  };

  const handleDone = () => {
    releaseSlot();
    onCoverDone();
  };

  return (
    <div
      ref={rootRef}
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${revealed ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      style={
        nativeAspect
          ? intrinsicRatio
            ? { aspectRatio: intrinsicRatio }
            : undefined
          : { paddingBottom: ratio }
      }
    >
      {allowed ? (
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
      ) : null}

      {showMark ? (
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
