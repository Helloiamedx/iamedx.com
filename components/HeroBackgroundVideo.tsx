"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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

function isSiteIntroActive() {
  return document.documentElement.classList.contains("edx-loading");
}

/**
 * Home hero video.
 * Under the homepage intro veil: bypass the load queue so hero bytes start immediately.
 * SiteIntroLoader is the only load animation — no per-video mark cover.
 * Once the <video> attaches, keep it mounted through intro unveil so playback
 * does not restart from ~0 when `edx-loading` drops.
 */
export function HeroBackgroundVideo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const holdAttachRef = useRef(false);
  const [src, setSrc] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [underIntro, setUnderIntro] = useState(false);

  /*
   * Boot script / SiteIntroLoader may flip `edx-loading` after our first paint.
   * Keep underIntro in sync so we always bypass the queue under the veil.
   */
  useLayoutEffect(() => {
    const sync = () => setUnderIntro(isSiteIntroActive());
    sync();
    const root = document.documentElement;
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  /* Under intro: bypass queue (intro gate needs hero bytes). Else: top of page. */
  const { allowed, releaseSlot } = useVideoLoadSlot(
    HERO_VIDEO_SRC,
    Boolean(src) && !underIntro,
    VIDEO_LOAD_PRIORITY.hero,
    rootRef,
  );
  /*
   * Do NOT drop canLoad when intro ends before the queue re-grants `allowed` —
   * that unmounted <video> and restarted from the start (~1s jump).
   */
  if (underIntro || allowed) holdAttachRef.current = true;
  const canLoad = Boolean(src) && (underIntro || allowed || holdAttachRef.current);

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
    if (underIntro || !revealed) return;
    const reduceMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const delay = reduceMotion ? 0 : COPY_AFTER_READY_MS;
    const copyTimer = window.setTimeout(() => {
      setHeroFlag(HERO_COPY_ATTR);
    }, delay);
    return () => window.clearTimeout(copyTimer);
  }, [underIntro, revealed]);

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
