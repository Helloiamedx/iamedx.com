"use client";

import { useEffect, useRef } from "react";
import { footerMarqueeVideos } from "@/content/nav";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { useVideoRevealGate } from "@/lib/videoLoadMemory";
import { asset } from "@/lib/assets";

/**
 * Footer underlay video — always fit the exact HELLOIAMEDX box
 * (--footer-wordmark-x/w/h), object-fit cover, object-position top.
 * Wave cover until settle, then play / reveal.
 */
export function FooterVideoMarquee() {
  const clip = footerMarqueeVideos[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = asset(clip.src);
  const { progress, ready } = useVideoLoadProgress(videoRef, src);
  const { revealed, instant, onCoverDone } = useVideoRevealGate(src);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {});
  }, [ready]);

  return (
    <div
      className={`footer-video-fill${revealed ? " is-ready" : ""}${instant ? " is-instant" : ""}`}
      aria-hidden="true"
    >
      <ProtectedVideo
        ref={videoRef}
        className="footer-video-fill__media"
        src={src}
        preload="auto"
        autoPlay={false}
        aria-label={clip.label}
        style={{ objectFit: "cover", objectPosition: "top center" }}
      />
      <VideoLoadingCover
        progress={progress}
        ready={ready}
        cacheKey={src}
        onDone={onCoverDone}
      />
    </div>
  );
}
