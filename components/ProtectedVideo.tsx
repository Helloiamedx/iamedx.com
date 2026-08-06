"use client";

import type { ComponentPropsWithoutRef } from "react";

type ProtectedVideoProps = Omit<
  ComponentPropsWithoutRef<"video">,
  "controls" | "onContextMenu"
>;

/**
 * Autoplay-friendly video with soft download lock:
 * no right-click save, no download control, no PiP / remote playback.
 */
export function ProtectedVideo({
  autoPlay = true,
  muted = true,
  loop = true,
  playsInline = true,
  ...props
}: ProtectedVideoProps) {
  return (
    <video
      {...props}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      controlsList="nodownload noplaybackrate"
      disablePictureInPicture
      disableRemotePlayback
      onContextMenu={(event) => event.preventDefault()}
      draggable={false}
    />
  );
}
