"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VIDEO_LOAD_PRIORITY,
  softenVideoDownload,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";
import { useDriveVideoPlayback } from "@/lib/videoPlayback";

export type ProjectFallbackVideoProps = {
  /** Preferred source (e.g. TikTok / original URL). */
  primarySrc: string;
  /**
   * CDN / direct mp4 used when primary cannot play.
   * Omit until the user supplies a backup — do not invent one.
   */
  fallbackSrc?: string;
  alt: string;
  /** CSS padding-bottom ratio, e.g. `177.78%` for 9:16 — always reserves height */
  ratio?: string;
  /**
   * Size the frame to the file’s real width/height once metadata loads
   * (no letterbox bars). `ratio` is only the pre-metadata reserve.
   */
  nativeAspect?: boolean;
  className?: string;
  /** Give up on primary and switch to fallback after this many ms. */
  primaryTimeoutMs?: number;
};

/**
 * Gallery clip — near-viewport after hero (queue), reserved padding box.
 * Once allowed: buffer and play. Site-bg plate until frames paint — no mark cover.
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
  const [boxRatio, setBoxRatio] = useState(ratio);
  const releasedRef = useRef(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    primarySrc,
    true,
    VIDEO_LOAD_PRIORITY.gallery,
    rootRef,
  );

  const onSettled = () => {
    if (releasedRef.current) return;
    releasedRef.current = true;
    softenVideoDownload(videoRef.current);
    releaseSlot();
  };

  const { playing, settled } = useDriveVideoPlayback(
    videoRef,
    allowed,
    onSettled,
    src,
  );
  const ready = playing || settled;

  useEffect(() => {
    releasedRef.current = false;
  }, [primarySrc, src]);

  useEffect(() => {
    setBoxRatio(ratio);
  }, [ratio, src]);

  /* nativeAspect — lock the padding box to the file’s intrinsic aspect */
  useEffect(() => {
    if (!nativeAspect || !allowed) return;
    const video = videoRef.current;
    if (!video) return;

    const applyNativeRatio = () => {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (w > 0 && h > 0) {
        setBoxRatio(`${(h / w) * 100}%`);
      }
    };

    applyNativeRatio();
    video.addEventListener("loadedmetadata", applyNativeRatio);
    return () => video.removeEventListener("loadedmetadata", applyNativeRatio);
  }, [nativeAspect, allowed, src]);

  useEffect(() => {
    setSrc(primarySrc);
    setUsedFallback(false);
  }, [primarySrc, fallbackSrc]);

  useEffect(() => {
    if (!allowed) return;
    if (!fallbackSrc || usedFallback || playing || src === fallbackSrc) return;
    const id = window.setTimeout(() => {
      setUsedFallback(true);
      setSrc(fallbackSrc);
    }, primaryTimeoutMs);
    return () => window.clearTimeout(id);
  }, [allowed, src, fallbackSrc, usedFallback, playing, primaryTimeoutMs]);

  const switchToFallback = () => {
    if (!fallbackSrc || usedFallback || src === fallbackSrc) {
      onSettled();
      return;
    }
    setUsedFallback(true);
    setSrc(fallbackSrc);
  };

  return (
    <div
      ref={rootRef}
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${ready ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
      style={{ paddingBottom: boxRatio }}
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
        />
      ) : null}
    </div>
  );
}
