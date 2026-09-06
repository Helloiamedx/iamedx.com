"use client";

import { useEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { HERO_VIDEO_SRC } from "@/lib/heroMedia";
import {
  HERO_CHROME_ATTR,
  HERO_COPY_ATTR,
  HERO_VIDEO_ATTR,
  HERO_VIDEO_PLAYABLE_ATTR,
  setHeroFlag,
  whenHeroFlag,
} from "@/lib/heroSequence";

/** Beat after video pops in — then headline may appear */
const COPY_AFTER_READY_MS = 420;

function isSiteIntroActive() {
  return document.documentElement.classList.contains("edx-loading");
}

/**
 * Home hero video.
 * First visit: site intro covers the wait — video buffers under the veil,
 * then reveals with the intro (no second mark loader).
 * Return visit: stroke mark cover as elsewhere.
 */
export function HeroBackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [coverReady, setCoverReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  /** First paint under site intro — skip VideoLoadingCover entirely */
  const [underIntro] = useState(() =>
    typeof document !== "undefined" ? isSiteIntroActive() : false,
  );
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

  /* Gate site intro on buffer */
  useEffect(() => {
    if (!playable || !src) return;
    setHeroFlag(HERO_VIDEO_PLAYABLE_ATTR);
  }, [playable, src]);

  /*
   * Under intro: start playback as soon as buffered (still under black veil).
   * Copy waits until the veil is gone.
   */
  useEffect(() => {
    if (!underIntro || !playable || !src || revealed) return;
    const el = videoRef.current;
    if (el) void el.play().catch(() => {});
    setRevealed(true);
    setHeroFlag(HERO_VIDEO_ATTR);
  }, [underIntro, playable, src, revealed]);

  useEffect(() => {
    if (!underIntro || !revealed) return;

    const releaseCopy = () => {
      if (isSiteIntroActive()) return false;
      const reduceMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const delay = reduceMotion ? 0 : COPY_AFTER_READY_MS;
      window.setTimeout(() => setHeroFlag(HERO_COPY_ATTR), delay);
      return true;
    };

    if (releaseCopy()) return;

    const root = document.documentElement;
    const obs = new MutationObserver(() => {
      if (releaseCopy()) obs.disconnect();
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [underIntro, revealed]);

  /* Return visit (no intro): stroke cover after playable + chrome */
  useEffect(() => {
    if (underIntro || !playable || !src || coverReady) return;
    const ac = new AbortController();
    let cancelled = false;

    void (async () => {
      await whenHeroFlag(HERO_CHROME_ATTR, { signal: ac.signal });
      if (cancelled || ac.signal.aborted) return;
      setCoverReady(true);
      const el = videoRef.current;
      if (el) void el.play().catch(() => {});
    })();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [underIntro, playable, src, coverReady]);

  useEffect(() => {
    if (underIntro || !revealed) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : COPY_AFTER_READY_MS;
    const copyTimer = window.setTimeout(() => {
      setHeroFlag(HERO_COPY_ATTR);
    }, delay);
    return () => window.clearTimeout(copyTimer);
  }, [underIntro, revealed]);

  const handleCoverDone = () => {
    setRevealed(true);
    setHeroFlag(HERO_VIDEO_ATTR);
  };

  if (!src) {
    return (
      <div className="hero__video-wrap">
      {underIntro ? null : (
          <VideoLoadingCover
            progress={0}
            ready={false}
            cacheKey={HERO_VIDEO_SRC}
          />
        )}
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
      {underIntro ? null : (
        <VideoLoadingCover
          progress={progress}
          ready={coverReady}
          cacheKey={src}
          onDone={handleCoverDone}
        />
      )}
    </div>
  );
}
