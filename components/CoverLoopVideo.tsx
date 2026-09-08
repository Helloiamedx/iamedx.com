"use client";

import { useEffect, useRef } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
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
 * Card / services / insights cover loop.
 * Site-bg plate until playing — no site-mark load cover.
 */
export function CoverLoopVideo({
  src,
  className,
  ariaLabel,
}: CoverLoopVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const releasedRef = useRef(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    VIDEO_LOAD_PRIORITY.coverCard,
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
  }, [src]);

  return (
    <div
      ref={rootRef}
      className={cn("cover-loop-video", ready && "is-ready")}
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
    </div>
  );
}
