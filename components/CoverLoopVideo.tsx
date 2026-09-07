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
import { cn } from "@/lib/utils";

type CoverLoopVideoProps = {
  src: string;
  /** Class on the <video> element (object-fit etc.) */
  className?: string;
  ariaLabel?: string;
};

/**
 * Card / services / insights cover loop — same mark loader language as project clips.
 * Show the site-mark cover as soon as the cell is on-screen (even while waiting
 * for a queue slot). Buffer + play once allowed; unveil when playing.
 */
export function CoverLoopVideo({
  src,
  className,
  ariaLabel,
}: CoverLoopVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const releasedRef = useRef(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    VIDEO_LOAD_PRIORITY.coverCard,
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
  /* Mark as soon as visible — don’t wait for the queue (avoids long black plate) */
  const showMark = Boolean(onScreen && !revealed);

  useEffect(() => {
    releasedRef.current = false;
  }, [src]);

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
      { rootMargin: "160px 0px", threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  /* Off-screen: unveil quietly once settled */
  useEffect(() => {
    if (!allowed || !coverReady || revealed || onScreen) return;
    onCoverDone();
  }, [allowed, coverReady, revealed, onScreen, onCoverDone]);

  const handleDone = () => {
    onCoverDone();
  };

  return (
    <div
      ref={rootRef}
      className={cn("cover-loop-video", revealed && "is-ready")}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {allowed ? (
        <ProtectedVideo
          ref={videoRef}
          className={cn("cover-loop-video__media", className)}
          src={src}
          preload="auto"
          autoPlay={false}
          aria-label={ariaLabel}
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
