"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { HERO_VIDEO_SRC } from "@/lib/heroMedia";
import { useDriveVideoPlayback } from "@/lib/videoPlayback";
import {
  VIDEO_LOAD_PRIORITY,
  unlockVideosAfterHero,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";

/**
 * Home hero background clip.
 *
 * The clip owns nothing but itself. It loads through the hero-priority slot,
 * plays muted and looping, and fades in over the hero's black stage once a
 * frame is on screen. It deliberately does *not* gate the copy: the stage is
 * black enough for the white headline from the first paint, so the entrance
 * belongs to `HeroHeadline` and never waits on a multi-megabyte download.
 *
 * The one page-level job it still has is opening the post-hero load gate
 * (`unlockVideosAfterHero`) once it has settled — playing or hard-failed — so
 * the near-viewport media further down can start. That runs on BOTH outcomes;
 * a failure that never unlocked it would deadlock the queue.
 */
export function HeroBackgroundVideo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  const { allowed, releaseSlot } = useVideoLoadSlot(
    HERO_VIDEO_SRC,
    Boolean(src),
    VIDEO_LOAD_PRIORITY.hero,
    rootRef,
  );
  const canLoad = Boolean(src) && allowed;

  /*
   * `src` lands one frame after mount, so the first paint — logo, nav, the
   * black stage and its copy — is not competing with the download. The document
   * head preloads the same URL, so the bytes are already in flight.
   */
  useEffect(() => {
    const id = requestAnimationFrame(() => setSrc(HERO_VIDEO_SRC));
    return () => cancelAnimationFrame(id);
  }, []);

  const { playing } = useDriveVideoPlayback(
    videoRef,
    canLoad,
    () => {
      releaseSlot();
      unlockVideosAfterHero();
    },
    src ?? "",
  );

  return (
    <div ref={rootRef} className="hero__video-wrap">
      {canLoad ? (
        <ProtectedVideo
          ref={videoRef}
          className={`hero__video${playing ? " is-playing" : ""}`}
          src={src ?? undefined}
          preload="auto"
          autoPlay={false}
          // @ts-expect-error — fetchPriority on HTMLVideoElement (Chromium+)
          fetchPriority="high"
        />
      ) : null}
    </div>
  );
}
