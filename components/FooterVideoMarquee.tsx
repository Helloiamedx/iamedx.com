"use client";

import { useEffect, useRef, useState } from "react";
import { footerMarqueeVideos } from "@/content/nav";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

/**
 * Footer underlay video — always fit the exact HELLOIAMEDX box
 * (--footer-wordmark-x/w/h), object-fit cover, object-position top.
 * Swap `footerMarqueeVideos[0].src` when replacing the clip; keep this framing.
 *
 * Until the first frame is ready, the fill box stays black so Safari doesn’t
 * flash a white hairline above the HELLOIAMEDX knockout (white placeholder
 * used to peek through sub-pixel SVG mask edges).
 */
export function FooterVideoMarquee() {
  const clip = footerMarqueeVideos[0];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  const markReady = () => setReady(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      setReady(true);
    }
  }, []);

  return (
    <div
      className={`footer-video-fill${ready ? " is-ready" : ""}`}
      aria-hidden="true"
    >
      <ProtectedVideo
        ref={videoRef}
        className="footer-video-fill__media"
        src={asset(clip.src)}
        preload="auto"
        aria-label={clip.label}
        style={{ objectFit: "cover", objectPosition: "top center" }}
        onLoadedData={markReady}
        onCanPlay={markReady}
      />
    </div>
  );
}
