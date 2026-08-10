"use client";

import { useEffect, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

const HERO_VIDEO_SRC = asset("videos/home-hero-video.mp4");

/**
 * Hero background video.
 * Mount only once src is set — an empty <video src> makes some browsers
 * request the page URL and spin the tab loader forever.
 * One frame delay lets the headline commit before the MP4 joins the wire.
 */
export function HeroBackgroundVideo() {
  const [src, setSrc] = useState<string | null>(null);

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

  if (!src) return null;

  return (
    <ProtectedVideo
      className="hero__video"
      src={src}
      preload="metadata"
    />
  );
}
