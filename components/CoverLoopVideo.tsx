"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { cn } from "@/lib/utils";

type CoverLoopVideoProps = {
  src: string;
  /** Class on the <video> element (object-fit etc.) */
  className?: string;
  ariaLabel?: string;
};

/**
 * Index / Related card cover loop — site-mark wave until settle, then mute autoplay.
 */
export function CoverLoopVideo({
  src,
  className,
  ariaLabel,
}: CoverLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { progress, ready } = useVideoLoadProgress(videoRef, src);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setRevealed(false);
  }, [src]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {});
  }, [ready, src]);

  return (
    <div
      className={cn("cover-loop-video", revealed && "is-ready")}
      aria-hidden={ariaLabel ? undefined : true}
    >
      <ProtectedVideo
        ref={videoRef}
        className={cn("cover-loop-video__media", className)}
        src={src}
        preload="auto"
        autoPlay={false}
        aria-label={ariaLabel}
      />
      <VideoLoadingCover
        progress={progress}
        ready={ready}
        onDone={() => setRevealed(true)}
      />
    </div>
  );
}
