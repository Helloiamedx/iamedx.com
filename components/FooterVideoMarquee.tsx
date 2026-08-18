"use client";

import { useEffect, useRef, useState } from "react";
import { footerMarqueeVideos } from "@/content/nav";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { asset } from "@/lib/assets";

/**
 * Footer underlay video — always fit the exact HELLOIAMEDX box
 * (--footer-wordmark-x/w/h), object-fit cover, object-position top.
 * Progress bar until buffer hits 100%, then play.
 */
export function FooterVideoMarquee() {
  const clip = footerMarqueeVideos[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = asset(clip.src);
  const { progress, ready } = useVideoLoadProgress(videoRef, src);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {});
  }, [ready]);

  return (
    <div
      className={`footer-video-fill${ready ? " is-ready" : ""}`}
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
      <VideoLoadingCover progress={progress} ready={ready} />
    </div>
  );
}
