"use client";

import { footerMarqueeVideos } from "@/content/nav";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

/**
 * Footer underlay video — always fit the exact HELLOIAMEDX box
 * (--footer-wordmark-x/w/h), object-fit cover, object-position top.
 * Swap `footerMarqueeVideos[0].src` when replacing the clip; keep this framing.
 */
export function FooterVideoMarquee() {
  const clip = footerMarqueeVideos[0];

  return (
    <div className="footer-video-fill" aria-hidden="true">
      <ProtectedVideo
        className="footer-video-fill__media"
        src={asset(clip.src)}
        preload="auto"
        aria-label={clip.label}
        style={{ objectFit: "cover", objectPosition: "top center" }}
      />
    </div>
  );
}
