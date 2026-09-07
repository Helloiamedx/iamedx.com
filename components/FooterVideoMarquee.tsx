"use client";

import { useEffect, useRef, useState } from "react";
import { footerMarqueeVideos } from "@/content/nav";
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
import { useDriveVideoPlayback } from "@/lib/videoPlayback";
import { asset } from "@/lib/assets";

/**
 * Footer underlay — near-viewport after hero, concurrency-capped.
 */
export function FooterVideoMarquee() {
  const clip = footerMarqueeVideos[0];
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = asset(clip.src);
  const releasedRef = useRef(false);
  const [animationDone, setAnimationDone] = useState(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    VIDEO_LOAD_PRIORITY.footer,
    rootRef,
  );
  const loadKey = allowed ? src : "";
  const { progress, ready, failed } = useVideoLoadProgress(videoRef, loadKey);
  const { revealed, onCoverDone } = useVideoRevealGate(src);

  const onSettled = () => {
    if (releasedRef.current) return;
    releasedRef.current = true;
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
      className={`footer-video-fill${revealed ? " is-ready" : ""}`}
      aria-hidden="true"
    >
      {allowed ? (
        <ProtectedVideo
          ref={videoRef}
          className="footer-video-fill__media"
          src={src}
          preload="auto"
          autoPlay={false}
          aria-label={clip.label}
          style={{ objectFit: "cover", objectPosition: "top center" }}
        />
      ) : null}
      {revealed ? null : allowed ? (
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
