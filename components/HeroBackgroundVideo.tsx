"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { useDriveVideoPlayback } from "@/lib/videoPlayback";
import { HERO_VIDEO_SRC } from "@/lib/heroMedia";
import {
  HERO_COPY_ATTR,
  HERO_VIDEO_ATTR,
  HERO_VIDEO_PLAYABLE_ATTR,
  setHeroFlag,
} from "@/lib/heroSequence";
import {
  VIDEO_LOAD_PRIORITY,
  unlockVideosAfterHero,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";

/** Beat after video pops in — then headline may appear */
const COPY_AFTER_READY_MS = 420;

/**
 * Home hero video.
 * Hero-first via the load queue — no fullscreen intro veil.
 */
export function HeroBackgroundVideo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const { allowed, releaseSlot } = useVideoLoadSlot(
    HERO_VIDEO_SRC,
    Boolean(src),
    VIDEO_LOAD_PRIORITY.hero,
    rootRef,
  );
  const canLoad = Boolean(src) && allowed;

  useEffect(() => {
    let cancelled = false;
    const id = requestAnimationFrame(() => {
      if (!cancelled) setSrc(HERO_VIDEO_SRC);
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    delete root.dataset[HERO_VIDEO_PLAYABLE_ATTR];
    delete root.dataset[HERO_VIDEO_ATTR];
    delete root.dataset[HERO_COPY_ATTR];
    return () => {
      delete root.dataset[HERO_VIDEO_PLAYABLE_ATTR];
      delete root.dataset[HERO_VIDEO_ATTR];
      delete root.dataset[HERO_COPY_ATTR];
    };
  }, []);

  useDriveVideoPlayback(
    videoRef,
    canLoad,
    () => {
      unlockVideosAfterHero();
      releaseSlot();
      setHeroFlag(HERO_VIDEO_PLAYABLE_ATTR);
      setRevealed(true);
      setHeroFlag(HERO_VIDEO_ATTR);
    },
    src ?? "",
  );

  useEffect(() => {
    if (!revealed) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : COPY_AFTER_READY_MS;
    const copyTimer = window.setTimeout(() => {
      setHeroFlag(HERO_COPY_ATTR);
    }, delay);
    return () => window.clearTimeout(copyTimer);
  }, [revealed]);

  if (!src) {
    return <div ref={rootRef} className="hero__video-wrap" />;
  }

  return (
    <div ref={rootRef} className="hero__video-wrap">
      {canLoad ? (
        <ProtectedVideo
          ref={videoRef}
          className={`hero__video${revealed ? " is-loaded" : ""}`}
          src={src}
          preload="auto"
          autoPlay={false}
          // @ts-expect-error — fetchPriority on HTMLVideoElement (Chromium+)
          fetchPriority="high"
        />
      ) : null}
    </div>
  );
}
