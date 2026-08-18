"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { asset } from "@/lib/assets";
import {
  HERO_CHROME_ATTR,
  HERO_COPY_ATTR,
  HERO_VIDEO_ATTR,
  setHeroFlag,
  whenHeroFlag,
} from "@/lib/heroSequence";

const HERO_VIDEO_SRC = asset("videos/home-hero-video.mp4");
/** Beat after video is playable — then headline may fold in */
const COPY_AFTER_READY_MS = 420;

/**
 * Home hero video.
 * Sequence: chrome (menu + logos) → progress → video playable → copy (brief delay).
 */
export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { progress, ready: playable } = useVideoLoadProgress(
    videoRef,
    src ?? "",
  );

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

  /* Fresh visit — don't inherit video/copy flags from a prior route */
  useEffect(() => {
    const root = document.documentElement;
    delete root.dataset[HERO_VIDEO_ATTR];
    delete root.dataset[HERO_COPY_ATTR];
    return () => {
      delete root.dataset[HERO_VIDEO_ATTR];
      delete root.dataset[HERO_COPY_ATTR];
    };
  }, []);

  /* Reveal video once playable + chrome is up */
  useEffect(() => {
    if (!playable || !src || revealed) return;
    let cancelled = false;

    void (async () => {
      await whenHeroFlag(HERO_CHROME_ATTR);
      if (cancelled) return;

      const el = videoRef.current;
      if (!el) return;

      setRevealed(true);
      setHeroFlag(HERO_VIDEO_ATTR);
      void el.play().catch(() => {});
    })();

    return () => {
      cancelled = true;
    };
  }, [playable, src, revealed]);

  /*
   * Copy gate is a separate effect — must NOT share cleanup with the reveal
   * effect, or setRevealed(true) cancels the copy timer before it fires.
   */
  useEffect(() => {
    if (!revealed) return;
    const copyTimer = window.setTimeout(() => {
      setHeroFlag(HERO_COPY_ATTR);
    }, COPY_AFTER_READY_MS);
    return () => window.clearTimeout(copyTimer);
  }, [revealed]);

  if (!src) {
    return (
      <div className="hero__video-wrap">
        <VideoLoadingCover progress={0} ready={false} />
      </div>
    );
  }

  return (
    <div className="hero__video-wrap">
      <ProtectedVideo
        ref={videoRef}
        className={`hero__video${revealed ? " is-loaded" : ""}`}
        src={src}
        preload="auto"
        autoPlay={false}
      />
      <VideoLoadingCover progress={progress} ready={revealed} />
    </div>
  );
}
