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
 * Once allowed: buffer and play in the background (do not wait for scroll).
 * Mark loader only while the cell is on-screen.
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
  const [onScreen, setOnScreen] = useState(false);
  const [boxRatio, setBoxRatio] = useState(ratio);
  const releasedRef = useRef(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    primarySrc,
    true,
    VIDEO_LOAD_PRIORITY.gallery,
    rootRef,
  );
  const loadKey = allowed ? src : "";
  const { progress, ready, failed } = useVideoLoadProgress(videoRef, loadKey);
  const { revealed, onCoverDone } = useVideoRevealGate(src);

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

  const coverReady = playing || settled || ready || failed;
  const showMark = allowed && onScreen && !revealed;

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
    const root = rootRef.current;
    if (!root) return;
    if (typeof IntersectionObserver === "undefined") {
      setOnScreen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "120px 0px", threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    setSrc(primarySrc);
    setUsedFallback(false);
  }, [primarySrc, fallbackSrc]);

  /* Off-screen: unveil once settled so we don’t leave a stuck cover state */
  useEffect(() => {
    if (!allowed || !coverReady || revealed || onScreen) return;
    onCoverDone();
  }, [allowed, coverReady, revealed, onScreen, onCoverDone]);

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
    if (!fallbackSrc || usedFallback || src === fallbackSrc) {
      onSettled();
      onCoverDone();
      return;
    }
    setUsedFallback(true);
    setSrc(fallbackSrc);
  };

  const handleDone = () => {
    onCoverDone();
  };

  return (
    <div
      ref={rootRef}
      className={`project-fallback-video${nativeAspect ? " project-fallback-video--native" : ""}${revealed ? " is-ready" : ""}${className ? ` ${className}` : ""}`}
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

      {showMark ? (
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
