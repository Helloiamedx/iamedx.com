"use client";

import { useEffect, useRef, useState } from "react";
import { footerMarqueeVideos } from "@/content/nav";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { markHomeMediaReady } from "@/lib/homeMediaGate";
import { useVideoRevealGate } from "@/lib/videoLoadMemory";
import {
  VIDEO_LOAD_PRIORITY,
  useVideoLoadSlot,
} from "@/lib/videoLoadQueue";
import { asset } from "@/lib/assets";

function isHomeIntroLoading() {
  return document.documentElement.classList.contains("edx-loading");
}

/**
 * Footer underlay — last in the top→bottom queue.
 * No black wait plate; mark only while this clip’s turn is active.
 */
export function FooterVideoMarquee() {
  const clip = footerMarqueeVideos[0];
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = asset(clip.src);
  const [underIntro] = useState(() =>
    typeof document !== "undefined" ? isHomeIntroLoading() : false,
  );
  const { allowed, releaseSlot } = useVideoLoadSlot(
    src,
    true,
    VIDEO_LOAD_PRIORITY.footer,
    rootRef,
  );
  const loadKey = allowed ? src : "";
  const { progress, ready } = useVideoLoadProgress(videoRef, loadKey);
  const { revealed, onCoverDone } = useVideoRevealGate(src);

  useEffect(() => {
    if (allowed && ready) releaseSlot();
  }, [allowed, ready, releaseSlot]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {});
  }, [ready]);

  useEffect(() => {
    if (!underIntro || !ready) return;
    releaseSlot();
    onCoverDone();
    markHomeMediaReady(src);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when playable under intro
  }, [underIntro, ready, src]);

  const handleDone = () => {
    releaseSlot();
    onCoverDone();
    markHomeMediaReady(src);
  };

  return (
    <div
      ref={rootRef}
      className={`footer-video-fill${revealed ? " is-ready" : ""}`}
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
      {underIntro || revealed ? null : allowed ? (
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
