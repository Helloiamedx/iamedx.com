"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { useVideoLoadProgress } from "@/components/VideoLoadingCover";
import { HERO_VIDEO_SRC } from "@/lib/heroMedia";
import {
  HERO_CHROME_ATTR,
  HERO_COPY_ATTR,
  HERO_VIDEO_ATTR,
  setHeroFlag,
  whenHeroFlag,
} from "@/lib/heroSequence";

/**
 * Home hero video.
 * Copy unlocks immediately (no wait for buffer). No loading pill —
 * first frame paints when ready; play waits for buffer + chrome.
 */
export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasFrame, setHasFrame] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const { ready: playable } = useVideoLoadProgress(videoRef, HERO_VIDEO_SRC);

  /* Fresh visit — don't inherit video/copy flags from a prior route */
  useEffect(() => {
    const root = document.documentElement;
    delete root.dataset[HERO_VIDEO_ATTR];
    delete root.dataset[HERO_COPY_ATTR];
    /* Headline/CTAs first — don't hold them behind the video buffer */
    setHeroFlag(HERO_COPY_ATTR);
    return () => {
      delete root.dataset[HERO_VIDEO_ATTR];
      delete root.dataset[HERO_COPY_ATTR];
    };
  }, []);

  /* First decoded frame → show still (not black) */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const markFrame = () => {
      if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        setHasFrame(true);
      }
    };

    el.addEventListener("loadeddata", markFrame);
    el.addEventListener("loadedmetadata", markFrame);
    markFrame();

    return () => {
      el.removeEventListener("loadeddata", markFrame);
      el.removeEventListener("loadedmetadata", markFrame);
    };
  }, []);

  /* Reveal / play once playable + chrome is up */
  useEffect(() => {
    if (!playable || revealed) return;
    let cancelled = false;

    void (async () => {
      await whenHeroFlag(HERO_CHROME_ATTR);
      if (cancelled) return;

      const el = videoRef.current;
      if (!el) return;

      setHasFrame(true);
      setRevealed(true);
      setHeroFlag(HERO_VIDEO_ATTR);
      void el.play().catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [playable, revealed]);

  return (
    <div className="hero__video-wrap">
      <ProtectedVideo
        ref={videoRef}
        className={`hero__video${hasFrame ? " is-framed" : ""}${revealed ? " is-loaded" : ""}`}
        src={HERO_VIDEO_SRC}
        preload="auto"
        autoPlay={false}
        // @ts-expect-error — fetchPriority on HTMLVideoElement (Chromium+)
        fetchPriority="high"
      />
    </div>
  );
}
