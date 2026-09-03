"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import {
  VideoLoadingCover,
  useVideoLoadProgress,
} from "@/components/VideoLoadingCover";
import { cn } from "@/lib/utils";

type CoverLoopVideoProps = {
  src: string;
  /** Class on the <video> element (object-fit etc.) */
  className?: string;
  ariaLabel?: string;
};

/**
 * Index / Related card cover loop — dim↔bright mark until settle, then mute autoplay.
 * Starts the network load when near the viewport (keeps mobile tappable).
 */
export function CoverLoopVideo({
  src,
  className,
  ariaLabel,
}: CoverLoopVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const loadKey = active ? src : "";
  const { progress, ready } = useVideoLoadProgress(videoRef, loadKey);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const activate = () => setActive(true);

    if (typeof IntersectionObserver === "undefined") {
      activate();
      return;
    }

    /* Already on screen (common for featured lead) — don't wait for IO */
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
  }, []);

  useEffect(() => {
    setRevealed(false);
  }, [src]);

  useLayoutEffect(() => {
    const el = videoRef.current;
    if (!el || !ready) return;
    void el.play().catch(() => {});
  }, [ready, loadKey]);

  return (
    <div
      ref={rootRef}
      className={cn("cover-loop-video", revealed && "is-ready")}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {active ? (
        <ProtectedVideo
          ref={videoRef}
          className={cn("cover-loop-video__media", className)}
          src={src}
          preload="auto"
          autoPlay={false}
          aria-label={ariaLabel}
        />
      ) : null}
      <VideoLoadingCover
        progress={active ? progress : 0}
        ready={Boolean(active && ready)}
        onDone={() => setRevealed(true)}
      />
    </div>
  );
}
