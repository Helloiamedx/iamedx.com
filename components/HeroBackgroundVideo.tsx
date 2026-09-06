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
import {
  VIDEO_LOAD_PRIORITY,
  unlockVideosAfterHero,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";

/** Beat after video pops in — then headline may appear */
const COPY_AFTER_READY_MS = 420;

function isSiteIntroActive() {
  return document.documentElement.classList.contains("edx-loading");
}

/**
 * Home hero video.
 * First visit: site intro covers the wait — video buffers under the veil.
 * Return visit: stroke cover; takes load-queue priority so it isn’t blocked.
 */
export function HeroBackgroundVideo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [coverReady, setCoverReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [underIntro] = useState(() =>
    typeof document !== "undefined" ? isSiteIntroActive() : false,
  );
  /* Under intro: bypass queue (intro gate needs hero bytes). Else: top of page. */
  const { allowed, releaseSlot } = useVideoLoadSlot(
    HERO_VIDEO_SRC,
    Boolean(src) && !underIntro,
    VIDEO_LOAD_PRIORITY.hero,
    rootRef,
  );
  const canLoad = Boolean(src) && (underIntro || allowed);
  const { progress, ready: playable } = useVideoLoadProgress(
    videoRef,
    canLoad && src ? src : "",
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

  useEffect(() => {
    if (!playable || !src) return;
    setHeroFlag(HERO_VIDEO_PLAYABLE_ATTR);
    unlockVideosAfterHero();
  }, [playable, src]);

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
    releaseSlot();
    setRevealed(true);
    setHeroFlag(HERO_VIDEO_ATTR);
  };

  useEffect(() => {
    if (canLoad && coverReady) releaseSlot();
  }, [canLoad, coverReady, releaseSlot]);

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
      {underIntro || revealed ? null : canLoad ? (
        <VideoLoadingCover
          active
          progress={progress}
          ready={coverReady}
          cacheKey={src}
          onDone={handleCoverDone}
        />
      ) : null}
    </div>
  );
}
