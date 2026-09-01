"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { HeroVideoLoadingMark } from "@/components/HeroVideoLoadingMark";
import { useVideoLoadProgress } from "@/components/VideoLoadingCover";
import { HERO_VIDEO_SRC } from "@/lib/heroMedia";
import {
  HERO_CHROME_ATTR,
  HERO_COPY_ATTR,
  HERO_VIDEO_ATTR,
  setHeroFlag,
  whenHeroFlag,
} from "@/lib/heroSequence";

/** Beat after video pops in — then headline may appear */
const COPY_AFTER_READY_MS = 420;

/**
 * Home hero video.
 * Sequence: icon fill (bottom→top) → video playable + chrome → video in → copy.
 */
export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const { progress, ready: playable } = useVideoLoadProgress(
    videoRef,
    src ?? "",
  );

  /* One frame later so the 0% cover paints before the element mounts */
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

  /* Reveal / play once playable + chrome is up */
  useEffect(() => {
    if (!playable || !src || revealed) return;
    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      await whenHeroFlag(HERO_CHROME_ATTR, { signal: ac.signal });
      if (cancelled || ac.signal.aborted) return;

      const el = videoRef.current;
      if (!el) return;

      setRevealed(true);
      setHeroFlag(HERO_VIDEO_ATTR);
      void el.play().catch(() => {});
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [playable, src, revealed]);

  /*
   * Copy gate is a separate effect — must NOT share cleanup with the reveal
   * effect, or setRevealed(true) cancels the copy timer before it fires.
   */
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
    return (
      <div className="hero__video-wrap">
        <HeroVideoLoadingMark progress={0} ready={false} />
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
        // @ts-expect-error — fetchPriority on HTMLVideoElement (Chromium+)
        fetchPriority="high"
      />
      <HeroVideoLoadingMark progress={progress} ready={revealed} />
    </div>
  );
}
