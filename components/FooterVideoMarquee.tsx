"use client";

import { useEffect, useRef } from "react";
import { footerMarqueeVideos } from "@/content/nav";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VIDEO_LOAD_PRIORITY,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";
import { useDriveVideoPlayback } from "@/lib/videoPlayback";
import { asset } from "@/lib/assets";

/**
 * Footer underlay — near-viewport after hero, concurrency-capped.
 * Black plate until playing — no site-mark load cover.
 */
export function FooterVideoMarquee() {
  const clip = footerMarqueeVideos[0];
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = asset(clip.src);
  const releasedRef = useRef(false);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    VIDEO_LOAD_PRIORITY.footer,
    rootRef,
  );

  const onSettled = () => {
    if (releasedRef.current) return;
    releasedRef.current = true;
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
      className={`footer-video-fill${ready ? " is-ready" : ""}`}
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
    </div>
  );
}
