"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { useVideoRevealGate } from "@/lib/videoLoadMemory";
import {
  VIDEO_LOAD_PRIORITY,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";
import { cn } from "@/lib/utils";

type CoverLoopVideoProps = {
  src: string;
  /** Class on the <video> element (object-fit etc.) */
  className?: string;
  ariaLabel?: string;
};

function isHomeIntroLoading() {
  return document.documentElement.classList.contains("edx-loading");
}

/**
 * Index / Related card cover loop.
 * Loads one-at-a-time after the hero (serial queue, top→bottom).
 * When playable: play immediately. Mark loader only if still on-screen and
 * not yet revealed; off-screen clips unveil + play without waiting for scroll.
 */
export function CoverLoopVideo({
  src,
  className,
  ariaLabel,
}: CoverLoopVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [underIntro] = useState(() =>
    typeof document !== "undefined" ? isHomeIntroLoading() : false,
  );
  const [nearView, setNearView] = useState(underIntro);
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    VIDEO_LOAD_PRIORITY.coverCard,
    rootRef,
  );
  const loadKey = allowed ? src : "";
  const { progress, ready } = useVideoLoadProgress(videoRef, loadKey);
  const { revealed, onCoverDone } = useVideoRevealGate(src);
  const showMark = Boolean(allowed && nearView && !revealed && !underIntro);

  useEffect(() => {
    if (underIntro) {
      setNearView(true);
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    const activate = () => setNearView(true);

    if (typeof IntersectionObserver === "undefined") {
      activate();
      return;
    }

    const rect = root.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight + 240) {
      activate();
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          activate();
          io.disconnect();
        }
      },
      { rootMargin: "240px 0px", threshold: 0 },
    );
    io.observe(root);
    return () => io.disconnect();
  }, [underIntro]);

  useEffect(() => {
    if (allowed && ready) releaseSlot();
  }, [allowed, ready, releaseSlot]);

  /* Always play when ready — do not wait for scroll */
  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {});
  }, [ready, loadKey]);

  /*
   * Unveil as soon as playable unless an on-screen mark is finishing the fill.
   * Off-screen / intro: no scroll gate.
   */
  useEffect(() => {
    if (!allowed || !ready || revealed) return;
    if (nearView && !underIntro) return;
    onCoverDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, ready, revealed, nearView, underIntro, src]);

  /* Under fullscreen intro — no second mark loader; unveil when playable */
  useEffect(() => {
    if (!underIntro || !ready) return;
    releaseSlot();
    onCoverDone();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when playable under intro
  }, [underIntro, ready, src]);

  const handleDone = () => {
    releaseSlot();
    onCoverDone();
  };

  return (
    <div
      ref={rootRef}
      className={cn("cover-loop-video", revealed && "is-ready")}
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
      {showMark ? (
        <VideoLoadingCover
          active
          progress={progress}
          ready={ready}
          cacheKey={src}
          onDone={handleDone}
        />
      ) : null}
    </div>
  );
}
